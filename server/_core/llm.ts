import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const extractTextContent = (content: MessageContent | MessageContent[]): string => {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .map(p => {
      if (typeof p === "string") return p;
      if (p.type === "text") return p.text;
      return "";
    })
    .join("\n");
};

/**
 * Convert our generic Message[] into Anthropic's message format.
 * Anthropic separates system prompt from messages and requires
 * alternating user/assistant turns.
 */
const toAnthropicMessages = (
  messages: Message[]
): { system: string | undefined; messages: Anthropic.MessageParam[] } => {
  let system: string | undefined;
  const anthropicMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      system = extractTextContent(msg.content);
      continue;
    }

    const role: "user" | "assistant" =
      msg.role === "assistant" ? "assistant" : "user";
    const text = extractTextContent(msg.content);

    anthropicMessages.push({ role, content: text });
  }

  return { system, messages: anthropicMessages };
};

const getClient = (): Anthropic => {
  if (!ENV.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey: ENV.anthropicApiKey });
};

// ---------------------------------------------------------------------------
// Main export — same signature as before so all callers stay untouched
// ---------------------------------------------------------------------------

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const client = getClient();

  const { messages, maxTokens, max_tokens } = params;
  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);

  const resolvedMaxTokens = maxTokens ?? max_tokens ?? 4096;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: resolvedMaxTokens,
    ...(system ? { system } : {}),
    messages: anthropicMessages,
  });

  // Map Anthropic response back to our OpenAI-compatible InvokeResult shape
  const textContent = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  return {
    id: response.id,
    created: Math.floor(Date.now() / 1000),
    model: response.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: textContent,
        },
        finish_reason: response.stop_reason ?? null,
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}
