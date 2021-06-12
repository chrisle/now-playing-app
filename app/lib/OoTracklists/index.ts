import { AppBus } from '../../utils/appbus';
import { getAutoPlaylist, getTracklistDir } from '../../utils/settings';
import { TrackData } from '../../utils/trackdata';
import fs from 'fs';
import moment from 'moment';
import path from 'path';

const appBus = AppBus.instance;

export class OoTracklists {

  private static _instance: OoTracklists;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  currentTrackNo: number = 1;
  private startDateTime: string;
  private filename: string;

  constructor() {
    this.startDateTime = moment().format('YYYY-MM-DD_HH_mm')
    appBus.eventEmitter.on('track-update', this.addTrack.bind(this));
    this.filename = `${this.startDateTime}_tracklist.txt`;
    console.log(`Started tracklist file: ${this.filename}`);
  }

  addTrack(track: TrackData) {
    if (!getAutoPlaylist()) return;
    const basePath = getTracklistDir();
    const filePath = path.join(basePath, this.filename);
    let data = `${this.currentTrackNo}. ${track.artist} - ${track.title}`;
    if (track.label) data += ` [${track.label}]`;
    data += '\n';

    fs.appendFile(filePath, data, { encoding: 'utf8' }, (err) => {
      if (err) console.error(err);
    });

    console.log('Wrote to tracklist file:', data);
    this.currentTrackNo += 1;
  }

}
