import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, Clock, Filter } from "lucide-react-native";

import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "alimentação", label: "Alimentação" },
  { id: "saúde", label: "Saúde" },
  { id: "desenvolvimento", label: "Desenvolvimento" },
  { id: "educação", label: "Educação" },
  { id: "comportamento", label: "Comportamento" },
] as const;

type Category = typeof CATEGORIES[number]["id"];

export default function EducationalScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const seedMutation = trpc.educational.seedArticles.useMutation();
  const articlesQuery = trpc.educational.getArticles.useQuery(
    selectedCategory === "all" ? undefined : { category: selectedCategory as any }
  );
  const toggleLikeMutation = trpc.educational.toggleLike.useMutation();

  useEffect(() => {
    if (articlesQuery.data?.articles.length === 0 && !seedMutation.isPending) {
      seedMutation.mutate();
    }
  }, [articlesQuery.data?.articles.length, seedMutation]);

  const handleToggleLike = async (articleId: string) => {
    await toggleLikeMutation.mutateAsync({ articleId });
    articlesQuery.refetch();
  };

  const articles = articlesQuery.data?.articles || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Conteúdo Educacional" }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aprender</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {articlesQuery.isLoading || seedMutation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Carregando artigos...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {articles.map((article) => (
            <View key={article.id} style={styles.articleCard}>
              {article.imageUrl && (
                <Image
                  source={{ uri: article.imageUrl }}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.articleContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{article.category}</Text>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleExcerpt} numberOfLines={3}>
                  {article.content}
                </Text>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleAuthor}>{article.author}</Text>
                  <View style={styles.articleMetaRight}>
                    <Clock size={14} color="#64748b" />
                    <Text style={styles.articleReadTime}>{article.readTime} min</Text>
                  </View>
                </View>
                <View style={styles.articleActions}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => handleToggleLike(article.id)}
                    disabled={toggleLikeMutation.isPending}
                  >
                    <Heart
                      size={20}
                      color={article.likes.length > 0 ? "#ef4444" : "#64748b"}
                      fill={article.likes.length > 0 ? "#ef4444" : "transparent"}
                    />
                    <Text style={styles.likeCount}>{article.likes.length}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  filterButton: {
    padding: 8,
  },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#3b82f6",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748b",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  articleCard: {
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
  articleImage: {
    width: "100%",
    height: 200,
  },
  articleContent: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start" as const,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1e40af",
    textTransform: "capitalize" as const,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  articleAuthor: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#475569",
  },
  articleMetaRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  articleReadTime: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  articleActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  likeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748b",
  },
});
