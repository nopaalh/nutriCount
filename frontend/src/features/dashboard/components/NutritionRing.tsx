import { useId, useState } from "react";
import { NutrientList } from "./NutrientList";
import type { NutrientAmount } from "./NutrientList";
import "./NutritionRing.css";

export type NutritionRingProps = {
  compact?: boolean;
  nutrients: NutrientAmount[];
  totals: {
    energy: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
};

const MACROS = [
  { key: "protein", label: "Protein", kcalPerGram: 4, color: "#123f9b" },
  { key: "carbs", label: "Carbohydrates", kcalPerGram: 4, color: "#0aa6d8" },
  { key: "fat", label: "Fat", kcalPerGram: 9, color: "#27c79b" },
] as const;

const RADIUS = 126;
const STROKE_WIDTH = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 8;

const amountFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
});
const shareFormatter = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

function safeAmount(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function NutritionRing({
  totals,
  nutrients,
  compact = false,
}: NutritionRingProps) {
  const [view, setView] = useState<"macros" | "all">("macros");
  const chartId = useId();
  const panelId = `${chartId}-nutrients`;
  const titleId = `${chartId}-title`;
  const descriptionId = `${chartId}-description`;
  const energy = safeAmount(totals.energy);
  const fiber = safeAmount(totals.fiber);
  const largestMacro = Math.max(
    ...MACROS.map((macro) => safeAmount(totals[macro.key])),
  );

  // Scaling first preserves energy ratios without overflowing large totals.
  const macroWeights = MACROS.map((macro) => {
    const amount = safeAmount(totals[macro.key]);
    const weight =
      largestMacro > 0 ? (amount / largestMacro) * macro.kcalPerGram : 0;

    return { ...macro, amount, weight };
  });
  const totalWeight = macroWeights.reduce(
    (sum, macro) => sum + macro.weight,
    0,
  );
  const macros = macroWeights.map((macro) => ({
    ...macro,
    share: totalWeight > 0 ? macro.weight / totalWeight : 0,
  }));
  const activeMacros = macros.filter((macro) => macro.share > 0);
  const hasMacroEnergy = activeMacros.length > 0;
  const hasMultipleSegments = activeMacros.length > 1;

  // Reserve space for both round caps and the visible gap between segments.
  const segmentSpacing = STROKE_WIDTH + SEGMENT_GAP;
  const availableLength = hasMultipleSegments
    ? CIRCUMFERENCE - activeMacros.length * segmentSpacing
    : CIRCUMFERENCE;
  let nextOffset = hasMultipleSegments ? segmentSpacing / 2 : 0;
  const segments = activeMacros.map((macro) => {
    const length = macro.share * availableLength;
    const offset = nextOffset;
    nextOffset += length + segmentSpacing;

    return { ...macro, length, offset };
  });

  const macroDescription = macros
    .map(
      (macro) =>
        `${macro.label}: ${amountFormatter.format(macro.amount)} g, ${shareFormatter.format(macro.share)} of estimated calories from protein, carbohydrates, and fat`,
    )
    .join(". ");

  return (
    <section
      className={`nutrition-ring-summary${compact ? " is-compact" : ""}`}
      aria-label="Nutrition summary"
    >
      <div className="nutrition-ring-toolbar">
        <h2 className="nutrition-ring-heading">Nutrition summary</h2>
        <div
          className="nutrition-ring-toggle"
          data-view={view}
          role="group"
          aria-label="Nutrient view"
        >
          <button
            type="button"
            className="nutrition-ring-view-button"
            aria-pressed={view === "macros"}
            aria-controls={panelId}
            onClick={() => setView("macros")}
          >
            Macros
          </button>
          <button
            type="button"
            className="nutrition-ring-view-button"
            aria-pressed={view === "all"}
            aria-controls={panelId}
            onClick={() => setView("all")}
          >
            All nutrients
          </button>
        </div>
      </div>

      <div className="nutrition-ring-layout">
        <div className="nutrition-ring-chart">
          <svg
            className="nutrition-ring-svg"
            viewBox="0 0 320 320"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>Calories by nutrient</title>
            <desc id={descriptionId}>
              Total calories: {amountFormatter.format(energy)} kcal.{" "}
              {macroDescription}. Fiber: {amountFormatter.format(fiber)} g,
              included in carbohydrates.
              {!hasMacroEnergy &&
                " No estimated calories to show. The ring is empty."}
            </desc>

            {!hasMacroEnergy && (
              <circle
                cx="160"
                cy="160"
                r={RADIUS}
                fill="none"
                stroke="#edf0f4"
                strokeWidth={STROKE_WIDTH}
              />
            )}
            {segments.map((segment) => (
              <circle
                key={segment.key}
                cx="160"
                cy="160"
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={
                  hasMultipleSegments
                    ? `${segment.length} ${CIRCUMFERENCE - segment.length}`
                    : undefined
                }
                strokeDashoffset={-segment.offset}
                transform="rotate(-90 160 160)"
              />
            ))}

            <text
              className="nutrition-ring-total"
              x="160"
              y="158"
              textAnchor="middle"
              fill="#182334"
            >
              {amountFormatter.format(energy)}
            </text>
            <text
              className="nutrition-ring-unit"
              x="160"
              y="196"
              textAnchor="middle"
              fill="#626d7b"
            >
              kcal
            </text>
          </svg>
        </div>

        <div className="nutrition-ring-legend" id={panelId}>
          <h3 className="nutrition-ring-legend-heading">
            {view === "macros"
              ? "Calories by nutrient"
              : "All nutrient amounts"}
          </h3>

          {view === "all" ? (
            <NutrientList nutrients={nutrients} />
          ) : (
            <div
              className="nutrition-ring-macro-content"
              role="region"
              aria-label="Calories by nutrient"
              tabIndex={0}
            >
              <ul className="nutrition-ring-macros">
                {macros.map((macro) => (
                  <li className="nutrition-ring-macro" key={macro.key}>
                    <div className="nutrition-ring-macro-heading">
                      <span
                        className="nutrition-ring-dot"
                        style={{ backgroundColor: macro.color }}
                        aria-hidden="true"
                      />
                      <span className="nutrition-ring-label">
                        {macro.label}
                      </span>
                      <span className="nutrition-ring-amount">
                        {amountFormatter.format(macro.amount)} g
                      </span>
                    </div>
                    <div className="nutrition-ring-share-row">
                      <div className="nutrition-ring-track" aria-hidden="true">
                        <div
                          className="nutrition-ring-progress"
                          style={{
                            backgroundColor: macro.color,
                            width: `${macro.share * 100}%`,
                          }}
                        />
                      </div>
                      <span className="nutrition-ring-percentage">
                        {shareFormatter.format(macro.share)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="nutrition-ring-fiber">
                <span
                  className="nutrition-ring-fiber-line"
                  aria-hidden="true"
                />
                <span className="nutrition-ring-label">Fiber</span>
                <span className="nutrition-ring-amount">
                  {amountFormatter.format(fiber)} g
                </span>
              </div>

              {!hasMacroEnergy && (
                <p className="nutrition-ring-empty">
                  No estimated calories to show.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nutrition-ring-notes">
        <p className="nutrition-ring-note" aria-hidden={view !== "macros"}>
          {compact
            ? "Estimated calorie shares. Fiber is part of carbohydrates."
            : "Percentages estimate calories from protein, carbohydrates, and fat. Fiber is part of carbohydrates."}
        </p>
        <p className="nutrition-ring-note" aria-hidden={view !== "all"}>
          {compact
            ? "Amounts use the unit shown. Ring colors show macros."
            : "Totals are unavailable if any food has a missing value. Ring colors show estimated calorie shares from macros."}
        </p>
      </div>
    </section>
  );
}
