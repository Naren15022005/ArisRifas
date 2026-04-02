module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aris: {
          red: '#b91c1c',
          redDark: '#7f1d1d',
          gold: '#d4af37',
          goldDark: '#9a7a26',
          black: '#0b0b0b',
          blackSoft: '#0f1720'
        }
      },
      backgroundImage: {
        'hero-black-red': "linear-gradient(180deg, rgba(2,2,2,1) 0%, rgba(8,8,8,0.98) 40%, rgba(185,28,28,0.20) 100%)",
        'hero-black-gold': "linear-gradient(180deg, rgba(2,2,2,1) 0%, rgba(8,8,8,0.98) 40%, rgba(212,175,55,0.20) 100%)",
        'hero-deep': "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(15,15,15,0.98) 30%, rgba(20,20,20,0.96) 60%, rgba(0,0,0,0.85) 100%)",
        'home-composed': "radial-gradient(ellipse 75% 60% at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%), linear-gradient(160deg, rgba(6,4,4,1) 0%, rgba(10,8,8,1) 35%, rgba(14,10,10,1) 65%, rgba(8,6,4,1) 100%)"
      }
    },
  },
  plugins: [],
}
