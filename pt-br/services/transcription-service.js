import 'colors';
import crypto from 'crypto';
import speech from '@google-cloud/speech';
import { EventEmitter } from 'events';

// Função para gerar um ID de texto exclusivo usando hash SHA-256
function textId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}


class TranscriptionService extends EventEmitter {
  constructor() {
    super(); // Chama o construtor da classe pai (EventEmitter)
    this.client = new speech.SpeechClient(); // Inicializa o cliente do Google Cloud Speech
    this.finalResult = ''; // Inicializa uma string vazia para armazenar a transcrição final
    this.speechFinal = false; // Sinalizador para rastrear se a transcrição final foi recebida

    // Configura a solicitação para a API de reconhecimento em streaming
    this.request = {
      config: {
        encoding: 'MULAW', // Codificação dos dados de áudio
        sampleRateHertz: 8000, // Taxa de amostragem dos dados de áudio
        languageCode: 'pt-BR', // Código de idioma para transcrição
        model: 'phone_call', // Modelo otimizado para transcrição de chamada telefônica
        enableAutomaticPunctuation: true, // Habilita pontuação automática
        enableWordTimeOffsets: false, // Desabilita offsets de tempo de palavra
      },
      interimResults: true, // Habilita resultados intermediários
    };

    this.recognizeStream = null; // Inicializa o fluxo de reconhecimento em streaming como nulo
  }

  // Inicia o fluxo de reconhecimento em streaming
  startSTT() {
    this.recognizeStream = this.client
      .streamingRecognize(this.request) // Inicia o reconhecimento em streaming com a solicitação configurada
      .on('error', (error) => { // Trata erros da API de reconhecimento em streaming
        console.error('STT -> Erro do Google Cloud Speech');
        console.error(error);
      })
      .on('data', (data) => { // Trata eventos de dados da API de reconhecimento em streaming
        this.handleTranscriptionEvent(data);
      });

      console.log('STT -> Conexão do Google Cloud Speech aberta'.yellow); // Registra que a conexão com o Google Cloud Speech foi aberta
  }
  
  // Trata eventos de transcrição da API de reconhecimento em streaming
  handleTranscriptionEvent(transcriptionEvent) {
    
    const result = transcriptionEvent.results[0]; // Obtém o primeiro resultado do evento de transcrição
    const text = result.alternatives[0]?.transcript || ''; // Extrai o texto transcrito
    console.log('STT resultado parcial: ', text) // Registra o resultado parcial da transcrição

    // Se o resultado for final e speechFinal não tiver acontecido ainda, emite a transcrição
    if (result.isFinal) {
      this.finalResult += ` ${text}`; // Adiciona o resultado final à string finalResult
      console.log(`Resultado final: ${this.finalResult}`.yellow); // Registra o resultado final no console
      this.emit('transcription', { text : this.finalResult.trim(), id: textId(this.finalResult.trim())}); // Emite um evento 'transcription' com o resultado final e ID
      this.finalResult = ''; // Redefine a string de resultado final
    } else {
      // this.emit('utterance', text); // Isso está comentado, pode ser necessário descomentar para usar
    }
  }

  /**
   * Envia a carga para o Google Cloud Speech
   * @param {String} payload Um fluxo de áudio MULAW/8000 base64
   */
  send(payload) {
    if (this.recognizeStream.writable) { // Verifica se o fluxo é gravável
      this.recognizeStream.write(Buffer.from(payload, 'base64')); // Escreve a carga codificada em base64 no fluxo
    }
  }


  // Reinicia o fluxo de reconhecimento em streaming
  restartStream() {
    if (this.recognizeStream) {
      // this.recognizeStream.removeListener('data', speechCallback); // Esta linha está comentada, pode ser necessário descomentar para usar
      this.recognizeStream.destroy(); // Destrói o fluxo existente
      this.recognizeStream = null; // Define o fluxo como nulo
      this.startSTT(); // Inicia um novo fluxo de reconhecimento em streaming
    }
  }
}

export { TranscriptionService };