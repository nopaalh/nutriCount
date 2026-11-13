import type { NutrientKey } from "../../foods/types/food.types";
import "./NutrientList.css";

export type NutrientAmount = {
  key: NutrientKey;
  label: string;
  unit: string;
  value: number | null;
};

type NutrientListProps = {
  nutrients: NutrientAmount[];
};

const colors: Partial<Record<NutrientKey, string>> = {
  protein: "#123f9b",
  carbs: "#0aa6d8",
  fat: "#27c79b",
  fiber: "#a69ad9",
};
const formatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 3,
});

function formatAmount(value: number) {
  return value > 0 && value < 0.001 ? "<0.001" : formatter.format(value);
}

export function NutrientList({ nutrients }: NutrientListProps) {
  return (
    <div
      className="nutrient-list"
      role="region"
      aria-label="All nutrient amounts"
      tabIndex={0}
    >
      <dl>
        {nutrients.map((nutrient, index) => {
          const value = nutrient.value;
          const available = value !== null && Number.isFinite(value);

          return (
            <div className="nutrient-list-row" key={nutrient.key}>
              <dt>
                <span
                  className="nutrient-list-dot"
                  style={{
                    backgroundColor:
                      colors[nutrient.key] ??
                      `hsl(${(index * 47) % 360} 50% 42%)`,
                  }}
                  aria-hidden="true"
                />
                {nutrient.label}
              </dt>
              <dd>
                {available ? (
                  <span>
                    {formatAmount(value)} {nutrient.unit}
                  </span>
                ) : (
                  <span className="nutrient-list-unavailable">
                    Not available
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
