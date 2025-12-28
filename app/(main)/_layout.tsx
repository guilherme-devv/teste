import { Stack } from "expo-router";
import { PostsContext } from "@/contexts/posts-context";
import { CommentsContext } from "@/contexts/comments-context";

export default function MainLayout() {
  return (
    <PostsContext>
      <CommentsContext>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </CommentsContext>
    </PostsContext>
  );
}
