
import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Deck } from '../types';
import DeckCard from './DeckCard';

interface LibraryViewProps {
  decks: Deck[];
  onStudy: (deck: Deck) => void;
  onDelete: (id: string) => void;
  onEdit: (deck: Deck) => void;
  onOpenCreateModal: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ decks, onStudy, onDelete, onEdit, onOpenCreateModal }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Meus Decks</h2>
          <p className="text-slate-500 font-medium">Continue de onde você parou.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Novo Deck Manual</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">Nenhum deck por aqui ainda</h3>
            <p className="text-slate-400 mt-2">Comece criando um manualmente ou use a IA!</p>
          </div>
        ) : (
          decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={onStudy}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LibraryView;
