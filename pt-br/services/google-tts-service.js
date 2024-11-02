import 'dotenv/config'; 
import { Buffer } from 'node:buffer'; 
import { EventEmitter } from 'events';
import {TextToSpeechClient} from '@google-cloud/text-to-speech'; 


class TextToSpeechService extends EventEmitter {
  constructor() {
    super(); // Chama o construtor da classe pai (EventEmitter)
    console.log('Google Cloud TTS: iniciando o client do TTS')
    this.client = new TextToSpeechClient(); // Inicializa o cliente Text-to-Speech
  }

  async generate(message) {
    try { // Inicia um bloco try-catch para lidar com erros
      console.log('Google Cloud TTS: iniciando o processamento da mensagem...')
      const { partialResponse } = message; // Extrai a resposta parcial da mensagem

      if (!partialResponse) { return; } // Se não houver resposta parcial, retorna sem fazer nada

      // Cria a requisição para o serviço Text-to-Speech
      const request = {
        input: {text: partialResponse}, // Define o texto a ser convertido em fala
        voice: {languageCode: 'pt-BR', name: 'pt-BR-Wavenet-A'}, // Define a voz e o idioma (português brasileiro)
        audioConfig: {audioEncoding: 'MULAW', sampleRateHertz: '8000'}, // Define a codificação de áudio e a frequência do áudio
      }

      // Faz a chamada para o serviço Text-to-Speech
      console.log('Google Cloud TTS: sintetizando a voz para a mensagem enviada...')
      const [response] = await this.client.synthesizeSpeech(request);

      const audioArrayBuffer = response.audioContent; // Extrai o conteúdo de áudio da resposta
      console.log('Google Cloud TTS: finalizando a geração do áudio', audioArrayBuffer);
      this.emit('speech', Buffer.from(audioArrayBuffer).toString('base64'), message); // Emite um evento 'speech' com o áudio codificado em base64 e a mensagem original
    } catch (err) { // Captura qualquer erro que ocorra durante o processo
      console.error('Error Google Cloud TTS service'); // Exibe uma mensagem de erro no console
      console.error(err); // Exibe o erro no console
    }
  }
}

export { TextToSpeechService }; // Exporta a classe TextToSpeechService para ser utilizada em outros arquivos