import 'dotenv/config'; 
import { Buffer } from 'node:buffer'; 
import { EventEmitter } from 'events';
import {TextToSpeechClient} from '@google-cloud/text-to-speech'; 


class TextToSpeechService extends EventEmitter {
  constructor() {
    super(); // Calls the constructor of the parent class (EventEmitter)
    console.log('Google Cloud TTS: starting the TTS client')
    this.client = new TextToSpeechClient(); // Initializes the Text-to-Speech client
  }

  async generate(message) {
    try { // Starts a try-catch block to handle errors
      console.log('Google Cloud TTS: starting to process the message...')
      const { partialResponse } = message; // Extracts the partial response from the message

      if (!partialResponse) { return; } // If there is no partial response, returns without doing anything

      // Creates the request for the Text-to-Speech service
      const request = {
        input: {text: partialResponse}, // Defines the text to be converted to speech
        voice: {languageCode: 'pt-BR', name: 'pt-BR-Wavenet-A'}, // Defines the voice and language (Brazilian Portuguese)
        audioConfig: {audioEncoding: 'MULAW', sampleRateHertz: '8000'}, // Defines the audio encoding and audio frequency
      }

      // Makes the call to the Text-to-Speech service
      console.log('Google Cloud TTS: synthesizing the voice for the sent message...')
      const [response] = await this.client.synthesizeSpeech(request);

      const audioArrayBuffer = response.audioContent; // Extracts the audio content from the response
      console.log('Google Cloud TTS: finishing the audio generation', audioArrayBuffer);
      this.emit('speech', Buffer.from(audioArrayBuffer).toString('base64'), message); // Emits a 'speech' event with the audio encoded in base64 and the original message
    } catch (err) { // Catches any error that occurs during the process
      console.error('Error Google Cloud TTS service'); // Logs an error message to the console
      console.error(err); // Logs the error to the console
    }
  }
}

export { TextToSpeechService }; // Exports the TextToSpeechService class to be used in other files