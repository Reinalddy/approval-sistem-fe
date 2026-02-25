'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FilePlus, Send, Loader2 } from 'lucide-react';

export default function UserDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchMyClaims = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/claims/my');
            setClaims(res.data.data);
        } catch (error) {
            console.error('Gagal mengambil data klaim', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, []);

    // Fungsi Submit (Draft -> Submitted)
    const handleSubmitClaim = async (id: number) => {
        if (actionLoading === id) return; // Mencegah double click (brute force submit)

        setActionLoading(id);
        try {
            await api.patch(`/claims/${id}/submit`, { status: 'submitted' });
            fetchMyClaims(); // Refresh data setelah sukses
        } catch (error) {
            console.error('Gagal submit klaim', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'submitted': return <Badge className="bg-blue-500">Submitted</Badge>;
            case 'reviewed': return <Badge className="bg-yellow-500">Reviewed</Badge>;
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Klaim Saya</h2>
                    <p className="text-muted-foreground">Kelola pengajuan klaim asuransi Anda di sini.</p>
                </div>
                {/* Nanti kita akan buat komponen Modal Dialog untuk form Create Claim di tombol ini */}
                <Button>
                    <FilePlus className="w-4 h-4 mr-2" /> Buat Klaim Baru
                </Button>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Judul Klaim</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Jumlah (Rp)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : claims.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Belum ada data klaim.
                                </TableCell>
                            </TableRow>
                        ) : (
                            claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium">{claim.title}</TableCell>
                                    <TableCell className="truncate max-w-xs">{claim.description}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {/* User hanya bisa mensubmit jika statusnya masih draft */}
                                        {claim.status === 'draft' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSubmitClaim(claim.id)}
                                                disabled={actionLoading === claim.id}
                                            >
                                                {actionLoading === claim.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <><Send className="w-4 h-4 mr-2" /> Ajukan</>
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}