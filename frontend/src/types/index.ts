export interface SourceReference {
  episode_title: string;
  episode_number?: number | null;
  guest_name?: string | null;
  chunk_content: string;
  similarity_score: number;
  chunk_index: number;
}

export interface Artifact {
  id: string;
  session_id?: string | null;
  message_id?: string | null;
  title: string;
  artifact_type: "markdown" | "html";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ArtifactSummary {
  id: string;
  session_id?: string | null;
  title: string;
  artifact_type: "markdown" | "html";
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: SourceReference[];
  artifact_id?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
  retrieval_latency_ms?: number | null;
  generation_latency_ms?: number | null;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  model_provider: string;
  model_name: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionDetail extends Session {
  messages: Message[];
}

export interface ModelInfo {
  provider: "openai" | "ollama";
  model: string;
  status: string;
  size?: number;
}
