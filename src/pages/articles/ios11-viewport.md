---
layout: article
title: Understanding the WebView Viewport in iOS 11
date: 2017-09-13
description: iOS 11 changes behaviour around how the status bar interacts with the WebView. Let's learn about viewport-fit and safe-area-inset constants.
image: /img/ios11-banner.jpg
---
<small>Posted on <time pubdate datetime="2017-09-13">September 13<sup>th</sup>, 2017</time>.<br>Updated on <time datetime="2017-10-31">October 31<sup>st</sup>, 2017</time>.</small>

iOS 11 brings some new, perhaps unintuitive, behaviour around the status bar area which will be particularly important for developers using tools like Apache Cordova or Ionic.  In particular, this change in behaviour affects any web-based apps that use fixed position header bars when they are built for iOS 11.

**Note:** Existing apps will continue working as they always have with no changes to their viewport behaviour. This only affects apps that are compiled with Xcode 9 and a target of iOS 11.

To understand the change, we need to look at the context for it.


Status Bars & Safe Areas
------------------------

On the early versions of iOS, the status bar was a constant black bar across the top of the screen that was largely untouchable.  It was a piece of system UI and your app ran in the space underneath it.

That changed with the introduction of iOS 7, which had a transparent status bar that took the colour of the app's navigation bar.  For apps showing in a webview like Cordova, this often meant detecting the iOS version and adding 20px of padding to the top of your fixed header so that it would fill the space correctly.

Newer versions of iOS introduced some minor revisions, including features where an additional banner could be shown in the status bar when on a call or when an app was using geolocation in the background.

On the native side, a lot of this was handled automatically by UINavigationBar and autolayout guides.  There were layout guides for the top and bottom of the screen that automatically adjusted to the correct height of the status bar(s), ensuring that the app content was in a "safe area" where the status bar would not obscure it.  If you had a UINavigationBar aligned to the top layout guide, iOS would also automatically extend its colour behind the status bar.  For web, there was unfortunately no equivalent.


iOS 11 Changes
--------------

<figure>
  <img class="img-center" src="/img/iphone8-viewport-auto.png" style="width: calc(100% - 40px); max-width: 480px" alt="Default viewport behaviour in iOS 11">
  <figcaption>The default viewport behaviour in iOS 11 on an iPhone 8.</figcaption>
</figure>

Where iOS 11 differs from earlier versions is that the webview content now respects the safe areas.  This means that if you have a header bar that is a fixed position element with `top: 0`, it will initially render 20px below the top of the screen: aligned to the bottom of the status bar.  As you scroll down, it will move up behind the status bar.  As you scroll up, it will again fall down below the status bar (leaving an awkward gap where content shows through in the 20px gap).

You can see just how bad it is in this video clip:

<figure>
  <video src="/vid/ios11-viewport.mp4" style="width: calc(100% - 40px); max-width: 480px" controls></video>
  <figcaption>Super janky scrolling behaviour on iOS 11 for position fixed elements.</figcaption>
</figure>


### Why on earth would Apple make this change?

If you've seen the iPhone X design, it makes sense: The iPhone X features an irregular screen shape with an inset "cut out" at the top for the phone speaker and camera.  If fixed position elements aligned to the real top of the screen, they would end up being inaccessible behind that speaker cutout.  
By aligning to the bottom of the status bar, it ensures that whatever is in the header will be accessible.

Cool... except now the app looks terrible with the awkward header moving up and down and content visibly scrolling behind the status bar.


iOS 11 Fixes
------------

Luckily, Apple gave us a way to control this behaviour via the viewport meta tag.  Even more luckily, they even backported this new viewport behaviour fix to the older, deprecated UIWebView!

The viewport option you'll be looking for is `viewport-fit`. It has three possible values:

* `contain`: The viewport should fully contain the web content. This means position fixed elements will be contained within the safe area on iOS 11.
* `cover`: The web content should fully cover the viewport. This means position fixed elements will be fixed to the viewport, even if that means they will be obscured.  This restores the behaviour we had on iOS 10.
* `auto`: The default value, in this case it behaves the same as `contain`.

So to restore your header bar to the very top of the screen, behind the status bar like it was in iOS 10, you'll want to add `viewport-fit=cover` to your viewport meta tag.


<figure>
  <img class="img-center" src="/img/iphone8-viewport-cover.png" style="width: calc(100% - 40px); max-width: 480px" alt="iOS 11 with viewport-fit=cover">
  <figcaption>Looking good with viewport-fit set to `cover` in iOS 11 on an iPhone 8.</figcaption>
</figure>


iPhone X
--------

But what about the iPhone X with its irregular shape?  The status bar is no longer 20px tall, and with the inset for the camera and speaker, your header bars contents will be entirely inaccessible to users. It's important to note that this also applies to footer bars pinned to the bottom of the screen, which will be obtructed by the microphone.

**Note:** Your app will only use the full screen space on the iPhone X if you have a launch storyboard.  Existing apps will be shown in a view box with black space at the top and bottom.

<figure>
  <img class="img-center" src="/img/iphonex-viewport-cover.png" style="width: calc(100% - 40px); max-width: 480px" alt="iPhone X with the header partially clipped behind the speaker notch">
  <figcaption>iPhone X brings some new challenges, even with viewport-fit set to `cover`</figcaption>
</figure>

Luckily, Apple added a way to expose the safe area layout guides to CSS.  They added a concept similar to CSS variables, called CSS environment variables.  Think of these like CSS variables that are set by the system and cannot be overridden.  They were [proposed to the CSS Working Group](https://github.com/w3c/csswg-drafts/issues/1693) for standardization, and accepted as the `env()` function.

> **Note:** iOS 11.0 uses an older `constant()` syntax, but iOS 11.1 and up use `env()`!
> The older `constant()` syntax is removed in iOS 11.2.

The 4 layout guide constants are:

* `env(safe-area-inset-top)`: The safe area inset amount (in CSS pixels) from the top of the viewport.
* `env(safe-area-inset-bottom)`: The safe area inset amount (in CSS pixels) from the bottom of the viewport.
* `env(safe-area-inset-left)`: The safe area inset amount (in CSS pixels) from the left of the viewport.
* `env(safe-area-inset-right)`: The safe area inset amount (in CSS pixels) from the right of the viewport.

Apple's final gift to us is that these variables have also been backported to UIWebView.


### Example with CSS constants

Let's say you have a fixed position header bar, and your CSS for iOS 10 currently looks like this:

```
header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;

    padding-top: 20px; /* Status bar height */
}
```

To make that adjust automatically for iPhone X and other iOS 11 devices, you would add a `viewport-fit=cover` option to your viewport meta tag, and change the CSS to reference the constant:

```
header {
    /* ... */

    padding-top: 20px; /* Status bar height on iOS 10 */
    padding-top: constant(safe-area-inset-top); /* Status bar height on iOS 11.0 */
    padding-top: env(safe-area-inset-top); /* Status bar height on iOS 11.1+ */
}
```

It's important to keep the fallback value there for older devices that won't know how to interpret the `constant()` or `env()` syntax.  You can also use constants in CSS `calc()` expressions.

<figure>
  <img class="img-center" src="/img/iphonex-viewport-constants.png" style="width: calc(100% - 40px); max-width: 480px" alt="iPhone X with the header positioned correctly">
  <figcaption>iPhone X fixed with automatic device padding added.</figcaption>
</figure>

You would also want to remember to do this for bottom navigation bars as well.

---

Special thanks to Timothy Horton on the WebKit team at Apple for implementing the `viewport-fit` and `constant()`/`env()` features discussed in this post.
Thanks to [Shazron](https://twitter.com/shazron), [Julio](https://twitter.com/jcesarmobile), [Kerri](https://twitter.com/kerrishotts), [Greg](https://twitter.com/gregavola), and [Mike](https://twitter.com/mhartington) for their help in testing and verifying some of these behaviours.

## Changelog

* **<time datetime="2017-10-31">October 31<sup>st</sup>, 2017</time>:** Updated to reflect that `constant()` will be removed in iOS 11.2.
* **<time datetime="2017-10-02">October 2<sup>nd</sup>, 2017</time>:** Updated to reflect that Webkit has dropped support for `constant()` in favour of the standardized `env()` syntax.
* **<time itemprop="datePublished" datetime="2017-09-13">September 13<sup>th</sup>, 2017</time>:** Originally published.
