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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Send, Loader2, Image as ImageIcon, Eye, CheckCircle, Clock } from 'lucide-react';

export default function UserDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // State Modal Buat Klaim
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', amount: '' });
    const [file, setFile] = useState<File | null>(null);

    // State Modal Detail
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

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

    const handleSubmitClaim = async (id: number) => {
        if (actionLoading === id) return;
        setActionLoading(id);
        try {
            await api.patch(`/claims/${id}/submit`, { status: 'submitted' });
            fetchMyClaims();
        } catch (error) {
            console.error('Gagal submit klaim', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Fungsi Buat Klaim dengan Opsi "Save Draft" atau "Direct Submit"
    const onSubmitNewClaim = async (e: React.FormEvent, actionType: 'draft' | 'submit') => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('amount', formData.amount);
            if (file) {
                data.append('attachment', file);
            }

            // 1. Selalu buat draft terlebih dahulu sesuai aturan urutan sistem
            const res = await api.post('/claims', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newClaimId = res.data.data.id;

            // 2. Jika user pilih "Langsung Ajukan", tembak API submit
            if (actionType === 'submit') {
                await api.patch(`/claims/${newClaimId}/submit`, { status: 'submitted' });
            }

            setFormData({ title: '', description: '', amount: '' });
            setFile(null);
            setIsDialogOpen(false);
            fetchMyClaims();
        } catch (error) {
            console.error('Gagal membuat klaim baru', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDetail = (claim: any) => {
        setSelectedClaim(claim);
        setIsDetailOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'submitted': return <Badge className="bg-blue-500">Submitted (Menunggu Verifikasi)</Badge>;
            case 'reviewed': return <Badge className="bg-yellow-500">Reviewed (Menunggu Keputusan)</Badge>;
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    // Filter Data untuk Tabs
    const draftClaims = claims.filter(c => c.status === 'draft');
    const processClaims = claims.filter(c => c.status === 'submitted' || c.status === 'reviewed');
    const doneClaims = claims.filter(c => c.status === 'approved' || c.status === 'rejected');

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
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada data klaim di kategori ini.</TableCell></TableRow>
                    ) : (
                        data.map((claim) => (
                            <TableRow key={claim.id}>
                                <TableCell className="font-medium">
                                    {claim.title}
                                    {claim.attachment_path && (
                                        <span className="text-xs text-blue-500 flex items-center mt-1">
                                            <ImageIcon className="w-3 h-3 mr-1" /> Berkas terlampir
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => openDetail(claim)}>
                                        <Eye className="w-4 h-4 mr-2" /> Detail
                                    </Button>
                                    {claim.status === 'draft' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSubmitClaim(claim.id)}
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

                {/* MODAL FORM BUAT KLAIM */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><FilePlus className="w-4 h-4 mr-2" /> Buat Klaim Baru</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Buat Klaim Asuransi</DialogTitle>
                            <DialogDescription>Isi detail klaim Anda. Bukti gambar bersifat opsional namun disarankan.</DialogDescription>
                        </DialogHeader>
                        <form className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Klaim</Label>
                                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Jumlah Tagihan (Rp)</Label>
                                <Input id="amount" type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Lengkap</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attachment">Upload Bukti (Opsional)</Label>
                                <Input id="attachment" type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="cursor-pointer" />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                {/* Tombol Simpan Draft Saja */}
                                <Button type="button" variant="secondary" onClick={(e) => onSubmitNewClaim(e, 'draft')} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Draft'}
                                </Button>
                                {/* Tombol Langsung Submit */}
                                <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => onSubmitNewClaim(e, 'submit')} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Langsung Ajukan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABS KATEGORI KLAIM */}
            <Tabs defaultValue="semua" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="semua">Semua</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="proses">Diproses</TabsTrigger>
                    <TabsTrigger value="selesai">Selesai</TabsTrigger>
                </TabsList>
                <TabsContent value="semua">{renderTable(claims)}</TabsContent>
                <TabsContent value="draft">{renderTable(draftClaims)}</TabsContent>
                <TabsContent value="proses">{renderTable(processClaims)}</TabsContent>
                <TabsContent value="selesai">{renderTable(doneClaims)}</TabsContent>
            </Tabs>

            {/* MODAL DETAIL KLAIM */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Detail Klaim</DialogTitle>
                    </DialogHeader>
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
                                    <p className="font-bold text-lg">Rp {new Intl.NumberFormat('id-ID').format(selectedClaim.amount)}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Deskripsi</Label>
                                <div className="p-3 bg-slate-50 rounded-md text-sm mt-1 whitespace-pre-wrap border">
                                    {selectedClaim.description}
                                </div>
                            </div>
                            {selectedClaim.attachment_path && (
                                <div>
                                    <Label className="text-muted-foreground text-xs mb-1 block">Bukti Terlampir</Label>
                                    <div className="border rounded-md overflow-hidden bg-slate-100 flex justify-center items-center h-48">
                                        {/* Pastikan URL backend kamu sesuai (.env NEXT_PUBLIC_API_URL dikurangi /api) */}
                                        <img
                                            src={`http://localhost:8000/storage/${selectedClaim.attachment_path}`}
                                            alt="Bukti Klaim"
                                            className="max-h-full object-contain"
                                        />
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