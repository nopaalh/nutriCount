import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { FormEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { Plus, Search } from "lucide-react";
import type { Food } from "../types/food.types";
import { FoodEntryRow } from "./FoodEntryRow";
import { WeightInput } from "./WeightInput";
import "./AddFoodDialog.css";

type AddFoodDialogProps = {
  foods: Food[];
  onAddFood: (id: string, weight: number) => void;
  onClose?: () => void;
};

export const AddFoodDialog = forwardRef<HTMLDialogElement, AddFoodDialogProps>(
  function AddFoodDialog({ foods, onAddFood, onClose }, forwardedRef) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const pointerStartedOutside = useRef(false);
    const inputId = useId();
    const listId = `${inputId}-foods`;
    const helpId = `${inputId}-help`;
    const [query, setQuery] = useState("");
    const [foodId, setFoodId] = useState(foods[0]?.id ?? "");
    const [weight, setWeight] = useState<number | "">(100);

    useImperativeHandle(forwardedRef, () => dialogRef.current!);

    function findFoods(value: string) {
      const search = value.trim().toLowerCase();
      return foods.filter((food) =>
        `${food.name} ${food.category}`.toLowerCase().includes(search),
      );
    }

    const matchingFoods = findFoods(query);
    const canAdd =
      matchingFoods.some((food) => food.id === foodId) &&
      Number(weight) > 0 &&
      Number(weight) <= 100000;

    function updateQuery(value: string) {
      setQuery(value);
      const results = findFoods(value);
      setFoodId((current) =>
        results.some((food) => food.id === current)
          ? current
          : (results[0]?.id ?? ""),
      );
    }

    function focusWeight() {
      const input = dialogRef.current?.querySelector<HTMLInputElement>(
        ".add-food-weight input",
      );
      input?.focus();
      input?.select();
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Escape") {
        event.preventDefault();
        dialogRef.current?.close();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const options = Array.from(
          listRef.current?.querySelectorAll<HTMLInputElement>(
            "input[type=radio]",
          ) ?? [],
        );
        const option =
          event.key === "ArrowUp"
            ? options[options.length - 1]
            : (options.find((input) => input.checked) ?? options[0]);
        option?.focus();
        option?.click();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (matchingFoods.length) {
          focusWeight();
        }
      }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const amount = Number(weight);
      if (!canAdd || !Number.isFinite(amount)) {
        return;
      }
      onAddFood(foodId, amount);
      dialogRef.current?.close();
    }

    function isOutsideDialog(clientX: number, clientY: number) {
      const bounds = dialogRef.current?.getBoundingClientRect();
      return Boolean(
        bounds &&
        (clientX < bounds.left ||
          clientX > bounds.right ||
          clientY < bounds.top ||
          clientY > bounds.bottom),
      );
    }

    function handlePointerDown(event: PointerEvent<HTMLDialogElement>) {
      pointerStartedOutside.current =
        event.button === 0 &&
        event.target === event.currentTarget &&
        isOutsideDialog(event.clientX, event.clientY);
    }

    function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
      const shouldClose =
        pointerStartedOutside.current &&
        event.target === event.currentTarget &&
        isOutsideDialog(event.clientX, event.clientY);
      pointerStartedOutside.current = false;
      if (shouldClose) {
        event.currentTarget.close();
      }
    }

    function handleClose() {
      pointerStartedOutside.current = false;
      setQuery("");
      setWeight(100);
      setFoodId((current) =>
        foods.some((food) => food.id === current)
          ? current
          : (foods[0]?.id ?? ""),
      );
      onClose?.();
    }

    return (
      <dialog
        className="add-food-dialog"
        ref={dialogRef}
        aria-labelledby={`${inputId}-title`}
        onClose={handleClose}
        onPointerDown={handlePointerDown}
        onClick={handleBackdropClick}
        onPointerCancel={() => {
          pointerStartedOutside.current = false;
        }}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="sr-only" id={`${inputId}-title`}>
            Add food
          </h2>
          <div className="add-food-search-header">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor={inputId}>
              Search foods
            </label>
            <input
              id={inputId}
              type="search"
              autoFocus
              autoComplete="off"
              placeholder="Search foods"
              aria-controls={listId}
              aria-describedby={helpId}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <fieldset
            className="add-food-choices"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                focusWeight();
              }
            }}
          >
            <legend className="sr-only">Available foods</legend>
            <ul className="add-food-options" id={listId} ref={listRef}>
              {matchingFoods.map((food) => (
                <FoodEntryRow
                  key={food.id}
                  mode="picker"
                  food={food}
                  selected={foodId === food.id}
                  groupName={`${inputId}-choice`}
                  onSelect={() => setFoodId(food.id)}
                />
              ))}
            </ul>
            {!matchingFoods.length && (
              <p className="add-food-no-results" role="status">
                No foods found. Try another food name or category.
              </p>
            )}
          </fieldset>

          <div className="add-food-footer">
            <label className="add-food-weight">
              Weight (g)
              <WeightInput value={weight} onChange={setWeight} required />
            </label>
            <button
              type="submit"
              className="add-food-submit"
              disabled={!canAdd}
            >
              <Plus size={17} aria-hidden="true" /> Add food
            </button>
          </div>
          <p className="add-food-note">
            Adding a food again adds to its current weight.
          </p>
          <div className="add-food-shortcuts" id={helpId}>
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to choose
            </span>
            <span>
              <kbd>↵</kbd> to set weight
            </span>
            <button
              type="button"
              className="add-food-dismiss"
              aria-label="Close food chooser"
              onClick={() => dialogRef.current?.close()}
            >
              <kbd>Esc</kbd> to close
            </button>
          </div>
        </form>
      </dialog>
    );
  },
);
