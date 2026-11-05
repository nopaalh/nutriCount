import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { foods } from '../data/foods';
import { useNutrition } from '../../dashboard/store/useNutritionStore';

export function FoodSearch() {
 const [query, setQuery] = useState('');
 const [open, setOpen] = useState(false);
 const add = useNutrition((state) => state.add);
 const results = foods.filter((food) => `${food.name} ${food.category}`.toLowerCase().includes(query.toLowerCase()));
 return <>
            <div className="search-wrap"><Search size={18}/><input aria-label="Search ingredients" placeholder="Search for a food ingredient..." value={query} onFocus={() => setOpen(true)} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}/>{query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}<span className="search-hint">Search foods</span></div>
            {open && <div className="results"><div className="results-heading"><span>{query ? 'Search results' : 'Available ingredients'}</span><button onClick={() => setOpen(false)} aria-label="Close ingredient search"><X size={16}/></button></div>{results.length ? results.map((food) => <button className="result" key={food.id} onClick={() => { add(food.id); setQuery(''); setOpen(false); }}><span className="food-icon">{food.emoji}</span><span className="food-name"><strong>{food.name}</strong><small>{food.category} · {food.energy} kcal / 100 g</small></span><Plus size={17}/></button>) : <p className="no-results">No ingredients found. Try another search.</p>}</div>}
 </>;
}
