import Anthropic from "@anthropic-ai/sdk";
import { env } from "./config/env";

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export async function responderComContexto(
  pergunta: string,
  trechosDeContexto: string[]
): Promise<string> {
  const contexto = trechosDeContexto
    .map((texto, i) => `[Trecho ${i + 1}]\n${texto}`)
    .join("\n\n");

  const promptDoSistema = `Você é um assistente que responde perguntas usando APENAS o contexto fornecido.
Se a resposta não estiver no contexto, diga claramente que não encontrou essa informação nos documentos.
Sempre que possível, cite de qual [Trecho] veio a informação usada.`;

  const mensagem = await client.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: 1024,
    system: promptDoSistema,
    messages: [
      {
        role: "user",
        content: `Contexto:\n${contexto}\n\nPergunta: ${pergunta}`,
      },
    ],
  });

  const blocoDeTexto = mensagem.content.find((bloco) => bloco.type === "text");
  return blocoDeTexto && "text" in blocoDeTexto ? blocoDeTexto.text : "";
}
