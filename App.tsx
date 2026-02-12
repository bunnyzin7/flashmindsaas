
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UsageProvider } from './contexts/UsageContext';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0d24] flex items-center justify-center">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <AuthView />;
    }

    return <Dashboard />;
};

export default function App() {
    return (
        <AuthProvider>
            <UsageProvider>
                <AppContent />
            </UsageProvider>
        </AuthProvider>
    );
}
