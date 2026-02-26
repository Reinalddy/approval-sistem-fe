'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Tipe data sesuai response API Laravel kita
interface ClaimStats {
    total: number;
    draft: number;
    submitted: number;
    reviewed: number;
    approved: number;
    rejected: number;
}

export default function DashboardStatsPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<ClaimStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/claims/stats');
                if (response.data.code === 200) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Gagal mengambil statistik', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading || !stats) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Menyiapkan data untuk dirender ke dalam Recharts
    const chartData = [
        { name: 'Draft', jumlah: stats.draft, fill: '#94a3b8' }, // Slate 400
        { name: 'Submitted', jumlah: stats.submitted, fill: '#3b82f6' }, // Blue 500
        { name: 'Reviewed', jumlah: stats.reviewed, fill: '#eab308' }, // Yellow 500
        { name: 'Approved', jumlah: stats.approved, fill: '#22c55e' }, // Green 500
        { name: 'Rejected', jumlah: stats.rejected, fill: '#ef4444' }, // Red 500
    ];

    // Kalkulasi untuk Card "Menunggu Diproses" (Gabungan submitted & reviewed)
    const waitingProcess = stats.submitted + stats.reviewed;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Selamat datang, {user?.name}. Berikut adalah ringkasan data klaim asuransi saat ini.
                </p>
            </div>

            {/* CARDS STATISTIK */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu Diproses</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{waitingProcess}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {stats.submitted} | Reviewed: {stats.reviewed}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* CHART SECTION */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Distribusi Status Klaim</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}