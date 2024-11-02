import 'colors';

async function recordingService(ttsService, callSid) {
  try {
    // Check if recording is enabled in the environment variables
    if (process.env.RECORDING_ENABLED === 'true') {
      // Initialize Twilio client using account SID and auth token
      const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      // Generate a message indicating the call will be recorded using the TTS service
      ttsService.generate({partialResponseIndex: null, partialResponse: 'This call will be recorded.'}, 0);
      // Create a recording for the call using the Twilio client
      const recording = await client.calls(callSid)
        .recordings
        .create({
          recordingChannels: 'dual' // Record both sides of the call
        });
          
      // Log the recording SID to the console
      console.log(`Recording Created: ${recording.sid}`.red);
    }
  } catch (err) {
    console.log(err);
  }
}

export { recordingService };