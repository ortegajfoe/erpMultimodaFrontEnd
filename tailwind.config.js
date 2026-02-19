/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary-color)',
                secondary: 'var(--secondary-color)',
            },
            borderRadius: {
                DEFAULT: 'var(--border-radius)',
                btn: 'var(--btn-radius)',
                input: 'var(--input-radius)',
            },
            fontFamily: {
                main: 'var(--font-family)',
            }
        },
    },
    plugins: [],
}
