import { Control, Answer, ControlStatus } from '../types';
import { X, Save, Calendar, User, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ControlDetailsProps {
  control: Control;
  answer: Answer | undefined;
  onSave: (answer: Partial<Answer>) => void;
  onClose: () => void;
}

export default function ControlDetails({ control, answer, onSave, onClose }: ControlDetailsProps) {
  const [formData, setFormData] = useState({
    status: 'missing' as ControlStatus,
    owner: '',
    dueDate: '',
    riskImpact: 2,
    effort: 2,
    notes: ''
  });

  useEffect(() => {
    if (answer) {
      setFormData({
        status: answer.status,
        owner: answer.owner || '',
        dueDate: answer.dueDate || '',
        riskImpact: answer.riskImpact || 2,
        effort: answer.effort || 2,
        notes: answer.notes || ''
      });
    } else {
      setFormData({
        status: 'missing',
        owner: '',
        dueDate: '',
        riskImpact: 2,
        effort: 2,
        notes: ''
      });
    }
  }, [answer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="control-details-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <div className="modal-code">{control.code}</div>
            <h2>{control.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="control-info-section">
            <h3>
              <FileText size={18} />
              Description
            </h3>
            <p>{control.description}</p>
            
            {control.guidance && (
              <>
                <h3>Implementation Guidance</h3>
                <p>{control.guidance}</p>
              </>
            )}

            {control.tags && control.tags.length > 0 && (
              <div className="control-tags-large">
                {control.tags.map(tag => (
                  <span key={tag} className="tag-large">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="assessment-form">
            <h3>
              <AlertTriangle size={18} />
              Assessment
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ControlStatus })}
                >
                  <option value="missing">❌ Missing</option>
                  <option value="partial">⚠️ Partial</option>
                  <option value="ready">✅ Ready</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Owner
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., CISO, IT Manager"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Risk Impact (1-5)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="5"
                  value={formData.riskImpact}
                  onChange={(e) => setFormData({ ...formData, riskImpact: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Effort (1-5)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="5"
                value={formData.effort}
                onChange={(e) => setFormData({ ...formData, effort: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Add implementation notes, evidence, or references..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={6}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                Save Assessment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

