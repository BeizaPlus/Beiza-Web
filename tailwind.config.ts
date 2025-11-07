import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			gold: 'hsl(var(--accent-gold))',
  			mint: 'hsl(var(--accent-mint))',
  			subtle: 'hsl(var(--text-subtle))'
  		},
  		fontFamily: {
  			sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
  			heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
  			serif: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
  			manrope: ['Manrope', 'system-ui', 'sans-serif'],
  			inter: ['Inter', 'system-ui', 'sans-serif'],
  			satoshi: ['Satoshi', 'Manrope', 'system-ui', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 6px)',
  			sm: 'calc(var(--radius) - 10px)'
  		},
  		boxShadow: {
  			'glass': '0 140px 120px -80px rgba(99,106,125,0.04)',
  			'focus-ring': '0 0 0 2px hsla(var(--accent-gold) / 0.35)'
  		},
  		transitionTimingFunction: {
  			'studio': 'cubic-bezier(0.12, 0.23, 0.5, 1)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(24px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'fade-in-blur': {
  				from: { opacity: '0', filter: 'blur(12px)' },
  				to: { opacity: '1', filter: 'blur(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(1.05)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'accordion-up': 'accordion-up 0.3s cubic-bezier(0.7, 0, 0.84, 0)',
  			'fade-up': 'fade-up 0.6s cubic-bezier(0.12, 0.23, 0.5, 1) both',
  			'fade-in-blur': 'fade-in-blur 0.8s cubic-bezier(0.12, 0.23, 0.5, 1) both',
  			'scale-in': 'scale-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both'
  		}
  	}
  },
  plugins: [animatePlugin],
} satisfies Config;
