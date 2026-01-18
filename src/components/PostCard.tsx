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

const PlatformConfig: Record<string, { icon: React.ReactNode, bg: string, text: string, pastelBg: string, pastelText: string, darkPastelBg?: string, darkPastelText?: string }> = {
    'Facebook': {
        icon: <Facebook size={10} />,
        bg: 'bg-[#1877F2]',
        text: 'text-white',
        pastelBg: 'bg-[#E7F3FF]',
        pastelText: 'text-[#1877F2]',
        darkPastelBg: 'dark:bg-[#1877F2]/20',
        darkPastelText: 'dark:text-[#6ba6f9]'
    },
    'Instagram': {
        icon: <Instagram size={10} />,
        bg: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500',
        text: 'text-white',
        pastelBg: 'bg-[#FFEFF5]',
        pastelText: 'text-[#D300C5]',
        darkPastelBg: 'dark:bg-[#D300C5]/20',
        darkPastelText: 'dark:text-[#ff80e5]'
    },
    'LinkedIn': {
        icon: <Linkedin size={10} />,
        bg: 'bg-[#0077b5]',
        text: 'text-white',
        pastelBg: 'bg-[#E6F6FF]',
        pastelText: 'text-[#0077b5]',
        darkPastelBg: 'dark:bg-[#0077b5]/20',
        darkPastelText: 'dark:text-[#66c2ff]'
    },
    'Twitter': {
        icon: <Twitter size={10} />,
        bg: 'bg-[#1DA1F2]',
        text: 'text-white',
        pastelBg: 'bg-[#E8F5FE]',
        pastelText: 'text-[#1DA1F2]',
        darkPastelBg: 'dark:bg-[#1DA1F2]/20',
        darkPastelText: 'dark:text-[#71c9f9]'
    },
    'WhatsApp': {
        icon: <MessageCircle size={10} />,
        bg: 'bg-[#25D366]',
        text: 'text-white',
        pastelBg: 'bg-[#E9FBEF]',
        pastelText: 'text-[#128C7E]',
        darkPastelBg: 'dark:bg-[#25D366]/20',
        darkPastelText: 'dark:text-[#4dfba3]'
    },
    'TikTok': {
        icon: <TikTokIcon size={10} />,
        bg: 'bg-black',
        text: 'text-white',
        pastelBg: 'bg-[#F2F2F2]',
        pastelText: 'text-black',
        darkPastelBg: 'dark:bg-white/20',
        darkPastelText: 'dark:text-white'
    },
    'Google Ads': {
        icon: <span className="font-bold text-[8px]">G</span>,
        bg: 'bg-[#4285F4]',
        text: 'text-white',
        pastelBg: 'bg-[#E8F0FE]',
        pastelText: 'text-[#1967D2]',
        darkPastelBg: 'dark:bg-[#4285F4]/20',
        darkPastelText: 'dark:text-[#8ab4f8]'
    },
};

interface PostCardProps {
    post: Post;
    onClick: (post: Post) => void;
    variant?: 'default' | 'minimal';
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, variant = 'default' }) => {
    const config = PlatformConfig[post.platform] || {
        icon: <span className="text-[8px]">•</span>,
        bg: 'bg-gray-500',
        text: 'text-white',
        pastelBg: 'bg-gray-100',
        pastelText: 'text-gray-700',
        darkPastelBg: 'dark:bg-gray-700',
        darkPastelText: 'dark:text-gray-300'
    };

    if (variant === 'minimal') {
        return (
            <div
                onClick={() => onClick(post)}
                className={clsx(
                    "group relative flex items-center gap-2 px-2 py-1.5 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer",
                    config.pastelBg,
                    config.darkPastelBg,
                    post.status === 'Draft' && "border-dashed opacity-80"
                )}
            >
                {/* Minimal Content */}
                <div className={clsx("flex items-center gap-1.5 min-w-0 flex-1", config.pastelText, config.darkPastelText)}>
                    <span className="shrink-0">{config.icon}</span>
                    <span className="text-[10px] mobile:text-[11px] font-bold truncate shrink-0 max-w-[60px]">
                        {post.platform}
                    </span>
                    <span className="text-[10px] mobile:text-[11px] truncate font-medium opacity-90">
                        {post.objective || post.copy || "No Content"}
                    </span>
                </div>
            </div>
        );
    }

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
