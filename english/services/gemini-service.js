import 'colors'; 
import { EventEmitter } from 'events';
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService extends EventEmitter {
  constructor() {
    super(); // Calls the constructor of the parent class (EventEmitter)
    this.genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Initializes the Google Generative AI API with the environment API key
    this.gemini = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash'}); // Selects the Gemini 1.5 Flash model
    console.log('Gemini instance:', this.gemini) // Logs the Gemini model instance to the console
    // Starts a chat with the Gemini model and sets an initial history
    this.chat = this.gemini.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Oi!" }], // Initial user message
      },
      {
        role: "model",
        parts: [{ text: "Oi, tudo bem? Como posso te ajudar hoje?" }], // Initial model response
      },
    ],
    generationConfig: {
      maxOutputTokens: 100, // Defines the maximum number of tokens in the response
    },
  });
}

  async completion(message) {
 
    // Defines the conversation context for the model
    const context = `Você é uma assistente pessoal que ajuda com perguntas gerais.
                    Gere respostas em frases curtas, mas sem omitir informações importantes.
                    Não inclua nenhuma formatação ou markdown em suas respostas.

              `
    const prompt = context + message.text // Combines the context with the user's message to form the prompt
    const response = await this.chat.sendMessageStream(prompt) // Sends the prompt to the model and receives a streamed response

    let text = ''; // Initializes a variable to store the complete response
    // Iterates over the chunks of the streamed response
    for await (const chunk of response.stream) {
      const chunkText = chunk.text(); // Extracts the text from the chunk
      console.log('Partial Gemini answer:', chunkText); // Logs the partial response to the console
      text += chunkText; // Appends the chunk text to the complete response
    }

    // If the response is not empty
    if (text.length !== 0) {
      const rand = Math.floor(Math.random() * 1000) + 1; // Generates a random number to use as ID
      console.log('Final Gemini answer id:', rand) // Logs the response ID to the console
      console.log('Final Gemini answer:', text) // Logs the complete response to the console
      // Emits a 'geminireply' event with the response, order (0), and ID
      this.emit('geminireply', {
        partialResponse: text,
        partialOrder:0,
         id:'geminianswer' + rand
      })
    }
  }
}

export { GeminiService };