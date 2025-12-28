import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Shield, CheckCircle, Lock, FileCheck } from "lucide-react-native";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Shield size={64} color="#ffffff" strokeWidth={1.5} />
              </View>
              <Text style={styles.title}>Bem-vindo ao{"\n"}SafeFamily</Text>
              <Text style={styles.subtitle}>
                Uma plataforma segura para pais verificados
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <CheckCircle size={28} color="#60a5fa" strokeWidth={2} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Verificação de Identidade</Text>
                  <Text style={styles.featureDescription}>
                    Apenas pais verificados podem participar
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Lock size={28} color="#60a5fa" strokeWidth={2} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Ambiente Seguro</Text>
                  <Text style={styles.featureDescription}>
                    Proteção e privacidade garantidas
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <FileCheck size={28} color="#60a5fa" strokeWidth={2} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Documentação Validada</Text>
                  <Text style={styles.featureDescription}>
                    Verificação rigorosa de documentos
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Criar Conta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    gap: 20,
    marginBottom: 48,
  },
  feature: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: "auto",
  },
  primaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
  },
});
