import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Car, Home, Search, Calendar, Menu, X, Settings2, Sun, Moon, Laptop } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, type ThemeMode } from "../../../providers/themeContext";
import { useVehicleIntakes } from "../hooks/useVehicleIntakes";
import { SyncSettingsModal } from "./SyncSettingsModal";

interface IconButtonProps {
  icon: ComponentType<{ className?: string }>
  title: string
  label: string
  onClick: () => void
}

const IconButton = ({ icon: Icon, title, label, onClick }: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-10 w-10 items-center justify-center rounded border border-border bg-surface text-foreground transition hover:bg-surface-muted"
    aria-label={label}
    title={title}
  >
    <Icon className="size-5" aria-hidden="true" />
  </button>
)

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const themeIconMap: Record<ThemeMode, typeof Sun> = {
    system: Laptop,
    light: Sun,
    dark: Moon,
  };

  const ThemeIcon = themeIconMap[theme] || Laptop;
  const cycleTheme = () => {
    setTheme(theme === "system" ? "light" : theme === "light" ? "dark" : "system");
  };

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
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-border bg-surface text-foreground transition hover:bg-surface-muted md:hidden"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-foreground border border-border hover:bg-surface-muted transition"
              >
                <Home className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                to="/vehicles/daily-intake"
                className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-foreground border border-border hover:bg-surface-muted transition"
              >
                <Calendar className="size-4" aria-hidden="true" />
                Recebimento do Dia
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
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

            <div className="flex items-center gap-2 md:justify-end">
              <IconButton
                icon={ThemeIcon}
                label="Alternar tema"
                title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}`}
                onClick={cycleTheme}
              />
              <IconButton
                icon={Settings2}
                label="Abrir configurações de sincronização"
                title="Configurações de sincronização"
                onClick={() => setIsSyncModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border bg-surface px-4 pb-4 pt-3 md:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition"
              >
                <Home className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                to="/vehicles/daily-intake"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition"
              >
                <Calendar className="size-4" aria-hidden="true" />
                Recebimento do Dia
              </Link>
            </nav>
          </div>
        )}
      </header>

      <SyncSettingsModal open={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />

      <main>{children}</main>
    </div>
  );
};

export default AppShell;
