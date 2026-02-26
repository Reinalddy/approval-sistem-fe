'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Send, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from "sonner";

export default function UserDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // amount disimpan sebagai string angka murni (tanpa titik)
    const [formData, setFormData] = useState({ title: '', description: '', amount: '' });
    const [file, setFile] = useState<File | null>(null);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const fetchMyClaims = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/claims/my');
            setClaims(res.data.data);
        } catch (error) {
            toast.error("Gagal mengambil data klaim");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMyClaims(); }, []);

    const executeSubmitClaim = async () => {
        if (!confirmDialog.id) return;

        setActionLoading(confirmDialog.id);
        try {
            await api.patch(`/claims/${confirmDialog.id}/submit`, { status: 'submitted' });
            toast.success("Klaim berhasil diajukan ke Verifier!");
            fetchMyClaims();
        } catch (error) {
            toast.error("Gagal mengajukan klaim. Silakan coba lagi.");
        } finally {
            setActionLoading(null);
            setConfirmDialog({ isOpen: false, id: null });
        }
    };

    // --- FUNGSI BARU: Validasi dan Submit Form ---
    const onSubmitNewClaim = async (actionType: 'draft' | 'submit') => {
        // 1. Validasi Manual
        if (!formData.title || !formData.amount || !formData.description) {
            toast.warning("Peringatan: Judul, Jumlah Tagihan, dan Deskripsi wajib diisi!");
            return;
        }
        if (Number(formData.amount) <= 0) {
            toast.warning("Peringatan: Jumlah tagihan harus lebih besar dari 0.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('amount', formData.amount); // Kirim angka murni ke API
            if (file) data.append('attachment', file);

            const res = await api.post('/claims', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newClaimId = res.data.data.id;

            if (actionType === 'submit') {
                await api.patch(`/claims/${newClaimId}/submit`, { status: 'submitted' });
                toast.success("Klaim berhasil dibuat dan langsung diajukan!");
            } else {
                toast.success("Draft klaim berhasil disimpan!");
            }

            setFormData({ title: '', description: '', amount: '' });
            setFile(null);
            setIsDialogOpen(false);
            fetchMyClaims();
        } catch (error) {
            toast.error("Gagal membuat klaim baru.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- FUNGSI BARU: Handler Input Rupiah Real-time ---
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Hanya izinkan karakter angka (hapus titik, huruf, dll)
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, amount: rawValue });
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

    const renderTable = (data: any[]) => (
        <div className="border rounded-md bg-white shadow-sm overflow-hidden mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Judul Klaim</TableHead>
                        <TableHead>Jumlah (Rp)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada data.</TableCell></TableRow>
                    ) : (
                        data.map((claim) => (
                            <TableRow key={claim.id}>
                                <TableCell className="font-medium">
                                    {claim.title}
                                    {claim.attachment_path && <span className="text-xs text-blue-500 flex items-center mt-1"><ImageIcon className="w-3 h-3 mr-1" /> Terlampir</span>}
                                </TableCell>
                                <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedClaim(claim); setIsDetailOpen(true); }}>
                                        <Eye className="w-4 h-4 mr-2" /> Detail
                                    </Button>
                                    {claim.status === 'draft' && (
                                        <Button
                                            size="sm"
                                            onClick={() => setConfirmDialog({ isOpen: true, id: claim.id })}
                                            disabled={actionLoading === claim.id}
                                        >
                                            {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Ajukan</>}
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pengajuan Klaim</h2>
                    <p className="text-muted-foreground">Kelola pengajuan klaim asuransi Anda di sini.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button><FilePlus className="w-4 h-4 mr-2" /> Buat Klaim Baru</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader><DialogTitle>Buat Klaim Asuransi</DialogTitle></DialogHeader>
                        {/* Hapus onSubmit form karena kita eksekusi dari masing-masing tombol */}
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Judul Klaim <span className="text-red-500">*</span></Label>
                                <Input placeholder="Contoh: Rawat Inap" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            {/* INPUT FORMAT RUPIAH REAL-TIME */}
                            <div className="space-y-2">
                                <Label>Jumlah Tagihan (Rp) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text" // Diubah ke text agar bisa menampilkan titik
                                    placeholder="Contoh: 2.500.000"
                                    value={formData.amount ? new Intl.NumberFormat('id-ID').format(Number(formData.amount)) : ''}
                                    onChange={handleAmountChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Deskripsi Lengkap <span className="text-red-500">*</span></Label>
                                <Textarea placeholder="Jelaskan detail kejadian..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Upload Bukti (Opsional)</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="secondary" onClick={() => onSubmitNewClaim('draft')} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Draft'}
                                </Button>
                                <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSubmitNewClaim('submit')} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Langsung Ajukan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="semua" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="semua">Semua</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="proses">Diproses</TabsTrigger>
                    <TabsTrigger value="selesai">Selesai</TabsTrigger>
                </TabsList>
                <TabsContent value="semua">{renderTable(claims)}</TabsContent>
                <TabsContent value="draft">{renderTable(claims.filter(c => c.status === 'draft'))}</TabsContent>
                <TabsContent value="proses">{renderTable(claims.filter(c => c.status === 'submitted' || c.status === 'reviewed'))}</TabsContent>
                <TabsContent value="selesai">{renderTable(claims.filter(c => c.status === 'approved' || c.status === 'rejected'))}</TabsContent>
            </Tabs>

            {/* ALERT DIALOG UNTUK KONFIRMASI */}
            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog({ ...confirmDialog, isOpen })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ajukan Klaim?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin mengajukan klaim ini? Setelah diajukan, klaim akan diperiksa oleh Verifier dan Anda tidak dapat mengubah datanya lagi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={executeSubmitClaim} className="bg-blue-600 hover:bg-blue-700">
                            Ya, Ajukan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* MODAL DETAIL */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Detail Klaim</DialogTitle></DialogHeader>
                    {selectedClaim && (
                        <div className="space-y-4 mt-2">
                            <div>
                                <Label className="text-muted-foreground text-xs">Judul Klaim</Label>
                                <p className="font-semibold">{selectedClaim.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Status Saat Ini</Label>
                                    <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Total Tagihan</Label>
                                    <p className="font-bold text-lg text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(selectedClaim.amount)}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Deskripsi</Label>
                                <div className="p-3 bg-slate-50 rounded text-sm mt-1 whitespace-pre-wrap border">{selectedClaim.description}</div>
                            </div>
                            {selectedClaim.attachment_path && (
                                <div>
                                    <Label className="text-muted-foreground text-xs mb-1 block">Bukti Terlampir</Label>
                                    <div className="border rounded bg-slate-100 flex justify-center p-2">
                                        <img src={`http://localhost:8000/storage/${selectedClaim.attachment_path}`} alt="Bukti Klaim" className="max-h-64 object-contain rounded" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}