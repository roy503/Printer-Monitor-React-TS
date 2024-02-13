import Context, {
  PrinterData,
  Reports,
  Printer,
} from "../services/ContextProvider";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";

// Define the SortKey type to include printer properties and months
type SortKey =
  | keyof Printer
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

// ColourCopies component
export function ColourCopies() {
  const monthIndices: { [key: string]: number } = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  // Access the printers data from the context
  const printerList = useContext<PrinterData | undefined>(Context);
  const { year } = useParams<{ year?: string }>(); // Access year parameter from route
  const selectedYear = year ? year : new Date().getFullYear().toString();
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Track sort direction

  // Filter printers for the current year with non-zero colour prints and copies
  const currentYearPrinters = (printerList?.[selectedYear] ?? [])
    .filter((printer) => printer.colourPrints > 0)
    .filter((printer) => printer.colourCopies > 0);

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
      {/* Table displaying colour copies information */}
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            {/* Table headers with onClick for sorting */}
            <th onClick={() => handleSort("location")}>Location</th>
            <th onClick={() => handleSort("address")}>IP</th>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("serial")}>Serial</th>
            <th onClick={() => handleSort("January")}>January</th>
            <th onClick={() => handleSort("February")}>February</th>
            <th onClick={() => handleSort("March")}>March</th>
            <th onClick={() => handleSort("April")}>April</th>
            <th onClick={() => handleSort("May")}>May</th>
            <th onClick={() => handleSort("June")}>June</th>
            <th onClick={() => handleSort("July")}>July</th>
            <th onClick={() => handleSort("August")}>August</th>
            <th onClick={() => handleSort("September")}>September</th>
            <th onClick={() => handleSort("October")}>October</th>
            <th onClick={() => handleSort("November")}>November</th>
            <th onClick={() => handleSort("December")}>December</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {/* Map over currentYearPrinters and render each row in the table */}
          {currentYearPrinters
            ? currentYearPrinters
                .sort((a, b) => {
                  if (!sortBy) return 0;
                  let result = 0;
                  if (
                    [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].includes(sortBy)
                  ) {
                    // Get the index for monthA and monthB
                    const indexA = monthIndices[sortBy];
                    const indexB = monthIndices[sortBy];
                    // Access the colourCopies value for the selected month
                    const monthA =
                      indexA !== undefined
                        ? (a.Reports[indexA]?.colourCopies || 0) -
                          (a.Reports[indexA - 1]?.colourCopies || 0)
                        : 0;
                    const monthB =
                      indexB !== undefined
                        ? (b.Reports[indexB]?.colourCopies || 0) -
                          (b.Reports[indexB - 1]?.colourCopies || 0)
                        : 0;
                    // Compare the colourCopies values
                    result = monthA - monthB;
                  } else if (sortBy === "address") {
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
                  // Initialize the previous month's colour prints value as 0
                  let prevMonthColourCopies = 0;
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

                      {/* Map over reports and display colour copies for each month */}
                      {printer.Reports?.map((report: Reports) => {
                        let currentMonthColourCopies =
                          report.colourCopies - prevMonthColourCopies;
                        if (
                          prevMonthColourCopies == -1 ||
                          prevMonthColourCopies == 0
                        ) {
                          currentMonthColourCopies = -1;
                          if (report.colourCopies > 0) {
                            currentMonthColourCopies = 0;
                          }
                        }
                        prevMonthColourCopies = report.colourCopies;
                        if (prevMonthColourCopies < 0) {
                          prevMonthColourCopies = 0;
                        }

                        return (
                          <td key={report.month}>
                            {/* Display colour copies if available, otherwise display an empty string */}
                            {currentMonthColourCopies > -1
                              ? currentMonthColourCopies
                              : ""}
                          </td>
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
