import { fromSerato } from '../../utils/trackdata';
import { AppBus } from '../../utils/appbus';

import { SeratoNowPlaying, Song } from "./historyReader";

const appBus = AppBus.instance;


export class SeratoDj {

  private interval: any;
  private seratoNowPlaying: SeratoNowPlaying;
  private lastSong: Song | null;
  private watching: boolean = false;

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.seratoNowPlaying = new SeratoNowPlaying('/Volumes/chrisle/Music/_Serato_');
    } else {
      this.seratoNowPlaying = new SeratoNowPlaying();
    }
    this.lastSong = null;
    this.watch = this.watch.bind(this);
    this.unwatch = this.unwatch.bind(this);
  }

  watch() {
    try {
      // Check Serato every second.
      setInterval(async () => {
        const nowPlaying = await this.seratoNowPlaying.nowPlaying();

        if (!this.watching) {
          this.watching = true;
          appBus.eventEmitter.emit('status', 'Waiting for next track to be loaded in Serato.');
        }

        // First track gets loaded into a deck, display that.
        if (nowPlaying && !this.lastSong) {
          this.lastSong = nowPlaying;
          appBus.eventEmitter.emit('track-update', fromSerato(nowPlaying));
          appBus.eventEmitter.emit('status', 'Received track data from Serato.');
        }

        // If the currently playing song is different from the last one
        // emit an update.
        if (nowPlaying && this.lastSong!.filePath !== nowPlaying.filePath) {
          this.lastSong = nowPlaying;
          appBus.eventEmitter.emit('track-update', fromSerato(nowPlaying));
          appBus.eventEmitter.emit('status', 'Received track data from Serato.');
        }

      }, 1000);
    } catch (e) {
      console.error(e);
      appBus.eventEmitter.emit('status', `ERROR: ${e}`);
    }
  }

  unwatch() {
    clearInterval(this.interval);
  }

  // private emitTrackUpdate() {
  //
  // }

}