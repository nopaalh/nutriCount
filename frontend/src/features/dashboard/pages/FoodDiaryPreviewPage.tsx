import { useEffect, useRef, useState } from "react";

import {
  CheckCircle2,
  Download,
  Plus,
  UtensilsCrossed,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts/AppLayout";
import { format } from "../../../shared/lib/formatters";
import { AddFoodDialog } from "../../foods/components/AddFoodDialog";
import { FoodEntryRow } from "../../foods/components/FoodEntryRow";
import { foods } from "../../foods/data/foods";
import { NutritionRing } from "../components/NutritionRing";

import { useNutrition } from "../store/useNutritionStore";
import "./FoodDiaryPreviewPage.css";

const nutrientKeys = ["energy", "protein", "carbs", "fat", "fiber"] as const;
const categories = [...new Set(foods.map((food) => food.category))];

export default function FoodDiaryPreviewPage() {
  const { entries, add, update, remove } = useNutrition();

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [category, setCategory] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [mobileView, setMobileView] = useState("foods");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    function updateViewport() {
      setIsMobile(media.matches);
    }
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    function syncMobileView() {
      const hash = window.location.hash;
      setMobileView(hash.endsWith("/breakdown") ? "analysis" : "foods");
      if (hash === "#/preview/add" && !dialogRef.current?.open) {
        dialogRef.current?.showModal();
      }
    }
    syncMobileView();
    window.addEventListener("hashchange", syncMobileView);
    return () => window.removeEventListener("hashchange", syncMobileView);
  }, []);

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

  const visibleFoods =
    isMobile && category
      ? selected.filter((food) => food.category === category)
      : selected;
  const visibleEnergy = visibleFoods.reduce(
    (sum, food) => sum + (food.energy * Number(food.weight)) / 100,
    0,
  );
  const checkedIds = selectedIds.filter((id) =>
    entries.some((entry) => entry.id === id),
  );
  const allVisibleChecked =
    visibleFoods.length > 0 &&
    visibleFoods.every((food) => checkedIds.includes(food.id));

  function toggleSelecting() {
    setSelecting(!selecting);
    setSelectedIds([]);
  }

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

  function addFood(id: string, amount: number) {
    if (
      !foods.some((food) => food.id === id) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 100000
    ) {
      return;
    }
    const existingWeight = Number(
      entries.find((entry) => entry.id === id)?.weight ?? 0,
    );
    add(id);
    update(id, existingWeight + amount);
  }

  function exportCsv() {
    const rows = [
      [
        "Food",
        "Category",
        "Weight (g)",
        "Calories (kcal)",
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
    <AppLayout page="preview" onAddFood={() => dialogRef.current?.showModal()}>
      <div className="food-diary-preview" data-mobile-view={mobileView}>
        <div className="diary-mobile-actions">
          <button
            type="button"
            className="diary-button diary-mobile-export"
            aria-label="Download CSV"
            title="Download a comma-separated values (CSV) file."
            disabled={!visibleFoods.length}
            onClick={exportCsv}
          >
            <Download size={18} />
          </button>
          <button
            type="button"
            className="diary-button"
            aria-pressed={selecting}
            onClick={toggleSelecting}
          >
            {selecting ? "Finish selection" : "Select foods"}
          </button>
        </div>
        <header className="diary-header">
          <div>
            <h1>
              {isMobile && mobileView === "analysis"
                ? "Nutrition summary"
                : "Food diary"}
            </h1>
            <p>
              {selected.length} {selected.length === 1 ? "food" : "foods"} ·{" "}
              {format(totals.energy)} kcal total
            </p>
          </div>
        </header>

        <div id="/preview/breakdown" className="diary-summary-anchor">
          <NutritionRing
            totals={totals}
            compact={isMobile && mobileView === "foods"}
          />
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
              onClick={toggleSelecting}
            >
              <CheckCircle2 size={16} />{" "}
              {selecting ? "Finish selection" : "Select foods"}
            </button>
            <button
              type="button"
              className="diary-button"
              onClick={exportCsv}
              disabled={!visibleFoods.length}
            >
              <Download size={16} /> Download CSV
            </button>
            <button
              type="button"
              className="diary-button diary-button-dark"
              onClick={() => dialogRef.current?.showModal()}
            >
              <Plus size={17} /> Add food
            </button>
          </div>

          <div className="diary-mobile-tools">
            <div className="diary-mobile-controls">
              <button
                type="button"
                className="diary-mobile-chip"
                aria-expanded={showMobileFilters}
                aria-controls="diary-mobile-filters"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal size={14} /> Filter
                {category && (
                  <span
                    className="diary-filter-dot"
                    aria-label="Active filter"
                  />
                )}
              </button>
            </div>
            {showMobileFilters && (
              <div
                className="diary-mobile-filter-panel"
                id="diary-mobile-filters"
              >
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <p className="diary-mobile-count">
              {visibleFoods.length}{" "}
              {visibleFoods.length === 1 ? "food" : "foods"} ·{" "}
              {format(visibleEnergy)} kcal total
            </p>
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
                Select all listed foods
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
                <Trash2 size={15} /> Remove selected foods
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
              <UtensilsCrossed size={26} aria-hidden="true" />
              <h3>
                {selected.length ? "No foods in this category" : "No foods yet"}
              </h3>
              <p>
                {selected.length
                  ? "Choose another category or clear the filter."
                  : "Choose a food and enter its weight to see calories and nutrients."}
              </p>
              <button
                className="diary-button"
                type="button"
                onClick={() => {
                  if (selected.length) {
                    setCategory("");
                  } else {
                    dialogRef.current?.showModal();
                  }
                }}
              >
                {selected.length ? "Clear filter" : "Add food"}
              </button>
            </div>
          )}
          <p className="diary-data-note">
            These estimates use sample food data, not verified nutrition values.
            Vitamin and mineral values are not available.
          </p>
        </section>

        <AddFoodDialog
          ref={dialogRef}
          foods={foods}
          onAddFood={addFood}
          onClose={() => {
            if (window.location.hash === "#/preview/add") {
              window.location.hash = "#/preview";
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
