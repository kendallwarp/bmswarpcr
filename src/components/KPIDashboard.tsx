import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useBrand } from '../context/BrandContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, MousePointer, Activity, Upload } from 'lucide-react';
import { ImportKPIModal } from './ImportKPIModal';
// Removed unused imports

const KpiCard = ({ title, value, change, icon, trend }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {icon}
            </div>
            <span className={`flex items-center text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change} {trend === 'up' ? <TrendingUp size={16} className="ml-1" /> : <TrendingDown size={16} className="ml-1" />}
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold dark:text-white mt-1">{value}</p>
    </div>
);

export const KPIDashboard: React.FC = () => {
    const { currentBrand } = useBrand();
    const [showImport, setShowImport] = useState(false);
    // Duplicates removed

    const kpiData = useLiveQuery(async () => {
        if (!currentBrand) return [];
        return await db.kpis.where('brandId').equals(currentBrand.id).toArray();
    }, [currentBrand]) || [];

    // handleSync and combinedData removed as they were unused and causing build errors


    // Transform KPI data for charts
    const chartData = useMemo(() => {
        return kpiData.map(kpi => ({
            name: kpi.month.substring(5), // Extract month
            reach: kpi.awareness.reach,
            er: kpi.engagement.engagementRate,
            spend: kpi.financials.totalSpend,
            roas: kpi.financials.roas,
            impressions: kpi.awareness.impressions
        }));
    }, [kpiData]);

    if (!currentBrand) return <div className="p-10 text-center text-gray-500">Select a brand to view insights.</div>;

    // Calculate aggregated metrics
    const metrics = useMemo(() => {
        if (kpiData.length === 0) return null;

        const latest = kpiData[kpiData.length - 1];
        const previous = kpiData[kpiData.length - 2];

        const calcChange = (curr: number, prev: number) => {
            if (!prev) return '+0%';
            const change = ((curr - prev) / prev) * 100;
            return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
        };

        return {
            reach: {
                value: latest.awareness.reach > 1000000
                    ? `${(latest.awareness.reach / 1000000).toFixed(1)}M`
                    : `${(latest.awareness.reach / 1000).toFixed(0)}k`,
                change: previous ? calcChange(latest.awareness.reach, previous.awareness.reach) : '+0%',
                trend: previous ? (latest.awareness.reach > previous.awareness.reach ? 'up' : 'down') : 'up'
            },
            er: {
                value: `${latest.engagement.engagementRate.toFixed(1)}%`,
                change: previous ? calcChange(latest.engagement.engagementRate, previous.engagement.engagementRate) : '+0%',
                trend: previous ? (latest.engagement.engagementRate > previous.engagement.engagementRate ? 'up' : 'down') : 'up'
            },
            spend: {
                value: `$${(latest.financials.totalSpend / 1000).toFixed(1)}k`,
                change: previous ? calcChange(latest.financials.totalSpend, previous.financials.totalSpend) : '+0%',
                trend: previous ? (latest.financials.totalSpend > previous.financials.totalSpend ? 'up' : 'down') : 'up'
            },
            roas: {
                value: `${latest.financials.roas.toFixed(1)}x`,
                change: previous ? calcChange(latest.financials.roas, previous.financials.roas) : '+0%',
                trend: previous ? (latest.financials.roas > previous.financials.roas ? 'up' : 'down') : 'up'
            }
        };
    }, [kpiData]);

    return (
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in">
            <header className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-white flex items-center gap-3">
                        <Activity className="text-blue-500" />
                        Brand Intelligence: {currentBrand.name}
                    </h1>
                    <p className="text-gray-500 mt-2">Executive Performance Overview</p>
                </div>
                <button
                    onClick={() => setShowImport(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all"
                >
                    <Upload size={18} /> Import KPIs
                </button>
            </header>

            {kpiData.length === 0 ? (
                <div className="text-center py-20">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No KPI Data Available</h3>
                    <p className="text-gray-500 mb-6">Import your first KPI dataset to see insights</p>
                    <button
                        onClick={() => setShowImport(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                    >
                        Import KPI Data
                    </button>
                </div>
            ) : (
                <>
                    {/* Executive KPI Cards */}
                    {metrics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <KpiCard title="Total Reach" value={metrics.reach.value} change={metrics.reach.change} icon={<Users />} trend={metrics.reach.trend} />
                            <KpiCard title="Engagement Rate" value={metrics.er.value} change={metrics.er.change} icon={<MousePointer />} trend={metrics.er.trend} />
                            <KpiCard title="Total Spend" value={metrics.spend.value} change={metrics.spend.change} icon={<DollarSign />} trend={metrics.spend.trend} />
                            <KpiCard title="ROAS" value={metrics.roas.value} change={metrics.roas.change} icon={<TrendingUp />} trend={metrics.roas.trend} />
                        </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-6 dark:text-white">Growth & Reach History</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="reach" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-6 dark:text-white">Spend vs. Engagement</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="spend" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showImport && <ImportKPIModal onClose={() => setShowImport(false)} />}
        </div>
    );
};
