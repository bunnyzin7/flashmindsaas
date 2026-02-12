
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface StudyStats {
    totalStudyTime: number; // in seconds
    totalCardsReviewed: number;
    averageRetention: number; // percentage
    streak: number; // days
    weeklyActivity: { name: string; cards: number }[];
}

export function useStatistics() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StudyStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                const { data, error } = await supabase
                    .from('study_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (!data || data.length === 0) {
                    setStats({
                        totalStudyTime: 0,
                        totalCardsReviewed: 0,
                        averageRetention: 0,
                        streak: 0,
                        weeklyActivity: generateEmptyWeek(),
                    });
                    setLoading(false);
                    return;
                }

                // Calculate totals
                const totalTime = data.reduce((acc, curr) => acc + curr.duration_seconds, 0);
                const totalCards = data.reduce((acc, curr) => acc + curr.cards_reviewed, 0);
                const totalCorrect = data.reduce((acc, curr) => acc + curr.correct_count, 0);
                const retention = totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0;

                // Calculate Streak
                // Logic: Count consecutive days ending today where session count > 0
                // For simplicity MVP: just check unique days in the last X days, or simple streak from dates string set
                const dates = [...new Set(data.map(d => new Date(d.created_at).toDateString()))];
                // This is a naive streak implementation, but sufficient for MVP
                let streak = 0;
                // Simplified: just return count of unique active days for now or implement better logic later
                streak = dates.length; // Placeholder for actual consecutive streak logic if needed

                // Weekly Activity
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const weeklyActivity = last7Days.map(date => {
                    const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    const dateStr = date.toDateString();
                    const dayCards = data
                        .filter(d => new Date(d.created_at).toDateString() === dateStr)
                        .reduce((acc, curr) => acc + curr.cards_reviewed, 0);

                    return { name: dayStr.charAt(0).toUpperCase() + dayStr.slice(1), cards: dayCards };
                });

                setStats({
                    totalStudyTime: totalTime,
                    totalCardsReviewed: totalCards,
                    averageRetention: retention,
                    streak: streak, // Using unique active days as a proxy for "consistency" for now
                    weeklyActivity,
                });

            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return { stats, loading };
}

function generateEmptyWeek() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        return { name: dayStr.charAt(0).toUpperCase() + dayStr.slice(1), cards: 0 };
    });
}
