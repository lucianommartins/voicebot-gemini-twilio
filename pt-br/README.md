# **Call Gemini: Ligações Telefônicas com IA Generativa**

## Workshop apresentado na conferência TDC São Paulo 2024

Não seria legal se você pudesse construir um aplicativo que permitisse conversar com o Google Gemini ao telefone?

O Twilio te dá um superpoder chamado [Media Streams](https://twilio.com/media-streams). O Media Streams fornece uma conexão Websocket para ambos os lados de uma chamada telefônica. Você pode receber áudio transmitido, processá-lo e enviar áudio de volta.

Este aplicativo serve como uma demonstração explorando dois serviços:
- [Google Cloud Text-to-Speech](https://cloud.google.com/tts/) para Fala para Texto e Texto para Fala
- [Google Gemini](https://ai.google.dev/gemini) para geração de respostas usando a API do Google Gemini

Esses serviços se combinam para criar um aplicativo de voz que é notavelmente melhor em transcrever, entender e falar do que os sistemas tradicionais de URA.

Recursos:
- 🏁 Retorna respostas com baixa latência, normalmente 1 segundo, utilizando streaming.
- ❗️ Permite que o usuário interrompa o assistente Google Gemini e faça uma pergunta diferente.
- 📔 Mantém o histórico de bate-papo com o Google Gemini.

## Configurando para Desenvolvimento

### Pré-requisitos

Se você estiver hospedando o aplicativo localmente, também recomendamos usar um serviço de tunelamento como o [ngrok](https://ngrok.com) para que o Twilio possa encaminhar áudio para seu aplicativo.

### 1. Inicie o Ngrok
Inicie um túnel [ngrok](https://ngrok.com) para a porta `3000`:

```bash
ngrok http 3000
```
O Ngrok fornecerá um URL exclusivo, como `abc123.ngrok.io`. Copie o URL sem http:// ou https://. Você precisará deste URL na próxima etapa.

### 2. Configure as Variáveis de Ambiente
Copie `.env.example` para `.env` e configure as variáveis de ambiente.


### 3. Instale as Dependências com NPM
Instale os pacotes necessários:

```bash
npm install
```

### 4. Inicie Seu Servidor em Modo de Desenvolvimento
Execute o seguinte comando:
```bash
npm run dev
```
Isso iniciará seu aplicativo usando `nodemon` para que qualquer alteração no seu código atualize e reinicie automaticamente o servidor.

### 5. Configure um Número de Telefone de Entrada

Conecte um número de telefone usando o [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming).

Você também pode usar o Twilio CLI:

```bash
twilio phone-numbers:update +1[your-twilio-number] --voice-url=https://your-server.ngrok.io/incoming
```
Esta configuração diz ao Twilio para enviar o áudio da chamada recebida para seu aplicativo quando alguém ligar para seu número. O aplicativo responde ao webhook da chamada recebida com um verbo [Stream](https://www.twilio.com/docs/voice/twiml/stream) TwiML que conectará um fluxo de mídia de áudio ao seu servidor websocket.

## Testando com Jest
Ligar repetidamente para o aplicativo pode ser uma maneira demorada de testar as chamadas de função da sua ferramenta. Este projeto contém exemplos de testes de unidade que podem te ajudar a testar suas funções sem depender do Google Gemini para chamá-las.

Exemplos simples de testes estão disponíveis no diretório `/test`. Para executá-los, basta executar `npm run test`.

## Implantar via Fly.io
O Fly.io é um serviço de hospedagem semelhante ao Heroku que simplifica o processo de implantação. Dado que os Twilio Media Streams são enviados e recebidos de us-east-1, é recomendado escolher a região Ashburn, VA (IAD) do Fly.

> Implantar no Fly.io não é obrigatório para experimentar o aplicativo, mas pode ser útil se a velocidade da sua internet residencial for variável.

Modifique o nome do aplicativo `fly.toml` para um valor único (este deve ser globalmente único).

Implante o aplicativo usando o Fly.io CLI:
```bash
fly launch

fly deploy
```

Importe seus segredos do seu arquivo .env para seu aplicativo implantado:
```bash
fly secrets import < .env
``` 
