import { CheckCircle, Heart, MessageCircle, Share2, Plus } from "lucide-react-native";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/contexts/auth-context";
import { usePosts } from "@/contexts/posts-context";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { posts, isLoading, isFetchingMore, loadMore, toggleLike, refresh } = usePosts();
  const sharePostMutation = trpc.shares.share.useMutation();

  const handleShare = async (postId: string) => {
    try {
      await sharePostMutation.mutateAsync({ postId });
    } catch (error: any) {
      console.log("Erro ao compartilhar:", error.message);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeTitle}>Olá, {user?.name?.split(" ")[0]}!</Text>
            <Text style={styles.welcomeSubtitle}>Comunidade de Pais Verificados</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <CheckCircle size={20} color="#10b981" strokeWidth={2.5} />
          </View>
        </View>
      </View>

      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Publicações</Text>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: any }) => {
    const isLiked = item.likes.includes(user?.id);
    const likesCount = item.likes.length;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postUserInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user?.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.postUserName}>{item.user?.name}</Text>
              <Text style={styles.postDate}>
                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.mediaUrls && item.mediaUrls.length > 0 && item.mediaType === "image" && (
          <Image source={{ uri: item.mediaUrls[0] }} style={styles.postImage} />
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isLiked ? "#ef4444" : "#64748b"}
              fill={isLiked ? "#ef4444" : "none"}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/post/${item.id}`)}
            activeOpacity={0.7}
          >
            <MessageCircle size={20} color="#64748b" />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item.id)}
            activeOpacity={0.7}
          >
            <Share2 size={20} color="#64748b" />
            <Text style={styles.actionText}>{item.sharesCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma publicação ainda.</Text>
      <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar!</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(main)/(tabs)/home/create-post")}
        activeOpacity={0.9}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContent: {
    paddingBottom: 80,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    fontWeight: "700" as const,
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
  postsHeader: {
    marginBottom: 16,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1e293b",
  },
  postCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  postUserName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1e293b",
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  postContent: {
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    gap: 20,
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
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#64748b",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
