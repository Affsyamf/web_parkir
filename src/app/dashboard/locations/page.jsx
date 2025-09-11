'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Building, Plane, Loader2, ServerCrash, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const LocationCard = ({ location }) => {
    const TypeIcon = ({ type }) => {
        switch (type.toUpperCase()) {
            case 'MALL': return <Building className="w-6 h-6 text-purple-500" />;
            case 'BANDARA': return <Plane className="w-6 h-6 text-sky-500" />;
            case 'GEDUNG': return <Building className="w-6 h-6 text-orange-500" />;
            default: return <MapPin className="w-6 h-6 text-gray-500" />;
        }
    };
    
    const isAvailable = location.available_slots > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <TypeIcon type={location.type} />
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                        {isAvailable ? 'Tersedia' : 'Penuh'}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{location.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {location.address}
                </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Slot Tersedia</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {location.available_slots} / {location.total_slots}
                    </p>
                </div>
                <Link href={`/dashboard/locations/${location.id}`} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                    isAvailable 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-500 cursor-not-allowed'
                }`}>
                    Lihat Detail
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};

export default function BrowseLocationsPage() {
    const [locations, setLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('/api/locations');
                if (!response.ok) throw new Error('Gagal memuat data lokasi.');
                const data = await response.json();
                setLocations(data.locations || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Cari Lokasi Parkir</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Temukan dan pesan tempat parkir Anda dengan mudah.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama mall, gedung, atau alamat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">
                    <ServerCrash className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg">{error}</p>
                </div>
            ) : filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map(location => (
                        <LocationCard key={location.id} location={location} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <ServerCrash className="w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold">Lokasi Tidak Ditemukan</h4>
                    <p>Tidak ada lokasi yang cocok dengan pencarian Anda, atau belum ada lokasi yang ditambahkan.</p>
                </div>
            )}
        </div>
    );
}
