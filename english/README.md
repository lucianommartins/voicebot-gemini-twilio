# **Call Gemini: Phone Calls with Generative AI**

## Hands-on workshop to experiment with Gemini API and Twilio API

Wouldn't it be cool if you could build an app that lets you talk to Google Gemini on the phone? 

Twilio gives you a superpower called [Media Streams](https://twilio.com/media-streams). Media Streams provides a Websocket connection to both sides of a phone call. You can receive streamed audio, process it, and send audio back.

This app serves as a demonstration exploring two services:
- [Google Cloud Text-to-Speech](https://cloud.google.com/tts/) for Text to Speech
- [Google Cloud Speech-to-Text](https://cloud.google.com/stt/) for Speech to Text
- [Google Gemini](https://ai.google.dev/gemini) for generating responses using the Google Gemini API

These services combine to create a voice application that is remarkably better at transcribing, understanding, and speaking than traditional IVR systems.

Features:
- 🏁 Returns answers with low latency, typically 1 second, using streaming.
- ❗️ Allows the user to interrupt the Google Gemini assistant and ask a different question.
- 📔 Keeps a history of the chat with Google Gemini.

## Setting up for Development

### Prerequisites

If you're hosting the app locally, we also recommend using a tunneling service like [ngrok](https://ngrok.com) so Twilio can forward audio to your app.

### 1. Start Ngrok
Start an [ngrok](https://ngrok.com) tunnel to port `3000`:

```bash
ngrok http 3000
```
Ngrok will provide you with a unique URL, like `abc123.ngrok.io`. Copy the URL without http:// or https://. You'll need this URL in the next step.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your environment variables.


### 3. Install Dependencies with NPM
Install the necessary packages:

```bash
npm install
```

### 4. Start Your Server in Development Mode
Run the following command:
```bash
npm run dev
```
This will start your app using `nodemon` so that any changes in your code will automatically update and restart the server.

### 5. Configure an Incoming Phone Number

Connect a phone number using the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming).

You can also use the Twilio CLI:

```bash
twilio phone-numbers:update +1[your-twilio-number] --voice-url=https://your-server.ngrok.io/incoming
```
This configuration tells Twilio to send the audio from the received call to your application when someone calls your number. The app responds to the incoming call webhook with a [Stream](https://www.twilio.com/docs/voice/twiml/stream) TwiML verb that will connect an audio media stream to your websocket server.