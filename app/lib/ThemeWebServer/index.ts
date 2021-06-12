import { getTheme, themePath } from '../../utils/settings';
import fs from 'fs';
import http from 'http';
import path from 'path';

export class ThemeWebServer {

  private static _instance: ThemeWebServer;
  static get instance(): ThemeWebServer {
    return this._instance || (this._instance = new this());
  }

  httpServer: http.Server;

  constructor() {
    this.httpServer = http.createServer((req, res) => {

      // Ignore requests for favicon.ico
      if (req.url && /favicon\.ico/i.test(req.url)) return;

      const theme = getTheme();
      console.log(`Loading theme "${theme}"`);

      const basePath = path.join(themePath(), theme);
      let filePath = `${basePath}${req.url}`;

      if (filePath === `${basePath}/`) {
        filePath = path.join(basePath, 'index.html');
      }

      const extname = path.extname(filePath);
      let contentType = 'text/html';
      switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.ico': contentType = 'image/x-icon'; break;
      }

      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end('', 'utf-8');
          } else {
            res.writeHead(500);
            res.end(err);
            res.end();
          }
          console.error(err);
          res.writeHead(200, { 'Content-Type': contentType });
          return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      });

    });

    this.httpServer.on('error', (error: any) => {
      if (/already in use/.test(error)) {
        localStorage.setItem('ws-error', 'Port 9000 is already in use.');
      }
      console.log(error);
    });
    this.httpServer.listen(9000);
    console.log('Webserver listening on port 9000')
  }

}
