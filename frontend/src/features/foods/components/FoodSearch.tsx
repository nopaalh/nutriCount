import { useId, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { foods } from "../data/foods";
import { useNutrition } from "../../dashboard/store/useNutritionStore";
import "./FoodSearch.css";

export function FoodSearch() {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const add = useNutrition((state) => state.add);

  function closeChooser() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <div className="search-wrap">
        <button
          ref={triggerRef}
          type="button"
          className="food-picker-trigger"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              closeChooser();
            }
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Choose a food
        </button>
      </div>
      <div
        className="results"
        id={listId}
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeChooser();
          }
        }}
      >
        <div className="results-heading">
          <span>Available foods</span>
          <button
            type="button"
            onClick={closeChooser}
            aria-label="Close food chooser"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {foods.map((food) => (
          <button
            type="button"
            className="result"
            key={food.id}
            aria-label={`Add ${food.name}`}
            onClick={() => {
              add(food.id);
              closeChooser();
            }}
          >
            <span className="food-name">
              <strong>{food.name}</strong>
              <small>
                {food.category} · {food.energy} kcal per 100 g
              </small>
            </span>
            <Plus size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
    </>
  );
}
