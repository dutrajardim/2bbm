import { useState } from "react";

interface MaintenanceRepairFormProps {
  plate: string;
  onClose: () => void;
}

/**
 * Renders the form used to register vehicle maintenance or repair.
 *
 * Controls user-filled fields and closes the modal after successfully sending
 * data to the maintenance endpoint.
 */
const MaintenanceRepairForm = ({ plate, onClose }: MaintenanceRepairFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("REPARO_COMPLETO");
  const [name, setName] = useState("");
  const [bmNumber, setBmNumber] = useState("");
  const [reasonDescription, setReasonDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  /**
   * Prepares and submits repair data to the maintenance API.
   *
   * Formats plate and BM number, chooses the request type based on the selected
   * status, and controls the loading state during submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const repairType = type;
      const typeParam = repairType === 'REPARO_COMPLETO' ? 'complete' : 'update';
      const formattedPlate = plate.toUpperCase().replace(/\s/g, '');
      const formattedBmNumber = bmNumber.replace(/(\d{6})(\d)/, '$1-$2');
      const data = repairType === 'REPARO_COMPLETO' ? {
        number: formattedBmNumber,
        name,
        plate: formattedPlate,
        description: reasonDescription
      } : {
        number: formattedBmNumber,
        name,
        plate: formattedPlate,
        description: reasonDescription,
        disbled: disabled
      };
      const response = await fetch(`https://script.google.com/macros/s/AKfycbzr0kOuGNLSf0BAua8EvCmqZrUGRVSeMhp-HL1-kofc_Qhh_0LkXIfsoi1vyjodr2nc/exec?action=maintenance&type=${typeParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Erro ao enviar reparo.');
      }
      onClose();
    } catch {
      alert('Erro ao enviar reparo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md border border-border bg-surface p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Inserir Reparo</h3>
          <span className="border border-warning bg-warning/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-warning">
            Teste - ainda não funcional
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Status do Reparo</label>
              <select className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="REPARO_COMPLETO">Completo</option>
                <option value="ATUALIZACAO_DE_REPARO">Parcial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Descrição da Manutenção Realizada</label>
              <textarea className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" rows={3} value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} required></textarea>
            </div>
            {type === 'ATUALIZACAO_DE_REPARO' && (
              <div>
                <label className="block text-sm font-medium text-foreground">Veículo Disponível?</label>
                <select className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={disabled ? "true" : "false"} onChange={(e) => setDisabled(e.target.value === "true")}>
                  <option value="false">Sim</option>
                  <option value="true">Não</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground">Nome do Responsável</label>
              <input type="text" className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Número BM</label>
              <input type="text" className="mt-1 w-full rounded-none border border-border bg-surface p-2 text-foreground outline-none focus:border-accent" value={bmNumber} onChange={(e) => setBmNumber(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-none bg-warning py-2 font-medium text-warning-foreground hover:opacity-90 disabled:opacity-50">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-none bg-secondary py-2 font-medium text-secondary-foreground hover:opacity-90">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceRepairForm;
