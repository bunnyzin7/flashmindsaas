
import React from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'success';
    singleAction?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary',
    singleAction = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle size={28} />;
            case 'success':
                return <CheckCircle size={28} />;
            default:
                return <AlertTriangle size={28} />;
        }
    };

    const getStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100 text-red-600',
                    button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                };
            case 'success':
                return {
                    iconBg: 'bg-emerald-100 text-emerald-600',
                    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                };
            default:
                return {
                    iconBg: 'bg-indigo-100 text-indigo-600',
                    button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-200">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${styles.iconBg}`}>
                    {getIcon()}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex gap-3">
                    {!singleAction && (
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-all"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`flex-1 font-bold py-3.5 rounded-xl text-white shadow-lg transition-all active:scale-95 ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
