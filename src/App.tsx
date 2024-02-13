import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TonerLevels } from "./pages/TonerLevels";
import { MonoPrints } from "./pages/MonoPrints";
import { MonoCopies } from "./pages/MonoCopies";
import { ColourPrints } from "./pages/ColourPrints";
import { ColourCopies } from "./pages/ColourCopies";
import { ContextProvider } from "./services/ContextProvider";
import { Month } from "./pages/Month";
import { Nav } from "./components/Nav";
import { useState } from "react";

export function App() {
  // State to store the selected report from Nav
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Callback function to handle the selected report from Nav
  const handleMonthSelection = (year: string, month: string) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <ContextProvider>
      {/* Set up BrowserRouter for routing */}
      <BrowserRouter>
        {/* Render the navigation component and pass the callback */}
        <Nav onMonthSelection={handleMonthSelection} />

        {/* Define the routes for different pages */}
        <Routes>
          {/* Default route for TonerLevels page */}
          <Route path="*" element={<TonerLevels />} />

          {/* Routes for other pages */}
          <Route path="/TonerLevels" element={<TonerLevels />} />
          <Route path="/MonoPrints/:year" element={<MonoPrints />} />
          <Route path="/MonoCopies/:year" element={<MonoCopies />} />
          <Route path="/ColourPrints/:year" element={<ColourPrints />} />
          <Route path="/ColourCopies/:year" element={<ColourCopies />} />

          {/* Route for the Month page, pass the selectedMonth as a prop */}
          <Route
            path="/:year/:monthName"
            element={
              <Month
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}
