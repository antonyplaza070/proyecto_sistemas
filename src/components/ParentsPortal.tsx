import { useState, useMemo, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Award, Calendar, CreditCard, Send, CheckCircle, 
  MapPin, Clock, User, Copy, Info, Coins, X, Check, Eye, LogOut
} from 'lucide-react';
import { Player, Payment, Attendance, Match, Announcement } from '../types';
import { getMonthlyFee } from '../initialData';

interface ParentsPortalProps {
  players: Player[];
  payments: Payment[];
  attendance: Attendance[];
  matches: Match[];
  announcements: Announcement[];
  onRegisterParentPayment: (playerId: string, month: string) => void;
  loggedParentName?: string;
  loggedParentPhone?: string;
  onLogout?: () => void;
}

export default function ParentsPortal({
  players,
  payments,
  attendance,
  matches,
  announcements,
  onRegisterParentPayment,
  loggedParentName,
  loggedParentPhone,
  onLogout
}: ParentsPortalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // All kids belonging to this logged-in parent
  const myTutorChildren = useMemo(() => {
    if (!loggedParentName) return [];
    return players.filter(p => 
      p.parentName && p.parentName.trim().toLowerCase() === loggedParentName.trim().toLowerCase() && p.status !== 'baja'
    );
  }, [loggedParentName, players]);

  // Auto-select child on mount if loggedParentName is provided
  useEffect(() => {
    if (loggedParentName && myTutorChildren.length > 0) {
      const alreadySelectedIsValid = myTutorChildren.some(p => p.id === selectedPlayerId);
      if (!alreadySelectedIsValid) {
        setSelectedPlayerId(myTutorChildren[0].id);
      }
    }
  }, [loggedParentName, myTutorChildren, selectedPlayerId]);
  
  // Payment Modal State
  const [payingMonth, setPayingMonth] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | 'cash'>('spei');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'success'>('form');

  // simulated payment form cards info
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  // Copied match calendar or notification tooltip
  const [hasCopiedReceipt, setHasCopiedReceipt] = useState(false);

  // Filter player list based on parent search
  const playerSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const sourcePlayers = loggedParentName ? myTutorChildren : players;
    return sourcePlayers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.parentName && p.parentName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5); // limit autocomplete to 5 results
  }, [players, searchQuery, loggedParentName, myTutorChildren]);

  // Active lookup player profile
  const selectedPlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId);
  }, [players, selectedPlayerId]);

  // Sibling detection (same parent o phone contact)
  const relatedChildren = useMemo(() => {
    if (!selectedPlayer) return [];
    return players.filter(p => 
      p.id !== selectedPlayer.id && 
      (
        (p.parentName && selectedPlayer.parentName && p.parentName.trim().toLowerCase() === selectedPlayer.parentName.trim().toLowerCase()) || 
        (p.phone && p.phone.trim() === selectedPlayer.phone.trim())
      )
    );
  }, [players, selectedPlayer]);

  const allTutorChildren = useMemo(() => {
    if (!selectedPlayer) return [];
    return [selectedPlayer, ...relatedChildren];
  }, [selectedPlayer, relatedChildren]);

  const trainersData = useMemo(() => [
    {
      category: 'Infantil',
      name: 'Profe Carlos Silva',
      role: 'Director Técnico Categoría Infantil',
      contact: '+56 9 8765 4321',
      email: 'carlos.silva@loshalcones.cl',
      avatar: 'CS',
      bg: 'bg-indigo-600',
      days: 'Lunes, Miércoles y Viernes',
      time: '14:30 - 16:00'
    },
    {
      category: 'Juvenil',
      name: 'Dra. María Ortiz',
      role: 'Directora Técnica Categoría Juvenil',
      contact: '+56 9 4567 8901',
      email: 'maria.ortiz@loshalcones.cl',
      avatar: 'MO',
      bg: 'bg-blue-600',
      days: 'Lunes, Miércoles y Viernes',
      time: '16:00 - 17:30'
    },
    {
      category: 'Adulto',
      name: 'Don Rafa Admon.',
      role: 'Director Técnico Categoría Adulto & Admin',
      contact: '+56 9 1234 5678',
      email: 'rafa@loshalcones.cl',
      avatar: 'DR',
      bg: 'bg-emerald-700',
      days: 'Lunes, Miércoles y Viernes',
      time: '17:30 - 19:00'
    }
  ], []);

  // Selected Player calculations
  const playerStats = useMemo(() => {
    if (!selectedPlayer) return null;

    const myPayments = payments.filter(pay => pay.playerId === selectedPlayer.id);
    const myAttendance = attendance.filter(att => att.playerId === selectedPlayer.id);

    const totalTrainings = myAttendance.length;
    const totalAttended = myAttendance.filter(a => a.attended).length;
    const attendancePercentage = totalTrainings > 0 ? (totalAttended / totalTrainings) * 100 : 0;

    return {
      paymentsList: myPayments,
      totalTrainings,
      totalAttended,
      attendancePercentage,
      outstandingFee: myPayments.filter(p => p.status === 'pending').length * getMonthlyFee(selectedPlayer.category)
    };
  }, [selectedPlayer, payments, attendance]);

  // Filter matches based on selected player category or show all
  const filteredMatches = useMemo(() => {
    if (!selectedPlayer) return matches;
    return matches.filter(m => m.category === selectedPlayer.category);
  }, [selectedPlayer, matches]);

  const handleSelectAutocomplete = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSearchQuery('');
  };

  const handleOpenPayment = (month: string) => {
    setPayingMonth(month);
    setPaymentStep('form');
    setPaymentMethod('spei');
    setCardNumber('');
    setCardName('');
  };

  const handleConfirmMockPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !payingMonth) return;

    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      onRegisterParentPayment(selectedPlayer.id, payingMonth);
      setIsProcessing(false);
      setPaymentStep('success');
    }, 1500);
  };

  const getReceiptText = () => {
    if (!selectedPlayer || !payingMonth) return '';
    const fee = getMonthlyFee(selectedPlayer.category);
    return `⚽ *COMPROBANTE JUGADA MAESTRA* ⚽\n\n¡Hola Don Rafa! Acabo de registrar el pago de la cuota de *${payingMonth}* por *$${fee.toLocaleString('es-CL')} CLP* para *${selectedPlayer.name}* (Categoría *${selectedPlayer.category}*).\n\nConsulte el estado actualizado en la libreta digital. ¡Muchas gracias! 🙌`;
  };

  const handleCopyReceipt = () => {
    const text = getReceiptText();
    navigator.clipboard.writeText(text);
    setHasCopiedReceipt(true);
    setTimeout(() => setHasCopiedReceipt(false), 3000);
  };

  const getWhatsAppReceiptLink = () => {
    const text = getReceiptText();
    const phone = selectedPlayer?.phone || '';
    return `https://api.whatsapp.com/send?phone=${phone.startsWith('56') ? phone : phone.startsWith('9') ? '56' + phone : '56' + phone}&text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8" id="parents-portal-root">
      
      {/* PARENTS HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-600/90 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
              Portal de Padres de Familia
            </span>
            <span className="text-cyan-300 font-medium text-xs">⚽ Club Los Halcones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            {loggedParentName ? `¡Hola, ${loggedParentName}!` : 'Jugada Maestra Digital'}
          </h2>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            {loggedParentName 
              ? `Te damos la bienvenida a tu portal de Los Halcones. Aquí puedes realizar el seguimiento de tu hijo, ver y pagar sus cuotas mensuales en tiempo real.`
              : `Consulte las asistencias, revise si está al día con sus cuotas y pague de forma segura. El tablero de Don Rafa se actualizará en tiempo real.`}
          </p>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="mt-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-[11px] cursor-pointer w-fit inline-flex"
            >
              <X className="w-3.5 h-3.5 text-cyan-300" />
              Cerrar Sesión / Salir del Portal
            </button>
          )}
        </div>

        {/* Quick select selector of players */}
        <div className="w-full md:w-72 relative z-15 shrink-0 space-y-1.5 font-sans">
          <label className="text-xs font-bold text-slate-300 block">Buscar registro de su hijo:</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 text-white"
              id="parent-search-player"
            />
          </div>

          {/* Autocomplete dropdown dropdown */}
          {playerSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-40 text-slate-700 animate-none">
              {playerSearchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectAutocomplete(p.id)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs font-semibold"
                  id={`autocomplete-p-${p.id}`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-[10px] text-slate-400">Tutor: {p.parentName}</div>
                  </div>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-slate-500 shrink-0">
                    {p.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Fallback Selector Dropdown */}
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 mt-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            id="parent-dropdown-select"
          >
            {loggedParentName ? (
              <>
                <option value="">-- Cambiar de Alumno --</option>
                {myTutorChildren.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </>
            ) : (
              <>
                <option value="">-- O elija de la lista de alumnos --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* SIBLINGS / CHILDREN PROFILE SELECTOR TABS (for logged-in parents with multiple children) */}
      {loggedParentName && myTutorChildren.length > 1 && (
        <div className="bg-slate-50 p-5 border border-slate-150 rounded-3xl space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 font-mono block">Grupo Familiar Registrado</span>
              <h3 className="text-sm font-extrabold text-slate-800">Alumnos bajo su tutela ({myTutorChildren.length})</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium font-sans">
              Haga clic en cualquiera para consultar su asistencia y mensualidades:
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myTutorChildren.map(child => {
              const isActive = selectedPlayerId === child.id;
              const childPayments = payments.filter(pay => pay.playerId === child.id && pay.year === 2026);
              const pendingCount = childPayments.filter(p => p.status === 'pending').length;
              const totalPending = pendingCount * getMonthlyFee(child.category);

              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedPlayerId(child.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white border-cyan-800 shadow-sm ring-2 ring-cyan-200/50' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                  id={`sibling-tab-${child.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs tracking-tight truncate">
                      {child.name}
                    </span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : child.category === 'Infantil' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          child.category === 'Juvenil' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {child.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-dashed border-slate-100">
                    <span className={isActive ? 'text-cyan-100 font-medium' : 'text-slate-400 font-medium'}>
                      Status:
                    </span>
                    {totalPending > 0 ? (
                      <span className={`font-black px-2 py-0.5 rounded ${
                        isActive ? 'bg-rose-500/40 text-rose-50' : 'bg-rose-50 text-rose-700'
                      }`}>
                        Debe ${totalPending.toLocaleString('es-CL')}
                      </span>
                    ) : (
                      <span className={`font-black px-2 py-0.5 rounded ${
                        isActive ? 'bg-cyan-500/30 text-white' : 'bg-cyan-50 text-cyan-700'
                      }`}>
                        Al Día 👍
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* THREE PANELS LAYOUT: PROFILE PROFILE, CALENDAR CALENDAR, RECENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ===================== COLUMN 1: PLAYER CARD (SELECTED VALUE) ===================== */}
        <div className="lg:col-span-1 space-y-6">
          <AnimatePresence mode="wait">
            {loggedParentName ? (
              <div className="space-y-6">
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-200 block text-center">
                  Información por Estudiante ({myTutorChildren.length})
                </span>
                
                {myTutorChildren.map(child => {
                  const childPaymentsList = payments.filter(pay => pay.playerId === child.id);
                  const childAttendanceList = attendance.filter(att => att.playerId === child.id);
                  const childTotalTrainings = childAttendanceList.length;
                  const childTotalAttended = childAttendanceList.filter(a => a.attended).length;
                  const childAttendancePercentage = childTotalTrainings > 0 ? (childTotalAttended / childTotalTrainings) * 100 : 0;
                  const childOutstandingFee = childPaymentsList.filter(p => p.status === 'pending').length * getMonthlyFee(child.category);

                  return (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-3xl border border-slate-150 p-5 shadow-xs space-y-5 relative overflow-hidden"
                      id={`player-card-${child.id}`}
                    >
                      {/* Visual Identity Watermark */}
                      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full pointer-events-none" />

                      {/* Athlete identity head */}
                      <div className="flex items-center gap-3 relative">
                        <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm border border-emerald-500/15">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <span className={`text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                            child.category === 'Infantil' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            child.category === 'Juvenil' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            Categoría {child.category}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight mt-1">{child.name}</h3>
                          <div className="text-[10px] text-slate-400">Celular registrado: {child.phone}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Attendance Score Box */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 block tracking-tight">Asistencia Junio</span>
                          <div className="flex items-end gap-1">
                            <span className="text-lg font-black text-slate-800">{childTotalAttended}</span>
                            <span className="text-[10px] text-slate-400 font-bold">de {childTotalTrainings}</span>
                          </div>
                          {/* Tiny inline indicator bar */}
                          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${childAttendancePercentage}%` }} />
                          </div>
                        </div>

                        {/* Pending Balance Box */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 block tracking-tight">Saldo Pendiente</span>
                          <div className="text-lg font-black text-rose-600 leading-none mt-1">
                            ${childOutstandingFee.toLocaleString('es-CL')} CLP
                          </div>
                          <span className="text-[8px] text-slate-400">Total a la fecha</span>
                        </div>
                      </div>

                      {/* MONTH BY MONTH STATEMENT MATIX CARD */}
                      <div className="space-y-2 pt-1 border-t border-slate-100/60">
                        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Historial de Cuotas</h4>
                        
                        <div className="space-y-1.5">
                          {childPaymentsList.map((pay) => {
                            const isPaid = pay.status === 'paid';
                            const fee = getMonthlyFee(child.category);
                            
                            return (
                              <div key={pay.id} className="flex justify-between items-center p-2.5 border border-slate-50 hover:bg-slate-50/50 rounded-xl transition-all">
                                <div>
                                  <span className="font-bold text-xs text-slate-700 block">{pay.month} {pay.year}</span>
                                  <span className="text-[10px] text-slate-400">${fee.toLocaleString('es-CL')} CLP por alumno</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isPaid ? (
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px] tracking-tight px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                                      <Check className="w-3 h-3 stroke-[3]" /> RECIBIDO
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedPlayerId(child.id);
                                        handleOpenPayment(pay.month);
                                      }}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] tracking-tight px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-all animate-pulse hover:animate-none cursor-pointer"
                                      id={`pay-btn-${child.id}-${pay.month}`}
                                    >
                                      Pagar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : !selectedPlayer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-center items-center text-center space-y-4 h-full min-h-[350px]"
                id="no-player-selected-panel"
              >
                <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 leading-snug">
                    Consulte el Status del Alumno
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Escriba el nombre de su hijo o deudor en el selector superior para conocer de inmediato su histórico mensual de pagos y asistencias.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 relative overflow-hidden"
                id={`player-card-${selectedPlayer.id}`}
              >
                {/* Visual Identity Watermark */}
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full pointer-events-none" />

                {/* Athlete identity head */}
                <div className="flex items-center gap-4 relative">
                  <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md border border-emerald-500/20">
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                      selectedPlayer.category === 'Infantil' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                      selectedPlayer.category === 'Juvenil' ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' :
                      'bg-blue-50 text-blue-800 border border-blue-100'
                    }`}>
                      Categoría {selectedPlayer.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800 font-sans tracking-tight mt-1">{selectedPlayer.name}</h3>
                    <div className="text-[10px] text-slate-400">Tutor: {selectedPlayer.parentName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Attendance Score Box */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-tight">Asistencia Junio</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-extrabold text-slate-800">{playerStats?.totalAttended}</span>
                      <span className="text-xs text-slate-400 font-bold">de {playerStats?.totalTrainings} entrenos</span>
                    </div>
                    {/* Tiny inline indicator bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${playerStats?.attendancePercentage}%` }} />
                    </div>
                  </div>

                  {/* Pending Balance Box */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-tight">Saldo Pendiente</span>
                    <div className="text-xl font-extrabold text-rose-600 leading-none mt-1">
                      ${playerStats?.outstandingFee?.toLocaleString('es-CL')} CLP
                    </div>
                    <span className="text-[9px] text-slate-400 leading-none">A la fecha actual</span>
                  </div>
                </div>

                {/* MONTH BY MONTH STATEMENT MATIX CARD */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Historial de Cuotas Mensuales</h4>
                  
                  <div className="space-y-2.5">
                    {playerStats?.paymentsList.map((pay) => {
                      const isPaid = pay.status === 'paid';
                      const fee = getMonthlyFee(selectedPlayer.category);
                      
                      return (
                        <div key={pay.id} className="flex justify-between items-center p-3 border border-slate-50 hover:bg-slate-50/50 rounded-xl transition-all">
                          <div>
                            <span className="font-bold text-sm text-slate-700 block">{pay.month} {pay.year}</span>
                            <span className="text-[10px] text-slate-400">${fee.toLocaleString('es-CL')} CLP por alumno</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] tracking-tight px-3 py-1 rounded-lg flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> RECIBIDO
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenPayment(pay.month)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] tracking-tight px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all animate-pulse hover:animate-none cursor-pointer"
                                id={`pay-btn-${pay.month}`}
                              >
                                Pagar Cuota
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================== COLUMN 2 & 3: CALENDAR OF GAMES ===================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ===================== 📢 ANNOUNCEMENTS AND TRAINERS PANEL ===================== */}
          {!selectedPlayer ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <span className="text-xl">📢</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-sans">
                    Últimos Comunicados de Los Halcones
                  </h3>
                  <p className="text-[11px] text-slate-400">Noticias generales del club publicadas por Don Rafa</p>
                </div>
              </div>

              <div className="space-y-3">
                {announcements.filter(a => a.active && a.category === 'General').length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-4">No hay comunicados generales activos en este momento.</p>
                ) : (
                  announcements.filter(a => a.active && a.category === 'General').map(ann => {
                    let cardBg = "bg-blue-50/30 border-blue-100 text-blue-900";
                    if (ann.type === 'cancel') cardBg = "bg-rose-50/30 border-rose-100 text-rose-950";
                    if (ann.type === 'warning') cardBg = "bg-amber-50/30 border-amber-100 text-amber-950";
                    if (ann.type === 'success') cardBg = "bg-emerald-50/30 border-emerald-100 text-emerald-950";

                    return (
                      <div key={ann.id} className={`p-4 rounded-2xl border ${cardBg} space-y-1.5`}>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tight">
                          <span className="font-mono text-slate-400 font-medium">📅 {ann.date.split('-').reverse().join('/')}</span>
                          <span className="bg-white/85 px-2 py-0.5 rounded border border-slate-200">General</span>
                        </div>
                        <h4 className="font-extrabold text-sm">{ann.title}</h4>
                        <p className="text-xs leading-relaxed text-slate-605 text-slate-600">{ann.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 font-sans flex items-center gap-2">
                  <span>🧑‍🏫</span> Cuerpo Técnico y Clases Correspondientes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Revise los profesores designados, horarios de entrenamientos y notificaciones o avisos ocasionales de su grupo familiar.
                </p>
              </div>

              {relatedChildren.length > 0 && (
                <div className="bg-emerald-50/35 border border-emerald-100/70 rounded-2xl px-4 py-2.5 text-xs text-emerald-800">
                  💡 <strong>Grupo Familiar Detectado:</strong> Hemos agrupado automáticamente los datos de {allTutorChildren.length} alumnos registrados bajo el tutor <strong>{selectedPlayer.parentName}</strong> ({selectedPlayer.phone}) para su comodidad.
                </div>
              )}

              <div className="space-y-6">
                {allTutorChildren.map(child => {
                  const trainer = trainersData.find(t => t.category === child.category);
                  const childAnnouncements = announcements.filter(a => a.active && (a.category === child.category || a.category === 'General'));

                  return (
                    <div key={child.id} className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4.5 space-y-4" id={`child-box-${child.id}`}>
                      {/* Sub-header child */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Alumno</span>
                          <h4 className="font-extrabold text-sm text-slate-800 mt-1">{child.name}</h4>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          child.category === 'Infantil' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                          child.category === 'Juvenil' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        }`}>
                          Categoría {child.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TEACHER DETAILS */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${trainer?.bg} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                              {trainer?.avatar}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-xs text-slate-800 leading-tight">{trainer?.name}</h5>
                              <p className="text-[10px] text-slate-400 font-medium">{trainer?.role}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{trainer?.days}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{trainer?.time} hrs</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 text-slate-500">
                            <a href={`tel:${trainer?.contact}`} className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold">
                              📞 Llamar
                            </a>
                            <span className="truncate max-w-[130px]" title={trainer?.email}>{trainer?.email}</span>
                          </div>
                        </div>

                        {/* SPECIFIC AND GENERAL ANNOUNCEMENTS */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Notificaciones & Estado Ocasional:</span>
                          
                          {childAnnouncements.length === 0 ? (
                            <div className="p-4 bg-white/50 border border-dashed border-slate-150 rounded-xl text-center text-[10px] text-slate-500 font-medium py-6 leading-relaxed">
                              ✅ Entrenamiento sin novedades. ¡Los bloques se impartirán normalmente el día de hoy!
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {childAnnouncements.map(ann => {
                                let cardBg = "bg-blue-50/20 border-blue-100 text-blue-900";
                                let icon = "ℹ️";
                                if (ann.type === 'cancel') {
                                  cardBg = "bg-rose-50/30 border-rose-100 text-rose-950";
                                  icon = "🚨";
                                } else if (ann.type === 'warning') {
                                  cardBg = "bg-amber-50/30 border-amber-100 text-amber-950";
                                  icon = "⚠️";
                                } else if (ann.type === 'success') {
                                  cardBg = "bg-emerald-50/30 border-emerald-100 text-emerald-950";
                                  icon = "🎉";
                                }

                                return (
                                  <div key={ann.id} className={`p-3 rounded-xl border ${cardBg} text-xs space-y-1`} id={`ann-box-${ann.id}`}>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                      <span>{icon} {ann.type === 'cancel' ? 'SITUACIÓN OCASIONAL' : 'Remitente'}</span>
                                      <span className="font-mono">{ann.date.split('-').reverse().join('/')}</span>
                                    </div>
                                    <h6 className="font-extrabold text-slate-900">{ann.title}</h6>
                                    <p className="text-[11px] leading-relaxed text-slate-600">{ann.message}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="match-calendar-panel">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 font-sans flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Calendario de Partidos del Fin de Semana
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manténgase al día del lugar de cita, campos y hora del partido de 'Los Halcones' del Barrio.
                </p>
              </div>

              {selectedPlayer && (
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100/50">
                  Mostrando categoría: {selectedPlayer.category}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMatches.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                  No hay partidos registrados para esta categoría.
                </div>
              ) : (
                filteredMatches.map((m) => {
                  let badgeColors = 'bg-blue-50 text-blue-700 border-blue-100/50';
                  if (m.type === 'Liga') badgeColors = 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
                  if (m.type === 'Copa') badgeColors = 'bg-amber-50 text-amber-700 border-amber-100/50';

                  return (
                    <div
                      key={m.id}
                      className="bg-white hover:bg-slate-50/50 border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                      id={`match-box-${m.id}`}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                          {m.date.split('-').reverse().join('/')}
                        </span>
                        <span className={`text-[9px] uppercase font-extrabold tracking-wider border px-2 py-0.5 rounded-full ${badgeColors}`}>
                          Torneo de {m.type}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" /> Categoria {m.category}
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-md tracking-tight">
                          Los Halcones vs {m.opponent}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400 text-emerald-600" />
                          <span>{m.time} hrs</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 text-emerald-600 shrink-0" />
                          <span className="truncate" title={m.field}>{m.field}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedPlayer && (
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedPlayerId('')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  id="btn-show-all-matches"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver partidos de todas las categorías
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===================== SIMULATED CHECKOUT MODAL WINDOW ===================== */}
      <AnimatePresence>
        {payingMonth !== null && selectedPlayer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-slate-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPayingMonth(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                id="close-pay-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentStep === 'form' ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Simulación Transacción</span>
                    <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard className="w-5.5 h-5.5 text-emerald-700 shrink-0" />
                      Pago Cuota Mensual
                    </h4>
                    <p className="text-xs text-slate-400">
                      Liquidando cuota de <strong>{payingMonth} 2026</strong> por el alumno <strong>{selectedPlayer.name}</strong>.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center text-sm font-bold text-emerald-900">
                    <span>Monto a Transferir</span>
                    <span className="text-lg font-extrabold text-emerald-800">${getMonthlyFee(selectedPlayer.category).toLocaleString('es-CL')} CLP</span>
                  </div>

                  {/* Payment method selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 block">Forma de pago simulada:</label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('spei')}
                        className={`p-3 border rounded-xl cursor-pointer select-none text-center flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'spei' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        id="pay-opt-spei"
                      >
                        <Coins className="w-4 h-4 text-emerald-700" />
                        Transf. Bancaria
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 border rounded-xl cursor-pointer select-none text-center flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'card' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        id="pay-opt-card"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        Tarjeta Simulada
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 border rounded-xl cursor-pointer select-none text-center flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'cash' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        id="pay-opt-cash"
                      >
                        <User className="w-4 h-4 text-emerald-700" />
                        Efectivo a Rafa
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmMockPayment} className="space-y-4 pt-1">
                    {paymentMethod === 'spei' && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-slate-500" /> Datos de Transferencia de Los Halcones
                        </span>
                        <div>Banco: <strong className="text-slate-800">BancoEstado (Chile)</strong></div>
                        <div>Tipo de Cuenta: <strong className="text-slate-800">CuentaRUT / Cuenta Vista</strong></div>
                        <div>RUT Titular: <strong className="text-slate-800">12.345.678-9</strong></div>
                        <div>Número de Cuenta: <strong className="text-slate-800 select-all tracking-wider font-mono bg-white px-2 py-0.5 rounded border border-slate-200">12345678</strong></div>
                        <p className="text-[10px] text-slate-400 mt-2 block italic">Copie la CuentaRUT para realizar la simulación en el sistema.</p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-3 font-sans">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">Número de Tarjeta (Prueba)</label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            id="pay-card-number"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">Nombre en Tarjeta</label>
                          <input
                            type="text"
                            required
                            placeholder="Nombre del Tutor"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            id="pay-card-name"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cash' && (
                      <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl text-xs text-amber-900 leading-normal flex gap-2">
                        <Info className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
                        <p>Al seleccionar efectivó, la cuota quedará pagada para fines demostrativos en esta app. Recuerde entregar el dinero a Don Rafa en el próximo entrenamiento de fútbol para registrar oficialmente el visto bueno.</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setPayingMonth(null)}
                        className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 cursor-pointer text-center"
                        id="cancel-pay-btn"
                      >
                        Regresar
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        id="submit-pay-btn"
                      >
                        {isProcessing ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Simular Pago'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // SUCCESS SCREEN
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">¡Pago Simulado Exitosamente!</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      La cuota de <strong>{payingMonth} 2026</strong> por <strong>${getMonthlyFee(selectedPlayer.category).toLocaleString('es-CL')} CLP</strong> se ha actualizado en el cuaderno digital de Don Rafa de inmediato.
                    </p>
                  </div>

                  {/* Copy WhatsApp receipt block */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">
                      Mensaje de comprobación para Don Rafa:
                    </span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-3 rounded-xl border border-slate-100 select-all whitespace-pre-line">
                      {getReceiptText()}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyReceipt}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all relative"
                        id="btn-copy-receipt"
                      >
                        {hasCopiedReceipt ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{hasCopiedReceipt ? '¡Copiado!' : 'Copiar Texto'}</span>
                      </button>
                      <a
                        href={getWhatsAppReceiptLink()}
                        target="_blank"
                        rel="noreferrer referrer"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                        id="btn-send-receipt-whatsapp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp Rafa</span>
                      </a>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setPayingMonth(null)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer text-center"
                      id="btn-finish-pay-modal"
                    >
                      Entendido y Cerrar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
