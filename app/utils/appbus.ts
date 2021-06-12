import events from 'events';

export class AppBus {

  private static _instance: AppBus;
  static get instance() {
    return this._instance || (this._instance = new this());
  }

  eventEmitter: events.EventEmitter;

  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }


}