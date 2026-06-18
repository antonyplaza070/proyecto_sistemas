import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Check, CheckCircle, Clock, MapPin, 
  Users, Award, Plus, Trash2, Send, LogOut, Search, Info 
} from 'lucide-react';
import { Player, Attendance, Match, Announcement, Category } from '../types';

interface TeacherPortalProps {
  teacherName: string;
  category: Category;
  email: string;
  players: Player[];
  attendance: Attendance[];
  matches: Match[];
  announcements: Announcement[];
  onToggleAttendance: (playerId: string, date: string) => void;
  onAddAttendanceDate: (date: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onLogout: () => void;
}

export default function TeacherPortal({
  teacherName,
  category,
  email,
  players,
  attendance,
  matches,
  announcements,
  onToggleAttendance,
  onAddAttendanceDate,
  onAddAnnouncement,
  onLogout
}: TeacherPortalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-15');
  const [searchQuery, setSearchQuery] = useState('');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<'info' | 'warning' | 'success'>('info');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // New attendance date form state
  const [newDate, setNewDate] = useState('');
  const [showAddNewDate, setShowAddNewDate] = useState(false);

  // Filter players owned/trained by this teacher (coinciding with the category)
  const categoryPlayers = useMemo(() => {
    return players.filter(p => p.category === category);
  }, [players, category]);

  // Filtered players based on search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return categoryPlayers;
    return categoryPlayers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.parentName && p.parentName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categoryPlayers, searchQuery]);

  // Unique training dates available in attendance log
  const trainingDates = useMemo(() => {
    const datesSet = new Set<string>();
    // Pre-seed some dates if empty
    datesSet.add('2026-06-01');
    datesSet.add('2026-06-04');
    datesSet.add('2026-06-08');
    datesSet.add('2026-06-11');
    datesSet.add('2026-06-15');
    
    attendance.forEach(att => {
      datesSet.add(att.date);
    });
    return Array.from(datesSet).sort((a, b) => b.localeCompare(a)); // Descending order
  }, [attendance]);

  // Calculate stats for this teacher's category
  const stats = useMemo(() => {
    const totalPlayers = categoryPlayers.length;
    
    // Attendance on selected date
    const selectedDateAttendance = attendance.filter(att => att.date === selectedDate);
    const attendedOnDate = selectedDateAttendance.filter(att => {
      const player = categoryPlayers.find(p => p.id === att.playerId);
      return player && att.attended;
    }).length;

    // Overall attendance percentage for this category
    const categoryPlayerIds = categoryPlayers.map(p => p.id);
    const categoryAttendance = attendance.filter(att => categoryPlayerIds.includes(att.playerId));
    const totalRecords = categoryAttendance.length;
    const totalAttended = categoryAttendance.filter(att => att.attended).length;
    const overallPercentage = totalRecords > 0 ? (totalAttended / totalRecords) * 100 : 0;

    return {
      totalPlayers,
      attendedOnDate,
      overallPercentage: Math.round(overallPercentage)
    };
  }, [categoryPlayers, attendance, selectedDate]);

  // Filter category announcements
  const categoryAnnouncements = useMemo(() => {
    return announcements.filter(ann => ann.category === category || ann.category === 'General');
  }, [announcements, category]);

  // Filter category matches
  const categoryMatches = useMemo(() => {
    return matches.filter(m => m.category === category);
  }, [matches, category]);

  const handleAddNewAttendanceDate = (e: FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    onAddAttendanceDate(newDate);
    setSelectedDate(newDate);
    setNewDate('');
    setShowAddNewDate(false);
  };

  const handlePostAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementMessage.trim()) return;

    onAddAnnouncement({
      id: `ann_teacher_${Date.now()}`,
      category: category,
      title: newAnnouncementTitle,
      message: newAnnouncementMessage,
      date: new Date().toISOString().split('T')[0],
      type: newAnnouncementType,
      active: true
    });

    setNewAnnouncementTitle('');
    setNewAnnouncementMessage('');
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 3000);
  };

  return (
    <div className="space-y-8" id="teacher-portal-root">
      {/* HEADER SECTION IN CYAN/WATER */}
      <div className="bg-gradient-to-r from-cyan-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500 font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold shadow-xs">
              Módulo de Profesores
            </span>
            <span className="text-cyan-300 font-medium text-xs">● Categoría {category}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            ¡Hola, {teacherName}! ⚽
          </h2>
          <p className="text-cyan-100 max-w-xl text-xs sm:text-sm leading-relaxed">
            Bienvenido a tu tablero deportivo de Los Halcones. Aquí puedes registrar la asistencia diaria, publicar avisos urgentes para los apoderados, y consultar los próximos partidos.
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 relative z-10 text-xs sm:text-sm shrink-0 duration-205 cursor-pointer"
          id="btn-teacher-logout"
        >
          <LogOut className="w-4 h-4 text-cyan-200" />
          Cambiar Perfil
        </button>
      </div>

      {/* METRIC CARDS IN CYAN VARIATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mis Alumnos</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight font-mono">{stats.totalPlayers}</h4>
            <p className="text-[11px] text-slate-500">Categoría {category}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 font-bold shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Asistencia Hoy</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight font-mono">{stats.attendedOnDate} <span className="text-xs text-slate-400 font-bold">de {stats.totalPlayers}</span></h4>
            <p className="text-[11px] text-slate-500 font-mono">Clase de {selectedDate}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rendimiento Asistencia</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight font-mono">{stats.overallPercentage}%</h4>
            <p className="text-[11px] text-slate-500">Histórico de la división</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT & CENTER PANEL: ATTENDANCE & ROSTER */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DAILY ATTENDANCE MANAGER */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  Registro de Asistencia Diaria
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona la fecha para marcar la asistencia de tu categoría.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 flex-1 sm:flex-initial"
                >
                  {trainingDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddNewDate(!showAddNewDate)}
                  className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Fecha
                </button>
              </div>
            </div>

            {/* ADD NEW DATE FORM EXPANDABLE */}
            <AnimatePresence>
              {showAddNewDate && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddNewAttendanceDate}
                  className="bg-cyan-50/40 border border-cyan-100 p-4 rounded-2xl space-y-3 overflow-hidden"
                >
                  <h4 className="text-xs font-black text-cyan-900">Agregar Nueva Sesión de Entrenamiento</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="date" 
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <div className="flex gap-2 shrink-0">
                      <button 
                        type="submit" 
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Crear e Ir
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAddNewDate(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* SEARCH AND ROSTER TABLE */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar alumno en esta categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-mono">
                      <th className="py-3 px-4">Jugador</th>
                      <th className="py-3 px-4">Apoderado / Tutor</th>
                      <th className="py-3 px-4 text-center">Estado Asistencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-400">
                          Ningún alumno coincide con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredPlayers.map(p => {
                        const attRecord = attendance.find(a => a.playerId === p.id && a.date === selectedDate);
                        const attended = attRecord ? attRecord.attended : false;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-slate-800 block">{p.name}</span>
                              <span className="text-[10px] text-[10.5px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 mt-1 inline-block">
                                ID: {p.id.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              <div>{p.parentName || 'Autosuficiente'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{p.phone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => onToggleAttendance(p.id, selectedDate)}
                                className={`px-4 py-2 rounded-xl text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer ${
                                  attended 
                                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500' 
                                    : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-250 text-slate-400 border border-transparent'
                                }`}
                              >
                                {attended ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                    Presente
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-slate-350" />
                                    Ausente
                                  </>
                                )}
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
            
            <div className="bg-cyan-50/30 p-4 border border-cyan-100/50 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-800 leading-relaxed leading-relaxed font-sans mt-2">
              <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                Los datos de asistencia se guardan y reflejan en tiempo real tanto en la libreta consolidada de Don Rafa como en los portales correspondientes de cada apoderado.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ANNOUNCEMENTS & MATCHES */}
        <div className="space-y-6">
          
          {/* POST ANNOUNCEMENT PANEL */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-600" />
                Nueva Nota de Mural (Categoría {category})
              </h3>
              <p className="text-[11px] text-slate-400">
                Publica un aviso visible de inmediato para todos los padres de tu categoría.
              </p>
            </div>

            {announcementSuccess && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-3 py-2 rounded-xl text-center font-bold">
                ¡Aviso publicado con éxito! 🎉
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Título del Aviso:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cambio de cancha el viernes"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Mensaje de la nota:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Estimados padres, este viernes entrenaremos en la cancha auxiliar por mantención de la principal..."
                  value={newAnnouncementMessage}
                  onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:outline-none font-semibold text-slate-800 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Severidad de la nota:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAnnouncementType('info')}
                    className={`py-1.5 rounded-lg font-bold border transition-colors ${
                      newAnnouncementType === 'info' 
                        ? 'bg-blue-50 border-blue-400 text-blue-800' 
                        : 'bg-white border-slate-200 text-slate-550'
                    }`}
                  >
                    Informativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAnnouncementType('warning')}
                    className={`py-1.5 rounded-lg font-bold border transition-colors ${
                      newAnnouncementType === 'warning' 
                        ? 'bg-amber-50 border-amber-400 text-amber-800' 
                        : 'bg-white border-slate-200 text-slate-550'
                    }`}
                  >
                    Urgente
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAnnouncementType('success')}
                    className={`py-1.5 rounded-lg font-bold border transition-colors ${
                      newAnnouncementType === 'success' 
                        ? 'bg-teal-50 border-teal-400 text-teal-800' 
                        : 'bg-white border-slate-200 text-slate-550'
                    }`}
                  >
                    Buenas Noticias
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar en Cartelera
              </button>
            </form>
          </div>

          {/* SCHEDULE AND MATCHES PREVIEW */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                Fixture Categoría {category}
              </h3>
              <p className="text-[11px] text-slate-400">
                Próximos compromisos deportivos calendarizados.
              </p>
            </div>

            <div className="space-y-3">
              {categoryMatches.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No hay partidos agendados en esta categoría.</p>
              ) : (
                categoryMatches.map(m => (
                  <div key={m.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-cyan-50 text-cyan-800 border border-cyan-100/80 font-black px-2 py-0.5 rounded uppercase">
                        {m.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {m.date}
                      </span>
                    </div>

                    <h5 className="text-xs font-extrabold text-slate-850">
                      ⚽ Halcones vs {m.opponent}
                    </h5>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-semibold font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 text-slate-400" />
                        {m.time} hrs
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{m.field}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
