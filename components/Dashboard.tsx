import React, { useState, useEffect } from 'react';
import {
  Library,
  Sparkles,
  BarChart2,
  CreditCard,
  Plus,
  Trash2,
  ChevronRight,
  User,
  Zap
} from 'lucide-react';
import { Deck, TabType, Flashcard } from '../types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LibraryView from './LibraryView';
import AIGeneratorView from './AIGeneratorView';
import StatisticsView from './StatisticsView';
import SubscriptionView from './SubscriptionView';
import StudyMode from './StudyMode';
import CreateDeckModal from './CreateDeckModal';
import CreateCardModal from './CreateCardModal';
import ConfirmationModal from './ConfirmationModal';
import StudyOptionsModal from './StudyOptionsModal';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';
import { supabase } from '../lib/supabase';

const DEFAULT_DECKS: Deck[] = [];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Empty Deck Warning Modal State
  const [isEmptyDeckModalOpen, setIsEmptyDeckModalOpen] = useState(false);

  // Limit Reached Modal State
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Study Options Modal State
  const [isStudyOptionsModalOpen, setIsStudyOptionsModalOpen] = useState(false);
  const [studyModeType, setStudyModeType] = useState<'new' | 'review' | 'all'>('all');

  const { user } = useAuth();
  const { isPro } = useUsage();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);

  // Fetch Decks from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchDecks = async () => {
      try {
        setIsLoadingDecks(true);
        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select(`
            *,
            flashcards (*)
          `)
          .order('created_at', { ascending: false });

        if (decksError) throw decksError;

        if (decksData) {
          const formattedDecks: Deck[] = decksData.map(d => ({
            id: d.id,
            name: d.name,
            category: d.category || 'Geral',
            cardCount: d.flashcards.length,
            lastStudied: d.last_studied ? new Date(d.last_studied).toLocaleDateString() : 'NUNCA',
            color: d.color || 'bg-blue-500',
            cards: d.flashcards.map((f: any) => ({
              id: f.id,
              front: f.front,
              back: f.back,
              difficulty: f.difficulty as 'easy' | 'medium' | 'hard'
            }))
          }));
          setDecks(formattedDecks);
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setIsLoadingDecks(false);
      }
    };

    fetchDecks();
  }, [user]);

  const handleCreateDeck = async (name: string, cards: Flashcard[]) => {
    if (!user) return;

    // Check Limits
    if (!isPro && decks.length >= 3) {
      setIsLimitModalOpen(true);
      return;
    }

    try {
      // 1. Create Deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
          user_id: user.id,
          name,
          category: 'IA Gerado',
          color: `bg-${['blue', 'purple', 'emerald', 'amber', 'rose'][Math.floor(Math.random() * 5)]}-500`,
          last_studied: new Date().toISOString()
        })
        .select()
        .single();

      if (deckError) throw deckError;

      if (deckData) {
        // 2. Create Flashcards
        const cardsToInsert = cards.map(c => ({
          deck_id: deckData.id,
          user_id: user.id,
          front: c.front,
          back: c.back,
          difficulty: 'medium'
        }));

        const { error: cardsError } = await supabase
          .from('flashcards')
          .insert(cardsToInsert);

        if (cardsError) throw cardsError;

        // Refresh decks (lazy way, better to update state optimistically but this ensures consistency)
        // Ideally we fetch again or construct the new object
        const newDeck: Deck = {
          id: deckData.id,
          name: deckData.name,
          category: deckData.category,
          cardCount: cards.length,
          lastStudied: 'AGORA',
          color: deckData.color,
          cards: cards
        };
        setDecks(prev => [newDeck, ...prev]);
        setActiveTab('library');
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('Erro ao criar deck. Tente novamente.');
    }
  };

  const handleAddToExistingDeck = async (deckId: string, cards: Flashcard[]) => {
    if (!user) return;

    try {
      const cardsToInsert = cards.map(c => ({
        deck_id: deckId,
        user_id: user.id,
        front: c.front,
        back: c.back,
        difficulty: 'medium'
      }));

      const { error } = await supabase
        .from('flashcards')
        .insert(cardsToInsert);

      if (error) throw error;

      setDecks(prev => prev.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = [...deck.cards, ...cards];
          return {
            ...deck,
            cards: updatedCards,
            cardCount: updatedCards.length,
            lastStudied: 'AGORA'
          };
        }
        return deck;
      }));
      setActiveTab('library');
    } catch (error) {
      console.error('Error adding cards to deck:', error);
    }
  };

  const handleAddManualDeck = async (name: string, color: string) => {
    if (!user) return;

    // Check Limits
    if (!isPro && decks.length >= 3) {
      setIsLimitModalOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert({
          user_id: user.id,
          name,
          category: 'Manual',
          color,
          last_studied: null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newDeck: Deck = {
          id: data.id,
          name: data.name,
          category: data.category,
          cardCount: 0,
          lastStudied: 'NUNCA',
          color: data.color,
          cards: []
        };
        setDecks(prev => [newDeck, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating manual deck:', error);
    }
  };

  const handleAddManualCard = async (deckId: string, front: string, back: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          deck_id: deckId,
          user_id: user.id,
          front,
          back,
          difficulty: 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCard: Flashcard = {
          id: data.id,
          front: data.front,
          back: data.back,
          difficulty: 'medium'
        };

        setDecks(prev => prev.map(deck => {
          if (deck.id === deckId) {
            const updatedCards = [...deck.cards, newCard];
            return {
              ...deck,
              cards: updatedCards,
              cardCount: updatedCards.length,
              lastStudied: 'AGORA'
            };
          }
          return deck;
        }));

        setIsCreateCardModalOpen(false);
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Error adding manual card:', error);
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsCreateModalOpen(true);
  }

  const handleUpdateDeck = async (name: string, color: string) => {
    if (editingDeck && user) {
      try {
        const { error } = await supabase
          .from('decks')
          .update({ name, color })
          .eq('id', editingDeck.id);

        if (error) throw error;

        setDecks(prev => prev.map(d => {
          if (d.id === editingDeck.id) {
            return { ...d, name, color };
          }
          return d;
        }));
        setEditingDeck(null);
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error('Error updating deck:', error);
      }
    }
  };

  const handleDeleteCard = async (deckId: string, cardId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      setDecks(prev => prev.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = deck.cards.filter(c => c.id !== cardId);
          return {
            ...deck,
            cards: updatedCards,
            cardCount: updatedCards.length
          };
        }
        return deck;
      }));

      // Update editingDeck if it's the one being edited
      if (editingDeck && editingDeck.id === deckId) {
        setEditingDeck(prev => prev ? {
          ...prev,
          cards: prev.cards.filter(c => c.id !== cardId),
          cardCount: prev.cards.length - 1
        } : null);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeckToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDeck = async () => {
    if (deckToDelete && user) {
      try {
        const { error } = await supabase
          .from('decks')
          .delete()
          .eq('id', deckToDelete);

        if (error) throw error;

        setDecks(prev => prev.filter(d => d.id !== deckToDelete));
        setDeckToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting deck:', error);
      }
    }
  };

  const handleStudyDeck = (deck: Deck) => {
    if (deck.cards.length === 0) {
      setIsEmptyDeckModalOpen(true);
      return;
    }
    setSelectedDeck(deck);
    setIsStudyOptionsModalOpen(true);
  };

  const handleStartStudy = (mode: 'new' | 'review' | 'all') => {
    setStudyModeType(mode);
    setIsStudyOptionsModalOpen(false);
    setActiveTab('study');
  };

  const handleUpdateDeckData = async (deckId: string, updatedCards: Flashcard[]) => {
    // This function is tricky because it receives updated cards without DB IDs if they were created during study mode (unlikely, usually just status updates).
    // Assuming this updates correct count or something? Currently StudyMode just finishes. 
    // Usually we update 'last_studied' here.

    if (!user) return;

    try {
      const { error } = await supabase
        .from('decks')
        .update({ last_studied: new Date().toISOString() })
        .eq('id', deckId);

      if (error) throw error;

      setDecks(prev => prev.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: updatedCards,
            lastStudied: 'AGORA' // Update last studied time
          };
        }
        return deck;
      }));

      // Also update selectedDeck if needed
      if (selectedDeck && selectedDeck.id === deckId) {
        setSelectedDeck(prev => prev ? { ...prev, cards: updatedCards } : null);
      }
    } catch (error) {
      console.error('Error updating deck data:', error);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryView decks={decks} onStudy={handleStudyDeck} onDelete={handleDeleteClick} onEdit={handleEditDeck} onOpenCreateModal={() => { setEditingDeck(null); setIsCreateModalOpen(true); }} />;
      case 'ai-generator':
        return (
          <AIGeneratorView
            decks={decks}
            onCreateDeck={handleCreateDeck}
            onAddToExistingDeck={handleAddToExistingDeck}
          />
        );
      case 'statistics':
        return <StatisticsView onNavigateToSubscription={() => setActiveTab('subscription')} />;
      case 'subscription':
        return <SubscriptionView />;
      case 'study':
        return selectedDeck ? (
          <StudyMode
            deck={selectedDeck}
            mode={studyModeType}
            onUpdateDeck={handleUpdateDeckData}
            onClose={() => {
              setActiveTab('library');
              setSelectedDeck(null);
            }}
          />
        ) : <LibraryView decks={decks} onStudy={handleStudyDeck} onDelete={handleDeleteClick} onEdit={handleEditDeck} onOpenCreateModal={() => { setEditingDeck(null); setIsCreateModalOpen(true); }} />;
      default:
        return <LibraryView decks={decks} onStudy={handleStudyDeck} onDelete={handleDeleteClick} onEdit={handleEditDeck} onOpenCreateModal={() => { setEditingDeck(null); setIsCreateModalOpen(true); }} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenCreateCard={() => setIsCreateCardModalOpen(true)} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto scrollbar-hide">
        {activeTab !== 'study' && <Navbar />}

        <div className="flex-1">
          {renderContent()}
        </div>
      </main>

      {isCreateModalOpen && (
        <CreateDeckModal
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingDeck(null);
          }}
          onConfirm={editingDeck ? handleUpdateDeck : handleAddManualDeck}
          initialData={editingDeck ? { name: editingDeck.name, color: editingDeck.color } : undefined}
          deck={editingDeck || undefined}
          mode={editingDeck ? 'edit' : 'create'}
          onDeleteCard={editingDeck ? (cardId) => handleDeleteCard(editingDeck.id, cardId) : undefined}
        />
      )}

      {isCreateCardModalOpen && (
        <CreateCardModal
          onClose={() => setIsCreateCardModalOpen(false)}
          decks={decks}
          onSave={handleAddManualCard}
        />
      )}

      {isStudyOptionsModalOpen && selectedDeck && (
        <StudyOptionsModal
          isOpen={isStudyOptionsModalOpen}
          deck={selectedDeck}
          onClose={() => setIsStudyOptionsModalOpen(false)}
          onStartStudy={handleStartStudy}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDeck}
        title="Excluir Deck"
        message="Tem certeza que deseja excluir este baralho? Todos os cards serão perdidos permanentemente."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={() => setIsSuccessModalOpen(false)}
        title="Sucesso!"
        message="Card criado com sucesso!"
        confirmText="OK"
        variant="success"
        singleAction={true}
      />

      <ConfirmationModal
        isOpen={isEmptyDeckModalOpen}
        onClose={() => setIsEmptyDeckModalOpen(false)}
        onConfirm={() => setIsEmptyDeckModalOpen(false)}
        title="Deck Vazio"
        message="Este deck não possui cards para estudar. Adicione cards manualmente ou gere com IA!"
        confirmText="Entendido"
        variant="danger"
        singleAction={true}
      />

      <ConfirmationModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onConfirm={() => {
          setIsLimitModalOpen(false);
          setActiveTab('subscription');
        }}
        title="Limite Atingido"
        message="Você atingiu o limite de 3 decks do plano Gratuito. Torne-se Pro para criar decks ilimitados!"
        confirmText="Ver Planos"
        cancelText="Agora não"
        variant="primary"
      />
    </div>
  );
}
