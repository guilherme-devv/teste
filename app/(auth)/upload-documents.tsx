import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/lib/trpc";

export default function UploadDocumentsScreen() {
  const { refreshUser } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [documents, setDocuments] = useState<string[]>([]);

  const uploadMutation = trpc.verification.uploadDocuments.useMutation();

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Não disponível", "A câmera não está disponível na web. Use o upload de arquivos.");
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permissão negada", "Precisamos de acesso à câmera");
        return;
      }
    }

    setShowCamera(true);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocs = result.assets.map((asset) => asset.uri);
        setDocuments([...documents, ...newDocs]);
        Alert.alert("Sucesso", `${newDocs.length} documento(s) adicionado(s)`);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Erro", "Erro ao selecionar documento");
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      Alert.alert("Atenção", "Adicione pelo menos um documento");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        documentUrls: documents,
      });

      Alert.alert(
        "Documentos enviados!",
        "Seus documentos estão em análise. Você receberá uma notificação quando forem aprovados.",
        [{ text: "OK", onPress: () => refreshUser() }]
      );
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao enviar documentos");
    }
  };

  if (showCamera && Platform.OS !== "web") {
    return (
      <CameraView style={styles.camera}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity
            style={styles.closeCamera}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeCameraText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <FileText size={64} color="#ffffff" strokeWidth={1.5} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Verificação de Identidade</Text>
              <Text style={styles.subtitle}>
                Envie sua certidão de nascimento e documento de identidade para verificação
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.infoBox}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.infoText}>
                  Seus documentos serão analisados com segurança
                </Text>
              </View>

              {documents.length > 0 && (
                <View style={styles.documentsContainer}>
                  <Text style={styles.documentsTitle}>
                    {documents.length} documento(s) adicionado(s)
                  </Text>
                  {documents.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                      <FileText size={16} color="#3b82f6" />
                      <Text style={styles.documentText} numberOfLines={1}>
                        Documento {index + 1}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={24} color="#1e3a8a" />
                  <Text style={styles.actionButtonText}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handlePickDocument}
                  activeOpacity={0.8}
                >
                  <Upload size={24} color="#1e3a8a" />
                  <Text style={styles.actionButtonText}>Escolher Arquivo</Text>
                </TouchableOpacity>
              </View>

              {uploadMutation.error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={styles.errorText}>
                    {uploadMutation.error.message}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, (uploadMutation.isPending || documents.length === 0) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={uploadMutation.isPending || documents.length === 0}
              >
                {uploadMutation.isPending ? (
                  <ActivityIndicator color="#1e3a8a" />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar Documentos</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    gap: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  documentsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  documentsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: "#64748b",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
  },
  closeCamera: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  closeCameraText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
