import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceContext } from '../contexts/WorkspaceContext';
import { CommentService, CommentType, CreateCommentRequest } from '../services/api/commentService';
import { queryKeys } from '../query/queryKeys';

/**
 * Hook pour la gestion des commentaires
 * 🔧 VERSION DEMO - Hook suivant les patterns du projet
 */
export function useComments() {
  // ✅ Context workspace obligatoire
  const { currentWorkspaceId } = useWorkspaceContext();
  const queryClient = useQueryClient();

  // ✅ React Query avec clés standardisées
  const commentsQuery = useQuery({
    queryKey: queryKeys.comments.all(currentWorkspaceId),
    queryFn: () => CommentService.listComments(currentWorkspaceId),
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData
  });

  // ✅ Mutation création avec gestion cache
  const createMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => {
      return CommentService.createComment(currentWorkspaceId, data);
    },
    onSuccess: (newComment) => {
      // Ajouter le nouveau commentaire au cache
      queryClient.setQueryData<CommentType[]>(
        queryKeys.comments.all(currentWorkspaceId),
        (old) => old ? [newComment, ...old] : [newComment]
      );
      // Invalider aussi le cache par texte si nécessaire
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byText(currentWorkspaceId, newComment.text_id)
      });
    }
  });

  // ✅ Mutation suppression avec gestion cache
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => 
      CommentService.deleteComment(currentWorkspaceId, commentId),
    onSuccess: (_, commentId) => {
      // Supprimer le commentaire du cache
      queryClient.setQueryData<CommentType[]>(
        queryKeys.comments.all(currentWorkspaceId),
        (old) => old ? old.filter(comment => comment.id !== commentId) : []
      );
    }
  });

  // ✅ Mutation mise à jour avec gestion cache
  const updateMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: Partial<CreateCommentRequest> }) =>
      CommentService.updateComment(currentWorkspaceId, commentId, data),
    onSuccess: (updatedComment) => {
      // Mettre à jour le commentaire dans le cache
      queryClient.setQueryData<CommentType[]>(
        queryKeys.comments.all(currentWorkspaceId),
        (old) => old ? old.map(comment => 
          comment.id === updatedComment.id ? updatedComment : comment
        ) : [updatedComment]
      );
      // Invalider aussi le cache par texte si nécessaire
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byText(currentWorkspaceId, updatedComment.text_id)
      });
    }
  });

  // ✅ Fonctions utilitaires avec useCallback
  const createComment = useCallback((data: CreateCommentRequest) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const deleteComment = useCallback((commentId: string) => {
    deleteMutation.mutate(commentId);
  }, [deleteMutation]);

  const updateComment = useCallback((commentId: string, data: Partial<CreateCommentRequest>) => {
    updateMutation.mutate({ commentId, data });
  }, [updateMutation]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.comments.all(currentWorkspaceId)
    });
  }, [currentWorkspaceId, queryClient]);

  // ✅ Return organisé par catégorie
  return {
    // Data
    comments: commentsQuery.data || [],
    // Loading states
    isLoading: commentsQuery.isLoading,
    isRefetching: commentsQuery.isRefetching,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    // Actions
    createComment,
    updateComment,
    deleteComment,
    // Action states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // Utils
    refresh
  };
}

