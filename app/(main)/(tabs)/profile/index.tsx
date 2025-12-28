import { Shield, Mail, CheckCircle, LogOut, ChevronRight, Award, MapPin, TrendingUp, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();
  const rewardsQuery = trpc.rewards.getMyRewards.useQuery();
  const servicesQuery = trpc.localServices.getServices.useQuery();
  const seedServicesMutation = trpc.localServices.seedServices.useMutation();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              await logout();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <CheckCircle size={16} color="#10b981" strokeWidth={2.5} />
          </View>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {rewardsQuery.isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : (
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsHeader}>
            <Award size={24} color="#f59e0b" />
            <View style={styles.rewardsHeaderText}>
              <Text style={styles.rewardsTitle}>Nível {rewardsQuery.data?.level || 1}</Text>
              <Text style={styles.rewardsSubtitle}>{rewardsQuery.data?.points || 0} pontos</Text>
            </View>
            <TrendingUp size={20} color="#10b981" />
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${rewardsQuery.data?.progressToNextLevel || 0}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>
            {rewardsQuery.data?.nextLevelPoints ? 
              `${rewardsQuery.data.nextLevelPoints - (rewardsQuery.data.points || 0)} pontos para o próximo nível` : 
              "Continue participando para ganhar pontos!"}
          </Text>
          {rewardsQuery.data?.availableBadges && rewardsQuery.data.availableBadges.filter(b => b.earned).length > 0 && (
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Conquistas:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesList}>
                {rewardsQuery.data.availableBadges.filter(b => b.earned).map((badge) => (
                  <View key={badge.id} style={styles.badge}>
                    <Sparkles size={16} color="#f59e0b" />
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Mail size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            {user?.emailVerified && (
              <CheckCircle size={20} color="#10b981" />
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Shield size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status de Verificação</Text>
              <Text style={[styles.infoValue, styles.verified]}>
                Verificado
              </Text>
            </View>
            <CheckCircle size={20} color="#10b981" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços Locais</Text>
        <TouchableOpacity 
          style={styles.servicesCard} 
          activeOpacity={0.7}
          onPress={() => {
            if (servicesQuery.data?.services.length === 0) {
              seedServicesMutation.mutate();
            }
          }}
        >
          <View style={styles.servicesIcon}>
            <MapPin size={24} color="#3b82f6" />
          </View>
          <View style={styles.servicesContent}>
            <Text style={styles.servicesTitle}>Encontre Serviços</Text>
            <Text style={styles.servicesSubtitle}>
              {servicesQuery.data?.services.length || 0} serviços disponíveis na sua região
            </Text>
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <Text style={styles.menuText}>Notificações</Text>
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <Text style={styles.menuText}>Privacidade</Text>
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <Text style={styles.menuText}>Ajuda e Suporte</Text>
          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
        disabled={logoutMutation.isPending}
      >
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>
          {logoutMutation.isPending ? "Saindo..." : "Sair"}
        </Text>
      </TouchableOpacity>
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
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  verified: {
    color: "#10b981",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center" as const,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardsCard: {
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
  rewardsHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 16,
  },
  rewardsHeaderText: {
    flex: 1,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1e293b",
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center" as const,
  },
  badgesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  badgesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#475569",
    marginBottom: 12,
  },
  badgesList: {
    flexDirection: "row" as const,
  },
  badge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400e",
  },
  servicesCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  servicesIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  servicesContent: {
    flex: 1,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  servicesSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
});
