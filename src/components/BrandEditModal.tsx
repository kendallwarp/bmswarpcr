import React, { useState, useRef } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import { compressImage } from '../utils/compressor';
import { PLATFORMS, type Platform, type Brand } from '../types';

interface BrandEditModalProps {
    brand: Brand;
    onClose: () => void;
}

export const BrandEditModal: React.FC<BrandEditModalProps> = ({ brand, onClose }) => {
    const { updateBrand } = useBrand();
    const [name, setName] = useState(brand.name);
    const [industry, setIndustry] = useState(brand.industry || '');
    const [logo, setLogo] = useState(brand.logo || '');
    const [networks, setNetworks] = useState<Platform[]>(brand.activeNetworks || []);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const base64 = await compressImage(e.target.files[0]);
            setLogo(base64);
        }
    };

    const toggleNetwork = (p: Platform) => {
        setNetworks(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateBrand(brand.id, {
                name,
                industry,
                logo,
                activeNetworks: networks
            });
            onClose();
        } catch (error) {
            console.error('Failed to update brand:', error);
            alert('Error updating brand');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Edit Brand</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="dark:text-white" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden transition-colors"
                        >
                            {logo ? <img src={logo} className="w-full h-full object-cover" alt="Logo" /> : <Upload />}
                        </div>
                        <input type="file" ref={fileRef} hidden onChange={handleLogo} accept="image/*" />
                        <div>
                            <p className="font-medium dark:text-gray-200">Brand Logo</p>
                            <p className="text-sm text-gray-500">Click to update (PNG/JPG)</p>
                        </div>
                    </div>

                    <input
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Brand Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />

                    <input
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Industry (e.g. Retail, Tech)"
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Active Networks</label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => toggleNetwork(p)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${networks.includes(p)
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
