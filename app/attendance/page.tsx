/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  stdClass: string;
  medium: string;
}

export default function AttendancePage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedMedium, setSelectedMedium] = useState('English');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Attendance State: { studentId: "Present" | "Absent" }
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const studentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          rollNo: doc.data().rollNo,
          stdClass: doc.data().stdClass || 'Unknown',
          medium: doc.data().medium || 'English',
        })) as Student[];
        
        // Sort by Roll No
        setStudents(studentList.sort((a, b) => Number(a.rollNo) - Number(b.rollNo)));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on both Class AND Medium
  const classStudents = students.filter(
    s => s.stdClass === selectedClass && s.medium === selectedMedium
  );

  // Mark all as present automatically when batch loads
  useEffect(() => {
    const defaultAtt: Record<string, string> = {};
    classStudents.forEach(s => {
      if (!attendance[s.id]) defaultAtt[s.id] = 'Present';
    });
    if (Object.keys(defaultAtt).length > 0) {
      setAttendance(prev => ({ ...prev, ...defaultAtt }));
    }
  }, [classStudents]);

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
      alert(`Attendance saved for ${selectedClass} (${selectedMedium})! ✅`);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving attendance: ", error);
      alert("Error saving attendance!");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold text-orange-500">Loading Attendance...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans pb-28 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold text-sm">
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              📅 Attendance Entry
            </h1>
          </div>
        </div>

        {/* CONTROLS (CLASS + MEDIUM + DATE) */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-1">SELECT BATCH / CLASS</label>
            <select 
              className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none font-bold text-gray-700"
              value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="8th">8th Standard</option>
              <option value="9th">9th Standard</option>
              <option value="10th">10th Standard</option>
              <option value="11th Sci">11th Science</option>
              <option value="12th Sci">12th Science</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-blue-600 mb-1">SELECT MEDIUM</label>
            <select 
              className="bg-blue-50 border border-blue-200 p-3 rounded-lg outline-none font-bold text-blue-800"
              value={selectedMedium} onChange={(e) => setSelectedMedium(e.target.value)}
            >
              <option value="English">English Medium</option>
              <option value="Semi">Semi-English</option>
              <option value="Marathi">Marathi Medium</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-1">DATE</label>
            <input 
              type="date" 
              className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none font-medium text-gray-700"
              value={date} onChange={(e) => setDate(e.target.value)}
            />
          </div>

        </div>

        {/* STUDENT LIST FOR ATTENDANCE (Mobile Friendly) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-extrabold text-gray-700 text-sm">
              Students: {selectedClass} ({selectedMedium})
            </h3>
            <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-xs">
              Total: {classStudents.length}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {classStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold text-sm">
                No students found in this specific batch & medium.
              </div>
            ) : (
              classStudents.map((student) => (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">
                      {student.rollNo}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400 font-medium">Roll No: {student.rollNo}</p>
                    </div>
                  </div>

                  {/* Present/Absent Toggle Buttons */}
                  <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                    <button
                      onClick={() => handleStatusChange(student.id, 'Present')}
                      className={`px-15 py-2 rounded-md text-xs font-bold transition-all ${
                        attendance[student.id] === 'Present' 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Absent')}
                      className={`px-15 py-2 rounded-md text-xs font-bold transition-all ${
                        attendance[student.id] === 'Absent' 
                          ? 'bg-red-500 text-white shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          onClick={submitAttendance} 
          disabled={classStudents.length === 0}
          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl font-bold text-white shadow-md disabled:opacity-50 transition-all text-base md:text-lg"
        >
          Save Attendance 💾
        </button>

      </div>
    </div>
  );
}