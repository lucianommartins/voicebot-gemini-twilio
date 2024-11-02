import 'colors'; 
import { EventEmitter } from 'events';
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService extends EventEmitter {
  constructor() {
    super(); // Chama o construtor da classe pai (EventEmitter)
    this.genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Inicializa a API do Google Generative AI com a chave de API do ambiente
    this.gemini = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash'}); // Seleciona o modelo Gemini 1.5 Flash
    console.log('Instância do Gemini:', this.gemini) // Registra a instância do modelo Gemini no console
    // Inicia um bate-papo com o modelo Gemini e define um histórico inicial
    this.chat = this.gemini.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Oi!" }], // Mensagem inicial do usuário
      },
      {
        role: "model",
        parts: [{ text: "Oi, tudo bem? Como posso te ajudar hoje?" }], // Resposta inicial do modelo
      },
    ],
    generationConfig: {
      maxOutputTokens: 100, // Define o número máximo de tokens na resposta
    },
  });
}

  async completion(message) {
 
    // Define o contexto da conversa para o modelo
    const context = `Você é uma assistente pessoal que ajuda com perguntas gerais.
                    Gere respostas em frases curtas, mas sem omitir informações importantes.
                    Não inclua nenhuma formatação ou markdown em suas respostas.

              `
    const prompt = context + message.text // Combina o contexto com a mensagem do usuário para formar o prompt
    const response = await this.chat.sendMessageStream(prompt) // Envia o prompt para o modelo e recebe uma resposta em streaming

    let text = ''; // Inicializa uma variável para armazenar a resposta completa
    // Itera sobre os pedaços da resposta em streaming
    for await (const chunk of response.stream) {
      const chunkText = chunk.text(); // Extrai o texto do pedaço
      console.log('Resposta parcial do Gemini:', chunkText); // Registra a resposta parcial no console
      text += chunkText; // Adiciona o texto do pedaço à resposta completa
    }

    // Se a resposta não estiver vazia
    if (text.length !== 0) {
      const rand = Math.floor(Math.random() * 1000) + 1; // Gera um número aleatório para usar como ID
      console.log('ID da resposta final do Gemini:', rand) // Registra o ID da resposta no console
      console.log('Resposta final do Gemini:', text) // Registra a resposta completa no console
      // Emite um evento 'geminireply' com a resposta, ordem (0) e ID
      this.emit('geminireply', {
        partialResponse: text,
        partialOrder:0,
         id:'geminianswer' + rand
      })
    }
  }
}

export { GeminiService };