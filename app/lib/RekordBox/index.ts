import Blowfish from 'egoroof-blowfish';
const Sqlite3 = require('@journeyapps/sqlcipher');
import os from 'os';
import fs from 'fs';
import { fromRekordbox } from '../../utils/trackdata';

import { AppBus } from '../../utils/appbus';
const appBus = AppBus.instance;

const MAGIC = 'ZOwUlUZYqe9Rdm6j';

const SQL = `
  SELECT
    h.ID,
    h.created_at,
    c.FolderPath,
    c.Title AS TrackTitle,
    c.Subtitle AS SubTitle,
    a.Name AS ArtistName,
    c.ImagePath,
    c.BPM,
    c.Rating,
    c.ReleASeYear,
    c.ReleASeDate,
    c.Length,
    c.ColorID,
    c.Commnt AS TrackComment,
    co.Commnt AS ColorName,
    al.Name AS AlbumName,
    la.Name AS LabelName,
    ge.Name AS GenreName,
    k.ScaleName AS KeyName,
    rmx.Name AS RemixerName,
    c.DeliveryComment AS Message
  FROM djmdSongHistory AS h
  JOIN djmdContent AS c ON h.ContentID = c.ID
  LEFT JOIN djmdColor AS co ON c.ColorID = co.id
  LEFT JOIN djmdArtist AS a ON c.ArtistID = a.ID
  LEFT JOIN djmdArtist AS rmx ON c.RemixerID = rmx.ID
  LEFT JOIN djmdAlbum AS al ON c.AlbumID = al.ID
  LEFT JOIN djmdLabel AS la ON c.LabelID = la.ID
  LEFT JOIN djmdGenre AS ge ON c.GenreID = ge.ID
  LEFT JOIN djmdKey AS k ON c.KeyID=k.ID
  ORDER BY h.created_at DESC
  LIMIT 1`;

// How often to poll the database for an update in seconds.
const POLL_SEC = 10;

export class RekordBox {

  readonly homeDir: string = os.homedir();
  private db: any;
  private interval: any;
  private lastTrackID: string = '';
  private lastdata: any;
  private rekordboxFound: boolean;

  constructor() {
    this.rekordboxFound = false;

  }

  watch() {
    console.log(`Checking if ${this.optionsPath} exists ...`);
    if (fs.existsSync(this.optionsPath)) {
      console.log(`RekordBox 6 found. options.json is in: ${this.optionsPath}`)
      this.rekordboxFound = true;
    } else {
      appBus.eventEmitter.emit('status', 'ERROR: RekordBox 6.0 or higher is required to use Now Playing.')
    }

    if (!this.rekordboxFound) return;
    console.log('Watching Rekordbox DB.');
    appBus.eventEmitter.on('websocket-connected', this.broadcast.bind(this));
    appBus.eventEmitter.on('rekordbox-poll', this.onRekordboxPoll.bind(this));
    this.nowPlaying();
    this.interval = setInterval(async () => {
      console.log('Polling Rekordbox ...');
      this.nowPlaying();
    }, POLL_SEC * 1000);
  }

  unwatch() {
    if (!this.rekordboxFound) return;
    console.log('Unwatching Rekordbox DB.');
    clearInterval(this.interval);
    appBus.eventEmitter.removeListener('rekordbox-poll',
      this.onRekordboxPoll.bind(this));
    appBus.eventEmitter.removeListener('websocket-connected',
      this.broadcast.bind(this));
  }

  private onRekordboxPoll(data: any) {
    const id = data.ID;
    // console.log(data);
    if (id === this.lastTrackID) {
      console.log('No change');
      return;
    }
    this.lastTrackID = id;
    this.lastdata = data;
    this.broadcast();
  }

  private broadcast() {
    appBus.eventEmitter.emit('status', 'Got track ID from Rekordbox history.');
    appBus.eventEmitter.emit('track-update', fromRekordbox(this.lastdata));
  }

  private nowPlaying() {
    console.log(`DBpath = ${this.dbPath}`);
    console.log(`optionsPath = ${this.optionsPath}`);
    console.log(`getDbPath = ${this.getDbPath()}`);
    this.db = new Sqlite3.Database(this.dbPath);
    const decryptedPw = this.decryptPw(this.getEncryptedPw());
    this.db.serialize(() => {
      this.db.run('PRAGMA cipher_compatibility = 3');
      this.db.run(`PRAGMA key = '${decryptedPw}'`);
      this.db.all(SQL, [], (err: any, rows: any) => {
        if (err) {
          console.error(err);
          appBus.eventEmitter.emit('status', err);
          return;
        }
        rows.forEach((row: any) => {
          // NO idea why I can't just data.push(row); resolve(data);.....
          // So this is a bullshit way of doing it.
          appBus.eventEmitter.emit('rekordbox-poll', row);
        });

      });
    });
    this.db.close();
  }

  private get dbPath() {
    return this.getDbPath();
  }

  private get optionsPath() {
    return (process.platform === 'win32')
      ? `${this.homeDir}\\AppData\\Roaming\\Pioneer\\rekordboxAgent\\storage\\options.json`
      : `${this.homeDir}/Library/Application Support/Pioneer/rekordboxAgent/storage/options.json`;
  }

  private getDbPath(): string {
    const f = fs.readFileSync(this.optionsPath);
    const data = JSON.parse(f.toString());
    return data.options.filter((e: any[]) => e[0] === 'db-path')[0][1];
  }

  private getEncryptedPw(): string {
    const f = fs.readFileSync(this.optionsPath);
    const data = JSON.parse(f.toString());
    return data.options.filter((e: any[]) => e[0] === 'dp')[0][1];
  }

  private decryptPw(encryptedPw: string): string {
    const bf = new Blowfish(MAGIC, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
    return bf
      .decode(Buffer.from(encryptedPw, 'base64'), Blowfish.TYPE.STRING)
      .trim();
  }

}
