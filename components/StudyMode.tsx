import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ConfirmationModal from './ConfirmationModal';
import MarkdownRenderer from './MarkdownRenderer';

interface StudyModeProps {
  deck: Deck;
  onClose: () => void;
  mode?: 'new' | 'review' | 'all';
  onUpdateDeck?: (deckId: string, cards: Flashcard[]) => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ deck, onClose, mode = 'all', onUpdateDeck }) => {
  const { user } = useAuth();
  const [sessionDeck, setSessionDeck] = useState<Deck>(deck);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ easy: number; medium: number; hard: number }>({ easy: 0, medium: 0, hard: 0 });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Initialize session based on mode
  useEffect(() => {
    let cardsToStudy = [...deck.cards];
    const now = new Date();

    if (mode === 'new') {
      cardsToStudy = cardsToStudy.filter(c => !c.lastReviewed);
    } else if (mode === 'review') {
      cardsToStudy = cardsToStudy.filter(c => c.nextReview && new Date(c.nextReview) <= now);
    }

    setStudyCards(cardsToStudy);
    setSessionDeck(deck);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, deck.id]);

  const currentCard = studyCards[currentIndex];
  // Calculate progress based on STUDY CARDS, not total deck
  const progress = studyCards.length > 0 ? ((currentIndex + 1) / studyCards.length) * 100 : 0;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const saveSession = async () => {
    if (!user) return;

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const totalCards = studyCards.length;
    const correctCount = sessionResults.easy + (sessionResults.medium * 0.5);

    try {
      const { error } = await supabase.from('study_sessions').insert({
        user_id: user.id,
        deck_id: deck.id,
        duration_seconds: durationSeconds,
        cards_reviewed: totalCards,
        correct_count: correctCount,
      });

      if (error) throw error;
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      await saveSession();
      setIsCompletionModalOpen(true);
    }
  };

  const calculateNextReview = (card: Flashcard, difficulty: 'easy' | 'medium' | 'hard'): Flashcard => {
    const now = new Date();
    let interval = card.interval || 0;
    let easeFactor = card.easeFactor || 2.5;
    let repetitions = card.repetitions || 0;

    if (difficulty === 'hard') {
      repetitions = 0;
      interval = 0;
    } else if (difficulty === 'medium') {
      repetitions = 0;
      interval = interval === 0 ? 1 : Math.round(interval * 1.2);
    } else { // easy
      repetitions += 1;
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    const nextDate = new Date();
    nextDate.setDate(now.getDate() + interval);

    return {
      ...card,
      interval,
      easeFactor,
      repetitions,
      lastReviewed: now.toISOString(),
      nextReview: nextDate.toISOString(),
      difficulty // Store last difficulty
    };
  };

  const handleRate = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSessionResults(prev => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

    // Update Card Data (SRS)
    if (currentCard && onUpdateDeck) {
      const updatedCard = calculateNextReview(currentCard, difficulty);

      // Update the DECK.
      const updatedFullCards = sessionDeck.cards.map(c => c.id === updatedCard.id ? updatedCard : c);

      // Save locally
      setSessionDeck(prev => ({ ...prev, cards: updatedFullCards }));

      onUpdateDeck(deck.id, updatedFullCards);
    }

    handleNext();
  };

  const handleClose = () => {
    setIsCompletionModalOpen(false);
    onClose();
  };

  if (studyCards.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Tudo pronto!</h2>
          <p className="text-slate-500 mb-6">Não há cards para estudar nesta categoria agora.</p>
          <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white/5 border-b border-white/10 text-white">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div>
            <h2 className="font-bold">{deck.name}</h2>
            <p className="text-xs text-slate-400">{currentIndex + 1} de {studyCards.length} cards</p>
          </div>
        </div>

        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-[#0a0d24]">
        {currentCard ? (
          <div
            className="relative w-full max-w-xl h-[400px] perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl border-b-8 border-indigo-200">
                <span className="absolute top-8 left-8 text-xs font-black text-indigo-200 uppercase tracking-widest">Pergunta</span>
                <div className="text-3xl font-bold text-slate-800 leading-tight w-full flex flex-col items-center overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-indigo-100">
                  <MarkdownRenderer content={currentCard.front} />
                </div>
                <p className="absolute bottom-10 text-indigo-400 font-bold text-sm animate-pulse">Toque para ver a resposta</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl text-white border-b-8 border-indigo-800 overflow-y-auto">
                <span className="absolute top-8 left-8 text-xs font-black text-indigo-300 uppercase tracking-widest">Resposta</span>
                <div className="text-2xl font-medium leading-relaxed w-full">
                  <MarkdownRenderer content={currentCard.back} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white">Carregando card...</div>
        )}

        {/* Controls */}
        <div className="mt-16 w-full max-w-xl flex gap-4 transition-all duration-300 opacity-100">
          {isFlipped ? (
            <div className="w-full grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <button
                onClick={() => handleRate('hard')}
                className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                <ThumbsDown size={24} />
                <span>Difícil</span>
              </button>
              <button
                onClick={() => handleRate('medium')}
                className="bg-amber-500 hover:bg-amber-600 text-white p-5 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <RotateCcw size={24} />
                <span>Regular</span>
              </button>
              <button
                onClick={() => handleRate('easy')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-5 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <ThumbsUp size={24} />
                <span>Fácil</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center text-white/50 text-sm font-medium">
              Avalie o card após ver a resposta para avançar
            </div>
          )}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      <ConfirmationModal
        isOpen={isCompletionModalOpen}
        onClose={handleClose}
        onConfirm={handleClose}
        title="Parabéns!"
        message="Sessão finalizada! Seus dados foram salvos com sucesso."
        confirmText="Concluir"
        variant="success"
        singleAction={true}
      />
    </div>
  );
};

export default StudyMode;
