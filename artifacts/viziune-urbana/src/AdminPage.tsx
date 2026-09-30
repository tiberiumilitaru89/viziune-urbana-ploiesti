import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  LogIn, LogOut, Plus, Pencil, Trash2, Upload, X, CheckCircle2,
  Clock, ImageIcon, ArrowLeft, Loader2, ShieldCheck,
  FileText, Wallet, Save, Users, LayoutGrid, ChevronRight,
} from 'lucide-react';

// ── types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  description: string;
  status: 'in_progress' | 'completed';
  imageObjectPath: string | null;
  beforeImageObjectPath: string | null;
  afterImageObjectPath: string | null;
  createdAt: string;
}

interface AuditRequest {
  id: number;
  name: string;
  phone: string;
  building: string;
  address: string;
  problem: string;
  status: string;
  formsCollected: number;
  formsTarget: number;
  fundsCollected: number;
  fundsTarget: number;
  createdAt: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  return res;
}

function imgUrl(objectPath: string | null) {
  if (!objectPath) return null;
  return `${BASE}/api/storage${objectPath}`;
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiFetch('/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
    setLoading(false);
    if (res.ok) onLogin();
    else setError('Parolă incorectă.');
  };

  return (
    <div className="min-h-screen bg-[#0a1128] flex items-center justify-center p-4 relative overflow-hidden">
      {/* bg texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ea580c]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#ea580c] rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/50">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm">Viziune Urbană Ploiești</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Parolă admin</label>
              <input
                required type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#ea580c] text-white py-3.5 rounded-xl font-bold hover:bg-[#c2410c] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-900/40 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              Intră în admin
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href={BASE || '/'} className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> Înapoi la site
          </a>
        </div>
      </div>
    </div>
  );
}

// ── ImageUploadZone ────────────────────────────────────────────────────────────
function ImageUploadZone({
  label, accentColor = '#ea580c', objectPath, onChange,
}: {
  label: string;
  accentColor?: string;
  objectPath: string | null;
  onChange: (path: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setProgress(10); setError('');
    try {
      const urlRes = await apiFetch('/storage/uploads/request-url', {
        method: 'POST',
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error('Nu s-a putut obține URL-ul de upload.');
      const { uploadURL, objectPath: newPath } = await urlRes.json() as { uploadURL: string; objectPath: string };
      setProgress(30);
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(30 + Math.round((ev.loaded / ev.total) * 65));
      };
      await new Promise<void>((resolve, reject) => {
        xhr.open('PUT', uploadURL);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`GCS ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Upload eșuat.'));
        xhr.send(file);
      });
      onChange(newPath); setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare upload.');
    } finally { setUploading(false); }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      <div
        className="relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors border-white/20 hover:border-white/40"
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {objectPath ? (
          <div className="relative group h-36">
            <img src={imgUrl(objectPath)!} className="w-full h-full object-cover" alt={label} />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-semibold text-xs flex items-center gap-1.5"><Upload size={14} /> Schimbă</span>
            </div>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-1.5">
            {uploading
              ? <><Loader2 size={22} className="animate-spin" style={{ color: accentColor }} /><span className="text-xs font-medium" style={{ color: accentColor }}>{progress}%</span></>
              : <><ImageIcon size={24} className="text-white/20" /><span className="text-xs text-white/30">Click pentru upload</span></>
            }
          </div>
        )}
        {uploading && !objectPath && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {objectPath && (
        <button type="button" onClick={() => onChange(null)} className="mt-1.5 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
          <X size={11} /> Elimină
        </button>
      )}
    </div>
  );
}

// ── ProjectModal ──────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!project;
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<'in_progress' | 'completed'>(project?.status ?? 'in_progress');
  const [imageObjectPath, setImageObjectPath] = useState<string | null>(project?.imageObjectPath ?? null);
  const [beforeImageObjectPath, setBeforeImageObjectPath] = useState<string | null>(project?.beforeImageObjectPath ?? null);
  const [afterImageObjectPath, setAfterImageObjectPath] = useState<string | null>(project?.afterImageObjectPath ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Titlul este obligatoriu.'); return; }
    setSaving(true); setError('');
    const body = { title, description, status, imageObjectPath, beforeImageObjectPath, afterImageObjectPath };
    const res = isEdit
      ? await apiFetch(`/projects/${project!.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await apiFetch('/projects', { method: 'POST', body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error ?? 'Eroare server.'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-serif font-bold text-white">{isEdit ? 'Editează proiect' : 'Proiect nou'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Poze Înainte / După */}
          <div>
            <p className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
              <ImageIcon size={15} className="text-[#ea580c]" /> Poze Înainte / După intervenție
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ImageUploadZone label="📷 Înainte" accentColor="#6b7280" objectPath={beforeImageObjectPath} onChange={setBeforeImageObjectPath} />
              <ImageUploadZone label="✅ După intervenție" accentColor="#22c55e" objectPath={afterImageObjectPath} onChange={setAfterImageObjectPath} />
            </div>
            <p className="text-xs text-white/25 mt-2">Când ambele poze sunt prezente, cardul va afișa split-ul Înainte/După pe site.</p>
          </div>

          {/* Foto generală (opțional, fallback) */}
          <div>
            <p className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
              <ImageIcon size={15} className="text-white/40" /> Fotografie generală <span className="text-white/25 font-normal text-xs">(opțional — folosită dacă nu există split)</span>
            </p>
            <ImageUploadZone label="" accentColor="#ea580c" objectPath={imageObjectPath} onChange={setImageObjectPath} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Titlu *</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none text-sm transition-all"
              placeholder="ex: Reabilitare subsol Bloc 4 Malu Roșu" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Descriere</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none text-sm resize-none transition-all"
              placeholder="Detalii despre lucrare: materiale folosite, suprafețe, durată…" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">Status</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStatus('in_progress')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${status === 'in_progress' ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                <Clock size={16} /> În curs
              </button>
              <button type="button" onClick={() => setStatus('completed')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${status === 'completed' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                <CheckCircle2 size={16} /> Finalizat
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl font-semibold text-white/50 hover:text-white/70 hover:border-white/20 transition-colors">Anulează</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-[#ea580c] text-white rounded-xl font-bold hover:bg-[#c2410c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Salvează' : 'Adaugă proiect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({ project, onClose, onDeleted }: { project: Project; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await apiFetch(`/projects/${project.id}`, { method: 'DELETE' });
    setLoading(false); onDeleted(); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-serif font-bold text-white mb-2">Ștergi proiectul?</h3>
        <p className="text-white/40 text-sm mb-6">„<strong className="text-white/60">{project.title}</strong>" va fi șters permanent.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl font-semibold text-white/50 hover:text-white/70 transition-colors">Anulează</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null} Șterge
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProgressModal ─────────────────────────────────────────────────────────────
function ProgressModal({ req, onClose, onSaved }: { req: AuditRequest; onClose: () => void; onSaved: () => void }) {
  const [formsCollected, setFormsCollected] = useState(req.formsCollected);
  const [formsTarget, setFormsTarget] = useState(req.formsTarget);
  const [fundsCollected, setFundsCollected] = useState(req.fundsCollected);
  const [fundsTarget, setFundsTarget] = useState(req.fundsTarget);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formsPct = formsTarget > 0 ? Math.min(100, Math.round((formsCollected / formsTarget) * 100)) : 0;
  const fundsPct = fundsTarget > 0 ? Math.min(100, Math.round((fundsCollected / fundsTarget) * 100)) : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await apiFetch(`/audit-requests/${req.id}`, {
      method: 'PUT',
      body: JSON.stringify({ formsCollected, formsTarget, fundsCollected, fundsTarget }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error ?? 'Eroare server.'); }
  };

  const inp = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none text-sm transition-all";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-serif font-bold text-white">Progres asociație</h2>
            <p className="text-sm text-white/40 mt-0.5">{req.building} — {req.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Formulare 230 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563eb]/20 rounded-lg flex items-center justify-center">
                <FileText size={15} className="text-[#60a5fa]" />
              </div>
              <span className="font-semibold text-white/80 text-sm">Formulare 230 ANAF</span>
              <span className="ml-auto text-xs font-bold text-[#60a5fa]">{formsPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full transition-all duration-300" style={{ width: `${formsPct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1 font-medium">Adunate</label>
                <input type="number" min={0} value={formsCollected} onChange={e => setFormsCollected(Number(e.target.value))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1 font-medium">Țintă</label>
                <input type="number" min={1} value={formsTarget} onChange={e => setFormsTarget(Number(e.target.value))} className={inp} />
              </div>
            </div>
          </div>

          {/* Fonduri manoperă */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ea580c]/20 rounded-lg flex items-center justify-center">
                <Wallet size={15} className="text-[#ea580c]" />
              </div>
              <span className="font-semibold text-white/80 text-sm">Fonduri manoperă (RON)</span>
              <span className="ml-auto text-xs font-bold text-[#ea580c]">{fundsPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#ea580c] rounded-full transition-all duration-300" style={{ width: `${fundsPct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1 font-medium">Strânse (RON)</label>
                <input type="number" min={0} value={fundsCollected} onChange={e => setFundsCollected(Number(e.target.value))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1 font-medium">Necesare (RON)</label>
                <input type="number" min={0} value={fundsTarget} onChange={e => setFundsTarget(Number(e.target.value))} className={inp} />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl font-semibold text-white/50 hover:text-white/70 hover:border-white/20 transition-colors">Anulează</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-[#ea580c] text-white rounded-xl font-bold hover:bg-[#c2410c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── ProiecteTab ───────────────────────────────────────────────────────────────
function ProiecteTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState<Project | null | undefined>(undefined);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await apiFetch('/projects');
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <>
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#ea580c] font-bold text-sm uppercase tracking-widest mb-2">Gestionare</p>
          <h2 className="text-4xl font-serif font-bold text-white">Lucrări & Proiecte</h2>
          <p className="text-white/40 mt-2 text-sm">Adaugă sau editează proiectele afișate pe site</p>
        </div>
        <button onClick={() => setEditProject(null)}
          className="bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c2410c] transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/40">
          <Plus size={18} /> Proiect nou
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32"><Loader2 size={36} className="text-white/20 animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <ImageIcon size={36} className="text-white/20" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white/60 mb-2">Niciun proiect adăugat</h3>
          <p className="text-white/30 text-sm mb-8">Primul proiect adăugat va apărea pe site în secțiunea „Lucrări trecute".</p>
          <button onClick={() => setEditProject(null)}
            className="bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c2410c] transition-colors inline-flex items-center gap-2 shadow-lg shadow-orange-900/40">
            <Plus size={16} /> Adaugă primul proiect
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p.id} className="bg-[#1e293b] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#ea580c]/40 transition-all">
              {p.imageObjectPath ? (
                <div className="relative overflow-hidden h-48">
                  <img src={imgUrl(p.imageObjectPath)!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt={p.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                  <div className="absolute top-3 left-3">
                    {p.status === 'completed'
                      ? <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={11} /> Finalizat</span>
                      : <span className="bg-[#ea580c] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={11} /> În curs</span>}
                  </div>
                  {/* Edit/delete overlay */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditProject(p)}
                      className="w-8 h-8 bg-white/90 text-[#0a1128] rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteProject(p)}
                      className="w-8 h-8 bg-red-500/90 text-white rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-28 bg-[#0a1128] flex items-center justify-center relative">
                  <ImageIcon size={28} className="text-white/10" />
                  <div className="absolute top-3 left-3">
                    {p.status === 'completed'
                      ? <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={11} /> Finalizat</span>
                      : <span className="bg-[#ea580c] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={11} /> În curs</span>}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditProject(p)}
                      className="w-8 h-8 bg-white/10 text-white/70 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteProject(p)}
                      className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-white leading-tight mb-1">{p.title}</h3>
                {p.description && <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">{p.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-white/25">{new Date(p.createdAt).toLocaleDateString('ro-RO')}</span>
                  <button onClick={() => setEditProject(p)}
                    className="text-xs text-[#ea580c] font-semibold hover:text-[#fb923c] flex items-center gap-1 transition-colors">
                    Editează <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editProject !== undefined && (
        <ProjectModal project={editProject} onClose={() => setEditProject(undefined)} onSaved={fetchProjects} />
      )}
      {deleteProject && (
        <DeleteConfirm project={deleteProject} onClose={() => setDeleteProject(null)} onDeleted={fetchProjects} />
      )}
    </>
  );
}

// ── AssociatiiTab ─────────────────────────────────────────────────────────────
type FilterTab = 'toate' | 'nou' | 'acceptat' | 'respins';

function AssociatiiTab() {
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReq, setEditReq] = useState<AuditRequest | null>(null);
  const [filter, setFilter] = useState<FilterTab>('toate');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const res = await apiFetch('/audit-requests');
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  const setStatus = async (id: number, status: string) => {
    setActionLoading(id);
    await apiFetch(`/audit-requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    await loadRequests();
    setActionLoading(null);
  };

  const counts = {
    toate: requests.length,
    nou: requests.filter(r => r.status === 'nou').length,
    acceptat: requests.filter(r => r.status === 'acceptat').length,
    respins: requests.filter(r => r.status === 'respins').length,
  };

  const visible = filter === 'toate' ? requests : requests.filter(r => r.status === filter);

  const FILTERS: { key: FilterTab; label: string; color: string }[] = [
    { key: 'toate', label: 'Toate', color: 'white' },
    { key: 'nou', label: 'În așteptare', color: 'amber' },
    { key: 'acceptat', label: 'Acceptate', color: 'green' },
    { key: 'respins', label: 'Respinse', color: 'red' },
  ];

  return (
    <>
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#ea580c] font-bold text-sm uppercase tracking-widest mb-2">Gestionare</p>
          <h2 className="text-4xl font-serif font-bold text-white">Asociații Înscrise</h2>
          <p className="text-white/40 mt-2 text-sm">Acceptă cereri și editează progresul fiecărei asociații</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-center">
            <div className="text-2xl font-serif font-bold text-amber-400">{counts.nou}</div>
            <div className="text-xs text-amber-400/70 font-medium">în așteptare</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-center">
            <div className="text-2xl font-serif font-bold text-green-400">{counts.acceptat}</div>
            <div className="text-xs text-green-400/70 font-medium">acceptate</div>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(f => {
          const active = filter === f.key;
          const colorMap: Record<string, string> = {
            white: active ? 'bg-white text-[#0a1128]' : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60',
            amber: active ? 'bg-amber-500 text-white' : 'border border-white/10 text-white/40 hover:border-amber-500/30 hover:text-amber-400',
            green: active ? 'bg-green-500 text-white' : 'border border-white/10 text-white/40 hover:border-green-500/30 hover:text-green-400',
            red: active ? 'bg-red-500 text-white' : 'border border-white/10 text-white/40 hover:border-red-500/30 hover:text-red-400',
          };
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${colorMap[f.color]}`}>
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-black/10' : 'bg-white/10'}`}>{counts[f.key]}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32"><Loader2 size={36} className="text-white/20 animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users size={36} className="text-white/20" />
          </div>
          <p className="text-white/30 text-sm">
            {filter === 'toate' ? 'Nicio cerere primită încă.' : `Nicio cerere cu statusul „${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(r => {
            const isAccepted = r.status === 'acceptat';
            const isRejected = r.status === 'respins';
            const isPending = r.status === 'nou';
            const isLoading = actionLoading === r.id;
            const formsPct = r.formsTarget > 0 ? Math.min(100, Math.round((r.formsCollected / r.formsTarget) * 100)) : 0;
            const fundsPct = r.fundsTarget > 0 ? Math.min(100, Math.round((r.fundsCollected / r.fundsTarget) * 100)) : 0;

            return (
              <div key={r.id} className={`rounded-2xl border overflow-hidden transition-all ${isRejected ? 'bg-white/[0.02] border-white/5 opacity-60' : isAccepted ? 'bg-[#1e293b] border-green-500/20' : 'bg-[#1e293b] border-amber-500/20'}`}>

                {/* Status stripe */}
                <div className={`h-1 ${isPending ? 'bg-amber-500' : isAccepted ? 'bg-green-500' : 'bg-red-500/40'}`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h3 className="font-serif font-bold text-white text-lg leading-tight">{r.building}</h3>
                        {isPending && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">În așteptare</span>}
                        {isAccepted && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"><CheckCircle2 size={11} /> Acceptat</span>}
                        {isRejected && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Respins</span>}
                      </div>
                      <p className="text-white/40 text-sm">{r.address}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPending && (
                        <>
                          <button onClick={() => setStatus(r.id, 'acceptat')} disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />} Acceptă
                          </button>
                          <button onClick={() => setStatus(r.id, 'respins')} disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />} Respinge
                          </button>
                        </>
                      )}
                      {isAccepted && (
                        <>
                          <button onClick={() => setEditReq(r)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c] bg-[#ea580c]/10 border border-[#ea580c]/20 hover:bg-[#ea580c]/20 px-3 py-1.5 rounded-lg transition-colors">
                            <Pencil size={13} /> Editează progres
                          </button>
                          <button onClick={() => setStatus(r.id, 'respins')} disabled={isLoading}
                            className="w-8 h-8 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors" title="Respinge">
                            <X size={15} />
                          </button>
                        </>
                      )}
                      {isRejected && (
                        <button onClick={() => setStatus(r.id, 'nou')} disabled={isLoading}
                          className="text-xs font-semibold text-white/30 border border-white/10 hover:border-white/20 hover:text-white/50 px-3 py-1.5 rounded-lg transition-colors">
                          Reactivează
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Reprezentant</p>
                      <p className="text-white/80 text-sm font-medium">{r.name}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Telefon</p>
                      <a href={`tel:${r.phone}`} className="text-[#ea580c] text-sm font-medium hover:text-[#fb923c] transition-colors">{r.phone}</a>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Data înscrierii</p>
                      <p className="text-white/80 text-sm font-medium">{new Date(r.createdAt).toLocaleDateString('ro-RO')}</p>
                    </div>
                  </div>

                  {r.problem && (
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-amber-400/70 font-semibold uppercase tracking-wider mb-1">Problema descrisă</p>
                      <p className="text-sm text-amber-200/70 leading-relaxed">{r.problem}</p>
                    </div>
                  )}

                  {/* Progress bars — only for accepted */}
                  {isAccepted && (
                    <div className="grid sm:grid-cols-2 gap-5 mt-2 pt-5 border-t border-white/10">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <FileText size={13} className="text-[#60a5fa]" />
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Formulare 230</span>
                          </div>
                          <span className="text-xs font-bold text-[#60a5fa]">{r.formsCollected} / {r.formsTarget > 0 ? r.formsTarget : '—'}</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2563eb] rounded-full transition-all duration-500" style={{ width: `${formsPct}%` }} />
                        </div>
                        {r.formsTarget === 0 && <p className="text-xs text-white/20 mt-1">Apasă „Editează progres" pentru a seta ținta</p>}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Wallet size={13} className="text-[#ea580c]" />
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Fonduri (RON)</span>
                          </div>
                          <span className="text-xs font-bold text-[#ea580c]">{r.fundsCollected.toLocaleString('ro-RO')} / {r.fundsTarget > 0 ? r.fundsTarget.toLocaleString('ro-RO') : '—'}</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ea580c] rounded-full transition-all duration-500" style={{ width: `${fundsPct}%` }} />
                        </div>
                        {r.fundsTarget === 0 && <p className="text-xs text-white/20 mt-1">Apasă „Editează progres" pentru a seta suma</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editReq && (
        <ProgressModal req={editReq} onClose={() => setEditReq(null)} onSaved={loadRequests} />
      )}
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'proiecte' | 'asociatii'>('proiecte');

  const handleLogout = async () => {
    await apiFetch('/admin/logout', { method: 'POST' });
    onLogout();
  };

  const TABS = [
    { key: 'proiecte' as const, label: 'Proiecte', icon: LayoutGrid },
    { key: 'asociatii' as const, label: 'Asociații', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0a1128] relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#ea580c]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0a1128]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <a href={BASE || '/'} className="text-white/30 hover:text-white/60 transition-colors mr-1">
              <ArrowLeft size={18} />
            </a>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#ea580c] rounded-lg flex items-center justify-center shadow shadow-orange-900/50">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <div>
                <span className="font-serif font-bold text-white text-sm">Viziune Urbană</span>
                <span className="text-white/30 text-xs ml-1.5">Admin</span>
              </div>
            </div>
          </div>

          {/* Tabs — in header */}
          <div className="flex items-center">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 h-16 text-sm font-semibold border-b-2 transition-all ${tab === key ? 'border-[#ea580c] text-white' : 'border-transparent text-white/35 hover:text-white/60'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all">
            <LogOut size={15} /> Deconectare
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {tab === 'proiecte' ? <ProiecteTab /> : <AssociatiiTab />}
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch('/admin/me').then(r => r.json()).then((d: { isAdmin: boolean }) => setIsAdmin(d.isAdmin));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
        <Loader2 size={32} className="text-white/20 animate-spin" />
      </div>
    );
  }
  if (!isAdmin) return <LoginPage onLogin={() => setIsAdmin(true)} />;
  return <Dashboard onLogout={() => setIsAdmin(false)} />;
}
