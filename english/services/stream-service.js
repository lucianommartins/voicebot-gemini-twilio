import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class StreamService extends EventEmitter {
  constructor(websocket) {
    super(); // Call the constructor of the parent class (EventEmitter)
    this.ws = websocket; // Store the websocket connection
    this.audioBuffer = {}; // Initialize an empty object to store audio buffers
    this.streamSid = ''; // Initialize an empty string for the stream SID
  }

  setStreamSid(streamSid) {
    // Set the stream SID
    this.streamSid = streamSid;
  }

  buffer(audio, message) {
    const { id, partialOrder } = message; // Extract the ID and partial order from the message

    // Initialize the buffer for the ID if it doesn't exist yet
    if (!this.audioBuffer[id]) {
      this.audioBuffer[id] = {
        buffer: {}, // Initialize an empty object to store audio chunks
        expectedAudioIndex: 0 // Initialize the expected audio index to 0
      };
    }

    // Store the audio in the buffer
    this.audioBuffer[id].buffer[partialOrder] = audio;

    // Try to play the next audio in order
    this.playNextAudio(id);
  }

  playNextAudio(id) {
    const collection = this.audioBuffer[id]; // Get the audio collection for the given ID

    // Check if the expected audio is available in the buffer
    while (collection.buffer[collection.expectedAudioIndex]) {
      const audio = collection.buffer[collection.expectedAudioIndex]; // Get the audio chunk for the expected index
      this.sendAudio(audio); // Send the audio chunk to the websocket
      delete collection.buffer[collection.expectedAudioIndex]; // Remove the audio chunk from the buffer
      collection.expectedAudioIndex++; // Increment the expected audio index
    }
  }

  sendAudio(audio) {
    // Send the audio to the websocket as a media event
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid, // Include the stream SID
        event: 'media', // Indicate a media event
        media: {
          payload: audio, // Send the audio payload
        },
      })
    );

    // Generate a unique mark label to identify the end of the media
    const markLabel = uuidv4();
    // Send a mark event to the websocket to indicate the completion of the media
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'mark',
        mark: {
          name: markLabel // Include the mark label
        }
      })
    );
    // Emit an 'audiosent' event with the mark label
    this.emit('audiosent', markLabel);
  }
}

export { StreamService };