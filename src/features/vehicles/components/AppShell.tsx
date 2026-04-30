import { useMemo, useState, type ReactNode } from "react";
import { Car, Home, Monitor, Moon, Search, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, type ThemeMode } from "../../../providers/themeContext";
import { useVehicleIntakes } from "../hooks/useVehicleIntakes";

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/**
 * Wraps vehicle pages with shared navigation, search, and theme controls.
 *
 * @param props.children - Route content rendered below the top menu.
 * @returns Application shell for vehicle workflows.
 */
const AppShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { vehiclesLastIntake } = useVehicleIntakes();
  const [query, setQuery] = useState("");
  const ThemeIcon = themeIcons[theme];

  const results = useMemo(() => {
    if (!query) return [];

    return vehiclesLastIntake
      .filter((vehicle) =>
        vehicle.plateNumber?.toUpperCase().includes(query) ||
        vehicle.prefix?.toUpperCase().includes(query)
      )
      .slice(0, 6);
  }, [query, vehiclesLastIntake]);

  /**
   * Navigates to a vehicle detail page and resets the search input.
   *
   * @param plate - Selected vehicle plate.
   */
  const goToVehicle = (plate: string | null) => {
    if (!plate) return;

    navigate(`/vehicles/${plate}`);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
            >
              <Home className="size-4 text-muted" aria-hidden="true" />
              Gestão de Viaturas
            </Link>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar viatura..."
                value={query}
                onChange={(event) => setQuery(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    goToVehicle(results[0].plateNumber);
                  }
                }}
                className="h-10 w-full rounded-none border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
              />

              {query && results.length > 0 && (
                <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-none border border-border bg-surface">
                  {results.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => goToVehicle(vehicle.plateNumber)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-surface-muted"
                    >
                      <span className="inline-flex items-center gap-2 font-semibold text-accent">
                        <Car className="size-4" aria-hidden="true" />
                        <span>{vehicle.plateNumber}</span>
                      </span>
                      <span className="truncate text-muted">
                        {vehicle.prefix || "Sem prefixo"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="sr-only" htmlFor="theme-select">Tema</label>
            <div className="relative">
              <ThemeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <select
                id="theme-select"
                value={theme}
                onChange={(event) => setTheme(event.target.value as ThemeMode)}
                className="h-10 w-full rounded-none border border-border bg-surface pl-9 pr-3 text-sm font-medium text-foreground outline-none transition focus:border-accent md:w-auto"
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Tema: {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};

export default AppShell;
