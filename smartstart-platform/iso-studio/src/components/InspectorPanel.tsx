import { Control, Answer, ControlStatus } from '../types';
import { Save, Calendar, User, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InspectorPanelProps {
  control: Control | null;
  answer: Answer | undefined;
  onSave: (answer: Partial<Answer>) => void;
}

export default function InspectorPanel({ control, answer, onSave }: InspectorPanelProps) {
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
  };

  if (!control) {
    return (
      <div className="panel inspector-panel">
        <div className="empty-state">
          <div className="empty-icon">👆</div>
          <p>Select a control to view details and update status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel inspector-panel">
      <div className="panel-header">
        <AlertTriangle size={20} />
        <span>Assessment</span>
      </div>

      <form onSubmit={handleSubmit} className="inspector-form">
        <div className="form-group">
          <label className="form-label">Control Code</label>
          <input type="text" className="form-input" value={control.code} readOnly />
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input type="text" className="form-input" value={control.title} readOnly />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={control.description} readOnly rows={4} />
        </div>

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
            placeholder="Add implementation notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>

        <button type="submit" className="btn-save">
          <Save size={18} />
          Save Assessment
        </button>
      </form>
    </div>
  );
}

