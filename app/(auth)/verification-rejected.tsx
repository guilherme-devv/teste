import { LinearGradient } from "expo-linear-gradient";
import { XCircle, AlertCircle, RefreshCw } from "lucide-react-native";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

export default function VerificationRejectedScreen() {
  const { user, refreshUser } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#dc2626", "#ef4444"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <XCircle size={64} color="#ffffff" strokeWidth={1.5} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Verificação Recusada</Text>
              <Text style={styles.subtitle}>
                Não foi possível aprovar seus documentos
              </Text>
            </View>

            <View style={styles.content}>
              {user?.rejectionReason && (
                <View style={styles.reasonCard}>
                  <View style={styles.reasonHeader}>
                    <AlertCircle size={24} color="#dc2626" />
                    <Text style={styles.reasonTitle}>Motivo da recusa</Text>
                  </View>
                  <Text style={styles.reasonText}>{user.rejectionReason}</Text>
                </View>
              )}

              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>O que fazer agora?</Text>
                <View style={styles.instructions}>
                  <View style={styles.instruction}>
                    <View style={styles.bullet} />
                    <Text style={styles.instructionText}>
                      Verifique se os documentos estão legíveis
                    </Text>
                  </View>
                  <View style={styles.instruction}>
                    <View style={styles.bullet} />
                    <Text style={styles.instructionText}>
                      Certifique-se de enviar documentos válidos
                    </Text>
                  </View>
                  <View style={styles.instruction}>
                    <View style={styles.bullet} />
                    <Text style={styles.instructionText}>
                      Tire fotos com boa iluminação
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refreshUser()}
                activeOpacity={0.8}
              >
                <RefreshCw size={20} color="#dc2626" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
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
  reasonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  reasonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
  },
  reasonText: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  instructions: {
    gap: 12,
  },
  instruction: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginTop: 7,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#dc2626",
  },
});
