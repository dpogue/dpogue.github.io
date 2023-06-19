---
layout: article
title: "On plGLPipeline and Plasma for Linux..."
date: 2016-01-11
description: A status update on plGLPipeline and Uru/Plasma on Linux
canonical: https://paradox22.wordpress.com/2016/01/11/on-plglpipeline-and-plasma-for-linux/
---
<div><small>Posted to <a href="https://paradox22.wordpress.com/2016/01/11/on-plglpipeline-and-plasma-for-linux/">WordPress</a> on <time pubdate datetime="2016-01-11">January 11<sup>th</sup>, 2016</time></small></div>

A new beta driver from nVidia on Thursday night spurred me to revisit the plGLPipeline stuff I’ve been poking at over the past few years. I had an unexpectedly productive few days and got a lot of texturing-related stuff done. I posted the following image on Twitter yesterday to show-off how things were looking:

<figure>
  <img class="img-center" src="/img/relto-gl-2016.png" alt="Relto, rendered with no dynamic lighting and several texturing artifacts">
  <figcaption>Relto, rendered on Linux with plGLPipeline</figcaption>
</figure>

It’s pretty cool, but a single screenshot easily gives a false impression of progress. Some people were asking if I needed anyone to help test it. The reality is that **this screenshot is all that plGLClient is capable of right now.** The OpenGL work is solely the rendering pipeline and while (very slow) progress is happening there, the rest of the pieces needed for an actual functioning client are still quite far from being usable on Mac or Linux.

plGLClient currently has a hardcoded camera position. If I wanted to take a screenshot of a different part of Relto (or a different Age), I need to edit the code and build a new client. The reason for this is that the camera system depends on a working keyboard/mouse input system, and the current plInputCore system is Windows-only code.

Likewise, the Age name is hardcoded. I’d been testing with the Guild of Writers Pub for quite a while, and after it seemed to be working I decided on a whim to try Relto. Using the real plAgeLoader requires plNetClient and pfPatcher code, and those require the actual networking system code which is a tangled mess of several layers that involve of Windows-specific code.

To be entirely honest, to even get plGLClient to work at all involved commenting out sizable portions of other code. Did you know that texture layers depend on the network system (via plLayerSDLAnimation, which requires plSDL, which requires plNetClient & plNetMessage, which require plNetClientComm, which require …)?

One of the next things on the to-do list for plGLPipeline is getting lighting hooked up. You can see in the screenshot that some objects are rendered black because of the lack of run-time lighting. Unfortunately plGLight also has dependencies on other parts of the system that don’t compile on Linux. For now I’ll probably end up commenting those out for the sake of progress, but I can’t keep avoiding these issues forever.

<br>

I’m going to be honest, I don’t know if this project will ever get to a point where the game is playable on Linux natively. It’s taken me over 2 years to get to what you see above, which probably totals less than 80 hours of actual work. There’s so much to do in terms of replacing non-portable code and cleaning up the tangled subsystems, and it’s very overwhelming and makes it hard to work on it. It’s depressing to think that your next step might involve replacing 1/4 of the entire codebase. It feels a bit like punching your way through a rock wall, you make minimal progress at personal cost, but given infinite time you would eventually accomplish it. But we don’t have infinite time, and we don’t have resources.

There is nobody left for whom Plasma is their main focus. There are 3 or 4 of us who make casual contributions, but general interest in Uru has dropped off so there are no new contributors coming along. Between full-time jobs and other commitments and burnout, the reality is that most of us have very limited energy to devote to a project that feels like a black hole sometimes.
