import { LinearGradient } from "expo-linear-gradient";
import { Mail, AlertCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/lib/trpc";

export default function VerifyEmailScreen() {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation();
  const resendMutation = trpc.auth.resendVerificationCode.useMutation();

  useEffect(() => {
    if (user?.emailVerified) {
      refreshUser();
    }
  }, [user?.emailVerified, refreshUser]);

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert("Erro", "Digite o código de 6 dígitos");
      return;
    }

    if (!user?.email) {
      Alert.alert("Erro", "E-mail não encontrado");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        email: user.email,
        code: code.trim(),
      });

      await refreshUser();
      Alert.alert("Sucesso!", "E-mail verificado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Código inválido");
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;

    try {
      await resendMutation.mutateAsync({
        email: user.email,
      });
      Alert.alert("Código reenviado!", "Verifique seu e-mail");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao reenviar código");
    }
  };

  const isLoading = verifyMutation.isPending;

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
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconContainer}>
              <Mail size={64} color="#ffffff" strokeWidth={1.5} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Verifique seu e-mail</Text>
              <Text style={styles.subtitle}>
                Enviamos um código de 6 dígitos para{"\n"}
                <Text style={styles.email}>{user?.email}</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código de verificação</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  textAlign="center"
                />
              </View>

              {verifyMutation.error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={styles.errorText}>
                    {verifyMutation.error.message}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleVerify}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1e3a8a" />
                ) : (
                  <Text style={styles.submitButtonText}>Verificar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Não recebeu o código?</Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendMutation.isPending || isLoading}
                >
                  <Text style={[styles.resendLink, (resendMutation.isPending || isLoading) && styles.resendLinkDisabled]}>
                    {resendMutation.isPending ? "Enviando..." : "Reenviar"}
                  </Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 60,
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
    marginBottom: 40,
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
  email: {
    fontWeight: "600",
    color: "#ffffff",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  codeInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 20,
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 8,
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
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
  },
  resendLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
});
