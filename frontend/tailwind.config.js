/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    750: '#293548', // between slate-700 and slate-800
                },
            },
        },
    },
    plugins: [],
}
