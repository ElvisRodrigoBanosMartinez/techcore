// src/constants/categories.js

export const CATEGORY_META = {
  'Incorporación': { color: '#7c3aed', bg: 'bg-violet-500/10 text-violet-400 border-violet-500/30', icon: '🚀' },
  'Beneficios':    { color: '#2563eb', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       icon: '🎁' },
  'Desarrollo':    { color: '#059669', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '📈' },
  'Capacitación':  { color: '#0891b2', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',         icon: '🎓' },
  'Operaciones':   { color: '#d97706', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',    icon: '⚙️' },
  'Cultura':       { color: '#db2777', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',       icon: '🌟' },
}

export const CATEGORIES = Object.keys(CATEGORY_META)

export function getCategoryMeta(cat) {
  return CATEGORY_META[cat] ?? { color: '#6b7280', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: '📁' }
}
