import { LinearGradient } from "expo-linear-gradient";
import { Clock, FileCheck } from "lucide-react-native";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationPendingScreen() {
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
              <Clock size={64} color="#ffffff" strokeWidth={1.5} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Verificação em Análise</Text>
              <Text style={styles.subtitle}>
                Seus documentos estão sendo analisados pela nossa equipe
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <FileCheck size={28} color="#3b82f6" />
                  <Text style={styles.statusTitle}>O que acontece agora?</Text>
                </View>
                
                <View style={styles.steps}>
                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Análise Automática</Text>
                      <Text style={styles.stepDescription}>
                        Sistema OCR verifica seus documentos
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepLine} />

                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Revisão Manual</Text>
                      <Text style={styles.stepDescription}>
                        Equipe valida as informações
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepLine} />

                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Aprovação</Text>
                      <Text style={styles.stepDescription}>
                        Você receberá uma notificação
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.timelineCard}>
                <Text style={styles.timelineTitle}>Prazo Estimado</Text>
                <Text style={styles.timelineText}>
                  A análise geralmente leva de <Text style={styles.timelineBold}>24 a 48 horas</Text>
                </Text>
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
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  steps: {
    gap: 0,
  },
  step: {
    flexDirection: "row",
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: "#e2e8f0",
    marginLeft: 17,
  },
  timelineCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
  timelineBold: {
    fontWeight: "700",
    color: "#3b82f6",
  },
});
