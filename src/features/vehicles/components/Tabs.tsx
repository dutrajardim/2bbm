import { ClipboardList, Wrench } from "lucide-react";

interface TabsProps {
  activeTab: 'intakes' | 'maintenance';
  onTabChange: (tab: 'intakes' | 'maintenance') => void;
}

/**
 * Renders navigation between vehicle intakes and maintenance records.
 *
 * @param props.activeTab - Currently selected tab.
 * @param props.onTabChange - Updates the active tab.
 * @returns Tab control for the vehicle page.
 */
const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="flex border border-border bg-surface p-1">
      <button
        onClick={() => onTabChange('intakes')}
        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-medium transition ${activeTab === 'intakes' ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground'}`}
      >
        <ClipboardList className="size-4" aria-hidden="true" />
        Recebimentos
      </button>
      <button
        onClick={() => onTabChange('maintenance')}
        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-medium transition ${activeTab === 'maintenance' ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground'}`}
      >
        <Wrench className="size-4" aria-hidden="true" />
        Manutenções
      </button>
    </div>
  );
}

export default Tabs;
