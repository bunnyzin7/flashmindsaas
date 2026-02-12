import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface UsageContextType {
    usageCount: number;
    limit: number;
    incrementUsage: () => Promise<void>;
    hasReachedLimit: boolean;
    loading: boolean;
    isPro: boolean;
}

const UsageContext = createContext<UsageContextType>({
    usageCount: 0,
    limit: 3,
    incrementUsage: async () => { },
    hasReachedLimit: false,
    loading: true,
    isPro: false,
});

export const useUsage = () => useContext(UsageContext);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [usageCount, setUsageCount] = useState(0);
    const [limit, setLimit] = useState(3);
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<'free' | 'pro'>('free');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetchUsage();
    }, [user]);

    const fetchUsage = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('usage_count, usage_limit, last_reset_date, plan')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching usage:', error);
                return;
            }

            if (data) {
                setPlan(data.plan === 'pro' ? 'pro' : 'free');
                const now = new Date();
                const lastReset = data.last_reset_date ? new Date(data.last_reset_date) : new Date(0);

                // Check if we need to reset (new month)
                if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
                    await resetUsage(user.id);
                } else {
                    setUsageCount(data.usage_count || 0);
                    // If plan is pro, ensure limit is high
                    if (data.plan === 'pro') {
                        setLimit(50);
                    } else {
                        setLimit(data.usage_limit || 3);
                    }
                }
            }
        } catch (error) {
            console.error('Error in fetchUsage:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetUsage = async (userId: string) => {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('profiles')
            .update({
                usage_count: 0,
                last_reset_date: now
            })
            .eq('id', userId);

        if (!error) {
            setUsageCount(0);
        }
    };

    const incrementUsage = async () => {
        if (!user) return;

        // Optimistic update
        setUsageCount(prev => prev + 1);

        try {
            const { error } = await supabase.rpc('increment_usage_count', { user_id: user.id });

            if (error) {
                // Fallback to direct update if RPC fails (or doesn't exist yet)
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ usage_count: usageCount + 1 })
                    .eq('id', user.id);

                if (updateError) {
                    // Revert optimistic update on error
                    setUsageCount(prev => prev - 1);
                    console.error('Error updating usage:', updateError);
                }
            }
        } catch (error) {
            console.error('Error incrementing usage:', error);
            setUsageCount(prev => prev - 1);
        }
    };

    const hasReachedLimit = usageCount >= limit;

    const isPro = plan === 'pro';

    return (
        <UsageContext.Provider value={{ usageCount, limit, incrementUsage, hasReachedLimit: isPro ? (usageCount >= limit) : hasReachedLimit, loading, isPro }}>
            {children}
        </UsageContext.Provider>
    );
};

