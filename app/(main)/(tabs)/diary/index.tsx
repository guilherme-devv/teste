import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, BookHeart, Smile, Frown, Meh, Heart, Sparkles, X } from "lucide-react-native";

import { trpc } from "@/lib/trpc";

const MOODS = [
  { id: "feliz", label: "Feliz", icon: Smile, color: "#10b981" },
  { id: "cansado", label: "Cansado", icon: Meh, color: "#6366f1" },
  { id: "preocupado", label: "Preocupado", icon: Frown, color: "#f59e0b" },
  { id: "emocionado", label: "Emocionado", icon: Heart, color: "#ec4899" },
  { id: "grato", label: "Grato", icon: Sparkles, color: "#8b5cf6" },
] as const;

export default function DiaryScreen() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("feliz");
  const [milestone, setMilestone] = useState<string>("");
  const [milestones, setMilestones] = useState<string[]>([]);

  const entriesQuery = trpc.diary.getMyEntries.useQuery();
  const createMutation = trpc.diary.create.useMutation();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;

    await createMutation.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      mood: selectedMood as any,
      milestones,
      private: true,
    });

    setTitle("");
    setContent("");
    setSelectedMood("feliz");
    setMilestones([]);
    setMilestone("");
    setShowCreateModal(false);
    entriesQuery.refetch();
  };

  const addMilestone = () => {
    if (milestone.trim()) {
      setMilestones([...milestones, milestone.trim()]);
      setMilestone("");
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const entries = entriesQuery.data?.entries || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Diário de Paternidade/Maternidade" }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meu Diário</Text>
          <Text style={styles.headerSubtitle}>Registre momentos especiais</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {entriesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookHeart size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Nenhuma entrada ainda</Text>
          <Text style={styles.emptyText}>Comece a registrar seus momentos especiais</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {entries.map((entry) => {
            const mood = MOODS.find((m) => m.id === entry.mood);
            const MoodIcon = mood?.icon || Smile;
            
            return (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={[styles.moodBadge, { backgroundColor: mood?.color + "20" }]}>
                    <MoodIcon size={16} color={mood?.color} />
                    <Text style={[styles.moodText, { color: mood?.color }]}>
                      {mood?.label}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
                {entry.milestones.length > 0 && (
                  <View style={styles.milestonesContainer}>
                    <Text style={styles.milestonesTitle}>Marcos:</Text>
                    {entry.milestones.map((ms, idx) => (
                      <Text key={idx} style={styles.milestoneItem}>
                        • {ms}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
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
            <Text style={styles.modalTitle}>Nova Entrada</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Como você está se sentindo?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.moodsContainer}
            >
              {MOODS.map((mood) => {
                const MoodIcon = mood.icon;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodOption,
                      selectedMood === mood.id && { backgroundColor: mood.color + "20" },
                    ]}
                    onPress={() => setSelectedMood(mood.id)}
                  >
                    <MoodIcon
                      size={24}
                      color={selectedMood === mood.id ? mood.color : "#94a3b8"}
                    />
                    <Text
                      style={[
                        styles.moodLabel,
                        selectedMood === mood.id && { color: mood.color },
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Primeiro sorriso do bebê"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>O que aconteceu hoje?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Conte sobre seu dia..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Marcos importantes (opcional)</Text>
            <View style={styles.milestoneInputContainer}>
              <TextInput
                style={[styles.input, styles.milestoneInput]}
                value={milestone}
                onChangeText={setMilestone}
                placeholder="Ex: Primeira palavra"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={styles.addMilestoneButton} onPress={addMilestone}>
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {milestones.length > 0 && (
              <View style={styles.milestonesListContainer}>
                {milestones.map((ms, idx) => (
                  <View key={idx} style={styles.milestoneChip}>
                    <Text style={styles.milestoneChipText}>{ms}</Text>
                    <TouchableOpacity onPress={() => removeMilestone(idx)}>
                      <X size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
              onPress={handleCreate}
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Salvar</Text>
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
  entryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  moodBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  entryDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
  },
  milestonesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  milestonesTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#475569",
    marginBottom: 6,
  },
  milestoneItem: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
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
  moodsContainer: {
    marginBottom: 8,
  },
  moodOption: {
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f1f5f9",
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#94a3b8",
    marginTop: 4,
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
    height: 120,
  },
  milestoneInputContainer: {
    flexDirection: "row" as const,
    gap: 8,
  },
  milestoneInput: {
    flex: 1,
  },
  addMilestoneButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  milestonesListContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginTop: 12,
  },
  milestoneChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  milestoneChipText: {
    fontSize: 14,
    color: "#1e40af",
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
