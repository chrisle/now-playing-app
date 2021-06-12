import { bringOnline } from 'prolink-connect';
import { ProlinkNetwork } from 'prolink-connect/lib/types';
import { Processor } from './processor';
import { debounce } from '../../utils/debounce';
import * as dgram from 'dgram';

import { AppBus } from '../../utils/appbus';
const appBus = AppBus.instance;

export class ProlinkDj {

  network: ProlinkNetwork | null = null;

  // true = use master. false = use on-air
  private useMaster: boolean = true;
  private discoveredDevices: string[] = [];

  constructor() {
    console.log('Starting Prolink-DJ');
  }

  /**
   * Start ProLink-DJ network.
   */
  async start() {
    console.log('Bringing up Pro-DJ link network ...');
    try {
      this.network = await bringOnline();
      console.log('Network online, preparing to connect ...');

      this.network.deviceManager.on('connected', (d) => {
        console.log('Device discovered', d);
        appBus.eventEmitter.emit('new-device', d);

        this.handleDeviceDiscovery(d.name);

      });
      console.log('Autoconfiguring network ... waiting for devices.');

      await this.network.autoconfigFromPeers();
      console.log('Autoconfigure successfull!');

      this.network.connect();
      if (!this.network.isConnected()) {
        console.log('Failed to connect to the network');
        return;
      }
      console.log('Network connected!');
      appBus.eventEmitter.emit('status', 'Connected to Pro-DJ Link. Waiting for a track to be loaded ...');

      this.network.localdb.on('hydrationDone', this.hydrationDone.bind(this));
      this.network.localdb.on('hydrationProgress', this.hydrationProgress.bind(this));
      this.network.localdb.on('fetchProgress', this.fetchProgress.bind(this));

      // TODO: Introduce a timeout check. If it takes too long to finish
      // hydrating introduce a warning that maybe there are too many
      // tracks or the USB might be corrupt and the user should re-export
      // from Rekordbox.

      // Handle status update from the CDJs
      const processor = new Processor(this.network);
      this.network.statusEmitter.on('status', (state: any) => {
        processor.handleState(state, this.useMaster);
      });

    } catch(e) {
      if (/ADDRINUSE.*:50000/.test(e)) {
        // Note: https://blt-guide.deepsymmetry.org/beat-link-trigger/0.6.2/readme#_other_port_conflicts
        appBus.eventEmitter.emit('status', 'Port 50000 is unavailable. Please close Rekordbox and restart.');
        console.log('Port 50000 is in use.');
      } else {
        console.log(e);
        throw new Error(e);
      }
      // process.exit(1);
    }
  }

  /**
   * Update this.useMaster depending on what devices are discovered.
   */
  private handleDeviceDiscovery(name: string) {
    this.discoveredDevices.push(name);
    if (this.discoveredDevices.length < 2) return;

    const deviceListContains = (regex: RegExp) => {
      return !!this.discoveredDevices.filter(n => regex.test(n)).length;
    }

    const hasOnAirSupport = deviceListContains(/DJM-2000|DJM-\d+nexus|CDJ-2000/);
    const hasMasterSupport = deviceListContains(/CDJ-\d+NXS\d?/);

    // If we find two or more CDJ's with Nexus, prefer master.
    if (hasMasterSupport) {
      appBus.eventEmitter.emit('status', `Found two or more CDJs with Nexus support.`);
      this.useMaster = true;
      return;
    }

    // If we have a mixer with on-air support + non-nexus CDJs, prefer on-air.
    // Mixers with on-air support is DJM-2000 & DJM-900nexus, etc.
    if (hasOnAirSupport && !hasMasterSupport) {
      appBus.eventEmitter.emit('status', `Found Nexus mixer with non-Nexus CDJs.`);
      this.useMaster = false;
      return;
    }

    // "rekordbox" (reports when you use export link mode)
  }

  async disconnect() {
    if (this.network) this.network.disconnect();
  }

  /**
   * Show network fetch progress
   * @param status Status
   */
  private fetchProgress(status: any) {
    const { read, total } = status.progress;
    console.log(`Downloading USB db: ${read} of ${total} bytes`);
    const percent = ((read / total) * 100).toFixed(1);
    debounce((msg: string) => {
      appBus.eventEmitter.emit('status', msg);
    }, 1000)(`Reading USB (${total} bytes): ${percent}% ...`);
  }

  /**
   * Show database creation progress
   * @param status Status
   */
  private hydrationProgress(status: any) {
    const { table, total, complete } = status.progress;
    console.log(`Creating memory cache table: ${table} (${complete} / ${total})`);
    if (/^playlist/.test(table)) {
      const percent = ((complete / total) * 100).toFixed(1);
      if (complete < total) {
        debounce((msg: string) => {
          appBus.eventEmitter.emit('status', msg);
        }, 1000)(`Processing ${total} tracks: ${percent}% ...`);
      }
    }
  }

  /**
   * Notify other stuff that the ProLink-DJ network is ready.
   */
  private hydrationDone() {
    setTimeout(() => {
      console.log('Memory cache loaded.');
      appBus.eventEmitter.emit('status', 'Pro-DJ Link is ready!')
    }, 1000);
  }

}

export function isRekordboxOpen() {
  const socket = dgram.createSocket('udp4');
  try {
    console.log('Checking port 50000');
    socket.bind(50000);
    socket.close();
  } catch(e) {
    console.log('Cannot bind to port 50000');
    return true;
  }
  console.log('UDP Socket bound to port 50000');
  return false;
}
