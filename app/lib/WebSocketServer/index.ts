import * as WebSocket from 'ws';
import { AppBus } from '../../utils/appbus';
import { TrackData } from '../../utils/trackdata';
import { getDelay } from '../../utils/settings';

const appBus = AppBus.instance;

export const PORT = 9090;

export class WebSocketServer {

  private static _instance: WebSocketServer;
  static get instance(): WebSocketServer {
    return this._instance || (this._instance = new this());
  }

  wss: WebSocket.Server;

  constructor() {
    localStorage.removeItem('ws-error');
    this.wss = new WebSocket.Server({ port: PORT });
    console.log(`WebSocket to OBS listening on port ${PORT}`);
    this.wss.on('connection', this.onConnection.bind(this));
    this.wss.on('error', this.onError.bind(this));
    appBus.eventEmitter.on('track-update', this.sendTrackUpdate.bind(this));
  }

  disconnect() {
    this.wss.close();
  }

  onConnection(ws: WebSocket) {
    console.log('WebSocket client connected.');
    appBus.eventEmitter.emit('websocket-connected');
    ws.on('message', this.onMessage.bind(this));
  }

  onMessage(dataStr: WebSocket.Data) {
    const data = JSON.parse(dataStr.toString());
    console.log('[Websocket RX]:', data);
    if (data.event === 'ping' || data.event === 'cp-ping') {
      this.ping.bind(this);
    }
    appBus.eventEmitter.emit(data.event, data.args);
  }

  onError(error: any) {
    if (/already in use/.test(error)) {
      localStorage.setItem('ws-error', 'Port 9090 is already in use.');
    }
    console.log(error);
  }

  ping() {
    this.wss.clients.forEach(client => {
      client.send('pong');
    });
  }

  sendTrackUpdate(data: TrackData) {
    const delay = parseInt(getDelay());
    if (delay) console.log(`Delaying update by ${delay} seconds ...`);
    setTimeout(() => {
      this.wss.clients.forEach(client => {
        client.send(JSON.stringify(data));
      });
    }, delay * 1000);
  }

}