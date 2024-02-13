import Context, {
  PrinterData,
  Reports,
  Printer,
} from "../services/ContextProvider";
import React, { useContext, useState } from "react";
type SortKey = keyof Printer;
// Props interface for the Month component
interface MonthProps {
  selectedMonth: string | null;
  selectedYear: string;
}

// Month component
export function Month({ selectedMonth, selectedYear }: MonthProps) {
  // Access the printers data from the context
  const printerList = useContext<PrinterData | undefined>(Context);
  const currentYearPrinters = printerList?.[selectedYear] ?? [];

  // State to track sorting column and direction
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<SortKey | null>(null); // State to track sorting key

  const handleSort = (key: SortKey) => {
    // If already sorting by this column, toggle direction
    if (key === sortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Otherwise, set new column and default direction to ascending
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  return (
    <>
      {/* Table displaying information for the selected month */}
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            {/* Table headers with onClick for sorting */}
            <th onClick={() => handleSort("location")}>Location</th>
            <th onClick={() => handleSort("address")}>IP</th>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("serial")}>Serial</th>
            <th onClick={() => handleSort("monoPrints")}>Mono Prints</th>
            <th onClick={() => handleSort("monoCopies")}>Mono Copies</th>
            <th onClick={() => handleSort("colourPrints")}>Colour Prints</th>
            <th onClick={() => handleSort("colourCopies")}>Colour Copies</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {/* Map over currentYearPrinters and render each row in the table */}
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
                .map((printer) => {
                  return (
                    <tr key={printer.address}>
                      {/* Display printer information */}
                      <td>{printer.location}</td>
                      <td>
                        {/* Link to the printer's IP address */}
                        <a
                          href={"//" + printer.address}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {printer.address}
                        </a>
                      </td>
                      <td>{printer.name}</td>
                      <td>{printer.serial}</td>

                      {/* Filter reports based on the selected month and render relevant information */}
                      {printer.Reports?.filter(
                        (report) => report.month === selectedMonth?.toString()
                      ).map((report: Reports) => {
                        return (
                          <React.Fragment key={report.month}>
                            {/* Display mono prints, mono copies, color prints, and color copies */}
                            <td>{report.monoPrints}</td>
                            <td>{report.monoCopies}</td>
                            <td>{report.colourPrints}</td>
                            <td>{report.colourCopies}</td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })
            : null}
        </tbody>
      </table>
    </>
  );
}
