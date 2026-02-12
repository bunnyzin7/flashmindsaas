import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Bold, Italic, List } from 'lucide-react';
import { Deck } from '../types';

interface CreateCardModalProps {
    onClose: () => void;
    decks: Deck[];
    onSave: (deckId: string, front: string, back: string) => void;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ onClose, decks, onSave }) => {
    const [selectedDeckId, setSelectedDeckId] = useState<string>('');
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const frontInputRef = useRef<HTMLTextAreaElement>(null);
    const backInputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-select the first deck if available
    useEffect(() => {
        if (decks.length > 0 && !selectedDeckId) {
            setSelectedDeckId(decks[0].id);
        }
    }, [decks, selectedDeckId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDeckId && front.trim() && back.trim()) {
            onSave(selectedDeckId, front, back);
        }
    };

    const insertFormatting = (
        ref: React.RefObject<HTMLTextAreaElement>,
        setter: React.Dispatch<React.SetStateAction<string>>,
        value: string,
        format: 'bold' | 'italic' | 'list'
    ) => {
        if (!ref.current) return;

        const start = ref.current.selectionStart;
        const end = ref.current.selectionEnd;
        const selectedText = value.substring(start, end);
        let newText = '';
        let newCursorPos = 0;

        if (format === 'bold') {
            newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
            // If text was selected, put cursor after. If empty, put cursor inside.
            newCursorPos = selectedText ? end + 4 : start + 2;
        } else if (format === 'italic') {
            newText = value.substring(0, start) + `_${selectedText}_` + value.substring(end);
            newCursorPos = selectedText ? end + 2 : start + 1;
        } else if (format === 'list') {
            newText = value.substring(0, start) + `\n- ${selectedText}` + value.substring(end);
            newCursorPos = end + 3;
        }

        setter(newText);

        // Need to defer setting selection range to allow state update/render
        setTimeout(() => {
            if (ref.current) {
                ref.current.focus();
                ref.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const Toolbar = ({
        targetRef,
        value,
        setter
    }: {
        targetRef: React.RefObject<HTMLTextAreaElement>,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    }) => (
        <div className="flex items-center gap-2 mb-2 px-2">
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                onClick={() => insertFormatting(targetRef, setter, value, 'bold')}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Negrito"
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                onClick={() => insertFormatting(targetRef, setter, value, 'italic')}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Itálico"
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                onClick={() => insertFormatting(targetRef, setter, value, 'list')}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Lista"
            >
                <List size={16} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content - Increased width to max-w-4xl */}
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Novo Card Manual</h2>
                        <p className="text-slate-500 font-medium">Adicione uma nova pergunta e resposta ao seu baralho.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Deck Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Salvar no Baralho
                        </label>
                        <select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 appearance-none cursor-pointer"
                        >
                            {decks.map(deck => (
                                <option key={deck.id} value={deck.id}>
                                    {deck.name} ({deck.cards.length} cards)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Front */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs font-bold text-indigo-500 uppercase tracking-widest ml-1">
                                    Frente (Pergunta)
                                </label>
                                <Toolbar targetRef={frontInputRef} value={front} setter={setFront} />
                            </div>
                            <textarea
                                ref={frontInputRef}
                                autoFocus
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                placeholder="Ex: Qual a capital da França?"
                                className="w-full h-64 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300/50 resize-none leading-relaxed"
                                required
                            />
                        </div>

                        {/* Back */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest ml-1">
                                    Verso (Resposta)
                                </label>
                                <Toolbar targetRef={backInputRef} value={back} setter={setBack} />
                            </div>
                            <textarea
                                ref={backInputRef}
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                placeholder="Ex: Paris"
                                className="w-full h-64 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-emerald-300/50 resize-none leading-relaxed"
                                required
                            />
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
                            disabled={!selectedDeckId || !front.trim() || !back.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            <span>Salvar Card</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCardModal;
