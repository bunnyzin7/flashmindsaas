
import React from 'react';
import { Trash2, BookOpen, ChevronRight, Pencil } from 'lucide-react';
import { Deck } from '../types';

interface DeckCardProps {
    deck: Deck;
    onStudy: (deck: Deck) => void;
    onDelete: (id: string) => void;
    onEdit: (deck: Deck) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onStudy, onDelete, onEdit }) => {
    return (
        <div
            onClick={() => onStudy(deck)}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative cursor-pointer"
        >
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(deck); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                    title="Editar"
                >
                    <Pencil size={18} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className={`w-12 h-12 ${deck.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/10`}>
                <BookOpen size={24} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">{deck.name}</h3>
            <p className="text-sm font-medium text-slate-400 mb-8">{deck.cardCount} Flashcards</p>

            <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ÚLTIMO: {deck.lastStudied}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onStudy(deck); }}
                    className="text-indigo-600 font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all group/btn"
                >
                    Estudar
                    <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center transition-all group-hover/btn:bg-indigo-600 group-hover/btn:text-white">
                        <ChevronRight size={14} />
                    </div>
                </button>
            </div>
        </div>
    );
}

export default DeckCard;
