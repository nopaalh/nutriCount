import type { ReactNode } from "react";
import {
  Apple,
  BookOpen,
  ChevronDown,
  Leaf,
  UtensilsCrossed,
} from "lucide-react";
import graphIcon from "../../assets/icons/Graph.svg";
import { MobileNavigation } from "./MobileNavigation";
import "./AppLayout.css";

type AppLayoutProps = {
  children: ReactNode;
  page?: "dashboard" | "preview";
  onAddFood?: () => void;
};

export function AppLayout({
  children,
  page = "dashboard",
  onAddFood,
}: AppLayoutProps) {
  const isPreview = page === "preview";

  return (
    <div className={`app-shell${isPreview ? " app-shell-preview" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <img
            className="brand-logo"
            src="/nutricount-logo.png"
            width={28}
            height={28}
            alt=""
          />
          <span>NutriCount</span>
        </a>
        <div className="side-label">Navigation</div>
        <a
          className={`nav-item dashboard-link${!isPreview ? " active" : ""}`}
          href="#dashboard"
          aria-current={!isPreview ? "page" : undefined}
          aria-label="Dashboard"
        >
          <img src={graphIcon} width={18} height={20} alt="" /> Dashboard
        </a>
        <a
          className={`nav-item preview-link${isPreview ? " active" : ""}`}
          href="#/preview"
          aria-current={isPreview ? "page" : undefined}
          aria-label="Nutrition calculator"
        >
          <UtensilsCrossed width={18} height={20} /> Nutrition calculator
        </a>
        <a
          className="nav-item"
          href={isPreview ? "#/preview/ingredients" : "#ingredients"}
        >
          <Apple width={18} height={20} /> Foods
        </a>
        <a
          className="nav-item"
          href={isPreview ? "#/preview/breakdown" : "#breakdown"}
        >
          <BookOpen width={18} height={20} /> Nutrients
        </a>
        <div className="side-footer">
          <span className="avatar">N</span>
          <span>
            <strong>NutriCount</strong>
          </span>
          <ChevronDown width={18} height={20} />
        </div>
      </aside>
      <main className="main" id="dashboard">
        <div className="content">
          {children}
          <footer>
            <span>© NutriCount</span>
            <span>
              Nutrition estimates from sample food data. <Leaf size={13} />
            </span>
          </footer>
        </div>
      </main>
      <MobileNavigation isPreview={isPreview} onAddFood={onAddFood} />
    </div>
  );
}
