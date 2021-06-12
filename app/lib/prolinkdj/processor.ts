import { ProlinkNetwork } from 'prolink-connect/lib/types';
import { fromProlink } from '../../utils/trackdata';
import { getForceOnAir } from '../../utils/settings';
import moment from 'moment';

import { AppBus } from '../../utils/appbus';
const appBus = AppBus.instance;

type DeviceID = number;
type State = any;

type DeckState = {
  state: State | null;
  lastUpdate: string;
  playing: boolean;
};

class DeckStates {

  deckState: DeckState[] = [];
  private lastMaster: number;

  constructor() {
    this.lastMaster = 0;
    const now = moment().toISOString();
    for (let i = 0; i < 4; i++) {
      this.deckState.push({
        state: null,
        lastUpdate: now,
        playing: false
      })
    }
  }

  update(deck: number, playing: boolean, state: State): [state: boolean, deck: number] {
    if (this.deckState[deck].playing == playing) return [false, this.lastMaster];

    const now = moment().toISOString();
    this.deckState[deck].playing = playing;
    this.deckState[deck].lastUpdate = now;
    this.deckState[deck].state = state;

    console.log(`[Deck] ${deck} set to ${playing} at ${now}`);
    console.log(this.deckState);

    const master = this.determineMaster();
    if (master !== this.lastMaster) {
      this.lastMaster = master;
      console.log(`Master: ${this.lastMaster}`);
      return [true, this.lastMaster];
    }

    return [false, this.lastMaster];
  }

  /**
   * Return the deck number that is considered the "master"
   */
  private determineMaster() {
    let master = -1;
    for (let i = 0; i < 4; i++) {
      if (this.deckState[i].playing) {
        if (master < 0) {
          master = i;
        } else {
          if (this.deckState[i].lastUpdate < this.deckState[master].lastUpdate) {
            master = i;
          }
        }
      }
    }
    return master + 1;
  }

}

export class Processor {

  private lastState = new Map<DeviceID, State>();
  private network: ProlinkNetwork;
  private lastInfo: any;
  private deckStates: DeckStates;

  constructor(network: ProlinkNetwork) {
    this.network = network;
    this.lastInfo = null;
    this.deckStates = new DeckStates();
    appBus.eventEmitter.on('websocket-connected', this.broadcast.bind(this));
  }

  /**
   * Handle state changes from the CDJs.
   * @param currentState Current state of the CDJs
   */
  async handleState(currentState: State, useMaster: boolean) {
    const { deviceId, isMaster, isOnAir } = currentState;

    let lastState = this.lastState.get(deviceId);

    // Set the state for the first time.
    if (lastState === undefined) {
      this.lastState!.set(deviceId, currentState);
      lastState = this.lastState.get(deviceId);
    }

    if (!getForceOnAir() && useMaster) {
      if (lastState.isMaster !== isMaster) {
        console.log(`[PROCESSOR] Using master.`);
        this.lastState.set(deviceId, currentState);
        if (isMaster) await this.getTrackInfo(currentState);
      }
    } else {
      // Keep track of the current state of the decks
      const [changed, device] = this.deckStates.update(deviceId - 1, isOnAir, currentState);

      if (device > 0 && changed) {
        console.log(`[PROCESSOR] Using on air.`);
        this.lastState.set(deviceId, currentState);
        const changedDevice = this.deckStates.deckState.filter(d =>
          (d.state && d.state.deviceId == device));
        await this.getTrackInfo(changedDevice[0].state);
      }
    }

  }

  /**
   * Update, title, artist, and label and emit an event.
   * @param currentState Current State of the CDJs
   */
  private async getTrackInfo(currentState: State) {
    const { trackDeviceId, trackSlot, trackType, trackId, deviceId } = currentState;
    console.log('Current State', currentState);

    appBus.eventEmitter.emit('status',
      `Requesting track data from Player #${deviceId} ...`);

    if (this.network.db === null)
      throw new Error('Wait. Why is this.network.db null?');

    const track = await this.network.db.getMetadata({
      deviceId: trackDeviceId,
      trackSlot,
      trackType,
      trackId,
    });

    if (!track) {
      appBus.eventEmitter.emit('status', 'No track loaded.');
      return;
    }

    appBus.eventEmitter.emit('status',
      `Received track ID from Player #${deviceId}.`);

    this.lastInfo = {
      currentState: currentState,
      track: track
    };
    this.broadcast();
  }

  broadcast() {
    appBus.eventEmitter.emit('track-update', fromProlink(this.lastInfo));
  }

}