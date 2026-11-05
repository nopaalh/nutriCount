import { Apple, Trash2 } from 'lucide-react';
import { foods, nutrientRows } from '../data/foods';
import type { SelectedFood } from '../types/food.types';
import { useNutrition } from '../../dashboard/store/useNutritionStore';
import { format } from '../../../shared/lib/formatters';

export function FoodTable({ selected }: { selected: SelectedFood[] }) {
 const { entries, replace, update, remove } = useNutrition();
 return <>
            {selected.length ? <div className="sheet-scroll"><table className="nutrition-sheet"><thead><tr><th scope="col">Food</th><th scope="col">Amount <small>g</small></th>{nutrientRows.map(([key, label, unit]) => <th scope="col" key={key}>{label} <small>{unit}</small></th>)}<th scope="col"><span className="sr-only">Remove</span></th></tr></thead><tbody>{selected.map((food) => <tr key={food.id}><th scope="row" className="editable-cell"><select aria-label={`Food for ${food.name}`} value={food.id} onChange={(e) => replace(food.id, e.target.value)}>{foods.map((option) => <option key={option.id} value={option.id} disabled={option.id !== food.id && entries.some((entry) => entry.id === option.id)}>{option.name}</option>)}</select></th><td className="editable-cell"><label className="weight"><input aria-label={`Weight of ${food.name} in grams`} type="number" min="0" step="1" value={food.weight} onChange={(e) => update(food.id, e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}/><span>g</span></label></td>{nutrientRows.map(([key]) => <td key={key}>{food[key] == null ? '—' : format((food[key] ?? 0) * (Number(food.weight) || 0) / 100)}</td>)}<td><button className="delete" aria-label={`Remove ${food.name}`} onClick={() => remove(food.id)}><Trash2 size={16}/></button></td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{format(selected.reduce((sum, food) => sum + (Number(food.weight) || 0), 0))}</td>{nutrientRows.map(([key]) => { const complete = selected.every((food) => food[key] != null); return <td key={key}>{complete ? format(selected.reduce((sum, food) => sum + (food[key] ?? 0) * (Number(food.weight) || 0) / 100, 0)) : '—'}</td>; })}<td/></tr></tfoot></table></div> : <div className="empty"><Apple size={24}/><strong>Your list is empty</strong><span>Search above to add an ingredient.</span></div>}
 </>;
}
