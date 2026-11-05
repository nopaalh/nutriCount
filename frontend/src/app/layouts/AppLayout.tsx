import type { ReactNode } from "react";
import {
  Activity,
  Apple,
  BookOpen,
  ChevronDown,
  Leaf,
  Sprout,
} from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">
            <Sprout size={20} />
          </span>
          <span>
            nutri<span>count</span>
            <small>FOOD & NUTRITION</small>
          </span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#dashboard">
          <Activity size={17} /> Dashboard
        </a>
        <a className="nav-item" href="#ingredients">
          <Apple size={17} /> Food ingredients
        </a>
        <a className="nav-item" href="#breakdown">
          <BookOpen size={17} /> Nutrition breakdown
        </a>
        <div className="side-footer">
          <span className="avatar">N</span>
          <span>
            <strong>NutriCount</strong>
          </span>
          <ChevronDown size={15} />
        </div>
      </aside>
      <main className="main" id="dashboard">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Dashboard</strong>
          </div>
        </header>
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
