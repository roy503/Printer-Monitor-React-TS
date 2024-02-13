import { useContext, useState } from "react";
import Context, { PrinterData, Printer } from "../services/ContextProvider";

type SortKey = keyof Printer | "prints" | "copies";

// Function to get the current month (zero-based index)
function getMonth() {
  return new Date().getMonth() - 1;
}

// Function to calculate the remaining prints based on the current month's reports
function getPrints(printer: Printer) {
  let total = 0;

  // Subtract the current month's mono prints if available
  if (printer.Reports && printer.Reports[getMonth()].monoPrints > 0) {
    const report = printer.Reports[getMonth()];
    total += (printer.monoPrints || 0) - (report.monoPrints || 0);
    total += (printer.colourPrints || 0) - (report.colourPrints || 0);
    if (printer.monoPrints === -1 && printer.colourPrints === -1) {
      total = -1;
    }
  }

  return total;
}

// Function to calculate the remaining copies based on the current month's reports
function getCopies(printer: Printer) {
  let total = 0;

  if (printer.Reports && printer.Reports[getMonth()]) {
    const report = printer.Reports[getMonth()];
    total += (printer.monoCopies || 0) - (report.monoCopies || 0);
    total += (printer.colourCopies || 0) - (report.colourCopies || 0);

    if (printer.monoCopies === -1 && printer.colourCopies === -1) {
      total = -1;
    }
  }

  return total;
}

// TonerLevels component
export function TonerLevels() {
  // Access the printers data from the context
  const printerList = useContext<PrinterData | undefined>(Context);
  const currentYear = new Date().getFullYear().toString();
  const currentYearPrinters = printerList?.[currentYear] ?? [];
  const [sortBy, setSortBy] = useState<SortKey | null>(null); // State to track sorting key
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Track sort direction

  // Sorting function
  const handleSort = (key: SortKey) => {
    if (key === sortBy) {
      // If already sorted by this key, toggle the sort direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Otherwise, set the new sorting key and default to ascending direction
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            {/* Table headers with onClick for sorting */}
            <th onClick={() => handleSort("location")}>Location</th>
            <th onClick={() => handleSort("address")}>IP</th>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("serial")}>Serial</th>
            <th onClick={() => handleSort("black")}>Black %</th>
            <th onClick={() => handleSort("yellow")}>Yellow %</th>
            <th onClick={() => handleSort("magenta")}>Magenta %</th>
            <th onClick={() => handleSort("cyan")}>Cyan %</th>
            <th onClick={() => handleSort("k1")}>K1 %</th>
            <th onClick={() => handleSort("k2")}>K2 %</th>
            <th onClick={() => handleSort("prints")}>Current Monthly Prints</th>
            <th onClick={() => handleSort("copies")}>Current Monthly Copies</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {/* Map over currentYearPrinters and render the rows */}
          {currentYearPrinters
            ? currentYearPrinters
                .sort((a, b) => {
                  if (!sortBy) return 0; // If no sorting key, return 0
                  let result = 0;
                  if (sortBy === "address") {
                    // Sort by IP address
                    const ipA = a.address || "";
                    const ipB = b.address || "";
                    // Split IP addresses into numerical components
                    const ipComponentsA = ipA.split(".").map(Number);
                    const ipComponentsB = ipB.split(".").map(Number);
                    // Compare each numerical component
                    for (let i = 0; i < 4; i++) {
                      if (ipComponentsA[i] !== ipComponentsB[i]) {
                        result = ipComponentsA[i] - ipComponentsB[i];
                        break;
                      }
                    }
                  } else if (sortBy === "prints") {
                    result = getPrints(a) - getPrints(b);
                  } else if (sortBy === "copies") {
                    result = getCopies(a) - getCopies(b);
                  } else if (sortBy in a) {
                    // Sort based on printer properties
                    const propA = a[sortBy as keyof Printer];
                    const propB = b[sortBy as keyof Printer];
                    if (
                      typeof propA === "string" &&
                      typeof propB === "string"
                    ) {
                      result = propA.localeCompare(propB);
                    } else {
                      result =
                        ((propA as number) || 0) - ((propB as number) || 0);
                    }
                  }
                  // Apply sort direction
                  return sortDirection === "asc" ? result : -result;
                })
                .map((printer) => (
                  <tr key={printer.address}>
                    <td>{printer.location}</td>
                    <td>
                      <a
                        href={"//" + printer.address} // Replace with the actual URL you want
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {printer.address}
                      </a>
                    </td>
                    <td>{printer.name}</td>
                    <td>{printer.serial}</td>
                    <td>{printer.black > -1 ? printer.black : ""}</td>
                    <td>{printer.yellow > -1 ? printer.yellow : ""}</td>
                    <td>{printer.magenta > -1 ? printer.magenta : ""}</td>
                    <td>{printer.cyan > -1 ? printer.cyan : ""}</td>
                    <td>{printer.k1 > -1 ? printer.k1 : ""}</td>
                    <td>{printer.k2 > -1 ? printer.k2 : ""}</td>
                    <td>{getPrints(printer) > -1 ? getPrints(printer) : ""}</td>
                    <td>{getCopies(printer) > -1 ? getCopies(printer) : ""}</td>
                  </tr>
                ))
            : null}
        </tbody>
      </table>
    </>
  );
}
