import { Trash2 } from "lucide-react";
import { format } from "../../../shared/lib/formatters";
import type { SelectedFood } from "../types/food.types";
import { WeightInput } from "./WeightInput";
import "./FoodEntryRow.css";

type FoodEntryRowProps = {
  food: SelectedFood;
  onWeightChange: (weight: number | "") => void;
  onRemove: () => void;
  selection?: {
    checked: boolean;
    onChange: () => void;
  };
};

export function FoodEntryRow({
  food,
  onWeightChange,
  onRemove,
  selection,
}: FoodEntryRowProps) {
  const energy = (food.energy * Number(food.weight)) / 100;

  return (
    <li className={`food-entry-row${selection ? " is-selecting" : ""}`}>
      {selection && (
        <input
          className="food-entry-check"
          type="checkbox"
          aria-label={`Select ${food.name}`}
          checked={selection.checked}
          onChange={selection.onChange}
        />
      )}
      <span className="food-entry-emoji" aria-hidden="true">
        {food.emoji}
      </span>
      <div className="food-entry-name">
        <strong>{food.name}</strong>
        <span>{format(food.energy)} kcal per 100 g</span>
      </div>
      <div className="food-entry-portion">
        <span className="food-entry-category">{food.category}</span>
        <label className="food-entry-weight">
          <span className="sr-only">Weight for {food.name} in grams</span>
          <WeightInput value={food.weight} onChange={onWeightChange} />
          <span aria-hidden="true">g</span>
        </label>
      </div>
      <strong className="food-entry-energy">
        {format(energy)} <small>kcal</small>
      </strong>
      <button
        className="food-entry-remove"
        type="button"
        aria-label={`Remove ${food.name}`}
        title={`Remove ${food.name}`}
        onClick={onRemove}
      >
        <Trash2 size={22} />
      </button>
    </li>
  );
}
