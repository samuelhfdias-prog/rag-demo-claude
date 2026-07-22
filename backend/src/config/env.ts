import "dotenv/config";
import { z } from "zod";

const VALOR_EXEMPLO_ANTHROPIC_API_KEY = "sk-ant-sua-chave-aqui";
const VALOR_EXEMPLO_API_KEY = "troque-por-uma-chave-aleatoria-de-pelo-menos-32-caracteres";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z
    .string()
    .default("3001")
    .transform((valor) => Number(valor))
    .pipe(z.number().int().positive()),

  ANTHROPIC_API_KEY: z
    .string()
    .min(1, "ANTHROPIC_API_KEY é obrigatória — crie a sua em https://console.anthropic.com")
    .refine((valor) => valor !== VALOR_EXEMPLO_ANTHROPIC_API_KEY, {
      message:
        "ANTHROPIC_API_KEY ainda está com o valor de exemplo do .env.example. " +
        "Crie uma chave real em https://console.anthropic.com e cole no .env.",
    }),

  CLAUDE_MODEL: z.string().default("claude-haiku-4-5-20251001"),

  API_KEY: z
    .string()
    .min(16, "API_KEY é obrigatória e precisa ter pelo menos 16 caracteres.")
    .refine((valor) => valor !== VALOR_EXEMPLO_API_KEY, {
      message:
        "API_KEY ainda está com o valor de exemplo do .env.example — isso deixaria o " +
        'painel protegido por uma "senha" pública. Gere uma chave real com: ' +
        "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    }),

  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_PATH: z.string().default("./data/rag.db"),
});

function carregarConfiguracao() {
  const resultado = envSchema.safeParse(process.env);

  if (!resultado.success) {
    console.error("❌ Configuração de ambiente inválida:");
    for (const problema of resultado.error.issues) {
      console.error(`   - ${problema.path.join(".")}: ${problema.message}`);
    }
    console.error(
      "\nConfira o arquivo .env.example, copie para .env e preencha os valores."
    );
    process.exit(1);
  }

  return resultado.data;
}

export const env = carregarConfiguracao();
