import { db } from '../db';


export const exportBackup = async () => {
    try {
        const posts = await db.posts.toArray();
        const backupData = {
            version: 1,
            createdAt: new Date().toISOString(),
            posts
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `content_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Backup failed', err);
        alert('Failed to generate backup');
    }
};

export const restoreBackup = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (!json || !json.posts) throw new Error('Invalid backup file');

                // Confirm
                if (!confirm(`Restore ${json.posts.length} posts? This will merge with existing data.`)) {
                    return resolve();
                }

                await db.posts.bulkPut(json.posts);
                alert('Backup restored successfully!');
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

export const clearAllData = async () => {
    if (confirm('ARE YOU SURE? This will delete ALL posts permanently.')) {
        if (confirm('Really? This cannot be undone.')) {
            await db.posts.clear();
            alert('All data cleared.');
            window.location.reload();
        }
    }
};
