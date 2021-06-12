import path from 'path';
import fs from 'fs-extra';
import { remote } from 'electron';

function copyBuiltInThemes() {

  // This is to upgrade users from 1.0 to 1.1 or higher.
  // Also, it will always overwrite the built in themes everytime you
  // start the app.
  console.log('[Migrate] Copying built-in themes to home dir ...');

  // TODO: Skip this step if the directory already exists.

  // Create theme directory if necessary.
  const home = remote.app.getPath('home');
  const themeDir = (process.platform === 'win32')
    ? `${home}\\Now Playing Themes`
    : `${home}/Now Playing Themes`;
  if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir);

  // Get built in themes
  const builtInThemeDir =
    (process.env.NODE_ENV === 'development')
      ? path.resolve(__dirname, '..', 'resources', 'themes')
      : path.resolve(process.resourcesPath, 'themes');

  // Copy built in themes to theme directory. Overwrite if needed!
  fs.copySync(builtInThemeDir, themeDir, { overwrite: true });
}

export function migrate() {
  // const currentVersion = require('../package.json').version;
  copyBuiltInThemes();
}
