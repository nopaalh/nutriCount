import { useEffect, useState } from "react";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import FoodDiaryPreviewPage from "../features/dashboard/pages/FoodDiaryPreviewPage";

export function AppRouter() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    function handleHashChange() {
      setHash(window.location.hash);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return hash === "#/preview" || hash.startsWith("#/preview/") ? (
    <FoodDiaryPreviewPage />
  ) : (
    <DashboardPage />
  );
}
