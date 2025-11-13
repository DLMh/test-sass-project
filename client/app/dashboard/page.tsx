'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AI_EMPLOYEES } from '../../data/ai-employees';
import { useTexts } from '../../hooks/useTexts';
import { useComments } from '../../hooks/useComments';
import { RiAddLine, RiDeleteBinLine, RiChat3Line } from 'react-icons/ri';
import { DateService } from '../../services/local/dateService';

export default function DashboardPage() {
  const router = useRouter();
  const { texts, createText, deleteText, isLoading, isCreating, isDeleting } = useTexts();
  const { comments, createComment, deleteComment, isLoading: isLoadingComments, isCreating: isCreatingComment, isDeleting: isDeletingComment } = useComments();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentFormData, setCommentFormData] = useState({ textId: '', content: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim()) {
      createText({
        title: formData.title.trim() || undefined,
        content: formData.content.trim()
      });
      setFormData({ title: '', content: '' });
      setShowForm(false);
    }
  };

  const handleDelete = (textId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce texte ?')) {
      deleteText(textId);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentFormData.textId && commentFormData.content.trim()) {
      createComment({
        textId: commentFormData.textId,
        content: commentFormData.content.trim()
      });
      setCommentFormData({ textId: '', content: '' });
      setShowCommentForm(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard - Test Technique
          </h1>
          <p className="text-gray-600">
            Gestion des textes avec architecture du projet (Services + Hooks + Composants)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section Agents IA */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Agents IA Disponibles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {AI_EMPLOYEES.map((employee) => (
                <div 
                  key={employee.name} 
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity p-4 rounded-lg border border-gray-200 hover:border-gray-300"
                  onClick={() => router.push(`/dashboard/employees/${employee.id}/chat`)}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2"
                    style={{ backgroundColor: employee.hexColor }}
                  >
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {employee.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Gestion des Textes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Textes
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isCreating}
              >
                <RiAddLine className="w-4 h-4" />
                Nouveau texte
              </button>
            </div>

            {/* Formulaire de création */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du texte..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Contenu du texte..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!formData.content.trim() || isCreating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Création...' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des textes */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des textes...</p>
                </div>
              ) : texts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun texte enregistré.</p>
                  <p className="text-sm">Créez votre premier texte pour commencer !</p>
                </div>
              ) : (
                texts.map((text) => (
                  <div key={text.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{text.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(text.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{text.content}</p>
                    <p className="text-xs text-gray-400" suppressHydrationWarning>
                      Créé le {DateService.formatDateTime(text.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section Gestion des Commentaires */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Gestion des Commentaires
            </h2>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreatingComment || (!isLoading && texts.length === 0)}
              title={!isLoading && texts.length === 0 ? 'Créez d\'abord un texte' : ''}
            >
              <RiChat3Line className="w-4 h-4" />
              Nouveau commentaire
            </button>
          </div>

          {/* Formulaire de création de commentaire */}
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte associé *
                </label>
                <select
                  value={commentFormData.textId}
                  onChange={(e) => setCommentFormData({ ...commentFormData, textId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Sélectionner un texte...</option>
                  {texts.map((text) => (
                    <option key={text.id} value={text.id}>
                      {text.title || 'Sans titre'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu du commentaire *
                </label>
                <textarea
                  value={commentFormData.content}
                  onChange={(e) => setCommentFormData({ ...commentFormData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Votre commentaire..."
                  required
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {commentFormData.content.length}/500 caractères
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!commentFormData.textId || !commentFormData.content.trim() || isCreatingComment}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingComment ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Liste des commentaires */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des commentaires...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun commentaire enregistré.</p>
                <p className="text-sm">Créez votre premier commentaire pour commencer !</p>
              </div>
            ) : (
              comments.map((comment) => {
                const associatedText = texts.find(t => t.id === comment.text_id);
                return (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-purple-600 font-medium">
                            Texte: {associatedText?.title || 'Sans titre'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{comment.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isDeletingComment}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400" suppressHydrationWarning>
                      Créé le {DateService.formatDateTime(comment.created_at)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 