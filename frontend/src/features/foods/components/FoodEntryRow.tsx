import { Check, Trash2 } from "lucide-react";
import { format } from "../../../shared/lib/formatters";
import type { Food, SelectedFood } from "../types/food.types";
import { WeightInput } from "./WeightInput";
import "./FoodEntryRow.css";

type FoodEntryRowProps =
  | {
      mode?: "entry";
      food: SelectedFood;
      onWeightChange: (weight: number | "") => void;
      onRemove: () => void;
      selection?: {
        checked: boolean;
        onChange: () => void;
      };
    }
  | {
      mode: "picker";
      food: Food;
      selected: boolean;
      groupName: string;
      onSelect: () => void;
    };

export function FoodEntryRow(props: FoodEntryRowProps) {
  const { food } = props;
  const details = (
    <>
      <span className="food-entry-emoji" aria-hidden="true">
        {food.emoji}
      </span>
      <div className="food-entry-name">
        <strong>{food.name}</strong>
        <span>
          {props.mode === "picker" && `${food.category} · `}
          {format(food.energy)} kcal per 100 g
        </span>
      </div>
    </>
  );

  if (props.mode === "picker") {
    return (
      <li
        className={`food-entry-row is-picker${props.selected ? " is-selected" : ""}`}
      >
        <label className="food-entry-pick-label">
          <input
            className="food-entry-radio"
            type="radio"
            name={props.groupName}
            value={food.id}
            checked={props.selected}
            onChange={props.onSelect}
            aria-label={`Choose ${food.name}`}
          />
          {details}
          {props.selected && (
            <Check className="food-entry-picked" size={20} aria-hidden="true" />
          )}
        </label>
      </li>
    );
  }

  const { onWeightChange, onRemove, selection } = props;
  const energy = (props.food.energy * Number(props.food.weight)) / 100;

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
      {details}
      <div className="food-entry-portion">
        <span className="food-entry-category">{food.category}</span>
        <label className="food-entry-weight">
          <span className="sr-only">Weight for {food.name} in grams</span>
          <WeightInput value={props.food.weight} onChange={onWeightChange} />
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
