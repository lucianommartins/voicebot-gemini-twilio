import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class StreamService extends EventEmitter {
  constructor(websocket) {
    super();
    this.ws = websocket;
    this.audioBuffer = {};
    this.streamSid = '';
  }

  setStreamSid(streamSid) {
    this.streamSid = streamSid;
  }

  buffer(audio, message) {
    const { id, partialOrder } = message;

    // Inicializa o buffer para o id se ainda não existir
    if (!this.audioBuffer[id]) {
      this.audioBuffer[id] = {
        buffer: {},
        expectedAudioIndex: 0
      };
    }

    // Armazena o áudio no buffer
    this.audioBuffer[id].buffer[partialOrder] = audio;

    // Tenta tocar o próximo áudio na ordem
    this.playNextAudio(id);
  }

  playNextAudio(id) {
    const collection = this.audioBuffer[id];

    // Verifica se o áudio esperado está disponível no buffer
    while (collection.buffer[collection.expectedAudioIndex]) {
      const audio = collection.buffer[collection.expectedAudioIndex];
      this.sendAudio(audio);
      delete collection.buffer[collection.expectedAudioIndex];
      collection.expectedAudioIndex++;
    }
  }

  sendAudio(audio) {
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'media',
        media: {
          payload: audio,
        },
      })
    );

    // When the media completes you will receive a `mark` message with the label
    const markLabel = uuidv4();
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'mark',
        mark: {
          name: markLabel
        }
      })
    );
    this.emit('audiosent', markLabel);
  }
}

export { StreamService };
