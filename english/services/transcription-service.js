import 'colors';
import crypto from 'crypto';
import speech from '@google-cloud/speech';
import { EventEmitter } from 'events';

// Function to generate a unique text ID using SHA-256 hash
function textId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}


class TranscriptionService extends EventEmitter {
  constructor() {
    super(); // Call the constructor of the parent class (EventEmitter)
    this.client = new speech.SpeechClient(); // Initialize the Google Cloud Speech client
    this.finalResult = ''; // Initialize an empty string to store the final transcription
    this.speechFinal = false; // Flag to track if the final transcription has been received

    // Configure the request for the streaming recognize API
    this.request = {
      config: {
        encoding: 'MULAW', // Encoding of the audio data
        sampleRateHertz: 8000, // Sample rate of the audio data
        languageCode: 'pt-BR', // Language code for transcription
        model: 'phone_call', // Model optimized for phone call transcription
        enableAutomaticPunctuation: true, // Enable automatic punctuation
        enableWordTimeOffsets: false, // Disable word time offsets
      },
      interimResults: true, // Enable interim results
    };

    this.recognizeStream = null; // Initialize the streaming recognize stream to null
  }

  // Start the streaming recognize stream
  startSTT() {
    this.recognizeStream = this.client
      .streamingRecognize(this.request) // Start streaming recognize with the configured request
      .on('error', (error) => { // Handle errors from the streaming recognize API
        console.error('STT -> Google Cloud Speech error');
        console.error(error);
      })
      .on('data', (data) => { // Handle data events from the streaming recognize API
        this.handleTranscriptionEvent(data);
      });

      console.log('STT -> Google Cloud Speech connection opened'.yellow); // Log that the connection to Google Cloud Speech has been opened
  }
  
  // Handle transcription events from the streaming recognize API
  handleTranscriptionEvent(transcriptionEvent) {
    
    const result = transcriptionEvent.results[0]; // Get the first result from the transcription event
    const text = result.alternatives[0]?.transcript || ''; // Extract the transcribed text
    console.log('STT partial result: ', text) // Log the partial transcription result

    // If the result is final and speechFinal has not already happened, emit the transcription
    if (result.isFinal) {
      this.finalResult += ` ${text}`; // Append the final result to the finalResult string
      console.log(`Final result: ${this.finalResult}`.yellow); // Log the final result to the console
      this.emit('transcription', { text : this.finalResult.trim(), id: textId(this.finalResult.trim())}); // Emit a 'transcription' event with the final result and ID
      this.finalResult = ''; // Reset the final result string
    } else {
      // this.emit('utterance', text); // This is commented out, may need to uncomment to use
    }
  }

  /**
   * Send the payload to Google Cloud Speech
   * @param {String} payload A base64 MULAW/8000 audio stream
   */
  send(payload) {
    if (this.recognizeStream.writable) { // Check if the stream is writable
      this.recognizeStream.write(Buffer.from(payload, 'base64')); // Write the base64 encoded payload to the stream
    }
  }


  // Restart the streaming recognize stream
  restartStream() {
    if (this.recognizeStream) {
      // this.recognizeStream.removeListener('data', speechCallback); // This line is commented out, may need to uncomment to use
      this.recognizeStream.destroy(); // Destroy the existing stream
      this.recognizeStream = null; // Set the stream to null
      this.startSTT(); // Start a new streaming recognize stream
    }
  }
}

export { TranscriptionService };