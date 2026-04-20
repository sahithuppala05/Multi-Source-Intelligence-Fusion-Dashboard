import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Image, ChevronDown, ChevronUp,
  MapPin, Trash2, AlertCircle, CheckCircle, Loader2, Plus, X
} from 'lucide-react';
import { uploadDataFile, uploadImage, createIntel } from '../utils/api';

const TYPE_COLORS = {
  OSINT: { text: 'text-osint', border: 'border-osint/40', bg: 'bg-osint/10', dot: 'bg-osint' },
  HUMINT: { text: 'text-humint', border: 'border-humint/40', bg: 'bg-humint/10', dot: 'bg-humint' },
  IMINT: { text: 'text-imint', border: 'border-imint/60', bg: 'bg-imint/10', dot: 'bg-imint' },
};

export default function Sidebar({ data, selectedId, onSelectItem, onRefresh, onRemove }) {
  const [section, setSection] = useState('list'); // 'list' | 'upload' | 'add'
  const [uploadState, setUploadState] = useState({ loading: false, error: null, success: null });
  const [imageState, setImageState] = useState({ loading: false, error: null, success: null });
  const [addState, setAddState] = useState({ loading: false, error: null, success: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newForm, setNewForm] = useState({
    title: '', description: '', latitude: '', longitude: '',
    type: 'OSINT', confidence: '75', imageUrl: '',
  });

  const dataFileRef = useRef();
  const imageFileRef = useRef();

  // --- File upload handlers ---
  const handleDataUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadState({ loading: true, error: null, success: null });
    setUploadProgress(0);
    try {
      const res = await uploadDataFile(file, setUploadProgress);
      setUploadState({ loading: false, error: null, success: res.message });
      onRefresh();
    } catch (err) {
      setUploadState({ loading: false, error: err.response?.data?.message || err.message, success: null });
    }
    e.target.value = '';
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageState({ loading: true, error: null, success: null });
    try {
      const res = await uploadImage(file);
      setImageState({ loading: false, error: null, success: `Image uploaded: ${res.filename}` });
      setNewForm((f) => ({ ...f, imageUrl: res.imageUrl }));
    } catch (err) {
      setImageState({ loading: false, error: err.response?.data?.message || err.message, success: null });
    }
    e.target.value = '';
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddState({ loading: true, error: null, success: null });
    try {
      await createIntel({
        ...newForm,
        latitude: parseFloat(newForm.latitude),
        longitude: parseFloat(newForm.longitude),
        confidence: parseInt(newForm.confidence),
      });
      setAddState({ loading: false, error: null, success: 'Intel point created!' });
      setNewForm({ title: '', description: '', latitude: '', longitude: '', type: 'OSINT', confidence: '75', imageUrl: '' });
      onRefresh();
    } catch (err) {
      setAddState({ loading: false, error: err.response?.data?.message || err.message, success: null });
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 intel-panel border-r border-ink-600 flex flex-col h-full overflow-hidden">
      {/* Section tabs */}
      <div className="flex border-b border-ink-600 flex-shrink-0">
        {[
          { id: 'list', label: 'INTEL' },
          { id: 'upload', label: 'UPLOAD' },
          { id: 'add', label: 'ADD' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`flex-1 py-2.5 font-mono text-[10px] tracking-widest transition-all duration-200 border-b-2 ${
              section === tab.id
                ? 'border-osint text-osint bg-osint/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-ink-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INTEL LIST */}
      {section === 'list' && (
        <div className="flex-1 overflow-y-auto">
          {data.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-mono text-xs text-slate-500">NO INTEL POINTS</p>
              <p className="font-mono text-[10px] text-slate-600 mt-1">Upload data or add manually</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-700">
              {data.map((item) => {
                const c = TYPE_COLORS[item.type] || TYPE_COLORS.OSINT;
                const isSelected = item._id === selectedId;
                return (
                  <div
                    key={item._id}
                    onClick={() => onSelectItem(item._id)}
                    className={`p-3 cursor-pointer transition-all duration-150 group ${
                      isSelected ? 'bg-osint/5 border-l-2 border-osint' : 'hover:bg-ink-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                        <span className={`font-mono text-[9px] tracking-widest flex-shrink-0 px-1.5 py-0.5 border ${c.text} ${c.border} ${c.bg}`}>
                          {item.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(item._id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-alert transition-all p-0.5 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <h4 className="font-sans font-semibold text-sm text-slate-200 mt-1.5 leading-tight truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="font-mono text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[9px] text-slate-600">
                        {parseFloat(item.latitude).toFixed(2)}, {parseFloat(item.longitude).toFixed(2)}
                      </span>
                      {item.confidence !== undefined && (
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1 bg-ink-600 rounded-none">
                            <div
                              className="h-1 rounded-none"
                              style={{ width: `${item.confidence}%`, background: TYPE_COLORS[item.type]?.dot === 'bg-osint' ? '#00d4ff' : item.type === 'HUMINT' ? '#ff6b35' : '#a78bfa' }}
                            />
                          </div>
                          <span className="font-mono text-[9px] text-slate-500">{item.confidence}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD SECTION */}
      {section === 'upload' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* CSV/JSON Upload */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-osint" />
              <span className="font-mono text-[10px] text-slate-400 tracking-widest">DATA FILE (CSV / JSON)</span>
            </div>
            <div
              className="border border-dashed border-ink-600 p-4 text-center cursor-pointer hover:border-osint/50 hover:bg-osint/5 transition-all"
              onClick={() => dataFileRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
              <p className="font-mono text-[10px] text-slate-500">CLICK TO UPLOAD</p>
              <p className="font-mono text-[9px] text-slate-600 mt-0.5">.CSV or .JSON</p>
            </div>
            <input ref={dataFileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleDataUpload} />
            {uploadState.loading && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="w-3 h-3 text-osint animate-spin" />
                  <span className="font-mono text-[10px] text-osint">PROCESSING... {uploadProgress}%</span>
                </div>
                <div className="h-1 bg-ink-700">
                  <div className="h-1 bg-osint transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            {uploadState.error && <StatusMsg type="error" msg={uploadState.error} />}
            {uploadState.success && <StatusMsg type="success" msg={uploadState.success} />}
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-3.5 h-3.5 text-humint" />
              <span className="font-mono text-[10px] text-slate-400 tracking-widest">IMAGE (JPG / PNG)</span>
            </div>
            <div
              className="border border-dashed border-ink-600 p-4 text-center cursor-pointer hover:border-humint/50 hover:bg-humint/5 transition-all"
              onClick={() => imageFileRef.current?.click()}
            >
              <Image className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
              <p className="font-mono text-[10px] text-slate-500">CLICK TO UPLOAD</p>
              <p className="font-mono text-[9px] text-slate-600 mt-0.5">JPG, PNG, WEBP (max 10MB)</p>
            </div>
            <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageState.loading && (
              <div className="mt-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-humint animate-spin" />
                <span className="font-mono text-[10px] text-humint">UPLOADING...</span>
              </div>
            )}
            {imageState.error && <StatusMsg type="error" msg={imageState.error} />}
            {imageState.success && <StatusMsg type="success" msg={imageState.success} />}
          </div>

          {/* Format guide */}
          <div className="intel-panel p-3">
            <p className="font-mono text-[9px] text-slate-500 tracking-widest mb-2">REQUIRED FIELDS</p>
            <div className="space-y-1">
              {['latitude / lat', 'longitude / lng', 'title / name', 'type (OSINT/HUMINT/IMINT)'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-osint/60 rounded-full" />
                  <span className="font-mono text-[10px] text-slate-400">{f}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] text-slate-500 tracking-widest mt-2 mb-1">OPTIONAL</p>
            {['description', 'confidence (0-100)', 'imageUrl'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-600 rounded-full" />
                <span className="font-mono text-[10px] text-slate-500">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MANUALLY */}
      {section === 'add' && (
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <FormField label="TITLE *">
              <input
                className="input-field"
                placeholder="Intel point title"
                value={newForm.title}
                onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </FormField>

            <FormField label="TYPE *">
              <select
                className="input-field"
                value={newForm.type}
                onChange={(e) => setNewForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="OSINT">OSINT</option>
                <option value="HUMINT">HUMINT</option>
                <option value="IMINT">IMINT</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="LATITUDE *">
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="34.0522"
                  value={newForm.latitude}
                  onChange={(e) => setNewForm((f) => ({ ...f, latitude: e.target.value }))}
                  required
                  min="-90"
                  max="90"
                />
              </FormField>
              <FormField label="LONGITUDE *">
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="-118.24"
                  value={newForm.longitude}
                  onChange={(e) => setNewForm((f) => ({ ...f, longitude: e.target.value }))}
                  required
                  min="-180"
                  max="180"
                />
              </FormField>
            </div>

            <FormField label="DESCRIPTION">
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Intel description..."
                value={newForm.description}
                onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
              />
            </FormField>

            <FormField label={`CONFIDENCE: ${newForm.confidence}%`}>
              <input
                type="range"
                min="0"
                max="100"
                value={newForm.confidence}
                onChange={(e) => setNewForm((f) => ({ ...f, confidence: e.target.value }))}
                className="w-full accent-osint"
              />
            </FormField>

            <FormField label="IMAGE URL">
              <input
                className="input-field"
                placeholder="/uploads/images/..."
                value={newForm.imageUrl}
                onChange={(e) => setNewForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </FormField>

            {addState.error && <StatusMsg type="error" msg={addState.error} />}
            {addState.success && <StatusMsg type="success" msg={addState.success} />}

            <button
              type="submit"
              disabled={addState.loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {addState.loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ADDING...</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> ADD INTEL POINT</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Footer count */}
      <div className="border-t border-ink-600 px-4 py-2 flex-shrink-0">
        <span className="font-mono text-[10px] text-slate-500 tracking-widest">
          {data.length} POINT{data.length !== 1 ? 'S' : ''} LOADED
        </span>
      </div>
    </aside>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-mono text-[9px] text-slate-500 tracking-widest mb-1">{label}</label>
      {children}
    </div>
  );
}

function StatusMsg({ type, msg }) {
  const isErr = type === 'error';
  return (
    <div className={`mt-2 flex items-start gap-2 p-2 ${isErr ? 'bg-alert/10 border border-alert/30' : 'bg-success/10 border border-success/30'}`}>
      {isErr
        ? <AlertCircle className="w-3.5 h-3.5 text-alert flex-shrink-0 mt-0.5" />
        : <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />}
      <span className={`font-mono text-[10px] leading-relaxed ${isErr ? 'text-alert' : 'text-success'}`}>{msg}</span>
    </div>
  );
}
