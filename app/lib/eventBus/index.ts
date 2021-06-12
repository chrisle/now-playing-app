import events from 'events';

export class EventBus {

  private static _instance: EventBus;
  static get instance(): EventBus {
    return this._instance || (this._instance = new this());
  }

  eventEmitter: events.EventEmitter;

  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }
}