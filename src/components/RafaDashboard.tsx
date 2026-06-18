import React, { useState, useMemo, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, DollarSign, Calendar, TrendingUp, TrendingDown, 
  Search, Plus, Copy, Check, CheckCircle, 
  X, AlertTriangle, Trash2, UserPlus, FileSpreadsheet, Award, Send,
  Clock, MapPin, Trophy, Shield, Info, Edit3, Mail, ChevronDown, ChevronUp
} from 'lucide-react';
import { Player, Payment, Attendance, Category, Match, Announcement, PaymentVoucher } from '../types';
import { getMonthlyFee } from '../initialData';
import MetricCard from './MetricCard';
import AttendanceChart from './AttendanceChart';

interface RafaDashboardProps {
  players: Player[];
  payments: Payment[];
  attendance: Attendance[];
  matches: Match[];
  announcements: Announcement[];
  vouchers: PaymentVoucher[];
  onAddPlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onTogglePayment: (playerId: string, month: string, year: number) => void;
  onToggleAttendance: (playerId: string, date: string) => void;
  onAddAttendanceDate: (date: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onUpdateAnnouncement: (id: string, updated: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onApproveVoucher: (id: string) => void;
  onRejectVoucher: (id: string) => void;
}

export default function RafaDashboard({
  players,
  payments,
  attendance,
  matches,
  announcements,
  vouchers,
  onAddPlayer,
  onDeletePlayer,
  onTogglePayment,
  onToggleAttendance,
  onAddAttendanceDate,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onApproveVoucher,
  onRejectVoucher
}: RafaDashboardProps) {
  // Main Tab Navigation following screenshot layout
  // 'calendario' | 'asistencia' | 'alumnos' | 'finanzas' | 'inscripcion'
  const [activeTab, setActiveTab] = useState<'calendario' | 'asistencia' | 'alumnos' | 'finanzas' | 'inscripcion'>('finanzas');
  const [previewingVoucher, setPreviewingVoucher] = useState<PaymentVoucher | null>(null);
  
  // Roster Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [isParentsDirectoryExpanded, setIsParentsDirectoryExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'Todos'>('Todos');
  const [paymentFilter, setPaymentFilter] = useState<'Todos' | 'AlDia' | 'Debe'>('Todos');
  const [matrixYearFilter, setMatrixYearFilter] = useState<number>(2026);

  // Matches search / filter
  const [matchSearchQuery, setMatchSearchQuery] = useState('');
  const [matchCategoryFilter, setMatchCategoryFilter] = useState<Category | 'Todos'>('Todos');
  const [localMatches, setLocalMatches] = useState<Match[]>([]);

  // Combining prop matches with locally scheduled ones
  const allMatchesList = useMemo(() => {
    return [...matches, ...localMatches];
  }, [matches, localMatches]);

  // Attendance Form Filters
  const attendanceDates = useMemo(() => {
    return Array.from(new Set(attendance.map(a => a.date))).sort((a, b) => b.localeCompare(a)); 
  }, [attendance]);

  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(attendanceDates[0] || '2026-06-15');
  const [attendanceCategoryFilter, setAttendanceCategoryFilter] = useState<Category>('Infantil');
  
  // States for new entries
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerCategory, setNewPlayerCategory] = useState<Category>('Infantil');
  const [newPlayerParentName, setNewPlayerParentName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');

  const [newDateValue, setNewDateValue] = useState('');
  const [isAddingDate, setIsAddingDate] = useState(false);

  // States for scheduling a match
  const [isSchedulingMatch, setIsSchedulingMatch] = useState(false);
  const [matchOpponent, setMatchOpponent] = useState('');
  const [matchCategory, setMatchCategory] = useState<Category>('Infantil');
  const [matchDate, setMatchDate] = useState('2026-06-25');
  const [matchTime, setMatchTime] = useState('10:00');
  const [matchField, setMatchField] = useState('Campo Municipal 1');
  const [matchType, setMatchType] = useState<'Liga' | 'Amistoso' | 'Copa'>('Liga');

  // States for new announcements
  const [isAddingAnn, setIsAddingAnn] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<Category | 'General'>('General');
  const [annType, setAnnType] = useState<'info' | 'cancel' | 'warning' | 'success'>('info');

  // Refactored Calendario states and data
  const [calendarSubMode, setCalendarSubMode] = useState<'partidos' | 'entrenamientos'>('partidos');
  const [matchStatusFilter, setMatchStatusFilter] = useState<'por_jugar' | 'jugados'>('por_jugar');
  const [selectedTrainerId, setSelectedTrainerId] = useState<'rafa' | 'carlos' | 'maria'>('carlos');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Junio por defecto

  // States for financial filtering
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState<Category | 'Todos'>('Todos');
  const [financeMonthFilter, setFinanceMonthFilter] = useState<string>('General');
  const [financeYearFilter, setFinanceYearFilter] = useState<string>('General');

  // Auto-sync matchDate default to the user's selected calendar month & year
  useEffect(() => {
    setMatchDate(`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-20`);
  }, [selectedMonth, selectedYear]);

  const playedMatches = useMemo<Match[]>(() => [
    { id: 'm-p1', category: 'Infantil', opponent: 'Real Colmena FC (Filial)', date: '2026-06-06', time: '10:00', field: 'Cancha Recoleta (Pasto Natural)', type: 'Liga' },
    { id: 'm-p2', category: 'Adulto', opponent: 'Santiago Wanderers Amateurs', date: '2026-06-07', time: '14:30', field: 'Cancha Cordillera N° 2', type: 'Liga' },
    { id: 'm-p3', category: 'Juvenil', opponent: 'Magallanes Junior San Bernardo', date: '2026-06-13', time: '11:00', field: 'Complejo Las Golondrinas', type: 'Copa' },
    { id: 'm-p4', category: 'Infantil', opponent: 'Audax Italiano Escuela', date: '2026-06-14', time: '09:30', field: 'Estadio del Barrio', type: 'Amistoso' }
  ], []);

  const getMatchScore = useMemo(() => {
    return (matchId: string) => {
      const scores: Record<string, { score: string; result: 'win' | 'loss' | 'draw'; text: string }> = {
        'm-p1': { score: '3 - 1', result: 'win', text: 'Victoria' },
        'm-p2': { score: '2 - 2', result: 'draw', text: 'Empate' },
        'm-p3': { score: '1 - 0', result: 'win', text: 'Victoria' },
        'm-p4': { score: '4 - 2', result: 'win', text: 'Victoria' }
      };
      return scores[matchId] || { score: 'Por jugar', result: 'draw', text: 'Pendiente' };
    };
  }, []);

  const trainersSchedule = useMemo(() => [
    {
      id: 'carlos',
      name: 'Profe Carlos Silva',
      role: 'Director Técnico Categoría Infantil',
      category: 'Infantil',
      avatar: 'CS',
      rut: '14.321.098-7',
      email: 'carlos.silva@loshalcones.cl',
      phone: '+56 9 8765 4321',
      bgAvatar: 'bg-indigo-600',
      days: ['Lunes', 'Miércoles', 'Viernes'],
      time: '14:30 - 16:00',
      duration: '1 hora 30 minutos',
      field: 'Cancha Municipal N° 1 (Estadio Principal)',
      description: 'Enfoque formativo básico, desarrollo de habilidades psicomotrices, control de balón elemental y un grato ambiente de compañerismo.',
      colorTheme: 'indigo'
    },
    {
      id: 'maria',
      name: 'Dra. María Ortiz',
      role: 'Directora Técnica Categoría Juvenil',
      category: 'Juvenil',
      avatar: 'MO',
      rut: '16.543.210-9',
      email: 'maria.ortiz@loshalcones.cl',
      phone: '+56 9 4567 8901',
      bgAvatar: 'bg-blue-600',
      days: ['Lunes', 'Miércoles', 'Viernes'],
      time: '16:00 - 17:30',
      duration: '1 hora 30 minutos',
      field: 'Complejo Las Golondrinas (Luz Artificial)',
      description: 'Preparación física intensiva, disciplina de campo, ejercicios grupales de posesión y fundamentos tácticos avanzados de competición.',
      colorTheme: 'blue'
    },
    {
      id: 'rafa',
      name: 'Don Rafa Admon.',
      role: 'Director Técnico Categoría Adulto & Admin',
      category: 'Adulto',
      avatar: 'DR',
      rut: '8.765.432-1',
      email: 'rafa@loshalcones.cl',
      phone: '+56 9 1234 5678',
      bgAvatar: 'bg-cyan-600',
      days: ['Lunes', 'Miércoles', 'Viernes'],
      time: '17:30 - 19:00',
      duration: '1 hora 30 minutos',
      field: 'Cancha Cordillera (Césped Natural)',
      description: 'Estrategia de juego avanzada, análisis táctico del rival, definición, acondicionamiento de alta competencia y partidos de entrenamiento.',
      colorTheme: 'cyan'
    }
  ], []);

  // Copied reminder state
  const [copiedPlayerId, setCopiedPlayerId] = useState<string | null>(null);

  // Growth / revenue calculations
  const currentMonthRevenue = useMemo(() => {
    return payments
      .filter(p => p.month === 'Junio' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const previousMonthRevenue = useMemo(() => {
    return payments
      .filter(p => p.month === 'Mayo' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const revenueGrowthPercentage = useMemo(() => {
    if (previousMonthRevenue === 0) return 100;
    const diff = currentMonthRevenue - previousMonthRevenue;
    return parseFloat(((diff / previousMonthRevenue) * 100).toFixed(1));
  }, [currentMonthRevenue, previousMonthRevenue]);

  const totalExpectedJuneRevenue = useMemo(() => {
    return players.reduce((sum, p) => sum + getMonthlyFee(p.category), 0);
  }, [players]);

  const outstandingJuneDebt = useMemo(() => {
    const totalPaid = payments
      .filter(p => p.month === 'Junio' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, totalExpectedJuneRevenue - totalPaid);
  }, [payments, players, totalExpectedJuneRevenue]);

  // Dynamic financial metrics for TAB 4 (Finanzas)
  const financeMetrics = useMemo(() => {
    const matchedPlayers = players.filter(p => {
      return financeCategoryFilter === 'Todos' || p.category === financeCategoryFilter;
    });

    const activeInMatched = matchedPlayers.filter(p => p.status !== 'baja');
    const bajaInMatched = matchedPlayers.filter(p => p.status === 'baja');

    const matchedPlayerIds = matchedPlayers.map(p => p.id);

    const matchedPayments = payments.filter(pay => {
      if (!matchedPlayerIds.includes(pay.playerId)) return false;
      if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
      if (financeMonthFilter !== 'General' && pay.month !== financeMonthFilter) return false;
      return true;
    });

    const totalRevenue = matchedPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate previous period for trend
    let prevRevenue = 0;
    if (financeMonthFilter !== 'General') {
      const MONTHS_ORDER = ['Marzo', 'Abril', 'Mayo', 'Junio'];
      const idx = MONTHS_ORDER.indexOf(financeMonthFilter);
      if (idx > 0) {
        const prevMonth = MONTHS_ORDER[idx - 1];
        const prevPayments = payments.filter(pay => {
          if (!matchedPlayerIds.includes(pay.playerId)) return false;
          if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
          return pay.month === prevMonth;
        });
        prevRevenue = prevPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
      } else {
        prevRevenue = 0;
      }
    } else {
      const junPaid = payments.filter(pay => {
        if (!matchedPlayerIds.includes(pay.playerId)) return false;
        if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
        return pay.month === 'Junio';
      }).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

      const mayPaid = payments.filter(pay => {
        if (!matchedPlayerIds.includes(pay.playerId)) return false;
        if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
        return pay.month === 'Mayo';
      }).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

      prevRevenue = mayPaid;
    }

    let growthPct = 0;
    if (prevRevenue > 0) {
      growthPct = parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));
    } else if (totalRevenue > 0) {
      growthPct = 100;
    }

    // Outstanding debt: pending payments matching our filters
    const outstandingDebt = matchedPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // Alumnos al dia vs atrasados (only active ones are chased)
    let alDiaCount = 0;
    let atrasadoCount = 0;

    activeInMatched.forEach(p => {
      const playerPays = payments.filter(pay => pay.playerId === p.id);
      const filteredPlayerPays = playerPays.filter(pay => {
        if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
        if (financeMonthFilter !== 'General' && pay.month !== financeMonthFilter) return false;
        return true;
      });

      const hasPending = filteredPlayerPays.some(pay => pay.status === 'pending');
      if (hasPending) {
        atrasadoCount++;
      } else {
        alDiaCount++;
      }
    });

    return {
      totalRevenue,
      prevRevenue,
      growthPct,
      outstandingDebt,
      alDiaCount,
      atrasadoCount,
      activeCount: activeInMatched.length,
      bajaCount: bajaInMatched.length
    };
  }, [players, payments, financeCategoryFilter, financeMonthFilter, financeYearFilter]);

  // Annual Trend Data for Bar & Line graph
  const annualFinanceData = useMemo(() => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return months.map(m => {
      const getRevenueForCat = (cat: Category) => {
        return payments
          .filter(p => {
            const player = players.find(pl => pl.id === p.playerId);
            if (!player) return false;
            if (player.category !== cat) return false;
            if (p.month !== m) return false;
            if (financeYearFilter !== 'General' && p.year !== Number(financeYearFilter)) return false;
            return p.status === 'paid';
          })
          .reduce((sum, p) => sum + p.amount, 0);
      };

      const infantil = getRevenueForCat('Infantil');
      const juvenil = getRevenueForCat('Juvenil');
      const adulto = getRevenueForCat('Adulto');
      const total = infantil + juvenil + adulto;

      return {
        month: m,
        Infantil: infantil,
        Juvenil: juvenil,
        Adulto: adulto,
        total: total
      };
    });
  }, [payments, players, financeYearFilter]);

  // Dynamic explanations and stats computed for the financial category legend at bottom of chart
  const categoryExplanations = useMemo(() => {
    const getStats = (cat: Category) => {
      const catPlayers = players.filter(p => p.category === cat);
      const activeCount = catPlayers.filter(p => p.status !== 'baja').length;
      const bajaCount = catPlayers.filter(p => p.status === 'baja').length;
      
      const paidSum = payments
        .filter(pay => {
          const p = players.find(pl => pl.id === pay.playerId);
          if (!p || p.category !== cat) return false;
          if (financeYearFilter !== 'General' && pay.year !== Number(financeYearFilter)) return false;
          return pay.status === 'paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);

      return { activeCount, bajaCount, paidSum };
    };

    return {
      Infantil: {
        color: 'bg-sky-400 border-sky-400 text-sky-600',
        fillColor: 'bg-sky-50/40 border-sky-100',
        iconColor: 'text-sky-500',
        title: 'Categoría Infantil (Menores)',
        desc: 'Formación lúdico-deportiva para niños y niñas en etapa escolar. Centrado en hábitos saludables, diversión y habilidades iniciales.',
        ...getStats('Infantil')
      },
      Juvenil: {
        color: 'bg-indigo-500 border-indigo-400 text-indigo-600',
        fillColor: 'bg-indigo-50/35 border-indigo-100',
        iconColor: 'text-indigo-500',
        title: 'Categoría Juvenil (Media)',
        desc: 'Desarrollo de habilidades técnicas, tácticas de juego competitivas y optimización física para jóvenes deportistas de nivel medio.',
        ...getStats('Juvenil')
      },
      Adulto: {
        color: 'bg-emerald-500 border-emerald-400 text-emerald-600',
        fillColor: 'bg-emerald-50/30 border-emerald-100',
        iconColor: 'text-emerald-500',
        title: 'Categoría Adultos (Senior)',
        desc: 'Entrenamientos adaptados de alto rendimiento físico y táctico, recreativo avanzado o iniciación técnica para deportistas adultos.',
        ...getStats('Adulto')
      }
    };
  }, [players, payments, financeYearFilter]);

  // Attendance progress stats
  const categoryAttendanceStats = useMemo(() => {
    const categories: Category[] = ['Infantil', 'Juvenil', 'Adulto'];
    
    return categories.map(cat => {
      const catPlayerIds = players.filter(p => p.category === cat).map(p => p.id);
      const catAttendance = attendance.filter(a => catPlayerIds.includes(a.playerId));
      
      const totalPresent = catAttendance.filter(a => a.attended).length;
      const totalPossible = catAttendance.length || 1;
      const percentage = (totalPresent / totalPossible) * 100;

      let color = 'bg-emerald-500';
      let shadowColor = 'rgba(16, 185, 129, 0.4)';
      let borderColor = 'border-emerald-500';
      if (cat === 'Juvenil') {
        color = 'bg-indigo-500';
        shadowColor = 'rgba(99, 102, 241, 0.4)';
        borderColor = 'border-indigo-500';
      } else if (cat === 'Adulto') {
        color = 'bg-blue-500';
        shadowColor = 'rgba(59, 130, 246, 0.4)';
        borderColor = 'border-blue-500';
      }

      return {
        category: cat,
        percentage,
        totalPresent,
        totalPossible,
        color,
        shadowColor,
        borderColor
      };
    });
  }, [attendance, players]);

  // Debtors identification (who owes history)
  const debtorPlayers = useMemo(() => {
    const debtors: { player: Player; pendingMonths: string[]; totalOwed: number }[] = [];

    players.filter(p => p.status !== 'baja').forEach(p => {
      const playerPayments = payments.filter(pay => pay.playerId === p.id);
      const pendingPayments = playerPayments.filter(pay => pay.status === 'pending');
      
      if (pendingPayments.length > 0) {
        const pendingMonths = pendingPayments.map(pay => pay.month);
        const fee = getMonthlyFee(p.category);
        const totalOwed = pendingPayments.length * fee;

        debtors.push({
          player: p,
          pendingMonths,
          totalOwed
        });
      }
    });

    return debtors.sort((a, b) => b.totalOwed - a.totalOwed || a.player.name.localeCompare(b.player.name));
  }, [players, payments]);

  const upToDateCount = useMemo(() => {
    const activeCount = players.filter(p => p.status !== 'baja').length;
    return Math.max(0, activeCount - debtorPlayers.length);
  }, [players, debtorPlayers]);

  // Players grid list
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (p.status === 'baja') return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.parentName && p.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
      
      const hasDebtForSelectedYear = payments.some(
        pay => pay.playerId === p.id && pay.year === matrixYearFilter && pay.status === 'pending'
      );

      const matchesPayment = paymentFilter === 'Todos' || 
                             (paymentFilter === 'AlDia' && !hasDebtForSelectedYear) || 
                             (paymentFilter === 'Debe' && hasDebtForSelectedYear);

      return matchesSearch && matchesCategory && matchesPayment;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [players, payments, searchQuery, categoryFilter, paymentFilter, matrixYearFilter]);

  // Attendance checklist filtered list
  const attendanceRoster = useMemo(() => {
    return players
      .filter(p => p.status !== 'baja' && p.category === attendanceCategoryFilter)
      .map(p => {
        const attRecord = attendance.find(a => a.playerId === p.id && a.date === selectedAttendanceDate);
        return {
          player: p,
          attended: attRecord ? attRecord.attended : false
        };
      })
      .sort((a, b) => a.player.name.localeCompare(b.player.name));
  }, [players, attendance, attendanceCategoryFilter, selectedAttendanceDate]);

  // WhatsApp link generator
  const getWhatsAppLink = (p: Player, pendingMonths: string[], totalOwed: number) => {
    const parent = p.parentName && p.parentName !== 'Autosuficiente' ? p.parentName : p.name;
    const monthsText = pendingMonths.join(', ');
    const text = `Hola, *${parent}*. Te saluda Don Rafa de Los Halcones. ⚽\n\nQuisiera recordarte de la cuota mensual pendiente de (*${monthsText}*) para *${p.name}* (Categoría *${p.category}*).\nEl total pendiente es de *\$${totalOwed.toLocaleString('es-CL')} CLP*.\n\nPuedes ver el calendario del club y registrar tu pago en nuestra web de Jugada Maestra.\n\n¡Muchas gracias por apoyar al club de los chicos! 🙌`;
    return `https://api.whatsapp.com/send?phone=${p.phone.startsWith('56') ? p.phone : p.phone.startsWith('9') ? '56' + p.phone : '56' + p.phone}&text=${encodeURIComponent(text)}`;
  };

  const handleCopyReminderText = (p: Player, pendingMonths: string[], totalOwed: number) => {
    const parent = p.parentName && p.parentName !== 'Autosuficiente' ? p.parentName : p.name;
    const monthsText = pendingMonths.join(', ');
    const text = `Hola, *${parent}*. Te saluda Don Rafa de Los Halcones. ⚽\n\nQuisiera recordarte de la cuota mensual pendiente de (*${monthsText}*) para *${p.name}* (Categoría *${p.category}*).\nEl total pendiente es de *\$${totalOwed.toLocaleString('es-CL')} CLP*.\n\nPuedes ver el calendario del club y registrar tu pago en nuestra web de Jugada Maestra.\n\n¡Muchas gracias por apoyar al club de los chicos! 🙌`;
    
    navigator.clipboard.writeText(text);
    setCopiedPlayerId(p.id);
    setTimeout(() => setCopiedPlayerId(null), 3000);
  };

  const handleCreatePlayer = (e: FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerPhone.trim()) return;

    const newPlayerId = 'p_user_' + Date.now();
    const newCreatedPlayer: Player = {
      id: newPlayerId,
      name: newPlayerName.trim(),
      category: newPlayerCategory,
      parentName: newPlayerCategory === 'Adulto' ? 'Autosuficiente' : (newPlayerParentName.trim() || 'Familiar'),
      phone: newPlayerPhone.trim().replace(/\D/g, ''),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddPlayer(newCreatedPlayer);

    // Reset fields
    setNewPlayerName('');
    setNewPlayerParentName('');
    setNewPlayerPhone('');
    alert(`Jugador ${newCreatedPlayer.name} inscrito con éxito. Sus cuotas CLP han sido inicializadas.`);
  };

  const handleAddAttendanceDateLocal = (e: FormEvent) => {
    e.preventDefault();
    if (!newDateValue) return;

    onAddAttendanceDate(newDateValue);
    setSelectedAttendanceDate(newDateValue);
    setNewDateValue('');
    setIsAddingDate(false);
  };

  const handleScheduleMatchLocal = (e: FormEvent) => {
    e.preventDefault();
    if (!matchOpponent.trim()) return;

    const newMatch: Match = {
      id: 'm_local_' + Date.now(),
      category: matchCategory,
      opponent: matchOpponent.trim(),
      date: matchDate,
      time: matchTime,
      field: matchField,
      type: matchType
    };

    setLocalMatches(prev => [...prev, newMatch]);
    setMatchOpponent('');
    setIsSchedulingMatch(false);
    alert(`Partido contra ${newMatch.opponent} programado correctamente.`);
  };

  const handleCreateAnnouncementLocal = (e: FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    const newAnnouncement: Announcement = {
      id: `ann_local_${Date.now()}`,
      category: annCategory,
      title: annTitle.trim(),
      message: annMessage.trim(),
      date: new Date().toISOString().split('T')[0],
      type: annType,
      active: true
    };

    onAddAnnouncement(newAnnouncement);
    setAnnTitle('');
    setAnnMessage('');
    setAnnCategory('General');
    setAnnType('info');
    setIsAddingAnn(false);
    alert('Comunicado publicado correctamente para la vista de padres.');
  };

  return (
    <div className="space-y-8" id="rafa-dashboard-root">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-cyan-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500 font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
              Vista del Entrenador
            </span>
            <span className="text-cyan-300 font-medium text-xs">● Modo Administrador - Los Halcones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            ¡Hola, Don Rafa! 🦅
          </h2>
          <p className="text-cyan-100 max-w-xl text-xs sm:text-sm leading-relaxed">
            Aquí tiene el cuaderno digital de <strong className="text-white">Los Halcones de Santiago</strong>. Su libreta de papel ahora es un sistema inteligente que procesa en Pesos Chilenos (CLP).
          </p>
        </div>

        <button 
          onClick={() => setActiveTab('inscripcion')}
          className="bg-white hover:bg-cyan-50 text-cyan-900 font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 relative z-10 text-xs sm:text-sm shrink-0 duration-200"
          id="btn-add-player-rafa"
        >
          <UserPlus className="w-4 h-4 text-cyan-800" />
          Registrar Jugador
        </button>
      </div>

      {/* HORIZONTAL IMAGE-REPLICATED NAVIGATION TAB BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 -mx-4 px-4 sm:-mx-8 sm:px-8 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-start gap-x-8 gap-y-2 overflow-x-auto scroller-none">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-2.5 px-1 py-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer group ${
              activeTab === 'calendario'
                ? 'text-cyan-900 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-850'
            }`}
            id="tab-calendario"
          >
            <Calendar className={`w-[18px] h-[18px] shrink-0 transition-transform ${
              activeTab === 'calendario' ? 'text-cyan-600 scale-110' : 'text-cyan-600/75 group-hover:scale-105'
            }`} />
            <span className="font-sans font-extrabold text-slate-800">Calendario y Horarios</span>
          </button>

          <button
            onClick={() => setActiveTab('asistencia')}
            className={`flex items-center gap-2.5 px-1 py-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer group ${
              activeTab === 'asistencia'
                ? 'text-cyan-900 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-850'
            }`}
            id="tab-asistencia"
          >
            <CheckCircle className={`w-[18px] h-[18px] shrink-0 transition-transform ${
              activeTab === 'asistencia' ? 'text-cyan-600 scale-110' : 'text-cyan-600/75 group-hover:scale-105'
            }`} />
            <span className="font-sans font-extrabold text-slate-800">Registro de Asistencia</span>
          </button>

          <button
            onClick={() => setActiveTab('alumnos')}
            className={`flex items-center gap-2.5 px-1 py-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer group ${
              activeTab === 'alumnos'
                ? 'text-cyan-900 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-855'
            }`}
            id="tab-alumnos"
          >
            <Users className={`w-[18px] h-[18px] shrink-0 transition-transform ${
              activeTab === 'alumnos' ? 'text-cyan-600 scale-110' : 'text-cyan-600/75 group-hover:scale-105'
            }`} />
            <span className="font-sans font-extrabold text-slate-800">Instructores y Alumnos</span>
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex items-center gap-2.5 px-1 py-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer group ${
              activeTab === 'finanzas'
                ? 'text-cyan-900 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-850'
            }`}
            id="tab-finanzas"
          >
            <DollarSign className={`w-[18px] h-[18px] shrink-0 transition-transform ${
              activeTab === 'finanzas' ? 'text-cyan-600 scale-110' : 'text-cyan-600/75 group-hover:scale-105'
            }`} />
            <span className="font-sans font-extrabold text-slate-800">Métricas Financieras</span>
          </button>

          <button
            onClick={() => setActiveTab('inscripcion')}
            className={`flex items-center gap-2.5 px-1 py-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer group ${
              activeTab === 'inscripcion'
                ? 'text-cyan-900 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-850'
            }`}
            id="tab-inscripcion"
          >
            <UserPlus className={`w-[18px] h-[18px] shrink-0 transition-transform ${
              activeTab === 'inscripcion' ? 'text-cyan-600 scale-110' : 'text-cyan-600/75 group-hover:scale-105'
            }`} />
            <span className="font-sans font-extrabold text-slate-800">Inscripción de Alumnos</span>
          </button>
        </div>
      </div>

      {/* CORE CONTENT CHANNELS */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* ==================== TAB 1: CALENDARIO Y HORARIOS ==================== */}
        {activeTab === 'calendario' && (
          <div className="space-y-6" id="dashboard-calendar-tab-wrapper">
            
            {/* Split controls (Apartado con Dos Botones) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-55 border border-emerald-200 text-emerald-800 uppercase font-mono font-bold px-2 py-0.5 rounded-full inline-block">
                  Pauta de Calendarios
                </span>
                <h3 className="text-base font-extrabold text-slate-800">Sección de Fechas, Horarios y Rivales</h3>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/50">
                <button
                  onClick={() => {
                    setCalendarSubMode('partidos');
                    setSelectedCalendarDay(null);
                  }}
                  className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    calendarSubMode === 'partidos'
                      ? 'bg-white shadow text-emerald-900 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="btn-subtab-partidos"
                >
                  <Trophy className={`w-4 h-4 ${calendarSubMode === 'partidos' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Partidos y Resultados</span>
                </button>
                <button
                  onClick={() => {
                    setCalendarSubMode('entrenamientos');
                  }}
                  className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    calendarSubMode === 'entrenamientos'
                      ? 'bg-white shadow text-emerald-900 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="btn-subtab-entrenamientos"
                >
                  <Clock className={`w-4 h-4 ${calendarSubMode === 'entrenamientos' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Horario de Clases</span>
                </button>
              </div>
            </div>

            {/* Sub-toggled area */}
            {calendarSubMode === 'partidos' ? (
              <div className="space-y-6">
                
                {/* Secondary filters and call to action bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-850 flex items-center gap-1.5">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      Calendario Mensual Interactiva - Junio 2026
                    </h4>
                    <p className="text-xs text-slate-500">
                      Vea y registre todos los partidos de fin de semana (sábados y domingos). Presione un día para filtrar detalles.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Status Toggle (Por jugar / Jugados) */}
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto justify-between shrink-0 border border-slate-200/50">
                      <button
                        onClick={() => {
                          setMatchStatusFilter('por_jugar');
                          setSelectedCalendarDay(null);
                        }}
                        className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                          matchStatusFilter === 'por_jugar'
                            ? 'bg-white shadow text-slate-800 font-extrabold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                        id="btn-filter-por-jugar"
                      >
                        Por Jugar
                      </button>
                      <button
                        onClick={() => {
                          setMatchStatusFilter('jugados');
                          setSelectedCalendarDay(null);
                        }}
                        className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                          matchStatusFilter === 'jugados'
                            ? 'bg-white shadow text-slate-800 font-extrabold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                        id="btn-filter-jugados"
                      >
                        Jugados ({playedMatches.length})
                      </button>
                    </div>

                    <button
                      onClick={() => setIsSchedulingMatch(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 w-full md:w-auto justify-center duration-150 cursor-pointer shadow-sm shadow-emerald-100"
                    >
                      <Plus className="w-4 h-4" /> Programar Partido
                    </button>
                  </div>
                </div>

                {/* Calendar Layout Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left part: Interactive Grid Calendar */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider">
                          Fines de Semana Destacados ⚽
                        </span>
                        <h4 className="text-sm font-black text-slate-850 uppercase tracking-wider font-mono">
                          📅 {(() => {
                            const months = [
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ];
                            return months[selectedMonth - 1] || '';
                          })()} {selectedYear}
                        </h4>
                      </div>

                      {/* Month and Year Selectors side-by-side */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none">
                          <select
                            value={selectedMonth}
                            onChange={(e) => {
                              setSelectedMonth(parseInt(e.target.value));
                              setSelectedCalendarDay(null);
                            }}
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                          >
                            <option value={1}>Enero</option>
                            <option value={2}>Febrero</option>
                            <option value={3}>Marzo</option>
                            <option value={4}>Abril</option>
                            <option value={5}>Mayo</option>
                            <option value={6}>Junio</option>
                            <option value={7}>Julio</option>
                            <option value={8}>Agosto</option>
                            <option value={9}>Septiembre</option>
                            <option value={10}>Octubre</option>
                            <option value={11}>Noviembre</option>
                            <option value={12}>Diciembre</option>
                          </select>
                        </div>
                        <div className="flex-1 sm:flex-none">
                          <select
                            value={selectedYear}
                            onChange={(e) => {
                              setSelectedYear(parseInt(e.target.value));
                              setSelectedCalendarDay(null);
                            }}
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                          >
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                            <option value={2028}>2028</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mon-Sun Header */}
                    <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span className="text-amber-800 font-black">Sáb</span>
                      <span className="text-amber-800 font-black">Dom</span>
                    </div>

                    {/* Dynamic Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                        const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 is Sunday, 1 is Monday...
                        const startingEmptyCells = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

                        const items: React.ReactNode[] = [];

                        // 1. Render empty placeholder cells
                        for (let i = 0; i < startingEmptyCells; i++) {
                          items.push(
                            <div key={`empty-${i}`} className="aspect-square bg-slate-50/5 rounded-2xl border border-slate-100/40 opacity-40" />
                          );
                        }

                        // 2. Render actual calendar days
                        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                          const tempDate = new Date(selectedYear, selectedMonth - 1, dayNum);
                          const dayOfWeek = tempDate.getDay(); // 0 Sunday, 6 Saturday
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                          const dayStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                          
                          // Find matches on this date
                          const dayUpcomingMatches = allMatchesList.filter(m => m.date === dayStr);
                          const dayPlayedMatches = playedMatches.filter(m => m.date === dayStr);
                          const hasUpcomingMatch = dayUpcomingMatches.length > 0;
                          const hasPlayedMatch = dayPlayedMatches.length > 0;
                          const hasMatchOnThisFilter = matchStatusFilter === 'por_jugar' ? hasUpcomingMatch : hasPlayedMatch;

                          const isSelected = selectedCalendarDay === dayNum;

                          let cellClass = "aspect-square rounded-2xl p-1.5 border flex flex-col justify-between items-start relative transition-all duration-150 cursor-pointer select-none ";
                          if (isSelected) {
                            cellClass += "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 scale-102 z-10 shadow-sm ";
                          } else if (hasMatchOnThisFilter) {
                            cellClass += "bg-emerald-50/20 border-emerald-300 hover:bg-emerald-50/40 ";
                          } else if (isWeekend) {
                            cellClass += "bg-amber-50/25 hover:bg-amber-50/55 border-amber-100 border-dashed text-amber-900 ";
                          } else {
                            cellClass += "bg-slate-50/20 border-slate-100 hover:bg-slate-50/50 text-slate-750 ";
                          }

                          items.push(
                            <div
                              key={dayNum}
                              onClick={() => setSelectedCalendarDay(isSelected ? null : dayNum)}
                              className={cellClass}
                              title={`${isWeekend ? 'Fin de semana' : 'Día de de la semana'} - ${dayNum}/${selectedMonth}/${selectedYear}`}
                            >
                              <span className={`text-xs font-black leading-none ${isWeekend ? 'text-amber-700 font-extrabold' : 'text-slate-500'}`}>
                                {dayNum}
                              </span>

                              {hasMatchOnThisFilter && (
                                <div className="w-full mt-auto flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                                    <span className="hidden sm:inline text-[9px] font-black text-slate-705 truncate max-w-[85%]">
                                      Halcones
                                    </span>
                                  </div>
                                  <span className="absolute bottom-1 right-1 text-[11px] animate-pulse">⚽</span>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return items;
                      })()}
                    </div>

                    {selectedCalendarDay !== null && (
                      <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 flex items-center justify-between gap-4 mt-2">
                        <div className="text-xs text-cyan-800">
                          Mostrando partidos para el día <strong className="text-cyan-950 font-extrabold">{selectedCalendarDay.toString().padStart(2, '0')}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear}</strong>.
                        </div>
                        <button
                          onClick={() => setSelectedCalendarDay(null)}
                          className="text-[10px] bg-white border border-slate-200 text-slate-800 py-1.5 px-3.5 rounded-lg font-black hover:bg-slate-50 cursor-pointer shadow-xs"
                        >
                          Ver Todos los Partidos
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right part: Detailed match lists */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest font-mono">
                        {matchStatusFilter === 'por_jugar' ? '⚽ Siguientes partidos' : '🏆 Resultados'}
                      </h4>
                      {selectedCalendarDay && (
                        <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded">
                          Día {selectedCalendarDay}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                      {(() => {
                        const baseList = matchStatusFilter === 'por_jugar' ? [...allMatchesList] : [...playedMatches];
                        
                        const listToRender = baseList.filter(m => {
                          let matchesDay = true;
                          if (selectedCalendarDay !== null) {
                            const dayStr = `2026-06-${selectedCalendarDay.toString().padStart(2, '0')}`;
                            matchesDay = m.date === dayStr;
                          }
                          return matchesDay;
                        }).sort((a, b) => a.date.localeCompare(b.date));

                        if (listToRender.length === 0) {
                          return (
                            <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-2xl text-center text-slate-400 text-xs font-semibold">
                              No hay partidos registrados {selectedCalendarDay ? `para el día ${selectedCalendarDay}` : `en la sección de ${matchStatusFilter === 'por_jugar' ? 'Pendientes' : 'Jugados'}`}.
                            </div>
                          );
                        }

                        return listToRender.map(m => {
                          const isPlayed = matchStatusFilter === 'jugados';
                          const scoreInfo = getMatchScore(m.id);

                          const categoryStyle = m.category === 'Infantil' 
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-150'
                            : m.category === 'Juvenil'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-150'
                            : 'bg-blue-50 text-blue-800 border-blue-150';

                          return (
                            <div
                              key={m.id}
                              className="bg-white border hover:border-slate-300 border-slate-100 p-4 rounded-2xl relative transition-all duration-150 flex flex-col justify-between gap-3 shadow-xs"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${categoryStyle}`}>
                                    {m.category}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-bold">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono">{m.date.split('-').reverse().join('/')}</span>
                                  </div>
                                </div>

                                <h5 className="text-sm font-extrabold text-slate-805 mt-2 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                  Halcones vs {m.opponent}
                                </h5>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 text-[11px] text-slate-500 font-mono">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{m.time} hrs</span>
                                  </div>
                                  <div className="flex items-center gap-1 col-span-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{m.field}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-slate-50 pt-2 flex items-center justify-between">
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                                  {m.type}
                                </span>

                                {isPlayed ? (
                                  <div className="flex items-center gap-2">
                                    <span className="bg-cyan-50 text-cyan-705 font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-cyan-100">
                                      🟢 {scoreInfo.score}
                                    </span>
                                    <span className="text-[10px] uppercase font-black text-cyan-805">{scoreInfo.text}</span>
                                  </div>
                                ) : (
                                  <span className="bg-cyan-50 text-cyan-705 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-cyan-100 font-sans">
                                    Por Jugar
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* ==================== SUB-TAB ENTRENAMIENTOS ==================== */
              <div className="space-y-6">
                
                {/* Header instruction / General settings card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-805 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      Planificación Semanal de Entrenamientos
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Semanario oficial de preparación táctica y acondicionamiento. Seleccione un profesor para desplegar días y horarios.
                    </p>
                  </div>

                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-black text-xs px-3.5 py-1.5 rounded-xl block shrink-0 font-sans selection-none">
                    ⏱️ 1h 30m por Sesión
                  </span>
                </div>

                {/* Trainers profile list - interactive accordions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trainersSchedule.map(trainer => {
                    const isSelected = selectedTrainerId === trainer.id;
                    
                    let cardBorder = "border-slate-100 ";
                    let bgClass = "bg-white ";
                    if (isSelected) {
                      if (trainer.colorTheme === 'cyan') cardBorder = "border-cyan-600 ring-2 ring-cyan-500/10 bg-cyan-50/10 ";
                      if (trainer.colorTheme === 'indigo') cardBorder = "border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-50/10 ";
                      if (trainer.colorTheme === 'blue') cardBorder = "border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10 ";
                    }

                    return (
                      <div
                        key={trainer.id}
                        onClick={() => setSelectedTrainerId(isSelected ? 'carlos' : trainer.id)}
                        className={`border rounded-3xl p-5 cursor-pointer transition-all duration-150 relative ${cardBorder} ${bgClass} hover:shadow-md`}
                        id={`trainer-card-${trainer.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${trainer.bgAvatar} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                            {trainer.avatar}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{trainer.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Profesor & Director Técnico</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-50 pb-3">
                          <span className="font-mono">RUT: {trainer.rut}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            trainer.category === 'Infantil' ? 'bg-indigo-50 text-indigo-705 border border-indigo-100' :
                            trainer.category === 'Juvenil' ? 'bg-blue-50 text-blue-705 border border-blue-100' :
                            'bg-cyan-50 text-cyan-700 border border-cyan-100'
                          }`}>
                            {trainer.category}
                          </span>
                        </div>

                        {/* Expandable schedule area detailed per training */}
                        <AnimatePresence initial={false}>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 space-y-4">
                                {/* Training Days Highlight */}
                                <div className="space-y-1.5">
                                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">📅 Días de Entrenamiento</span>
                                  <div className="flex gap-1.5">
                                    {['Lunes', 'Miércoles', 'Viernes'].map(d => {
                                      const isDayMatch = trainer.days.includes(d);
                                      return (
                                        <span
                                          key={d}
                                          className={`text-xs px-2.5 py-1 rounded-lg border font-black transition-colors ${
                                            isDayMatch
                                              ? trainer.colorTheme === 'cyan' ? 'bg-cyan-500 text-white border-cyan-500' :
                                                trainer.colorTheme === 'indigo' ? 'bg-indigo-500 text-white border-indigo-500' :
                                                'bg-blue-500 text-white border-blue-500'
                                              : 'bg-slate-50 border-slate-100 text-slate-400'
                                          }`}
                                        >
                                          {d}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Class schedule and duration block */}
                                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-150">
                                  <div>
                                    <span className="text-[10px] uppercase block font-black text-slate-400 font-mono">Horario</span>
                                    <span className="font-extrabold text-slate-800 text-[12.5px]">{trainer.time} hrs</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase block font-black text-slate-400 font-mono">⏱️ Duración</span>
                                    <span className="font-extrabold text-emerald-800 text-[12.5px]">{trainer.duration}</span>
                                  </div>
                                </div>

                                {/* Court location */}
                                <div>
                                  <span className="text-[10px] uppercase font-black text-slate-400 font-mono block">Recinto y Cancha</span>
                                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1 bg-slate-50/40 p-2 rounded-xl border border-slate-100">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{trainer.field.split(' ')[0] + ' ' + trainer.field.split(' ')[1]}</span>
                                  </div>
                                </div>

                                {/* Curriculum/focus details */}
                                <div className="text-xs text-slate-500 bg-emerald-50/20 p-3 rounded-xl border border-dashed border-emerald-100 leading-relaxed font-sans">
                                  <strong>Plan de Entrenamiento:</strong> {trainer.description}
                                </div>

                                {/* Footer contact */}
                                <div className="text-[10px] text-slate-450 text-slate-400 space-y-1 pt-2.5 border-t border-slate-100">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono">{trainer.email}</span>
                                  </div>
                                  <div className="text-[9px] font-semibold text-slate-400">
                                    Encuentros semanales organizados según pauta de Don Rafa
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!isSelected && (
                          <div className="text-center font-bold text-[10px] text-slate-400 mt-4 pt-2 border-t border-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 hover:text-slate-600 transition-colors">
                            <span>Ver Frecuencia y Bloque</span>
                            <span>▾</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Training Sequence Description Card */}
                <div className="p-5 bg-amber-50/20 border border-amber-100/80 rounded-3xl flex items-start gap-3.5 max-w-4xl">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-normal">
                    <strong className="font-bold block text-sm text-amber-950 mb-1">Estructura del Cronograma Docente de Los Halcones:</strong>
                    <div className="space-y-1">
                      <p>Para hacer eficiente el arriendo de canchas, todos los entrenamientos se establecen los días <strong className="font-extrabold text-amber-950">Lunes, Miércoles y Viernes</strong> en bloques continuos.</p>
                      <p>El primer turno de entrenamiento inicia a las <strong className="font-extrabold text-amber-950">4:00 PM (16:00 hrs) con la categoría Juvenil</strong> impartido por la Dra. María Ortiz, de manera sucesiva subiendo hasta la categoría de <strong className="font-extrabold text-amber-950">Adultos a las 5:30 PM (17:30 hrs)</strong> liderada por Don Rafa, respetando bloques de 1 hora 30 minutos por división.</p>
                    </div>
                  </div>
                </div>

                {/* 📢 MURO DE COMUNICADOS PARA APODERADOS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2 font-sans">
                        <span className="text-lg">📢</span> Muro de Comunicados y Avisos (Vista de Padres)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Publique avisos importantes como suspensión de clases, entrenamientos cancelados o convocatorias que los apoderados verán en tiempo real.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddingAnn(!isAddingAnn)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto hover:shadow-xs"
                      id="btn-toggle-add-ann"
                    >
                      {isAddingAnn ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAddingAnn ? 'Cancelar' : 'Publicar Comunicado'}</span>
                    </button>
                  </div>

                  {/* FORM TO ADD NEW ANNOUNCEMENT */}
                  {isAddingAnn && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleCreateAnnouncementLocal}
                      className="bg-slate-50 border border-slate-200/65 p-5 rounded-2xl space-y-4"
                      id="form-add-announcement"
                    >
                      <h5 className="text-xs font-black uppercase text-slate-550 tracking-wider">Crear Nuevo Comunicado</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-slate-500">Título del Anuncio</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Entrenamiento Suspendido por Lluvia, Aviso Urgente, etc."
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            id="ann-input-title"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">Dirigido a la Categoría</label>
                          <select
                            value={annCategory}
                            onChange={(e) => setAnnCategory(e.target.value as Category | 'General')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            id="ann-select-category"
                          >
                            <option value="General">General (Todas las Categorías)</option>
                            <option value="Infantil">Infantil (Docente: Carlos)</option>
                            <option value="Juvenil">Juvenil (Docente: María)</option>
                            <option value="Adulto">Adulto (Docente: Don Rafa)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Mensaje informativo para los padres</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Escriba los detalles aquí que se desplegarán inmediatamente para los padres en su portal..."
                          value={annMessage}
                          onChange={(e) => setAnnMessage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                          id="ann-textarea-message"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">Tipo de Notificación</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'Información ℹ️', value: 'info' },
                              { label: 'Cancelación 🚨', value: 'cancel' },
                              { label: 'Advertencia ⚠️', value: 'warning' },
                              { label: 'Festejo/Meta 🎉', value: 'success' }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAnnType(opt.value as any)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border text-center cursor-pointer transition-colors ${
                                  annType === opt.value
                                    ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-end justify-end">
                          <button
                            type="submit"
                            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                            id="ann-btn-submit"
                          >
                            Confirmar y Publicar
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}

                  {/* LIST OF CURRENT ANNOUNCEMENTS */}
                  <div className="space-y-3.5">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Historial de anuncios publicados</h5>
                    
                    {announcements.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-150 rounded-2xl text-slate-400 text-xs font-semibold">
                        No hay comunicados publicados actualmente. Use el botón superior para crear uno.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5">
                        {announcements.map(ann => {
                          let typeStyles = 'border-blue-100 bg-blue-50/20 text-blue-800';
                          let badgeType = 'ℹ️ Información';
                          if (ann.type === 'cancel') {
                            typeStyles = 'border-rose-100 bg-rose-50/20 text-rose-800';
                            badgeType = '🚨 Cancelación / Suspensión';
                          } else if (ann.type === 'warning') {
                            typeStyles = 'border-amber-100 bg-amber-50/20 text-amber-800';
                            badgeType = '⚠️ Advertencia';
                          } else if (ann.type === 'success') {
                            typeStyles = 'border-emerald-100 bg-emerald-50/20 text-emerald-800';
                            badgeType = '🎉 Noticia / Logro';
                          }

                          return (
                            <div
                              key={ann.id}
                              className={`p-4 rounded-2xl border ${typeStyles} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                              id={`rafa-ann-box-${ann.id}`}
                            >
                              <div className="space-y-1.5 flex-1 w-full text-slate-800">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-black uppercase px-2 dark:border-slate-800 py-0.5 rounded-md bg-white border border-slate-200">
                                    {badgeType}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md whitespace-nowrap ${
                                    ann.category === 'General' ? 'bg-slate-200 text-slate-700' :
                                    ann.category === 'Infantil' ? 'bg-indigo-100 text-indigo-800 font-bold' :
                                    ann.category === 'Juvenil' ? 'bg-blue-100 text-blue-800 font-bold' :
                                    'bg-emerald-100 text-emerald-800 font-bold'
                                  }`}>
                                    Línea: {ann.category}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                                    📅 {ann.date.split('-').reverse().join('/')}
                                  </span>
                                </div>
                                <h6 className="font-extrabold text-sm text-slate-900">{ann.title}</h6>
                                <p className="text-xs text-slate-600 leading-relaxed font-sans">{ann.message}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                                <button
                                  onClick={() => onUpdateAnnouncement(ann.id, { active: !ann.active })}
                                  className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-colors ${
                                    ann.active 
                                      ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' 
                                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                  }`}
                                  id={`btn-ann-toggle-${ann.id}`}
                                >
                                  {ann.active ? '🟢 Visible' : '🔴 Oculto'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('¿Seguro que desea eliminar de forma permanente esta publicación?')) {
                                      onDeleteAnnouncement(ann.id);
                                    }
                                  }}
                                  className="p-2 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  id={`btn-ann-delete-${ann.id}`}
                                  title="Eliminar Anuncio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 2: REGISTRO DE ASISTENCIA ==================== */}
        {activeTab === 'asistencia' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="attendance-panel-root">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Pasar Lista de Entrenamientos
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seleccione una fecha de entrenamiento y categoría de alumnos, luego marque quién asistió. Todo se almacena automáticamente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Fecha:</span>
                  <select
                    value={selectedAttendanceDate}
                    onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="select-attendance-date"
                  >
                    {attendanceDates.map(d => (
                      <option key={d} value={d}>
                        📅 {d.split('-').reverse().join('/')}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAddingDate(true)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 duration-150 cursor-pointer"
                  id="btn-add-attendance-date"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Sesión
                </button>
              </div>
            </div>

            {/* Segmented control for Categories in Attendance panel */}
            <div className="flex border-b border-slate-100 pb-2 overflow-x-auto">
              {(['Infantil', 'Juvenil', 'Adulto'] as Category[]).map(cat => {
                const isActive = attendanceCategoryFilter === cat;
                const catPlayers = players.filter(p => p.category === cat);
                const catPlayerIds = catPlayers.map(p => p.id);
                const records = attendance.filter(a => a.date === selectedAttendanceDate && catPlayerIds.includes(a.playerId));
                const presentCount = records.filter(a => a.attended).length;
                const totalCount = catPlayers.length;
                const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                return (
                  <button
                    key={cat}
                    onClick={() => setAttendanceCategoryFilter(cat)}
                    className={`px-5 py-3 font-semibold text-xs border-b-2 transition-all relative shrink-0 cursor-pointer ${
                      isActive 
                        ? 'border-emerald-605 text-emerald-700 font-extrabold' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    id={`tab-attendance-${cat.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Categoría {cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-emerald-50 text-emerald-800 font-black' : 'bg-slate-105 text-slate-500'
                      }`}>
                        {presentCount}/{totalCount} ({percentage}%)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Checklist grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
              {attendanceRoster.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                  No hay jugadores registrados en esta categoría. Agregue alumnos en la pestaña para pasar lista.
                </div>
              ) : (
                attendanceRoster.map(({ player, attended }) => (
                  <div
                    key={player.id}
                    onClick={() => onToggleAttendance(player.id, selectedAttendanceDate)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      attended 
                        ? 'bg-emerald-55/60 border-emerald-200/80 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                    id={`attendance-box-${player.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full flex items-center justify-center shrink-0 ${
                        attended ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 leading-tight">{player.name}</h4>
                        <span className="text-[10px] text-slate-400">{player.parentName || 'Autosuficiente'}</span>
                      </div>
                    </div>

                    <div className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      attended 
                        ? 'bg-emerald-100/60 text-emerald-800' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {attended ? 'Presente' : 'Falta'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: INSTRUCTORES Y ALUMNOS ==================== */}
        {activeTab === 'alumnos' && (
          <div className="space-y-8">
            {/* INSTRUCTORES / CUERPO TECNICO SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Cuerpo Técnico e Instructores del Club
                </h3>
                <p className="text-xs text-slate-400">
                  Profesionales responsables de la dirección técnica y deportiva de las categorías de Los Halcones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inst 1 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                    DR
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 leading-none">Don Rafa Admon.</h4>
                    <p className="text-[11px] font-medium text-emerald-800 leading-tight">Director Técnico & Administrador del Club</p>
                    <div className="text-[11px] text-slate-500 font-mono">RUT: <strong className="text-slate-750">8.765.432-1</strong></div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">rafa@loshalcones.cl</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono mt-1 inline-block border border-emerald-100">
                      +56 9 1234 5678
                    </span>
                  </div>
                </div>

                {/* Inst 2 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    PC
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 leading-none">Profe Carlos Silva</h4>
                    <p className="text-[11px] font-medium text-indigo-800 leading-tight">Director Técnico & Preparador Infantil</p>
                    <div className="text-[11px] text-slate-500 font-mono">RUT: <strong className="text-slate-750">14.321.098-7</strong></div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">carlos.silva@loshalcones.cl</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono mt-1 inline-block border border-indigo-100">
                      +56 9 8765 4321
                    </span>
                  </div>
                </div>

                {/* Inst 3 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    MO
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 leading-none">Dra. María Ortiz</h4>
                    <p className="text-[11px] font-medium text-blue-800 leading-tight">Directora Técnica & Preparadora Física Juvenil</p>
                    <div className="text-[11px] text-slate-500 font-mono">RUT: <strong className="text-slate-750">16.543.210-9</strong></div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">maria.ortiz@loshalcones.cl</span>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded font-mono mt-1 inline-block border border-blue-100">
                      +56 9 4567 8901
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RELACIÓN DE ALUMNOS Y PADRES APODERADOS */}
            {(() => {
              // Group players by parent
              const parentGroups = players.reduce((acc: { parentName: string; phone: string; children: Player[] }[], p) => {
                if (p.status === 'baja') return acc;
                const parent = p.parentName && p.parentName.trim() !== '' ? p.parentName.trim() : 'Autosuficiente / Sin Registro';
                const key = parent.toLowerCase() === 'autosuficiente' ? `auto_${p.id}` : parent;
                
                const existing = acc.find(g => {
                  if (parent.toLowerCase() === 'autosuficiente') return false;
                  return g.parentName.toLowerCase() === parent.toLowerCase();
                });

                if (existing) {
                  existing.children.push(p);
                } else {
                  acc.push({
                    parentName: parent,
                    phone: p.phone,
                    children: [p]
                  });
                }
                return acc;
              }, []);

              // Filter grouped parents based on query
              const filteredParents = parentSearchQuery.trim() === ''
                ? parentGroups
                : parentGroups.filter(g => 
                    g.parentName.toLowerCase().includes(parentSearchQuery.toLowerCase()) ||
                    g.phone.includes(parentSearchQuery) ||
                    g.children.some(c => c.name.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                  );

              return (
                <div className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm transition-all duration-300 ${isParentsDirectoryExpanded ? 'space-y-6' : ''}`}>
                  {/* Clickable Header/Button */}
                  <button
                    onClick={() => setIsParentsDirectoryExpanded(!isParentsDirectoryExpanded)}
                    className="w-full flex items-center justify-between text-left focus:outline-none group/dir cursor-pointer"
                    id="toggle-parents-directory-btn"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 transition-all duration-200 group-hover/dir:bg-cyan-100">
                        <Users className="w-5 h-55 text-cyan-500" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                          Directorio de Apoderados y Alumnos Asociados ({filteredParents.length})
                        </h4>
                        <p className="text-xs text-slate-400">
                          {isParentsDirectoryExpanded 
                            ? "Visualiza los apoderados con sus alumnos asociados y el resumen de sus cuotas en tiempo real."
                            : "Presione aquí para desplegar la información y ver el directorio completo de tutorías."}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all group-hover/dir:bg-slate-100 group-hover/dir:text-slate-600 shrink-0">
                      {isParentsDirectoryExpanded ? (
                        <ChevronUp className="w-4 h-4 stroke-[2.5px]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 stroke-[2.5px]" />
                      )}
                    </div>
                  </button>

                  {/* Collapsible content container */}
                  {isParentsDirectoryExpanded && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Search bar row */}
                      <div className="flex justify-end pt-2">
                        <div className="w-full sm:w-72">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Buscar por apoderado, alumno o teléfono..."
                              value={parentSearchQuery}
                              onChange={(e) => setParentSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Relational Parent Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredParents.length === 0 ? (
                          <div className="col-span-full text-center py-6 text-slate-400 text-xs">
                            No se encontraron relaciones que coincidan con la búsqueda.
                          </div>
                        ) : (
                          filteredParents.map((group, groupIdx) => {
                            let totalPendingCLP = 0;
                            group.children.forEach(child => {
                              const childPays = payments.filter(pay => pay.playerId === child.id && pay.year === 2026);
                              const pendingAmt = childPays.filter(p => p.status === 'pending').length * getMonthlyFee(child.category);
                              totalPendingCLP += pendingAmt;
                            });

                            // Dynamic reminder text
                            const childrenText = group.children.map(c => `${c.name} (${c.category})`).join(', ');
                            const reminderMessage = `⚽ *CLUB DEPORTIVO LOS HALCONES* ⚽\n\nEstimado/a ${group.parentName}, le saluda Don Rafa.\n\nLe escribo para recordarle que mantiene cuotas pendientes para sus alumnos asociados (*${childrenText}*) por un total de *$${totalPendingCLP.toLocaleString('es-CL')} CLP*.\n\nPuede ver el detalle e historial ingresando al Portal de Padres con su nombre y su número telefónico. ¡Agradecemos su valioso apoyo y compromiso diario! 😊`;
                            const waLink = `https://api.whatsapp.com/send?phone=${group.phone.startsWith('56') ? group.phone : '56' + group.phone}&text=${encodeURIComponent(reminderMessage)}`;

                            return (
                              <div key={groupIdx} className="bg-slate-50/50 hover:bg-cyan-55/45 p-4 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-all flex flex-col justify-between gap-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <h5 className="text-sm font-extrabold text-slate-800">{group.parentName}</h5>
                                      <span className="text-[10px] bg-slate-100 font-bold px-2.5 py-0.5 rounded text-slate-500 font-mono inline-block mt-0.5">
                                        📱 Teléf: {group.phone}
                                      </span>
                                    </div>

                                    {totalPendingCLP > 0 ? (
                                      <span className="text-[9px] bg-rose-50 text-rose-700 font-black px-2.5 py-1 rounded-full border border-rose-100 shrink-0">
                                        Pendiente: ${totalPendingCLP.toLocaleString('es-CL')}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-cyan-50 text-cyan-705 font-black px-2.5 py-1 rounded-full border border-cyan-100 shrink-0">
                                        Al Día 👍
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-2.5 border-t border-dashed border-slate-200 pt-2 text-xs">
                                    <span className="text-[9px] font-black tracking-widest text-slate-400 font-mono block uppercase">Alumnos Vinculados:</span>
                                    {group.children.map(child => {
                                      return (
                                        <div key={child.id} className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                                          <div>
                                            <span className="font-extrabold text-slate-700 block">{child.name}</span>
                                            <span className="text-[10px] text-cyan-600 font-bold">Cat: {child.category}</span>
                                          </div>

                                          <div className="flex gap-1 font-mono">
                                            {['Marzo', 'Abril', 'Mayo', 'Junio'].map(m => {
                                              const pState = payments.find(pay => pay.playerId === child.id && pay.month === m);
                                              const isPaid = pState?.status === 'paid';
                                              return (
                                                <span 
                                                  key={m}
                                                  title={`${m}: ${isPaid ? 'Pagado' : 'Pendiente'}`}
                                                  className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-transform hover:scale-110 cursor-help ${
                                                    isPaid ? 'bg-cyan-500 text-white shadow-sm' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                  }`}
                                                >
                                                  {m[0]}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {totalPendingCLP > 0 && (
                                  <a 
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    Cobrar por WhatsApp 📱
                                  </a>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ALUMNOS REGISTER / MATRICULA */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="payment-matrix-panel">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
                    Lista de Alumnos e Historial de Cuotas ({matrixYearFilter})
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Haga clic en los casilleros mensuales para registrar un pago inmediato (<span className="text-cyan-600 font-bold">PAGO</span>/<span className="text-rose-500 font-bold">PDTE</span>).
                  </p>
                </div>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 md:flex-initial min-w-[180px]">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por jugador o tutor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      id="search-matrix-input"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'Todos')}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700"
                    id="filter-matrix-category"
                  >
                    <option value="Todos">Categoría: Todos</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Juvenil">Juvenil</option>
                    <option value="Adulto">Adulto</option>
                  </select>

                  <select
                    value={matrixYearFilter}
                    onChange={(e) => setMatrixYearFilter(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700"
                    id="filter-matrix-year"
                  >
                    <option value={2026}>Año: 2026</option>
                    <option value={2027}>Año: 2027</option>
                    <option value={2025}>Año: 2025</option>
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as 'Todos' | 'AlDia' | 'Debe')}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700"
                    id="filter-matrix-status"
                  >
                    <option value="Todos">Pago: Todos</option>
                    <option value="AlDia">Al Día</option>
                    <option value="Debe">Con Adeudos</option>
                  </select>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-xs text-slate-500 font-extrabold uppercase">
                    <tr>
                      <th className="py-4 px-6 font-extrabold text-xs">Jugador</th>
                      <th className="py-4 px-4 font-extrabold text-xs">Categoría</th>
                      <th className="py-4 px-4 font-extrabold text-xs text-center">Marzo</th>
                      <th className="py-4 px-4 font-extrabold text-xs text-center">Abril</th>
                      <th className="py-4 px-4 font-extrabold text-xs text-center">Mayo</th>
                      <th className="py-4 px-4 font-extrabold text-xs text-center">Junio (Act)</th>
                      <th className="py-4 px-4 font-extrabold text-xs text-right">Mensualidad</th>
                      <th className="py-4 px-6 font-extrabold text-xs text-right">Baja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                          Ningún alumno coincide con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredPlayers.map((p) => {
                        const fee = getMonthlyFee(p.category);
                        const playerPayments = payments.filter(pay => pay.playerId === p.id && pay.year === matrixYearFilter);
                        
                        const getPaymentStatus = (month: string) => {
                          const existing = playerPayments.find(pay => pay.month === month);
                          if (existing) return existing;
                          return {
                            id: `temp_${p.id}_${month}_${matrixYearFilter}`,
                            playerId: p.id,
                            month,
                            year: matrixYearFilter,
                            status: 'pending' as const,
                            amount: fee
                          };
                        };

                        const marchPay = getPaymentStatus('Marzo');
                        const aprilPay = getPaymentStatus('Abril');
                        const mayPay = getPaymentStatus('Mayo');
                        const junePay = getPaymentStatus('Junio');

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/20 transition-colors">
                            <td className="py-3.5 px-6">
                              <div className="font-semibold text-slate-700">{p.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">Apoderado: {p.parentName} | Cel: {p.phone}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                p.category === 'Infantil' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                                p.category === 'Juvenil' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 
                                'bg-blue-50 text-blue-700 border border-blue-105'
                              }`}>
                                {p.category}
                              </span>
                            </td>

                            {/* March */}
                            <td className="py-3.5 px-4 text-center">
                              {marchPay ? (
                                <button
                                  onClick={() => onTogglePayment(p.id, 'Marzo', matrixYearFilter)}
                                  className={`text-[10px] font-bold tracking-tight px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all duration-150 inline-block w-24 ${
                                    marchPay.status === 'paid'
                                      ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white font-extrabold shadow-sm shadow-cyan-100'
                                      : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
                                  }`}
                                  id={`tile-marzo-${p.id}`}
                                >
                                  {marchPay.status === 'paid' ? '✓ MARZO' : '⚠ MARZO'}
                                </button>
                              ) : <span className="text-slate-300">-</span>}
                            </td>

                            {/* April */}
                            <td className="py-3.5 px-4 text-center">
                              {aprilPay ? (
                                <button
                                  onClick={() => onTogglePayment(p.id, 'Abril', matrixYearFilter)}
                                  className={`text-[10px] font-bold tracking-tight px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all duration-150 inline-block w-24 ${
                                    aprilPay.status === 'paid'
                                      ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white font-extrabold shadow-sm shadow-cyan-100'
                                      : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
                                  }`}
                                  id={`tile-abril-${p.id}`}
                                >
                                  {aprilPay.status === 'paid' ? '✓ ABRIL' : '⚠ ABRIL'}
                                </button>
                              ) : <span className="text-slate-300">-</span>}
                            </td>

                            {/* May */}
                            <td className="py-3.5 px-4 text-center">
                              {mayPay ? (
                                <button
                                  onClick={() => onTogglePayment(p.id, 'Mayo', matrixYearFilter)}
                                  className={`text-[10px] font-bold tracking-tight px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all duration-150 inline-block w-24 ${
                                    mayPay.status === 'paid'
                                      ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white font-extrabold shadow-sm shadow-cyan-100'
                                      : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
                                  }`}
                                  id={`tile-mayo-${p.id}`}
                                >
                                  {mayPay.status === 'paid' ? '✓ MAYO' : '⚠ MAYO'}
                                </button>
                              ) : <span className="text-slate-300">-</span>}
                            </td>

                            {/* June */}
                            <td className="py-3.5 px-4 text-center">
                              {junePay ? (
                                <button
                                  onClick={() => onTogglePayment(p.id, 'Junio', matrixYearFilter)}
                                  className={`text-[10px] font-bold tracking-tight px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all duration-150 inline-block w-24 ${
                                    junePay.status === 'paid'
                                      ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white font-extrabold shadow-sm shadow-cyan-100'
                                      : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
                                  }`}
                                  id={`tile-junio-${p.id}`}
                                >
                                  {junePay.status === 'paid' ? '✓ JUNIO' : '⚠ JUNIO'}
                                </button>
                              ) : <span className="text-slate-300">-</span>}
                            </td>

                            <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                              ${fee.toLocaleString('es-CL')} CLP
                            </td>

                            <td className="py-3.5 px-6 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`¿Dar de baja al jugador ${p.name}?`)) {
                                    onDeletePlayer(p.id);
                                  }
                                }}
                                className="text-slate-300 hover:text-rose-600 p-2 transition-colors rounded-lg hover:bg-rose-50"
                                id={`btn-delete-player-${p.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: METRICAS FINANCIERAS ==================== */}
        {activeTab === 'finanzas' && (
          <div className="space-y-8">
            {/* Elegant Filter Panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Métricas y Filtros Financieros
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtre ingresos de caja, morosidades y proyecte el crecimiento por categorías y rangos de fechas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Categoría Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Categoría</label>
                  <select
                    value={financeCategoryFilter}
                    onChange={(e) => setFinanceCategoryFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-finance-category"
                  >
                    <option value="Todos">Todas las Categorías</option>
                    <option value="Infantil">Infantil (Menores)</option>
                    <option value="Juvenil">Juvenil (Media)</option>
                    <option value="Adulto font-bold">Adulto (Mayores)</option>
                  </select>
                </div>

                {/* Mes Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mes</label>
                  <select
                    value={financeMonthFilter}
                    onChange={(e) => setFinanceMonthFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-finance-month"
                  >
                    <option value="General">Todos los Meses (General)</option>
                    <option value="Marzo">Marzo</option>
                    <option value="Abril">Abril</option>
                    <option value="Mayo">Mayo</option>
                    <option value="Junio">Junio</option>
                    <option value="Julio">Julio</option>
                    <option value="Agosto">Agosto</option>
                    <option value="Septiembre">Septiembre</option>
                    <option value="Octubre">Octubre</option>
                    <option value="Noviembre">Noviembre</option>
                    <option value="Diciembre">Diciembre</option>
                  </select>
                </div>

                {/* Año Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Año</label>
                  <select
                    value={financeYearFilter}
                    onChange={(e) => setFinanceYearFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-finance-year"
                  >
                    <option value="General">Todos los Años</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                {/* Cleanser */}
                {(financeCategoryFilter !== 'Todos' || financeMonthFilter !== 'General' || financeYearFilter !== 'General') && (
                  <button
                    onClick={() => {
                      setFinanceCategoryFilter('Todos');
                      setFinanceMonthFilter('General');
                      setFinanceYearFilter('General');
                    }}
                    className="self-end px-3.5 py-2 border border-rose-100 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    id="btn-clear-finance-filters"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>

            {/* ===================== Live Payment Vouchers Inbox ===================== */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 space-y-6 shadow-xs" id="vouchers-review-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <span className="text-lg">📬</span>
                    Control y Validación de Vouchers de Pago
                    {vouchers.filter(v => v.status === 'pending').length > 0 && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                        {vouchers.filter(v => v.status === 'pending').length} PENDIENTES
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspeccione las transferencias enviadas por apoderados. Al aceptar se generará al instante el recibo pagado para cada alumno y categoría.
                  </p>
                </div>
              </div>

              {vouchers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                  No hay comprobantes cargados en el sistema en este momento. Los apoderados pueden enviarlos desde su portal.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {vouchers.map(v => {
                    const isPending = v.status === 'pending';
                    let statusStyle = "bg-amber-50 text-amber-800 border-amber-150";
                    if (v.status === 'approved') statusStyle = "bg-emerald-50 text-emerald-800 border-emerald-150";
                    if (v.status === 'rejected') statusStyle = "bg-rose-50 text-rose-800 border-rose-150";

                    return (
                      <div 
                        key={v.id} 
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                          isPending 
                            ? 'bg-slate-50/55 border-slate-200 hover:bg-slate-50' 
                            : 'bg-white border-slate-100 opacity-90'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header of voucher item */}
                          <div className="flex justify-between items-start gap-2.5">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">{v.parentName}</h4>
                              <p className="text-[10px] text-slate-450 font-bold font-mono">Contacto: {v.parentPhone}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg border font-black text-[9px] tracking-wider uppercase shrink-0 ${statusStyle}`}>
                              {v.status === 'pending' ? '⏳ PENDIENTE' : v.status === 'approved' ? '✅ APROBADO' : '❌ RECHAZADO'}
                            </span>
                          </div>

                          {/* Student detail block */}
                          <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1.5 shadow-2xs">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Alumnos liquidados por esta transferencia:</span>
                            <div className="space-y-1.5">
                              {v.students.map((st, i) => (
                                <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-705 text-slate-700">
                                  <span>👤 {st.playerName} ({st.category})</span>
                                  <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                    {st.months.join(', ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Note text written by parent */}
                          <div className="text-xs text-slate-605 text-slate-600 bg-slate-100/40 p-3 rounded-xl border border-dashed border-slate-200 leading-relaxed font-semibold italic">
                            "{v.message}"
                          </div>

                          {/* Ref details & amount */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-mono text-slate-500 font-bold">Hash/Ref: <strong className="text-slate-705 text-slate-700 select-all font-bold">{v.referenceCode}</strong></span>
                            <span className="text-sm font-black text-cyan-800 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-xl">
                              ${v.totalAmount.toLocaleString('es-CL')} CLP
                            </span>
                          </div>
                        </div>

                        {/* Approvals action rail */}
                        <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => setPreviewingVoucher(v)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 text-[10px]"
                          >
                            <span>📎</span> Ver Recibo
                          </button>

                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onRejectVoucher(v.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-100 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ml-auto text-[10px]"
                              >
                                Rechazar
                              </button>
                              <button
                                type="button"
                                onClick={() => onApproveVoucher(v.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 ml-1 text-[10px]"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Aprobar Transmisión
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold ml-auto font-mono">
                              Validado: {new Date(v.createdAt).toLocaleDateString('es-CL')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title={financeMonthFilter === 'General' ? 'Ingresos Totales CLP' : `Ingresos (${financeMonthFilter})`}
                value={`$${financeMetrics.totalRevenue.toLocaleString('es-CL')} CLP`}
                icon={<DollarSign className="w-5 h-5" />}
                trend={{
                  value: Math.abs(financeMetrics.growthPct),
                  isPositive: financeMetrics.growthPct >= 0
                }}
                subtitle={`${financeMetrics.prevRevenue > 0 ? `$${financeMetrics.prevRevenue.toLocaleString('es-CL')} CLP balance anterior` : 'Sin registros anteriores'}`}
                color="emerald"
              />

              <MetricCard
                title={financeMonthFilter === 'General' ? 'Cuotas Pendientes Año' : `Cuotas Pendientes (${financeMonthFilter})`}
                value={`$${financeMetrics.outstandingDebt.toLocaleString('es-CL')} CLP`}
                icon={<AlertTriangle className="w-5 h-5" />}
                subtitle="Saldos por cobrar cargados"
                color="amber"
              />

              <MetricCard
                title="Monitoreo de Pagos"
                value={`${financeMetrics.alDiaCount} Al Día`}
                icon={<CheckCircle className="w-5 h-5 font-bold" />}
                subtitle={`${financeMetrics.atrasadoCount} con moras pendientes`}
                color="indigo"
              />

              <MetricCard
                title="Registro de Matrícula"
                value={`${financeMetrics.activeCount} Activos`}
                icon={<Users className="w-5 h-5" />}
                subtitle={`${financeMetrics.bajaCount} alumnos dados de baja`}
                color="blue"
              />
            </div>

            {/* FULL YEAR INCOME HISTOGRAM CHART (ONLY COLUMNS) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Distribución de Recaudación ({financeMonthFilter === 'General' ? 'Anual' : financeMonthFilter})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Métricas de ingresos representadas en columnas independientes de cobro. Haz clic en una columna para interactuar.
                  </p>
                </div>
                
                {/* Chart Legends */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 bg-[#38bdf8] rounded-md inline-block" />
                    <span>Categoría Infantil</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 bg-[#6366f1] rounded-md inline-block" />
                    <span>Categoría Juvenil</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 bg-[#00966e] rounded-md inline-block" />
                    <span>Categoría Adulto</span>
                  </div>
                </div>
              </div>

              {/* Exact responsive SVG implementation */}
              <div className="w-full relative bg-slate-50/50 p-4 rounded-2xl border border-slate-100 overflow-x-auto">
                <div className="min-w-[800px]">
                  {(() => {
                    const catColors: Record<Category, string> = {
                      Infantil: '#38bdf8', // sky-400
                      Juvenil: '#6366f1',  // indigo-500
                      Adulto: '#00966e'    // original green / themed emerald
                    };

                    // Active months to display
                    const activeMonthsData = annualFinanceData.filter(d => {
                      if (financeMonthFilter !== 'General') {
                        return d.month === financeMonthFilter;
                      }
                      return true;
                    });

                    // Active categories to display
                    const activeCategories: Category[] = financeCategoryFilter === 'Todos'
                      ? ['Infantil', 'Juvenil', 'Adulto']
                      : [financeCategoryFilter as Category];

                    const actualMax = Math.max(
                      ...activeMonthsData.flatMap(d => 
                        activeCategories.map(cat => d[cat] || 0)
                      ),
                      0
                    );

                    // If actual values are zero, show a dynamic small scale of $30.000 CLP
                    const maxBarValue = actualMax > 0 ? actualMax : 30000;

                    // Choose an intelligent round-up based on the volume of revenue
                    let roundedMaxVal = 30000;
                    if (maxBarValue <= 12000) {
                      roundedMaxVal = Math.ceil(maxBarValue / 2000) * 2000 || 2000;
                    } else if (maxBarValue <= 40000) {
                      roundedMaxVal = Math.ceil(maxBarValue / 5000) * 5000 || 5000;
                    } else if (maxBarValue <= 120000) {
                      roundedMaxVal = Math.ceil(maxBarValue / 10000) * 10000 || 10000;
                    } else if (maxBarValue <= 350000) {
                      roundedMaxVal = Math.ceil(maxBarValue / 50000) * 50000 || 50000;
                    } else {
                      roundedMaxVal = Math.ceil(maxBarValue / 100000) * 100000 || 100000;
                    }

                    const startX = 100;
                    const endX = 910;
                    const availableWidth = endX - startX;
                    const totalMonths = activeMonthsData.length;
                    const monthSlotWidth = availableWidth / totalMonths;

                    return (
                      <svg viewBox="0 0 950 310" className="w-full h-auto overflow-visible select-none">
                        {/* Horizontal light dashed Gridlines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                          const yLevel = 260 - ratio * 210;
                          const gridVal = roundedMaxVal * ratio;
                          return (
                            <g key={idx}>
                              <line 
                                x1={startX - 10} 
                                y1={yLevel} 
                                x2={endX} 
                                y2={yLevel} 
                                stroke="#f1f5f9" 
                                strokeWidth={1} 
                                strokeDasharray="3 3"
                              />
                              {/* Left ticks numerical label */}
                              <text 
                                x={startX - 22} 
                                y={yLevel + 4} 
                                textAnchor="end" 
                                className="fill-slate-400 font-mono text-[11px] font-bold"
                              >
                                {gridVal === 0 
                                  ? '$0' 
                                  : gridVal >= 1000000
                                    ? `$${(gridVal / 1000000).toLocaleString('es-CL', { maximumFractionDigits: 1 })}M`
                                    : gridVal >= 10000
                                      ? `$${(gridVal / 1000).toLocaleString('es-CL')}k`
                                      : `$${gridVal.toLocaleString('es-CL')}`}
                              </text>
                            </g>
                          );
                        })}

                        {/* Y-Axis Line */}
                        <line 
                          x1={startX - 10} 
                          y1={50} 
                          x2={startX - 10} 
                          y2={260} 
                          stroke="#94a3b8" 
                          strokeWidth={1.5} 
                        />

                        {/* X-Axis Line */}
                        <line 
                          x1={startX - 10} 
                          y1={260} 
                          x2={endX} 
                          y2={260} 
                          stroke="#94a3b8" 
                          strokeWidth={1.5} 
                        />

                        {/* Y-Axis notches / ticks */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                          const yLevel = 260 - ratio * 210;
                          return (
                            <line 
                              key={idx}
                              x1={startX - 15} 
                              y1={yLevel} 
                              x2={startX - 10} 
                              y2={yLevel} 
                              stroke="#94a3b8" 
                              strokeWidth={1.5} 
                            />
                          );
                        })}

                        {/* Beautiful Teal Columns & Dynamic Top Labels */}
                        {activeMonthsData.map((d, monthIdx) => {
                          const monthCenterX = startX + monthIdx * monthSlotWidth + monthSlotWidth / 2;
                          const numCats = activeCategories.length;

                          const colWidth = totalMonths === 1 
                            ? 150 
                            : (numCats === 3 ? 15 : 36);

                          const gap = totalMonths === 1 ? 24 : 3;
                          const totalGroupWidth = numCats * colWidth + (numCats - 1) * gap;
                          const groupStart = monthCenterX - totalGroupWidth / 2;

                          return (
                            <g key={d.month} className="group transition-all duration-300">
                              {/* Background trigger space for hover / click selection */}
                              <rect 
                                x={monthCenterX - monthSlotWidth / 2 + 2}
                                y={35}
                                width={monthSlotWidth - 4}
                                height={225}
                                fill="transparent"
                                className="hover:fill-slate-950/[0.015] transition-colors cursor-pointer rounded-xl"
                                onClick={() => {
                                  if (financeMonthFilter === 'General') {
                                    setFinanceMonthFilter(d.month);
                                  } else {
                                    setFinanceMonthFilter('General');
                                  }
                                }}
                              />

                              {activeCategories.map((cat, catIdx) => {
                                const value = d[cat] || 0;
                                const colX = groupStart + catIdx * (colWidth + gap);
                                const h = (value / roundedMaxVal) * 210;
                                const y = 260 - h;
                                const barColor = catColors[cat];

                                return (
                                  <g key={cat} className="transition-all duration-200">
                                    {/* Column Bar */}
                                    {h > 2 && (
                                      <g>
                                        <rect 
                                          x={colX} 
                                          y={y} 
                                          width={colWidth} 
                                          height={h} 
                                          fill={barColor} 
                                          rx={Math.min(5, colWidth / 2.5)} 
                                          ry={Math.min(5, colWidth / 2.5)}
                                          className="transition-all duration-300 hover:brightness-95 cursor-pointer" 
                                          onClick={() => {
                                            if (financeMonthFilter === 'General') {
                                              setFinanceMonthFilter(d.month);
                                            } else {
                                              setFinanceMonthFilter('General');
                                            }
                                          }}
                                        />
                                        {/* Flatten bottom of the bar */}
                                        {h > 6 && (
                                          <rect 
                                            x={colX} 
                                            y={260 - 6} 
                                            width={colWidth} 
                                            height={6} 
                                            fill={barColor} 
                                          />
                                        )}
                                      </g>
                                    )}

                                    {/* Numerical text on top */}
                                    {value > 0 && (
                                      <text 
                                        x={colX + colWidth / 2} 
                                        y={y - 8} 
                                        textAnchor="middle" 
                                        className="font-sans font-black"
                                        style={{ fontSize: totalMonths === 1 ? '11px' : '8px', fill: barColor }}
                                      >
                                        {totalMonths === 1 
                                          ? `$${value.toLocaleString('es-CL')}`
                                          : `$${Math.round(value / 1000)}k`
                                        }
                                      </text>
                                    )}
                                  </g>
                                );
                              })}

                              {/* Label under Column Group */}
                              <text 
                                x={monthCenterX} 
                                y={282} 
                                textAnchor="middle" 
                                className={`text-[11px] font-sans font-bold tracking-tight cursor-pointer ${
                                  financeMonthFilter === d.month 
                                    ? 'fill-emerald-600 font-extrabold text-xs' 
                                    : 'fill-slate-600 hover:fill-slate-900'
                                }`}
                                onClick={() => {
                                  if (financeMonthFilter === 'General') {
                                    setFinanceMonthFilter(d.month);
                                  } else {
                                    setFinanceMonthFilter('General');
                                  }
                                }}
                              >
                                {totalMonths === 1 
                                  ? `${d.month} ${financeYearFilter !== 'General' ? financeYearFilter : ''}`
                                  : d.month.substring(0, 3).toUpperCase()
                                }
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Explanatory Legend explaining each Category in detail */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-xs font-black">INFO</span>
                  <p className="text-xs font-extrabold text-slate-500">¿Qué representa cada categoría en el reporte?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Infantil Legend explanation card */}
                  <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50/20 hover:bg-sky-50/45 transition-colors space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-sky-400 rounded-full" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{categoryExplanations.Infantil.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {categoryExplanations.Infantil.desc}
                    </p>
                    <div className="pt-2 border-t border-sky-100/55 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Activos / Baja</span>
                        <span className="text-slate-700 font-black">{categoryExplanations.Infantil.activeCount} m. / {categoryExplanations.Infantil.bajaCount} b.</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Recaudación Yr</span>
                        <span className="text-sky-600 font-extrabold">${categoryExplanations.Infantil.paidSum.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Juvenil Legend explanation card */}
                  <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/15 hover:bg-indigo-50/30 transition-colors space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{categoryExplanations.Juvenil.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {categoryExplanations.Juvenil.desc}
                    </p>
                    <div className="pt-2 border-t border-indigo-100/40 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Activos / Baja</span>
                        <span className="text-slate-700 font-black">{categoryExplanations.Juvenil.activeCount} m. / {categoryExplanations.Juvenil.bajaCount} b.</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Recaudación Yr</span>
                        <span className="text-indigo-600 font-extrabold">${categoryExplanations.Juvenil.paidSum.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Adulto Legend explanation card */}
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/15 hover:bg-emerald-50/30 transition-colors space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{categoryExplanations.Adulto.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {categoryExplanations.Adulto.desc}
                    </p>
                    <div className="pt-2 border-t border-emerald-100/40 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Activos / Baja</span>
                        <span className="text-slate-700 font-black">{categoryExplanations.Adulto.activeCount} m. / {categoryExplanations.Adulto.bajaCount} b.</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans font-bold uppercase tracking-wider">Recaudación Yr</span>
                        <span className="text-emerald-600 font-extrabold">${categoryExplanations.Adulto.paidSum.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Debtors List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Morosidad y Cobros por WhatsApp
                      </h3>
                      <p className="text-xs text-slate-400">
                        Visualiza qué alumnos tienen saldos cargados y envíales un recordatorio amigable directo a su celular.
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 font-mono text-[11px] font-bold px-3 py-1.5 rounded-full">
                      Adeudado Total: ${debtorPlayers.reduce((sum, d) => sum + d.totalOwed, 0).toLocaleString('es-CL')} CLP
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/70 border-b border-slate-100 text-xs text-slate-500 font-extrabold uppercase sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4">Alumno</th>
                          <th className="py-3 px-4">Meses Impagos</th>
                          <th className="py-3 px-4">Monto Adeudado</th>
                          <th className="py-3 px-4 text-right">Cobro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {debtorPlayers
                          .filter(d => financeCategoryFilter === 'Todos' || d.player.category === financeCategoryFilter)
                          .filter(d => financeMonthFilter === 'General' || d.pendingMonths.includes(financeMonthFilter))
                          .length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400">
                              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                              ¡Espectacular! Todos los alumnos del filtro están al día.
                            </td>
                          </tr>
                        ) : (
                          debtorPlayers
                            .filter(d => financeCategoryFilter === 'Todos' || d.player.category === financeCategoryFilter)
                            .filter(d => financeMonthFilter === 'General' || d.pendingMonths.includes(financeMonthFilter))
                            .map(({ player, pendingMonths, totalOwed }) => (
                              <tr key={player.id} className="hover:bg-slate-50/40">
                                <td className="py-4 px-4">
                                  <div className="font-semibold text-slate-700">{player.name}</div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">Cat: {player.category} {player.parentName ? `(${player.parentName})` : ''}</div>
                                </td>
                                <td className="py-4 px-4 font-medium text-amber-600 text-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {pendingMonths.map(m => (
                                      <span key={m} className={`bg-amber-50 border border-amber-200/50 text-amber-850 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${financeMonthFilter === m ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-100' : ''}`}>
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-4 px-4 font-extrabold text-slate-700">
                                  ${totalOwed.toLocaleString('es-CL')} CLP
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    <button
                                      onClick={() => handleCopyReminderText(player, pendingMonths, totalOwed)}
                                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-xl transition-all relative flex items-center justify-center cursor-pointer"
                                      title="Copiar texto de recordatorio"
                                    >
                                      {copiedPlayerId === player.id ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                    <a
                                      href={getWhatsAppLink(player, pendingMonths, totalOwed)}
                                      target="_blank"
                                      rel="noreferrer referrer"
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                                    >
                                      <Send className="w-4 h-4" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Attendance Chart Column */}
              <div className="lg:col-span-1">
                <AttendanceChart attendanceData={categoryAttendanceStats} />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: INSCRIPCION DE ALUMNOS ==================== */}
        {activeTab === 'inscripcion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Direct enrollment form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  Inscripción de Nuevo Alumno
                </h3>
                <p className="text-xs text-slate-400">
                  Formulario directo de matrícula. Configure los datos para inicializar automáticamente la libreta de cuotas en pesos chilenos.
                </p>
              </div>

              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Nombre Completo del Alumno *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Sanhueza"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Categoría Deportiva *</label>
                    <select
                      value={newPlayerCategory}
                      onChange={(e) => setNewPlayerCategory(e.target.value as Category)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700"
                    >
                      <option value="Infantil">Infantil (Sub-12)</option>
                      <option value="Juvenil">Juvenil (Sub-17)</option>
                      <option value="Adulto">Adulto (+18)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Celular de Contacto (WhatsApp) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold font-mono">+56</span>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 912345678"
                        value={newPlayerPhone}
                        onChange={(e) => setNewPlayerPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Nombre del Apoderado / Tutor *</label>
                    <input
                      type="text"
                      required={newPlayerCategory !== 'Adulto'}
                      disabled={newPlayerCategory === 'Adulto'}
                      placeholder={newPlayerCategory === 'Adulto' ? 'Autosuficiente' : 'Ej. Clara Sanhueza'}
                      value={newPlayerCategory === 'Adulto' ? 'Autosuficiente' : newPlayerParentName}
                      onChange={(e) => setNewPlayerParentName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Simulated Fee Card */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-xs sm:text-sm font-bold text-emerald-900">
                  <span>Mensualidad proyectada (CLP)</span>
                  <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                    ${getMonthlyFee(newPlayerCategory).toLocaleString('es-CL')} CLP/mes
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs sm:text-sm shrink-0 transition-colors cursor-pointer text-center"
                >
                  Confirmar Matrícula y Crear Roster
                </button>
              </form>
            </div>

            {/* Quick list of last registered players */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Alumnos Nuevos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Últimas incorporaciones añadidas a la libreta del club.
                  </p>
                </div>

                <div className="space-y-3">
                  {players.slice(-4).reverse().map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-705 text-left">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Cat: {p.category} • {p.createdAt}</div>
                      </div>
                      <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded">
                        Nuevo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SCHEDULE MATCH MODAL OVERLAY */}
      <AnimatePresence>
        {isSchedulingMatch && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-6 relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsSchedulingMatch(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:bg-slate-55 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-850 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  Programar Nuevo Partido
                </h4>
                <p className="text-xs text-slate-400">
                  Registre un encuentro de liga, amistoso o copa para toda la hinchada.
                </p>
              </div>

              <form onSubmit={handleScheduleMatchLocal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Rival / Oponente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Colo Colo Filial"
                    value={matchOpponent}
                    onChange={(e) => setMatchOpponent(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Categoría *</label>
                    <select
                      value={matchCategory}
                      onChange={(e) => setMatchCategory(e.target.value as Category)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="Infantil">Infantil</option>
                      <option value="Juvenil">Juvenil</option>
                      <option value="Adulto">Adulto</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Tipo *</label>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value as 'Liga' | 'Amistoso' | 'Copa')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="Liga">Liga</option>
                      <option value="Amistoso">Amistoso</option>
                      <option value="Copa">Copa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Hora *</label>
                    <input
                      type="time"
                      required
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Cancha / Recinto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cancha Cordillera N° 2"
                    value={matchField}
                    onChange={(e) => setMatchField(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSchedulingMatch(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 text-xs cursor-pointer text-center"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs cursor-pointer text-center"
                  >
                    Programar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ATTENDANCE NEW SESSION OVERLAY */}
        {isAddingDate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsAddingDate(false)}
                className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
                id="btn-close-modal-date"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Nueva Fecha de Entrenamiento
                </h4>
                <p className="text-xs text-slate-450 text-slate-400">
                  Agregue una nueva columna para registrar asistencia de pauta de alumnos.
                </p>
              </div>

              <form onSubmit={handleAddAttendanceDateLocal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Fecha del Entrenamiento *</label>
                  <input
                    type="date"
                    required
                    value={newDateValue}
                    onChange={(e) => setNewDateValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    id="input-new-attendance-date"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingDate(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-5 * text-slate-500 font-semibold text-xs cursor-pointer text-center"
                    id="btn-cancel-add-date"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs cursor-pointer text-center"
                    id="btn-submit-add-date"
                  >
                    Crear Sesión
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {previewingVoucher && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-slate-150 text-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewingVoucher(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                id="close-preview-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center pb-2 border-b border-slate-100">
                <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-100 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">
                  BANCO DE CHILE / TRANSFERENCIA RECIBIDA
                </span>
                <h4 className="text-lg font-bold text-slate-800 font-sans">Comprobante de Caja Digital</h4>
                <p className="text-[10px] text-slate-400 font-mono">ID Transacción: {previewingVoucher.referenceCode}</p>
              </div>

              {/* Bank Metadata layout */}
              <div className="space-y-4 font-mono text-xs text-left">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">Remitente</span>
                    <strong className="text-slate-700 block text-[11px] truncate">{previewingVoucher.parentName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 block uppercase">Contacto</span>
                    <strong className="text-slate-700 block text-[11px]">{previewingVoucher.parentPhone}</strong>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-2 text-left">
                    <span className="text-[9px] text-slate-450 block uppercase">Monto Consolidado</span>
                    <strong className="text-emerald-700 block text-lg font-black">${previewingVoucher.totalAmount.toLocaleString('es-CL')} CLP</strong>
                  </div>
                </div>

                {/* Listing itemizations */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Desglose de Distribución:</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {previewingVoucher.students.map((st, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px] leading-tight font-sans border-b border-slate-100/50 pb-1.5 last:border-none last:pb-0">
                        <div>
                          <strong className="text-slate-850 block font-bold">👤 {st.playerName}</strong>
                          <span className="text-[9px] text-slate-400 font-bold block">Categoría: {st.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="bg-cyan-50 border border-cyan-100 text-cyan-800 font-black px-1.5 py-0.5 rounded text-[9px] block">
                            {st.months.join(', ')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                            ${(getMonthlyFee(st.category) * st.months.length).toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watermark logo */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-[10px] text-emerald-800 font-sans">
                  <span className="text-base text-emerald-600">🛡️</span>
                  <p className="leading-snug">
                    Respaldo digital de Los Halcones. Al confirmar la transacción, la libreta contable del club se actualizará.
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewingVoucher(null)}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cerrar Vista Recibo
                </button>
                {previewingVoucher.status === 'pending' && (
                  <button
                    onClick={() => {
                      onApproveVoucher(previewingVoucher.id);
                      setPreviewingVoucher(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Aprobar Ahora
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
