import net from 'net';
import { oggVorbisHandler } from './oggVorbisDecoder';

const PORT = 8000;

export class IcecastServer {

  constructor() {
    this.createServer();
  }

  private createServer() {
    net.createServer(socket => {
      const dataBuffer = Buffer.alloc(65536);
      let dataBufferIndex = 0;
      let headerComplete = false;

      const oggDecoder = oggVorbisHandler();
      const linebreak = Buffer.from([13, 10]);

      socket.on("data", data => {
        // const b = Buffer.from(data);
        // console.log(b.toString('utf8'));

        const copied = data.copy(dataBuffer, dataBufferIndex);
        dataBufferIndex += copied;
        if (!headerComplete) {
          let offset;
          while ((offset = dataBuffer.indexOf(linebreak)) !== -1) {
            const headerLine = dataBuffer.slice(0, offset);
            if (headerLine.length === 0) {
              headerComplete = true;
              socket.write("HTTP/1.0 200 OK\r\n\r\n");
              socket.pipe(oggDecoder);
            } else {
              const lineArray = new Uint8Array(headerLine.length);
              headerLine.copy(lineArray, 0, 0, headerLine.length);
            }
            dataBuffer.copy(dataBuffer, 0, offset + 2);
            dataBufferIndex -= offset + 2;
          }
        }
      });
    }).listen(PORT);
  }

}