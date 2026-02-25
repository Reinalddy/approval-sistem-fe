'use client';

import { useAuthStore } from '@/store/useAuthStore';
import UserDashboard from '@/components/templates/UserDashboard';
import VerifierDashboard from '@/components/templates/VerifierDashboard';
import ApproverDashboard from '@/components/templates/ApproverDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuthStore();

    // Mencegah error render sebelum state Zustand siap
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Render komponen sesuai hak akses Role-Based Access Control (RBAC)
    return (
        <div className="animate-in fade-in duration-500">
            {user.role.name === 'User' && <UserDashboard />}
            {user.role.name === 'Verifier' && <VerifierDashboard />}
            {user.role.name === 'Approver' && <ApproverDashboard />}
        </div>
    );
}