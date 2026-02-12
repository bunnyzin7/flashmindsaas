
import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, BookOpen, Layers } from 'lucide-react';
import { Deck } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface CreateDeckModalProps {
  onClose: () => void;
  onConfirm: (name: string, color: string) => void;
  initialData?: { name: string, color: string } | null;
  deck?: Deck;
  mode?: 'create' | 'edit';
  onDeleteCard?: (cardId: string) => void;
}

const COLORS = [
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Azul', class: 'bg-blue-500' },
  { name: 'Roxo', class: 'bg-purple-500' },
  { name: 'Verde', class: 'bg-emerald-500' },
  { name: 'Rosa', class: 'bg-rose-500' },
  { name: 'Laranja', class: 'bg-amber-500' },
];

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ onClose, onConfirm, initialData, deck, mode = 'create', onDeleteCard }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].class);
  const [activeTab, setActiveTab] = useState<'details' | 'cards'>('details');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedColor(initialData.color);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name, selectedColor);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content - Increased maxWidth for cards view */}
      <div className={`relative bg-white w-full ${activeTab === 'cards' ? 'max-w-2xl' : 'max-w-md'} rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 transition-all`}>
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {mode === 'edit' ? 'Editar Deck' : 'Novo Deck'}
        </h2>
        <p className="text-slate-500 mb-6 font-medium">
          {mode === 'edit' ? 'Gerencie os detalhes e os cards do seu baralho.' : 'Personalize seu novo baralho de estudos.'}
        </p>

        {mode === 'edit' && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'details' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <BookOpen size={16} />
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Layers size={16} />
              Cards ({deck?.cards.length || 0})
            </button>
          </div>
        )}

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nome do Deck</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Física Quântica, Vocabulário..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Escolha uma Cor</label>
              <div className="flex flex-wrap gap-4">
                {COLORS.map((color) => (
                  <button
                    key={color.class}
                    type="button"
                    onClick={() => setSelectedColor(color.class)}
                    className={`w-10 h-10 rounded-full ${color.class} transition-all transform hover:scale-110 flex items-center justify-center shadow-lg shadow-current/20 ${selectedColor === color.class ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                  >
                    {selectedColor === color.class && <Check size={18} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                {mode === 'edit' ? 'Salvar Alterações' : 'Criar Deck'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {deck?.cards.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Nenhum card neste baralho.</p>
                </div>
              ) : (
                deck?.cards.map((card, index) => (
                  <div key={card.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl group hover:border-indigo-200 transition-colors flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <span className="text-indigo-500 text-[10px] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">Frente</span>
                        <div className="truncate"><MarkdownRenderer content={card.front} className="inline" /></div>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="text-emerald-500 text-[10px] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">Verso</span>
                        <div className="truncate"><MarkdownRenderer content={card.back} className="inline" /></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDeleteCard && onDeleteCard(card.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Excluir Card"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDeckModal;
