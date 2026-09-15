import { Artifact, ArtifactSummary, Message, ModelInfo, Session, SessionDetail, SourceReference } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Singleton token store for the API client.
 * Set by the useAuthApiClient hook or manually before making requests.
 */
let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }
  return headers;
}

export class ApiClient {
  static async listSessions(): Promise<Session[]> {
    const res = await fetch(`${API_URL}/api/sessions`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load sessions");
    return res.json();
  }

  static async createSession(title?: string, modelProvider = "openai", modelName = "gpt-4o-mini"): Promise<Session> {
    const res = await fetch(`${API_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        title: title || "New Chat",
        model_provider: modelProvider,
        model_name: modelName,
      }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
  }

  static async getSession(sessionId: string): Promise<SessionDetail> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load session details");
    return res.json();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete session");
  }

  static async updateSession(sessionId: string, title?: string): Promise<Session> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to update session");
    return res.json();
  }

  static async getArtifact(artifactId: string): Promise<Artifact> {
    const res = await fetch(`${API_URL}/api/artifacts/${artifactId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load artifact");
    return res.json();
  }

  static async listArtifacts(sessionId: string): Promise<ArtifactSummary[]> {
    const res = await fetch(`${API_URL}/api/artifacts?session_id=${sessionId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list artifacts");
    return res.json();
  }

  static async listModels(): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${API_URL}/api/models`, {
        headers: authHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.models || [];
    } catch {
      return [
        { provider: "openai", model: "gpt-4o-mini", status: "available" },
      ];
    }
  }

  static async uploadTranscript(
    file: File,
    episodeTitle: string,
    episodeNumber?: number,
    guestName?: string
  ): Promise<{ transcript_id: string; chunk_count: number }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("episode_title", episodeTitle);
    if (episodeNumber) formData.append("episode_number", episodeNumber.toString());
    if (guestName) formData.append("guest_name", guestName);

    const res = await fetch(`${API_URL}/api/ingest`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to ingest transcript");
    }
    return res.json();
  }

  static async streamChat(
    sessionId: string,
    message: string,
    modelProvider: string,
    modelName: string,
    callbacks: {
      onToken: (token: string) => void;
      onSources: (sources: SourceReference[]) => void;
      onArtifact: (artifact: { id: string; type: "markdown" | "html"; title: string }) => void;
      onMetadata: (metadata: Record<string, any>) => void;
      onError: (error: string) => void;
      onDone: () => void;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...authHeaders(),
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          model_provider: modelProvider,
          model_name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No readable stream received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "message";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.replace("event:", "").trim();
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.replace("data:", "").trim();
            try {
              const data = JSON.parse(dataStr);

              switch (currentEvent) {
                case "token":
                  if (data.content) callbacks.onToken(data.content);
                  break;
                case "sources":
                  if (data.sources) callbacks.onSources(data.sources);
                  break;
                case "artifact":
                  callbacks.onArtifact(data);
                  break;
                case "metadata":
                  callbacks.onMetadata(data);
                  break;
                case "error":
                  callbacks.onError(data.message || "An error occurred");
                  break;
                case "done":
                  callbacks.onDone();
                  break;
              }
            } catch (err) {
              console.warn("Could not parse SSE JSON payload:", dataStr, err);
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: any) {
      callbacks.onError(err.message || "Failed to communicate with chat backend");
    }
  }
}
