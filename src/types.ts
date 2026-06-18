export type Category = 'Infantil' | 'Juvenil' | 'Adulto';

export interface Player {
  id: string;
  name: string;
  category: Category;
  parentName?: string;
  phone: string;
  createdAt: string;
  status?: 'activo' | 'baja';
}

export type PaymentStatus = 'paid' | 'pending';

export interface Payment {
  id: string;
  playerId: string;
  month: string; // 'Marzo', 'Abril', 'Mayo', 'Junio'
  year: number;
  status: PaymentStatus;
  amount: number;
  paidDate?: string;
}

export interface Attendance {
  id: string;
  playerId: string;
  date: string; // YYYY-MM-DD
  attended: boolean;
}

export interface Match {
  id: string;
  category: Category;
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string;
  field: string;
  type: 'Liga' | 'Amistoso' | 'Copa';
}

export interface Announcement {
  id: string;
  category: Category | 'General';
  title: string;
  message: string;
  date: string; // YYYY-MM-DD
  type: 'info' | 'cancel' | 'warning' | 'success';
  active: boolean;
}

