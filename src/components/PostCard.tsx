import React from 'react';
import type { Post } from '../types';
import { Facebook, Instagram, Linkedin, MessageCircle, DollarSign, Image as ImageIcon, Twitter } from 'lucide-react';
import clsx from 'clsx';
import { getImageUrl } from '../utils/imageHelper';

// Custom TikTok Icon since Lucide might not have it or it varies
const TikTokIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const PlatformConfig: Record<string, { icon: React.ReactNode, bg: string, text: string }> = {
    'Facebook': { icon: <Facebook size={10} />, bg: 'bg-[#1877F2]', text: 'text-white' },
    'Instagram': { icon: <Instagram size={10} />, bg: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500', text: 'text-white' },
    'LinkedIn': { icon: <Linkedin size={10} />, bg: 'bg-[#0077b5]', text: 'text-white' },
    'Twitter': { icon: <Twitter size={10} />, bg: 'bg-[#1DA1F2]', text: 'text-white' },
    'WhatsApp': { icon: <MessageCircle size={10} />, bg: 'bg-[#25D366]', text: 'text-white' },
    'TikTok': { icon: <TikTokIcon size={10} />, bg: 'bg-black', text: 'text-white' },
    'Google Ads': { icon: <span className="font-bold text-[8px]">G</span>, bg: 'bg-[#4285F4]', text: 'text-white' },
};

interface PostCardProps {
    post: Post;
    onClick: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    const config = PlatformConfig[post.platform] || { icon: <span className="text-[8px]">•</span>, bg: 'bg-gray-500', text: 'text-white' };

    return (
        <div
            onClick={() => onClick(post)}
            className={clsx(
                "group relative flex flex-col gap-1.5 p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer",
                post.status === 'Draft' && "border-dashed opacity-80"
            )}
        >
            {/* Header: Time + Paid Indicator */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {post.time}
                </span>
                {post.isPaid && (
                    <div className="bg-green-100 text-green-700 p-0.5 rounded-full" title="Paid Promotion">
                        <DollarSign size={10} />
                    </div>
                )}
            </div>

            {/* Badge: Icon + Platform */}
            <div className={clsx(
                "self-start inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm",
                config.bg,
                config.text
            )}>
                {config.icon}
                <span>{post.platform}</span>
            </div>

            {/* Content Preview */}
            <div className="flex gap-2 items-start mt-0.5">
                {/* Thumbnail Tiny */}
                <div className="w-8 h-8 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden border border-gray-100 dark:border-gray-600">
                    {post.image ? (
                        <img src={getImageUrl(post.image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={12} />
                        </div>
                    )}
                </div>

                {/* Objective / Copy */}
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">
                        {post.brand}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                        {post.objective || post.copy || "No content"}
                    </div>
                </div>
            </div>
        </div>
    );
};
