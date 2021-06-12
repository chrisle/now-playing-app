/**
 * OBS Overlay
 */
const SERVER = `ws://${location.hostname}:9090`;

/**
 * Formats the track name.
 * @param {TrackInfo} track
 */
const formatTitle = (track) => {
  if (!track.title) return '';
  return track.title.toUpperCase();
};

/**
 * Formats the track artist.
 * @param {TrackInfo} track
 */
const formatArtist = (track) => {
  if (!track.artist) return '';
  return track.artist.toUpperCase();
};

const formatLabel = (track) => {
  if (!track.label) return '';
  return `[${track.label.toUpperCase()}]`;
};

const updateTrack = (track) => {
  const title = formatTitle(track);
  const artist = formatArtist(track);
  const label = formatLabel(track);
  const titleEl = document.querySelector('#title');
  const artistEl = document.querySelector('#artist');
  const labelEl = document.querySelector('#label');
  const overlay = document.querySelectorAll('.fade');

  if (titleEl.innerHTML === title && artistEl.innerHTML === artist)
    return;

  // Fade out the old track title.
  overlay.forEach((el) => {
    el.style.opacity = 0;
  });

  // Remove now playing
  setTimeout(() => {
    document.querySelector('.now-playing-white').remove();
    document.querySelector('.now-playing-red').remove();
  }, 1000);

  // Show white and red now playing
  setTimeout(() => {
    const white = document.createElement('span');
    white.className = 'now-playing-white';
    white.innerHTML = 'NOW PLAYING';
    document.querySelector('.now-playing-wrapper').appendChild(white);

  }, 1100);
  setTimeout(() => {
    document.querySelector('.now-playing-wrapper').style.opacity = 1;
  }, 1100);

  setTimeout(() => {
    const red = document.createElement('span');
    red.className = 'now-playing-red';
    red.innerHTML = 'NOW PLAYING';
    document.querySelector('.now-playing-wrapper').appendChild(red);
  }, 1400);

  // Show title
  setTimeout(() => {
    titleEl.innerHTML = title;
    titleEl.style.opacity = 1;
  }, 1800);

  // Show artist
  setTimeout(() => {
    artistEl.innerHTML = artist;
    artistEl.style.opacity = 1;
  }, 1900);

  // Show label
  setTimeout(() => {
    labelEl.innerHTML = label;
    labelEl.style.opacity = 1;
  }, 2000);
};

// WebSocket connection to Triode Twitch DJ.
const ws = new WebSocket(SERVER);

// Send heartbeat to Now Playing every 5 seconds.
setInterval(() => {
  const state = ws.readyState;
  if (state === 1) ws.send(JSON.stringify({ event: 'ping' }));
}, 5000);

/**
 * Take in an IPC message from the main process and update the DOM.
 *
 * @param {IpcEvent} event IPC message from the main process
 */
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateTrack({
    title: data.title,
    artist: data.artist,
    label: data.label
  });
};

function test() {
  updateTrack({
    title: 'TITLE ' + Math.random(),
    artist: 'ARTIST',
  });
}