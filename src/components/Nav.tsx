// Import necessary modules from external libraries
import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// Define the URL for the reports API
const REPORTS_REST_API_URL = "http://10.214.200.39:8080/Nav";

// Define the type for a report
export type Report = {
  Months: [month: string];
  year: string;
};

// Define the interface for the Nav component props
interface NavProps {
  onMonthSelection: (month: string, year: string) => void;
}

// Define the Nav component
export function Nav({ onMonthSelection }: NavProps) {
  // State to store the retrieved reports
  const [reports, setReports] = useState<Report[] | null>();
  // State to manage the active menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  // State to manage the active year
  const [activeYear, setActiveYear] = useState<string | null>(null);

  // Get the current location using the useLocation hook from react-router-dom
  const location = useLocation();

  // State to store the currently selected year from the URL
  const [navYear, setNavYear] = useState<string | null>(null);

  // State to manage the dropdown selections
  const [dropdowns, setDropdowns] = useState<{ [key: string]: string | null }>({
    MonoPrints: null,
    MonoCopies: null,
    ColourPrints: null,
    ColourCopies: null,
  });

  // Effect to fetch reports when the component mounts
  useEffect(() => {
    axios
      .get(REPORTS_REST_API_URL)
      .then((response) => {
        setReports(response.data);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        // You can add error handling logic or display an error message to the user.
      });
  }, []);

  // Effect to initialize navYear when the component mounts or when the location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/");
    if (pathParts.length >= 2) {
      setNavYear(pathParts[1]); // Set navYear to the year from the URL
    }
  }, [location.pathname]); // Re-run this effect when the location pathname changes

  // Function to handle type change and close the dropdown
  const handleTypeChange = (type: string, year: string | null) => {
    setDropdowns({ ...dropdowns, [type]: year });
    if (year) {
      setNavYear(year);
      closeDropdown(type); // Close the dropdown when an option is chosen
    }
  };

  // Function to close a specific dropdown by its ID
  const closeDropdown = (dropdownId: string) => {
    const dropdownToggle = document.getElementById(
      `dropdownToggle_${dropdownId}`
    );
    if (dropdownToggle) {
      dropdownToggle.click(); // Programmatically close the dropdown by simulating a click on its toggle button
    }
  };

  // Render the navigation bar
  return (
    <>
      {/* Navigation bar */}
      <nav
        data-bs-theme="dark"
        className="navbar navbar-expand-lg bg-body-tertiary"
      >
        <div className="container-fluid">
          {/* Navbar brand */}
          <NavLink
            className="navbar-brand"
            to="/"
            onClick={() => {
              setActiveYear(null); // Reset activeYear when navigating to the home page
              setActiveMenu(null); // Reset activeMenu when navigating to the home page
            }}
          >
            KHS Printers
          </NavLink>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* Navigation links */}
            <ul className="navbar-nav nav-pills me-auto mb-2 mb-lg-0">
              {/* Static link for TonerLevels */}
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/TonerLevels"
                  onClick={() => {
                    setActiveYear(null); // Reset activeYear when navigating to TonerLevels
                    setActiveMenu(null); // Reset activeMenu when navigating to TonerLevels
                  }}
                >
                  TonerLevels
                </NavLink>
              </li>
              {/* Dropdown menu items */}
              {Object.entries(dropdowns).map(([type, year]) => (
                <li className="nav-item dropdown" key={type}>
                  <div className="dropdown">
                    <button
                      className={`nav-link dropdown-toggle ${
                        type === activeMenu ? "active" : ""
                      }`}
                      id={`dropdownToggle_${type}`}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {type}{" "}
                      {year && activeMenu === type && navYear
                        ? `(${year})`
                        : ""}
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby={`dropdownToggle_${type}`}
                    >
                      {/* Dynamic dropdown items */}
                      {reports &&
                        reports.map((report) => (
                          <li key={report.year}>
                            <NavLink
                              to={`/${type}/${report.year}`}
                              className={`dropdown-item ${
                                type === activeMenu && year === report.year
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleTypeChange(type, report.year);
                                setNavYear(report.year);
                                setActiveMenu(type);
                                setActiveYear(null);
                              }}
                            >
                              {report.year}
                            </NavLink>
                          </li>
                        ))}
                    </ul>
                  </div>
                </li>
              ))}
              {/* Dynamic dropdown menu items */}
              {reports
                ? reports.map((report) => (
                    <li className="nav-item dropdown" key={report.year}>
                      <button
                        className={`nav-link dropdown-toggle ${
                          activeYear === report.year ? "active" : ""
                        }`}
                        id={`dropdownToggle_${report.year}`}
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {report.year} Reports
                      </button>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby={`dropdownToggle_${report.year} Reports`}
                      >
                        {/* Dynamic dropdown items */}
                        {report.Months &&
                          report.Months.map((month) => (
                            <li key={month}>
                              <NavLink
                                to={`/${month}/${report.year}`}
                                key={month}
                                className={`dropdown-item`}
                                onClick={() => {
                                  onMonthSelection(report.year, month);
                                  setActiveMenu(report.year + "Reports");
                                  setActiveYear(report.year);
                                  document
                                    .getElementById(
                                      `dropdownToggle_${report.year}`
                                    )
                                    ?.click(); // Programmatically close the dropdown
                                }}
                              >
                                {month} {report.year}
                              </NavLink>
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
