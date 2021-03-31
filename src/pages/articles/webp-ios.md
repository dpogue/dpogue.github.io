---
layout: article
title: "cordova-plugin-webp: WebP support for iOS"
date: 2014-11-24
description: A Cordova plugin for automatic handling of WebP images in iOS web views.
canonical: https://dpogue.ca/articles/webp-ios.html
---
<div><small>Posted on <time pubdate datetime="2014-11-24">November 24<sup>th</sup>, 2014</time></small></div>

**The plugin described in this post is deprecated due to lack of compatibility with `WKWebView` webviews. iOS has built-in support for WebP in `WKWebView` starting in iOS 14.**

Google's WebP image format can produce some significant savings in image file sizes, particularly for images with transparency that previously required <abbr>PNG</abbr>.  WebP is supported natively in Google Chrome, and on Android 4.0 and higher (although 4.0 and 4.1 had some limitations).

On mobile, the smaller file sizes mean less network bandwidth and faster image loading.  Several mobile websites are already using device detection to serve WebP images to supported browsers.  For hybrid apps, using WebP for assets means the application bundle is smaller.

Unfortunately, iOS doesn't support WebP images.


Getting WebP working on iOS
---------------------------

It's relatively easy to compile the WebP library for iOS and bundle it with your application.  Carson McDonald has [a script on GitHub][WebP.framework] to compile libwebp for iOS and generate a WebP.framework file, as well as a [blog post][ioncannon] detailing how to use libwebp from Objective C.

Using Objective C, you can feed a WebP image to the decoder and then feed the decoded image data into a `UIImage`.  That works reasonably well for native apps written entirely in Objective C, but doesn't work for apps that are trying to display WebP images in a web view.

Luckily, iOS provides a way of registering <abbr>URL</abbr> interceptors.  These are most commonly used to implement custom <abbr>URL</abbr> protocols, but they can also be used to intercept requests based on a particular file extension.

Scott Talbot proved it was possible to use a <abbr>URL</abbr> interceptor to decode WebP images for web views with his [STWebPDecoder project][STWebPDecoder].  He wrote a WebP decoder based on libwebp and an interceptor that will decode WebP images before feeding them back to the web view.


Automatic WebP support for Cordova
----------------------------------

Based on Scott Talbot's <abbr>URL</abbr> interceptor and decoder and using Carson McDonald's script to build WebP.framework, I've put together a plugin for Apache Cordova that will automatically and transparently support WebP images in iOS `UIWebView`.

The plugin source code is available at https://github.com/dpogue/cordova-plugin-webp

You can add the plugin to your Cordova project using the command-line tools:  
`cordova plugin add cordova-plugin-webp`

Currently it uses libwebp 0.4.2, and has been tested and verified to work with a `UIWebView`.  It has not been tested with `WkWebView` on iOS 8.  If you find bugs, please report them [on GitHub][issues].


[ioncannon]: http://www.ioncannon.net/programming/1483/using-webp-to-reduce-native-ios-app-size/
[WebP.framework]: https://github.com/carsonmcdonald/WebP-iOS-example
[STWebPDecoder]: https://github.com/cysp/STWebPDecoder
[issues]: https://github.com/dpogue/cordova-plugin-webp/issues/
