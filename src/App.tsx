import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Target, 
  Users, 
  MapPin, 
  Settings, 
  Camera, 
  Flame, 
  Trophy, 
  CheckSquare, 
  Square, 
  Utensils, 
  Dumbbell, 
  Brain,
  ChevronRight,
  LogOut,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Info,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  User as UserIcon,
  Activity,
  DollarSign,
  BarChart3,
  Lock,
  Eye,
  ThumbsUp,
  Upload,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, startOfToday, isSameDay, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  OperationType,
  handleFirestoreError,
  getDocs,
  deleteDoc
} from './firebase';

import { 
  UserProfile, 
  Mission, 
  Plan, 
  Post, 
  Event, 
  Rank, 
  PhysicalLevel, 
  Goal, 
  Competition, 
  Evidence, 
  Contribution,
  CompetitionStatus,
  CompetitionType
} from './types';
import { generateDailyPlan } from './services/planService';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      let errorMessage = "Fallo en el sistema.";
      try {
        const parsed = JSON.parse((this.state as any).error.message);
        errorMessage = `Error de Cuartel: ${parsed.error} en ${parsed.operationType}`;
      } catch (e) {
        errorMessage = (this.state as any).error?.message || errorMessage;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6 font-mono">
          <div className="bg-army-green-dark p-8 border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] max-w-md w-full text-center space-y-4">
            <AlertTriangle className="mx-auto text-red-600" size={48} />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">FALLO CRÍTICO DE SISTEMA</h2>
            <p className="text-zinc-400 text-sm">{errorMessage}</p>
            <button onClick={() => window.location.reload()} className="btn-army w-full bg-red-600 hover:bg-red-700">REINICIAR NÚCLEO</button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Components ---

const RANKS: Rank[] = ['Recruit', 'Soldier', 'Warrior', 'Elite', 'Commander'];
const RANK_LABELS: Record<Rank, string> = {
  Recruit: 'RECLUTA',
  Soldier: 'SOLDADO',
  Warrior: 'GUERRERO',
  Elite: 'ÉLITE',
  Commander: 'COMANDANTE'
};

const Layout = ({ children, activeTab, setActiveTab, userProfile }: any) => {
  const tabs = [
    { id: 'dashboard', icon: Target, label: 'MISIONES' },
    { id: 'competitions', icon: Trophy, label: 'COMPETENCIAS' },
    { id: 'ranking', icon: BarChart3, label: 'RANKING' },
    { id: 'community', icon: Users, label: 'CUARTEL' },
    { id: 'events', icon: MapPin, label: 'EVENTOS' },
    { id: 'growth', icon: Brain, label: 'CRECIMIENTO' },
    { id: 'profile', icon: UserIcon, label: 'PERFIL' },
  ];

  if (userProfile?.role === 'admin') {
    tabs.splice(tabs.length - 1, 0, { id: 'admin', icon: Lock, label: 'ADMIN' });
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-army-green-dark border-r border-army-green-light/20 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-army-green-light p-2">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="font-black text-xl tracking-tighter leading-none">
            PROYECTO 90<br/><span className="text-army-green-light">EL CUARTEL</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 font-bold text-sm tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-army-green-light text-white' : 'text-zinc-500 hover:text-white hover:bg-army-green-light/10'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {userProfile && (
          <div className="mt-auto pt-6 border-t border-army-green-light/20">
            <div className="flex items-center gap-3 mb-4">
              <img src={userProfile.photoURL} className="w-10 h-10 border border-army-green-light" alt="" />
              <div className="min-w-0">
                <p className="text-xs font-black truncate uppercase">{userProfile.displayName}</p>
                <p className="text-[10px] font-mono text-army-green-light font-bold">{RANK_LABELS[userProfile.rank]}</p>
              </div>
            </div>
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors">
              <LogOut size={14} /> DESCONECTAR
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-6 lg:p-12">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-army-green-dark border-t border-army-green-light/20 flex justify-around p-2 z-50 backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === tab.id ? 'text-army-green-light' : 'text-zinc-500'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Onboarding = ({ user, onComplete }: any) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: 25,
    weight: 70,
    height: 175,
    sex: 'M',
    physicalLevel: 'Beginner',
    goal: 'Performance',
    measurements: { chest: 0, waist: 0, legs: 0, arms: 0 },
    habits: { nutrition: 'Regular', exercise: 'None', sleep: '6-7h' }
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Recluta',
      photoURL: user.photoURL || '',
      role: 'recruit',
      rank: 'Recruit',
      streak: 0,
      lastMissionDate: '',
      totalPoints: 0,
      isProfileComplete: true,
      createdAt: Timestamp.now(),
      ...formData as any
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete(profile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <div className="bg-army-green-light w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">REGISTRO DE RECLUTA</h2>
        <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">PASO {step} DE 3: DATOS BIOMÉTRICOS</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">EDAD</label>
                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="input-army w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEXO</label>
                <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="input-army w-full">
                  <option value="M">MASCULINO</option>
                  <option value="F">FEMENINO</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PESO (KG)</label>
                <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="input-army w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ESTATURA (CM)</label>
                <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="input-army w-full" />
              </div>
            </div>
            <button onClick={nextStep} className="btn-army w-full flex items-center justify-center gap-2">SIGUIENTE <ArrowRight size={18} /></button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">NIVEL FÍSICO</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button key={lvl} onClick={() => setFormData({...formData, physicalLevel: lvl as any})} className={`p-3 text-[10px] font-black border transition-all ${formData.physicalLevel === lvl ? 'bg-army-green-light border-white' : 'bg-zinc-900 border-army-green-light/30 text-zinc-500'}`}>
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">OBJETIVO PRINCIPAL</label>
              <div className="grid grid-cols-3 gap-2">
                {['Mass', 'Fat Loss', 'Performance'].map(g => (
                  <button key={g} onClick={() => setFormData({...formData, goal: g as any})} className={`p-3 text-[10px] font-black border transition-all ${formData.goal === g ? 'bg-army-green-light border-white' : 'bg-zinc-900 border-army-green-light/30 text-zinc-500'}`}>
                    {g === 'Mass' ? 'MASA' : g === 'Fat Loss' ? 'PÉRDIDA' : 'RENDIMIENTO'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-army flex-1 bg-zinc-900 border border-army-green-light/30">ATRÁS</button>
              <button onClick={nextStep} className="btn-army flex-1">SIGUIENTE</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PECHO (CM)</label>
                <input type="number" value={formData.measurements?.chest} onChange={e => setFormData({...formData, measurements: {...formData.measurements!, chest: Number(e.target.value)}})} className="input-army w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CINTURA (CM)</label>
                <input type="number" value={formData.measurements?.waist} onChange={e => setFormData({...formData, measurements: {...formData.measurements!, waist: Number(e.target.value)}})} className="input-army w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PIERNAS (CM)</label>
                <input type="number" value={formData.measurements?.legs} onChange={e => setFormData({...formData, measurements: {...formData.measurements!, legs: Number(e.target.value)}})} className="input-army w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">BRAZOS (CM)</label>
                <input type="number" value={formData.measurements?.arms} onChange={e => setFormData({...formData, measurements: {...formData.measurements!, arms: Number(e.target.value)}})} className="input-army w-full" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-army flex-1 bg-zinc-900 border border-army-green-light/30">ATRÁS</button>
              <button onClick={handleSubmit} className="btn-army flex-1 bg-white text-black">FINALIZAR</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MOTIVATION_QUOTES = [
  "La disciplina es el puente entre las metas y los logros.",
  "No te detengas cuando estés cansado, detente cuando hayas terminado.",
  "Tu mente es tu arma más poderosa. Mantenla afilada.",
  "El dolor es temporal, el orgullo de la victoria es para siempre.",
  "En el Cuartel no hay excusas, solo resultados.",
  "La consistencia es lo que transforma lo ordinario en extraordinario.",
  "Eres el arquitecto de tu propio destino biológico."
];

const RANK_THRESHOLDS = {
  Recruit: 0,
  Soldier: 1000,
  Warrior: 3000,
  Elite: 7000,
  Commander: 15000
};

const Toast = ({ message, type, onClose }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 border-2 font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 ${
      type === 'success' ? 'bg-army-green-dark border-army-green-light text-white' : 'bg-red-900 border-red-500 text-white'
    }`}
  >
    {type === 'success' ? <CheckSquare size={18} /> : <AlertTriangle size={18} />}
    {message}
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={14} /></button>
  </motion.div>
);

const Competitions = ({ userProfile }: any) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showContribute, setShowContribute] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'competitions'), orderBy('startDate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCompetitions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Competition)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!selectedComp) return;
    const qE = query(collection(db, 'evidence'), where('competitionId', '==', selectedComp.id));
    const unsubE = onSnapshot(qE, (snap) => {
      setEvidence(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evidence)));
    });
    const qC = query(collection(db, 'contributions'), where('competitionId', '==', selectedComp.id));
    const unsubC = onSnapshot(qC, (snap) => {
      setContributions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contribution)));
    });
    return () => { unsubE(); unsubC(); };
  }, [selectedComp]);

  const handleJoin = async (comp: Competition) => {
    if (comp.participants.includes(userProfile.uid)) return;
    try {
      await updateDoc(doc(db, 'competitions', comp.id), {
        participants: [...comp.participants, userProfile.uid]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `competitions/${comp.id}`);
    }
  };

  const handleContribute = async (amount: number) => {
    if (!selectedComp) return;
    try {
      await addDoc(collection(db, 'contributions'), {
        competitionId: selectedComp.id,
        userId: userProfile.uid,
        userName: userProfile.displayName,
        amount,
        type: 'User',
        timestamp: Timestamp.now()
      });
      await updateDoc(doc(db, 'competitions', selectedComp.id), {
        prizePool: selectedComp.prizePool + amount
      });
      setShowContribute(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contributions');
    }
  };

  const handleUploadEvidence = async (url: string) => {
    if (!selectedComp) return;
    try {
      await addDoc(collection(db, 'evidence'), {
        competitionId: selectedComp.id,
        userId: userProfile.uid,
        userName: userProfile.displayName,
        type: 'photo',
        url,
        timestamp: Timestamp.now(),
        votes: [],
        isValidated: false
      });
      setShowUpload(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'evidence');
    }
  };

  const handleVote = async (ev: Evidence) => {
    if (ev.votes.includes(userProfile.uid)) return;
    try {
      await updateDoc(doc(db, 'evidence', ev.id), {
        votes: [...ev.votes, userProfile.uid]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `evidence/${ev.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">SISTEMA DE RECOMPENSAS</p>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">COMPETENCIAS</h2>
        </div>
      </header>

      {!selectedComp ? (
        <div className="grid gap-6">
          {competitions.map(comp => (
            <div key={comp.id} className="army-card overflow-hidden flex flex-col md:flex-row group cursor-pointer" onClick={() => setSelectedComp(comp)}>
              <div className="md:w-1/4 bg-army-green-light/10 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-army-green-light/20 group-hover:bg-army-green-light/20 transition-all">
                <Trophy className="text-army-green-light mb-4" size={48} />
                <p className="text-xs font-black uppercase tracking-widest text-white">{comp.type}</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">{comp.status}</p>
              </div>
              <div className="flex-1 p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{comp.title}</h3>
                  <div className="bg-army-green-dark px-4 py-2 border border-army-green-light/30">
                    <p className="text-[8px] font-mono text-zinc-500 uppercase">BOLSA DE PREMIOS</p>
                    <p className="text-xl font-black text-army-green-light">${comp.prizePool}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{comp.description}</p>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase">
                    <span className="flex items-center gap-1"><Users size={14} /> {comp.participants.length} RECLUTAS</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {format(comp.endDate.toDate(), 'd MMM', { locale: es })}</span>
                  </div>
                  <button className="btn-army py-2 px-6 text-[10px]">VER DETALLES</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <button onClick={() => setSelectedComp(null)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
            <ArrowLeft size={16} /> VOLVER A COMPETENCIAS
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="army-card p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{selectedComp.title}</h3>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                    selectedComp.status === 'Active' ? 'bg-army-green-light border-white' : 'bg-zinc-900 border-army-green-light/30'
                  }`}>
                    {selectedComp.status}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">{selectedComp.description}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/50 p-4 border border-army-green-light/10">
                    <p className="text-[8px] font-mono text-zinc-500 uppercase mb-1">PARTICIPANTES</p>
                    <p className="text-xl font-black">{selectedComp.participants.length}</p>
                  </div>
                  <div className="bg-black/50 p-4 border border-army-green-light/10">
                    <p className="text-[8px] font-mono text-zinc-500 uppercase mb-1">BOLSA ACTUAL</p>
                    <p className="text-xl font-black text-army-green-light">${selectedComp.prizePool}</p>
                  </div>
                  <div className="bg-black/50 p-4 border border-army-green-light/10">
                    <p className="text-[8px] font-mono text-zinc-500 uppercase mb-1">FINALIZA EN</p>
                    <p className="text-xl font-black">{format(selectedComp.endDate.toDate(), 'd MMM', { locale: es })}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {!selectedComp.participants.includes(userProfile.uid) ? (
                    <button onClick={() => handleJoin(selectedComp)} className="btn-army flex-1">UNIRSE A LA COMPETENCIA</button>
                  ) : (
                    <button onClick={() => setShowUpload(true)} className="btn-army flex-1 bg-white text-black">SUBIR EVIDENCIA</button>
                  )}
                  <button onClick={() => setShowContribute(true)} className="btn-army flex-1 bg-zinc-900 border border-army-green-light/30">APORTAR AL PREMIO</button>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <Eye className="text-army-green-light" size={18} /> EVIDENCIA DE RECLUTAS
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {evidence.map(ev => (
                    <div key={ev.id} className="army-card overflow-hidden">
                      <img src={ev.url} className="w-full aspect-video object-cover" alt="" />
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase tracking-widest">{ev.userName}</p>
                          <p className="text-[8px] font-mono text-zinc-500">{format(ev.timestamp.toDate(), 'd MMM HH:mm', { locale: es })}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-army-green-light/10">
                          <button 
                            onClick={() => handleVote(ev)}
                            className={`flex items-center gap-2 text-[10px] font-black transition-colors ${
                              ev.votes.includes(userProfile.uid) ? 'text-army-green-light' : 'text-zinc-500 hover:text-white'
                            }`}
                          >
                            <ThumbsUp size={14} /> {ev.votes.length} VALIDACIONES
                          </button>
                          {ev.isValidated && <span className="text-[8px] font-black text-army-green-light uppercase">VERIFICADO</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="army-card p-6">
                <h4 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-army-green-light/10 pb-2">REGLAS DE OPERACIÓN</h4>
                <ul className="space-y-4">
                  {selectedComp.rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-[10px] font-mono text-zinc-400">
                      <span className="text-army-green-light font-black">{i + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="army-card p-6">
                <h4 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-army-green-light/10 pb-2">APORTES RECIENTES</h4>
                <div className="space-y-4">
                  {contributions.slice(0, 5).map(c => (
                    <div key={c.id} className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">{c.userName}</span>
                      <span className="text-army-green-light font-black">+${c.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showContribute && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="army-card max-w-md w-full p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">APORTAR AL PREMIO</h3>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">TU APORTE MEJORA LA RECOMPENSA DE LOS GANADORES.</p>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50, 100, 200, 500].map(amt => (
                  <button key={amt} onClick={() => handleContribute(amt)} className="btn-army py-3 text-xs">${amt}</button>
                ))}
              </div>
              <button onClick={() => setShowContribute(false)} className="w-full text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">CANCELAR</button>
            </motion.div>
          </div>
        )}

        {showUpload && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="army-card max-w-md w-full p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">SUBIR EVIDENCIA</h3>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">INGRESA LA URL DE TU FOTO O VIDEO DE PROGRESO.</p>
              <input type="text" placeholder="https://..." className="input-army w-full" id="evidence-url" />
              <button 
                onClick={() => {
                  const url = (document.getElementById('evidence-url') as HTMLInputElement).value;
                  if (url) handleUploadEvidence(url);
                }} 
                className="btn-army w-full"
              >
                ENVIAR EVIDENCIA
              </button>
              <button onClick={() => setShowUpload(false)} className="w-full text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">CANCELAR</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Ranking = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), where('isProfileComplete', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">JERARQUÍA DEL CUARTEL</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">RANKING GLOBAL</h2>
      </header>

      <div className="army-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-army-green-light/10 border-b border-army-green-light/20">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">POS</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">RECLUTA</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">RANGO</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">PUNTOS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.uid} className={`border-b border-army-green-light/5 hover:bg-white/5 transition-colors ${i < 3 ? 'bg-army-green-light/5' : ''}`}>
                <td className="p-6">
                  <span className={`font-black text-xl ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-500' : 'text-zinc-600'}`}>
                    #{i + 1}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={u.photoURL} className="w-10 h-10 border border-army-green-light" alt="" />
                    <span className="font-black uppercase tracking-tighter text-sm italic">{u.displayName}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-[10px] font-mono font-bold text-army-green-light uppercase">{RANK_LABELS[u.rank]}</span>
                </td>
                <td className="p-6 text-right">
                  <span className="font-black text-lg">{u.totalPoints.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateComp, setShowCreateComp] = useState(false);
  const [newComp, setNewComp] = useState<Partial<Competition>>({
    title: '',
    description: '',
    type: 'Transformation',
    status: 'Upcoming',
    prizePool: 0,
    rules: ['Cumplir todas las misiones', 'Subir evidencia diaria', 'No hacer trampa'],
    participants: []
  });

  useEffect(() => {
    const unsubU = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => doc.data() as UserProfile));
    });
    const unsubC = onSnapshot(collection(db, 'competitions'), (snap) => {
      setCompetitions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Competition)));
    });
    return () => { unsubU(); unsubC(); };
  }, []);

  const handleCreateCompetition = async () => {
    try {
      await addDoc(collection(db, 'competitions'), {
        ...newComp,
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(addDays(new Date(), 7))
      });
      setShowCreateComp(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'competitions');
    }
  };

  const stats = [
    { label: 'RECLUTAS TOTALES', value: users.length, icon: Users },
    { label: 'COMPETENCIAS', value: competitions.length, icon: Trophy },
    { label: 'BOLSA TOTAL', value: `$${competitions.reduce((acc, c) => acc + c.prizePool, 0)}`, icon: DollarSign },
    { label: 'PUNTOS EMITIDOS', value: users.reduce((acc, u) => acc + u.totalPoints, 0).toLocaleString(), icon: Activity },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">CENTRO DE MANDO</p>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">DASHBOARD ADMIN</h2>
        </div>
        <button onClick={() => setShowCreateComp(true)} className="btn-army flex items-center gap-2">
          <Plus size={18} /> CREAR COMPETENCIA
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="army-card p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <stat.icon size={16} className="text-army-green-light" />
            </div>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="army-card p-8">
          <h3 className="font-black uppercase tracking-widest text-sm mb-8">GESTIÓN DE COMPETENCIAS</h3>
          <div className="space-y-4">
            {competitions.map(comp => (
              <div key={comp.id} className="bg-black/50 p-4 border border-army-green-light/10 flex justify-between items-center">
                <div>
                  <p className="font-black uppercase italic text-sm">{comp.title}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">{comp.status} - {comp.participants.length} RECLUTAS</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Settings size={16} /></button>
                  <button onClick={() => deleteDoc(doc(db, 'competitions', comp.id))} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="army-card p-8">
          <h3 className="font-black uppercase tracking-widest text-sm mb-8">RECLUTAS RECIENTES</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map(u => (
              <div key={u.uid} className="flex items-center gap-4 bg-black/50 p-4 border border-army-green-light/10">
                <img src={u.photoURL} className="w-8 h-8 border border-army-green-light" alt="" />
                <div className="flex-1">
                  <p className="font-black uppercase italic text-xs">{u.displayName}</p>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs">{u.totalPoints} PTS</p>
                  <p className="text-[8px] font-mono text-army-green-light uppercase">{RANK_LABELS[u.rank]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateComp && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="army-card max-w-lg w-full p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">NUEVA COMPETENCIA</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-500 uppercase">TÍTULO</label>
                  <input type="text" value={newComp.title} onChange={e => setNewComp({...newComp, title: e.target.value})} className="input-army w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-500 uppercase">DESCRIPCIÓN</label>
                  <textarea value={newComp.description} onChange={e => setNewComp({...newComp, description: e.target.value})} className="input-army w-full h-24 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase">TIPO</label>
                    <select value={newComp.type} onChange={e => setNewComp({...newComp, type: e.target.value as any})} className="input-army w-full">
                      <option value="Transformation">TRANSFORMACIÓN</option>
                      <option value="Habits">HÁBITOS</option>
                      <option value="Performance">RENDIMIENTO</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase">BOLSA INICIAL ($)</label>
                    <input type="number" value={newComp.prizePool} onChange={e => setNewComp({...newComp, prizePool: Number(e.target.value)})} className="input-army w-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowCreateComp(false)} className="btn-army flex-1 bg-zinc-900 border border-army-green-light/30">CANCELAR</button>
                <button onClick={handleCreateCompetition} className="btn-army flex-1">CREAR OPERACIÓN</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ onLogin }: any) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-army-green-light/30 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058917233-358384459632?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-army-green-light/20 border border-army-green-light/50 inline-flex items-center gap-3 px-6 py-2 rounded-none mb-10 backdrop-blur-sm">
              <Zap size={16} className="text-army-green-light animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.4em]">SISTEMA DE ÉLITE ACTIVADO</span>
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.85] mb-8 drop-shadow-2xl">
              NO ES MOTIVACIÓN.<br/>
              <span className="text-army-green-light flicker">ES DISCIPLINA.</span>
            </h1>
            <p className="text-zinc-400 font-mono text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed uppercase tracking-widest border-l-4 border-army-green-light pl-6 py-2">
              Transforma tu cuerpo y tu mente en 90 días con el sistema que te obliga a cumplir.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-6 justify-center pt-8"
          >
            <button 
              onClick={onLogin}
              className="btn-army py-6 px-16 text-xl flex items-center justify-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <Shield size={28} className="group-hover:rotate-12 transition-transform" />
              UNIRME AL CUARTEL
            </button>
            <button className="btn-army py-6 px-16 text-xl bg-transparent border-2 border-white/20 hover:border-white hover:bg-white hover:text-black">
              VER RANKING PÚBLICO
            </button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
          <ChevronDown size={40} />
        </motion.div>
      </section>

      {/* 2. PROBLEMA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-army-green-light/5 blur-[120px] rounded-full" />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeInUp}>
            <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">EL CICLO DEL FRACASO</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-10">
              ¿POR QUÉ SIGUES<br/><span className="text-zinc-700">EN EL MISMO LUGAR?</span>
            </h2>
            <div className="space-y-8 text-zinc-400 font-mono text-lg uppercase tracking-widest leading-relaxed">
              <p className="border-l-2 border-zinc-800 pl-6">Empiezas con ganas, pero abandonas a la semana. La motivación es una mentira emocional que se desvanece al primer obstáculo.</p>
              <p className="border-l-2 border-zinc-800 pl-6">No ves resultados porque no tienes un sistema. Tienes excusas. Te sientes estancado porque tu mente es más débil que tus deseos.</p>
              <p className="text-white font-black">LA DISCIPLINA ES LA ÚNICA VERDAD QUE TE HARÁ LIBRE.</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-army-green-light/20 blur-3xl rounded-full animate-pulse" />
            <img 
              src="https://images.unsplash.com/photo-1549476464-37392f717551?q=80&w=1974&auto=format&fit=crop" 
              className="relative z-10 w-full grayscale hover:grayscale-0 transition-all duration-700 border-2 border-zinc-800"
              alt="Intense training"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-army-green-light p-8 font-black text-4xl italic z-20 shadow-2xl">
              90 DÍAS
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. SOLUCIÓN */}
      <section className="py-32 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto text-center mb-24">
          <motion.div {...fadeInUp}>
            <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">LA SOLUCIÓN DEFINITIVA</p>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              EL SISTEMA QUE TE<br/><span className="text-army-green-light">OBLIGA A AVANZAR</span>
            </h2>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'MISIONES DIARIAS', 
              desc: 'No pienses. Solo ejecuta. Recibes órdenes directas de nutrición y entrenamiento cada mañana.', 
              icon: Target,
              img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
            },
            { 
              title: 'SEGUIMIENTO TÁCTICO', 
              desc: 'Cada gramo y cada repetición cuentan. El sistema analiza tu progreso y ajusta tu protocolo.', 
              icon: Activity,
              img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop'
            },
            { 
              title: 'COMUNIDAD DISCIPLINADA', 
              desc: 'Rodéate de guerreros, no de turistas. El Cuartel solo acepta a los que están dispuestos a sangrar.', 
              icon: Users,
              img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop'
            },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="army-card group overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt="" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all" />
                <div className="absolute top-4 left-4 bg-army-green-light p-2">
                  <item.icon size={20} className="text-white" />
                </div>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="text-2xl font-black uppercase italic">{item.title}</h3>
                <p className="text-zinc-500 font-mono text-xs leading-relaxed uppercase tracking-widest">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. EXPERIENCIA CUARTEL */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">PROTOCOLO DE OPERACIÓN</p>
              <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
                TU TRANSFORMACIÓN<br/>EN 4 PASOS
              </h2>
            </motion.div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-700 font-black text-9xl italic leading-none">01-04</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'ALISTAMIENTO', desc: 'Te registras y completas tu perfil biométrico. El sistema genera tu plan de ataque.' },
              { step: '02', title: 'RECIBES MISIONES', desc: 'Cada día a las 05:00 AM recibes tus órdenes de entrenamiento y nutrición.' },
              { step: '03', title: 'REPORTAS ÉXITO', desc: 'Subes evidencia de tus misiones. Si no reportas, no avanzas. Sin excusas.' },
              { step: '04', title: 'SUBES DE NIVEL', desc: 'Ganas puntos de honor, escalas en el ranking y desbloqueas nuevos rangos.' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="army-card p-8 border-zinc-800 hover:border-army-green-light transition-all group"
              >
                <span className="text-army-green-light font-black text-4xl italic mb-6 block group-hover:scale-110 transition-transform">{item.step}</span>
                <h3 className="text-xl font-black uppercase italic mb-4">{item.title}</h3>
                <p className="text-zinc-500 font-mono text-[10px] leading-relaxed uppercase tracking-widest">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPETENCIAS Y PREMIOS */}
      <section className="py-32 px-6 bg-army-green-dark/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="army-card p-6 bg-black/60 backdrop-blur-md border-army-green-light/30">
                  <Trophy className="text-army-green-light mb-4" size={32} />
                  <h4 className="font-black text-sm uppercase mb-2">RANKING GLOBAL</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Compite contra reclutas de todo el mundo.</p>
                </div>
                <div className="army-card p-6 bg-black/60 backdrop-blur-md border-army-green-light/30 mt-8">
                  <DollarSign className="text-army-green-light mb-4" size={32} />
                  <h4 className="font-black text-sm uppercase mb-2">PREMIOS REALES</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Recompensas financiadas por sponsors.</p>
                </div>
                <div className="army-card p-6 bg-black/60 backdrop-blur-md border-army-green-light/30">
                  <Award className="text-army-green-light mb-4" size={32} />
                  <h4 className="font-black text-sm uppercase mb-2">MEDALLAS</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Desbloquea insignias de honor permanentes.</p>
                </div>
                <div className="army-card p-6 bg-black/60 backdrop-blur-md border-army-green-light/30 mt-8">
                  <TrendingUp className="text-army-green-light mb-4" size={32} />
                  <h4 className="font-black text-sm uppercase mb-2">ASCENSOS</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">De Recluta a Comandante de Élite.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">HONOR Y GLORIA</p>
              <h2 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-10">
                COMPITE POR<br/><span className="text-army-green-light">LA VICTORIA</span>
              </h2>
              <p className="text-zinc-400 font-mono text-lg uppercase tracking-widest leading-relaxed mb-10">
                No solo entrenas para ti. Entrenas para ser el mejor. Participa en competencias semanales de transformación, fuerza y disciplina. Gana premios reales mientras destruyes tus límites.
              </p>
              <button onClick={onLogin} className="btn-army py-4 px-10 text-sm">VER COMPETENCIAS ACTIVAS</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. RESULTADOS */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center mb-24">
          <motion.div {...fadeInUp}>
            <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">LA METAMORFOSIS</p>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              RESULTADOS DE<br/><span className="text-white">ÉLITE</span>
            </h2>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'MEJOR FÍSICO', val: '90 DÍAS', desc: 'Transformación radical de tu composición corporal.', icon: Dumbbell },
            { title: 'MÁS DISCIPLINA', val: '100%', desc: 'Forja una voluntad inquebrantable ante cualquier reto.', icon: Shield },
            { title: 'MÁS ENERGÍA', val: '24/7', desc: 'Optimiza tu biología para un rendimiento máximo.', icon: Zap },
            { title: 'CONFIANZA', val: 'EXTREMA', desc: 'Camina con la seguridad de quien domina su vida.', icon: Target },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="army-card p-8 text-center space-y-4 border-zinc-900"
            >
              <item.icon className="text-army-green-light mx-auto" size={40} />
              <h3 className="text-3xl font-black italic uppercase">{item.val}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-white">{item.title}</p>
              <p className="text-[10px] font-mono text-zinc-600 uppercase leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. COMUNIDAD */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <Users className="text-army-green-light mx-auto mb-8" size={64} />
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-10">
              UNA HERMANDAD<br/><span className="text-army-green-light">DE HIERRO</span>
            </h2>
            <p className="text-zinc-400 font-mono text-lg md:text-2xl uppercase tracking-widest leading-relaxed mb-12">
              No es una red social común. Es una trinchera digital donde solo los disciplinados tienen voz. Aquí no hay espacio para el "mañana". Aquí solo existe el "ahora".
            </p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black italic">15K+</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">RECLUTAS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black italic">500+</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">COMANDANTES</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black italic">92%</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">ÉXITO</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. DEMO VISUAL */}
      <section className="py-32 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <p className="text-army-green-light font-mono text-sm font-black uppercase tracking-[0.4em] mb-6">TECNOLOGÍA DE ÉLITE</p>
              <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-10">
                TU DASHBOARD<br/>DE CONTROL
              </h2>
              <ul className="space-y-6">
                {[
                  'Interfaz táctica optimizada para móviles.',
                  'Gráficos de rendimiento biológico en tiempo real.',
                  'Sistema de misiones con validación de evidencia.',
                  'Chat de escuadrón encriptado.'
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-zinc-400 font-mono text-sm uppercase tracking-widest">
                    <CheckSquare className="text-army-green-light" size={20} />
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-zinc-900 p-4 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden aspect-[9/19] max-w-[320px] mx-auto">
                <div className="bg-black h-full w-full rounded-[2rem] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-army-green-dark/20" />
                  <div className="p-6 space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-8 bg-army-green-light" />
                      <div className="flex gap-1">
                        <div className="w-4 h-1 bg-zinc-800" />
                        <div className="w-4 h-1 bg-zinc-800" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-zinc-800" />
                      <div className="h-10 w-full bg-army-green-light/20 border border-army-green-light/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-24 bg-zinc-900 border border-zinc-800" />
                      <div className="h-24 bg-zinc-900 border border-zinc-800" />
                    </div>
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-12 bg-zinc-900 border border-zinc-800 flex items-center px-4 gap-3">
                          <div className="w-4 h-4 border border-zinc-700" />
                          <div className="h-2 w-1/2 bg-zinc-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 bg-army-green-light p-4 rounded-full shadow-2xl animate-bounce">
                <Smartphone size={32} className="text-black" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section className="py-40 px-6 relative overflow-hidden bg-army-green-dark">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-7xl md:text-[9rem] font-black uppercase italic tracking-tighter leading-none mb-12">
              TU NUEVA VIDA<br/><span className="text-army-green-light">EMPIEZA HOY.</span>
            </h2>
            <p className="text-zinc-300 font-mono text-xl md:text-2xl uppercase tracking-[0.2em] mb-16 max-w-2xl mx-auto">
              El tiempo corre. La oportunidad es ahora. ¿Vas a ser un espectador o un protagonista?
            </p>
            <button 
              onClick={onLogin}
              className="btn-army py-8 px-20 text-2xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              ENTRAR AL CUARTEL
            </button>
            <p className="mt-12 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Únete a los 15,420 reclutas activos</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Shield className="text-army-green-light" size={24} />
            <span className="font-black text-xl tracking-tighter uppercase italic">PROYECTO 90: EL CUARTEL</span>
          </div>
          <div className="flex gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <a href="#" className="hover:text-army-green-light transition-colors">Términos</a>
            <a href="#" className="hover:text-army-green-light transition-colors">Privacidad</a>
            <a href="#" className="hover:text-army-green-light transition-colors">Soporte</a>
          </div>
          <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">© 2026 EL CUARTEL. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
};

const Typewriter = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

const Dashboard = ({ userProfile, mission, plan, onToggleMission }: any) => {
  const [showWorkout, setShowWorkout] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [honorPoints, setHonorPoints] = useState(userProfile.totalPoints || 0);
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const dateHash = format(new Date(), 'yyyyMMdd').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const quote = MOTIVATION_QUOTES[dateHash % MOTIVATION_QUOTES.length];

  useEffect(() => {
    if (userProfile.totalPoints !== honorPoints) {
      const diff = userProfile.totalPoints - honorPoints;
      if (diff > 0) {
        const interval = setInterval(() => {
          setHonorPoints(prev => {
            if (prev < userProfile.totalPoints) return prev + 1;
            clearInterval(interval);
            return prev;
          });
        }, 20);
        return () => clearInterval(interval);
      } else {
        setHonorPoints(userProfile.totalPoints);
      }
    }
  }, [userProfile.totalPoints]);

  const missionItems = [
    { id: 'breakfast', label: 'DESAYUNO', icon: Utensils, value: mission?.breakfast, desc: plan?.nutrition.breakfast },
    { id: 'lunch', label: 'ALMUERZO', icon: Utensils, value: mission?.lunch, desc: plan?.nutrition.lunch },
    { id: 'snack', label: 'SNACK', icon: Utensils, value: mission?.snack, desc: plan?.nutrition.snack },
    { id: 'dinner', label: 'CENA', icon: Utensils, value: mission?.dinner, desc: plan?.nutrition.dinner },
    { id: 'workout', label: 'ENTRENAMIENTO', icon: Dumbbell, value: mission?.workout, desc: 'Rutina de Calistenia Diaria' },
    { id: 'mental', label: 'MISIÓN MENTAL', icon: Brain, value: mission?.mental, desc: plan?.mentalMission },
  ];

  const progress = missionItems.filter(m => m.value).length;
  const total = missionItems.length;
  const percentage = (progress / total) * 100;

  useEffect(() => {
    if (percentage === 100 && !showVictory) {
      setShowVictory(true);
    } else if (percentage < 100 && showVictory) {
      setShowVictory(false);
    }
  }, [percentage]);

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="scanline" />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2 drop-shadow-[0_0_8px_rgba(45,74,45,0.8)]">SISTEMA DE MISIONES DIARIAS</p>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{today}</h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-3 italic border-l-2 border-army-green-light/30 pl-3 min-h-[1.5em]">
            "<Typewriter text={quote} />"
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-army-green-dark/40 backdrop-blur-sm p-5 border border-army-green-light/20 flex items-center gap-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="text-center relative z-10">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">RACHA ACTUAL</p>
            <div className="flex items-center justify-center gap-2 text-orange-500 font-black text-xl">
              <Flame size={20} className="animate-pulse" />
              <span>{userProfile.streak}</span>
            </div>
          </div>
          <div className="w-px h-10 bg-army-green-light/20" />
          <div className="text-center relative z-10">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">PUNTOS DE HONOR</p>
            <p className="text-army-green-light font-black text-xl tracking-tighter">{honorPoints}</p>
          </div>
          <div className="w-px h-10 bg-army-green-light/20" />
          <div className="text-center relative z-10 min-w-[100px]">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">PROGRESO DE RANGO</p>
            <div className="w-full bg-black h-1.5 border border-army-green-light/20 mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(userProfile.totalPoints % 1000) / 10}%` }}
                className="h-full bg-army-green-light shadow-[0_0_8px_rgba(45,74,45,0.8)]"
              />
            </div>
            <p className="text-[6px] font-mono text-zinc-600 mt-1 uppercase tracking-tighter">SIGUIENTE NIVEL: {userProfile.totalPoints + (1000 - (userProfile.totalPoints % 1000))} PTS</p>
          </div>
          <div className="w-px h-10 bg-army-green-light/20" />
          <div className="text-center relative z-10">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">RANGO MILITAR</p>
            <p className="text-white font-black text-sm tracking-tighter">{RANK_LABELS[userProfile.rank]}</p>
          </div>
        </motion.div>
      </header>

      {/* Progress Section */}
      <div className="army-card p-10 relative overflow-hidden border-army-green-light/30">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <Trophy size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="font-black uppercase tracking-[0.2em] text-xs text-army-green-light mb-1">ESTADO DE LA OPERACIÓN</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black italic">{Math.round(percentage)}%</span>
                <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Completado</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">OBJETIVOS</p>
              <p className="font-black text-xl tracking-tighter">{progress} <span className="text-zinc-600">/</span> {total}</p>
            </div>
          </div>

          <div className="relative h-4 bg-black border border-army-green-light/20 p-0.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="h-full bg-army-green-light relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-stripe_2s_linear_infinite]" />
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(45,74,45,0.8)]" />
            </motion.div>
          </div>

          <div className="mt-6 flex justify-between items-center text-[8px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
            <span>Inicio de Jornada</span>
            <div className="flex gap-1">
              {[...Array(total)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < progress ? 'bg-army-green-light shadow-[0_0_5px_rgba(45,74,45,1)]' : 'bg-zinc-800'}`} />
              ))}
            </div>
            <span>Objetivo Final</span>
          </div>
        </div>
      </div>

      {/* Status Report Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <div className="army-card p-4 flex items-center gap-4 bg-army-green-dark/20 border-army-green-light/10">
          <div className="w-10 h-10 rounded-full bg-army-green-light/10 flex items-center justify-center border border-army-green-light/20">
            <Shield className="text-army-green-light" size={20} />
          </div>
          <div>
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Estado de Defensa</p>
            <p className="text-white font-black text-xs uppercase">Operativo</p>
          </div>
        </div>
        <div className="army-card p-4 flex items-center gap-4 bg-army-green-dark/20 border-army-green-light/10">
          <div className="w-10 h-10 rounded-full bg-army-green-light/10 flex items-center justify-center border border-army-green-light/20">
            <Target className="text-army-green-light" size={20} />
          </div>
          <div>
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Objetivo Actual</p>
            <p className="text-white font-black text-xs uppercase">Transformación Nivel 1</p>
          </div>
        </div>
        <div className="army-card p-4 flex items-center gap-4 bg-army-green-dark/20 border-army-green-light/10">
          <div className="w-10 h-10 rounded-full bg-army-green-light/10 flex items-center justify-center border border-army-green-light/20">
            <Activity className="text-army-green-light" size={20} />
          </div>
          <div>
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Nivel Biológico</p>
            <p className="text-white font-black text-xs uppercase">{userProfile.physicalLevel}</p>
          </div>
        </div>
      </motion.div>

      {/* Missions Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-army-green-light/20" />
          <h3 className="text-[10px] font-mono text-army-green-light font-bold uppercase tracking-[0.4em]">Briefing de Misiones</h3>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-army-green-light/20" />
        </div>
        
        <div className="grid gap-4">
          {missionItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01, x: 5 }}
              className={`army-card p-6 flex items-center gap-6 transition-all relative group ${item.value ? 'border-army-green-light/40 bg-army-green-dark/10 flicker' : 'hover:border-white/30'}`}
            >
            {item.value && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 left-0 w-1 h-full bg-army-green-light shadow-[2px_0_10px_rgba(45,74,45,0.5)]"
              />
            )}

            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleMission(item.id)}
              className={`w-12 h-12 flex-shrink-0 border-2 transition-all flex items-center justify-center relative overflow-hidden ${item.value ? 'bg-army-green-light border-army-green-light' : 'bg-black border-zinc-800 hover:border-army-green-light'}`}
            >
              <AnimatePresence mode="wait">
                {item.value ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                  >
                    <CheckSquare size={24} className="text-black" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="uncheck"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Square size={24} className="text-zinc-700 group-hover:text-army-green-light" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <item.icon size={16} className={item.value ? 'text-army-green-light' : 'text-zinc-500'} />
                <h4 className={`font-black text-sm uppercase tracking-widest ${item.value ? 'text-white' : 'text-zinc-400'}`}>
                  {item.label}
                </h4>
                {item.value && (
                  <span className="text-[8px] font-mono bg-army-green-light text-black px-1.5 py-0.5 font-bold animate-pulse">COMPLETADO</span>
                )}
              </div>
              <p className={`text-xs font-mono truncate ${item.value ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {item.desc || 'Protocolo estándar de nutrición...'}
              </p>
            </div>

            {item.id === 'workout' && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowWorkout(true); }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[10px] font-black text-army-green-light hover:bg-army-green-light hover:text-black transition-all uppercase tracking-widest"
              >
                VER PROTOCOLO
              </button>
            )}
          </motion.div>
        ))}
        </div>
      </div>

      {/* Victory Animation Overlay */}
      <AnimatePresence>
        {showVictory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="bg-army-green-light text-black p-12 shadow-[0_0_100px_rgba(45,74,45,0.8)] border-8 border-black relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none flex items-center justify-center">
                <p className="text-9xl font-black rotate-45 uppercase tracking-tighter">CONFIDENCIAL</p>
              </div>
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-black" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-black" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-black" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-black" />
              
              <div className="text-center space-y-4">
                <Trophy size={80} className="mx-auto mb-6 animate-bounce" />
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">MISIÓN CUMPLIDA</h2>
                <p className="font-mono text-xs font-bold tracking-[0.4em] uppercase">El Cuartel reconoce tu disciplina</p>
                <div className="h-1 w-full bg-black/20 mt-6" />
                <p className="text-[10px] font-mono uppercase mt-4">+100 PUNTOS DE HONOR ADQUIRIDOS</p>
              </div>
            </motion.div>
            
            {/* Particle effects simulation */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 1000, 
                  y: (Math.random() - 0.5) * 1000,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-4 h-4 bg-army-green-light"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Modal */}
      <AnimatePresence>
        {showWorkout && plan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="army-card max-w-2xl w-full p-10 max-h-[85vh] overflow-y-auto border-army-green-light/30"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-4">
                    <Dumbbell className="text-army-green-light" size={32} />
                    ORDEN DE ENTRENAMIENTO
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2">Protocolo de Calistenia - Nivel: {userProfile.physicalLevel}</p>
                </div>
                <button onClick={() => setShowWorkout(false)} className="bg-zinc-900 p-2 border border-zinc-800 text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                {plan.workout.exercises.map((ex: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-army-green-dark/20 p-6 border border-army-green-light/10 hover:border-army-green-light/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-white text-lg uppercase italic group-hover:text-army-green-light transition-colors">{ex.name}</h4>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <p className="text-[8px] font-mono text-zinc-500 uppercase mb-1">SERIES</p>
                          <span className="bg-army-green-dark px-3 py-1 text-xs font-black text-army-green-light border border-army-green-light/20">{ex.sets}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-mono text-zinc-500 uppercase mb-1">REPS</p>
                          <span className="bg-army-green-dark px-3 py-1 text-xs font-black text-army-green-light border border-army-green-light/20">{ex.reps}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed border-l border-army-green-light/20 pl-4">{ex.desc}</p>
                  </motion.div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowWorkout(false)}
                className="btn-army w-full mt-10 py-5 text-lg"
              >
                EJECUTAR PROTOCOLO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routine Summary */}
      {plan && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="army-card p-10 border-zinc-800"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4">
              <Activity className="text-army-green-light" />
              RESUMEN TÁCTICO DE ENTRENAMIENTO
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Calistenia Diaria</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.workout.exercises.map((ex: any, i: number) => (
              <div key={i} className="bg-black/40 p-5 border border-zinc-900 hover:border-army-green-light/20 transition-all">
                <h4 className="font-black text-white text-xs uppercase italic mb-3">{ex.name}</h4>
                <div className="flex gap-4 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase">Series</span>
                    <span className="text-army-green-light font-black text-sm">{ex.sets}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase">Reps</span>
                    <span className="text-army-green-light font-black text-sm">{ex.reps}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono leading-tight line-clamp-2">{ex.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Community = ({ userProfile, mission }: any) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const canPost = mission?.isCompleted;

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !canPost) return;
    try {
      await addDoc(collection(db, 'posts'), {
        uid: userProfile.uid,
        authorName: userProfile.displayName,
        authorPhoto: userProfile.photoURL,
        content: newPost,
        createdAt: Timestamp.now()
      });
      setNewPost('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">RED DE COMUNICACIONES</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">EL CUARTEL</h2>
      </header>

      <div className="army-card p-6">
        {!canPost ? (
          <div className="text-center py-8 space-y-4">
            <AlertTriangle className="mx-auto text-army-green-light" size={32} />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              ACCESO DENEGADO. <br/>DEBES COMPLETAR TODAS LAS MISIONES DE HOY PARA PUBLICAR.
            </p>
            <div className="w-full bg-black h-1 border border-army-green-light/20">
              <div className="h-full bg-army-green-light/30 w-1/3 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea 
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="COMPARTE TU PROGRESO, RECLUTA..."
              className="input-army w-full h-32 resize-none"
            />
            <div className="flex justify-between items-center">
              <button className="text-zinc-500 hover:text-white transition-colors">
                <Camera size={20} />
              </button>
              <button onClick={handlePost} className="btn-army px-8 py-2 text-xs">PUBLICAR</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={post.id} className="army-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={post.authorPhoto} className="w-10 h-10 border border-army-green-light" alt="" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{post.authorName}</p>
                <p className="text-[8px] font-mono text-zinc-500 uppercase">{format(post.createdAt.toDate(), 'HH:mm - d MMM', { locale: es })}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">{post.content}</p>
            <div className="flex gap-6 pt-4 border-t border-army-green-light/10">
              <button className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-army-green-light transition-colors">
                <Heart size={16} /> 24
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-army-green-light transition-colors">
                <MessageSquare size={16} /> 8
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-army-green-light transition-colors ml-auto">
                <Share2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Events = ({ userProfile }: any) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });
    return unsub;
  }, []);

  const handleJoinEvent = async (eventId: string, attendees: string[]) => {
    if (!userProfile) return;
    const isAttending = attendees.includes(userProfile.uid);
    const newAttendees = isAttending 
      ? attendees.filter(id => id !== userProfile.uid)
      : [...attendees, userProfile.uid];

    try {
      await updateDoc(doc(db, 'events', eventId), { attendees: newAttendees });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${eventId}`);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">OPERACIONES DE CAMPO</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">EVENTOS SEMANALES</h2>
      </header>

      <div className="grid gap-6">
        {events.length === 0 ? (
          <div className="army-card p-12 text-center space-y-4">
            <Calendar className="mx-auto text-zinc-700" size={48} />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">NO HAY OPERACIONES PROGRAMADAS EN ESTE MOMENTO.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="army-card overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-army-green-light/10 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-army-green-light/20">
                <p className="text-army-green-light font-black text-4xl mb-1">{format(event.date.toDate(), 'dd')}</p>
                <p className="text-xs font-black uppercase tracking-widest text-white">{format(event.date.toDate(), 'MMMM', { locale: es })}</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-4 uppercase">{format(event.date.toDate(), 'HH:mm')}</p>
              </div>
              <div className="flex-1 p-8 space-y-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tight">{event.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{event.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-army-green-light font-bold uppercase">
                  <MapPin size={14} /> {event.location.address}
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {event.attendees.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[8px] font-black">R</div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-black bg-army-green-light flex items-center justify-center text-[8px] font-black">+{event.attendees.length - 3}</div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinEvent(event.id, event.attendees)}
                    className={`btn-army py-2 px-8 text-[10px] ${event.attendees.includes(userProfile.uid) ? 'bg-white text-black' : ''}`}
                  >
                    {event.attendees.includes(userProfile.uid) ? 'CANCELAR ASISTENCIA' : 'CONFIRMAR ASISTENCIA'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Progress = ({ userProfile }: any) => {
  const stats = [
    { label: 'PESO', value: `${userProfile.weight} KG`, change: '-2.4 KG' },
    { label: 'BRAZOS', value: `${userProfile.measurements.arms} CM`, change: '+1.2 CM' },
    { label: 'CINTURA', value: `${userProfile.measurements.waist} CM`, change: '-3.0 CM' },
    { label: 'PUNTOS', value: userProfile.totalPoints, change: '+450' },
  ];

  const data = [
    { name: 'Sem 1', val: 40 },
    { name: 'Sem 2', val: 55 },
    { name: 'Sem 3', val: 48 },
    { name: 'Sem 4', val: 70 },
    { name: 'Sem 5', val: 85 },
  ];

  return (
    <div className="space-y-12">
      <header>
        <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">ANÁLISIS DE RENDIMIENTO</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">BIO-MÉTRICAS</h2>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="army-card p-6">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
            <p className={`text-[10px] font-black ${stat.change.startsWith('+') ? 'text-army-green-light' : 'text-orange-500'}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="army-card p-8">
        <h3 className="font-black uppercase tracking-widest text-sm mb-12">EVOLUCIÓN DE FUERZA</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d4a2d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2d4a2d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2e1a" />
              <XAxis dataKey="name" stroke="#2d4a2d" fontSize={10} tickLine={false} axisLine={false} fontStyle="mono" />
              <YAxis stroke="#2d4a2d" fontSize={10} tickLine={false} axisLine={false} fontStyle="mono" />
              <Tooltip contentStyle={{ backgroundColor: '#0f1a0f', border: '1px solid #2d4a2d', borderRadius: '0px' }} />
              <Area type="monotone" dataKey="val" stroke="#2d4a2d" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Growth = () => {
  const sections = [
    {
      title: 'MENTALIDAD DE ACERO',
      icon: Brain,
      content: [
        { title: 'Disciplina vs Motivación', desc: 'La motivación es el combustible inicial, la disciplina es el motor que te mantiene en marcha cuando el tanque está vacío.' },
        { title: 'El Poder del "No"', desc: 'Cada vez que dices no a una tentación, estás diciendo sí a tu versión superior.' },
        { title: 'Visualización Táctica', desc: 'Dedica 5 minutos al despertar a visualizar tus misiones completadas con éxito.' }
      ]
    },
    {
      title: 'BIENESTAR EMOCIONAL',
      icon: Heart,
      content: [
        { title: 'Gestión del Estrés', desc: 'El cortisol es el enemigo del crecimiento. Aprende a respirar bajo presión.' },
        { title: 'Descanso Estratégico', desc: 'Dormir no es perder el tiempo, es el momento en que el Cuartel repara tu hardware.' },
        { title: 'Comunidad de Apoyo', desc: 'No estás solo en esta trinchera. Apóyate en tus compañeros reclutas.' }
      ]
    },
    {
      title: 'EQUILIBRIO INTEGRAL',
      icon: Shield,
      content: [
        { title: 'Propósito Claro', desc: 'Define por qué estás aquí. Sin un porqué, cualquier obstáculo te detendrá.' },
        { title: 'Conexión con el Entorno', desc: 'Entrena al aire libre. Siente el sol, el viento y la tierra bajo tus pies.' },
        { title: 'Gratitud Guerrera', desc: 'Agradece el dolor del entrenamiento; es la señal de que estás vivo y evolucionando.' }
      ]
    }
  ];

  return (
    <div className="space-y-12">
      <header>
        <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">DESARROLLO DEL RECLUTA</p>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">CRECIMIENTO INTEGRAL</h2>
      </header>

      <div className="grid gap-8">
        {sections.map((section, i) => (
          <div key={i} className="army-card p-8">
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-4">
              <section.icon className="text-army-green-light" />
              {section.title}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {section.content.map((item, j) => (
                <div key={j} className="bg-black/50 p-6 border border-army-green-light/10 space-y-3">
                  <h4 className="font-black text-xs text-white uppercase tracking-widest">{item.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Profile = ({ userProfile }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    weight: userProfile.weight,
    measurements: { ...userProfile.measurements }
  });

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), editData);
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-army-green-light font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">EXPEDIENTE DEL RECLUTA</p>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">PERFIL</h2>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="btn-army py-2 px-6 text-[10px]"
        >
          {isEditing ? 'GUARDAR CAMBIOS' : 'EDITAR BIOMETRÍA'}
        </button>
      </header>
      <div className="army-card p-8 flex flex-col md:flex-row items-center gap-8">
        <img src={userProfile.photoURL} className="w-32 h-32 border-4 border-army-green-light shadow-xl" alt="" />
        <div className="text-center md:text-left space-y-2">
          <h3 className="text-3xl font-black uppercase italic">{userProfile.displayName}</h3>
          <p className="text-army-green-light font-black tracking-widest uppercase">{RANK_LABELS[userProfile.rank as Rank]}</p>
          <div className="flex gap-4 pt-4">
            <div className="bg-black/50 px-4 py-2 border border-army-green-light/20">
              <p className="text-[8px] font-mono text-zinc-500 uppercase">PUNTOS TOTALES</p>
              <p className="text-xl font-black">{userProfile.totalPoints}</p>
            </div>
            <div className="bg-black/50 px-4 py-2 border border-army-green-light/20">
              <p className="text-[8px] font-mono text-zinc-500 uppercase">NIVEL</p>
              <p className="text-xl font-black">{userProfile.physicalLevel?.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="army-card p-6">
          <h4 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-army-green-light/10 pb-2">DATOS BIOMÉTRICOS</h4>
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center"><span className="text-zinc-500">EDAD</span><span>{userProfile.age} AÑOS</span></div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">PESO</span>
              {isEditing ? (
                <input type="number" value={editData.weight} onChange={e => setEditData({...editData, weight: Number(e.target.value)})} className="input-army py-1 px-2 w-20 text-right" />
              ) : (
                <span>{userProfile.weight} KG</span>
              )}
            </div>
            <div className="flex justify-between items-center"><span className="text-zinc-500">ESTATURA</span><span>{userProfile.height} CM</span></div>
            <div className="flex justify-between items-center"><span className="text-zinc-500">SEXO</span><span>{userProfile.sex === 'M' ? 'MASCULINO' : 'FEMENINO'}</span></div>
          </div>
        </div>
        <div className="army-card p-6">
          <h4 className="font-black uppercase tracking-widest text-xs mb-6 border-b border-army-green-light/10 pb-2">MEDIDAS ACTUALES</h4>
          <div className="space-y-4 font-mono text-xs">
            {['chest', 'waist', 'legs', 'arms'].map(m => (
              <div key={m} className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase">{m === 'chest' ? 'PECHO' : m === 'waist' ? 'CINTURA' : m === 'legs' ? 'PIERNAS' : 'BRAZOS'}</span>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={(editData.measurements as any)[m]} 
                    onChange={e => setEditData({...editData, measurements: {...editData.measurements, [m]: Number(e.target.value)}})} 
                    className="input-army py-1 px-2 w-20 text-right" 
                  />
                ) : (
                  <span>{(userProfile.measurements as any)[m]} CM</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => signOut(auth)} className="btn-army w-full bg-red-600/20 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white">CERRAR SESIÓN</button>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mission, setMission] = useState<Mission | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubProfile;
  }, [user]);

  useEffect(() => {
    if (!userProfile) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Mission listener
    const unsubMission = onSnapshot(doc(db, 'users', userProfile.uid, 'missions', today), (snap) => {
      if (snap.exists()) {
        setMission(snap.data() as Mission);
      } else {
        const newMission: Mission = {
          date: today,
          breakfast: false,
          lunch: false,
          snack: false,
          dinner: false,
          workout: false,
          mental: false,
          isCompleted: false
        };
        setDoc(doc(db, 'users', userProfile.uid, 'missions', today), newMission);
      }
    });

    // Plan listener
    const unsubPlan = onSnapshot(doc(db, 'users', userProfile.uid, 'plans', today), (snap) => {
      if (snap.exists()) {
        setPlan(snap.data() as Plan);
      } else {
        const newPlan = generateDailyPlan(userProfile, today);
        setDoc(doc(db, 'users', userProfile.uid, 'plans', today), newPlan);
      }
    });

    return () => {
      unsubMission();
      unsubPlan();
    };
  }, [userProfile]);

  const handleToggleMission = async (id: string) => {
    if (!mission || !userProfile) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const updatedMission = { ...mission, [id]: !mission[id as keyof Mission] };
    
    // Check if all completed
    const allCompleted = 
      updatedMission.breakfast && 
      updatedMission.lunch && 
      updatedMission.snack && 
      updatedMission.dinner && 
      updatedMission.workout && 
      updatedMission.mental;
    
    updatedMission.isCompleted = allCompleted;

    try {
      await setDoc(doc(db, 'users', userProfile.uid, 'missions', today), updatedMission);
      
      if (allCompleted && !mission.isCompleted) {
        // Update streak and points
        const isConsecutive = userProfile.lastMissionDate === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const newStreak = isConsecutive ? userProfile.streak + 1 : 1;
        const newPoints = userProfile.totalPoints + 100;
        
        // Calculate new rank
        let newRank = userProfile.rank;
        if (newPoints >= RANK_THRESHOLDS.Commander) newRank = 'Commander';
        else if (newPoints >= RANK_THRESHOLDS.Elite) newRank = 'Elite';
        else if (newPoints >= RANK_THRESHOLDS.Warrior) newRank = 'Warrior';
        else if (newPoints >= RANK_THRESHOLDS.Soldier) newRank = 'Soldier';

        await updateDoc(doc(db, 'users', userProfile.uid), {
          streak: newStreak,
          lastMissionDate: today,
          totalPoints: newPoints,
          rank: newRank
        });

        showToast("¡MISIÓN COMPLETADA! +100 PUNTOS");
        if (newRank !== userProfile.rank) {
          showToast(`¡ASCENSO! NUEVO RANGO: ${RANK_LABELS[newRank as Rank]}`, 'success');
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}/missions/${today}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="space-y-4 text-center">
          <Shield className="text-army-green-light animate-pulse mx-auto" size={48} />
          <p className="text-xs text-zinc-500 uppercase tracking-[0.5em] animate-pulse">INICIALIZANDO CUARTEL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (!userProfile || !userProfile.isProfileComplete) {
    return <Onboarding user={user} onComplete={setUserProfile} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-army-green-light/30">
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Dashboard userProfile={userProfile} mission={mission} plan={plan} onToggleMission={handleToggleMission} />
              </motion.div>
            )}
            {activeTab === 'competitions' && (
              <motion.div key="competitions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Competitions userProfile={userProfile} />
              </motion.div>
            )}
            {activeTab === 'ranking' && (
              <motion.div key="ranking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Ranking />
              </motion.div>
            )}
            {activeTab === 'community' && (
              <motion.div key="community" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Community userProfile={userProfile} mission={mission} />
              </motion.div>
            )}
            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Events userProfile={userProfile} />
              </motion.div>
            )}
            {activeTab === 'growth' && (
              <motion.div key="growth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Growth />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Profile userProfile={userProfile} />
              </motion.div>
            )}
            {activeTab === 'admin' && userProfile.role === 'admin' && (
              <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </Layout>
      </div>
    </ErrorBoundary>
  );
}
