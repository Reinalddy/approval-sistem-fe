'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function VerifierDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchSubmittedClaims = async () => {
        try {
            setIsLoading(true);
            // Hanya mengambil klaim berstatus submitted sesuai requirement Verifier
            const res = await api.get('/claims/submitted');
            setClaims(res.data.data);
        } catch (error) {
            console.error('Gagal mengambil data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmittedClaims();
    }, []);

    // Mengubah status klaim menjadi reviewed
    const handleVerify = async (id: number) => {
        if (actionLoading === id) return; // Mencegah multiple clicks/brute force submit

        setActionLoading(id);
        try {
            await api.patch(`/claims/${id}/verify`, { status: 'reviewed' });
            fetchSubmittedClaims(); // Refresh tabel setelah sukses
        } catch (error) {
            console.error('Gagal verifikasi klaim', error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Daftar Verifikasi Klaim</h2>
                <p className="text-muted-foreground">Periksa dan validasi klaim yang diajukan oleh User.</p>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pemohon</TableHead>
                            <TableHead>Judul Klaim</TableHead>
                            <TableHead>Jumlah (Rp)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell>
                            </TableRow>
                        ) : claims.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Tidak ada klaim yang menunggu verifikasi.</TableCell>
                            </TableRow>
                        ) : (
                            claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium">{claim.user?.name || 'Unknown'}</TableCell>
                                    <TableCell>{claim.title}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                    <TableCell><Badge className="bg-blue-500">Submitted</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => handleVerify(claim.id)}
                                            disabled={actionLoading === claim.id}
                                        >
                                            {actionLoading === claim.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><CheckCircle className="w-4 h-4 mr-2" /> Verify</>
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