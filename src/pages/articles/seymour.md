---
layout: article
title: "Seymour: Cordova build helper"
date: 2015-11-16
description: A Cordova build helper designed specifically for continuous integration environments.
canonical: https://dpogue.ca/articles/seymour.html
---
<div><small>Posted on <time pubdate datetime="2015-11-16">November 16<sup>th</sup>, 2015</time></small></div>

At [Ayogo Health][ayogo], our development process for [Cordova][cordova] mobile apps includes a number of "intermediate" builds before the final version that will be released.  These range from local dev builds communicating with local dev servers, <abbr>QA</abbr> builds distributed internally communicating with a <abbr>QA</abbr> server, builds for user testing and feedback, staging builds to be shown to project clients the communicate with a staging server, ad-hoc builds for marketing and conference demonstrations, and finally the production builds that will be made available for public download.

Managing all of these builds can be a bit challenging, mostly around ensuring that the right build is configured to communicate with the right server, and that they have different app <abbr>ID</abbr>s and app names so they don't conflict with one another.  We use [Jenkins][jenkins] as a continuous integration environment and also as an automated build system.  For instance, our <abbr>QA</abbr> apps are rebuilt every time there a pull request is merged and the <abbr>QA</abbr> team is notified with a changelog.

With Cordova, the app name and <abbr>ID</abbr> are set via a config.xml file in the root of the project.  One of the steps we have Jenkins perform is a handful of `sed` commands to manipulate those values.  Ultimately we end up with a scenario where each build job on Jenkins is running slightly different steps in slightly different orders.


Limitations
-----------

For the most part, this system works well but when there's a problem, it quickly becomes a headache to track it down.  The builds from Jenkins are in release mode so they can't be debugged directly, and trying to make debug builds locally with the same config is fraught with accidental errors.  Often the quickest solution is to <abbr>SSH</abbr> into the Jenkins machine and manually make builds there, but this is far from an idea solution.

After a particularly frustrating day making manual debug builds of a several instances of a project and adding Jenkins jobs for new instances, I wanted to simplify the process so that it was more reliable and easier to configure.

I posted a wishlist in our developer channel on Slack:
> I'd like a "build cordova" script based on environment variables and npm run commands:
> * `npm run buildapp` should do all the grunt build steps and invoke this script
> * Debug/Release mode of the resulting app should be set via `AY_BUILD_MODE` env var
> * App <abbr>ID</abbr> should have a default in config.xml, but can be overridden by `AY_APP_ID` env var
> * App name should have a default in config.xml, but can be overridden by `AY_APP_NAME`
>
> This will allow us to do matrix builds in Jenkins, generating both debug and release builds for a given commit


Introducing Seymour
-------------------

<img class="img-center img-lightbg" width="481" src="/img/seymour.png" alt="">

[Seymour][seymour] was the resulting build script.  It's a thin wrapper around the Cordova build commands that will do a little bit of pre-configuration.  At the moment, it supports changing the app <abbr>ID</abbr>, name, and version number, as well as controlling which platforms to build and whether to make a debug or release build.  All of these are configured by environment variables, which means our Jenkins jobs for different builds now have the same set of steps and the only variation is the environment.

Effectively, Seymour will update your config.xml file values based on the environment variables, then run a `cordova prepare` which will restore all the platforms and plugins that have been installed to the project.  Finally it will run a `cordova build` command to compile the native projects.  In the future, it would ideally collect those builds and copy them into a top-level folder for easy finding.

Seymour is available to install through `npm`, and the code is [available on GitHub][github] under the Apache 2.0 licence.  Please report any issues or feature requests.

As a word of caution, Seymour is built on top of the recently released Cordova 5.4.0 which is known to have some issues.  Those should hopefully be fixed with a 5.4.1 release in the coming week.


[ayogo]: http://ayogo.com
[cordova]: https://cordova.apache.org/
[jenkins]: https://jenkins-ci.org/
[seymour]: https://www.npmjs.com/package/seymour
[github]: https://github.com/dpogue/seymour
