import 'dotenv/config';
import 'colors';

import express from 'express';
import ExpressWs from 'express-ws';
import { GeminiService } from './services/gemini-service.js';
import { StreamService } from './services/stream-service.js';
import { TranscriptionService } from './services/transcription-service.js';
import { TextToSpeechService } from './services/google-tts-service.js';
import twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;

// Inicializa o servidor Express
const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

// Endpoint para consultar o serviço Gemini
app.get('/query', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).send('O parâmetro de consulta "q" é obrigatório.');
  }

  try {
    const results = await searchQuery(query, 1);
    if (results.length === 0) {
      return res.status(404).send('Nenhum resultado correspondente encontrado.');
    }
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro ao processar a consulta.');
  }
});

// Endpoint para lidar com chamadas de entrada do Twilio
app.post('/incoming', (req, res) => {
  try {
    const response = new VoiceResponse();
    const connect = response.connect();
    connect.stream({ url: `wss://${process.env.SERVER}/connection` });
  
    res.type('text/xml');
    res.end(response.toString());
  } catch (err) {
    console.log(err);
  }
});

// Endpoint Websocket para gerenciar o fluxo de áudio e a conversa
app.ws('/connection', (ws) => {
  try {
    ws.on('error', console.error);
    // Preenchido a partir da mensagem de início
    let streamSid;
    let callSid;

    const gemini = new GeminiService();
    const streamService = new StreamService(ws);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});
  
    let marks = [];
  
    // Mensagens de entrada do MediaStream
    ws.on('message', function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        callSid = msg.start.callSid;
        
        streamService.setStreamSid(streamSid);
        
        // Primeira mensagem
        transcriptionService.startSTT();
        ttsService.generate({partialResponse: 'Oi, eu sou a GoogleBot, a sua assistente virtual. Como posso te ajudar?', partialOrder:0, id:'firstmessage'});

      } else if (msg.event === 'media') {
        // Ignora mensagens de mídia se o fluxo de transcrição for destruído
        if (transcriptionService.recognizeStream.destroyed) return;

        transcriptionService.send(msg.media.payload);
      } else if (msg.event === 'mark') {
        const label = msg.mark.name;
        console.log(`Twilio -> Áudio completou marca (${msg.sequenceNumber}): ${label}`.red);
        // Remove marca da lista
        marks = marks.filter(m => m !== msg.mark.name);
      } else if (msg.event === 'stop') {
        // Destrói o fluxo de transcrição
        transcriptionService.recognizeStream.destroy();
        console.log(`Twilio -> Fluxo de mídia ${streamSid} encerrado.`.underline.red);
      }
    });
  
    // Manipulador de eventos para frases reconhecidas
    transcriptionService.on('utterance', async (text) => {
      // Filtra frases vazias
      if(marks.length > 0 && text?.length > 5) {
        console.log('Twilio -> Interrupção, Limpando fluxo'.red);
        // Envia mensagem de limpeza para o websocket para redefinir o fluxo
        ws.send(
          JSON.stringify({
            streamSid,
            event: 'clear',
          })
        );
      }
    });
  
    // Manipulador de eventos para conclusão de transcrição
    transcriptionService.on('transcription', async (message) => {
      if (!message.text) { return; }
      console.log(`Interação: STT -> Gemini: ${message.text}`.yellow);
      gemini.completion(message);
    });
    
    // Manipulador de eventos para resposta do Gemini
    gemini.on('geminireply', async (message) => {
      console.log(`Interação: Gemini -> TTS: ${message.partialResponse}`.green );
      ttsService.generate(message);
    });
  
    // Manipulador de eventos para fala sintetizada
    ttsService.on('speech', (audio, message) => {
      console.log(`TTS -> TWILIO: ${message.partialResponse}`.blue);
  
      streamService.buffer(audio, message);
    });
  
    // Manipulador de eventos para áudio enviado para o Twilio
    streamService.on('audiosent', (markLabel) => {
      marks.push(markLabel);
    });
  } catch (err) {
    console.log(err);
  }
});

// Carrega dados e inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`);
});