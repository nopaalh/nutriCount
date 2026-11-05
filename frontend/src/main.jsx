import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { create } from 'zustand';
import { Activity, Apple, ArrowDown, ArrowUpRight, BookOpen, ChevronDown, Flame, Leaf, Plus, Search, Sprout, Trash2, Wheat, X } from 'lucide-react';
import './style.css';

// Illustrative values per 100 g. Replace with verified food composition data from the API.
const foods = [
  { id: 'rice', name: 'White rice, cooked', category: 'Grains & cereals', emoji: '🍚', energy: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { id: 'chicken', name: 'Chicken breast, cooked', category: 'Meat & poultry', emoji: '🍗', energy: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'egg', name: 'Egg, boiled', category: 'Eggs & dairy', emoji: '🥚', energy: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
  { id: 'broccoli', name: 'Broccoli, cooked', category: 'Vegetables', emoji: '🥦', energy: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'banana', name: 'Banana', category: 'Fruits', emoji: '🍌', energy: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { id: 'tempeh', name: 'Tempeh', category: 'Plant proteins', emoji: '🫘', energy: 193, protein: 20.3, carbs: 7.6, fat: 10.8, fiber: 0 },
  { id: 'spinach', name: 'Spinach, cooked', category: 'Vegetables', emoji: '🥬', energy: 23, protein: 3, carbs: 3.8, fat: 0.3, fiber: 2.4 },
  { id: 'avocado', name: 'Avocado', category: 'Fruits', emoji: '🥑', energy: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
];
const nutrientRows = [
  ['energy', 'Energy', 'kcal'], ['water', 'Water', 'g'], ['protein', 'Protein', 'g'],
  ['fat', 'Total fat', 'g'], ['carbs', 'Carbohydrate', 'g'], ['fiber', 'Fiber', 'g'], ['ash', 'Ash', 'g'],
  ['calcium', 'Calcium', 'mg'], ['phosphorus', 'Phosphorus', 'mg'], ['iron', 'Iron', 'mg'],
  ['sodium', 'Sodium', 'mg'], ['potassium', 'Potassium', 'mg'], ['copper', 'Copper', 'mg'], ['zinc', 'Zinc', 'mg'],
  ['retinol', 'Retinol', 'µg'], ['betaCarotene', 'Beta carotene', 'µg'], ['totalCarotene', 'Total carotene', 'µg'],
  ['thiamin', 'Thiamin', 'mg'], ['riboflavin', 'Riboflavin', 'mg'], ['niacin', 'Niacin', 'mg'], ['vitaminC', 'Vitamin C', 'mg'],
];
const useNutrition = create((set) => ({
  entries: [{ id: 'rice', weight: 150 }, { id: 'chicken', weight: 100 }, { id: 'broccoli', weight: 80 }],
  add: (id) => set((state) => ({ entries: state.entries.some((item) => item.id === id) ? state.entries.map((item) => item.id === id ? { ...item, weight: item.weight + 100 } : item) : [...state.entries, { id, weight: 100 }] })),
  update: (id, weight) => set((state) => ({ entries: state.entries.map((item) => item.id === id ? { ...item, weight } : item) })),
  remove: (id) => set((state) => ({ entries: state.entries.filter((item) => item.id !== id) })),
  clear: () => set({ entries: [] }),
}));
const format = (value) => Number(value.toFixed(1)).toLocaleString();
const nutrients = [
  { key: 'energy', label: 'Energy', unit: 'kcal', icon: Flame, color: 'orange', description: 'Total energy' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: Activity, color: 'green', description: 'For growth & repair' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', icon: Wheat, color: 'yellow', description: 'Your body’s fuel' },
  { key: 'fat', label: 'Total fat', unit: 'g', icon: Leaf, color: 'mint', description: 'Essential nutrients' },
];
function App() {
  const { entries, add, update, remove, clear } = useNutrition();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selected = entries.map((entry) => ({ ...foods.find((food) => food.id === entry.id), weight: entry.weight }));
  const totals = useMemo(() => Object.fromEntries(['energy', 'protein', 'carbs', 'fat', 'fiber'].map((key) => [key, selected.reduce((sum, food) => sum + food[key] * (Number(food.weight) || 0) / 100, 0)])), [entries]);
  const results = foods.filter((food) => `${food.name} ${food.category}`.toLowerCase().includes(query.toLowerCase()));
  const macros = [{ label: 'Carbs', value: totals.carbs, color: '#91b989' }, { label: 'Protein', value: totals.protein, color: '#3e8065' }, { label: 'Fat', value: totals.fat, color: '#d5bd7d' }];
  const macroSum = macros.reduce((sum, item) => sum + item.value, 0);
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#dashboard"><span className="brand-icon"><Sprout size={20}/></span><span>nutri<span>count</span><small>FOOD & NUTRITION</small></span></a>
      <div className="side-label">WORKSPACE</div>
      <a className="nav-item active" href="#dashboard"><Activity size={17}/> Dashboard</a>
      <a className="nav-item" href="#ingredients"><Apple size={17}/> Food ingredients</a>
      <a className="nav-item" href="#breakdown"><BookOpen size={17}/> Nutrition breakdown</a>
      <div className="sidebar-bottom"><div className="side-tip-icon"><Leaf size={18}/></div><strong>Every ingredient counts.</strong><p>Get to know what’s on your plate, one ingredient at a time.</p><a href="#ingredients">Explore ingredients <ArrowUpRight size={13}/></a></div>
      <div className="side-footer"><span className="avatar">N</span><span><strong>NutriCount</strong></span><ChevronDown size={15}/></div>
    </aside>
    <main className="main" id="dashboard">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Dashboard</strong></div></header>
      <div className="content">
        <div className="heading-row"><div><h1>Nutrition dashboard <span>✳</span></h1></div><a className="primary-button" href="#ingredients"><Plus size={17}/> Add ingredient</a></div>
        <div className="overview-line"><div><h2>Nutrition overview</h2></div></div>
        <section className="stat-grid" aria-label="Nutrition totals">{nutrients.map(({ key, label, unit, icon: Icon, color, description }) => <article className="stat-card" key={key}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}><Icon size={17}/></span></div><div className="stat-number">{format(totals[key])} <small>{unit}</small></div></article>)}</section>
        <div className="dashboard-grid"><div className="left-column">
          <section className="panel ingredients" id="ingredients"><div className="panel-heading"><div><h2>Your ingredients <span className="count">{selected.length}</span></h2></div><button className="text-button" onClick={clear} disabled={!entries.length}>Clear all</button></div>
            <div className="search-wrap"><Search size={18}/><input aria-label="Search ingredients" placeholder="Search for a food ingredient..." value={query} onFocus={() => setOpen(true)} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}/>{query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}<span className="search-hint">Search foods</span></div>
            {open && <div className="results"><div className="results-heading"><span>{query ? 'Search results' : 'Available ingredients'}</span><button onClick={() => setOpen(false)} aria-label="Close ingredient search"><X size={16}/></button></div>{results.length ? results.map((food) => <button className="result" key={food.id} onClick={() => { add(food.id); setQuery(''); setOpen(false); }}><span className="food-icon">{food.emoji}</span><span className="food-name"><strong>{food.name}</strong><small>{food.category} · {food.energy} kcal / 100 g</small></span><Plus size={17}/></button>) : <p className="no-results">No ingredients found. Try another search.</p>}</div>}
            {selected.length ? <div className="sheet-scroll"><table className="nutrition-sheet"><thead><tr><th scope="col">Food</th><th scope="col">Amount <small>g</small></th>{nutrientRows.map(([key, label, unit]) => <th scope="col" key={key}>{label} <small>{unit}</small></th>)}<th scope="col"><span className="sr-only">Remove</span></th></tr></thead><tbody>{selected.map((food) => <tr key={food.id}><th scope="row"><div className="sheet-food"><span className="food-icon">{food.emoji}</span><span>{food.name}</span></div></th><td><label className="weight"><input aria-label={`Weight of ${food.name} in grams`} type="number" min="0" step="1" value={food.weight} onChange={(e) => update(food.id, e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}/><span>g</span></label></td>{nutrientRows.map(([key]) => <td key={key}>{food[key] == null ? '—' : format(food[key] * (Number(food.weight) || 0) / 100)}</td>)}<td><button className="delete" aria-label={`Remove ${food.name}`} onClick={() => remove(food.id)}><Trash2 size={16}/></button></td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{format(selected.reduce((sum, food) => sum + (Number(food.weight) || 0), 0))}</td>{nutrientRows.map(([key]) => { const complete = selected.every((food) => food[key] != null); return <td key={key}>{complete ? format(selected.reduce((sum, food) => sum + food[key] * (Number(food.weight) || 0) / 100, 0)) : '—'}</td>; })}<td/></tr></tfoot></table></div> : <div className="empty"><Apple size={24}/><strong>Your list is empty</strong><span>Search above to add an ingredient.</span></div>}
            <button className="add-another" onClick={() => { setOpen(true); document.querySelector('.search-wrap input')?.focus(); }}><Plus size={16}/> Add another ingredient</button>
          </section>

        </div><div className="right-column"><section className="panel breakdown" id="breakdown"><div className="panel-heading"><div><h2>Total analysis</h2></div><span className="small-icon"><Activity size={16}/></span></div><div className="energy-summary"><span>Total energy</span><strong>{format(totals.energy)} <small>kcal</small></strong><span>for {selected.length} selected {selected.length === 1 ? 'ingredient' : 'ingredients'}</span></div><div className="macro-bar">{macros.map((item) => <div key={item.label} style={{width: `${macroSum ? item.value / macroSum * 100 : 0}%`, background: item.color}}/>)}</div><div className="macro-list">{macros.map((item) => <div className="macro-row" key={item.label}><span><i style={{background:item.color}}/>{item.label}</span><strong>{format(item.value)} <small>g</small></strong></div>)}<div className="macro-row fiber"><span><i/>Fiber</span><strong>{format(totals.fiber)} <small>g</small></strong></div></div><p className="breakdown-foot">Nutrient amounts reflect the weights you enter.</p></section>

        </div></div>
        <footer><span>© NutriCount</span><span>Small choices, better understanding. <Leaf size={13}/></span></footer>
      </div>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
