import 'colors';
import crypto from 'crypto';
import speech from '@google-cloud/speech';
import { EventEmitter } from 'events';

function textId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}


class TranscriptionService extends EventEmitter {
  constructor() {
    super();
    this.client = new speech.SpeechClient();
    this.finalResult = '';
    this.speechFinal = false;

    this.request = {
      config: {
        encoding: 'MULAW',
        sampleRateHertz: 8000,
        languageCode: 'pt-BR',
        model: 'phone_call',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
      },
      interimResults: true,
    };

    this.recognizeStream = null;



  }

  startSTT() {
    this.recognizeStream = this.client
      .streamingRecognize(this.request)
      .on('error', (error) => {
        console.error('STT -> Google Cloud Speech error');
        console.error(error);
      })
      .on('data', (data) => {
        this.handleTranscriptionEvent(data);
      });

      console.log('STT -> Google Cloud Speech connection opened'.yellow);
  }
  
  handleTranscriptionEvent(transcriptionEvent) {
    
    const result = transcriptionEvent.results[0];
    const text = result.alternatives[0]?.transcript || '';
    console.log('STT partial result: ', text)

    // if we receive an isFinal and speechFinal has not already happened then we should consider this the end of of the human speech and emit the transcription
    if (result.isFinal) {
      this.finalResult += ` ${text}`;
      console.log(`Final result: ${this.finalResult}`.yellow);
      this.emit('transcription', { text : this.finalResult.trim(), id: textId(this.finalResult.trim())});
      this.finalResult = '';
    } else {
      //this.emit('utterance', text);
    }
  }

  /**
   * Send the payload to Google Cloud Speech
   * @param {String} payload A base64 MULAW/8000 audio stream
   */
  send(payload) {
    if (this.recognizeStream.writable) {
      this.recognizeStream.write(Buffer.from(payload, 'base64'));
    }
  }


  restartStream() {
    if (this.recognizeStream) {
      // this.recognizeStream.removeListener('data', speechCallback);
      this.recognizeStream.destroy();
      this.recognizeStream = null;
      this.startSTT();
    }
  }
}

export { TranscriptionService };
