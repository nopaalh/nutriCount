import { ChartPie, ClipboardList, Home, Plus } from "lucide-react";
import "./MobileNavigation.css";

type MobileNavigationProps = {
  isPreview: boolean;
  onAddFood?: () => void;
};

export function MobileNavigation({
  isPreview,
  onAddFood,
}: MobileNavigationProps) {
  const isNutrition = isPreview && window.location.hash.endsWith("/breakdown");
  const isFoods = isPreview && !isNutrition;

  function handleAddFood() {
    if (onAddFood) {
      onAddFood();
      return;
    }

    window.location.hash = "#/preview/add";
  }

  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      <a
        className="mobile-navigation-item"
        href="#dashboard"
        aria-current={!isPreview ? "page" : undefined}
      >
        <Home size={22} aria-hidden="true" />
        <span>Dashboard</span>
      </a>
      <a
        className="mobile-navigation-item"
        href="#/preview"
        aria-current={isFoods ? "page" : undefined}
      >
        <ClipboardList size={22} aria-hidden="true" />
        <span>Foods</span>
      </a>
      <a
        className="mobile-navigation-item"
        href="#/preview/breakdown"
        aria-current={isNutrition ? "page" : undefined}
      >
        <ChartPie size={22} aria-hidden="true" />
        <span>Nutrients</span>
      </a>
      <button
        className="mobile-navigation-item"
        type="button"
        aria-label="Add food"
        onClick={handleAddFood}
      >
        <span className="mobile-navigation-add-icon">
          <Plus size={20} aria-hidden="true" />
        </span>
        <span>Add food</span>
      </button>
    </nav>
  );
}
