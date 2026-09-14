import { useEffect, useState, useCallback } from "react";
import { Artifact, ArtifactSummary } from "@/types";
import { ApiClient } from "@/lib/api-client";

export function useArtifacts(sessionId: string | null) {
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSessionArtifacts = useCallback(async () => {
    if (!sessionId) {
      setArtifacts([]);
      return;
    }
    try {
      const data = await ApiClient.listArtifacts(sessionId);
      setArtifacts(data);
    } catch (err) {
      console.warn("Failed to load artifacts for session:", err);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionArtifacts();
  }, [fetchSessionArtifacts]);

  const openArtifact = async (artifactId: string) => {
    try {
      setIsLoading(true);
      const artifact = await ApiClient.getArtifact(artifactId);
      setActiveArtifact(artifact);
      setIsArtifactPanelOpen(true);
    } catch (err) {
      console.error("Failed to load artifact details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeArtifactPanel = () => {
    setIsArtifactPanelOpen(false);
  };

  return {
    artifacts,
    activeArtifact,
    isArtifactPanelOpen,
    isLoading,
    openArtifact,
    closeArtifactPanel,
    fetchSessionArtifacts,
    setActiveArtifact,
    setIsArtifactPanelOpen,
  };
}
