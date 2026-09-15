import { useEffect, useState, useCallback, useRef } from "react";
import { Message, SourceReference } from "@/types";
import { ApiClient } from "@/lib/api-client";

export function useChat(
  sessionId: string | null,
  onArtifactGenerated?: (artifactId: string) => void,
  onSessionTitleUpdate?: (newTitle: string) => void
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [currentSources, setCurrentSources] = useState<SourceReference[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");

  const streamingMessageRef = useRef<string>("");

  const loadSessionMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      setIsLoadingSession(true);
      const detail = await ApiClient.getSession(sessionId);
      setMessages(detail.messages || []);
      if (detail.model_provider) setSelectedProvider(detail.model_provider);
      if (detail.model_name) setSelectedModel(detail.model_name);
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setIsLoadingSession(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSessionMessages();
  }, [loadSessionMessages]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const newSession = await ApiClient.createSession();
        currentSessionId = newSession.id;
        if (onSessionTitleUpdate) {
          onSessionTitleUpdate(newSession.title);
        }
      } catch (err: any) {
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          session_id: "error",
          role: "assistant",
          content: `⚠️ Connection Error: Could not reach backend server at ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}. Please make sure your backend API is running and NEXT_PUBLIC_API_URL is configured in Vercel settings.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      session_id: currentSessionId,
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");
    setCurrentSources([]);
    streamingMessageRef.current = "";

    let currentArtifactId: string | null = null;
    let latestSources: SourceReference[] = [];
    let timingMeta: { retrieval_ms?: number; generation_ms?: number } = {};

    await ApiClient.streamChat(currentSessionId, userText, selectedProvider, selectedModel, {
      onToken: (token: string) => {
        streamingMessageRef.current += token;
        setStreamingContent(streamingMessageRef.current);
      },
      onSources: (sources: SourceReference[]) => {
        latestSources = sources;
        setCurrentSources(sources);
      },
      onArtifact: (artifactData) => {
        currentArtifactId = artifactData.id;
        if (onArtifactGenerated) {
          onArtifactGenerated(artifactData.id);
        }
      },
      onMetadata: (metadata) => {
        timingMeta = {
          retrieval_ms: metadata.retrieval_ms,
          generation_ms: metadata.generation_ms,
        };
      },
      onError: (errMsg: string) => {
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          session_id: currentSessionId,
          role: "assistant",
          content: `⚠️ Error: ${errMsg}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setIsStreaming(false);
        setStreamingContent("");
      },
      onDone: () => {
        const finalContent = streamingMessageRef.current;
        if (finalContent) {
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            session_id: currentSessionId,
            role: "assistant",
            content: finalContent,
            sources: latestSources,
            artifact_id: currentArtifactId,
            model_provider: selectedProvider,
            model_name: selectedModel,
            retrieval_latency_ms: timingMeta.retrieval_ms,
            generation_latency_ms: timingMeta.generation_ms,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
        setIsStreaming(false);
        setStreamingContent("");
        if (messages.length === 0 && onSessionTitleUpdate) {
          onSessionTitleUpdate(userText.slice(0, 50));
        }
      },
    });
  };

  return {
    messages,
    isStreaming,
    streamingContent,
    currentSources,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    isLoadingSession,
    sendMessage,
    reloadMessages: loadSessionMessages,
  };
}
