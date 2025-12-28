import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, MapPin, Plus, X, MessageCircle } from "lucide-react-native";

import { trpc } from "@/lib/trpc";

export default function CommunitiesScreen() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");

  const seedMutation = trpc.communities.seedCommunities.useMutation();
  const communitiesQuery = trpc.communities.getAll.useQuery();
  const createMutation = trpc.communities.create.useMutation();
  const joinMutation = trpc.communities.join.useMutation();
  const leaveMutation = trpc.communities.leave.useMutation();

  useEffect(() => {
    if (communitiesQuery.data?.communities.length === 0 && !seedMutation.isPending) {
      seedMutation.mutate();
    }
  }, [communitiesQuery.data?.communities.length, seedMutation]);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !city.trim() || !state.trim()) return;

    await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      city: city.trim(),
      state: state.trim(),
    });

    setName("");
    setDescription("");
    setCity("");
    setState("");
    setShowCreateModal(false);
    communitiesQuery.refetch();
  };

  const handleJoinLeave = async (communityId: string, isMember: boolean) => {
    if (isMember) {
      await leaveMutation.mutateAsync({ communityId });
    } else {
      await joinMutation.mutateAsync({ communityId });
    }
    communitiesQuery.refetch();
  };

  const communities = communitiesQuery.data?.communities || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Comunidades" }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Comunidades</Text>
          <Text style={styles.headerSubtitle}>Conecte-se com pais da sua região</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {communitiesQuery.isLoading || seedMutation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : communities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Nenhuma comunidade ainda</Text>
          <Text style={styles.emptyText}>Seja o primeiro a criar uma comunidade</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {communities.map((community) => (
            <View key={community.id} style={styles.communityCard}>
              {community.imageUrl && (
                <Image
                  source={{ uri: community.imageUrl }}
                  style={styles.communityImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.communityContent}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityDescription}>{community.description}</Text>
                
                <View style={styles.communityMeta}>
                  <View style={styles.locationBadge}>
                    <MapPin size={14} color="#3b82f6" />
                    <Text style={styles.locationText}>
                      {community.location.city}, {community.location.state}
                    </Text>
                  </View>
                  <View style={styles.membersBadge}>
                    <Users size={14} color="#64748b" />
                    <Text style={styles.membersText}>{community.memberCount} membros</Text>
                  </View>
                </View>

                <View style={styles.communityActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      community.memberIds.includes("current-user") && styles.actionButtonSecondary,
                    ]}
                    onPress={() => handleJoinLeave(community.id, community.memberIds.includes("current-user"))}
                    disabled={joinMutation.isPending || leaveMutation.isPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {community.memberIds.includes("current-user") ? "Sair" : "Participar"}
                    </Text>
                  </TouchableOpacity>
                  {community.memberIds.includes("current-user") && (
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() => {}}
                    >
                      <MessageCircle size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Comunidade</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nome da Comunidade</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Pais de São Paulo - Zona Sul"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o propósito da comunidade..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Ex: São Paulo"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Estado (sigla)</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="Ex: SP"
              placeholderTextColor="#94a3b8"
              maxLength={2}
              autoCapitalize="characters"
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
              onPress={handleCreate}
              disabled={createMutation.isPending || !name.trim() || !description.trim() || !city.trim() || !state.trim()}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Criar Comunidade</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center" as const,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  communityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityImage: {
    width: "100%",
    height: 150,
  },
  communityContent: {
    padding: 16,
  },
  communityName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginBottom: 8,
  },
  communityDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    marginBottom: 12,
  },
  communityMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600" as const,
  },
  membersBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  membersText: {
    fontSize: 12,
    color: "#64748b",
  },
  communityActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  actionButtonSecondary: {
    backgroundColor: "#f1f5f9",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#0f172a",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#475569",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 100,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#ffffff",
  },
});
