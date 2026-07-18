'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  rollNo?: string;
  stdClass: string;
  medium: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo?: string;
  status: string;
}

export default function AttendancePage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedMedium, setSelectedMedium] = useState('Semi'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const [historyClass, setHistoryClass] = useState('10th');
  const [historyMedium, setHistoryMedium] = useState('Semi');
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);

  const allClasses = [
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', 
    '11th Sci', '11th Com', '11th Art', '12th Sci', '12th Com', '12th Art'
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const studentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          rollNo: doc.data().rollNo || '',
          stdClass: doc.data().stdClass || 'Unknown',
          medium: doc.data().medium || 'Semi',
        })) as Student[];
        
        setStudents(studentList.sort((a, b) => {
          const rollA = parseInt(a.rollNo || '9999');
          const rollB = parseInt(b.rollNo || '9999');
          if (rollA !== rollB) return rollA - rollB;
          return a.name.localeCompare(b.name);
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const classStudents = students.filter(
    s => s.stdClass === selectedClass && s.medium === selectedMedium
  );

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (classStudents.length === 0) {
      alert("No students in this batch!");
      return;
    }

    const records = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      status: attendance[student.id] || 'Present' 
    }));

    try {
      await addDoc(collection(db, 'attendance'), {
        date,
        stdClass: selectedClass,
        medium: selectedMedium,
        records,
        timestamp: new Date().getTime()
      });

      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, date })
      });

      alert(`Attendance saved and WhatsApp Messages triggered! ✅`);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving attendance: ", error);
      alert("Error saving attendance!");
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryFetched(false);
    try {
      const q = query(
        collection(db, 'attendance'),
        where('stdClass', '==', historyClass),
        where('medium', '==', historyMedium),
        where('date', '==', historyDate)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const sortedRecords = (docData.records || []).sort((a: AttendanceRecord, b: AttendanceRecord) => {
          const rollA = parseInt(a.rollNo || '9999');
          const rollB = parseInt(b.rollNo || '9999');
          return rollA - rollB;
        });

        setHistoryRecords(sortedRecords);
      } else {
        setHistoryRecords([]);
      }
      setHistoryFetched(true);
    } catch (error) {
      console.error("Error fetching history: ", error);
      alert("Failed to load history.");
    }
    setHistoryLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold text-orange-500">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8 font-sans pb-24 md:pb-28 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-3 md:space-y-6">
        
        {/* HEADER & TABS */}
        <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-gray-600 active:bg-gray-200 font-bold text-xs md:text-sm">
              ← Back
            </button>
            <h1 className="text-lg md:text-2xl font-black text-gray-800">
              📅 Attendance Portal
            </h1>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg md:rounded-xl">
            <button 
              onClick={() => setActiveTab('entry')}
              className={`flex-1 py-2 md:py-3 rounded-md md:rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'entry' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 active:text-gray-700'}`}
            >
              📝 Mark Present
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 md:py-3 rounded-md md:rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 active:text-gray-700'}`}
            >
              🕒 View History
            </button>
          </div>
        </div>

        {/* 🔹 TAB 1: MARK ATTENDANCE 🔹 */}
        {activeTab === 'entry' && (
          <div className="space-y-3 md:space-y-6 animate-fade-in">
            <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">SELECT BATCH</label>
                <select className="bg-gray-50 border border-gray-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-gray-700" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  {allClasses.map(c => <option key={c} value={c}>{c} Std</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-orange-600 mb-1">SELECT MEDIUM</label>
                <select className="bg-orange-50 border border-orange-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-orange-800" value={selectedMedium} onChange={(e) => setSelectedMedium(e.target.value)}>
                  <option value="Semi">Semi-English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">DATE</label>
                <input type="date" className="bg-gray-50 border border-gray-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-gray-700" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-extrabold text-gray-700 text-xs md:text-sm">Class: {selectedClass} ({selectedMedium})</h3>
                <span className="bg-orange-100 text-orange-700 font-bold px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs">Total: {classStudents.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {classStudents.length === 0 ? (
                  <div className="p-6 md:p-8 text-center text-gray-400 font-bold text-xs md:text-sm">No students found.</div>
                ) : (
                  classStudents.map((student) => (
                    <div key={student.id} className="p-3 md:p-4 flex flex-row items-center justify-between gap-2 md:gap-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs md:text-sm shrink-0">
                          {student.rollNo || '-'}
                        </div>
                        <p className="font-extrabold text-gray-800 text-xs md:text-sm truncate">{student.name}</p>
                      </div>
                      <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 gap-1 md:gap-2">
                        <button onClick={() => handleStatusChange(student.id, 'Present')} className={`px-2 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-black transition-all ${(attendance[student.id] || 'Present') === 'Present' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 active:bg-gray-200'}`}>Present</button>
                        <button onClick={() => handleStatusChange(student.id, 'Absent')} className={`px-2 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-black transition-all ${attendance[student.id] === 'Absent' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 active:bg-gray-200'}`}>Absent</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={submitAttendance} disabled={classStudents.length === 0} className="w-full mt-2 bg-orange-500 active:bg-orange-600 py-3 md:py-4 rounded-xl font-black text-white shadow-md disabled:opacity-50 transition-all text-sm md:text-base">
              Save Attendance 💾
            </button>
          </div>
        )}

        {/* 🔹 TAB 2: VIEW HISTORY 🔹 */}
        {activeTab === 'history' && (
          <div className="space-y-3 md:space-y-6 animate-fade-in">
            <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">BATCH</label>
                <select className="bg-gray-50 border border-gray-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-gray-700" value={historyClass} onChange={(e) => {setHistoryClass(e.target.value); setHistoryFetched(false);}}>
                  {allClasses.map(c => <option key={c} value={c}>{c} Std</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-blue-600 mb-1">MEDIUM</label>
                <select className="bg-blue-50 border border-blue-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-blue-800" value={historyMedium} onChange={(e) => {setHistoryMedium(e.target.value); setHistoryFetched(false);}}>
                  <option value="Semi">Semi-English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">DATE</label>
                <input type="date" className="bg-gray-50 border border-gray-200 p-2 md:p-3 rounded-lg outline-none font-bold text-sm md:text-base text-gray-700" value={historyDate} onChange={(e) => {setHistoryDate(e.target.value); setHistoryFetched(false);}} />
              </div>
              <div className="flex flex-col justify-end mt-2 md:mt-0">
                <button onClick={fetchHistory} disabled={historyLoading} className="bg-blue-600 active:bg-blue-700 text-white font-black p-2.5 md:p-3 rounded-lg shadow-sm disabled:opacity-50 transition-all h-[42px] md:h-[50px] text-xs md:text-sm">
                  {historyLoading ? 'Loading...' : '🔍 Search'}
                </button>
              </div>
            </div>

            {historyFetched && (
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {historyRecords.length === 0 ? (
                  <div className="p-6 md:p-8 text-center text-gray-400 font-bold text-xs md:text-sm">
                    No attendance records found for this date.
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-3 md:p-4 flex justify-between items-center border-b border-gray-200">
                      <span className="font-extrabold text-gray-700 text-xs md:text-sm">Total: {historyRecords.length}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 md:px-3 md:py-1 rounded-full font-black text-[10px] md:text-xs shadow-sm">
                        Present: {historyRecords.filter(s => s.status === 'Present').length}
                      </span>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {historyRecords.map((student, idx) => (
                        <div key={idx} className="p-3 md:p-4 flex justify-between items-center hover:bg-gray-50">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 text-blue-600 flex justify-center items-center font-black text-xs md:text-sm shadow-sm shrink-0">
                              {student.rollNo || '-'}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-gray-800 text-xs md:text-sm">{student.studentName}</h3>
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-md text-[10px] md:text-xs font-black shadow-sm ${
                              student.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}