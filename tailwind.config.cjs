/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    facebook: '#1877F2',
                    instagram: '#E4405F',
                    linkedin: '#0A66C2',
                    whatsapp: '#25D366',
                    tiktok: '#000000',
                    google: '#4285F4',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
