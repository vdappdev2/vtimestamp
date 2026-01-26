/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Arctic Glacier / Nordic Fjord theme
        glacier: {
          // Light mode
          'ice-white': '#F8FAFC',
          'pure-white': '#FFFFFF',
          'navy': '#1E3A5F',
          'steel': '#64748B',
          'pale-blue': '#E2E8F0',
          'sky': '#3B82F6',
          'teal': '#14B8A6',
          'muted-red': '#DC2626',
          // Dark mode
          'deep-navy': '#0F172A',
          'slate': '#1E293B',
          'ice': '#F1F5F9',
          'steel-light': '#94A3B8',
          'slate-gray': '#334155',
          'ice-blue': '#60A5FA',
          'teal-light': '#2DD4BF',
          'coral': '#F87171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hash': ['0.875rem', { lineHeight: '1.25rem', fontFamily: 'JetBrains Mono, monospace' }],
      },
      spacing: {
        // 4px base unit system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      }
    },
  },
  plugins: [],
}
