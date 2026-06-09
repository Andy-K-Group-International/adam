export type AIMode = "basic" | "client_openai" | "client_anthropic" | "managed" | "disabled";

export interface AIConfig {
  mode: AIMode;
  usageLimitMonthly: number | null;
  fallbackProvider: string | null;
  logsEnabled: boolean;
}

export function getDefaultAIConfig(): AIConfig {
  return {
    mode: "basic",
    usageLimitMonthly: null,
    fallbackProvider: null,
    logsEnabled: true,
  };
}

export function getAIConfig(client: {
  ai_mode?: string | null;
  ai_usage_limit_monthly?: number | null;
  ai_fallback_provider?: string | null;
  ai_generation_logs_enabled?: boolean | null;
}): AIConfig {
  return {
    mode: (client.ai_mode ?? "basic") as AIMode,
    usageLimitMonthly: client.ai_usage_limit_monthly ?? null,
    fallbackProvider: client.ai_fallback_provider ?? null,
    logsEnabled: client.ai_generation_logs_enabled ?? true,
  };
}

export const AI_MODE_LABELS: Record<AIMode, string> = {
  basic:              "Basic (A.D.A.M. built-in AI)",
  client_openai:      "Client OpenAI Key",
  client_anthropic:   "Client Anthropic Key",
  managed:            "Managed (Andy'K Group provided)",
  disabled:           "Disabled (template-only mode)",
};

export const AI_MODE_DESCRIPTIONS: Record<AIMode, string> = {
  basic:            "Uses A.D.A.M.'s shared AI capacity for content generation.",
  client_openai:    "Uses the client's own OpenAI API key. Client is responsible for API costs.",
  client_anthropic: "Uses the client's own Anthropic API key. Client is responsible for API costs.",
  managed:          "Andy'K Group provides and manages the AI allocation for this client.",
  disabled:         "All AI features are off. Client uses manual templates only. A.D.A.M. remains fully functional.",
};
