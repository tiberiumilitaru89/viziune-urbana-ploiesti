import { useState, useEffect, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import {
  MapPin,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Activity,
  Check,
  Banknote,
  Package,
  ArrowLeft,
  CreditCard,
  Wrench,
  ChevronUp,
  GraduationCap,
  Star
} from 'lucide-react';
import { useCreateAuditRequest, useGetAuditSummary, useListAuditRequests, useListProjects, useListSpecItems } from '@workspace/api-client-react';
import { AdminPage } from './AdminPage';

const queryClient = new QueryClient();

function FormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createReq = useCreateAuditRequest();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    building: '',
    address: '',
    problem: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createReq.mutate({ data: formData }, {
      onSuccess: () => {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ name: '', phone: '', building: '', address: '', problem: '' });
          onClose();
        }, 3000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1128]/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors z-10">
          <X size={24} />
        </button>
        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-2">Cerere Trimisă</h3>
              <p className="text-gray-600">Vă vom contacta în curând pentru a stabili detaliile evaluării gratuite.</p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-1">Cere o evaluare gratuită</h3>
              <p className="text-gray-600 text-sm mb-6">Completarea formularului durează 2 minute.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nume și Prenume</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="Ion Popescu" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="07XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nume Asociație / Bloc</label>
                  <input required type="text" value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="Asociația de proprietari Bloc X" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresă completă</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="Str. Exemplu, Nr. 10" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrieți pe scurt problema subsolului</label>
                  <textarea required value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all resize-none" placeholder="Avem inundații dese la scurgerea principală..."></textarea>
                </div>
                <button type="submit" disabled={createReq.isPending} className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2">
                  {createReq.isPending ? 'Se trimite...' : 'Trimite Cererea'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type DonationType = 'bani' | 'materiale';
type DonationStep = 'choose' | 'bani' | 'materiale' | 'success';

function DonationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<DonationStep>('choose');
  const [donationType, setDonationType] = useState<DonationType>('bani');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [baniForm, setBaniForm] = useState({ name: '', email: '', phone: '' });
  const [materialeForm, setMaterialeForm] = useState({
    company: '', contact: '', phone: '', email: '',
    materialType: '', materialTypeOther: '', quantity: '', unit: 'buc', description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('choose');
      setSelectedAmount(100);
      setCustomAmount('');
      setBaniForm({ name: '', email: '', phone: '' });
      setMaterialeForm({ company: '', contact: '', phone: '', email: '', materialType: '', materialTypeOther: '', quantity: '', unit: 'buc', description: '' });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const presetAmounts = [50, 100, 250, 500, 1000];
  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleBaniSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep('success'); }, 1200);
  };

  const handleMaterialeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep('success'); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1128]/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors z-10">
          <X size={24} />
        </button>

        {/* STEP: CHOOSE */}
        {step === 'choose' && (
          <div className="p-8">
            <div className="w-14 h-14 bg-[#ea580c]/10 rounded-xl flex items-center justify-center mb-4">
              <Banknote size={28} className="text-[#ea580c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-2">Susțineți Inițiativa</h3>
            <p className="text-gray-500 text-sm mb-8">Alegeți modalitatea prin care doriți să contribuiți la reabilitarea subsolurilor din Ploiești.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setDonationType('bani')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${donationType === 'bani' ? 'border-[#2563eb] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${donationType === 'bani' ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCard size={20} />
                </div>
                <div className="font-bold text-[#0a1128] text-sm mb-1">Donație în Bani</div>
                <div className="text-xs text-gray-500 leading-relaxed">Contribuție financiară directă pentru achiziția de materiale</div>
              </button>

              <button
                onClick={() => setDonationType('materiale')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${donationType === 'materiale' ? 'border-[#ea580c] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${donationType === 'materiale' ? 'bg-[#ea580c] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Package size={20} />
                </div>
                <div className="font-bold text-[#0a1128] text-sm mb-1">Donație Materiale</div>
                <div className="text-xs text-gray-500 leading-relaxed">Țevi, robineți, fitinguri, izolație sau alte materiale</div>
              </button>
            </div>

            <button
              onClick={() => setStep(donationType)}
              className="w-full bg-[#0a1128] text-white py-3.5 rounded-xl font-bold text-base hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Continuă <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP: BANI */}
        {step === 'bani' && (
          <div className="p-8">
            <button onClick={() => setStep('choose')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Înapoi
            </button>
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <CreditCard size={28} className="text-[#2563eb]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-1">Donație în Bani</h3>
            <p className="text-gray-500 text-sm mb-6">Suma donată va fi folosită integral pentru achiziția de materiale de instalații.</p>

            <form onSubmit={handleBaniSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Selectați suma (RON)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedAmount === amt && !customAmount ? 'border-[#2563eb] bg-[#2563eb] text-white' : 'border-gray-200 text-gray-700 hover:border-[#2563eb]'}`}
                    >
                      {amt} RON
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  placeholder="Altă sumă (RON)"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nume și Prenume *</label>
                <input required type="text" value={baniForm.name} onChange={e => setBaniForm({ ...baniForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all text-sm" placeholder="Ion Popescu" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input required type="email" value={baniForm.email} onChange={e => setBaniForm({ ...baniForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all text-sm" placeholder="ion.popescu@email.ro" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                <input type="tel" value={baniForm.phone} onChange={e => setBaniForm({ ...baniForm, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all text-sm" placeholder="07XX XXX XXX" />
              </div>

              {finalAmount && finalAmount > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Total de plătit:</span>
                  <span className="text-2xl font-bold text-[#2563eb]">{finalAmount} RON</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !finalAmount || finalAmount < 10}
                className="w-full bg-[#2563eb] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se procesează...</span>
                ) : (
                  <><CreditCard size={18} /> Confirmă Donația</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP: MATERIALE */}
        {step === 'materiale' && (
          <div className="p-8">
            <button onClick={() => setStep('choose')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Înapoi
            </button>
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <Package size={28} className="text-[#ea580c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-1">Donație Materiale</h3>
            <p className="text-gray-500 text-sm mb-6">Descrieți materialele pe care doriți să le donați. Vă vom contacta pentru a stabili detaliile preluării.</p>

            <form onSubmit={handleMaterialeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Companie / Persoană *</label>
                  <input required type="text" value={materialeForm.company} onChange={e => setMaterialeForm({ ...materialeForm, company: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm" placeholder="SC Exemplu SRL" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Persoană de contact *</label>
                  <input required type="text" value={materialeForm.contact} onChange={e => setMaterialeForm({ ...materialeForm, contact: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm" placeholder="Ion Popescu" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon *</label>
                  <input required type="tel" value={materialeForm.phone} onChange={e => setMaterialeForm({ ...materialeForm, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm" placeholder="07XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={materialeForm.email} onChange={e => setMaterialeForm({ ...materialeForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm" placeholder="contact@firma.ro" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tip materiale *</label>
                <select required value={materialeForm.materialType} onChange={e => setMaterialeForm({ ...materialeForm, materialType: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm bg-white">
                  <option value="">Selectați tipul...</option>
                  <option value="tevi-ppr">Țevi PPR</option>
                  <option value="robineti">Robineți și fitinguri</option>
                  <option value="izolatie">Izolație Armaflex</option>
                  <option value="vopsea">Vopsea / Zugrăveală</option>
                  <option value="electrice">Materiale electrice</option>
                  <option value="altele">Altele</option>
                </select>
                {materialeForm.materialType === 'altele' && (
                  <input
                    required
                    type="text"
                    placeholder="Specificați exact ce doriți să donați..."
                    value={materialeForm.materialTypeOther}
                    onChange={e => setMaterialeForm({ ...materialeForm, materialTypeOther: e.target.value })}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm"
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cantitate *</label>
                  <input required type="number" min="1" value={materialeForm.quantity} onChange={e => setMaterialeForm({ ...materialeForm, quantity: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm" placeholder="ex: 50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unitate</label>
                  <select value={materialeForm.unit} onChange={e => setMaterialeForm({ ...materialeForm, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] outline-none transition-all text-sm bg-white">
                    <option value="buc">buc</option>
                    <option value="m">m</option>
                    <option value="ml">ml</option>
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                    <option value="set">set</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descriere suplimentară</label>
                <textarea value={materialeForm.description} onChange={e => setMaterialeForm({ ...materialeForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 outline-none transition-all text-sm resize-none" placeholder="Specificații tehnice, dimensiuni, starea materialelor etc." />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ea580c] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#c2410c] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se trimite...</span>
                ) : (
                  <><Package size={18} /> Trimite Oferta de Donație</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#0a1128] mb-3">
              {donationType === 'bani' ? 'Donație Înregistrată!' : 'Ofertă Trimisă!'}
            </h3>

            {donationType === 'bani' ? (
              <>
                <p className="text-gray-600 mb-8 leading-relaxed">Mulțumim pentru generozitate, <strong>{baniForm.name}</strong>! Vă rugăm efectuați transferul bancar la datele de mai jos. Veți primi o confirmare pe email.</p>
                <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 text-left space-y-3 mb-6">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date bancare</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Beneficiar:</span>
                    <span className="text-[#0a1128] font-bold">Asociația Viziune Urbană</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">IBAN:</span>
                    <span className="text-[#0a1128] font-bold font-mono">RO49 AAAA 1B31 0075 9384 0000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Bancă:</span>
                    <span className="text-[#0a1128] font-medium">BCR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Sumă:</span>
                    <span className="text-[#2563eb] font-bold text-lg">{finalAmount} RON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Referință:</span>
                    <span className="text-[#0a1128] font-mono">DONATIE-{baniForm.name.split(' ')[0].toUpperCase()}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600 mb-8 leading-relaxed">Mulțumim pentru oferta de donație în materiale! Echipa noastră vă va contacta la <strong>{materialeForm.phone}</strong> în cel mult 24 de ore pentru a stabili detaliile preluării.</p>
            )}

            <button onClick={onClose} className="w-full bg-[#0a1128] text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
              Închide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'nou') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"><Clock size={12} /> Nou</span>;
  }
  if (status === 'acceptat') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"><CheckCircle2 size={12} /> Acceptat</span>;
  }
  if (status === 'respins') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><AlertCircle size={12} /> Respins</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
}

function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: summary } = useGetAuditSummary();
  const { data: requests } = useListAuditRequests();
  const { data: projects } = useListProjects();
  const { data: specItemsData } = useListSpecItems();

  const navLinks = [
    { href: '#misiune', label: 'Misiune' },
    { href: '#cum-functioneaza', label: 'Cum Funcționează' },
    { href: '#proiecte', label: 'Proiecte' },
    { href: '#asociatii-inscrisi', label: 'Asociații Înscrise' },
    { href: '#donatori', label: 'Donatori' },
    { href: '#partener', label: 'Partener' },
    { href: '#caiet-sarcini', label: 'Caiet de Sarcini' },
    { href: '#faq', label: 'FAQ' }
  ];

  const faqs = [
    { q: 'Este gratuită evaluarea?', a: 'Da, deplasarea în teren, evaluarea stării subsolului și întocmirea devizului de materiale sunt complet gratuite.' },
    { q: 'Asociația mai plătește ceva?', a: 'Asociația plătește DOAR manopera (munca instalatorilor) către partenerul tehnic. Materialele... sunt gratuite.' },
    { q: 'Ce înseamnă sponsorizare în materiale?', a: 'Viziune Urbană achiziționează direct de la distribuitori țevile, robineții, izolația și toate materialele necesare, și le donează asociației. Nu vă dăm bani, ci vă aducem fizic materialele.' },
    { q: 'Cât durează procesul?', a: 'De la depunerea cererii și până la aprobarea sponsorizării trec în medie 2-3 săptămâni, în funcție de fondurile disponibile la acel moment.' },
    { q: 'Cine poate aplica?', a: 'Orice asociație de proprietari legal constituită din municipiul Ploiești care are nevoie urgentă de reabilitarea rețelelor de la subsol.' }
  ];

  const scrollTo = (href: string) => {
    setIsMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const acceptedRequests = (requests ?? []).filter((r: any) => r.status === 'acceptat');

  return (
    <div className="min-h-screen bg-white">
      <FormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
      <DonationModal isOpen={donationOpen} onClose={() => setDonationOpen(false)} />

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#0a1128]/90 to-transparent">
        <div className="container mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563eb] rounded-[10px] flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-tight">Viziune Urbană</div>
              <div className="text-[9px] font-bold text-white/80 uppercase tracking-[0.2em] mt-0.5">Ploiești</div>
            </div>
          </div>
          
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map(link => (
              <button key={link.href} onClick={() => scrollTo(link.href)} className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => setFormOpen(true)} className="border border-white/30 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
              Sunt Asociație
            </button>
            <button onClick={() => scrollTo('#donatori')} className="bg-[#ea580c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#c2410c] transition-colors">
              Donează Materiale
            </button>
          </div>

          <button className="xl:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-[#0a1128] border-t border-white/10 p-4 shadow-2xl flex flex-col gap-2">
            {navLinks.map(link => (
              <button key={link.href} onClick={() => scrollTo(link.href)} className="text-left text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 text-base font-medium">
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
              <button onClick={() => { setFormOpen(true); setIsMenuOpen(false); }} className="border border-white/30 text-white px-5 py-3 rounded-lg text-base font-semibold text-center">
                Sunt Asociație
              </button>
              <button onClick={() => scrollTo('#donatori')} className="bg-[#ea580c] text-white px-5 py-3 rounded-lg text-base font-semibold text-center">
                Donează Materiale
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center justify-start pt-24 pb-16" style={{ backgroundImage: "url('/ref-assets/cathedral-ploiesti.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <div className="absolute inset-0 bg-[#0a1128]/85" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <MapPin size={14} className="text-[#ea580c]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-white">Inițiativă civică în Ploiești</span>
            </div>
            <h1 className="text-[3.5rem] md:text-7xl font-serif text-white leading-[1.05] mb-6">
              Fundația unui bloc sănătos <br className="hidden md:block" />
              <span className="text-[#ea580c] italic">începe de jos.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed font-light">
              Sponsorizări țevi și fitinguri pentru rețeaua principală a blocului tău — fără costuri pentru asociație.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setFormOpen(true)} className="bg-[#2563eb] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1d4ed8] transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 text-lg">
                Suntem o Asociație <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollTo('#donatori')} className="bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white/50 transition-colors flex justify-center items-center text-lg">
                Donează Materiale
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PARTENERI STRIP */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 md:pr-8 md:border-r border-gray-200 whitespace-nowrap shrink-0">
              Partenerii noștri
            </span>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-8 gap-y-4 md:pl-8 w-full">
              {/* Partener tehnic */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0a1128] flex items-center justify-center shrink-0">
                  <Wrench size={15} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] leading-none mb-0.5">Partener tehnic</div>
                  <div className="text-sm font-bold text-[#0a1128] leading-none">Instal Serv Becheanu</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200" />

              {/* Liceu */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} className="text-[#ea580c]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] leading-none mb-0.5">Partener de practică</div>
                  <div className="text-sm font-bold text-[#0a1128] leading-none">Lic. Teh. Toma Socolescu</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200" />

              {/* ACCR */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} className="text-[#ea580c]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] leading-none mb-0.5">Partener de practică</div>
                  <div className="text-sm font-bold text-[#0a1128] leading-none">ACCR Ploiești</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200" />

              {/* UPG */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 size={15} className="text-[#2563eb]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb] leading-none mb-0.5">Susținător proiect</div>
                  <div className="text-sm font-bold text-[#0a1128] leading-none">UPG Ploiești</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MISIUNE */}
      <section id="misiune" className="bg-[#0a1128] text-white py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="text-[#ea580c] font-bold uppercase tracking-[0.2em] text-xs">De ce existăm</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-8 leading-tight">Problema invizibilă <br />de sub noi.</h2>
              <div className="space-y-6 text-white/70 text-lg leading-relaxed font-light">
                <p>Sute de blocuri din Ploiești ascund la subsol o bombă cu ceas: țevi ruginite, inundații recurente, pierderi masive de căldură și un mediu insalubru.</p>
                <p>Viziune Urbană a pornit din frustrarea comună a multor ploieșteni: subsoluri inundate, mirosuri insuportabile și facturi umflate de pierderi.</p>
              </div>
              <blockquote className="border-l-4 border-[#ea580c] pl-6 py-2 text-xl md:text-2xl text-white font-serif italic mt-10 leading-snug">
                "Nu suntem o firmă. Suntem vecini care au decis că nu mai pot aștepta să se repare de la sine."
              </blockquote>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10">
                <img src="/ref-assets/community-Cl-I_eDW.png" alt="Comunitate Ploiesti" className="w-full h-full object-cover" />
              </div>
              
              <div className="relative lg:absolute lg:-bottom-12 lg:-left-12 z-20 mt-6 lg:mt-0 flex gap-4 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                <div className="bg-white text-[#0a1128] p-6 md:p-8 rounded-2xl shadow-xl flex-shrink-0 min-w-[200px]">
                  <div className="text-4xl font-bold text-[#ea580c] mb-1">{summary?.total || 0}</div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Asociații Ajutate</div>
                </div>
                <div className="bg-[#2563eb] text-white p-6 md:p-8 rounded-2xl shadow-xl flex-shrink-0 min-w-[200px]">
                  <div className="text-4xl font-bold text-white mb-1">{(summary?.total || 0) * 12500}</div>
                  <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Lei Sponsorizați</div>
                </div>
                <div className="bg-[#1e293b] border border-white/10 text-white p-6 md:p-8 rounded-2xl shadow-xl flex-shrink-0 min-w-[200px]">
                  <div className="text-4xl font-bold text-white mb-1">{summary?.thisMonth || 0}</div>
                  <div className="text-sm font-semibold text-white/50 uppercase tracking-wider">Proiecte finalizate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUM FUNCȚIONEAZĂ */}
      <section id="cum-functioneaza" className="bg-[#f8fafc] py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-[#0a1128] font-bold mb-6">Cum funcționează.</h2>
            <div className="w-24 h-1 bg-[#ea580c] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 mb-16 relative">
            {/* Steps line */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0"></div>
            
            <div className="relative z-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <div className="w-12 h-12 bg-[#ea580c] text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-orange-500/20">1</div>
              <h3 className="text-xl font-bold text-[#0a1128] mb-3">Completează formularul</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">Asociația depune cererea și detaliază problema subsolului.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] bg-blue-50 px-3 py-1 rounded-md"><Clock size={14} /> Durează doar 2 minute</span>
            </div>
            
            <div className="relative z-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <div className="w-12 h-12 bg-[#2563eb] text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-blue-500/20">2</div>
              <h3 className="text-xl font-bold text-[#0a1128] mb-3">Evaluare Tehnică</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">Specialiștii evaluează în teren și calculează necesarul de materiale.</p>
              <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">Da, deplasarea în teren, evaluarea stării subsolului și întocmirea devizului de materiale sunt complet gratuite.</p>
            </div>
            
            <div className="relative z-10 bg-[#0a1128] text-white p-8 rounded-2xl shadow-xl border border-[#1e293b] h-full transform md:-translate-y-2">
              <div className="w-12 h-12 bg-[#ea580c] text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-orange-500/20">3</div>
              <h3 className="text-xl font-bold text-white mb-3">Sponsorizare</h3>
              <p className="text-white/80 mb-4 leading-relaxed text-sm">Viziune Urbană achiziționează direct de la distribuitori țevile, robineții, izolația și toate materialele necesare, și le donează asociației. Nu vă dăm bani, ci vă aducem fizic materialele.</p>
              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                <p className="text-xs text-white/90 font-medium leading-relaxed">Asigurăm integral toate materialele necesare, cu zero cost pentru bloc.</p>
              </div>
            </div>
            
            <div className="relative z-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">4</div>
              <h3 className="text-xl font-bold text-[#0a1128] mb-3">Execuție</h3>
              <p className="text-gray-600 leading-relaxed">Partenerul autorizat execută lucrarea, asociația plătind doar manopera.</p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto bg-orange-50 rounded-2xl p-8 border border-orange-100 flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-3 rounded-xl shadow-sm shrink-0">
              <AlertCircle size={28} className="text-[#ea580c]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0a1128] mb-1">Notă Importantă — Asociația mai plătește ceva?</h4>
              <p className="text-gray-700 leading-relaxed">
                Asociația plătește <strong>DOAR manopera</strong> (munca instalatorilor) către partenerul tehnic. Materialele care reprezintă o mare parte din cost sunt gratuite. Singura voastră grijă rămâne plata manoperei către executant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROIECTE */}
      <section id="proiecte" className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif text-[#0a1128] font-bold mb-6">Lucrări trecute</h2>
              <p className="text-lg text-gray-600 leading-relaxed">Rezultatele vorbesc de la sine. Fiecare subsol reabilitat înseamnă facturi mai mici, fără igrasie și siguranță pentru locuitori.</p>
            </div>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {projects.map(p => {
                const base = import.meta.env.BASE_URL.replace(/\/$/, '');
                const beforeSrc = p.beforeImageObjectPath ? `${base}/api/storage${p.beforeImageObjectPath}` : null;
                const afterSrc  = p.afterImageObjectPath  ? `${base}/api/storage${p.afterImageObjectPath}`  : null;
                const imgSrc    = p.imageObjectPath        ? `${base}/api/storage${p.imageObjectPath}`        : null;
                const hasSplit  = !!(beforeSrc && afterSrc);
                const statusBadge = p.status === 'completed'
                  ? <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-400 bg-green-500/10 px-4 py-1.5 rounded-lg border border-green-500/20"><CheckCircle2 size={14} /> Finalizat</span>
                  : <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ea580c] bg-[#ea580c]/10 px-4 py-1.5 rounded-lg border border-[#ea580c]/20"><Clock size={14} /> În curs</span>;
                return (
                  <div key={p.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-shadow">
                    {hasSplit ? (
                      /* Split Înainte / După */
                      <div className="grid grid-cols-2">
                        <div className="relative overflow-hidden">
                          <img src={beforeSrc!} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" alt="Înainte" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/20">Înainte</div>
                        </div>
                        <div className="relative overflow-hidden">
                          <img src={afterSrc!} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" alt="După" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 left-4 bg-[#ea580c]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/20">După</div>
                        </div>
                      </div>
                    ) : imgSrc ? (
                      /* Fotografie unică */
                      <div className="relative overflow-hidden h-52">
                        <img src={imgSrc} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={p.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    ) : (
                      /* Fără fotografie */
                      <div className="h-32 bg-[#0a1128] flex items-center justify-center">
                        <Building2 size={40} className="text-white/20" />
                      </div>
                    )}
                    <div className="p-6 bg-[#0a1128]">
                      <div className="mb-3">{statusBadge}</div>
                      <h3 className="font-serif font-bold text-white text-xl mb-1 leading-tight">{p.title}</h3>
                      {p.description && <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{p.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2">
                <div className="relative group overflow-hidden">
                  <img src="/ref-assets/before-DmrOVzle.png" className="w-full h-80 md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105" alt="Înainte" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-white/20 shadow-lg">Înainte</div>
                </div>
                <div className="relative group overflow-hidden">
                  <img src="/ref-assets/after-C5YhGlz_.png" className="w-full h-80 md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105" alt="După intervenție" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-[#ea580c]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-white/20 shadow-lg">După intervenție</div>
                </div>
              </div>
              <div className="p-8 md:p-10 bg-[#0a1128] text-white">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-green-400 mb-4 bg-green-500/10 px-4 py-1.5 rounded-lg border border-green-500/20">
                  <CheckCircle2 size={16} /> Finalizat
                </div>
                <h3 className="text-2xl font-serif font-bold text-white leading-tight">Sponsorizare țevi și fitinguri pentru rețeaua principală a blocului tău.</h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ASOCIAȚII ÎNSCRISE */}
      <section id="asociatii-inscrisi" className="py-24 md:py-32" style={{ backgroundColor: '#f7f4f0' }}>
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a1128]/40 mb-4">Tabelul Progresului</p>
            <h2 className="text-4xl md:text-5xl font-serif text-[#0a1128] font-bold mb-6">Asociații Înscrise</h2>
            <p className="text-base text-[#0a1128]/60 leading-relaxed">
              Pentru a beneficia de sponsorizarea materialelor, asociațiile trebuie să strângă
              un număr minim de formulare ANAF 230 și fondurile necesare pentru manoperă.
              Urmărește-le progresul!
            </p>
          </div>

          {acceptedRequests.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {acceptedRequests.map(req => {
                const r = req as any;
                const formsPct = r.formsTarget > 0 ? Math.min(100, Math.round((r.formsCollected / r.formsTarget) * 100)) : 0;
                const fundsPct = r.fundsTarget > 0 ? Math.min(100, Math.round((r.fundsCollected / r.fundsTarget) * 100)) : 0;

                const statusLabel: Record<string, string> = { nou: 'Nou', acceptat: 'Acceptat', respins: 'Respins' };
                const statusStyle: Record<string, string> = {
                  nou: 'bg-gray-100 text-gray-500',
                  acceptat: 'bg-green-100 text-green-700',
                  respins: 'bg-red-100 text-red-600',
                };

                return (
                  <div key={req.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* Left — identity */}
                    <div className="md:w-2/5 flex gap-4 items-start">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity size={20} className="text-[#0a1128]/40" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0a1128] text-lg leading-tight mb-1">{req.building}</h3>
                        <p className="text-sm text-[#0a1128]/50 flex items-center gap-1 mb-3">
                          <MapPin size={12} className="flex-shrink-0" />
                          {req.address}
                        </p>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[req.status] ?? statusStyle.nou}`}>
                          {statusLabel[req.status] ?? req.status}
                        </span>
                      </div>
                    </div>

                    {/* Right — progress */}
                    <div className="md:w-3/5 flex flex-col gap-5 justify-center">
                      {/* Formulare 230 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#0a1128]">Formulare 230</span>
                          <span className="text-sm font-bold text-[#0a1128]">
                            {r.formsCollected} / {r.formsTarget}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${formsPct}%`, backgroundColor: '#0a1128' }}
                          />
                        </div>
                      </div>

                      {/* Fonduri manoperă */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#0a1128]">Fonduri Manoperă</span>
                          {r.fundsTarget > 0 ? (
                            <span className="text-sm font-bold text-[#0a1128]">
                              {r.fundsCollected.toLocaleString('ro-RO')} / {r.fundsTarget.toLocaleString('ro-RO')} lei
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">sumă neconfirmată</span>
                          )}
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${r.fundsTarget > 0 ? fundsPct : 0}%`, backgroundColor: '#ea580c' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Building2 size={24} className="text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-[#0a1128] mb-2">Nicio asociație acceptată încă</h4>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Fii prima asociație din Ploiești care beneficiază de programul nostru.</p>
              <button onClick={() => setFormOpen(true)} className="bg-[#2563eb] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                Aplică Acum
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DONATORI */}
      <section id="donatori" className="bg-[#f8fafc] py-24 md:py-32 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-serif text-[#0a1128] font-bold mb-6">O inițiativă civică dedicată reabilitării subsolurilor de bloc din Ploiești. Sponsorizăm cu materiale. Reclădim încrederea în asociațiile de proprietari.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-50 text-[#2563eb] rounded-xl flex items-center justify-center mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="text-2xl font-bold text-[#0a1128] mb-4">Pentru Companii</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Companiile din Prahova pot direcționa impozitul pe profit sau dona materiale. Investiți direct în sănătatea comunității locale.</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <Check className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <strong className="block text-[#0a1128] text-sm">Ce înseamnă sponsorizare în materiale?</strong>
                      <span className="text-gray-600 text-sm">Viziune Urbană achiziționează direct... și le donează asociației...</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Check className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-600 text-sm font-medium">Menționare ca partener oficial</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDonationOpen(true)} className="w-full bg-[#0a1128] text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center">
                Susține Inițiativa
              </button>
            </div>

            <div className="bg-[#ea580c] p-8 md:p-10 rounded-2xl shadow-lg border border-[#ea580c] text-white flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <FileText size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Pentru Persoane Fizice</h3>
                <p className="text-white/90 mb-6 leading-relaxed">Puteți redirecționa 3,5% către Viziune Urbană complet gratuit, fără niciun cost personal, completând formularul ANAF 230.</p>
                
                <div className="bg-black/10 p-4 rounded-xl border border-white/20 mb-8">
                  <p className="text-sm font-medium text-white/90 italic">
                    "Aceasta este sursa principală de finanțare a asociației..."
                  </p>
                </div>
              </div>
              <div>
                <a
                  href="https://www.anaf.ro/declaratii/d230/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#ea580c] px-6 py-3.5 rounded-lg font-bold hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2 mb-3"
                >
                  <Download size={18} /> Descarcă Formular 230
                </a>
                <div className="text-center text-white/70 text-xs font-medium">Se completează anual / Află mai multe</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTENER TEHNIC */}
      <section id="partener" className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-serif text-[#0a1128] font-bold mb-6">Partener Tehnic</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Noi aducem materialele, ei aduc măiestria. Un subsol reabilitat trebuie să reziste zeci de ani, de aceea colaborăm exclusiv cu o echipă tehnică de elită din Ploiești.
              </p>
              
              <div className="bg-[#f8fafc] border border-gray-200 p-6 md:p-8 rounded-2xl mb-8">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Partener tehnic execuție:</div>
                <div className="text-2xl font-bold text-[#0a1128]">INSTAL SERV BECHEANU</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-medium text-lg pt-0.5">Experiență de peste 15 ani în instalații pentru blocuri.</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-medium text-lg pt-0.5">Echipă autorizată și certificată tehnic.</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-medium text-lg pt-0.5">Garanție 5 ani pentru execuție + verificări trimestriale gratuite pe toată durata garanției.</span>
                </li>
              </ul>
              
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl font-bold">
                <ShieldCheck size={20} /> Garanție 5 Ani + Verificări Trimestriale Gratuite
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <img src="/ref-assets/partner-DSNZzctO.png" className="rounded-3xl shadow-2xl w-full object-cover aspect-square md:aspect-[4/3]" alt="Partener tehnic instalator" />
            </div>
          </div>
        </div>
      </section>

      {/* PARTENERI INSTITUȚIONALI */}
      <section id="parteneri-institutionali" className="bg-[#f8fafc] py-20 md:py-28 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563eb] px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Star size={14} /> Parteneri Instituționali
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#0a1128] font-bold mb-4">
              Alături de noi în educație și dezvoltare
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Colaborăm cu instituții de referință din Ploiești pentru formare practică și susținerea proiectului nostru civic.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Liceu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-start">
              <div className="w-14 h-14 bg-orange-50 text-[#ea580c] rounded-xl flex items-center justify-center mb-5">
                <GraduationCap size={28} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-2">Partener de Practică</div>
              <h3 className="text-lg font-bold text-[#0a1128] mb-3 leading-snug">
                Liceul Tehnologic<br />Toma Socolescu
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Elevi din profilul tehnic efectuează stagii de practică pe șantierele Viziune Urbană, dobândind experiență reală în instalații.
              </p>
            </div>

            {/* ACCR */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-start">
              <div className="w-14 h-14 bg-orange-50 text-[#ea580c] rounded-xl flex items-center justify-center mb-5">
                <GraduationCap size={28} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-2">Partener de Practică</div>
              <h3 className="text-lg font-bold text-[#0a1128] mb-3 leading-snug">
                ACCR Ploiești
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Cursanții programelor de calificare profesională ACCR participă activ la proiectele de reabilitare, consolidând competențele tehnice.
              </p>
            </div>

            {/* UPG */}
            <div className="bg-[#0a1128] rounded-2xl border border-[#0a1128] shadow-sm p-8 flex flex-col items-start">
              <div className="w-14 h-14 bg-white/10 text-white rounded-xl flex items-center justify-center mb-5">
                <Building2 size={28} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-2">Susținător Proiect</div>
              <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                Universitatea Petrol-Gaze<br />din Ploiești
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                UPG Ploiești susține inițiativa civică Viziune Urbană, sprijinind conectarea mediului academic cu nevoile reale ale comunității ploieștene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAIET DE SARCINI */}
      <section id="caiet-sarcini" className="bg-[#0a1128] text-white py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6">Specificații de Execuție</h2>
            <p className="text-lg text-white/70 leading-relaxed font-light">
              Orice companie care dorește să participe... trebuie să urmeze o serie strictă de pași tehnici.
            </p>
          </div>

          {(() => {
            const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
            const FALLBACK_SPEC_ITEMS = [
              { id: -1, orderNum: 1, title: 'Refacere trasee noi de instalații', description: 'Apă caldă, apă rece, agent termic și canalizare. Montaj cu sisteme de prindere de tavan prin tije filetate, profil tip C și brățări metalice.', imageObjectPath: null, _fallbackImg: '/ref-assets/pipes-DC20llBH.png' },
              { id: -2, orderNum: 2, title: 'Înlocuire coloane apă rece', description: 'Înlocuire integrală a coloanelor de scurgere din fontă veche cu sisteme PVC fonoabsorbante.', imageObjectPath: null, _fallbackImg: '/ref-assets/pipes-DC20llBH.png' },
              { id: -3, orderNum: 3, title: 'Reabilitare rețea termică', description: 'Izolație termică profesională și țevi de oțel pentru reducerea pierderilor de căldură.', imageObjectPath: null, _fallbackImg: '/ref-assets/thermal-Cgh8QBxc.png' },
              { id: -4, orderNum: 4, title: 'Evacuare resturi din subsol', description: 'Curățarea și evacuarea completă a resturilor și deșeurilor existente în subsol înainte de orice altă intervenție.', imageObjectPath: null, _fallbackImg: '/ref-assets/sanitation-DG9U3mKz.png' },
              { id: -5, orderNum: 5, title: 'Spălat pereți cu pompă de presiune', description: 'Tratament hidro cu pompă de înaltă presiune pentru eliminarea prafului, mucegaiului...', imageObjectPath: null, _fallbackImg: '/ref-assets/sanitation-DG9U3mKz.png' },
              { id: -6, orderNum: 6, title: 'Vopsit pereți cu pompă airless', description: 'Aplicarea zugrăvelii... pentru o acoperire uniformă, rapidă și durabilă.', imageObjectPath: null, _fallbackImg: null },
              { id: -7, orderNum: 7, title: 'Izolarea țevilor cu Armaflex', description: 'Toate traseele de apă caldă și agent termic vor fi izolate profesional cu Armaflex...', imageObjectPath: null, _fallbackImg: null },
              { id: -8, orderNum: 8, title: 'Instalație Electrică', description: 'Înlocuirea și modernizarea completă a instalației electrice de iluminat din subsol...', imageObjectPath: null, _fallbackImg: null },
            ] as Array<{ id: number; orderNum: number; title: string; description: string; imageObjectPath: string | null; _fallbackImg?: string | null }>;

            type DisplayItem = { id: number; orderNum: number; title: string; description: string; imageObjectPath?: string | null; _fallbackImg?: string | null };
            const displayItems: DisplayItem[] = specItemsData && specItemsData.length > 0
              ? specItemsData.map((i): DisplayItem => ({ ...i, _fallbackImg: null }))
              : FALLBACK_SPEC_ITEMS;

            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {displayItems.map((item: DisplayItem, idx: number) => {
                  const imgSrc = item.imageObjectPath
                    ? `${BASE_URL}/api/storage${item.imageObjectPath}`
                    : (item._fallbackImg ?? null);
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <div key={item.id} className="bg-[#1e293b] rounded-2xl overflow-hidden border border-white/10 group hover:border-[#ea580c]/50 transition-colors">
                      {imgSrc ? (
                        <img src={imgSrc} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.title} />
                      ) : null}
                      <div className="p-6">
                        <div className="text-[#ea580c] font-bold text-sm mb-2">{num}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex items-start gap-4 mb-12">
              <AlertCircle size={24} className="text-[#ea580c] shrink-0" />
              <p className="text-white/80 font-medium">
                Toate lucrările se execută conform caietului de sarcini pus la dispoziție de Asociația Viziune Urbană. Devierile de la specificații atrag descalificarea executantului.
              </p>
            </div>
            
            <div className="text-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-10 md:p-16 border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-serif font-bold text-white mb-4">Instalații noi, izolate profesional. <br className="hidden md:block" />Zero pierderi, zero griji.</h3>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">Scăpați de inundații și facturi mari. Contactați-ne pentru o evaluare tehnică gratuită a subsolului.</p>
              <button onClick={() => setFormOpen(true)} className="bg-[#ea580c] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#c2410c] transition-colors shadow-lg shadow-orange-900/50 inline-flex items-center gap-2">
                Contactează-ne <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-[#ea580c] font-bold uppercase tracking-[0.2em] text-xs">Clarificări</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#0a1128] font-bold mt-4">Întrebări Frecvente</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-[#0a1128] pr-4">{faq.q}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-[#0a1128] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-6 pt-0 text-gray-600 border-t border-gray-100 mt-2">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a1128] text-white pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#2563eb] rounded-[10px] flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg leading-tight">Viziune Urbană</div>
                  <div className="text-[9px] font-bold text-white/80 uppercase tracking-[0.2em] mt-0.5">Ploiești</div>
                </div>
              </div>
              <p className="text-white/60 max-w-sm mb-6 leading-relaxed">
                O inițiativă civică dedicată reabilitării subsolurilor de bloc din Ploiești.
              </p>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Ploiești, jud. Prahova, România</p>
                <p>Sună la 0244 456 789</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Organizație</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Asociația Viziune Urbană Ploiești. ONG înregistrat.</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Politica de confidențialitate</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Termeni și condiții</a></li>
                <li><a href="#donatori" className="text-[#ea580c] font-semibold hover:text-[#c2410c] transition-colors text-sm">Contactează-ne</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Partenerii Noștri</h4>
              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="font-bold text-white text-sm mb-0.5">INSTAL SERV BECHEANU</div>
                  <div className="text-white/50 text-xs">Partener tehnic execuție</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="font-bold text-white text-sm mb-0.5">Liceul Tehnologic Toma Socolescu</div>
                  <div className="text-[#ea580c] text-xs font-semibold">Partener de practică</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="font-bold text-white text-sm mb-0.5">ACCR Ploiești</div>
                  <div className="text-[#ea580c] text-xs font-semibold">Partener de practică</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="font-bold text-white text-sm mb-0.5">UPG Ploiești</div>
                  <div className="text-[#ea580c] text-xs font-semibold">Susținător proiect</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs">
            <div>&copy; {new Date().getFullYear()} Asociația Viziune Urbană Ploiești. Toate drepturile rezervate.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={Page} />
          <Route path="/viziune-urbana" component={Page} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/viziune-urbana/admin" component={AdminPage} />
          <Route component={() => (
            <div className="min-h-screen bg-[#0a1128] text-white flex items-center justify-center flex-col p-4">
              <AlertCircle size={64} className="text-[#ea580c] mb-6" />
              <h1 className="text-4xl font-serif font-bold mb-4 text-center">Pagina nu a fost găsită</h1>
              <a href="/" className="bg-[#2563eb] text-white px-6 py-3 rounded-lg font-semibold mt-4">Înapoi la pagina principală</a>
            </div>
          )} />
        </Switch>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;