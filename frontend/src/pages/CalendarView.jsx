import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

export const CalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysMatrix = [];
  let dayCounter = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
        week.push(null);
      } else {
        week.push(dayCounter);
        dayCounter++;
      }
    }
    daysMatrix.push(week);
    if (dayCounter > daysInMonth) break;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Kalender Deadline</h1>
          <p className="text-xs text-slate-500">
            Tampilan kalender bulanan untuk memantau tenggat waktu proyek dan memprioritaskan task kritis.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs self-start sm:self-auto">
          <button onClick={prevMonth} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-900 px-2">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-50 text-center text-xs font-bold text-slate-600 border-b border-slate-200 py-3">
          <span className="text-rose-600">Minggu</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span>Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Calendar Body */}
        <div className="divide-y divide-slate-100">
          {daysMatrix.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 divide-x divide-slate-100 min-h-[110px]">
              {week.map((dayNum, dIdx) => {
                if (!dayNum) return <div key={dIdx} className="bg-slate-50/50 p-2" />;

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayTasks = tasks.filter((t) => {
                  if (!t.due_date) return false;
                  if (t.due_date.startsWith(dateStr)) return true;
                  const d = new Date(t.due_date);
                  const taskDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  return taskDateStr === dateStr;
                });
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div key={dIdx} className={`p-2 space-y-1.5 transition-colors ${isToday ? 'bg-blue-50/40' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center' : 'text-slate-700'}`}>
                        {dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">{dayTasks.length} task</span>
                      )}
                    </div>

                    <div className="space-y-1 max-h-[80px] overflow-y-auto pr-0.5">
                      {dayTasks.map((t) => {
                        const isOverdue = t.status !== 'Completed' && new Date(t.due_date) < new Date();
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedTaskId(t.id);
                              setIsDetailOpen(true);
                            }}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border cursor-pointer truncate transition-all ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : t.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <span className="truncate block">{t.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
};
