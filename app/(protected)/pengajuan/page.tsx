'use client';

import { useAuthStore } from '@/store/useAuthStore';
import UserDashboard from '@/components/templates/UserDashboard';
import VerifierDashboard from '@/components/templates/VerifierDashboard';
import ApproverDashboard from '@/components/templates/ApproverDashboard';
import { Loader2 } from 'lucide-react';

export default function PengajuanPage() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Render template tabel berdasarkan Role yang sedang login
    return (
        <div className="animate-in fade-in duration-500">
            {user.role.name === 'User' && <UserDashboard />}
            {user.role.name === 'Verifier' && <VerifierDashboard />}
            {user.role.name === 'Approver' && <ApproverDashboard />}
        </div>
    );
}