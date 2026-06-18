import { Player, Payment, Attendance, Match } from './types';

export const initialPlayers: Player[] = [
  // --- INFANTIL CATEGORY (15 Players) ---
  { id: 'p1', name: 'Mateo Gómez', category: 'Infantil', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-01-10' },
  { id: 'p2', name: 'Santiago Pérez', category: 'Infantil', parentName: 'Carlos Pérez', phone: '5523456789', createdAt: '2026-01-12' },
  { id: 'p3', name: 'Valentín Ruiz', category: 'Infantil', parentName: 'María Ruiz', phone: '5534567890', createdAt: '2026-01-15' },
  { id: 'p4', name: 'Diego Díaz', category: 'Infantil', parentName: 'Rosa Díaz', phone: '5545678901', createdAt: '2026-01-18' },
  { id: 'p5', name: 'Matías Castro', category: 'Infantil', parentName: 'Héctor Castro', phone: '5556789012', createdAt: '2026-02-01' },
  { id: 'p6', name: 'Thiago López', category: 'Infantil', parentName: 'Sonia López', phone: '5567890123', createdAt: '2026-02-05' },
  { id: 'p7', name: 'Daniel Sosa', category: 'Infantil', parentName: 'Andrés Sosa', phone: '5578901234', createdAt: '2026-02-10' },
  { id: 'p8', name: 'Sebastián Ruiz', category: 'Infantil', parentName: 'María Ruiz', phone: '5534567890', createdAt: '2026-02-14' },
  { id: 'p9', name: 'Nicolás Flores', category: 'Infantil', parentName: 'Gabriela Torres', phone: '5501234567', createdAt: '2026-02-20' },
  { id: 'p10', name: 'Alejandro Torres', category: 'Infantil', parentName: 'Gabriela Torres', phone: '5501234567', createdAt: '2026-03-01' },
  { id: 'p11', name: 'Lucas Romero', category: 'Infantil', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-03-05' },
  { id: 'p12', name: 'Ian Medina', category: 'Infantil', parentName: 'Gabriela Torres', phone: '5501234567', createdAt: '2026-03-10' },
  { id: 'p13', name: 'Felipe Martínez', category: 'Infantil', parentName: 'Gabriela Torres', phone: '5501234567', createdAt: '2026-03-12' },
  { id: 'p14', name: 'Ángel Vargas', category: 'Infantil', parentName: 'Manuel Vargas', phone: '5544556677', createdAt: '2026-03-20' },
  { id: 'p15', name: 'Gael Herrera', category: 'Infantil', parentName: 'Manuel Vargas', phone: '5544556677', createdAt: '2026-04-01' },

  // --- JUVENIL CATEGORY (15 Players) ---
  { id: 'p16', name: 'Maximiliano Cruz', category: 'Juvenil', parentName: 'Rosa Díaz', phone: '5545678901', createdAt: '2026-01-11' },
  { id: 'p17', name: 'Leonardo Silva', category: 'Juvenil', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-01-14' },
  { id: 'p18', name: 'Javier Mendoza', category: 'Juvenil', parentName: 'Carlos Pérez', phone: '5523456789', createdAt: '2026-01-19' },
  { id: 'p19', name: 'Bryan Juárez', category: 'Juvenil', parentName: 'Héctor Castro', phone: '5556789012', createdAt: '2026-02-03' },
  { id: 'p20', name: 'Kevin Ortega', category: 'Juvenil', parentName: 'Sonia López', phone: '5567890123', createdAt: '2026-02-07' },
  { id: 'p21', name: 'Emiliano Aguilar', category: 'Juvenil', parentName: 'Andrés Sosa', phone: '5578901234', createdAt: '2026-02-12' },
  { id: 'p22', name: 'Eduardo Rojas', category: 'Juvenil', parentName: 'Manuel Vargas', phone: '5544556677', createdAt: '2026-02-16' },
  { id: 'p23', name: 'Alan Guerrero', category: 'Juvenil', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-02-22' },
  { id: 'p24', name: 'Christian Fuentes', category: 'Juvenil', parentName: 'Sonia López', phone: '5567890123', createdAt: '2026-03-02' },
  { id: 'p25', name: 'Josué Cabrera', category: 'Juvenil', parentName: 'Manuel Vargas', phone: '5544556677', createdAt: '2026-03-08' },
  { id: 'p26', name: 'Rodrigo Palacios', category: 'Juvenil', parentName: 'Rosa Díaz', phone: '5545678901', createdAt: '2026-03-15' },
  { id: 'p27', name: 'Alexis Meza', category: 'Juvenil', parentName: 'María Ruiz', phone: '5534567890', createdAt: '2026-03-22' },
  { id: 'p28', name: 'Manuel Santos', category: 'Juvenil', parentName: 'Carlos Pérez', phone: '5523456789', createdAt: '2026-04-03' },
  { id: 'p29', name: 'Fernando Valenzuela', category: 'Juvenil', parentName: 'Héctor Castro', phone: '5556789012', createdAt: '2026-04-09' },
  { id: 'p30', name: 'Roberto Solís', category: 'Juvenil', parentName: 'Andrés Sosa', phone: '5578901234', createdAt: '2026-04-15' },

  // --- ADULTO CATEGORY (15 Players) ---
  { id: 'p31', name: 'Alejandro Morales', category: 'Adulto', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-01-05' },
  { id: 'p32', name: 'Carlos Domínguez', category: 'Adulto', parentName: 'Carlos Pérez', phone: '5523456789', createdAt: '2026-01-08' },
  { id: 'p33', name: 'Héctor Romero', category: 'Adulto', parentName: 'María Ruiz', phone: '5534567890', createdAt: '2026-01-14' },
  { id: 'p34', name: 'Jorge Ramos', category: 'Adulto', parentName: 'Rosa Díaz', phone: '5545678901', createdAt: '2026-01-20' },
  { id: 'p35', name: 'Ricardo Franco', category: 'Adulto', parentName: 'Héctor Castro', phone: '5556789012', createdAt: '2026-02-02' },
  { id: 'p36', name: 'David Espinoza', category: 'Adulto', parentName: 'Sonia López', phone: '5567890123', createdAt: '2026-02-09' },
  { id: 'p37', name: 'Miguel Corona', category: 'Adulto', parentName: 'Andrés Sosa', phone: '5578901234', createdAt: '2026-02-15' },
  { id: 'p38', name: 'Sergio Bravo', category: 'Adulto', parentName: 'Gabriela Torres', phone: '5501234567', createdAt: '2026-02-25' },
  { id: 'p39', name: 'Francisco Rubio', category: 'Adulto', parentName: 'Manuel Vargas', phone: '5544556677', createdAt: '2026-03-01' },
  { id: 'p40', name: 'Luis Sánchez', category: 'Adulto', parentName: 'Laura Silva', phone: '5512345678', createdAt: '2026-03-06' },
  { id: 'p41', name: 'Gustavo Reyes', category: 'Adulto', parentName: 'Carlos Pérez', phone: '5523456789', createdAt: '2026-03-12' },
  { id: 'p42', name: 'Gabriel Montes', category: 'Adulto', parentName: 'María Ruiz', phone: '5534567890', createdAt: '2026-03-18' },
  { id: 'p43', name: 'Arturo Cárdenas', category: 'Adulto', parentName: 'Rosa Díaz', phone: '5545678901', createdAt: '2026-04-02' },
  { id: 'p44', name: 'Óscar Benítez', category: 'Adulto', parentName: 'Héctor Castro', phone: '5556789012', createdAt: '2026-04-10' },
  { id: 'p45', name: 'Víctor Castillo', category: 'Adulto', parentName: 'Sonia López', phone: '5567890123', createdAt: '2026-04-18' }
];

// Flat monthly fee rates: Infantil: $15.000 | Juvenil: $18.000 | Adulto: $20.000 (CLP)
export const getMonthlyFee = (category: 'Infantil' | 'Juvenil' | 'Adulto'): number => {
  if (category === 'Infantil') return 15000;
  if (category === 'Juvenil') return 18000;
  return 20000;
};

// Generate default payment list
// Let's create payments for Marzo, Abril, Mayo, Junio (2026)
// Marzo: 42 paid, 3 pending
// Abril: 41 paid, 4 pending. Don Rafa recalls "quién pagó doble en abril" (let's say Player 2 & 18 did, so they have status 'paid' for Abril & May early, or can be marked as double-paid)
// Mayo: 38 paid, 7 pending
// Junio (Actual): 24 paid, 21 pending
export const initialPayments: Payment[] = [];

const months = ['Marzo', 'Abril', 'Mayo', 'Junio'];

initialPlayers.forEach(p => {
  const fee = getMonthlyFee(p.category);
  
  // Marzo (Index 0)
  // Let p3, p20, p40 owe Marzo
  const oweMarzo = ['p3', 'p20', 'p40'].includes(p.id);
  initialPayments.push({
    id: `pay_mar_${p.id}`,
    playerId: p.id,
    month: 'Marzo',
    year: 2026,
    status: oweMarzo ? 'pending' : 'paid',
    amount: fee,
    paidDate: oweMarzo ? undefined : '2026-03-05'
  });

  // Abril (Index 1)
  // Let p3, p20, p10, p35 owe Abril
  const oweAbril = ['p3', 'p20', 'p10', 'p35'].includes(p.id);
  initialPayments.push({
    id: `pay_abr_${p.id}`,
    playerId: p.id,
    month: 'Abril',
    year: 2026,
    status: oweAbril ? 'pending' : 'paid',
    amount: fee,
    paidDate: oweAbril ? undefined : '2026-04-04'
  });

  // Mayo (Index 2)
  // Let p3, p20, p10, p35, p7, p28, p45 owe Mayo
  // Let's say p2 paid double in Abril, so they are already 'paid' for Mayo automatically
  const oweMayo = ['p3', 'p20', 'p10', 'p35', 'p7', 'p28', 'p45'].includes(p.id) && p.id !== 'p2';
  initialPayments.push({
    id: `pay_may_${p.id}`,
    playerId: p.id,
    month: 'Mayo',
    year: 2026,
    status: (oweMayo) ? 'pending' : 'paid',
    amount: p.id === 'p2' ? 0 : fee, // was paid double in Abril
    paidDate: oweMayo ? undefined : (p.id === 'p1' ? '2026-04-28' : '2026-05-06')
  });

  // Junio (Index 3 - Current)
  // Around 50% paid
  const hashVal = p.name.charCodeAt(0) + p.name.charCodeAt(p.name.length - 1);
  const oweJunio = hashVal % 2 === 0; // split roughly in half based on name hash
  initialPayments.push({
    id: `pay_jun_${p.id}`,
    playerId: p.id,
    month: 'Junio',
    year: 2026,
    status: oweJunio ? 'pending' : 'paid',
    amount: fee,
    paidDate: oweJunio ? undefined : '2026-06-05'
  });
});

// Generate training attendance
// Training sessions dates:
// 2026-06-01, 2026-06-04, 2026-06-08, 2026-06-11, 2026-06-15 (Current month)
export const initialAttendance: Attendance[] = [];

const trainingDates = ['2026-06-01', '2026-06-04', '2026-06-08', '2026-06-11', '2026-06-15'];

initialPlayers.forEach(p => {
  trainingDates.forEach((date, dateIdx) => {
    // Infantil has higher average (~85%)
    // Juvenil average (~75%)
    // Adulto average (~65%)
    let attendanceChance = 0.85;
    if (p.category === 'Juvenil') attendanceChance = 0.75;
    if (p.category === 'Adulto') attendanceChance = 0.65;

    // Introduce some individual patterns (some kids miss commonly, etc.)
    const playerSeed = p.name.charCodeAt(1) + dateIdx;
    const attended = (playerSeed % 10) / 10 < attendanceChance;

    initialAttendance.push({
      id: `att_${date.replace(/-/g, '_')}_${p.id}`,
      playerId: p.id,
      date,
      attended
    });
  });
});

// Matches list for Calendario
export const initialMatches: Match[] = [
  { id: 'm1', category: 'Infantil', opponent: 'Real Colmena FC', date: '2026-06-20', time: '09:00', field: 'Campo Municipal 1 (Tierra)', type: 'Liga' },
  { id: 'm2', category: 'Juvenil', opponent: 'Club Deportivo Atlas Jr.', date: '2026-06-20', time: '11:00', field: 'Campo Ejidal El Sol (Pasto)', type: 'Liga' },
  { id: 'm3', category: 'Adulto', opponent: 'La Pandilla del Callejón', date: '2026-06-21', time: '13:00', field: 'Campo El Mezquite (Pasto Sintético)', type: 'Liga' },
  { id: 'm4', category: 'Infantil', opponent: 'Rayos de Tlalnepantla', date: '2026-06-27', time: '08:30', field: 'Campo Municipal 2 (Tierra)', type: 'Liga' },
  { id: 'm5', category: 'Juvenil', opponent: 'Academia Chivas Filial', date: '2026-06-27', time: '10:30', field: 'Campo Ejidal El Sol (Pasto)', type: 'Copa' },
  { id: 'm6', category: 'Adulto', opponent: 'Leones Negros Veteranos', date: '2026-06-28', time: '15:00', field: 'Estadio del Barrio (Centro)', type: 'Amistoso' }
];

export const initialAnnouncements = [
  {
    id: 'ann-1',
    category: 'General',
    title: 'Nueva indumentaria oficial del Club',
    message: 'Les recordamos a todos los apoderados que ya están disponibles las nuevas camisetas oficiales del Club Los Halcones. Pueden coordinar la entrega directamente con Don Rafa.',
    date: '2026-06-15',
    type: 'success',
    active: true
  },
  {
    id: 'ann-2',
    category: 'Infantil',
    title: 'Cambio de cancha de entrenamiento',
    message: 'Atención apoderados de la división Infantil: por mantención de la Cancha de Tierra, este viernes entrenaremos excepcionalmente en el gimnasio techado del club.',
    date: '2026-06-16',
    type: 'warning',
    active: true
  }
];

