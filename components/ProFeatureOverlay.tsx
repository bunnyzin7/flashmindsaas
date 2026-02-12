import React from 'react';
import { Lock } from 'lucide-react';
import { useUsage } from '../contexts/UsageContext';

interface ProFeatureOverlayProps {
    children: React.ReactNode;
    onSubscribeClick?: () => void;
}

export const ProFeatureOverlay: React.FC<ProFeatureOverlayProps> = ({
    children,
    onSubscribeClick
}) => {
    const { isPro } = useUsage();

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-2xl">
            <div className="filter blur-sm select-none pointer-events-none transition-all duration-300 group-hover:blur-md">
                {children}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 backdrop-blur-[2px]">
                <button
                    onClick={onSubscribeClick}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-indigo-600/30"
                >
                    <Lock size={18} />
                    Torne-se Pro
                </button>
            </div>
        </div>
    );
};
