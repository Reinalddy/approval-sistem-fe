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
import { FilePlus, Send, Loader2, Image as ImageIcon } from 'lucide-react';

export default function UserDashboard() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // State untuk Modal Form
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', amount: '' });
    const [file, setFile] = useState<File | null>(null);

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

    // Fungsi untuk Submit Form Buat Klaim Baru
    const onSubmitNewClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Wajib menggunakan FormData karena ada file gambar
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('amount', formData.amount);
            if (file) {
                data.append('attachment', file);
            }

            await api.post('/claims', data, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Header khusus untuk upload file
            });

            // Reset form dan tutup modal setelah sukses
            setFormData({ title: '', description: '', amount: '' });
            setFile(null);
            setIsDialogOpen(false);
            fetchMyClaims(); // Refresh tabel
        } catch (error) {
            console.error('Gagal membuat klaim baru', error);
        } finally {
            setIsSubmitting(false);
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
                    <h2 className="text-2xl font-bold tracking-tight">Pengajuan Klaim</h2>
                    <p className="text-muted-foreground">Kelola pengajuan klaim asuransi Anda di sini.</p>
                </div>

                {/* MODAL DIALOG BUAT KLAIM */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <FilePlus className="w-4 h-4 mr-2" /> Buat Klaim Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Buat Klaim Asuransi</DialogTitle>
                            <DialogDescription>
                                Isi detail klaim Anda. Bukti gambar bersifat opsional namun disarankan.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onSubmitNewClaim} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Klaim</Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Rawat Inap Demam Berdarah"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Jumlah Tagihan (Rp)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    placeholder="Contoh: 2500000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Lengkap</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Jelaskan detail pengobatan atau kejadian..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attachment">Upload Bukti (Opsional)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="attachment"
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="cursor-pointer"
                                    />
                                    {file && <ImageIcon className="w-5 h-5 text-green-500" />}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABEL DATA KLAIM */}
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
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell>
                            </TableRow>
                        ) : claims.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada data klaim.</TableCell>
                            </TableRow>
                        ) : (
                            claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{claim.title}</span>
                                            {/* Indikator jika ada gambar */}
                                            {claim.attachment_path && (
                                                <span className="text-xs text-blue-500 flex items-center mt-1">
                                                    <ImageIcon className="w-3 h-3 mr-1" /> Berkas terlampir
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="truncate max-w-xs">{claim.description}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('id-ID').format(claim.amount)}</TableCell>
                                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                    <TableCell className="text-right">
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