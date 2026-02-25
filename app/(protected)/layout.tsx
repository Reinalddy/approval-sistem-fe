'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Ambil _hasHydrated dari store
    const { user, logout, _hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Hanya lakukan pengecekan JIKA Zustand sudah selesai mengambil data dari localStorage
        if (_hasHydrated && !user) {
            router.push('/login');
        }
    }, [user, _hasHydrated, router]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            logout();
            router.push('/login');
        }
    };

    // Tampilkan loading screen menutupi seluruh layar selama proses hydration
    // Ini mencegah UI berkedip (flickering) saat di-refresh
    if (!_hasHydrated || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Topbar Navigation */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                    <LayoutDashboard className="w-6 h-6" />
                    Approval System
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Role: {user.role.name}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}