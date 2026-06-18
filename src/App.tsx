import { useState, useEffect, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, ClipboardCheck, LayoutDashboard, 
  RotateCcw, Sparkles, Smartphone, Award, Shield, BookOpen,
  ArrowRight, Key, Mail, User, Info, CheckCircle2, ChevronRight,
  LogOut, Phone, ShieldCheck
} from 'lucide-react';
import { Player, Payment, Attendance, Match, Announcement, Category, PaymentVoucher } from './types';
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
  
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminRutInput, setAdminRutInput] = useState('');
  
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');

  // Login error messages
  const [loginError, setLoginError] = useState<string | null>(null);

  // Logged session details
  const [loggedTeacher, setLoggedTeacher] = useState<{ name: string; category: Category; email: string } | null>(null);
  const [loggedParent, setLoggedParent] = useState<{ parentName: string; phone: string } | null>(null);

  // Which profile tab inside the login selection is currently expanded to show details
  const [expandedForm, setExpandedForm] = useState<'none' | 'parents' | 'teacher' | 'rafa'>('none');

  // Collapsible access guides toggle state
  const [showAccessGuides, setShowAccessGuides] = useState(false);

  // Dynamic Core States
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Default demo vouchers for simulation
  const getDefaultVouchers = (): PaymentVoucher[] => [
    {
      id: 'voucher_demo_1',
      parentName: 'Laura Silva',
      parentPhone: '5512345678',
      message: 'Envío de boucher de pago de mis hijos Mateo Gómez y Luis Sánchez de la categoría Infantil y Adulto respectivamente. Pagos correspondientes al mes de Junio.',
      students: [
        { playerId: 'p1', playerName: 'Mateo Gómez', category: 'Infantil', months: ['Junio'] },
        { playerId: 'p41', playerName: 'Luis Sánchez', category: 'Adulto', months: ['Junio'] }
      ],
      referenceCode: 'TRANS-9901248',
      status: 'pending',
      createdAt: '2026-06-18T10:30:00Z',
      totalAmount: 35000
    },
    {
      id: 'voucher_demo_2',
      parentName: 'Carlos Pérez',
      parentPhone: '5523456789',
      message: 'Hola Don Rafa, le envío el boucher de pago de mi hijo Santiago Pérez de la categoría Infantil para ponerse al día con el mes de Mayo.',
      students: [
        { playerId: 'p2', playerName: 'Santiago Pérez', category: 'Infantil', months: ['Mayo'] }
      ],
      referenceCode: 'DEP-4491024',
      status: 'pending',
      createdAt: '2026-06-18T11:15:00Z',
      totalAmount: 15000
    }
  ];

  // Load state from localStorage on startup
  useEffect(() => {
    const savedPlayers = localStorage.getItem('halcones_players');
    const savedPayments = localStorage.getItem('halcones_payments');
    const savedAttendance = localStorage.getItem('halcones_attendance');
    const savedMatches = localStorage.getItem('halcones_matches');
    const savedAnnouncements = localStorage.getItem('halcones_announcements');
    const savedVouchers = localStorage.getItem('halcones_vouchers');
    const savedProfile = localStorage.getItem('halcones_active_profile');
    const savedTeacher = localStorage.getItem('halcones_logged_teacher');
    const savedParent = localStorage.getItem('halcones_logged_parent');

    if (savedPlayers && savedPayments && savedAttendance && savedMatches) {
      try {
        let loadedPlayers = JSON.parse(savedPlayers) as Player[];
        let loadedPayments = JSON.parse(savedPayments) as Payment[];

        // Migration: If we detect any players still have "Autosuficiente" parentName,
        // or we have > 15 distinct parent names, re-align with original initialPlayers structure
        // immediately resolving the cache duplicate/45-parent-names issue!
        const distinctParents = new Set(loadedPlayers.filter(p => p.status !== 'baja').map(p => p.parentName));
        if (distinctParents.has('Autosuficiente') || distinctParents.size > 15) {
          loadedPlayers = loadedPlayers.map(p => {
            const fresh = initialPlayers.find(ip => ip.id === p.id);
            if (fresh) {
              return {
                ...p,
                parentName: fresh.parentName,
                phone: fresh.phone,
                name: fresh.name,
                category: fresh.category
              };
            }
            return p;
          });
        }

        setPlayers(loadedPlayers);
        setPayments(loadedPayments);
        setAttendance(JSON.parse(savedAttendance));
        setMatches(JSON.parse(savedMatches));

        if (savedAnnouncements) {
          setAnnouncements(JSON.parse(savedAnnouncements));
        } else {
          setAnnouncements(initialAnnouncements);
        }

        if (savedVouchers) {
          setVouchers(JSON.parse(savedVouchers));
        } else {
          setVouchers(getDefaultVouchers());
        }

        if (savedProfile) {
          setActiveProfile(savedProfile as any);
        }
        if (savedTeacher) {
          setLoggedTeacher(JSON.parse(savedTeacher));
        }
        if (savedParent) {
          setLoggedParent(JSON.parse(savedParent));
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
    localStorage.setItem('halcones_vouchers', JSON.stringify(vouchers));
    localStorage.setItem('halcones_active_profile', activeProfile);
    if (loggedTeacher) {
      localStorage.setItem('halcones_logged_teacher', JSON.stringify(loggedTeacher));
    } else {
      localStorage.removeItem('halcones_logged_teacher');
    }
    if (loggedParent) {
      localStorage.setItem('halcones_logged_parent', JSON.stringify(loggedParent));
    } else {
      localStorage.removeItem('halcones_logged_parent');
    }
  }, [players, payments, attendance, matches, announcements, vouchers, activeProfile, loggedTeacher, loggedParent, isDataLoaded]);

  // RESET TO DEFAULT VALUES METHOD
  const resetToInitialData = () => {
    setPlayers(initialPlayers);
    setPayments(initialPayments);
    setAttendance(initialAttendance);
    setMatches(initialMatches);
    setAnnouncements(initialAnnouncements);
    setVouchers(getDefaultVouchers());
  };

  const handleSendVoucher = (newVoucher: Omit<PaymentVoucher, 'id' | 'status' | 'createdAt'>) => {
    const voucher: PaymentVoucher = {
      ...newVoucher,
      id: `voucher_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setVouchers(prev => [voucher, ...prev]);
  };

  const handleApproveVoucher = (voucherId: string) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    setVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, status: 'approved' } : v));

    setPayments(prevPayments => {
      let updatedPayments = [...prevPayments];

      voucher.students.forEach(student => {
        student.months.forEach(month => {
          const existingIdx = updatedPayments.findIndex(p => p.playerId === student.playerId && p.month === month);
          if (existingIdx > -1) {
            updatedPayments[existingIdx] = {
              ...updatedPayments[existingIdx],
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0]
            };
          } else {
            const fee = getMonthlyFee(student.category);
            updatedPayments.push({
              id: `pay_${month.toLowerCase().substring(0, 3)}_${student.playerId}`,
              playerId: student.playerId,
              month,
              year: 2026,
              status: 'paid',
              amount: fee,
              paidDate: new Date().toISOString().split('T')[0]
            });
          }
        });
      });

      return updatedPayments;
    });
  };

  const handleRejectVoucher = (voucherId: string) => {
    setVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, status: 'rejected' } : v));
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
  // Helper to extract last 6 digits before dash from a RUT like "14.321.098-7"
  const getRutLast6BeforeDash = (rutStr: string): string => {
    const beforeDash = rutStr.split('-')[0] || '';
    const cleaned = beforeDash.replace(/\D/g, ''); // only digits
    return cleaned.slice(-6);
  };

  // Teachers enter with email and the last 6 numbers of the RUT before verified digit (the dash).
  const handleTeacherLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = teacherEmailInput.trim().toLowerCase();
    const cleanInputRut = teacherRutInput.replace(/\D/g, ''); // Extract only numbers

    if (!email || !cleanInputRut) {
      setLoginError('Complete todos los campos de credencial.');
      return;
    }

    // Profe Carlos Silva -> RUT: 14.321.098-7 (last 6 before dash is "321098")
    if (email === 'carlos.silva@loshalcones.cl') {
      const expectedCode = getRutLast6BeforeDash('14.321.098-7'); // "321098"
      if (cleanInputRut === expectedCode || cleanInputRut === '14321098') {
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

    // Maria Ortiz -> RUT: 16.543.210-9 (last 6 before dash is "543210")
    if (email === 'maria.ortiz@loshalcones.cl') {
      const expectedCode = getRutLast6BeforeDash('16.543.210-9'); // "543210"
      if (cleanInputRut === expectedCode || cleanInputRut === '16543210') {
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

    // Don Rafa (can access as trainer as well) -> RUT: 8.765.432-1 (last 6 before dash is "765432")
    if (email === 'rafa@loshalcones.cl') {
      const expectedCode = getRutLast6BeforeDash('8.765.432-1'); // "765432"
      if (cleanInputRut === expectedCode || cleanInputRut === '8765432') {
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

    setLoginError('Profesor no encontrado o clave de RUT incorrecta (deben ser los 6 últimos dígitos antes del guion).');
  };

  // Administrator Don Rafa login with email & RUT last 6 digits before dash
  const handleAdminLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = adminEmailInput.trim().toLowerCase();
    const cleanInputRut = adminRutInput.replace(/\D/g, '');

    if (!email || !cleanInputRut) {
      setLoginError('Complete todos los campos para el administrador.');
      return;
    }

    if (email === 'rafa@loshalcones.cl') {
      const expectedCode = getRutLast6BeforeDash('8.765.432-1'); // "765432"
      if (cleanInputRut === expectedCode || cleanInputRut === '8765432') {
        setActiveProfile('rafa');
        setExpandedForm('none');
        setLoginError(null);
        return;
      }
    }

    setLoginError('Credenciales de administrador incorrectas (use rafa@loshalcones.cl y clave 765432).');
  };

  // Parents enter with their name and the last 6 digits of their phone.
  const handleParentLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const name = parentNameInput.trim().toLowerCase();
    const phoneInputDigits = parentPhoneInput.trim().replace(/\D/g, '');

    if (!name || phoneInputDigits.length < 6) {
      setLoginError('Complete su nombre y los últimos 6 dígitos de su número telefónico.');
      return;
    }

    // Search players array to see if a parent matches
    const matchedPlayer = players.find(p => {
      if (p.status === 'baja') return false;
      const matchParentName = p.parentName && p.parentName.trim().toLowerCase() === name;
      const matchStudentName = p.name.trim().toLowerCase() === name;
      
      const cleanPhone = p.phone.replace(/\D/g, '');
      const last6DigitsOfPhone = cleanPhone.slice(-6);
      const matchPhone = phoneInputDigits.slice(-6) === last6DigitsOfPhone;
      
      return (matchParentName || matchStudentName) && matchPhone;
    });

    if (matchedPlayer) {
      setLoggedParent({
        parentName: matchedPlayer.parentName || matchedPlayer.name,
        phone: matchedPlayer.phone
      });
      setActiveProfile('parents');
      setLoginError(null);
    } else {
      setLoginError('No se encontró ningún registro con ese nombre de apoderado/alumno y últimos 6 dígitos de teléfono.');
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
    setAdminEmailInput('');
    setAdminRutInput('');
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
                              💡 Ejemplos autorizados: <strong className="text-slate-600">Laura Silva / 345678</strong> o <strong className="text-slate-600">Carlos Pérez / 456789</strong> (Ver guía completa abajo).
                            </div>
                            <button
                              type="submit"
                              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer text-center whitespace-nowrap"
                            >
                              Validar Credenciales
                            </button>
                          </div>
                        </form>
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
                              6 últimos números de su RUT antes del guion:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: 321098 (últimos 6 antes del -"
                              value={teacherRutInput}
                              onChange={(e) => setTeacherRutInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <div className="text-[11px] text-slate-400 font-semibold">
                              💡 Profesores autorizados: <strong className="text-slate-600">carlos.silva@loshalcones.cl / 321098</strong> o <strong className="text-slate-600">maria.ortiz@loshalcones.cl / 543210</strong>.
                            </div>
                            <button
                              type="submit"
                              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer text-center whitespace-nowrap"
                            >
                              Validar Credenciales
                            </button>
                          </div>
                        </form>
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
                        className="mt-4 pt-4 border-t border-slate-100 space-y-4 overflow-hidden"
                      >
                        <form onSubmit={handleAdminLoginSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-indigo-505" />
                              Correo del Administrador:
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="Ej: rafa@loshalcones.cl"
                              value={adminEmailInput}
                              onChange={(e) => setAdminEmailInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <Key className="w-3.5 h-3.5 text-indigo-505" />
                              6 últimos números de su RUT antes de guion:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: 765432"
                              value={adminRutInput}
                              onChange={(e) => setAdminRutInput(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold text-slate-705 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <div className="text-[11px] text-slate-400 font-semibold">
                              💡 Ingresa <strong className="text-slate-600">rafa@loshalcones.cl / 765432</strong> de prueba o presiona el botón rápido.
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProfile('rafa');
                                  setExpandedForm('none');
                                }}
                                className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer text-center"
                              >
                                Acceso Rápido
                              </button>
                              <button
                                type="submit"
                                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer text-center whitespace-nowrap"
                              >
                                Validar Administrador
                              </button>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              <div className="bg-cyan-50/20 border border-cyan-150/40 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-800 font-medium">
                <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Nota sobre el ingreso simulado:</strong> Podrás ingresar digitando las credenciales reales de cualquiera de los apoderados o profesores listados. Hemos resumido las instrucciones de ingreso de prueba en un botón desplegable abajo para tu comodidad.
                </div>
              </div>

              {/* BOTÓN DESPLEGABLE DE AYUDA DE ACCESO */}
              <div className="flex flex-col items-center justify-center pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccessGuides(!showAccessGuides)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-150/50 hover:bg-indigo-100 text-indigo-900 font-black text-xs transition-all cursor-pointer shadow-xs uppercase tracking-wider focus:outline-hidden"
                >
                  <Info className="w-4.5 h-4.5 text-indigo-600" />
                  <span>{showAccessGuides ? 'Ocultar Guía de Cuentas (Ayuda)' : 'Ver Guía de Cuentas para Ingresar'}</span>
                  <ChevronRight className={`w-4 h-4 text-indigo-600 transition-transform duration-200 ${showAccessGuides ? 'rotate-90' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {showAccessGuides && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden w-full"
                  >
                    {/* ACCESO INSTRUCTIONS PANELS INSPIRED BY SCREENSHOT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      
                      {/* 1. ADMIN / TEACHER MANUAL */}
                      <div className="bg-[#f4fcf8]/90 border border-emerald-250/50 rounded-2xl p-5 text-emerald-950 shadow-xs relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                          </div>
                          <h5 className="text-[12.5px] font-black uppercase tracking-tight text-emerald-900 font-sans">
                            INSTRUCCIONES DE ACCESO (ADMIN / DOCENTES)
                          </h5>
                        </div>
                        
                        <div className="space-y-3 text-xs text-emerald-950 font-medium font-sans">
                          {/* Admin Don Rafa */}
                          <div className="bg-white/80 border border-emerald-100 p-3 rounded-xl space-y-1">
                            <p className="font-extrabold text-emerald-900 text-xs">
                              Ingreso administrativo para Don Rafa (RUT: 8.765.432-1)
                            </p>
                            <p className="font-mono text-emerald-800 text-[10.5px] selection:bg-emerald-100">
                              Email: <strong className="font-bold text-emerald-950">rafa@loshalcones.cl</strong> &rarr; Clave (RUT): <strong className="font-black bg-emerald-100/70 px-1.5 py-0.5 rounded text-emerald-950">765432</strong>
                            </p>
                          </div>

                          {/* Profe Carlos */}
                          <div className="bg-white/80 border border-emerald-100 p-3 rounded-xl space-y-1">
                            <p className="font-extrabold text-emerald-900 text-xs">
                              Ingreso docente para Carlos Silva (RUT: 14.321.098-7)
                            </p>
                            <p className="font-mono text-emerald-800 text-[10.5px] selection:bg-emerald-100">
                              Email: <strong className="font-bold text-emerald-950">carlos.silva@loshalcones.cl</strong> &rarr; Clave (RUT): <strong className="font-black bg-emerald-100/70 px-1.5 py-0.5 rounded text-emerald-950">321098</strong>
                            </p>
                          </div>

                          {/* Dra. María */}
                          <div className="bg-white/80 border border-emerald-100 p-3 rounded-xl space-y-1">
                            <p className="font-extrabold text-emerald-900 text-xs">
                              Ingreso docente para Dra. María Ortiz (RUT: 16.543.210-9)
                            </p>
                            <p className="font-mono text-emerald-800 text-[10.5px] selection:bg-emerald-100">
                              Email: <strong className="font-bold text-emerald-950">maria.ortiz@loshalcones.cl</strong> &rarr; Clave (RUT): <strong className="font-black bg-emerald-100/70 px-1.5 py-0.5 rounded text-emerald-950">543210</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. PARENTS MANUAL */}
                      <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-5 text-slate-900 shadow-xs relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 rounded-lg bg-slate-100 text-slate-800">
                            <Info className="w-4 h-4 text-slate-600 shrink-0" />
                          </div>
                          <h5 className="text-[12.5px] font-black uppercase tracking-tight text-slate-800 font-sans">
                            GUÍA DE ACCESO (APODERADOS Y ALUMNOS INICIALES)
                          </h5>
                        </div>
                        
                        <div className="text-[11px] text-slate-500 mb-3 leading-snug">
                          Por favor, ingresa el <strong>nombre del apoderado o del alumno</strong> y los últimos 6 dígitos de su teléfono como clave:
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                          {/* Family 1 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Laura Silva</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Mateo, Lucas, Leonardo, Alan, Alejandro y Luis</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">345678</span>
                            </div>
                          </div>

                          {/* Family 2 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Carlos Pérez</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Santiago, Javier, Manuel, Carlos y Gustavo</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">456789</span>
                            </div>
                          </div>

                          {/* Family 3 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> María Ruiz</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Valentín, Sebastián, Alexis, Héctor y Gabriel</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">567890</span>
                            </div>
                          </div>

                          {/* Family 4 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Rosa Díaz</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Diego, Maximiliano, Rodrigo, Jorge y Arturo</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">678901</span>
                            </div>
                          </div>

                          {/* Family 5 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Héctor Castro</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Matías, Bryan, Fernando, Ricardo y Óscar</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">789012</span>
                            </div>
                          </div>

                          {/* Family 6 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Sonia López</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Thiago, Kevin, Christian, David y Víctor</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">890123</span>
                            </div>
                          </div>

                          {/* Family 7 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Andrés Sosa</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Daniel, Emiliano, Roberto y Miguel</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">901234</span>
                            </div>
                          </div>

                          {/* Family 8 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Gabriela Torres</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Nicolás, Alejandro, Ian, Felipe y Sergio</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">234567</span>
                            </div>
                          </div>

                          {/* Family 9 */}
                          <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2">
                            <div>
                              <p className="font-extrabold text-slate-800"> Manuel Vargas</p>
                              <p className="text-[9.5px] text-slate-500">Tutor de: <span className="font-semibold text-slate-700">Ángel, Gael, Eduardo, Josué y Francisco</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black bg-slate-100 text-indigo-700 px-2 py-1 rounded font-mono text-xs">556677</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                vouchers={vouchers}
                onAddPlayer={handleAddPlayer}
                onDeletePlayer={handleDeletePlayer}
                onTogglePayment={handleTogglePayment}
                onToggleAttendance={handleToggleAttendance}
                onAddAttendanceDate={handleAddAttendanceDate}
                onAddAnnouncement={handleAddAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onApproveVoucher={handleApproveVoucher}
                onRejectVoucher={handleRejectVoucher}
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
                vouchers={vouchers}
                onRegisterParentPayment={handleRegisterParentPayment}
                loggedParentName={loggedParent?.parentName}
                loggedParentPhone={loggedParent?.phone}
                onLogout={handleLogout}
                onSendVoucher={handleSendVoucher}
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
