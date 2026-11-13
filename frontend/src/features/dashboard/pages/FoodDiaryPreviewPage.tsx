import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  Download,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts/AppLayout";
import { format } from "../../../shared/lib/formatters";
import { FoodEntryRow } from "../../foods/components/FoodEntryRow";
import { foods } from "../../foods/data/foods";
import { NutritionRing } from "../components/NutritionRing";

import { useNutrition } from "../store/useNutritionStore";
import "./FoodDiaryPreviewPage.css";

const nutrientKeys = ["energy", "protein", "carbs", "fat", "fiber"] as const;

export default function FoodDiaryPreviewPage() {
  const { entries, add, update, remove } = useNutrition();

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addQuery, setAddQuery] = useState("");
  const [foodId, setFoodId] = useState(foods[0]?.id ?? "");
  const [weight, setWeight] = useState("100");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const selected = entries.flatMap((entry) => {
    const food = foods.find((item) => item.id === entry.id);
    return food ? [{ ...food, weight: entry.weight }] : [];
  });
  const totals = { energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  for (const food of selected) {
    for (const key of nutrientKeys) {
      totals[key] += (food[key] * Number(food.weight)) / 100;
    }
  }

  const visibleFoods = selected;
  const visibleEnergy = totals.energy;
  const checkedIds = selectedIds.filter((id) =>
    entries.some((entry) => entry.id === id),
  );
  const allVisibleChecked =
    visibleFoods.length > 0 &&
    visibleFoods.every((food) => checkedIds.includes(food.id));
  const availableFoods = foods.filter((food) =>
    `${food.name} ${food.category}`
      .toLowerCase()
      .includes(addQuery.trim().toLowerCase()),
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleVisibleSelection() {
    const visibleIds = visibleFoods.map((food) => food.id);
    setSelectedIds((current) =>
      allVisibleChecked
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  }

  function addFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(weight);
    if (
      !foods.some((food) => food.id === foodId) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }
    const existingWeight = Number(
      entries.find((entry) => entry.id === foodId)?.weight ?? 0,
    );
    add(foodId);
    update(foodId, existingWeight + amount);
    dialogRef.current?.close();
  }

  function exportCsv() {
    const rows = [
      [
        "Food",
        "Category",
        "Weight (g)",
        "Energy (kcal)",
        "Protein (g)",
        "Carbohydrates (g)",
        "Fat (g)",
        "Fiber (g)",
      ],
      ...visibleFoods.map((food) => [
        food.name,
        food.category,
        String(Number(food.weight)),
        ...nutrientKeys.map((key) =>
          ((food[key] * Number(food.weight)) / 100).toFixed(2),
        ),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "nutricount-foods.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <AppLayout page="preview">
      <div className="food-diary-preview">
        <header className="diary-header">
          <div>
            <span className="diary-preview-label">New layout preview</span>
            <h1>Food diary</h1>
            <p>
              {selected.length} {selected.length === 1 ? "food" : "foods"} ·{" "}
              {format(totals.energy)} kcal total
            </p>
          </div>
        </header>

        <div id="/preview/breakdown" className="diary-summary-anchor">
          <NutritionRing totals={totals} />
        </div>

        <section
          className="diary-foods"
          id="/preview/ingredients"
          aria-labelledby="diary-foods-heading"
        >
          <div className="diary-toolbar" role="group" aria-label="Food actions">
            <button
              type="button"
              className="diary-button"
              aria-pressed={selecting}
              onClick={() => {
                setSelecting(!selecting);
                setSelectedIds([]);
              }}
            >
              <CheckCircle2 size={16} /> {selecting ? "Done" : "Select"}
            </button>
            <button
              type="button"
              className="diary-button"
              onClick={exportCsv}
              disabled={!visibleFoods.length}
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              type="button"
              className="diary-button diary-button-dark"
              onClick={() => dialogRef.current?.showModal()}
            >
              <Plus size={17} /> Add food
            </button>
          </div>

          {selecting && (
            <div className="diary-selection-bar">
              <label>
                <input
                  type="checkbox"
                  checked={allVisibleChecked}
                  onChange={toggleVisibleSelection}
                  disabled={!visibleFoods.length}
                />{" "}
                Select visible
              </label>
              <span aria-live="polite">{checkedIds.length} selected</span>
              <button
                type="button"
                className="diary-button"
                disabled={!checkedIds.length}
                onClick={() => {
                  checkedIds.forEach(remove);
                  setSelectedIds([]);
                }}
              >
                <Trash2 size={15} /> Remove selected
              </button>
            </div>
          )}

          <div className="diary-list-heading">
            <h2 id="diary-foods-heading">
              Your foods <span>({visibleFoods.length})</span>
            </h2>
            <span>{format(visibleEnergy)} kcal</span>
          </div>

          {visibleFoods.length ? (
            <ul className="diary-list">
              {visibleFoods.map((food) => (
                <FoodEntryRow
                  key={food.id}
                  food={food}
                  onWeightChange={(value) => update(food.id, value)}
                  onRemove={() => remove(food.id)}
                  selection={
                    selecting
                      ? {
                          checked: checkedIds.includes(food.id),
                          onChange: () => toggleSelection(food.id),
                        }
                      : undefined
                  }
                />
              ))}
            </ul>
          ) : (
            <div className="diary-empty">
              <Search size={26} aria-hidden="true" />
              <h3>Start with your first food</h3>
              <p>
                Add a food and enter its weight to calculate your nutrition.
              </p>
              <button
                className="diary-button"
                type="button"
                onClick={() => dialogRef.current?.showModal()}
              >
                Add food
              </button>
            </div>
          )}
          <p className="diary-data-note">
            Illustrative food data, not verified dietary guidance. This preview
            shares ingredients with your dashboard. Vitamin and mineral values
            are not available yet.
          </p>
        </section>

        <dialog
          className="diary-add-dialog"
          ref={dialogRef}
          aria-labelledby="diary-add-title"
          onClose={() => {
            setAddQuery("");
            setWeight("100");
          }}
        >
          <form onSubmit={addFood}>
            <div className="diary-dialog-heading">
              <div>
                <h2 id="diary-add-title">Add a food</h2>
                <p>Choose a food and enter its weight.</p>
              </div>
              <button
                type="button"
                className="diary-remove"
                aria-label="Close add food"
                onClick={() => dialogRef.current?.close()}
              >
                <X size={20} />
              </button>
            </div>
            <label className="diary-search">
              <Search size={17} />
              <input
                type="search"
                autoFocus
                placeholder="Search available foods"
                aria-label="Search available foods"
                value={addQuery}
                onChange={(event) => setAddQuery(event.target.value)}
              />
            </label>
            <div
              className="diary-available-foods"
              role="group"
              aria-label="Available foods"
            >
              {availableFoods.map((food) => (
                <label
                  className={`diary-food-option${foodId === food.id ? " is-selected" : ""}`}
                  key={food.id}
                >
                  <input
                    type="radio"
                    name="food"
                    value={food.id}
                    checked={foodId === food.id}
                    onChange={() => setFoodId(food.id)}
                  />
                  <span aria-hidden="true">{food.emoji}</span>
                  <span>
                    <strong>{food.name}</strong>
                    <small>
                      {food.category} · {food.energy} kcal / 100 g
                    </small>
                  </span>
                  {foodId === food.id && <Check size={17} aria-hidden="true" />}
                </label>
              ))}
              {!availableFoods.length && (
                <p className="diary-no-results">
                  No foods found. Try another search.
                </p>
              )}
            </div>
            <div className="diary-dialog-footer">
              <label className="diary-add-weight">
                Weight (g)
                <input
                  type="number"
                  required
                  min="0.1"
                  max="100000"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                />
              </label>
              <button
                type="submit"
                className="diary-button diary-button-dark"
                disabled={!availableFoods.some((food) => food.id === foodId)}
              >
                <Plus size={17} /> Add food
              </button>
            </div>
            <p className="diary-dialog-note">
              Adding the same food increases its existing weight.
            </p>
          </form>
        </dialog>
      </div>
    </AppLayout>
  );
}
