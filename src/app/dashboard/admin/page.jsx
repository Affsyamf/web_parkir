'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, MapPin, Building, Plane, Loader2, ServerCrash, Trash2, Edit, ParkingCircle } from 'lucide-react';

const AdminHeader = () => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400">Kelola semua lokasi parkir di sini.</p>
    </div>
);

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
            <Icon className="w-6 h-6 text-blue-500" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const LocationRow = ({ location }) => {
    const TypeIcon = ({ type }) => {
        switch (type.toUpperCase()) {
            case 'MALL': return <Building className="w-5 h-5 text-purple-500" />;
            case 'BANDARA': return <Plane className="w-5 h-5 text-sky-500" />;
            case 'GEDUNG': return <Building className="w-5 h-5 text-orange-500" />;
            default: return <MapPin className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                <TypeIcon type={location.type} />
                {location.name}
            </td>
            <td className="px-6 py-4">{location.address}</td>
            <td className="px-6 py-4">{location.type}</td>
            <td className="px-6 py-4">{location.available_slots} / {location.total_slots}</td>
            <td className="px-6 py-4">
                <div className="flex gap-4">
                    <button className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

export default function AdminLocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newType, setNewType] = useState('MALL');
    const [newSlots, setNewSlots] = useState(100);

    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal memuat data lokasi');
            }
            const data = await response.json();
            // **PERBAIKAN:** Pastikan locations selalu array, meskipun API mengembalikan null/undefined
            setLocations(data.locations || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    address: newAddress,
                    type: newType,
                    totalSlots: parseInt(newSlots, 10),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menambahkan lokasi');
            }
            
            setNewName('');
            setNewAddress('');
            setNewType('MALL');
            setNewSlots(100);
            await fetchLocations();
        } catch (err)
 {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSlots = loading ? '...' : (locations || []).reduce((sum, loc) => sum + (loc.total_slots || 0), 0);
    const availableLocations = loading ? '...' : (locations || []).filter(loc => (loc.available_slots || 0) > 0).length;

    return (
        <div className="space-y-8">
            <AdminHeader />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Lokasi" value={loading ? '...' : (locations || []).length} icon={MapPin} />
                <StatCard title="Total Slot Parkir" value={totalSlots} icon={ParkingCircle} />
                <StatCard title="Lokasi Tersedia" value={availableLocations} icon={Building} />
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

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
                         {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                     </button>
                 </form>
             </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Daftar Lokasi ({!loading && locations ? locations.length : 0})</h3>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-4 text-lg">Memuat lokasi...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                 <tr>
                                     <th scope="col" className="px-6 py-3">Nama Lokasi</th>
                                     <th scope="col" className="px-6 py-3">Alamat</th>
                                     <th scope="col" className="px-6 py-3">Tipe</th>
                                     <th scope="col" className="px-6 py-3">Slot Tersedia</th>
                                     <th scope="col" className="px-6 py-3">Aksi</th>
                                 </tr>
                             </thead>
                            <tbody>
                                {locations && locations.map((location) => (
                                    <LocationRow key={location.id} location={location} />
                                ))}
                            </tbody>
                        </table>
                        {(!locations || locations.length === 0) && (
                            <div className="text-center py-16 text-gray-500">
                                <ServerCrash className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h4 className="text-xl font-semibold">Tidak Ada Lokasi</h4>
                                <p>Silakan tambahkan lokasi baru menggunakan form di atas.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

