import React, { useEffect, useState } from 'react';
import { X, BookOpen, Clock, BrainCircuit } from 'lucide-react';
import { Deck, Flashcard } from '../types';

interface StudyOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deck: Deck;
    onStartStudy: (mode: 'new' | 'review' | 'all') => void;
}

const StudyOptionsModal: React.FC<StudyOptionsModalProps> = ({ isOpen, onClose, deck, onStartStudy }) => {
    const [newCardsCount, setNewCardsCount] = useState(0);
    const [reviewCardsCount, setReviewCardsCount] = useState(0);

    useEffect(() => {
        if (deck) {
            const now = new Date();
            const newCards = deck.cards.filter(card => !card.lastReviewed).length;
            const reviewCards = deck.cards.filter(card => {
                if (!card.nextReview) return false;
                return new Date(card.nextReview) <= now;
            }).length;

            setNewCardsCount(newCards);
            setReviewCardsCount(reviewCards);
        }
    }, [deck]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${deck.color} rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-current/30`}>
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{deck.name}</h2>
                    <p className="text-slate-500 font-medium">{deck.cards.length} cards no total</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => onStartStudy('new')}
                        disabled={newCardsCount === 0}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${newCardsCount > 0
                                ? 'border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                                : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${newCardsCount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                            <BrainCircuit size={24} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={`font-bold ${newCardsCount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Estudar Novos</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {newCardsCount > 0 ? `${newCardsCount} cards nunca visualizados` : 'Nenhum card novo'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => onStartStudy('review')}
                        disabled={reviewCardsCount === 0}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${reviewCardsCount > 0
                                ? 'border-amber-100 hover:border-amber-500 hover:bg-amber-50 cursor-pointer'
                                : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reviewCardsCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                            <Clock size={24} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={`font-bold ${reviewCardsCount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Revisão Inteligente</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {reviewCardsCount > 0 ? `${reviewCardsCount} cards para revisar hoje` : 'Tudo em dia!'}
                            </p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={() => onStartStudy('all')}
                        className="text-slate-400 hover:text-indigo-600 text-sm font-bold transition-colors"
                    >
                        Estudar todos os cards (Sem SRS)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyOptionsModal;
