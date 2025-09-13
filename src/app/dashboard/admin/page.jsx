"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  MapPin,
  Building,
  Plane,
  Loader2,
  ServerCrash,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  ParkingCircle,
  // --- KOMENTAR: Menambahkan ikon baru untuk Search & Pagination ---
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

// Komponen-komponen (AdminHeader, StatCard, Modals, LocationRow) tidak berubah secara fungsional
const AdminHeader = () => ( <div className="mb-8"> <h1 className="text-3xl font-bold text-gray-800 dark:text-white"> Admin Panel </h1> <p className="text-gray-500 dark:text-gray-400"> Kelola semua lokasi parkir di sini. </p> </div> );
const StatCard = ({ title, value, icon: Icon }) => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4"> <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full"> <Icon className="w-6 h-6 text-blue-500" /> </div> <div> <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p> <p className="text-2xl font-bold text-gray-800 dark:text-white"> {value} </p> </div> </div> );
const Modal = ({ children, isOpen, onClose }) => { return ( <AnimatePresence> {isOpen && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} > <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()} > {children} </motion.div> </motion.div> )} </AnimatePresence> ); };
const DeleteConfirmationModal = ({ location, onConfirm, onCancel, isDeleting, }) => ( <> <div className="p-6"> <div className="flex items-start"> <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10"> <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" /> </div> <div className="ml-4 text-left"> <h3 className="text-lg font-bold text-gray-900 dark:text-white"> Hapus Lokasi </h3> <div className="mt-2"> <p className="text-sm text-gray-500 dark:text-gray-400"> Apakah Anda yakin ingin menghapus{" "} <strong>{location?.name}</strong>? Tindakan ini tidak dapat diurungkan. Semua slot parkir yang terkait juga akan dihapus. </p> </div> </div> </div> </div> <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg"> <button onClick={onCancel} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900" > Batal </button> <button onClick={onConfirm} disabled={isDeleting} type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:bg-red-400" > {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ya, Hapus </button> </div> </> );
const EditLocationModal = ({ location, onSave, onCancel, isSaving }) => { const [formData, setFormData] = useState({ name: location?.name || "", address: location?.address || "", type: location?.type || "MALL", }); useEffect(() => { if (location) { setFormData({ name: location.name, address: location.address, type: location.type, }); } }, [location]); const handleChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); }; const handleSave = (e) => { e.preventDefault(); onSave(formData); }; return ( <form onSubmit={handleSave}> <div className="p-6"> <div className="flex justify-between items-center mb-4"> <h3 className="text-lg font-bold text-gray-900 dark:text-white"> Edit Lokasi </h3> <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600" > <X /> </button> </div> <div className="space-y-4"> <div> <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" > Nama Lokasi </label> <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required /> </div> <div> <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" > Alamat </label> <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required /> </div> <div> <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" > Tipe </label> <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" > <option>MALL</option> <option>BANDARA</option> <option>GEDUNG</option> </select> </div> </div> </div> <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg"> <button onClick={onCancel} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900" > Batal </button> <button type="submit" disabled={isSaving} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400" > {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Perubahan </button> </div> </form> ); };
const LocationRow = ({ location, onEditClick, onDeleteClick }) => { const TypeIcon = ({ type }) => { switch (type.toUpperCase()) { case "MALL": return <Building className="w-5 h-5 text-purple-500" />; case "BANDARA": return <Plane className="w-5 h-5 text-sky-500" />; case "GEDUNG": return <Building className="w-5 h-5 text-orange-500" />; default: return <MapPin className="w-5 h-5 text-gray-500" />; } }; return ( <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-4"> <TypeIcon type={location.type} /> {location.name} </td> <td className="px-6 py-4 text-center">{location.address}</td> <td className="px-6 py-4 text-center">{location.type}</td> <td className="px-6 py-4 text-center"> {location.available_slots} / {location.total_slots} </td> <td className="px-6 py-4"> <div className="flex justify-center gap-4"> <button onClick={() => onEditClick(location)} className="text-blue-500 hover:text-blue-700" > <Edit className="w-4 h-4" /> </button> <button onClick={() => onDeleteClick(location)} className="text-red-500 hover:text-red-700" > <Trash2 className="w-4 h-4" /> </button> </div> </td> </tr> ); };

// --- Komponen Utama ---
export default function AdminLocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [newName, setNewName] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newType, setNewType] = useState("MALL");
    const [newSlots, setNewSlots] = useState(100);

    // --- KOMENTAR: State baru untuk Search & Pagination ---
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLocations, setTotalLocations] = useState(0);
    const ITEMS_PER_PAGE = 5;

    // --- KOMENTAR: Fungsi Fetch Diperbarui untuk menerima page dan search ---
    const fetchLocations = useCallback(async (page, search) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/locations?page=${page}&search=${search}`);
            if (!response.ok) {
                throw new Error('Gagal memuat data lokasi');
            }
            const data = await response.json();
            setLocations(data.locations || []);
            setTotalLocations(data.totalLocations || 0);
            setTotalPages(Math.ceil((data.totalLocations || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // --- KOMENTAR: Efek untuk memanggil data saat halaman/pencarian berubah, dengan debounce ---
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchLocations(currentPage, searchTerm);
        }, 300); // Jeda 300ms setelah user berhenti mengetik
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, currentPage, fetchLocations]);


    // Handler Create/Update/Delete diubah sedikit untuk me-refresh data dengan benar
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { name: newName, address: newAddress, type: newType, totalSlots: parseInt(newSlots, 10), };
            const response = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Gagal menambahkan lokasi"); }
            toast.success("Lokasi berhasil ditambahkan!");
            setNewName(""); setNewAddress(""); setNewType("MALL"); setNewSlots(100);
            setCurrentPage(1); // Kembali ke halaman 1
            setSearchTerm(""); // Kosongkan pencarian
            fetchLocations(1, ""); // Ambil data terbaru
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleEdit = async (formData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/locations/${modalState.data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData), });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Gagal menyimpan perubahan"); }
            toast.success("Perubahan berhasil disimpan!");
            setModalState({ type: null, data: null });
            fetchLocations(currentPage, searchTerm);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/locations/${modalState.data.id}`, { method: "DELETE" });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Gagal menghapus lokasi"); }
            toast.success("Lokasi berhasil dihapus!");
            setModalState({ type: null, data: null });
            fetchLocations(currentPage, searchTerm);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- KOMENTAR: Stat card sekarang mengambil total lokasi dari state agar akurat dengan pencarian ---
    const totalSlots = loading ? "..." : (locations || []).reduce((sum, loc) => sum + (loc.total_slots || 0), 0);
    const availableLocations = loading ? "..." : (locations || []).filter((loc) => (loc.available_slots || 0) > 0).length;

    return (
        <div className="space-y-8">
            <AdminHeader />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Lokasi" value={loading ? "..." : totalLocations} icon={MapPin} />
                <StatCard title="Total Slot Parkir" value={totalSlots} icon={ParkingCircle} />
                <StatCard title="Lokasi Tersedia" value={availableLocations} icon={Building} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Tambah Lokasi Baru</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lokasi</label>
                        <input type="text" id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Grand Indonesia" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                        <input type="text" id="address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="e.g., Jl. MH Thamrin No.1" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                        <select id="type" value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>MALL</option>
                            <option>BANDARA</option>
                            <option>GEDUNG</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="slots" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Slot</label>
                        <input type="number" id="slots" value={newSlots} onChange={(e) => setNewSlots(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" required />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                        {isSubmitting ? "Menyimpan..." : "Tambah"}
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {/* --- KOMENTAR: Menambahkan Search Bar --- */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Daftar Lokasi ({totalLocations})</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau tipe..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                    </div>
                </div>

                {loading ? ( <div className="flex justify-center items-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> ) 
                : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama Lokasi</th>
                                    <th scope="col" className="px-6 py-3 text-center">Alamat</th>
                                    <th scope="col" className="px-6 py-3 text-center">Tipe</th>
                                    <th scope="col" className="px-6 py-3 text-center">Slot Tersedia</th>
                                    <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {locations.map((location) => (
                                        <LocationRow
                                            key={location.id}
                                            location={location}
                                            onEditClick={() => setModalState({ type: "edit", data: location })}
                                            onDeleteClick={() => setModalState({ type: "delete", data: location })}
                                        />
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {(!loading && locations.length === 0) && (
                            <div className="text-center py-16 text-gray-500">
                                <ServerCrash className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h4 className="text-xl font-semibold">Tidak Ditemukan</h4>
                                <p>Tidak ada lokasi yang cocok dengan pencarian Anda.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- KOMENTAR: Menambahkan Kontrol Pagination --- */}
                {totalPages > 1 && (
                    <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <div className="flex gap-2">
                             <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                             >
                                <ChevronLeft size={16} /> Sebelumnya
                            </button>
                            <span className="px-4 py-1 font-semibold text-gray-800 dark:text-white">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                Berikutnya <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={modalState.type === "edit"} onClose={() => setModalState({ type: null, data: null })}>
                <EditLocationModal location={modalState.data} onSave={handleEdit} onCancel={() => setModalState({ type: null, data: null })} isSaving={isSubmitting} />
            </Modal>
            <Modal isOpen={modalState.type === "delete"} onClose={() => setModalState({ type: null, data: null })}>
                <DeleteConfirmationModal location={modalState.data} onConfirm={handleDelete} onCancel={() => setModalState({ type: null, data: null })} isDeleting={isSubmitting} />
            </Modal>
        </div>
    );
}

