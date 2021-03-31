---
layout: article
title: The Google Music API
date: 2012-01-14
description: Exploring the undocumented Google Music API.
canonical: https://dpogue.ca/articles/gmusic.html
---
<div><small>Posted on <time pubdate datetime="2012-01-14">January 14<sup>th</sup>, 2012</time></small></div>

This is an undocumented, beta <abbr>API</abbr> used by the Google Music client for Android. Most of the <abbr>URI</abbr>s you see here were extracted from the Android .apk file. Overall, it works just like any other GData <abbr>API</abbr>.

**Google Music has been discontinued, so this now exists just as a historical archive with no practical use.**

A few notes:

* The service name for Google Music is "**sj**", which seems to be short for "SkyJam".
* As far as I can tell, this requires ClientLogin for auth, since there's no OAuth permissions for the service. I'd be happy to be wrong on this point.

Authentication
--------------


First we need to go through the ClientLogin process to get our auth token. This process is documented fairly thoroughly <a href="http://code.google.com/apis/accounts/docs/AuthForInstalledApps.html">in Google's API documentation</a> and we can copy their sample requests exactly, aside from the value of the service parameter.

Using cURL, I was able to get an auth token with the following command:

```
curl -d accountType=GOOGLE \
     -d Email=jondoe@gmail.com \
     -d Passwd=north23AZ \
     -d service=sj \
     https://www.google.com/accounts/ClientLogin
```

The response should contain 3 values: `SID`, `LSID`, and `Auth`. Copy the `Auth` value, and ignore the other two.


Making a Request
----------------

Now we have the auth token, we can make a request. We're going to request the track list.

According to the <abbr>URI</abbr>s from the Android client, that request <abbr>URL</abbr> should be  
`https://www.googleapis.com/sj/v1beta1/tracks`

We can make a request there, specifying the auth token as a header in our request:

```
curl --header "Authorization: GoogleLogin auth=YOUR_AUTH_TOKEN" \
     https://www.googleapis.com/sj/v1beta1/tracks
```

If everything is successful, you should get back a <abbr>JSON</abbr> response containing all of the metadata for all of your tracks.


Other Requests
--------------

These are other <abbr>API</abbr> requests that were found in the Android client.

* `/playlists/magic`
* `/plentries`
* `/plentriesbatch`
* `/plentryfeed`
* `/playlistbatch`
* `/playlists`
* `/playlistfeed`
* `/trackstats`
* `/trackbatch`
* `/tracks`
* `/trackfeed`


Requesting the Audio Stream
---------------------------

Once we have the song <abbr>ID</abbr> of a track, we can request that track's audio stream as an <abbr>MP3</abbr> file. This is actually a 2-part request, we need to request the <abbr>URL</abbr> of the stream, and then the stream itself.  
**Unfortunately, you need to have sync'ed your Google account with an Android device in order for this part to work.**

Android makes requests to `https://android.clients.google.com/music/mplay` with the following parameters:

<dl>
  <dt>songid</dt>
  <dd>The <abbr>UUID</abbr> of the track that you are requesting. This parameter is required!</dd>

  <dt>pt</dt>
  <dd>The playback type. Valid values are `e` (requesting for explicit playback) and `a`.</dd>

  <dt>dt</dt>
  <dd>The download type. Valid values are `pc` (prefetching?), `uc` (keepon?), and `rt` (ringtone).</dd>

  <dt>targetkbps</dt>
  <dd>The target kilobytes per second of the resulting audio file.</dd>

  <dt>start</dt>
  <dd>The position/time(?) at which to start streaming.</dd>
</dl>

There is also an important <abbr>HTTP</abbr> header that must be sent with this request, in addition to the `GoogleLogin` header.  
You must include `X-Device-ID` with the value of your Android device's <abbr>ID</abbr>. The device must be linked to your Google account.  Failure to include this header will result in <abbr>HTTP</abbr> status 400.  If you don't have an Android device, you can run one in the Android emulator (included with the Android <abbr>SDK</abbr>), and set up your Google account to sync. Then you can use the device <abbr>ID</abbr> of the emulated device to request your music.

> **Note:** This might return <abbr>HTTP</abbr> redirects before eventually giving you the audio stream. Make sure you are prepared to handle redirects!

---

**Disclaimer:**  
I am not associated with Google. This information is the result of my personal investigation into an <abbr>API</abbr> that is not yet publicly documented. The <abbr>API</abbr> is subject to change without warning as Google sees fit.
