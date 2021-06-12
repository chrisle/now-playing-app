import * as fs from "fs";
import * as os from "os";
import * as pathLib from "path";
import moment from 'moment';

type ChunkDataType = string | Chunk[] | number | Date;

/**
 * Datastructure for saving Dom Objects
 */
class Chunk {
  public data?: ChunkDataType;
  public length: number = 0;
  public tag: string;

  public constructor(length: number, tag: string, data?: ChunkDataType) {
    this.length = length;
    this.tag = tag;
    this.data = data;
  }
}


/**
 * Interface for song data in sessions
 */
export interface Song {
  title: string,
  artist: string,
  filePath: string,
  bpm?: number,
}
/**
 * Interface for song data in sessions
 */
export interface HistorySong extends Song {
  startTime: any,
  played: any,
  playTime: any,
  playing: boolean,
  deck: number,
}

/**
 * Interface for session data
 */
export interface Session {
  date: string,
  songs: HistorySong[]
}

/**
 * Converts a 4 byte string into a integer
 * @param {string} s 4 byte string to be converted
 */
export function getUInt32FromString(s: string) {
  return (
    (s.charCodeAt(0) << 24) +
    (s.charCodeAt(1) << 16) +
    (s.charCodeAt(2) << 8) +
    s.charCodeAt(3)
  );
}

/**
 * Converts a 4 byte integer into a string
 * @param {number} n 4 byte integer
 */
export function getStringFromUInt32(n: number) {
  return (
    String.fromCharCode(Math.floor(n / (1 << 24)) % 256) +
    String.fromCharCode(Math.floor(n / (1 << 16)) % 256) +
    String.fromCharCode(Math.floor(n / (1 << 8)) % 256) +
    String.fromCharCode(Math.floor(n) % 256)
  );
}

/**
 * Returns a single buffer and fills in data tag recursivly
 * @param {Buffer} buffer A node.js fs buffer to read from
 * @param {number} index index of first byte
 * @returns {Promise<{ chunk: Chunk; newIndex: number }>} Promise with object for destructured assignment. New Index is the index of the following chunk
 */
async function parseChunk(
  buffer: Buffer,
  index: number
): Promise<{ chunk: Chunk; newIndex: number }> {
  const tag = getStringFromUInt32(buffer.readUInt32BE(index));
  const length = buffer.readUInt32BE(index + 4);
  let data;
  switch (tag) {
    case "oses": // Structure containing a adat session object
    case "oent": // Structure containing a adat song object
    case "otrk": // Structure containing a ttyp song object
    case "adat": // Strcuture containg an array of chunks
      data = await parseChunkArray(buffer, index + 8, index + 8 + length);
      break;

    case "\u0000\u0000\u0000\u0001":

    case "\u0000\u0000\u0000\u000f": // BPM
      // 00 00 00 0F 00 00 00 04 00 00 00 84 == 132 bpm
      data = buffer.readUInt32BE(index + 8);
      break;

    case "\u0000\u0000\u0000\u001c": // starttime
      const secondsSince1970 = buffer.readUInt32BE(index + 8);
      data = new Date(0);
      data.setUTCSeconds(secondsSince1970);
      break;

    // case "\u0000\u0000\u0000\u0013": // grouping
    // case "\u0000\u0000\u0000\u0015": // label
    // case "\u0000\u0000\u0000\u0017": // year

    case "\u0000\u0000\u0000\u001f": // deck
      // 00 00 00 1F 00 00 00 04 00 00 00 01 === deck #1
      // 00 00 00 1F 00 00 00 04 00 00 00 02 === deck #2
      data = buffer.readUInt32BE(index + 8);
      break;

    // case "\u0000\u0000\u00000": // session id
    //   data = buffer.readUInt8(index + 8);
    //   break;

    case "\u0000\u0000\u00002": // played
      // 00 00 00 32 00 00 00 01 01 ===  True
      data = buffer.readUInt8(index + 8);
      break;

    // case "\u0000\u0000\u00003": // key
    // case "\u0000\u0000\u00004": // added
    // case "\u0000\u0000\u00005": // updated at

    case "\u0000\u0000\u0000-": // playtime
      const playtime = buffer.readUInt32BE(index + 8);
      data = new Date(0);
      data.setUTCSeconds(playtime);
      break;

    default:
      data = buffer
        .toString("latin1", index + 8, index + 8 + length)
        .replace(/\0/g, "");
      break;
  }
  return {
    chunk: new Chunk(length, tag, data),
    newIndex: index + length + 8
  };
}

/**
 * Reads in a ongoing list of serato chunks till the maximum length is reached
 * @param {Buffer} buffer A node.js fs buffer to read from
 * @param {number} start Index of the first byte of the chunk
 * @param {number} end Maximum length of the array data
 * @returns {Promise<Chunk[]>} Array of chunks read in
 */
async function parseChunkArray(
  buffer: Buffer,
  start: number,
  end: number
): Promise<Chunk[]> {
  const chunks = [];
  let cursor = start;
  while (cursor < end) {
    const { chunk, newIndex } = await parseChunk(buffer, cursor);
    cursor = newIndex;
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Returns the raw domtree of a serato file
 * @param {string} path The path to the file that shoud be parsed
 * @returns {Promise<Chunk[]>} Nested object dom
 */
export async function getDomTree(path: string): Promise<Chunk[]> {
  const buffer = await fs.promises.readFile(path);
  const chunks = await parseChunkArray(buffer, 0, buffer.length);

  return chunks;
}

/**
 * Reads in a history.databases file
 * @param {string} path Path to the history.database file
 * @returns {Promise<{ [Key: string]: number }>} A dictonary with the number of the session file for every date
 */
export async function getSessions(
  path: string
): Promise<{ [Key: string]: number }> {
  const buffer = await fs.promises.readFile(path);
  const chunks = await parseChunkArray(buffer, 0, buffer.length);

  const sessions: { [Key: string]: number } = {};
  chunks.forEach(chunk => {
    if (chunk.tag === "oses") {
      if (Array.isArray(chunk.data)) {
        if (chunk.data[0].tag === "adat") {
          if (Array.isArray(chunk.data[0].data)) {
            let date = "";
            let index = -1;
            chunk.data[0].data.forEach(subChunk => {
              if (subChunk.tag === "\u0000\u0000\u0000\u0001") {
                index = subChunk.data as number;
              }
              if (subChunk.tag === "\u0000\u0000\u0000)") {
                date = subChunk.data as string;
              }
            });
            sessions[date] = index;
          }
        }
      }
    }
  });
  return sessions;
}

/**
 * Reads in a serato session file.
 * @param {string} path Path to *.session file
 * @returns {Promise<SessionSong[]>} An array containing title and artist for every song played
 */
export async function getSessionSongs(
  path: string
): Promise<HistorySong[]> {
  const buffer = await fs.promises.readFile(path);
  const chunks = await parseChunkArray(buffer, 0, buffer.length);

  const songs: HistorySong[] = [];

  chunks.forEach(chunk => {
    if (chunk.tag === "oent") {
      if (Array.isArray(chunk.data)) {
        if (chunk.data[0].tag === "adat") {
          if (Array.isArray(chunk.data[0].data)) {
            let title = "";
            let artist = "";
            let bpm;
            let filePath = "";
            let startTime;
            let played;
            let playTime;
            let playing;
            let deck = 0;

            chunk.data[0].data.forEach(subChunk => {
              if (subChunk.tag === "\u0000\u0000\u0000\u0006") {
                title = subChunk.data as string;
              }
              if (subChunk.tag === "\u0000\u0000\u0000\u0007") {
                artist = subChunk.data as string;
              }
              if (subChunk.tag === "\u0000\u0000\u0000\u000f") {
                bpm = subChunk.data as number;
              }
              if (subChunk.tag === "\u0000\u0000\u0000\u0002") {
                filePath = subChunk.data as string;
              }
              if (subChunk.tag === "\u0000\u0000\u0000\u001c") {
                startTime = subChunk.data as Date;
              }

              if (subChunk.tag === "\u0000\u0000\u00002") {
                played = subChunk.data as number;
              }
              if (subChunk.tag === "\u0000\u0000\u0000\u001f") {
                deck = subChunk.data as number;
              }

              if (subChunk.tag === "\u0000\u0000\u0000-") {
                playTime = subChunk.data as Date;
              }

            });
            // console.log(chunk.data[0].data); // For Development

            if (played) {
              // Played means that it was added to the history.
              // But it doesn't mean the DJ played the song yet.
              if (playTime) {
                // If we have a playtime, it means the DJ had played the
                // song and ejected it.
                playing = false;
              } else {
                // If we don't have a playtime, it mean the DJ has the
                // song in the deck but not necessarily that it's playing
                playing = true
              }
            } else {
              playing = false
            }

            songs.push({ title, artist, bpm, filePath, startTime, played, playTime, playing, deck });
          }
        }
      }
    }
  });
  return songs;
}

/**
 * Gets all songs of the database v2 serato file
 * @param {string} path path to database v2 serato file
 */
export async function getSeratoSongs(path: string) {
  const buffer = await fs.promises.readFile(path);
  const chunks = await parseChunkArray(buffer, 0, buffer.length);

  const songs: Song[] = [];

  chunks.forEach(chunk => {
    if (chunk.tag === "otrk") {
      if (Array.isArray(chunk.data)) {
        let title = "";
        let artist = "";
        let bpm;
        let filePath = "";
        chunk.data.forEach(subChunk => {
          if (subChunk.tag === "tsng") {
            title = subChunk.data as string;
          }
          if (subChunk.tag === "tart") {
            artist = subChunk.data as string;
          }
          if (subChunk.tag === "tbpm") {
            bpm = subChunk.data as string;
          }
          if (subChunk.tag === "pfil") {
            filePath = subChunk.data as string;
          }
        });
        songs.push({ title, artist, bpm, filePath });
      }

    }
  });

  return songs;
}

/**
 * Reads all sessions and played songs from the _Serato_ folder
 * @param {string} seratoPath path to _Serato_ folder (including _Serato_)
 * @returns {Promise<Session[]>} list of sessions including songs
 */
export async function getSeratoHistory(seratoPath: string): Promise<Session[]> {
  const path = pathLib.join(seratoPath, 'History/history.database');
  const sessions = await getSessions(path)
  // console.log('sessions', sessions);
  const result: Session[] = []

  for (const key in sessions) {
    if (sessions.hasOwnProperty(key)) {
      const session = sessions[key];
      const songlist = await getSessionSongs(pathLib.join(seratoPath, 'History/Sessions/', session + '.session'))
      result.push({ date: key, songs: songlist })
    }
  }
  return result;
}

/**
 * Returns the default path to the _serato_ folder of the user
 * @returns {string} path to _serato_ folder
 */
export function getDefaultSeratoPath(forcedDir?: string): string {
  if (forcedDir) return forcedDir;
  return pathLib.join(os.homedir(), 'Music/_Serato_/');
}


// =====================================================

type Deck = {
  state: HistorySong | null;
  playing: boolean;
}

export class SeratoNowPlaying {

  private decks: Deck[] = [];
  private path: string;

  constructor(forcedPath?: string) {
    this.path = getDefaultSeratoPath(forcedPath);
    for (let i = 0; i < 4; i++) {
      this.decks.push({
        state: null,
        playing: false
      });
    }
  }

  /**
   * Determine the currently playing song.
   * @param forcedDir
   */
  async nowPlaying(): Promise<Song | null> {
    const session = await this.getCurrentSession();
    if (!session) {
      console.log('no current session');
      return null;
    }

    this.assignDecks(session);

    // First determine which decks are lodaded and possibly playing.
    for (let i = 0; i < 4; i++) {
      const deck = this.decks[i];
      if (!deck.state) continue;

      // This deck has a track has a track loaded but may or may not be playing.
      if (deck.state.startTime && !deck.state.playTime) {
        deck.playing = true;
      }

      // This deck has a marked playtime which means it has definitely stopped
      // playing.
      if (deck.state.startTime && deck.state.playTime) {
        deck.playing = false;
      }
    }

    // Second, if more than one deck is possibly playing, choose the one
    // that has the older startTime.
    let playingDecks = this.decks.filter(d => d.playing);

    if (playingDecks.length > 1) {
      // Return the oldest playing track
      playingDecks.sort((a, b) => {
        return a.state!.startTime - b.state!.startTime
      })[0];
    }
    // return the only playing track
    if (playingDecks.length) return playingDecks[0].state;
    // return null for nothing playing.
    return null;

  }

  private assignDecks(session: HistorySong[]) {
    for (const song of session) {
      this.decks[song.deck - 1] = {
        state: song,
        playing: song.playing
      }
    }
  }

  /**
   * Get most recent session from the history.
   *
   * @param history
   * @returns
   */
  private async getCurrentSession(): Promise<HistorySong[] | null> {
    const history = await getSeratoHistory(this.path);
    let output = null;
    for (const session of history) {
      // TODO: Actually determine which one is the latest date.
      output = session.songs;
    }
    return output;
  }

}
