import * as fs from "fs";
import * as os from "os";
import * as pathLib from "path";

import { parse } from 'plist';

import { Song } from './historyReader';



/**
 * Gets all songs of the iTunesLibrary file
 * @param {string} path path to `iTunes Music Library.xml` 
 */
export async function getITunesSongs(path: string) {
    const iTunes = parse((await fs.promises.readFile(path)).toString()).valueOf() as { Tracks: { [Key: string]: { 'Name': string | undefined, 'Artist': string | undefined, 'Location': string | undefined, 'BPM': string | undefined } } };

    const songs: Song[] = [];

    Object.keys(iTunes.Tracks).forEach((key) => {
        const iTunesSong = iTunes.Tracks[key]
        if (iTunesSong.Artist && iTunesSong.Name && iTunesSong.Location) {
            songs.push({ title: iTunesSong.Name, artist: iTunesSong.Artist, filePath: decodeURIComponent(iTunesSong.Location.substr(7)), bpm: iTunesSong.BPM ? Number(iTunesSong.BPM) : undefined });
        }
    })

    return songs;
}


/**
 * Returns the default path to the iTunes Music Library.xml of the user
 * @returns {string} path to iTunes Music Library.xml
 */
export function getDefaultITunesLibraryPath(): string {
    return pathLib.join(os.homedir(), 'Music/iTunes/iTunes Music Library.xml');
}
