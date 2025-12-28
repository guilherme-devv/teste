import { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { X, Image as ImageIcon, Video, Send } from "lucide-react-native";
import { usePosts } from "@/contexts/posts-context";

export default function CreatePostScreen() {
  const router = useRouter();
  const { createPost, isCreating } = usePosts();
  const [content, setContent] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>(undefined);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Erro", "Por favor, escreva algo para publicar");
      return;
    }

    try {
      const result = await createPost({
        content: content.trim(),
        mediaUrls: mediaUrl ? [mediaUrl] : undefined,
        mediaType,
      });

      if (result.moderation) {
        Alert.alert(
          "Publicação rejeitada",
          result.moderation,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Sucesso!",
          "Sua publicação foi criada e está visível para a comunidade",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível criar a publicação");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Publicação</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={isCreating || !content.trim()}
          style={[styles.sendButton, (!content.trim() || isCreating) && styles.sendButtonDisabled]}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Compartilhe sua experiência com outros pais..."
          placeholderTextColor="#94a3b8"
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={5000}
          autoFocus
        />

        <Text style={styles.charCount}>{content.length}/5000</Text>

        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Adicionar mídia (opcional)</Text>
          
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[styles.mediaButton, mediaType === "image" && styles.mediaButtonActive]}
              onPress={() => setMediaType(mediaType === "image" ? undefined : "image")}
            >
              <ImageIcon size={24} color={mediaType === "image" ? "#3b82f6" : "#64748b"} />
              <Text style={[styles.mediaButtonText, mediaType === "image" && styles.mediaButtonTextActive]}>
                Imagem
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaButton, mediaType === "video" && styles.mediaButtonActive]}
              onPress={() => setMediaType(mediaType === "video" ? undefined : "video")}
            >
              <Video size={24} color={mediaType === "video" ? "#3b82f6" : "#64748b"} />
              <Text style={[styles.mediaButtonText, mediaType === "video" && styles.mediaButtonTextActive]}>
                Vídeo
              </Text>
            </TouchableOpacity>
          </View>

          {mediaType && (
            <View style={styles.mediaUrlInput}>
              <TextInput
                style={styles.urlInput}
                placeholder={`URL da ${mediaType === "image" ? "imagem" : "vídeo"} (ex: https://...)`}
                placeholderTextColor="#94a3b8"
                value={mediaUrl}
                onChangeText={setMediaUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          )}
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Diretrizes da Comunidade</Text>
          <Text style={styles.guidelinesText}>
            • Seja respeitoso com outros pais{"\n"}
            • Não use linguagem ofensiva{"\n"}
            • Compartilhe experiências construtivas{"\n"}
            • Mantenha a privacidade das crianças
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  textInput: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
  },
  mediaSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  mediaButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  mediaButtonTextActive: {
    color: "#3b82f6",
  },
  mediaUrlInput: {
    marginTop: 12,
  },
  urlInput: {
    fontSize: 14,
    color: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  guidelinesCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#15803d",
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 20,
    opacity: 0.8,
  },
});
