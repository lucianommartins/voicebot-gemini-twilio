import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class StreamService extends EventEmitter {
  constructor(websocket) {
    super(); // Chama o construtor da classe pai (EventEmitter)
    this.ws = websocket; // Armazena a conexão websocket
    this.audioBuffer = {}; // Inicializa um objeto vazio para armazenar buffers de áudio
    this.streamSid = ''; // Inicializa uma string vazia para o stream SID
  }

  setStreamSid(streamSid) {
    // Define o stream SID
    this.streamSid = streamSid;
  }

  buffer(audio, message) {
    const { id, partialOrder } = message; // Extrai o ID e a ordem parcial da mensagem

    // Inicializa o buffer para o ID se ele ainda não existir
    if (!this.audioBuffer[id]) {
      this.audioBuffer[id] = {
        buffer: {}, // Inicializa um objeto vazio para armazenar fragmentos de áudio
        expectedAudioIndex: 0 // Inicializa o índice de áudio esperado como 0
      };
    }

    // Armazena o áudio no buffer
    this.audioBuffer[id].buffer[partialOrder] = audio;

    // Tenta reproduzir o próximo áudio em ordem
    this.playNextAudio(id);
  }

  playNextAudio(id) {
    const collection = this.audioBuffer[id]; // Obtém a coleção de áudio para o ID fornecido

    // Verifica se o áudio esperado está disponível no buffer
    while (collection.buffer[collection.expectedAudioIndex]) {
      const audio = collection.buffer[collection.expectedAudioIndex]; // Obtém o fragmento de áudio para o índice esperado
      this.sendAudio(audio); // Envia o fragmento de áudio para o websocket
      delete collection.buffer[collection.expectedAudioIndex]; // Remove o fragmento de áudio do buffer
      collection.expectedAudioIndex++; // Incrementa o índice de áudio esperado
    }
  }

  sendAudio(audio) {
    // Envia o áudio para o websocket como um evento de mídia
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid, // Inclui o stream SID
        event: 'media', // Indica um evento de mídia
        media: {
          payload: audio, // Envia a carga de áudio
        },
      })
    );

    // Gera um rótulo de marca exclusivo para identificar o final da mídia
    const markLabel = uuidv4();
    // Envia um evento de marca para o websocket para indicar a conclusão da mídia
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'mark',
        mark: {
          name: markLabel // Inclui o rótulo de marca
        }
      })
    );
    // Emite um evento 'audiosent' com o rótulo de marca
    this.emit('audiosent', markLabel);
  }
}

export { StreamService };