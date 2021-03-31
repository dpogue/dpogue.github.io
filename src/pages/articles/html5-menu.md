---
layout: article
title: "HTML5 Menus & Browser Support"
date: 2015-03-04
description: An overview of the HTML5 menu element, how to use it, and the state of its current support in browsers.
canonical: https://dpogue.ca/articles/html5-menu.html
---
<div><small>Posted on <time pubdate datetime="2015-03-04">March 4<sup>th</sup>, 2015</time> &bull; Updated on <time itemprop="dateModified" datetime="2020-05-09">May 9<sup>th</sup>, 2020</time></small></div>

The `<menu>` tag has a bit of a troubled history. In <abbr>HTML3</abbr> it was essentially synonymous with `<ul>`.  It was deprecated in <abbr>HTML4</abbr>, but added back to the specification for <abbr>HTML5</abbr>.  Due to feedback from browser makers, it changed a bit between the publishing of the <abbr>W3C</abbr> <abbr>HTML5</abbr> spec and the continued work on the <abbr>WHATWG</abbr> <abbr>HTML5.1</abbr> spec, before being dropped entirely.

The purpose of the `<menu>` tag is to allow web applications to provide context menu actions that will be merged into the browser's native context menu.  This is something that has been implemented using JavaScript libraries for years, but the advantage of native support is that it doesn't prevent access to the existing browser menus.

While there were implementations for a while in Chrome and Firefox, support was subsequently removed and then [dropped from the spec](https://github.com/whatwg/html/pull/2742).  There were a few different pieces of menu-related functionality that were intended to be supported:

* Support for the basic `<menu>` tag (`type="toolbar"`)
* Support for the popup `<menu>` tag (`type="context"`)
* Support for the `<menuitem>` tag
* Support for the `contextmenu` attribute
* Support for `<button type="menu">`

If you're curious to know more, the rest of the post will explain the spec and how the `<menu>` tag was intended to be used.  The examples and screenshots in this post were written in 2015 and tested in Chrome, before support for `<menu>` was removed.


Making Sense of Menus
---------------------

<figure>
  <img class="img-center" src="/img/menu-toolbar.png" alt="Toolbar menu">
  <figcaption>A simple toolbar menu, as rendered in Chrome.</figcaption>
</figure>

The most basic case of the `<menu>` tag is using it as it was used back in the <abbr>HTML3</abbr> days to provide a list of links.  Its children should be `<li>` list items with links or buttons inside.  This is the default type of menu, and is supported by all browsers.  In most cases, it looks identical to a `<ul>` list.

In <abbr>HTML5</abbr>, the `<menu>` element has a `type` attribute that determines which type of menu is being defined.  The default value for `type` is `"toolbar"`, which preserves the list-like appearance from <abbr>HTML3</abbr>.

> **Note:** Neither Chrome nor Firefox properly implement the default value for the `type` attribute on `<menu>` elements.  
> Chrome does not implement the `type` attribute at all unless the "Experimental Web Platform Features" flag is enabled.  
> Firefox returns an older (now incorrect) default value of `"list"` for the `type` attribute.

A basic [example](http://jsfiddle.net/dpogue/p4tn782n/) of sidebar link using `<menu>` might look something like this:

```html
<menu type="toolbar">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
</menu>
```


### Making Use of HTML5

<figure>
  <img class="img-center" src="/img/menu-popup.png" alt="Context menu">
  <figcaption>A simple popup context menu, as rendered in Chrome.</figcaption>
</figure>

Beyond being compatible with <abbr>HTML3</abbr>, the <abbr>HTML5</abbr> `<menu>` tag is intended to add custom context actions to right-click/long-press popup menus in the browser.  To define a popup menu, you need to set the `type` attribute to `"context"`.

Popup `<menu>` elements are intended to be combined with the global `contextmenu` attribute.  You can specify `contextmenu` on any element in your page and set its value to the <abbr>ID</abbr> of a `<menu>` in the same <abbr>DOM</abbr> hierarchy, and when the contextmenu event is triggered on that element it will show the specified `<menu>`.

> **Note:** Chrome on Android supports the `contextmenu` attribute, but does not enable long-press on the elements.  Therefore, you can only bring up the menu on a element that already has long-press support (like an `<a>` tag).

As an example, this is how you might associate a menu with a `<div>`:

```html
<div contextmenu="myMenu">Right-click Me</div>

<menu type="context" id="myMenu">
</menu>
```

Now this menu doesn't really accomplish much because it's empty.  To add actions to our menu, we need to use the `<menuitem>` tag.  This element is optionally self-closing (like `<li>` or `<options>`) and does not require a closing tag if it is followed by another `<menuitem>`, a `<menu>`, or the end tag of its parent element.

> **Note:** Firefox doesn't treat `<menuitem>` as self-closing properly at the moment, so to be safe I'd recommend including a closing tag.

The `<menuitem>` tag is modelled after the `<option>` tag.  The first and most important attribute is `label`.  This is the text that you want to appear in your popup menu.  If no `label` attribute is specified, the text content of the element will be used as the label.

The simplest menu item looks like this:

```html
<menuitem label="Menu Item 1">
```

Some other basic attributes for `<menuitem>` include:

* `icon`: Adds an icon to the menu when the `icon` value is the URL of an image.
* `disabled`: Visually disables and prevents clicking on the menu item.
* `title`: Provides a hint describing the item action, which may be displayed as a tooltip.

> **Note:** Chrome doesn't support the `icon` attribute at the moment.  
> I don't think any browsers support the `title` attribute.

Our [example](http://jsfiddle.net/dpogue/fLjt62fn/) might now look something like this:

```html
<div contextmenu="myMenu">Right-Click Me</div>
<menu type="context" id="myMenu">
    <menuitem label="Item 1" title="The first menu item">
    <menuitem label="Item 2" title="The second menu item" disabled>
</menu>
```


### More complicated menu items

<figure>
  <img class="img-center" src="/img/menu-checked.png" alt="Complex context menu">
  <figcaption>A context menu with checkbox items and separators.</figcaption>
</figure>

Often menus are used by applications to present a quick way to enable or disable options, or to toggle between a few different options.  We can do that in <abbr>HTML</abbr> too by looking at some of the advanced attributes for the `<menuitem>` tag.

For menu items that can be toggled on and off (like a checkbox), set the `type` attribute to `"checkbox"`.  You can specify if the item is checked by default using the `checked` attribute.

For items that behave like a radio button group, set the `type` attribute to `"radio"`, and give all the items the same `radiogroup` value.  You can specify which item should be checked by default with the `checked` attribute.

You can also group menu items by adding separators with an `<hr>` element.

Our more complicated [example](http://jsfiddle.net/dpogue/knduk0k3/) looks like this:

```html
<menu type="context" id="myMenu">
    <menuitem type="checkbox" label="Enable CSS" checked>
    <menuitem type="checkbox" label="Enable JS">
    <hr>
    <menuitem type="radio" radiogroup="img" label="PNG" checked>
    <menuitem type="radio" radiogroup="img" label="JPEG">
    <menuitem type="radio" radiogroup="img" label="GIF">
</menu>
```

There's one more type of menu item, a `"command"` type that references another element in the page by <abbr>ID</abbr> and triggers it with a click event when the menu item is activated.

```html
<button id="submitbutton" type="submit">Submit</button>

<menu type="context">
    <menuitem type="command" command="submitbutton" label="Submit">
</menu>
```

### Nested Menus

<figure>
  <img class="img-center" src="/img/menu-nested.png" alt="Context submenu">
  <figcaption>A context menu with a nested submenu.</figcaption>
</figure>

You can create submenus by nesting `<menu>` elements within each other.  When creating a child menu, you must specify the `label` attribute on the child `<menu>`.  This label will be displayed as a menu item that opens the child menu.

[Example](http://jsfiddle.net/dpogue/9804txz7/):

```html
<div contextmenu="myMenu">Right-Click Me</div>
<menu type="context" id="myMenu">
    <menu label="Child Menu">
        <menuitem label="Child Item 1">
        <menuitem label="Child Item 2">
    </menu>
</menu>
```

### Opening Menus With Buttons

Much to my dismay, this feature is missing in all browsers and – as of February 2017 – has been entirely dropped from the <abbr>HTML5</abbr> spec.

The <abbr>HTML5</abbr> spec proposed adding a new type of `<button>` for opening menus when activated.  If the button `type` attribute is `"menu"` and the `menu` attribute is the <abbr>ID</abbr> of a popup `<menu>` tag, clicking or tapping the button should open the menu.

This is where the real value of menus can be used, combining a `<menu type="toolbar">` containing `<button type="menu">` elements with `<menu type="context">` elements to build a standard-style menu bar using only standards-based <abbr>HTML</abbr>.

[Example](http://jsfiddle.net/dpogue/o1ahjku7/):

```html
<button type="menu" menu="myMenu">Click Me</button>

<menu type="context" id="myMenu">
    <menuitem label="Item 1">
    <menuitem label="Item 2">
</menu>
```

I worked on a [JS polyfill](https://ayogohealth.github.io/ay-menu-button/) for this missing feature, which you can find as `ay-menu-button` on npm.


## Changelog

* **<time datetime="2020-05-09">May 9<sup>th</sup>, 2020</time>:** (Very belatedly) updated to reflect that `<menu>` has been [dropped entirely from the spec](https://github.com/whatwg/html/pull/2742).
* **<time datetime="2017-02-09">February 9<sup>th</sup>, 2017</time>:** Updated to reflect that <abbr>WHATWG</abbr> have [dropped `<button type="menu">` from the spec](https://github.com/whatwg/html/pull/2342).
* **<time datetime="2016-07-28">July 28<sup>th</sup>, 2016</time>:** Updated to reflect Chrome moving the feature [behind more flags](https://chromium.googlesource.com/chromium/src.git/+/990b0dfe5c98990f3a27e44a2a5e512f5ed3140d) in Chrome 52.
* **<time datetime="2016-04-08">April 8<sup>th</sup>, 2016</time>:** Updated to reflect the loosened `<menuitem>` text content rules.
* **<time datetime="2016-01-25">January 25<sup>th</sup>, 2016</time>:** Updated to reflect Chrome 48 support for `type="context"`.
* **<time datetime="2015-10-11">October 11<sup>th</sup>, 2015</time>:** Updated to reflect that the spec has been changed from `type="popup"` back to `type="context"`.
* **<time itemprop="datePublished" datetime="2015-03-04">March 4<sup>th</sup>, 2015</time>:** Originally published.
