'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, FileText, Loader2, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname(); // Untuk mendeteksi menu yang aktif

    useEffect(() => {
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

    if (!_hasHydrated || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <ShieldCheck className="w-6 h-6 text-primary mr-2" />
                    <span className="font-bold text-lg text-primary">AQ Approval</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard">
                        <span className={`flex items-center px-4 py-3 rounded-md transition-colors ${pathname === '/dashboard' ? 'bg-slate-100 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <LayoutDashboard className="w-5 h-5 mr-3" />
                            Dashboard
                        </span>
                    </Link>
                    <Link href="/pengajuan">
                        <span className={`flex items-center px-4 py-3 rounded-md transition-colors ${pathname === '/pengajuan' ? 'bg-slate-100 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <FileText className="w-5 h-5 mr-3" />
                            Pengajuan Klaim
                        </span>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Role: {user.role.name}</p>
                    </div>
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header (Hanya muncul di layar kecil) */}
                <header className="md:hidden bg-white border-b h-16 flex items-center justify-between px-4">
                    <div className="font-bold text-primary">AQ Approval</div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

        </div>
    );
}