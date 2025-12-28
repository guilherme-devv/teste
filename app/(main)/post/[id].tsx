import { useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, Heart, MessageCircle, Share2, Send } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/auth-context";
import { useComments } from "@/contexts/comments-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createComment, toggleLike: toggleCommentLike } = useComments();
  
  const [commentText, setCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const postQuery = trpc.posts.getById.useQuery({ id: id || "" });
  const commentsQuery = trpc.comments.getByPostId.useQuery({ postId: id || "" });
  const toggleLikeMutation = trpc.posts.toggleLike.useMutation({
    onSuccess: () => {
      postQuery.refetch();
    },
  });
  const sharePostMutation = trpc.shares.share.useMutation();

  const handleShare = async () => {
    try {
      await sharePostMutation.mutateAsync({ postId: id || "" });
      Alert.alert("Sucesso", "Post compartilhado!");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim()) return;

    try {
      await createComment({
        postId: id || "",
        content: commentText.trim(),
        parentId: replyingTo || undefined,
      });
      setCommentText("");
      setReplyingTo(null);
      commentsQuery.refetch();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  }, [commentText, id, replyingTo, createComment, commentsQuery]);

  const handleCommentLike = useCallback(async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
      commentsQuery.refetch();
    } catch (error: any) {
      console.log("Erro ao curtir comentário:", error.message);
    }
  }, [toggleCommentLike, commentsQuery]);

  if (postQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!postQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post não encontrado</Text>
      </View>
    );
  }

  const post = postQuery.data;
  const comments = commentsQuery.data || [];
  const isLiked = post.likes.includes(user?.id || "");
  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Publicação",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postUserInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.postUserName}>{post.user?.name}</Text>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.mediaUrls && post.mediaUrls.length > 0 && post.mediaType === "image" && (
            <Image source={{ uri: post.mediaUrls[0] }} style={styles.postImage} />
          )}

          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleLikeMutation.mutate({ postId: post.id })}
              activeOpacity={0.7}
            >
              <Heart
                size={20}
                color={isLiked ? "#ef4444" : "#64748b"}
                fill={isLiked ? "#ef4444" : "none"}
              />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                {post.likes.length}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <MessageCircle size={20} color="#64748b" />
              <Text style={styles.actionText}>{post.commentsCount}</Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={20} color="#64748b" />
              <Text style={styles.actionText}>{post.sharesCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentários ({topLevelComments.length})</Text>

          {commentsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
          ) : topLevelComments.length === 0 ? (
            <Text style={styles.emptyText}>Seja o primeiro a comentar!</Text>
          ) : (
            topLevelComments.map((comment) => {
              const replies = comments.filter((c) => c.parentId === comment.id);
              const commentIsLiked = comment.likes.includes(user?.id || "");

              return (
                <View key={comment.id} style={styles.commentContainer}>
                  <View style={styles.comment}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.user?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentUserName}>{comment.user?.name}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => handleCommentLike(comment.id)}
                          style={styles.commentAction}
                        >
                          <Heart
                            size={14}
                            color={commentIsLiked ? "#ef4444" : "#94a3b8"}
                            fill={commentIsLiked ? "#ef4444" : "none"}
                          />
                          <Text style={[styles.commentActionText, commentIsLiked && styles.commentActionTextActive]}>
                            {comment.likes.length}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setReplyingTo(comment.id)}
                          style={styles.commentAction}
                        >
                          <Text style={styles.commentActionText}>Responder</Text>
                        </TouchableOpacity>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {replies.map((reply) => {
                    const replyIsLiked = reply.likes.includes(user?.id || "");
                    return (
                      <View key={reply.id} style={[styles.comment, styles.reply]}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>
                            {reply.user?.name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUserName}>{reply.user?.name}</Text>
                          <Text style={styles.commentText}>{reply.content}</Text>
                          <View style={styles.commentActions}>
                            <TouchableOpacity
                              onPress={() => handleCommentLike(reply.id)}
                              style={styles.commentAction}
                            >
                              <Heart
                                size={14}
                                color={replyIsLiked ? "#ef4444" : "#94a3b8"}
                                fill={replyIsLiked ? "#ef4444" : "none"}
                              />
                              <Text style={[styles.commentActionText, replyIsLiked && styles.commentActionTextActive]}>
                                {reply.likes.length}
                              </Text>
                            </TouchableOpacity>
                            <Text style={styles.commentDate}>
                              {new Date(reply.createdAt).toLocaleDateString("pt-BR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        {replyingTo && (
          <View style={styles.replyingToBar}>
            <Text style={styles.replyingToText}>
              Respondendo a {comments.find((c) => c.id === replyingTo)?.user?.name}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={styles.cancelReply}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Adicione um comentário..."
            placeholderTextColor="#94a3b8"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim()}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  postHeader: {
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  postUserName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 2,
  },
  postDate: {
    fontSize: 13,
    color: "#94a3b8",
  },
  postContent: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#64748b",
  },
  actionTextActive: {
    color: "#ef4444",
  },
  commentsSection: {
    backgroundColor: "#ffffff",
    marginTop: 8,
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingVertical: 20,
  },
  commentContainer: {
    marginBottom: 16,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reply: {
    marginLeft: 40,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500" as const,
  },
  commentActionTextActive: {
    color: "#ef4444",
  },
  commentDate: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  commentInputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 12,
  },
  replyingToBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 13,
    color: "#64748b",
  },
  cancelReply: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600" as const,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1e293b",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
});
