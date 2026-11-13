import type { ReactNode } from "react";
import {
  Apple,
  BookOpen,
  ChevronDown,
  Leaf,
  UtensilsCrossed,
} from "lucide-react";
import graphIcon from "../../assets/icons/Graph.svg";

type AppLayoutProps = {
  children: ReactNode;
  page?: "dashboard" | "preview";
};

export function AppLayout({ children, page = "dashboard" }: AppLayoutProps) {
  const isPreview = page === "preview";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <img className="brand-logo" src="/nutricount-logo.png" alt="" />
          <span>
            nutri<span>count</span>
            <small>FOOD & NUTRITION</small>
          </span>
        </a>
        <div className="side-label">Workspace</div>
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
          aria-label="Food diary preview"
        >
          <UtensilsCrossed width={18} height={20} /> Food diary preview
        </a>
        <a
          className="nav-item"
          href={isPreview ? "#/preview/ingredients" : "#ingredients"}
        >
          <Apple width={18} height={20} /> Food ingredients
        </a>
        <a
          className="nav-item"
          href={isPreview ? "#/preview/breakdown" : "#breakdown"}
        >
          <BookOpen width={18} height={20} /> Nutrition breakdown
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
              Small choices, better understanding. <Leaf size={13} />
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
