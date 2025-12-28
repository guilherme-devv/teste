import { CheckCircle, MessageCircle, Users, Calendar } from "lucide-react-native";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeTitle}>Olá, {user?.name?.split(" ")[0]}!</Text>
            <Text style={styles.welcomeSubtitle}>Você está verificado</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <CheckCircle size={20} color="#10b981" strokeWidth={2.5} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recursos</Text>
        
        <View style={styles.grid}>
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7}>
            <View style={styles.featureIcon}>
              <MessageCircle size={28} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text style={styles.featureTitle}>Conversas</Text>
            <Text style={styles.featureDescription}>
              Chat com outros pais verificados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7}>
            <View style={styles.featureIcon}>
              <Users size={28} color="#8b5cf6" strokeWidth={2} />
            </View>
            <Text style={styles.featureTitle}>Comunidade</Text>
            <Text style={styles.featureDescription}>
              Grupos e discussões
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} activeOpacity={0.7}>
            <View style={styles.featureIcon}>
              <Calendar size={28} color="#f59e0b" strokeWidth={2} />
            </View>
            <Text style={styles.featureTitle}>Eventos</Text>
            <Text style={styles.featureDescription}>
              Encontros e atividades
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Plataforma Segura</Text>
        <Text style={styles.infoText}>
          Todos os usuários desta plataforma passaram por verificação de identidade rigorosa.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#64748b",
  },
  verifiedBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
    opacity: 0.8,
  },
});
