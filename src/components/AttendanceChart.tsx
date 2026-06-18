import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Percent } from 'lucide-react';
import { Category } from '../types';

interface AttendanceChartProps {
  attendanceData: {
    category: Category;
    percentage: number;
    totalPresent: number;
    totalPossible: number;
    color: string;
    shadowColor: string;
    borderColor: string;
  }[];
}

export default function AttendanceChart({ attendanceData }: AttendanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between h-full" id="attendance-chart-container">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 leading-tight flex items-center gap-1.5 font-sans">
              Asistencia Promedio
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Desglose de asistencia acumulada por categoría en entrenamientos de Junio.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Meta: 80%
          </span>
        </div>

        {/* Custom Visual Chart */}
        <div className="space-y-6 my-4">
          {attendanceData.map((data, index) => {
            const isHovered = hoveredIdx === index;
            const isMeetingGoal = data.percentage >= 80;

            return (
              <div
                key={data.category}
                className="relative"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${data.color}`} />
                    <span className="font-bold text-sm text-slate-700">{data.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-2">
                      ({data.totalPresent}/{data.totalPossible} asists)
                    </span>
                    <span className="font-extrabold text-base text-slate-800">
                      {Math.round(data.percentage)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-6 bg-slate-50 rounded-full border border-slate-100/50 overflow-hidden cursor-pointer">
                  {/* Indicator Line at 80% Goal */}
                  <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-slate-300 z-10 border-r border-dashed border-slate-400" title="Meta de asistencia: 80%" />

                  {/* Filled Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${data.color} relative font-mono text-[10px] text-white flex items-center justify-end pr-3 font-semibold`}
                    style={{
                      boxShadow: isHovered ? `0 0 12px 2px ${data.shadowColor}` : 'none',
                    }}
                  >
                    {data.percentage > 25 && (
                      <span className="relative z-20 flex items-center gap-0.5">
                        {Math.round(data.percentage)}%
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Hover stats tooltip details */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 right-0 z-30 bg-slate-800 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1.5"
                  >
                    <span>Asistencia {isMeetingGoal ? 'Excelente' : 'Por Mejorar'}</span>
                    <span className={`w-2 h-2 rounded-full ${isMeetingGoal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400">
        <div className="flex items-start gap-1.5">
          <Percent className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            La asistencia promedio influye directamente en las alineaciones titulares de los partidos del fin de semana de 'Los Halcones'.
          </p>
        </div>
      </div>
    </div>
  );
}
