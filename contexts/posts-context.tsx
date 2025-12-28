import { useCallback, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { trpc } from "@/lib/trpc";

export const [PostsContext, usePosts] = createContextHook(() => {
  const utils = trpc.useUtils();
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  const feedQuery = trpc.posts.getFeed.useQuery({ limit, offset });

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate();
      utils.posts.getMyPosts.invalidate();
    },
  });

  const updatePostMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate();
      utils.posts.getMyPosts.invalidate();
    },
  });

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate();
      utils.posts.getMyPosts.invalidate();
    },
  });

  const toggleLikeMutation = trpc.posts.toggleLike.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate();
    },
  });

  const createPost = useCallback(
    async (data: { content: string; mediaUrls?: string[]; mediaType?: "image" | "video" }) => {
      return createPostMutation.mutateAsync(data);
    },
    [createPostMutation]
  );

  const updatePost = useCallback(
    async (data: { id: string; content: string }) => {
      return updatePostMutation.mutateAsync(data);
    },
    [updatePostMutation]
  );

  const deletePost = useCallback(
    async (id: string) => {
      return deletePostMutation.mutateAsync({ id });
    },
    [deletePostMutation]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      return toggleLikeMutation.mutateAsync({ postId });
    },
    [toggleLikeMutation]
  );

  const loadMore = useCallback(() => {
    if (feedQuery.data?.hasMore && !feedQuery.isFetching) {
      setOffset((prev) => prev + limit);
    }
  }, [feedQuery.data?.hasMore, feedQuery.isFetching]);

  const posts = feedQuery.data?.posts || [];

  return {
    posts,
    isLoading: feedQuery.isLoading,
    isFetchingMore: feedQuery.isFetching && offset > 0,
    hasMore: feedQuery.data?.hasMore || false,
    loadMore,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    refresh: () => {
      setOffset(0);
      feedQuery.refetch();
    },
  };
});
