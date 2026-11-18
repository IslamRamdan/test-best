import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Tajawal", "sans-serif"],
            },
            colors: {
                brand: {
                    teal: "#007A78",
                    "teal-light": "#E6F2F2",
                    purple: "#5E35B1",
                    "purple-light": "#F3EFA2",
                    amber: "#E67E22",
                    "amber-light": "#FEF5ED",
                },
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
        },
    },

    plugins: [forms],
};
