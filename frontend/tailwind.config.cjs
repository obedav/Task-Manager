/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2:        'var(--surface-2)',
          elevated: 'var(--surface-elevated)',
        },
        primary: {
          DEFAULT: 'var(--royal)',
          dark:    'var(--royal-dark)',
          light:   'var(--royal-light)',
        },
        accent: {
          DEFAULT: 'var(--gold)',
          dark:    'var(--gold-dark)',
          light:   'var(--gold-light)',
        },
        content: {
          DEFAULT: 'var(--text)',
          muted:   'var(--text-muted)',
          subtle:  'var(--text-subtle)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg:      'var(--success-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg:      'var(--warning-bg)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          bg:      'var(--danger-bg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          bg:      'var(--info-bg)',
        },
        priority: {
          high:   'var(--priority-high)',
          medium: 'var(--priority-medium)',
          low:    'var(--priority-low)',
        },
      },
    },
  },
  plugins: [],
}
