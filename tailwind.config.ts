import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { paper:'#F5F1E8', ink:'#16140F', gold:'#C9A227', indigo:'#1E2A4A' } } }, plugins: [] } satisfies Config;
