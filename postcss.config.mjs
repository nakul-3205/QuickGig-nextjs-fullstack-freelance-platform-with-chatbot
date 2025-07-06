// postcss.config.js
const config = {
  plugins: {
    // Use the specific PostCSS plugin package for Tailwind CSS
    '@tailwindcss/postcss': { // THIS IS THE CRITICAL CHANGE
      // Pass configuration options directly to the plugin
      darkMode: 'class', 
    },
    autoprefixer: {}, // Keep autoprefixer if you have it
  },
};

export default config;
