import { useState, useEffect, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, ClipboardCheck, LayoutDashboard, 
  RotateCcw, Sparkles, Smartphone, Award, Shield, BookOpen,
  ArrowRight, Key, Mail, User, Info, CheckCircle2, ChevronRight,
  LogOut, Phone, ShieldCheck
} from 'lucide-react';
import { Player, Payment, Attendance, Match, Announcement, Category } from './types';
import { 
  initialPlayers, initialPayments, initialAttendance, initialMatches, initialAnnouncements, getMonthlyFee 
} from './initialData';
import RafaDashboard from './components/RafaDashboard';
import ParentsPortal from './components/ParentsPortal';
import TeacherPortal from './components/TeacherPortal';

export default function App() {
  // Current active login profile: 'selection' (landing page) | 'rafa' (Don Rafa Admin) | 'parents' | 'teacher'
  const [activeProfile, setActiveProfile] = useState<'selection' | 'rafa' | 'parents' | 'teacher'>('selection');

  // Login credentials states
  const [teacherEmailInput, setTeacherEmailInput] = useState('');
  const [teacherRutInput, setTeacherRutInput] = useState('');
  
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');

  // Login error messages
  const [loginError, setLoginError] = useState<string | null>(null);

  // Logged session details
  const [loggedTeacher, setLoggedTeacher] = useState<{ name: string; category: Category; email: string } | null>(null);
  const [loggedParent, setLoggedParent] = useState<{ parentName: string; phone: string } | null>(null);

  // Which profile tab inside the login selection is currently expanded to show details
  const [expandedForm, setExpandedForm] = useState<'none' | 'parents' | 'teacher' | 'rafa'>('none');

  // Dynamic Core States
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load state from localStorage on startup
  useEffect(() => {
    const savedPlayers = localStorage.getItem('halcones_players');
    const savedPayments = localStorage.getItem('halcones_payments');
    const savedAttendance = localStorage.getItem('halcones_attendance');
    const savedMatches = localStorage.getItem('halcones_matches');
    const savedAnnouncements = localStorage.getItem('halcones_announcements');

    if (savedPlayers && savedPayments && savedAttendance && savedMatches) {
      try {
        setPlayers(JSON.parse(savedPlayers));
        setPayments(JSON.parse(savedPayments));
        setAttendance(JSON.parse(savedAttendance));
        setMatches(JSON.parse(savedMatches));
        if (savedAnnouncements) {
          setAnnouncements(JSON.parse(savedAnnouncements));
        } else {
          setAnnouncements(initialAnnouncements);
        }
      } catch (err) {
        console.error("Error loading local storage data, resetting:", err);
        resetToInitialData();
      }
    } else {
      resetToInitialData();
    }
    setIsDataLoaded(true);
  }, []);

  // Save states to localStorage whenever they change
  useEffect(() => {
    if (!isDataLoaded) return;
    localStorage.setItem('halcones_players', JSON.stringify(players));
    localStorage.setItem('halcones_payments', JSON.stringify(payments));
    localStorage.setItem('halcones_attendance', JSON.stringify(attendance));
    localStorage.setItem('halcones_matches', JSON.stringify(matches));
    localStorage.setItem('halcones_announcements', JSON.stringify(announcements));
  }, [players, payments, attendance, matches, announcements, isDataLoaded]);

  // RESET TO DEFAULT VALUES METHOD
  const resetToInitialData = () => {
    setPlayers(initialPlayers);
    setPayments(initialPayments);
    setAttendance(initialAttendance);
    setMatches(initialMatches);
    setAnnouncements(initialAnnouncements);
  };

  // 1. ADD PLAYER HANDLER
  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);

    // Initialize default payments for this new player
    const months = ['Marzo', 'Abril', 'Mayo', 'Junio'];
    const fee = getMonthlyFee(newPlayer.category);
    
    const newPayments: Payment[] = months.map(m => ({
      id: `pay_${m.toLowerCase().substring(0, 3)}_${newPlayer.id}`,
      playerId: newPlayer.id,
      month: m,
      year: 2026,
      status: 'pending',
      amount: fee
    }));

    setPayments(prev => [...prev, ...newPayments]);

    // Initialize attendance as false for this player on all existing training dates
    const uniqueDates = Array.from(new Set(attendance.map(a => a.date))) as string[];
    const newAttendanceRecords: Attendance[] = uniqueDates.map(date => ({
      id: `att_${date.replace(/-/g, '_')}_${newPlayer.id}`,
      playerId: newPlayer.id,
      date,
      attended: false
    }));

    setAttendance(prev => [...prev, ...newAttendanceRecords]);
  };

  // 2. DELETE PLAYER HANDLER
  const handleDeletePlayer = (id: string) => {
    // Mark as inactive (baja) so they are kept in records
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: 'baja' } : p));
  };

  // 3. TOGGLE PAYMENT BADGE HANDLER
  const handleTogglePayment = (playerId: string, month: string, year: number = 2026) => {
    setPayments(prev => {
      const exists = prev.some(pay => pay.playerId === playerId && pay.month === month && pay.year === year);
      
      if (!exists) {
        const player = players.find(p => p.id === playerId);
        const fee = player ? getMonthlyFee(player.category) : 15000;
        const newPay: Payment = {
          id: `pay_${month.toLowerCase().substring(0, 3)}_${year}_${playerId}`,
          playerId,
          month,
          year,
          status: 'paid',
          amount: fee,
          paidDate: new Date().toISOString().split('T')[0]
        };
        return [...prev, newPay];
      }
      
      return prev.map(pay => {
        if (pay.playerId === playerId && pay.month === month && pay.year === year) {
          const isPaying = pay.status === 'pending';
          return {
            ...pay,
            status: isPaying ? 'paid' : 'pending',
            paidDate: isPaying ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return pay;
      });
    });
  };

  // 4. TOGGLE ATTENDANCE BOOLEAN HANDLER
  const handleToggleAttendance = (playerId: string, date: string) => {
    setAttendance(prev => 
      prev.map(att => {
        if (att.playerId === playerId && att.date === date) {
          return {
            ...att,
            attended: !att.attended
          };
        }
        return att;
      })
    );
  };

  // 5. REGISTER A NEW TRAINING SESSION DATE
  const handleAddAttendanceDate = (newDate: string) => {
    const dateExists = attendance.some(a => a.date === newDate);
    if (dateExists) return;

    const newSessionRecords: Attendance[] = players.map(p => ({
      id: `att_${newDate.replace(/-/g, '_')}_${p.id}`,
      playerId: p.id,
      date: newDate,
      attended: false
    }));

    setAttendance(prev => [...prev, ...newSessionRecords]);
  };

  // 6. PARENT REGISTER PAY VIA SIMULATION
  const handleRegisterParentPayment = (playerId: string, month: string) => {
    setPayments(prev => 
      prev.map(p => {
        if (p.playerId === playerId && p.month === month) {
          return {
            ...p,
            status: 'paid',
            paidDate: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    );
  };

  // 7. ANNOUNCEMENT HANDLERS
  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const handleUpdateAnnouncement = (id: string, updated: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // --- CREDENTIAL VALIDATION LOGIC ---
  // Teachers enter with email and the 6 numbers of the RUT before verified digit.
  const handleTeacherLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = teacherEmailInput.trim().toLowerCase();
    const cleanRut = teacherRutInput.replace(/\D/g, ''); // Extract only numbers

    if (!email || !cleanRut) {
      setLoginError('Complete todos los campos de credencial.');
      return;
    }

    // Carlos Silva -> RUT: 14.321.098-7 (RUT numbers before DV are 14321098, lets support subset 143210, 321098, or full)
    if (email === 'carlos.silva@loshalcones.cl') {
      const validRut = cleanRut === '143210' || cleanRut === '321098' || cleanRut === '14321098';
      if (validRut) {
        setLoggedTeacher({
          name: 'Profe Carlos Silva',
          category: 'Infantil',
          email: 'carlos.silva@loshalcones.cl'
        });
        setActiveProfile('teacher');
        setLoginError(null);
        return;
      }
    }

    // Maria Ortiz -> RUT: 16.543.210-9 (RUT digits before DV are 16543210, let's accept subsets)
    if (email === 'maria.ortiz@loshalcones.cl') {
      const validRut = cleanRut === '165432' || cleanRut === '543210' || cleanRut === '16543210';
      if (validRut) {
        setLoggedTeacher({
          name: 'Dra. María Ortiz',
          category: 'Juvenil',
          email: 'maria.ortiz@loshalcones.cl'
        });
        setActiveProfile('teacher');
        setLoginError(null);
        return;
      }
    }

    // Don Rafa (can access as trainer as well)
    if (email === 'rafa@loshalcones.cl') {
      const validRut = cleanRut === '876543' || cleanRut === '765432' || cleanRut === '8765432';
      if (validRut) {
        setLoggedTeacher({
          name: 'Don Rafa Admon.',
          category: 'Adulto',
          email: 'rafa@loshalcones.cl'
        });
        setActiveProfile('teacher');
        setLoginError(null);
        return;
      }
    }

    setLoginError('Profesor no encontrado o números de RUT incorrectos.');
  };

  // Parents enter with their name and the last 6 digits of their phone.
  const handleParentLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const name = parentNameInput.trim().toLowerCase();
    const phoneInputDigits = parentPhoneInput.trim().replace(/\D/g, '');

    if (!name || phoneInputDigits.length < 6) {
      setLoginError('Complete su nombre y al menos los últimos 6 dígitos del teléfono.');
      return;
    }

    // Search players array to see if a parent matches
    const matchedPlayer = players.find(p => {
      if (p.status === 'baja' || !p.parentName) return false;
      const matchName = p.parentName.trim().toLowerCase() === name || p.name.trim().toLowerCase() === name;
      const last6DigitsOfPhone = p.phone.trim().slice(-6);
      const matchPhone = phoneInputDigits.slice(-6) === last6DigitsOfPhone;
      return matchName && matchPhone;
    });

    if (matchedPlayer) {
      setLoggedParent({
        parentName: matchedPlayer.parentName || matchedPlayer.name,
        phone: matchedPlayer.phone
      });
      setActiveProfile('parents');
      setLoginError(null);
    } else {
      setLoginError('No se encontró ningún alumno asociado con ese nombre de apoderado y teléfono.');
    }
  };

  // Dynamic list of active parent/apoderado families for selection
  const parentShortcutsList = useMemo(() => {
    if (!players || players.length === 0) return [];
    
    interface ParentShortcutItem {
      parentName: string;
      phone: string;
      childrenNames: string;
    }
    
    // Group active players by parent
    const parentMap: { [key: string]: { parentName: string; phone: string; kids: string[] } } = {};
    
    players.forEach(p => {
      if (p.status === 'baja') return;
      const parentNameValue = p.parentName && p.parentName.trim() !== '' ? p.parentName.trim() : 'Autosuficiente';
      const cleanParent = parentNameValue === 'Autosuficiente' ? p.name : parentNameValue;
      
      const key = `${cleanParent.toLowerCase().trim()}_${p.phone.trim()}`;
      if (!parentMap[key]) {
        parentMap[key] = {
          parentName: cleanParent,
          phone: p.phone,
          kids: []
        };
      }
      parentMap[key].kids.push(p.name);
    });
    
    const list: ParentShortcutItem[] = Object.values(parentMap).map(item => ({
      parentName: item.parentName,
      phone: item.phone,
      childrenNames: item.kids.join(', ')
    }));
    
    return list.sort((a, b) => a.parentName.localeCompare(b.parentName));
  }, [players]);

  const handleSelectParentShortcut = (parentName: string, phone: string) => {
    setLoginError(null);
    setLoggedParent({
      parentName,
      phone
    });
    setActiveProfile('parents');
  };

  // Shortcut loaders for testing the login simulator without typing
  const handleShortcutLogin = (type: 'carlos' | 'maria' | 'laura' | 'carlos_perez') => {
    setLoginError(null);
    if (type === 'carlos') {
      setLoggedTeacher({
        name: 'Profe Carlos Silva',
        category: 'Infantil',
        email: 'carlos.silva@loshalcones.cl'
      });
      setActiveProfile('teacher');
    } else if (type === 'maria') {
      setLoggedTeacher({
        name: 'Dra. María Ortiz',
        category: 'Juvenil',
        email: 'maria.ortiz@loshalcones.cl'
      });
      setActiveProfile('teacher');
    } else if (type === 'laura') {
      setLoggedParent({
        parentName: 'Laura Silva',
        phone: '5512345678'
      });
      setActiveProfile('parents');
    } else if (type === 'carlos_perez') {
      setLoggedParent({
        parentName: 'Carlos Pérez',
        phone: '5523456789'
      });
      setActiveProfile('parents');
    }
  };

  const handleLogout = () => {
    setLoggedTeacher(null);
    setLoggedParent(null);
    setActiveProfile('selection');
    setExpandedForm('none');
    setTeacherEmailInput('');
    setTeacherRutInput('');
    setParentNameInput('');
    setParentPhoneInput('');
    setLoginError(null);
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 mt-4 text-xs font-semibold animate-pulse">Abriendo cuaderno de Don Rafa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-white antialiased">
      
      {/* 1. TOP UTILITY HEADER BRAND */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Brand logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-md relative">
              <span className="font-extrabold text-sm tracking-tighter">🏆</span>
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-slate-900 border border-white rounded-full flex items-center justify-center text-[8px] text-white">
                ⚽
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 font-display flex items-center gap-1">
                JUGADA MAESTRA
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Club Los Halcones del Barrio</p>
            </div>
          </div>

          {/* Quick profile switch widget for developers/testers */}
          <div className="flex items-center gap-2">
            {activeProfile !== 'selection' && (
              <button
                onClick={handleLogout}
                className="text-xs bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold px-3 py-2 rounded-xl border border-slate-200/60 duration-150 cursor-pointer flex items-center gap-1"
                id="header-logout-button"
              >
                <LogOut className="w-3 h-3 text-slate-400" />
                Cerrar Sesión (Panel Central)
              </button>
            )}

            <button
              onClick={() => {
                resetToInitialData();
                alert('Libreta restablecida con los datos de fábrica.');
              }}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 px-2.5 py-2 rounded-xl font-mono border border-slate-150 duration-150 cursor-pointer"
            >
              Reiniciar Datos
            </button>
          </div>

        </div>
      </header>

      {/* 2. CORE VIEW SWITCHSTAGE ENGINE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative">
        <AnimatePresence mode="wait">
          
          {/* A. PROFILE LOGIN LANDING PAGE IN ACCORDANCE WITH SCREENSHOT */}
          {activeProfile === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-8 py-4 sm:py-8"
              id="view-profile-selection-screen"
            >
              
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-cyan-50 text-cyan-700 font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-100">
                  Panel de Ingreso Virtual
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-cyan-950 uppercase tracking-tight">
                  Selecciona tu perfil para ingresar:
                </h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  Por favor, escoge tu rol dentro de Los Halcones para configurar tu interfaz adaptada de cuotas y clases.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-55 border border-rose-200/80 text-rose-800 text-xs px-4 py-3 rounded-2xl text-center font-extrabold flex items-center justify-center gap-2 max-w-md mx-auto">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                  {loginError}
                </div>
              )}

              <div className="space-y-4">
                
                {/* ROLE CARD 1: PARENTS (ANTIGUO/A ALUMNO/A) */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight">
                          Padre, Madre de Familia o Alumno/a
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                          Consulta asistencia, revisa si estás al día con las cuotas y avisos del club en tiempo real.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedForm(expandedForm === 'parents' ? 'none' : 'parents')}
                      className="bg-cyan-55/70 hover:bg-cyan-100/95 text-cyan-800 hover:text-cyan-900 border border-cyan-100 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl duration-150 cursor-pointer self-stretch sm:self-auto text-center"
                      id="btn-login-parent"
                    >
                      {expandedForm === 'parents' ? 'Ocultar' : 'INGRESAR'}
                    </button>
                  </div>

                  {/* FORM ACCORDION FOR PARENTS */}
                  <AnimatePresence>
                    {expandedForm === 'parents' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100 space-y-4 overflow-hidden"
                      >
                        <form onSubmit={handleParentLoginSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-cyan-500" />
                              Nombre del Apoderado o Alumno:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Laura Silva o Mateo Gómez"
                              value={parentNameInput}
                              onChange={(e) => setParentNameInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-cyan-500" />
                              Últimos 6 números telefónicos:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: 345678 (de 5512345678)"
                              value={parentPhoneInput}
                              onChange={(e) => setParentPhoneInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <div className="text-[11px] text-slate-400 font-semibold">
                              💡 Ingresa <strong className="text-slate-600">Laura Silva / 345678</strong> (tutor de Mateo) o usa los accesos rápidos de abajo.
                            </div>
                            <button
                              type="submit"
                              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer text-center whitespace-nowrap"
                            >
                              Validar Credenciales
                            </button>
                          </div>
                        </form>

                        {/* Direct bypass short-loaders */}
                        <div className="bg-cyan-50/25 border border-dashed border-cyan-200 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-900 font-mono block">
                            🔑 Accesos Directos de Prueba (Simulador con todos los apoderados):
                          </span>
                          
                          {/* Showcase principal buttons */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleShortcutLogin('laura')}
                              className="bg-white hover:bg-cyan-50 border border-cyan-100 text-cyan-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              👩‍👦 Madre: Laura Silva (Mateo Gómez)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShortcutLogin('carlos_perez')}
                              className="bg-white hover:bg-cyan-50 border border-cyan-100 text-cyan-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              👨‍👦 Padre: Carlos Pérez (Santiago Pérez)
                            </button>
                          </div>

                          {/* Selector for all other parents/students */}
                          <div className="pt-2 border-t border-dashed border-cyan-150 space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 block">
                              ¿Quieres probar otro apoderado? Selecciona cualquiera de las {parentShortcutsList.length} familias del Club:
                            </label>
                            <div className="flex gap-2">
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  const [parentName, phone] = val.split('|__split__|');
                                  handleSelectParentShortcut(parentName, phone);
                                }}
                                className="flex-1 bg-white border border-cyan-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                              >
                                <option value="">-- Seleccionar un apoderado del listado oficial --</option>
                                {parentShortcutsList.map((item, idx) => (
                                  <option key={idx} value={`${item.parentName}|__split__|${item.phone}`}>
                                    {item.parentName} ({item.childrenNames})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ROLE CARD 2: PROFESOR O PROFESORA */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight">
                          Profesor o Profesora del Club
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                          Ver horarios asignados, tomar asistencia real el día de hoy, y registrar notas para padres.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedForm(expandedForm === 'teacher' ? 'none' : 'teacher')}
                      className="bg-cyan-55/70 hover:bg-cyan-100/95 text-cyan-800 hover:text-cyan-900 border border-cyan-100 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl duration-150 cursor-pointer self-stretch sm:self-auto text-center"
                      id="btn-login-teacher"
                    >
                      {expandedForm === 'teacher' ? 'Ocultar' : 'INGRESAR'}
                    </button>
                  </div>

                  {/* FORM ACCORDION FOR TEACHERS */}
                  <AnimatePresence>
                    {expandedForm === 'teacher' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100 space-y-4 overflow-hidden"
                      >
                        <form onSubmit={handleTeacherLoginSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-teal-500" />
                              Correo electrónico:
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="Ej: carlos.silva@loshalcones.cl"
                              value={teacherEmailInput}
                              onChange={(e) => setTeacherEmailInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <Key className="w-3.5 h-3.5 text-teal-500" />
                              6 primeros números del RUT antes del DV:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: 143210 (de Carlos Silva)"
                              value={teacherRutInput}
                              onChange={(e) => setTeacherRutInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <div className="text-[11px] text-slate-400 font-semibold">
                              💡 Ingresa <strong className="text-slate-600">carlos.silva@loshalcones.cl / 143210</strong> de prueba o usa los accesos rápidos.
                            </div>
                            <button
                              type="submit"
                              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer text-center whitespace-nowrap"
                            >
                              Validar Credenciales
                            </button>
                          </div>
                        </form>

                        {/* Direct bypass short-loaders */}
                        <div className="bg-teal-50/25 border border-dashed border-teal-200 p-3 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 font-mono block">Botones de Acceso Directo de Prueba:</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleShortcutLogin('carlos')}
                              className="bg-white hover:bg-teal-50 border border-teal-100 text-teal-900 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              🔑 Profe Carlos (Categoría Infantil)
                            </button>
                            <button
                              onClick={() => handleShortcutLogin('maria')}
                              className="bg-white hover:bg-teal-50 border border-teal-100 text-teal-900 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              🔑 Dra. María Ortiz (Categoría Juvenil)
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ROLE CARD 3: ADMINISTRATOR (DON RAFA) */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight">
                          Administrador (Don Rafa)
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                          Acceso total al panel de administración: libreta de asistencia global, control de matrículas, ingresos consolidados y directorio de apoderados.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedForm(expandedForm === 'rafa' ? 'none' : 'rafa')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-100 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl duration-150 cursor-pointer self-stretch sm:self-auto text-center"
                      id="btn-login-rafa"
                    >
                      {expandedForm === 'rafa' ? 'Ocultar' : 'INGRESAR'}
                    </button>
                  </div>

                  {/* DIRECT ACCORDION CONFIRMATION FOR DON RAFA */}
                  <AnimatePresence>
                    {expandedForm === 'rafa' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 overflow-hidden"
                      >
                        <div className="text-[11px] font-bold text-slate-500 leading-tight">
                          🔒 Al presionar ingresar, accederás directamente como el administrador global del club con control total de las planillas.
                        </div>
                        <button
                          onClick={() => {
                            setActiveProfile('rafa');
                            setExpandedForm('none');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl mt-2 sm:mt-0 shadow-md shrink-0 cursor-pointer text-center"
                        >
                          Confirmar Ingreso como Admin
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              <div className="bg-cyan-50/20 border border-cyan-150/40 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-800 font-medium">
                <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed leading-relaxed">
                  <strong>Nota sobre el ingreso simulado:</strong> Tal como solicitaste, para mayor facilidad de pruebas no hemos forzado contraseñas estrictas. Podrás ingresar simuladamente de forma libre haciendo clic en expandir "INGRESAR" en cada tarjeta, validando datos reales o presionando los accesos rápidos.
                </div>
              </div>

            </motion.div>
          )}

          {/* B. ADMINISTRATOR PROFILE ACTIVE VIEW */}
          {activeProfile === 'rafa' && (
            <motion.div
              key="rafa"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              id="view-animation-stage"
            >
              <RafaDashboard
                players={players}
                payments={payments}
                attendance={attendance}
                matches={matches}
                announcements={announcements}
                onAddPlayer={handleAddPlayer}
                onDeletePlayer={handleDeletePlayer}
                onTogglePayment={handleTogglePayment}
                onToggleAttendance={handleToggleAttendance}
                onAddAttendanceDate={handleAddAttendanceDate}
                onAddAnnouncement={handleAddAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            </motion.div>
          )}

          {/* C. PARENTS PROFILE ACTIVE VIEW */}
          {activeProfile === 'parents' && (
            <motion.div
              key="parents"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              id="view-animation-stage"
            >
              <ParentsPortal
                players={players}
                payments={payments}
                attendance={attendance}
                matches={matches}
                announcements={announcements}
                onRegisterParentPayment={handleRegisterParentPayment}
                loggedParentName={loggedParent?.parentName}
                loggedParentPhone={loggedParent?.phone}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {/* D. MASTER INSTRUCTORS PROFILE VIEW */}
          {activeProfile === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              id="view-animation-stage"
            >
              <TeacherPortal
                teacherName={loggedTeacher?.name || 'Profesor'}
                category={loggedTeacher?.category || 'Infantil'}
                email={loggedTeacher?.email || ''}
                players={players}
                attendance={attendance}
                matches={matches}
                announcements={announcements}
                onToggleAttendance={handleToggleAttendance}
                onAddAttendanceDate={handleAddAttendanceDate}
                onAddAnnouncement={handleAddAnnouncement}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. CONCISE ATHLETIC FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono">
          <div>
            &copy; 2026 Jugada Maestra • Hecho para Los Halcones del Barrio
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Soporte Técnico: Don Rafa Admon.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
