import { Activity, Flame, Leaf, Plus, Wheat } from 'lucide-react';
import { AppLayout } from '../../../app/layouts/AppLayout';
import { foods } from '../../foods/data/foods';
import { FoodSearch } from '../../foods/components/FoodSearch';
import { FoodTable } from '../../foods/components/FoodTable';
import { useNutrition } from '../store/useNutritionStore';
import { format } from '../../../shared/lib/formatters';

const nutrients = [
  { key: 'energy', label: 'Energy', unit: 'kcal', icon: Flame, color: 'orange' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: Activity, color: 'green' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', icon: Wheat, color: 'yellow' },
  { key: 'fat', label: 'Total fat', unit: 'g', icon: Leaf, color: 'mint' },
] as const;
export default function DashboardPage() {
 const { entries, clear } = useNutrition();
 const selected = entries.flatMap((entry) => { const food = foods.find((item) => item.id === entry.id); return food ? [{ ...food, weight: entry.weight }] : []; });
 const totals = { energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
 for (const food of selected) for (const key of Object.keys(totals) as (keyof typeof totals)[]) totals[key] += food[key] * (Number(food.weight) || 0) / 100;
 const macros = [{ label: 'Carbs', value: totals.carbs, color: '#91b989' }, { label: 'Protein', value: totals.protein, color: '#3e8065' }, { label: 'Fat', value: totals.fat, color: '#d5bd7d' }];
 const macroSum = macros.reduce((sum, item) => sum + item.value, 0);
 return <AppLayout>
   <div className="heading-row">
     <div><h1>Nutrition dashboard</h1></div>
     {/*<a className="primary-button" href="#ingredients"><Plus size={17} /> Add ingredient</a>*/}
   </div>
        <div className="overview-line"><div><h2>Nutrition overview</h2></div></div>
        <section className="stat-grid" aria-label="Nutrition totals">{nutrients.map(({ key, label, unit, icon: Icon, color }) => <article className="stat-card" key={key}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}><Icon size={17}/></span></div><div className="stat-number">{format(totals[key])} <small>{unit}</small></div></article>)}</section>
        <div className="dashboard-grid"><div className="left-column">
          <section className="panel ingredients" id="ingredients"><div className="panel-heading"><div><h2>Your ingredients <span className="count">{selected.length}</span></h2></div><button className="text-button" onClick={clear} disabled={!entries.length}>Clear all</button></div>
            <FoodSearch />
            <FoodTable selected={selected} />
            <button className="add-another" onClick={() => document.querySelector<HTMLInputElement>('.search-wrap input')?.focus()}><Plus size={16}/> Add another ingredient</button>
          </section>

        </div><div className="right-column"><section className="panel breakdown" id="breakdown"><div className="panel-heading"><div><h2>Total analysis</h2></div><span className="small-icon"><Activity size={16}/></span></div><div className="energy-summary"><span>Total energy</span><strong>{format(totals.energy)} <small>kcal</small></strong><span>for {selected.length} selected {selected.length === 1 ? 'ingredient' : 'ingredients'}</span></div><div className="macro-bar">{macros.map((item) => <div key={item.label} style={{width: `${macroSum ? item.value / macroSum * 100 : 0}%`, background: item.color}}/>)}</div><div className="macro-list">{macros.map((item) => <div className="macro-row" key={item.label}><span><i style={{background:item.color}}/>{item.label}</span><strong>{format(item.value)} <small>g</small></strong></div>)}<div className="macro-row fiber"><span><i/>Fiber</span><strong>{format(totals.fiber)} <small>g</small></strong></div></div><p className="breakdown-foot">Nutrient amounts reflect the weights you enter.</p></section>

        </div></div>
 </AppLayout>;
}
