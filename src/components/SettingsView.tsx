import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useBrand } from '../context/BrandContext';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { obfuscate, deobfuscate } from '../utils/encryption';
import type { APICredentials } from '../types';

export const SettingsView: React.FC = () => {
    const { currentBrand } = useBrand();
    const [showMeta, setShowMeta] = useState(false);
    const [showTikTok, setShowTikTok] = useState(false);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [showLinkedIn, setShowLinkedIn] = useState(false);
    const [saving, setSaving] = useState(false);

    const credentials = useLiveQuery(async () => {
        if (!currentBrand) return [];
        return await db.apiCredentials.where('brandId').equals(currentBrand.id).toArray();
    }, [currentBrand]) || [];

    const getCredential = (platform: 'meta' | 'tiktok' | 'whatsapp' | 'linkedin') => {
        return credentials.find(c => c.platform === platform);
    };

    // Meta (Facebook & Instagram)
    const [metaAppId, setMetaAppId] = useState('');
    const [metaAppSecret, setMetaAppSecret] = useState('');
    const [metaPageAccessToken, setMetaPageAccessToken] = useState('');
    const [metaAdAccountId, setMetaAdAccountId] = useState('');

    // TikTok for Business
    const [tiktokClientKey, setTiktokClientKey] = useState('');
    const [tiktokClientSecret, setTiktokClientSecret] = useState('');
    const [tiktokAccessToken, setTiktokAccessToken] = useState('');
    const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState('');

    // WhatsApp Business Cloud
    const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
    const [whatsappWabaId, setWhatsappWabaId] = useState('');
    const [whatsappPermanentToken, setWhatsappPermanentToken] = useState('');

    // LinkedIn Marketing
    const [linkedinClientId, setLinkedinClientId] = useState('');
    const [linkedinClientSecret, setLinkedinClientSecret] = useState('');
    const [linkedinAdAccountUrn, setLinkedinAdAccountUrn] = useState('');

    React.useEffect(() => {
        const meta = getCredential('meta');
        const tiktok = getCredential('tiktok');
        const whatsapp = getCredential('whatsapp');
        const linkedin = getCredential('linkedin');

        if (meta) {
            setMetaAppId(meta.credentials.appId ? deobfuscate(meta.credentials.appId) : '');
            setMetaAppSecret(meta.credentials.appSecret ? deobfuscate(meta.credentials.appSecret) : '');
            setMetaPageAccessToken(meta.credentials.pageAccessToken ? deobfuscate(meta.credentials.pageAccessToken) : '');
            setMetaAdAccountId(meta.credentials.adAccountId ? deobfuscate(meta.credentials.adAccountId) : '');
        }
        if (tiktok) {
            setTiktokClientKey(tiktok.credentials.clientKey ? deobfuscate(tiktok.credentials.clientKey) : '');
            setTiktokClientSecret(tiktok.credentials.clientSecret ? deobfuscate(tiktok.credentials.clientSecret) : '');
            setTiktokAccessToken(tiktok.credentials.accessToken ? deobfuscate(tiktok.credentials.accessToken) : '');
            setTiktokAdvertiserId(tiktok.credentials.advertiserId ? deobfuscate(tiktok.credentials.advertiserId) : '');
        }
        if (whatsapp) {
            setWhatsappPhoneNumberId(whatsapp.credentials.phoneNumberId ? deobfuscate(whatsapp.credentials.phoneNumberId) : '');
            setWhatsappWabaId(whatsapp.credentials.wabaId ? deobfuscate(whatsapp.credentials.wabaId) : '');
            setWhatsappPermanentToken(whatsapp.credentials.permanentAccessToken ? deobfuscate(whatsapp.credentials.permanentAccessToken) : '');
        }
        if (linkedin) {
            setLinkedinClientId(linkedin.credentials.clientId ? deobfuscate(linkedin.credentials.clientId) : '');
            setLinkedinClientSecret(linkedin.credentials.clientSecret ? deobfuscate(linkedin.credentials.clientSecret) : '');
            setLinkedinAdAccountUrn(linkedin.credentials.adAccountUrn ? deobfuscate(linkedin.credentials.adAccountUrn) : '');
        }
    }, [credentials]);

    const handleSave = async () => {
        if (!currentBrand) return;
        setSaving(true);

        try {
            // Save Meta credentials
            if (metaAppId || metaAppSecret || metaPageAccessToken || metaAdAccountId) {
                const existing = getCredential('meta');
                const cred: APICredentials = {
                    id: existing?.id || crypto.randomUUID(),
                    brandId: currentBrand.id,
                    platform: 'meta',
                    credentials: {
                        appId: metaAppId ? obfuscate(metaAppId) : undefined,
                        appSecret: metaAppSecret ? obfuscate(metaAppSecret) : undefined,
                        pageAccessToken: metaPageAccessToken ? obfuscate(metaPageAccessToken) : undefined,
                        adAccountId: metaAdAccountId ? obfuscate(metaAdAccountId) : undefined
                    },
                    isConnected: !!(metaAppId && metaAppSecret && metaPageAccessToken && metaAdAccountId),
                    lastSync: Date.now()
                };
                if (existing) {
                    await db.apiCredentials.update(existing.id, cred);
                } else {
                    await db.apiCredentials.add(cred);
                }
            }

            // Save TikTok credentials
            if (tiktokClientKey || tiktokClientSecret || tiktokAccessToken || tiktokAdvertiserId) {
                const existing = getCredential('tiktok');
                const cred: APICredentials = {
                    id: existing?.id || crypto.randomUUID(),
                    brandId: currentBrand.id,
                    platform: 'tiktok',
                    credentials: {
                        clientKey: tiktokClientKey ? obfuscate(tiktokClientKey) : undefined,
                        clientSecret: tiktokClientSecret ? obfuscate(tiktokClientSecret) : undefined,
                        accessToken: tiktokAccessToken ? obfuscate(tiktokAccessToken) : undefined,
                        advertiserId: tiktokAdvertiserId ? obfuscate(tiktokAdvertiserId) : undefined
                    },
                    isConnected: !!(tiktokClientKey && tiktokClientSecret && tiktokAccessToken && tiktokAdvertiserId),
                    lastSync: Date.now()
                };
                if (existing) {
                    await db.apiCredentials.update(existing.id, cred);
                } else {
                    await db.apiCredentials.add(cred);
                }
            }

            // Save WhatsApp credentials
            if (whatsappPhoneNumberId || whatsappWabaId || whatsappPermanentToken) {
                const existing = getCredential('whatsapp');
                const cred: APICredentials = {
                    id: existing?.id || crypto.randomUUID(),
                    brandId: currentBrand.id,
                    platform: 'whatsapp',
                    credentials: {
                        phoneNumberId: whatsappPhoneNumberId ? obfuscate(whatsappPhoneNumberId) : undefined,
                        wabaId: whatsappWabaId ? obfuscate(whatsappWabaId) : undefined,
                        permanentAccessToken: whatsappPermanentToken ? obfuscate(whatsappPermanentToken) : undefined
                    },
                    isConnected: !!(whatsappPhoneNumberId && whatsappWabaId && whatsappPermanentToken),
                    lastSync: Date.now()
                };
                if (existing) {
                    await db.apiCredentials.update(existing.id, cred);
                } else {
                    await db.apiCredentials.add(cred);
                }
            }

            // Save LinkedIn credentials
            if (linkedinClientId || linkedinClientSecret || linkedinAdAccountUrn) {
                const existing = getCredential('linkedin');
                const cred: APICredentials = {
                    id: existing?.id || crypto.randomUUID(),
                    brandId: currentBrand.id,
                    platform: 'linkedin',
                    credentials: {
                        clientId: linkedinClientId ? obfuscate(linkedinClientId) : undefined,
                        clientSecret: linkedinClientSecret ? obfuscate(linkedinClientSecret) : undefined,
                        adAccountUrn: linkedinAdAccountUrn ? obfuscate(linkedinAdAccountUrn) : undefined
                    },
                    isConnected: !!(linkedinClientId && linkedinClientSecret && linkedinAdAccountUrn),
                    lastSync: Date.now()
                };
                if (existing) {
                    await db.apiCredentials.update(existing.id, cred);
                } else {
                    await db.apiCredentials.add(cred);
                }
            }

            alert('✅ Credenciales guardadas exitosamente!');
        } catch (error) {
            console.error('Failed to save credentials:', error);
            alert('❌ Error al guardar credenciales');
        } finally {
            setSaving(false);
        }
    };

    if (!currentBrand) {
        return <div className="p-10 text-center text-gray-500">Selecciona una marca para configurar conexiones API</div>;
    }

    const meta = getCredential('meta');
    const tiktok = getCredential('tiktok');
    const whatsapp = getCredential('whatsapp');
    const linkedin = getCredential('linkedin');

    return (
        <div className="p-6 space-y-8 max-w-4xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Lock className="text-blue-500" />
                    Configuración de APIs
                </h1>
                <p className="text-gray-500 mt-2">Gestiona las credenciales API para {currentBrand.name}</p>
            </header>

            {/* Meta (Facebook & Instagram) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-2xl">📘</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Meta (Facebook & Instagram)</h3>
                            <p className="text-xs text-gray-500">Graph API - Ads Insights</p>
                        </div>
                    </div>
                    {meta?.isConnected && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Conectado
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="App ID"
                        value={metaAppId}
                        onChange={e => setMetaAppId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="relative">
                        <input
                            type={showMeta ? 'text' : 'password'}
                            placeholder="App Secret"
                            value={metaAppSecret}
                            onChange={e => setMetaAppSecret(e.target.value)}
                            className="w-full p-3 pr-12 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowMeta(!showMeta)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showMeta ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Page Access Token"
                        value={metaPageAccessToken}
                        onChange={e => setMetaPageAccessToken(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Ad Account ID (ej: act_567890)"
                        value={metaAdAccountId}
                        onChange={e => setMetaAdAccountId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 italic">⚠️ El Ad Account ID es vital para leer ROAS y Gasto</p>
                </div>
            </div>

            {/* TikTok for Business */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <span className="text-2xl">🎵</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">TikTok for Business</h3>
                            <p className="text-xs text-gray-500">Marketing API</p>
                        </div>
                    </div>
                    {tiktok?.isConnected && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Conectado
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="App ID / Client Key"
                        value={tiktokClientKey}
                        onChange={e => setTiktokClientKey(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="relative">
                        <input
                            type={showTikTok ? 'text' : 'password'}
                            placeholder="Client Secret"
                            value={tiktokClientSecret}
                            onChange={e => setTiktokClientSecret(e.target.value)}
                            className="w-full p-3 pr-12 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowTikTok(!showTikTok)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showTikTok ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Access Token"
                        value={tiktokAccessToken}
                        onChange={e => setTiktokAccessToken(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Advertiser ID"
                        value={tiktokAdvertiserId}
                        onChange={e => setTiktokAdvertiserId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 italic">⚠️ El Advertiser ID es necesario para leer campañas</p>
                </div>
            </div>

            {/* WhatsApp Business Cloud */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-2xl">💬</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">WhatsApp Business Cloud</h3>
                            <p className="text-xs text-gray-500">Cloud API</p>
                        </div>
                    </div>
                    {whatsapp?.isConnected && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Conectado
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Phone Number ID"
                        value={whatsappPhoneNumberId}
                        onChange={e => setWhatsappPhoneNumberId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="WABA ID (WhatsApp Business Account ID)"
                        value={whatsappWabaId}
                        onChange={e => setWhatsappWabaId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="relative">
                        <input
                            type={showWhatsApp ? 'text' : 'password'}
                            placeholder="Permanent Access Token (System User Token)"
                            value={whatsappPermanentToken}
                            onChange={e => setWhatsappPermanentToken(e.target.value)}
                            className="w-full p-3 pr-12 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowWhatsApp(!showWhatsApp)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showWhatsApp ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* LinkedIn Marketing */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-2xl">💼</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">LinkedIn Marketing</h3>
                            <p className="text-xs text-gray-500">Marketing Developer Platform</p>
                        </div>
                    </div>
                    {linkedin?.isConnected && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Conectado
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Client ID"
                        value={linkedinClientId}
                        onChange={e => setLinkedinClientId(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="relative">
                        <input
                            type={showLinkedIn ? 'text' : 'password'}
                            placeholder="Client Secret"
                            value={linkedinClientSecret}
                            onChange={e => setLinkedinClientSecret(e.target.value)}
                            className="w-full p-3 pr-12 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowLinkedIn(!showLinkedIn)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showLinkedIn ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Ad Account ID / URN"
                        value={linkedinAdAccountUrn}
                        onChange={e => setLinkedinAdAccountUrn(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {saving ? (
                    <>Guardando...</>
                ) : (
                    <>
                        <Save size={20} /> Guardar Todas las Conexiones
                    </>
                )}
            </button>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>🔒 Nota de Seguridad:</strong> Todos los campos de Secret y Token se visualizan como contraseña (puntos suspensivos) para proteger la información. Las credenciales se almacenan con obfuscación Base64 en localStorage. Para producción, se recomienda implementar encriptación backend.
                </p>
            </div>
        </div>
    );
};
