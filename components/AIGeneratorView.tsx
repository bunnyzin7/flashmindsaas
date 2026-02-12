
import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, ArrowRight, Check, Zap, FolderPlus, Library, ChevronDown, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard, Deck } from '../types';
import { useUsage } from '../contexts/UsageContext';

interface AIGeneratorViewProps {
  decks: Deck[];
  onCreateDeck: (name: string, cards: Flashcard[]) => void;
  onAddToExistingDeck: (deckId: string, cards: Flashcard[]) => void;
}

const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({ decks, onCreateDeck, onAddToExistingDeck }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [error, setError] = useState('');

  // States for editing
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // States for the save flow
  const [saveMode, setSaveMode] = useState<'none' | 'existing' | 'new'>('none');
  const [newDeckName, setNewDeckName] = useState('');

  const { hasReachedLimit, incrementUsage, usageCount, limit, loading } = useUsage();

  const handleGenerate = async () => {
    if (loading) return;

    if (hasReachedLimit) {
      setError(`Você atingiu o limite de ${limit} usos mensais do plano gratuito.`);
      return;
    }

    if (!topic.trim()) {
      setError('Por favor, insira um tema ou assunto.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSaveMode('none');
    setEditingCardId(null);

    try {
      const cards = await generateFlashcards(topic, 3);
      setGeneratedCards(cards);
      await incrementUsage();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar cards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const handleSaveEdit = (id: string) => {
    setGeneratedCards(prev => prev.map(card =>
      card.id === id ? { ...card, front: editFront, back: editBack } : card
    ));
    setEditingCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  const handleDeleteCard = (id: string) => {
    setGeneratedCards(prev => prev.filter(card => card.id !== id));
  };

  const handleCreateNew = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName, generatedCards);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <circle className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-20"></circle>
          <Sparkles size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Gerar com Inteligência Artificial</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Dê adeus ao trabalho manual. Insira um assunto e deixe nossa IA criar flashcards otimizados para seu estudo.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">O que você quer estudar hoje?</label>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  {usageCount}/{limit} usos mensais
                </>
              )}
            </span>
          </div>
          <div className="relative group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={hasReachedLimit ? "Limite mensal atingido" : "Ex: Revolução Francesa, Python para iniciantes, Mitocondria..."}
              className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-5 text-xl font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-300 ${hasReachedLimit
                ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-100 focus:border-indigo-500 focus:ring-indigo-500/10'
                }`}
              disabled={isGenerating || hasReachedLimit}
            />
            {!isGenerating && (
              <button
                onClick={handleGenerate}
                disabled={hasReachedLimit}
                className={`absolute right-3 top-3 bottom-3 px-8 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 ${hasReachedLimit
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                <span>{hasReachedLimit ? 'Limite Atingido' : 'Gerar'}</span>
                {hasReachedLimit ? <div className="text-slate-500"><X size={18} /></div> : <Wand2 size={18} />}
              </button>
            )}
            {isGenerating && (
              <div className="absolute right-3 top-3 bottom-3 bg-slate-200 text-slate-500 px-8 rounded-xl font-bold flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Gerando...</span>
              </div>
            )}
          </div>
          {error && <p className="mt-3 text-red-500 text-sm font-medium flex items-center gap-1"><span className="text-lg">⚠</span> {error}</p>}
        </div>

        {generatedCards.length > 0 && !isGenerating && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    Cards Sugeridos
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">{generatedCards.length} cards</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Você pode editar ou excluir cards antes de salvar.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSaveMode(saveMode === 'existing' ? 'none' : 'existing')}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border-2 ${saveMode === 'existing'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Library size={18} />
                    <span>Salvar em um Deck</span>
                  </button>
                  <button
                    onClick={() => {
                      setSaveMode(saveMode === 'new' ? 'none' : 'new');
                      setNewDeckName(topic);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border-2 ${saveMode === 'new'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                      }`}
                  >
                    <FolderPlus size={18} />
                    <span>Adicionar em um novo Deck</span>
                  </button>
                </div>
              </div>

              {/* Mini aba: Salvar em Existente */}
              {saveMode === 'existing' && (
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wider">Selecione o destino:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {decks.map(deck => (
                      <button
                        key={deck.id}
                        onClick={() => onAddToExistingDeck(deck.id, generatedCards)}
                        className="bg-white p-4 rounded-xl border border-indigo-100 text-left hover:border-indigo-400 hover:shadow-md transition-all group"
                      >
                        <div className={`w-2 h-2 rounded-full ${deck.color} mb-2`}></div>
                        <p className="font-bold text-slate-700 text-sm truncate">{deck.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{deck.cardCount} cards</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini aba: Adicionar em Novo */}
              {saveMode === 'new' && (
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wider">Nome do Novo Deck</label>
                    <input
                      autoFocus
                      type="text"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleCreateNew}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                    <Plus size={18} />
                    Confirmar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {generatedCards.map((card, idx) => (
                <div
                  key={card.id}
                  className={`bg-slate-50 rounded-2xl p-6 border transition-all ${editingCardId === card.id
                    ? 'border-indigo-400 bg-indigo-50/30 ring-4 ring-indigo-500/5 shadow-inner'
                    : 'border-slate-100 hover:border-slate-300'
                    } flex gap-4 group`}
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 font-bold text-slate-300 text-sm group-hover:text-indigo-400 transition-colors">
                    {idx + 1}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    {editingCardId === card.id ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Frente (Pergunta)</label>
                          <textarea
                            autoFocus
                            value={editFront}
                            onChange={(e) => setEditFront(e.target.value)}
                            className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400 min-h-[60px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Verso (Resposta)</label>
                          <textarea
                            value={editBack}
                            onChange={(e) => setEditBack(e.target.value)}
                            className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm text-slate-600 focus:outline-none focus:border-indigo-400 min-h-[80px]"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(card.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                          >
                            <Save size={14} />
                            Salvar Alteração
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 leading-tight mb-1">{card.front}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{card.back}</p>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => handleStartEdit(card)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Editar card"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Remover card"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!generatedCards.length && !isGenerating && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
            <Loader2 size={48} className="opacity-10" />
            <p className="font-medium">Nenhum card gerado ainda.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 opacity-60">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Velocidade</p>
            <p className="text-sm font-bold text-slate-700">Segundos p/ Deck</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
            <Wand2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualidade</p>
            <p className="text-sm font-bold text-slate-700">Otimizado por IA</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Praticidade</p>
            <p className="text-sm font-bold text-slate-700">Pronto para Estudo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorView;
