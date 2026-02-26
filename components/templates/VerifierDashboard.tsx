'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Eye, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from "sonner"; // Import Toast

export default function VerifierDashboard() {
    const [pendingClaims, setPendingClaims] = useState<any[]>([]);
    const [historyClaims, setHistoryClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

    // State untuk Konfirmasi Dialog
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [resPending, resHistory] = await Promise.all([
                api.get('/claims/submitted'),
                api.get('/claims/history')
            ]);
            setPendingClaims(resPending.data.data);
            setHistoryClaims(resHistory.data.data);
        } catch (error) {
            toast.error("Gagal mengambil data klaim dari server");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Eksekusi API Verifikasi setelah dikonfirmasi
    const executeVerify = async () => {
        if (!confirmDialog.id) return;

        setActionLoading(confirmDialog.id);
        try {
            await api.patch(`/claims/${confirmDialog.id}/verify`, { status: 'reviewed' });
            toast.success("Klaim berhasil diverifikasi dan diteruskan ke Approver!");
            fetchData();
            setIsDetailOpen(false); // Tutup detail modal jika terbuka
        } catch (error) {
            toast.error("Gagal memverifikasi klaim. Silakan coba lagi.");
        } finally {
            setActionLoading(null);
            setConfirmDialog({ isOpen: false, id: null }); // Tutup pop-up konfirmasi
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted': return <Badge className="bg-blue-500">Submitted</Badge>;
            case 'reviewed': return <Badge className="bg-yellow-500">Reviewed</Badge>;
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const renderTable = (data: any[], isHistory: boolean) => (
        <div className="border rounded-md bg-white shadow-sm overflow-hidden mt-4">
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
                        <TableRow><TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8">Tidak ada data.</TableCell></TableRow>
                    ) : (
                        data.map((claim) => (
                            <TableRow key={claim.id}>
                                <TableCell className="font-medium">{claim.user?.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    {claim.title}
                                    {claim.attachment_path && <span className="text-xs text-blue-500 flex items-center mt-1"><ImageIcon className="w-3 h-3 mr-1" /> Terlampir</span>}
                                </TableCell>
                                <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedClaim(claim); setIsDetailOpen(true); }}>
                                        <Eye className="w-4 h-4 mr-2" /> Detail
                                    </Button>
                                    {!isHistory && (
                                        <Button
                                            size="sm"
                                            onClick={() => setConfirmDialog({ isOpen: true, id: claim.id })}
                                            disabled={actionLoading === claim.id}
                                        >
                                            {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Verify</>}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Verifikasi Klaim</h2>
                <p className="text-muted-foreground">Periksa dan validasi klaim yang diajukan oleh User.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="pending">Menunggu Verifikasi</TabsTrigger>
                    <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">{renderTable(pendingClaims, false)}</TabsContent>
                <TabsContent value="history">{renderTable(historyClaims, true)}</TabsContent>
            </Tabs>

            {/* ALERT DIALOG KONFIRMASI VERIFIKASI */}
            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog({ ...confirmDialog, isOpen })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verifikasi Klaim Ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan memvalidasi klaim ini. Status akan berubah menjadi "Reviewed" dan akan diteruskan kepada Approver untuk keputusan final.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={executeVerify} className="bg-blue-600 hover:bg-blue-700">
                            Ya, Verifikasi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* MODAL DETAIL */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    {/* ... (Isi detail persis seperti sebelumnya) ... */}
                    <DialogHeader><DialogTitle>Pemeriksaan Detail Klaim</DialogTitle></DialogHeader>
                    {selectedClaim && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div><Label className="text-xs">Pemohon</Label><p className="font-semibold">{selectedClaim.user?.name}</p></div>
                                <div><Label className="text-xs">Total Tagihan</Label><p className="font-bold text-lg text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(selectedClaim.amount)}</p></div>
                            </div>
                            <div><Label className="text-xs">Judul Klaim</Label><p className="font-medium">{selectedClaim.title}</p></div>
                            <div><Label className="text-xs">Deskripsi</Label><div className="p-3 bg-slate-50 rounded text-sm mt-1 whitespace-pre-wrap border">{selectedClaim.description}</div></div>
                            {selectedClaim.attachment_path && (
                                <div>
                                    <Label className="text-xs mb-1 block">Bukti Terlampir</Label>
                                    <div className="border rounded bg-slate-100 flex justify-center p-2">
                                        <img src={`http://localhost:8000/storage/${selectedClaim.attachment_path}`} alt="Bukti" className="max-h-64 object-contain rounded" />
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                                {selectedClaim.status === 'submitted' && (
                                    <Button onClick={() => setConfirmDialog({ isOpen: true, id: selectedClaim.id })} disabled={actionLoading === selectedClaim.id}>
                                        Verifikasi (Ubah ke Reviewed)
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}