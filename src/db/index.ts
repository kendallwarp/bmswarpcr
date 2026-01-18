import Dexie, { type Table } from 'dexie';
import type { Post, Brand, KPIData, APICredentials } from '../types';

export class ContentPlannerDB extends Dexie {
    posts!: Table<Post>;
    brands!: Table<Brand>;
    kpis!: Table<KPIData>;
    apiCredentials!: Table<APICredentials>;

    constructor() {
        super('ContentPlannerDB');
        this.version(1).stores({
            posts: '++id, date, platform, status, isPaid, brand' // Indexed fields
        });

        this.version(2).stores({
            brands: 'id, name',
            kpis: 'id, brandId, month'
        });

        this.version(3).stores({
            apiCredentials: 'id, brandId, platform' // Supports: meta, tiktok, whatsapp, linkedin
        });
    }
}

export const db = new ContentPlannerDB();
