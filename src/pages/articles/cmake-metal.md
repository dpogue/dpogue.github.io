---
layout: article
title: Teaching CMake to Compile Apple Metal Shaders
date: 2024-06-03
description: How I added Metal shader compiling support to a cross-platform C++ workflow.
---
<small>Posted on <time pubdate datetime="2024-06-03">June 3<sup>rd</sup>, 2024</time></small>

> TL;DR: I wrote some CMake helpers to support compiling Metal shaders as part of CMake projects.  
> See https://github.com/dpogue/CMake-MetalShaderSupport for details.

As part of [Colin Cornaby](https://www.colincornaby.me/)'s work on porting Uru to macOS using the Metal API and Apple's [metal-cpp](https://developer.apple.com/metal/cpp/) wrapper, we've found ourselves in a situation where we need to compile a Metal shader library and embed it as a resource in our macOS application bundle. Doing this within Xcode is fairly straightforward: you add a new Metal Shader Library target to your project, stick your shader source files in there, and add it to the embed resources step of your application target.

However, for Uru's [Plasma engine project](https://h-uru.github.io/Plasma/), we use CMake to provide a cross-platform build system that allows us to build with Visual Studio, Xcode, Ninja, or <abbr>UNIX</abbr> Makefiles. While Colin had initially figured out a way to make the Metal build process work with the Xcode generator, I was hoping we'd be able to support Ninja and Makefiles on macOS as well.

The trick for supporting Metal in the Xcode generator was essentially to set a bunch of Xcode-specific attributes on a CMake library target, and then Xcode would automatically handle invoking the Metal compiler and passing all the necessary flags:

```
set_target_properties(MyShaders PROPERTIES
    # Tell Xcode that this is a Metal Shader Library
    XCODE_PRODUCT_TYPE com.apple.product-type.metal-library

    # Turn on fast math (-ffast-math)
    # Xcode sets this on Metal Shader Library targets created through the IDE
    XCODE_ATTRIBUTE_MTL_FAST_MATH "YES"

    # Include source code symbols for debugging in Debug/RelWithDebInfo builds
    XCODE_ATTRIBUTE_MTL_ENABLE_DEBUG_INFO[variant=Debug] "INCLUDE_SOURCE"
    XCODE_ATTRIBUTE_MTL_ENABLE_DEBUG_INFO[variant=RelWithDebInfo] "INCLUDE_SOURCE"
)

# Tell Xcode to treat the source files as Metal language files
set_source_files_properties(${MyShader_SOURCES}
    TARGET_DIRECTORY MyShaders
    PROPERTIES
    LANGUAGE METAL
)
```

This works fine with the CMake Xcode generator but fails with other generators because they don't know how to handle source files with the language set to Metal. So to fix this properly, we'll need to teach CMake how to compile Metal shader files outside of Xcode.


Metal Compiler Tools
--------------------

It's worth noting that Apple does in fact provide command-line tools for compiling Metal shaders, even going as far as to offer an official toolset download bundle for Windows. The Metal compiler tools are based off of LLVM and Clang, [outputting LLVM bitcode](https://medium.com/@samuliak/breaking-down-metals-intermediate-representation-format-41827022489c) that gets optimized into a [target-specific compiled shader](https://worthdoingbadly.com/metalbitcode/).

All of [Apple's documentation examples](https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Dev-Technique/Dev-Technique.html) for using the command-line tools show a multi-step process like this:

```
xcrun -sdk macosx metal MyLibrary.metal -o MyLibrary.air
xcrun -sdk macosx metal-ar MyLibrary.air -o MyLibrary.metalar
xcrun -sdk macosx metallib MyLibrary.metalar -o MyLibrary.metallib
```

My initial plan was to use CMake's helpers to find all of those tools, and then use a series of custom target commands to compile each shader. But it definitely would be easier if CMake could understand and use the first tools for Metal files in the first place. Is it possible to teach CMake to understand Metal as a language option?


Enabling Languages in CMake
---------------------------

CMake defaults to supporting C and C++ by default, but has built-in support for other languages with Objective-C, Objective-C++, <abbr>CUDA</abbr>, <abbr>ISPC</abbr>, Fortran, and Swift. There's some partial support for C# and Java, but only in specific contexts and with several caveats. CMake provides an `enable_language(LANG)` function to opt-in to specific languages in a project. The way CMake works is that `enable_language(LANG)` will try to load some module files to detect the compiler and flag values for that language, and test compiling a program to ensure that the compiler works. In theory, if we provide our own set of CMake module files for Metal, it will load them and run them to detect Metal language support.

Shoutout at this point to [Petr Penzin](https://github.com/ppenzin), who appears to be [the only other person in the world](https://cmake.org/pipermail/cmake/2018-November/068662.html) to have been feeling adventurous enough to actually try adding new custom language support to CMake. 😅

We need, at minimum, to provide 3 CMake module files with specific names, and 1 file to cache the results:
* `CMakeDetermineMetalCompiler.cmake`
* `CMakeMetalInformation.cmake`
* `CMakeTestMetalCompiler.cmake`<br>and
* `CMakeMetalCompiler.cmake.in`

The first file is responsible for locating the compiler and trying to identify it. This also handles cases like the compiler being manually specified (with the `-DCMAKE_Metal_COMPILER` option) or provided via a `METALC` environment variable. In cases like C and C++ identifying the compiler is a complex process due to the sheer number of different compilers available, but for Metal it's safe to assume we're only dealing with Apple's compiler.

The second file is where language configuration flags and build steps are declared. This needs to tell CMake how to invoke the compiler and which options to pass to it.

The third file will attempt to invoke the compiler with a test file and ensure that there are no errors.

Lastly, the results of finding the compiler are cached in the CMakeFiles directory of the project. This ensures that if you've pointed to a specific compiler path when configuring the CMake project build, it will keep using the one that you provided for all subsequent builds of that project.

Knowing that both the Metal compiler and the Swift compiler are based on LLVM and Clang, I put together the minimum viable CMake compiler support for Metal based mostly on copy/pasting code from CMake's internal Swift support. One of the challenges was identifying the 3 different compiler tools used though, and trying to get CMake to invoke them all at the right times.


Documention's Theory vs Xcode's Reality
---------------------------------------

Based on the documentation examples from Apple, it seems like Metal sources should be able to support some of the common CMake library types. `OBJECT` libraries would just invoke `metal` compiler to output `.air` bitcode files, `STATIC` libraries would generate `.metalar` archives using the `metal-ar` tool, and those could be combined into `SHARED` or `MODULE` libraries which would use `metallib` to create the final `.metallib` file. I had all of that hooked up and mostly working in CMake.

Except Xcode doesn't actually support doing any of that! I could make `OBJECT` and `STATIC` libraries work with Makefiles on the command-line, but I couldn't get Xcode to do the right thing. The only way Xcode knows how to deal with Metal shaders is as their own library target (or as sources in an application target that get compiled to a `default.metallib` file), it doesn't provide a built-in way to generate `.air` or `.metalar` files and link them as part of another target.

Looking at the commands that Xcode itself runs for compiling Metal shaders revealed another discrepancy from Apple's command-line documentation: Xcode doesn't invoke separate `metal` and `metallib` commands to compile and link, it just uses `metal` as an LLVM frontend to do both steps. Considering this had been one of the sketchier parts of the CMake detection involving multiple tools, I opted to simplify and only support the use case that worked out of the box with the Xcode generator.

So the end result uses only the `metal` compiler tool to do both compiling and linking, and is intended to be used with `MODULE` libraries that output complete `.metallib` files.


Embedding Shaders in a Bundle
-----------------------------

For the application to actually use the Metal shaders, the `.metallib` file needs to be included in the application bundle's Resources folder.

CMake 3.29 adds an Xcode-specific target property that makes this super easy. Just provide a list of other targets, they will automatically be managed as dependencies of the application target and their output files will be embedded as resources:

```
set_target_properties(MyApp PROPERTIES
    XCODE_EMBED_RESOURCES MyShaders
)
```

For non-Xcode generators and/or older CMake version, they need to be copied manually, which involves a `add_custom_command()` function call for every shader library that needs to be included. Luckily, CMake has built-in support for copying files and some helpers that mean the commands aren't _too_ awful:

```
add_custom_command(TARGET MyApp POST_BUILD
    DEPENDS MyShaders
    COMMAND ${CMAKE_COMMAND} -E copy "$<TARGET_FILE:MyShaders>" "$<TARGET_BUNDLE_CONTENT_DIR:MyApp>/Resources/$<TARGET_FILE_NAME:MyShaders>"
    VERBATIM
)
```


Simplifying the Boilerplate
---------------------------

So while that all works, and CMake is compiling and embedding Metal shaders, it's still a lot of boilerplate to set up a shader library target that works both with Xcode and non-Xcode generators, and even worse to get it embedded in the application bundle.

Thankfully, CMake also provides the ability to declare functions and include them in other projects, so I simplified all the boilerplate by defining `add_metal_shader_library(TARGET SOURCES...)` and `target_embed_metal_shader_libraries(TARGET SHADERLIBS...)` helper functions in a `MetalShaderSupport` module. I also tried to support declaring the Metal Shader Language version on a shader target, and ensuring that works in both Xcode and the command-line.


The CMake MetalShaderSupport Repository
---------------------------------------

Having gotten this working, and noticing comments on StackOverflow from people asking how to build Metal shaders as part of a CMake project, I tried to set this up so that it can easily be included in any CMake project.

All of the CMake module files, as well as a working example are available at https://github.com/dpogue/CMake-MetalShaderSupport along with instructions for including them in your own project. This has only been tested in a very basic macOS example project, so there is probably still more work to do to fully support things like iOS projects and building with the Windows Metal Development Toolset.

That said, after grumbling about this problem for several months, I'm very happy to see a few days of hacking come together in a useful way.
