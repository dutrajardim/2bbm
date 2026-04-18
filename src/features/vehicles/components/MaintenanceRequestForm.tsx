import { useState } from "react";

interface MaintenanceRequestFormProps {
  plate: string;
  onClose: () => void;
}

export default function MaintenanceRequestForm({ plate, onClose }: MaintenanceRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [bmNumber, setBmNumber] = useState("");
  const [reasonDescription, setReasonDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedPlate = plate.toUpperCase().replace(/\s/g, '');
      const formattedBmNumber = bmNumber.replace(/(\d{6})(\d)/, '$1-$2');
      const data = {
        number: formattedBmNumber,
        name,
        plate: formattedPlate,
        reason: reasonDescription,
        disbled: disabled
      };
      const response = await fetch('https://script.google.com/macros/s/AKfycbzr0kOuGNLSf0BAua8EvCmqZrUGRVSeMhp-HL1-kofc_Qhh_0LkXIfsoi1vyjodr2nc/exec?action=maintenance&type=request', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Erro ao enviar solicitação.');
      }
      onClose();
    } catch (error) {
      alert('Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white p-6 max-w-md w-full border border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Solicitar Manutenção</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Motivo</label>
              <textarea className="w-full border border-gray-300 p-2" rows={3} value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium">Nome do Responsável</label>
              <input type="text" className="w-full border border-gray-300 p-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Número BM</label>
              <input type="text" className="w-full border border-gray-300 p-2" value={bmNumber} onChange={(e) => setBmNumber(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Veículo ficará indisponível?</label>
              <select className="w-full border border-gray-300 p-2" value={disabled ? "true" : "false"} onChange={(e) => setDisabled(e.target.value === "true")}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2 hover:bg-green-700 disabled:opacity-50">
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-2 hover:bg-gray-400">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}