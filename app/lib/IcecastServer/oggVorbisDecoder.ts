import stream from 'stream';
import { fromTraktor } from '../../utils/trackdata';

import { AppBus } from '../../utils/appbus';
const appBus = AppBus.instance;


function emitTrackUpdate(data: any) {
  console.log('test');
  console.log(data);
  appBus.eventEmitter.emit('track-update', fromTraktor(data));
  appBus.eventEmitter.emit('traktor-connected');
}

export function oggVorbisHandler() {
  const createVorbisDecoder = (onTrackData: any) => {
    const vorbisDecoder = new VorbisDecoder();
    vorbisDecoder.on('track', onTrackData);
    return vorbisDecoder;
  }

  const oggDecoder = new OggDecoder();
  let vorbisDecoder = createVorbisDecoder(emitTrackUpdate);
  let lastOggStream: any = null;

  oggDecoder.on('page', (page) => {
    if (page.stream !== lastOggStream) {
      lastOggStream = page.stream;
      oggDecoder.unpipe(vorbisDecoder);
      vorbisDecoder = createVorbisDecoder(emitTrackUpdate);
      oggDecoder.pipe(vorbisDecoder);
    }
  });
  return oggDecoder;
}

class OggDecoder extends stream.Transform {
  bufferPos = 0;
  pageBuffer = Buffer.alloc(131072, 0);

  _write(chunk: any, encoding: any, callback: any) {
    this.pageBuffer.fill(chunk, this.bufferPos);
    this.bufferPos += chunk.length;
    let capturePatternPos = this.pageBuffer.indexOf("OggS");
    while (capturePatternPos !== -1) {
      const header = this._parseHeader(capturePatternPos);
      if (header && (this.bufferPos >= (capturePatternPos + this._pageLength(header)))) {
        const packetFragmentLength = this._dataLength(header);
        const packetFragmentStart = capturePatternPos + 27 + header.pageSegments;
        const page = new Uint8Array(packetFragmentLength);
        this.pageBuffer.copy(page, 0, packetFragmentStart, packetFragmentStart + packetFragmentLength);
        this.emit("page", { stream: header.streamSerialNumber, page: header.pageSequenceNumber });
        this.emit("data", page);


        this.pageBuffer.copy(this.pageBuffer, 0, packetFragmentStart + packetFragmentLength, this.pageBuffer.length);
        this.pageBuffer.fill(0, this.pageBuffer.length - (packetFragmentStart + packetFragmentLength), this.pageBuffer.length);
        this.bufferPos -= packetFragmentStart + packetFragmentLength;
        capturePatternPos = this.pageBuffer.indexOf("OggS");
      } else {
        break;
      }
    }
    callback();
  }

  _dataLength(header: any) {
    return header.segmentTable.reduce((a: any, b: any) => a + b, 0);
  }

  _pageLength(header: any) {
    return 27 + header.pageSegments + this._dataLength(header);
  }

  _parseHeader(position: any) {
    const streamStructureVersion = this.pageBuffer.readUInt8(position + 4);
    if (streamStructureVersion !== 0) {
      return false;
    }
    const headerTypeFlag = this.pageBuffer.readUInt8(position + 5);
    const granulePosition = this.pageBuffer.readBigUInt64LE(position + 6);
    const streamSerialNumber = this.pageBuffer.readUInt32LE(position + 14);
    const pageSequenceNumber = this.pageBuffer.readUInt32LE(position + 18);
    const pageChecksum = this.pageBuffer.readUInt32LE(position + 22);
    const pageSegments = this.pageBuffer.readUInt8(position + 26);
    const segmentTable = new Uint8Array(pageSegments);
    this.pageBuffer.copy(segmentTable, 0, position + 27, position + 27 + pageSegments);
    return { streamStructureVersion, headerTypeFlag, granulePosition, streamSerialNumber, pageSequenceNumber,
      pageChecksum, pageSegments, segmentTable };
  }

}

class VorbisDecoder extends stream.Writable {

  currentStep = 0
  buffer = Buffer.alloc(131072, 0)
  bufferPos = 0

  _write(chunk: any, encoding: any, callback: any) {


    const b = Buffer.from(chunk);
    console.log(b.toString('utf8'));

    if (this.currentStep < 2) {
      this.buffer.fill(chunk, this.bufferPos);
      this.bufferPos += chunk.length;
    }
    if ((this.currentStep === 0) && (this.bufferPos >= 30)) {
      if (this.buffer.readUInt8(0) !== 1) {
        console.error('header 1 expected');
        callback("header 1 expected");
        return;
      }
      this.currentStep = 1;
      this.buffer.copy(this.buffer, 0, 30, this.buffer.length - 30);
      this.bufferPos -= 30;
    } else {
      const comments = this.readVorbisComment();
      if (comments) {
        this.emit("track", parseComments(comments));
        this.currentStep = 2;
      }
    }
    callback();
  }

  readVorbisComment() {
    const vendorLength = this.buffer.readUInt32LE(7);
    const userCommentListLength = this.buffer.readUInt32LE(11 + vendorLength);
    const userComments = [];
    let currentPos = 15 + vendorLength;
    for (let index = 0; index < userCommentListLength; index++) {
      const commentLength = this.buffer.readUInt32LE(currentPos);
      const comment = this.buffer.toString("UTF-8", currentPos + 4, currentPos + 4 + commentLength);
      userComments.push(comment);
      currentPos += 4 + commentLength;
    }
    if (currentPos > this.bufferPos) {
      return false;
    }
    const framingBit = this.buffer.readUInt8(currentPos);
    if (framingBit !== 1) {
      return false;
    }
    if ((this.buffer.readUInt8(0) !== 3) || (this.buffer.toString("UTF-8", 1, 7) !== "vorbis")) {
      return false;
    }
    return userComments;
  }

}

const parseComments = (comments: any) => {
  console.log(comments);
  const commentObject: any = {}
  comments
    .map((c: any) => c.split("="))
    .map((c: any) => [c[0].toLowerCase(), c.filter((_: any, i: number) => i > 0).join("=")])
    .forEach((c: any) => commentObject[c[0]] = c[1])
  return commentObject
}