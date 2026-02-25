'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

export default function ApproverDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ id: number; action: string } | null>(null);

    const fetchReviewedClaims = async () => {
        try {
            setIsLoading(true);
            // Hanya mengambil klaim berstatus reviewed sesuai requirement Approver
            const res = await api.get('/claims/reviewed');
            setClaims(res.data.data);
        } catch (error) {
            console.error('Gagal mengambil data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewedClaims();
    }, []);

    // Mengubah status klaim menjadi approved atau rejected
    const handleApproval = async (id: number, actionType: 'approve' | 'reject', statusValue: 'approved' | 'rejected') => {
        if (actionLoading) return; // Proteksi brute force click

        setActionLoading({ id, action: actionType });
        try {
            await api.patch(`/claims/${id}/${actionType}`, { status: statusValue });
            fetchReviewedClaims(); // Refresh tabel setelah sukses
        } catch (error) {
            console.error(`Gagal ${actionType} klaim`, error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Keputusan Final Klaim</h2>
                <p className="text-muted-foreground">Setujui atau tolak klaim yang telah diverifikasi.</p>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pemohon</TableHead>
                            <TableHead>Judul Klaim</TableHead>
                            <TableHead>Jumlah (Rp)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell>
                            </TableRow>
                        ) : claims.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Tidak ada klaim yang menunggu keputusan.</TableCell>
                            </TableRow>
                        ) : (
                            claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium">{claim.user?.name || 'Unknown'}</TableCell>
                                    <TableCell>{claim.title}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                    <TableCell><Badge className="bg-yellow-500">Reviewed</Badge></TableCell>
                                    <TableCell className="text-center space-x-2">
                                        {/* Tombol Approve */}
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleApproval(claim.id, 'approve', 'approved')}
                                            disabled={actionLoading?.id === claim.id}
                                        >
                                            {actionLoading?.id === claim.id && actionLoading?.action === 'approve' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><ThumbsUp className="w-4 h-4 mr-2" /> Approve</>
                                            )}
                                        </Button>

                                        {/* Tombol Reject */}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleApproval(claim.id, 'reject', 'rejected')}
                                            disabled={actionLoading?.id === claim.id}
                                        >
                                            {actionLoading?.id === claim.id && actionLoading?.action === 'reject' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><ThumbsDown className="w-4 h-4 mr-2" /> Reject</>
                                            )}
                                        </Button>
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