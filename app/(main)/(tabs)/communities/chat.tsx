import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send } from "lucide-react-native";

import { trpc } from "@/lib/trpc";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [message, setMessage] = useState<string>("");

  const messagesQuery = trpc.chat.getMessages.useQuery({ conversationId: conversationId || "" }, {
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
  const sendMutation = trpc.chat.sendMessage.useMutation();

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    await sendMutation.mutateAsync({
      conversationId,
      content: message.trim(),
    });

    setMessage("");
    messagesQuery.refetch();
  };

  const messages = messagesQuery.data?.messages || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Chat" }} />

      {messagesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={100}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMe = item.sender?.id === "current-user";
              return (
                <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
                  <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
                    {!isMe && (
                      <Text style={styles.senderName}>{item.sender?.name}</Text>
                    )}
                    <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                      {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={sendMutation.isPending || !message.trim()}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: "flex-start" as const,
  },
  messageContainerMe: {
    alignItems: "flex-end" as const,
  },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleMe: {
    backgroundColor: "#3b82f6",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#475569",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#0f172a",
  },
  messageTextMe: {
    color: "#ffffff",
  },
  messageTime: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
    alignSelf: "flex-end" as const,
  },
  messageTimeMe: {
    color: "#dbeafe",
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
