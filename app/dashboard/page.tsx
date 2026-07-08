'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Student {
  id: string;
  stdClass: string;
  medium?: string; 
}

interface ClassStat {
  label: string; 
  total: number;
  present: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const studentsList: Student[] = studentsSnap.docs.map(doc => ({
          id: doc.id,
          stdClass: doc.data().stdClass || 'Unknown',
          medium: doc.data().medium || 'English' 
        }));

        setTotalStudents(studentsList.length);

        const attQuery = query(collection(db, 'attendance'), where('date', '==', todayStr));
        const attSnap = await getDocs(attQuery);
        
        const presentStudentIds = new Set<string>();
        attSnap.docs.forEach(doc => {
          const records = doc.data().records || [];
          records.forEach((record: any) => {
            if (record.status === 'Present') {
              presentStudentIds.add(record.studentId);
            }
          });
        });

        const statsMap = new Map<string, { total: number; present: number }>();

        studentsList.forEach(student => {
          const label = `${student.stdClass} (${student.medium})`;
          
          if (!statsMap.has(label)) {
            statsMap.set(label, { total: 0, present: 0 });
          }
          
          const current = statsMap.get(label)!;
          current.total += 1;
          if (presentStudentIds.has(student.id)) {
            current.present += 1;
          }
        });

        const statsArray = Array.from(statsMap, ([label, data]) => ({
          label,
          total: data.total,
          present: data.present
        })).sort((a, b) => a.label.localeCompare(b.label));

        setClassStats(statsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, [todayStr]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-purple-600 font-bold animate-pulse text-lg">
          Loading MCC Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-28">
      
      {/* 🔹 BANNER SECTION */}
      <div className="w-full bg-gray-100 flex justify-center items-center border-b border-gray-200">
        <img 
          src="/IMG-20260605-WA0004.jpg" 
          alt="MCC Banner" 
          className="w-full h-auto max-h-[650px] md:max-h-[1000px] object-contain" 
        />
      </div>

      {/* 🔹 CUSTOM HEADER WITH LOGO & QUOTE */}
      <div className="bg-white px-4 py-6 md:px-8 border-b border-gray-200 shadow-sm rounded-b-3xl mb-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm bg-black flex items-center justify-center">
            <img src="/icon.jpg" alt="MCC Logo" className="w-full h-full object-contain" />
          </div>
          
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Matoshree Coaching Classes
            </h1>
            <p className="text-purple-600 font-bold text-xs md:text-sm mt-1 italic">
              "Right Choice for Bright Future"
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
        
        {/* WELCOME & DATE */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 text-xs font-medium mt-1">{displayDate}</p>
          </div>
          <div className="bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 text-center">
            <p className="text-[10px] font-bold text-purple-600 uppercase">Total Students</p>
            <p className="text-xl font-extrabold text-purple-700">{totalStudents}</p>
          </div>
        </div>

        {/* CLASS-WISE ATTENDANCE STATS */}
        <div>
          <h3 className="text-gray-800 font-bold text-sm mb-3 px-1">TODAY'S ATTENDANCE SUMMARY</h3>
          
          {classStats.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
              <p className="text-gray-400 font-bold text-sm">No student data available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {classStats.map((stat, idx) => {
                const percent = stat.total > 0 ? (stat.present / stat.total) * 100 : 0;
                let statusColor = "text-green-600";
                let bgColor = "bg-green-50";
                
                if (percent < 50) {
                  statusColor = "text-red-600";
                  bgColor = "bg-red-50";
                } else if (percent < 80) {
                  statusColor = "text-orange-600";
                  bgColor = "bg-orange-50";
                }

                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-xs md:text-sm font-extrabold text-gray-700 mb-2">{stat.label}</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Present</p>
                        <p className={`text-2xl font-extrabold ${statusColor}`}>
                          {stat.present} <span className="text-sm text-gray-400">/ {stat.total}</span>
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${bgColor} ${statusColor}`}>
                        {Math.round(percent)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS GRID */}
        <div>
          <h3 className="text-gray-800 font-bold text-sm mb-3 px-1">MANAGE CLASSES</h3>
          <div className="grid grid-cols-4 gap-3">
            
            <button onClick={() => router.push('/students')} className="bg-white py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-2">
              <div className="text-2xl md:text-3xl">👥</div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Students</span>
            </button>
            
            <button onClick={() => router.push('/attendance')} className="bg-white py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-2">
              <div className="text-2xl md:text-3xl">📅</div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Attendance</span>
            </button>
            
            <button onClick={() => router.push('/fees')} className="bg-white py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-2">
              <div className="text-2xl md:text-3xl">💰</div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Fees</span>
            </button>
            
            <button onClick={() => router.push('/exams')} className="bg-white py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-2">
              <div className="text-2xl md:text-3xl">📝</div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">Exams</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}