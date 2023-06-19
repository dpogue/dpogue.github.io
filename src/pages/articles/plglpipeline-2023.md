---
layout: article
title: "Uru on Linux/OpenGL: 2023 update"
date: 2023-06-18
description: A 2023 status update on plGLPipeline and Uru/Plasma on Linux
---

<div><small>Posted on <time pubdate datetime="2023-06-18">June 18<sup>th</sup>, 2023</time></small></div>

It's been a while since I wrote my [last update](/articles/plglpipeline-2016.html), and things have definitely come a long way since then. We gave [a presentation](https://www.youtube.com/watch?v=6s4LzDh1bn8) at Mysterium 2022, and Colin has written a bit about his experience [porting Uru to macOS with metal-cpp](https://www.colincornaby.me/2022/11/one-year-of-working-on-myst-online-for-mac-metal/).

Almost all of the blockers for a full cross-platform port have been resolved:

* PhysX has been updated to an open-source and cross-platform version,
* the Win32-specific networking code has been rewritten,
* Python has been updated to Python 3.10,
* numerous 64-bit issues have been addressed as part of 64-bit support for Windows,
* library management &amp; automated builds have been drastically simplified using [vcpkg](https://vcpkg.io/).

This work is in large part thanks to Adam (Hoikas), Zrax, Colin, and numerous other contributors. There was a big spike in activity in the 2020/2021 timeframe that led to a lot of long-await work being completed.

All the remaining work is around the actual rendering and integration with the platform for stuff like window management and input. There are two separate (but very very related) projects that I'm working on: the **OpenGL rendering pipeline** (which will support Linux, macOS, and Windows) and the **Linux client application**.

<figure>
  <video src="/vid/glclient-202303.mp4" style="width: calc(100% - 40px); max-width: 1080px" controls></video>
  <figcaption>Video clip showing Uru, running on Linux with OpenGL rendering, as of March 2023.<br>The game footage in the video is a bit stuttery due to the recording process, but is much smoother (although far from perfect) in actual gameplay.</figcaption>
</figure>


OpenGL Rendering Pipeline
-------------------------

There have been some small fixes to the rendering pipeline over the years, but no significant changes. The initial approach that I took as a proof-of-concept involved generating a new shader on the fly for every Plasma material, and that ends up causing all sorts of performance issues in areas with lots of stuff on the screen. The solution is to make fewer shaders with more conditionals within the shader to handle the different layer blending modes, but that's a significant change that I've been putting off for a few years now.

Realistically, I don't have a background in OpenGL or <abbr>3D</abbr> graphics, so it's a bit daunting to look at the implementation details for some of these changes, particularly when the OpenGL docs are not the most helpful.

My initial plan is to target OpenGL 3.3 and newer, which should cover most reasonably up-to-date Linux, macOS, and Windows versions. It would be really cool to have a fallback to OpenGL 2.x for older systems, but I think I might be the only person who gets excited about the prospect of running Uru on Mac OS X Leopard PowerPC. 😅

Linux Client Application
------------------------

Currently I have a branch with a barebones <abbr>X11</abbr> client, but only handling the game window. Login is handled with text-based prompts in the terminal (although I did mock up a [pure <abbr>X11</abbr> login window](https://www.youtube.com/watch?v=UM6HmORpjD4) for fun a while back). Mouse and keyboard input is also handled using <abbr>X11</abbr> events.

The <abbr>X11</abbr> client is definitely going to keep progressing, but it's probably also necessary to do Wayland-based client too. Ideally those would live in the same executable and determined at runtime by inspecting the `XDG_SESSION_TYPE` environment variable, but that involves dynamically loading all the functions we need for both <abbr>X11</abbr> and Wayland.

The login window is another thing that needs a bit of thinking. A pure <abbr>X11</abbr> window is nice as a fallback, but would feel incredibly out of place in a Wayland desktop environment. I could, in theory, do dynamic loading of <abbr>GTK</abbr> libraries but that it feels out of place on <abbr>KDE</abbr>, and I really don't want to do build-time linking to all these different UI toolkit libraries&hellip;  
This might be something best left until after the game client is fully working, when it's easier for other people to contribute.

<figure>
  <img class="img-center" src="/img/ki-chat-gl-2023.png" style="width: calc(100% - 40px); max-width: 1080px">
  <figcaption>Screenshot from the All Guilds' Meeting in Kirel running on Linux with the OpenGL renderer.</figcaption>
</figure>

Next Steps
----------

Speaking of opportunities for contributions, this is where things get messy. Right now this work is spread across 5 different branches in git, which are continuously being rebased on top of other merges to the main branch, and it's a bit of a nightmare for anyone to follow or test out the code.

There are a few dependencies in term of order of operations here, because we don't want to merge anything that isn't able to be tested:

* The first step is going to be getting some basic OpenGL pipeline support merged. There's an open pull request with the current renderer work, but there have been concerns raised about the dynamic shader stuff, so that will probably be stripped out (and the intention is to replace it anyways, since it's a source of performance issues). Merging the OpenGL renderer would allow the OpenGL pipeline to be tested on Windows with the existing Win32 client.

* Next, the initial <abbr>X11</abbr> Linux client could be merged, since it would now have a worker rendering pipeline for testing.

* Then further improvements to both the Linux client and the OpenGL pipeline could be worked on by multiple people, with much faster testing and upstream merging.

I can't give a timeline for any of these things because they depend on limited free time from both myself and other reviewers, but I would love to get this to a point where I'm not juggling rebases on 5 branches and where people can build it themselves in the near future.

The long term plan remains uncertain. Currently none of the cross-platform work from the H'uru repository has been accepted by OpenUru, and despite promises to prioritize this effort at the last Mysterium, there has been no visible progress. It remains a source of much frustration and disappointment that improvements to the MOULa game client are essentially held hostage by a single person. It's incredibly demotivating to pour a over a decade worth of time and energy into this work with no expectation of it ever being available on MOULa.
