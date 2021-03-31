---
layout: article
title: Cordova builds with Xcode 8
date: 2016-09-14
description: Workarounds for Cordova/PhoneGap iOS projects in Xcode 8 to handle code signing and provisioning.
canonical: https://dpogue.ca/articles/cordova-xcode8.html
---
<div><small>Posted on <time pubdate datetime="2016-09-14">September 14<sup>th</sup>, 2016</time> &bull; Updated on <time datetime="2016-10-26">October 26<sup>rd</sup>, 2016</time></small></div>

With iOS 10 comes a new Xcode version, and with a new Xcode version comes new and unexpected provisioning profile and code signing issues.  The good news is that Xcode 8 brings better support for handling multiple developer teams, and can largely handle provisioning profiles automatically.  The bad news is that [Apache Cordova](https://cordova.apache.org/) (and related tools like [Adobe PhoneGap](http://phonegap.com/)) won't be able to make command-line release builds out of the box.

**Update (October 26<sup>th</sup>, 2016):** Cordova-iOS 4.3.0 is now released, which simplifies some parts of this.


Xcode 8 Automatic Provisioning
------------------------------

I'll start with this: if you want all the details about how code signing has changed in Xcode 8, you cannot do better than [this very thorough explanation](https://pewpewthespells.com/blog/migrating_code_signing.html#signing-in-xcode-8).

If you're looking for a summary:

* There is now a `DEVELOPMENT_TEAM` setting to specify the Apple Developer Team <abbr>ID</abbr>
* The `CODE_SIGN_IDENTITY` setting should be a generic <kbd>"iPhone Developer"</kbd> identity (with no additional specificity)
* The `PROVISIONING_PROFILE` setting should no longer be used.


Cordova Support
---------------

### Development Team

Cordova-iOS 3.4.0 allows specifying a `developmentTeam` in build.json, which will be used to populate the `DEVELOPMENT_TEAM` setting.  You do not need the hook if you're using Cordova-iOS 4.3.0.

If you're using an older version, I've [written a hook](https://gist.github.com/dpogue/186b6c1827363c48d644b0d59e91bc28) that you can add to your project. Save that file in your hooks folder, and reference it in your config.xml:

```xml
<platform name="ios">
  <hook type="before_compile" src="hooks/xcode8.js" />
</platform>
```

#### Finding your Development Team ID

Your Development Team <abbr>ID</abbr> can be found by going to the [Apple Developer portal](https://developer.apple.com/account), logging in, and clicking on the Membership page in the sidebar.

<figure>
  <img class="img-center" src="/img/xcode-team.png" alt="Apple Developer Account Team ID">
  <figcaption>The Team <abbr>ID</abbr> shown in the Apple Developer Account Membership details.</figcaption>
</figure>

### Code Signing Identity

The second problem is that Cordova will automatically try to use <kbd>"iPhone Distribution"</kbd> as the identity when making a build with the release option.  You can override this by specifying <kbd>"iPhone Developer"</kbd> in your build.json with the `codeSignIdentity` key.

This is confusing, but you should always use the <kbd>"iPhone Developer"</kbd> identity, **even when making release builds**.


### Exporting a Distribution Build

Now your release builds are succeeding, but they still aren't right because they're actually being signed with a development certificate. In order to sign them with a distribution certificate, you'll need to perform an archive step in Xcode.  
Cordova-iOS 4.3.0 will do this automatically if you make a build for a device, but unfortunately **this is a manual step** in the Xcode <abbr>IDE</abbr> for earlier versions of Cordova.

With Cordova-iOS 4.3.0, you'll need to tell it what type of build to make.  This is specified via the `packageType` key in build.json.  This allows you to make enterprise, ad-hoc, and App Store builds.

The valid options for `packageType` are:

* `development` (the default)
* `ad-hoc`
* `enterprise`
* `app-store`


### Build Config options

Your updated build.json file should look something like this:

```json
{
  "ios": {
    "debug": {
      "developmentTeam": "ABCD12345Z"
    },

    "release": {
      "developmentTeam": "ABCD12345Z",
      "codeSignIdentity": "iPhone Developer",
      "packageType": "ad-hoc"
    }
  }
}
```

---

Special thanks to [Christian](http://www.christian-cook.co.uk/) and [Shazron](https://shazronatadobe.wordpress.com/) for their help in figuring out the required config bits.  
An *enormous* thank you to [Samantha](https://pewpewthespells.com/) for her amazing post about Xcode 8 code signing changes, and being the only document that made any sense.
