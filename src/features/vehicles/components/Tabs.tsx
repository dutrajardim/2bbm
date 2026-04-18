interface TabsProps {
  activeTab: 'intakes' | 'maintenance';
  onTabChange: (tab: 'intakes' | 'maintenance') => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-300">
      <button
        onClick={() => onTabChange('intakes')}
        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'intakes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
      >
        Recebimentos
      </button>
      <button
        onClick={() => onTabChange('maintenance')}
        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'maintenance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
      >
        Manutenções
      </button>
    </div>
  );
}