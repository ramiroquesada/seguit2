import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { locationsApi } from '../../../api/locations.api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (officeId: number, reason: string) => Promise<void>;
  currentOfficeId?: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onConfirm, currentOfficeId }) => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedOfficeId, setSelectedOfficeId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      locationsApi.getCities().then(setCities);
    } else {
      // Reset state on close
      setSelectedCityId('');
      setSelectedSectionId('');
      setSelectedOfficeId('');
      setReason('');
      setSections([]);
      setOffices([]);
    }
  }, [isOpen]);

  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedSectionId('');
    setSelectedOfficeId('');
    setSections([]);
    setOffices([]);
    if (cityId) {
      const s = await locationsApi.getSections(Number(cityId));
      setSections(s);
    }
  };

  const handleSectionChange = async (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedOfficeId('');
    setOffices([]);
    if (sectionId) {
      const o = await locationsApi.getOffices(Number(sectionId));
      setOffices(o);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOfficeId || !reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(Number(selectedOfficeId), reason.trim());
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al realizar el traslado');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content card" style={{
        width: '100%', maxWidth: '500px', padding: '24px',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} /> Trasladar Equipo
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Ciudad Destino</label>
            <select className="form-control" value={selectedCityId} onChange={e => handleCityChange(e.target.value)}>
              <option value="">Seleccionar ciudad...</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sección</label>
            <select className="form-control" value={selectedSectionId} onChange={e => handleSectionChange(e.target.value)} disabled={!selectedCityId}>
              <option value="">Seleccionar sección...</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Oficina Destino</label>
            <select className="form-control" value={selectedOfficeId} onChange={e => setSelectedOfficeId(e.target.value)} disabled={!selectedSectionId}>
              <option value="">Seleccionar oficina...</option>
              {offices.map(o => (
                <option key={o.id} value={o.id} disabled={o.id === currentOfficeId}>
                  {o.name} {o.id === currentOfficeId ? '(Actual)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Motivo del Traslado</label>
            <textarea 
              className="form-control" 
              placeholder="Ej: Reasignación de personal, cambio de equipo..."
              style={{ height: '80px', resize: 'none' }}
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={loading || !selectedOfficeId || !reason.trim()}
          >
            {loading ? 'Procesando...' : 'Confirmar Traslado'}
          </button>
        </div>
      </div>
    </div>
  );
};
