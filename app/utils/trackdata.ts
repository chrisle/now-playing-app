import { getHideIds, getHideNotes } from './settings';

export type TrackData = {
  id?: string;
  title?: string;
  artist?: string;
  bpm?: number;
  rating?: number;
  length?: number;
  comment?: string;
  key?: string;
  currentBpm?: number;
  label?: string;
}

export function fromRekordbox(data: any): TrackData {
  const output = {
    id: data.ID,
    title: maybeRemoveNotesFromTitle(`${data.TrackTitle}${data.SubTitle ? ' (' + data.SubTitle + ')': ''}`),
    subtitle: data.SubTitle,
    artist: data.ArtistName,
    bpm: data.BPM / 100,
    rating: data.Rating,
    length: data.length,
    comment: data.TrackComment,
    key: data.Key,
    currentBpm: 0,
    label: data.LabelName
  };
  return maybeHideIds(output);
}

export function fromProlink(data: any): TrackData {
  const output = {
    id: '',
    title: '',
    artist: '',
    bpm: 0,
    rating: 0,
    length: 0,
    comment: '',
    key: '',
    currentBpm: 0,
    label: ''
  } as TrackData;

  if (data && data.track) {
    output.id = data.track.id;
    output.title = maybeRemoveNotesFromTitle(data.track.title);
    output.bpm = data.track.tempo;
    output.rating = data.track.rating;
    output.length = data.track.duration;
    output.comment = data.track.comment;

  }

  // Handle when someone does not have key analysis enabled in Rekordbox
  if (data && data.track && data.track.key)
    output.key = data.track.key.name;

  if (data && data.track && data.track.tempo)
    output.currentBpm = (data.track.tempo) +
      (data.track.tempo * (data.currentState?.effectivePitch / 100));

  // artist or artist.name could be null when exporting USB sticks from Rekordbox 5
  if (data && data.track && data.track.artist && data.track.artist.name)
    output.artist = data.track.artist.name;

  if (data && data.track && data.track.label && data.track.label.name)
    output.label = data.track.label.name;

  return maybeHideIds(output);
}

export function fromTraktor(data: any): TrackData {
  const title = (data.title) ? maybeRemoveNotesFromTitle(data.title) : '';
  const artist = (data.artist) ? data.artist: '';
  const output = {
    id: '',
    title: title,
    artist: artist,
    bpm: 0,
    rating: 0,
    length: 0,
    comment: '',
    key: '',
    currentBpm: 0
  };
  return maybeHideIds(output);
}

export function fromSerato(data: any): TrackData {
  const title = (data.title) ? maybeRemoveNotesFromTitle(data.title) : '';
  const artist = (data.artist) ? data.artist : '';
  const bpm = (data.bpm) ? data.bpm : 0;
  const output = {
    id: '',
    title: title,
    artist: artist,
    bpm: bpm,
    rating: 0,
    length: 0,
    comment: '',
    key: '',
    currentBpm: 0,
    label: ''
  };
  return maybeHideIds(output);
}

function maybeHideIds(data: TrackData): TrackData {
  console.log(`[TRACKDATA] Hide ids: ${getHideIds()}`);
  console.log(`[TRACKDATA] ${data!.title!}`);
  console.log(`[TRACKDATA] test id: ${(/\[ID\]/.test(data!.title!))}`);
  if (getHideIds() && (/\[ID\]/.test(data!.title!))) {
    return {
      id: '',
      title: 'ID',
      artist: '',
      bpm: 0,
      rating: 0,
      length: 0,
      comment: '',
      key: '',
      currentBpm: 0,
      label: ''
    } as TrackData
  }
  return data;
}

function maybeRemoveNotesFromTitle(title: string): string {
  if ((/\[ID\]/.test(title))) return title;
  if (getHideNotes() && title) return title.replace(/\[.*\]/, '');
  return title;
}
