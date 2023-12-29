---
layout: article
title: "Open-Source Roundup: Tools"
date: 2023-12-29
description: A selection of open-source tools from digital health company Ayogo, for help in developing and deploying web and mobile applications
---
<small>Posted on <time pubdate datetime="2023-12-29">December 29<sup>th</sup>, 2023</time></small>

The workflows for much of modern web and mobile development rely heavily on open-source. My work at Ayogo, a behavioural science-based digital health company, is no exception. We've used open source for years, in the form of Ruby on Rails, Apache Cordova, Ionic Capacitor, AngularJS, Vue, npm, Jenkins, nginx, MySQL, momentJS, and thousands of other tools and libraries.

Knowing the value of such tools, we wanted to share some of our own open-source repositories in the hope they might prove useful. This will be the first in a series of blog posts highlighting some of the tools, web components, and mobile development plugins that we've released publicly as open-source software.

GitHub Environment Provisioner
------------------------------
Over the past few years, we've become heavy users of GitHub Actions for continuous integration of pull requests, and continuous deployment to our development and testing environments. We also use manually-triggered GitHub Actions workflows to promote tags from development to staging and production environments.

The deployment process is the same across those environments, but with different configuration values needed for different stages and regions and 3rd party service tokens. Luckily, GitHub Actions provides a way to configure environments, and variables and secret values specific to each environment that are accessible within the build steps of a GitHub Action workflow.

With a microservice design pattern, our deployment process involves coordinating the tagging and deploying of multiple GitHub repositories - one for each service - but they often need the same configuration values. Rather than configure the environments and values for each repository individually, we opted to develop a script that could populate these values from a JSON definition file.

This relies on GitHub's `gh` CLI tool to automatically set up variables and secret values within an environment, so for ease of use we opted to make it available as a GitHub CLI plugin:

```
gh extension install AyogoHealth/gh-provision-envs
gh provision-envs -c config.json -R myuser/myrepo
```

For more details about use, including the format of the configuration file, see https://github.com/AyogoHealth/gh-provision-envs


Mobile Application Icon Generator
---------------------------------
Although the situation has improved in recent years, historically mobile application development required providing a plethora of image assets to be used as app icons across various versions of various devices. These icons needed to be different sizes, sometimes different shapes, and with varying padding based on how the icon was meant to be displayed.

Our designers quickly got tired of needing to resize and export icon assets, especially as each year seemed to bring new required sizes. Since the design files were already in vector format, we opted to automate the icon generation process starting with a vector SVG file.

The result is a bash script that combines Inkscape's command-line, ImageMagick tooling, multiple image compression tools, and (more recently) a wrapper for AndroidStudio's SVG-to-VectorDrawable Java tool.

```
./iconize -o app_icons -b black my_icon.svg
```

Currently the `iconize` script will default to generating only a 1024×1024 PNG for iOS, and a VectorDrawable for Android, but it has options to export the full range of icon sizes that were needed for previous versions.

The `iconize` script is available for download for macOS and Linux at https://github.com/AyogoHealth/icon-tools


Localization Spreadsheet Importer
---------------------------------

Translating a website or mobile application to support multiple languages is a daunting task, and managing all those translations can be a hassle. Luckily, most of the major JavaScript frameworks have internationalization modules to handle loading and showing those strings, including token replacements and pluralization.

While there are many many tools available for editing translations and crowdsourcing translations and collaborating on translations, somehow it seems to always come back to spreadsheets.

Our typical approach is to set up a spreadsheet with multiple tabs for different sections of our application, each tab having one column with a logically namespaced key for a given piece of text, and then a series of columns containing the translation of that key into multiple languages. For example, the home screen of our application might have a greeting message that we give a key of `"home.greeting"` and an English translation of `"Hello {name}"` and a French translation of `"Bonjour {name}"`. We can include placeholder tokens in our spreadsheet and let the JavaScript internationalization module handle the actual replacement. You can see an example spreadsheet here: https://docs.google.com/spreadsheets/d/1L9x1ocxy6VwNEPsrWiTri4wGYN9FQUymRg1p267r9R4/

But we need a way to take the keys and translation values from the spreadsheet and make them accessible to the JavaScript framework, which is where our `get_copy` tool comes in handy.

```
npx @ayogohealth/get_copy -o output.json SpreadsheetID
```

This tool takes the ID of a Google Sheets spreadsheet, and outputs a JSON file containing the keys and translation values for a given language. Once we have a JSON file per language, we can conditionally load the right one at runtime.

The `get_copy` script is written in JavaScript and can be installed as a development dependency to a project using npm, or executed directly using npx. It also provides a programmatic JavaScript API that can be incorporated as a step in a larger scripted build workflow.

For more details, example, and documentation of the configuration options, see https://github.com/AyogoHealth/get_copy
