import { useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { trpc } from "@/lib/trpc";

export const [CommentsContext, useComments] = createContextHook(() => {
  const utils = trpc.useUtils();

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: (data) => {
      utils.comments.getByPostId.invalidate({ postId: data.postId });
      utils.posts.getFeed.invalidate();
    },
  });

  const updateCommentMutation = trpc.comments.update.useMutation({
    onSuccess: (data) => {
      utils.comments.getByPostId.invalidate({ postId: data.postId });
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.invalidate();
      utils.posts.getFeed.invalidate();
    },
  });

  const toggleLikeMutation = trpc.comments.toggleLike.useMutation({
    onSuccess: (data) => {
      if (data.comment) {
        utils.comments.getByPostId.invalidate({ postId: data.comment.postId });
      }
    },
  });

  const createComment = useCallback(
    async (data: { postId: string; content: string; parentId?: string }) => {
      return createCommentMutation.mutateAsync(data);
    },
    [createCommentMutation]
  );

  const updateComment = useCallback(
    async (data: { id: string; content: string }) => {
      return updateCommentMutation.mutateAsync(data);
    },
    [updateCommentMutation]
  );

  const deleteComment = useCallback(
    async (id: string) => {
      return deleteCommentMutation.mutateAsync({ id });
    },
    [deleteCommentMutation]
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      return toggleLikeMutation.mutateAsync({ commentId });
    },
    [toggleLikeMutation]
  );

  return {
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
});
