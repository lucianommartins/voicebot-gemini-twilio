# **Ligue para o Gemini: Ligações Telefônicas com IA Generativa**

## Workshop prático para experimentar a API do Gemini e a API do Twilio

Não seria legal se você pudesse criar um aplicativo que permite conversar com o Google Gemini por telefone?

O Twilio te dá um superpoder chamado [Media Streams](https://twilio.com/media-streams). Media Streams fornece uma conexão Websocket para ambos os lados de uma chamada telefônica. Você pode receber áudio transmitido, processá-lo e enviar áudio de volta.

Este aplicativo serve como uma demonstração explorando dois serviços:
- [Google Cloud Text-to-Speech](https://cloud.google.com/tts/) para Texto para Fala
- [Google Cloud Speech-to-Text](https://cloud.google.com/stt/) para Fala para Texto
- [Google Gemini](https://ai.google.dev/gemini) para gerar respostas usando a API do Google Gemini

Esses serviços se combinam para criar um aplicativo de voz que é notavelmente melhor em transcrever, entender e falar do que os sistemas IVR tradicionais.

Recursos:
- 🏁 Retorna respostas com baixa latência, normalmente 1 segundo, usando streaming.
- ❗️ Permite que o usuário interrompa o assistente do Google Gemini e faça uma pergunta diferente.
- 📔 Mantém um histórico do bate-papo com o Google Gemini.

## Configurando para desenvolvimento

### Pré-requisitos

Se você estiver hospedando o aplicativo localmente, também recomendamos o uso de um serviço de tunelamento como [ngrok](https://ngrok.com) para que o Twilio possa encaminhar o áudio para seu aplicativo.

### 1. Inicie o Ngrok
Inicie um túnel [ngrok](https://ngrok.com) para a porta `3000`:

```bash
ngrok http 3000
```
O Ngrok fornecerá um URL exclusivo, como `abc123.ngrok.io`. Copie o URL sem http:// ou https://. Você precisará desse URL na próxima etapa.

### 2. Configure as variáveis de ambiente
Copie `.env.example` para `.env` e configure suas variáveis de ambiente.


### 3. Instale as dependências com o NPM
Instale os pacotes necessários:

```bash
npm install
```

### 4. Inicie seu servidor no modo de desenvolvimento
Execute o seguinte comando:
```bash
npm run dev
```
Isso iniciará seu aplicativo usando o `nodemon` para que quaisquer alterações em seu código sejam atualizadas e reinicie o servidor automaticamente.

### 5. Configure um número de telefone de entrada

Conecte um número de telefone usando o [Console do Twilio](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming).

Você também pode usar o Twilio CLI:

```bash
twilio phone-numbers:update +1[seu-número-do-twilio] --voice-url=https://seu-servidor.ngrok.io/incoming
```
Esta configuração diz ao Twilio para enviar o áudio da chamada recebida para seu aplicativo quando alguém ligar para seu número. O aplicativo responde ao webhook de chamada de entrada com um verbo [Stream](https://www.twilio.com/docs/voice/twiml/stream) TwiML que conectará um fluxo de mídia de áudio ao seu servidor websocket.