import fs from 'fs';
import { app, remote } from 'electron';

function getSetting(settingName: string, defaultValue: string) {
  return () => {
    const setting = localStorage.getItem(settingName);
    if (!setting) {
      localStorage.setItem(settingName, defaultValue);
      return defaultValue;
    }
    return setting;
  }
}

function setSetting(settingName: string, value: string) {
  localStorage.setItem(settingName, value);
  console.log(`Set "${settingName}": ${value}`);
}

// ===================================

export function getDelay() {
  return getSetting('delay', '0')();
}

export function setDelay(delay: string) {
  setSetting('delay', delay);
}

export function getHideIds() {
  return (getSetting('hideIds', 'true')() === 'true');
}

export function setHideIds(hide: boolean) {
  setSetting('hideIds', ((hide) ? 'true': 'false'));
}

/**
 * Return the current theme or Default if not found.
 */
export function getTheme() {
  const availableThemes = getAvailableThemes();
  const theme = getSetting('theme', 'Default')();
  if (availableThemes.includes(theme)) return theme;
  console.log(`The theme "${theme}" was not found. Using default theme.`);
  setTheme('Default');
  return 'Default';
}

export function setTheme(theme: string) {
  setSetting('theme', theme);
}

export function getAutoPlaylist() {
  return (getSetting('autoPlaylist', 'true')() === 'true');
}

export function setAutoPlaylist(value: boolean) {
  setSetting('autoPlaylist', ((value) ? 'true': 'false'));
}

export function getHideNotes() {
  return (getSetting('hideNotes', 'true')() === 'true');
}

export function setHideNotes(disable: boolean) {
  setSetting('hideNotes', ((disable) ? 'true': 'false'));
}

export function getStartScreen() {
  return getSetting('startScreen', 'None')();
}

export function setStartScreen(screen: string) {
  return setSetting('startScreen', screen);
}

export function getTracklistDir() {
  return getSetting('tracklistDir', remote.app.getPath('desktop'))();
}

export function setTracklistDir(dir: string) {
  return setSetting('tracklistDir', dir);
}

export function getForceOnAir() {
  return (getSetting('forceOnAir', 'false')() === 'true');
}

export function setForceOnAir(value: boolean) {
  setSetting('forceOnAir', ((value) ? 'true': 'false'));
}


export function themePath() {
  const home = remote.app.getPath('home');
  return (process.platform === 'win32')
    ? `${home}\\Now Playing Themes`
    : `${home}/Now Playing Themes`;
}

export function getAvailableThemes(): string[] {
  const themes = fs.readdirSync(themePath(), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
  return themes;
}

/**
 * Gets path to the custom theme directory. Create if necessary.
 */
export function getCustomThemeDir() {
  const home = app.getPath('home');
  const path = (process.platform === 'win32')
    ? `${home}\\Now Playing Themes`
    : `${home}/Now Playing Themes`;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  return path;
}
