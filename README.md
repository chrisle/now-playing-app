<a href="https://nowplayingapp.com">
  <img src="https://nowplayingapp.com/images/logo.svg" alt="Now Playing" width=512 />
</a>

[Official Website](https://nowplayingapp.com) | [Support (Discord)](https://discord.gg/7bbHvZb) | [Twitch](https://twitch.tv/triodeofficial) | [Twitter](https://twitter.com/triodeofficial)

---

# Project Overview

- The app is written in Typescript & React.
- Communication within the app is done just using a very simple event emitter.
  (app/utils/appbus.ts)
- The app itself gets data from DJ software or hardware and sends the data
  to a websocket.
- There is a separate webserver (app/lib/ThemeWebServer/index.ts) that presents
  data from the websocket so you can use it in OBS.
- Themes for the presentation are located in (resources/themes)
- There are no tests (too lazy).
- There's not a lot of code comments (too lazy).
- This was actually the first time I wrote anything in Typescript/React. Since
  then I realize there's stuff I could have done better :)

---

# Development

## Development Setup

Install the dependencies:

- With Yarn: `yarn`
- With NPM: `npm install`

## Running in Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

## Running the app in Production

To start the app in "production" mode use:

```bash
yarn start
```

---

# Deployment / Packaging

## Packaging without a debug console

To package apps for the local platform:

```bash
yarn package
```

## Packaging with the debug console

If your production app isn't working as expected, you can use the `DEBUG_PROD` env variable to build the necessary files and then start the app. It isn't necessary to package the app:

```bash
yarn cross-env DEBUG_PROD=true yarn build && yarn cross-env DEBUG_PROD=true yarn start
```

## Distribution

### Windows

- Zip up `release/Now Playing Setup X.X.X.exe` and upload that to the Now Playing
  website.

- Zip up `release/Now Playing Setup X.X.X.dmg` and upload that to the Now Playing
  website.
---

# Project Philosophy

## Ease-of-Use Over Customization

- Prioritized ease of use (see below) over the ability to customize.
- The app should mostly figure things out on it's own. Like finding the
  right database files, or in the case of Pioneer + ProDJ-link, detect DJ
  equipment and try to "just-work".
- Take the "Apple" approach: Things should look and feel simple while
  sacrificing some ability to customize.

## Ease-of-Use over Update Latency

- Try not to require the user to need extra installation steps outside
  of installing the app if neceesary. The trade off is you sacrifice update
  latency (like reading from faders instead of waiting for track history to
  update)
- Avoid big differences between the Windows and Mac versions.
- Avoid having to include other binaries in the app. (eg: [RekordBoxSongExporter](https://github.com/Unreal-Dan/RekordBoxSongExporter), [go-stagelinq](https://github.com/icedream/go-stagelinq)). They update often which would require more testing / frequent app updates.
    Unfortunately between work, music, and gigs I don't have much time to provide user support.

## Separate Presentation from App

- Send unified track data to a websocket and do presentation separately.
- No matter what software you use, send track data the same way via websocket
  then let a presentation layer handle how things look.
- The original goal was simply to create a bridge from my CDJ2000nxs2 to
  my Twitch bot.

---

# Who is TRIODE?

I'm a DJ & producer based out of San Francisco, California. My tracks are on
Armada & Blackhole and I've had songs played on ASOT. I tour the US doing shows and livestream on [Twitch](https://twitch.tv/triodeofficial) Friday and Sunday when I'm not.
By day, I'm a [software engineer](https://www.linkedin.com/in/iamchrisle/).

- [Apple Music](https://music.apple.com/us/artist/triode/1278678740)
- [Facebook](https://facebook.com/triodeofficial)
- [Instagram](https://instagram.com/triodeofficial)
- [SoundCloud](https://soundcloud.com/triodeofficial)
- [Spotify](https://open.spotify.com/artist/6PeUGjC4XaZD1XysuYogDG)
- [TikTok](https://tiktok.com/@triodeofficial)
- [Twitch](https://twitch.tv/triodeofficial)
- [Twitter](https://twitter.com/triodeofficial)
- [YouTube](https://youtube.com/c/TriodeMusic)


# Shoutouts

- https://github.com/EvanPurkhiser/prolink-connect - For his help with creating
  the library that made ProDJ-Link work, inspiring me to make my app, his
  support with both code and music.
- https://github.com/erikrichardlarson/unbox - Amazing work and I admire his
  level of user support that I don't have enough time to do.
- https://github.com/Bombe - For writing the Shoutcast server code.
- https://github.com/LePopal/PRACT-OBS - For their work at decrypting the
  Rekordbox 6 database.
