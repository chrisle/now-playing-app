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

const updateTrack = (track) => {
  const title = formatTitle(track);
  const artist = formatArtist(track);
  const titleEl = document.querySelector('#title');
  const artistEl = document.querySelector('#artist');
  const overlay = document.querySelectorAll('.fade');

  if (titleEl.innerHTML === title && artistEl.innerHTML === artist)
    return;

  // Fade out the old track title.
  overlay.forEach((el) => {
    el.style.opacity = 0;
  });

  // Fade in the new track.
  setTimeout(() => {
    titleEl.innerHTML = title;
    artistEl.innerHTML = artist;
    overlay.forEach((el) => {
      el.style.opacity = 1;
    });
  }, 1000);
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
  });
};