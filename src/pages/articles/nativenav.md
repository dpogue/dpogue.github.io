---
layout: article
title: Native Navigation in the Mobile Web World
date: 2014-10-06
description: Some thoughts on the problem of native navigation for hybrid mobile apps and the web, and a review of potential solutions.
canonical: https://dpogue.ca/articles/nativenav.html
---
<small>Posted on <time pubdate datetime="2014-10-06">October 6<sup>th</sup>, 2014</time></small>

Much has been written on the subject of web-based mobile apps and how they
compare to native apps.  Often there's a lot of unfair prejudice against web
apps, but one point that consistently stands is related to navigation in web
apps.  Although there are hundreds of libraries that claim to implement
native-feeling navigation for the web, it's incredibly difficult to match user
expectations about interaction, responsiveness, guesture support, and other
default behaviours.  To complicate matters, these expectations can vary
significantly from platform to platform, and version to version (iOS6 vs iOS7).

The common tools for packaging web apps for mobile, such as Apache
Cordova/Adobe Phonegap, don't offer much of a solution to this navigation
problem.  Your application essentially consists of a full-screen web view that
displays your web content, leaving you responsible for all app navigation
controls.


37signals and the Hybrid approach
---------------------------------

There was a [post in early 2014][37signals] by DHH from 37signals about their
Basecamp mobile app and how it combined web content with native navigation.
This is where things start moving into so-called "hybrid" apps: a mix of web
content and native controls.

Several people took the 37signals blog as inspiration and looked for ways to
build tools that would automatically generate native navigation controls based
on website content.  A few examples:

* [GoNative][] parses a website for navigation menus, generates a JSON
  configuration file for them, and packages it up into an app that builds
  native menus from the JSON config.  Their Android and iOS app containers are
  open-source on GitHub, but the website parsing code is done as a service
  through the website.

* [Stacker][] for iOS uses URL parameters to update native controls in the
  title bar.  Websites are loaded in a web view, which intercepts URL
  navigation to update the native controls.  This allows the native controls to
  be controlled through the HTML dynamically, and by intercepting the requests
  before they are sent over the network there is no delay before the native
  controls update.  This makes the app feel more responsive.


These are good solutions for taking web content from a server and displaying it
with native navigation controls, but in many cases web apps are built with
client-side frameworks that run entirely client-side.  These are cases where
Cordova/Phonegap is often the technology of choice because it will package up
existing files and serve them locally on the mobile device.

Another disadvantage to these solutions is that some of the customization has
to happen in native code.  Ideally we could control the native navigation
controls with the same ease and flexibility that we have with the HTML
`<title>` tag.

So how do we make native controls which are defined entirely by HTML?  Could
these be defined in such a way that browsers can automatically generate native
navigation controls for apps?


Imagining an Ideal Solution
---------------------------

There is already one case where HTML can control an aspect of the native
interface, through the `<title>` tag.  If you change the title in HTML via
JavaScript, the browser updates the window automatically with the new title.
One common feature of mobile navigation is a title bar displayed across the top
of the screen, and it makes sense for the content of that title to reflect the
title of the page in the web view.

Another existing convention found in web browsers is the back button.  History
on the web works like a stack, with each new page or state adding to the top of
that stack, and the back button popping the most recent state off the top.
With the [HTML5 History API][], we have `pushState()` and `replaceState()` to
allow single-page applications to add to the history stack without page
reloads.  Unfortunately, there is one key piece missing from the History API,
which is the ability to remove pages from the history stack programmatically.
It's somewhat understandable that we wouldn't want any website to be able to
start removing entries from the history stack, but for web apps there are
plenty of use cases.

Imagine you have an app with a landing page, a signup page, and a logged-in
dashboard.  Someone launches the app for the first time and sees the landing
page, then clicks signup.  At this point, hitting back should take them to the
landing page.  After signing up, they are redirected to the dashboard. Hitting
back here shouldn't really do anything; it's definitely wrong to take them back
to signup when they're already logged in.  If we used `replaceState()` when
redirecting, hitting back on the dashboard would still take them back to the
landing page which might also be undesirable.  Unfortunately, there's no
JavaScript API (or even native web view API in most cases) for clearing the
history stack.

One part of the HTML5 spec that hasn't seen much adoption is [the `<menu>`
element][Menu spec].  In HTML3 this was just treated like a list, and was
removed from HTML4, but it's been added back in HTML5 along with a `<menuitem>`
element to build native toolbar and context menus.  The idea is that web apps
can define a menu with a unique ID containing items and submenus, and then
refer to that menu by ID using the `contextmenu=""` attribute.  When someone
right-clicks on long-presses on the element, the browser should open a context
menu with the items and submenus from the HTML.  
At the time of writing (October 2014) only Firefox natively supports this, but
there is ongoing work to implement this in Chrome.

Custom context menus with the `<menu>` tag would give developers more ability
to affect native interactions via HTML, but doesn't go quite far enough to
provide everything that would be needed for native navigation.  In particular,
the actual navigation part is still missing.  This is harder to solve, partly
because of the disparate navigation controls across platforms and devices, and
partly because there isn't a clear mapping to HTML.

### Defining Navigation

#### `<nav>` elements
One possibility is to pull content from the `<nav>` element, but its contents
are not required to be structured in any consistent way, and it doesn't have a
tightly scoped use case.  The HTML5 spec essentially says to use `<nav>`
anywhere that is "a section with navigation links".  There are no restrictions
on the number of `<nav>` elements on the page.  While it would be possible to
make some guesses based on the structure of the navigation content, it's an
ugly situation that should be avoided if possible.

#### Meta tags
Navigation and primary page actions could be specified by custom meta tags,
which is roughly the approach used by Internet Explorer for its [pinned site
jump lists][IE Jump Lists].  In a single-page application however, this isn't
an ideal solution: meta tags are intended to apply to the document as a whole,
and modifying them at runtime can be buggy.  Most client-side frameworks are
also focussed on the page content in the body, and aren't set up to manage meta
tags.

#### JavaScript
Some mobile platforms have exposed JavaScript APIs for defining navigation
menus, such as [WinJS.UI.Menu][] and [blackberry.ui.menu][].  These work well
for their respective platforms, but there's no consistent API for
multi-platform applications (which web apps often are).  It's also my belief
that the navigation should be defined as part of the page structure, rather
than manually constructed through JavaScript.  This allows for fallbacks in
browsers that don't support generating native navigation elements.

#### Web Components
Web components allow the creation of new custom elements with registration
events and logic available through JavaScript.  Defining a new `<native-menu>`
element would be easy, and using JavaScript could be mapped onto existing APIs
like WinJS.UI.Menu or blackberry.ui.menu.  Ultimately it has the same issues as
those JavaScript APIs in that the implementation would be platform-specific.
The only benefit is that the navigation would be defined in the HTML.

#### `<menu type="toolbar">` elements
Finally we're left with the toolbar version of the `<menu>` tag.  The HTML5
spec says that a menu of type toolbar should `<li>` elements or flow content.
That gives us some degree of structure that can be parsed, but those `<li>`
tags could still contain anything.  Although not explicitly stated in the spec,
the toolbar type of the menu tag is essentially intended to behave like a
`<ul>` tag for compatibility with HTML3.

We could informally make some assumptions about what would be considered a
valid menu.  The easy path would be to require `<li>` elements that contain a
valid command type (as defined in the HTML5 spec, which is basically one of
`<a>`, `<button>`, or `<input>`).  That would serve as a starting point, but
there's really no way to enforce these informal guidelines.  There's also
nothing preventing multiple menus from being declared in the page, which would
lead to ambiguity when trying to parse and generate native components.  It
might be reasonable to only build native navigation for a menu that is a direct
child of the body, but that's just adding more unofficial rules to the mix.


The Path Forward
----------------

Unfortunately there's no single clear solution to all of this that can work in
browsers today, or that's even an official proposal for browsers tomorrow.
I've spoken informally to some browser developers about what sort of solution
they envision, but it's a hard problem to describe and the brief answer has
usually been to point to Web Components for custom elements.

Some attempts have been made to make due with the `<menu>` tag, despite the
open questions about how suitable it is.  One of the Cordova developers
[started a plugin][mwbrooks-plugin] in 2011 to act as a polyfill for native
menus, and I am responsible for a [newer plugin][cambie] along the same lines.
Ultimately these *can't* really be polyfills for native navigation if there's
no clear guideline on what should be polyfilled and how it should behave.

I would love to hear from browser developers, mobile OS developers, app
developers, and hybrid platform developers what they envision as an ideal
solution to this problem.  The web improves through discussion.


[37signals]: https://signalvnoise.com/posts/3743-hybrid-sweet-spot-native-navigation-web-content
[GoNative]: https://gonative.io/
[Stacker]: http://www.lokimeyburg.com/Stacker/
[HTML5 History API]: https://html.spec.whatwg.org/multipage/browsers.html#the-history-interface
[Menu spec]: http://www.w3.org/html/wg/drafts/html/master/interactive-elements.html#the-menu-element
[IE Jump Lists]: http://msdn.microsoft.com/en-ca/library/ie/gg491725%28v=vs.85%29.aspx
[WinJS.UI.Menu]: http://msdn.microsoft.com/en-us/library/windows/apps/hh700921.aspx
[blackberry.ui.menu]: http://developer.blackberry.com/bbos/html5/apis/blackberry.ui.menu.html
[mwbrooks-plugin]: https://github.com/mwbrooks/cordova-plugin-menu/tree/5a13232dbeac867583f6ecbefd0b44f65c9816e2
[cambie]: https://github.com/dpogue/cordova-plugin-cambie

