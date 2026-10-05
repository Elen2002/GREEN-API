export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcf5',
          100: '#d7f7e6',
          200: '#b2edd1',
          300: '#7dddb6',
          400: '#43c494',
          500: '#1ea678',
          600: '#148761',
          700: '#116c4f',
          800: '#105640',
          900: '#0f4736',
          950: '#07281f',
        },
        chat: {
          bg: '#efeae2',
          panel: '#ffffff',
          sidebar: '#ffffff',
          incoming: '#ffffff',
          outgoing: '#d9fdd3',
          border: '#e9edef',
          muted: '#667781',
          hover: '#f5f6f6'
        }
      }
    },
  },
  plugins: [],
}
