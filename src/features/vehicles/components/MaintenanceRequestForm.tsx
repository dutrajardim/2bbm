import { useState } from "react";

interface MaintenanceRequestFormProps {
  plate: string;
  onClose: () => void;
}

/**
 * Renders the form used to request vehicle maintenance.
 *
 * Controls requester, reason, and vehicle availability fields, then sends the
 * request to the maintenance endpoint.
 */
const MaintenanceRequestForm = ({ plate, onClose }: MaintenanceRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [bmNumber, setBmNumber] = useState("");
  const [reasonDescription, setReasonDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  /**
   * Prepares and submits the maintenance request to the API.
   *
   * Normalizes plate and BM number, builds the payload expected by the endpoint,
   * and controls the loading state until the request finishes.
   */
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
    } catch {
      alert('Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md border border-border bg-surface p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Solicitar Manutenção</h3>
          <span className="border border-warning bg-warning/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-warning">
            Teste - ainda não funcional
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Motivo</label>
              <textarea className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" rows={3} value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Nome do Responsável</label>
              <input type="text" className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Número BM</label>
              <input type="text" className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={bmNumber} onChange={(e) => setBmNumber(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Veículo ficará indisponível?</label>
              <select className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={disabled ? "true" : "false"} onChange={(e) => setDisabled(e.target.value === "true")}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-none bg-success py-2 font-medium text-success-foreground hover:opacity-90 disabled:opacity-50">
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-none bg-secondary py-2 font-medium text-secondary-foreground hover:opacity-90">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceRequestForm;
