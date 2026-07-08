'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// TypeScript Interfaces to prevent 'any' errors
interface Student {
  id: string;
  name: string;
  rollNo: string;
  stdClass: string;
  medium?: string; // <-- Navin add kela
}

interface ExamResult {
  studentId: string;
  studentName: string;
  rollNo: string;
  marksObtained: string;
}

interface ExamRecord {
  id: string;
  date: string;
  stdClass: string;
  medium?: string; // <-- Navin add kela
  examName: string;
  subject: string;
  totalMarks: number;
  results: ExamResult[];
  timestamp: number;
}

export default function ExamsPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View Toggle
  const [showHistory, setShowHistory] = useState(false);
  
  // Exam Details States
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedMedium, setSelectedMedium] = useState('English'); // <-- Navin State
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Marks State: { studentId: "marks" }
  const [marks, setMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudents(studentsList);

        const examsSnap = await getDocs(collection(db, 'exams'));
        const examsList = examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamRecord));
        setExamRecords(examsList.sort((a, b) => b.timestamp - a.timestamp));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // <-- Filter updated for Class AND Medium
  const classStudents = students.filter(s => 
    s.stdClass === selectedClass && (s.medium || 'English') === selectedMedium
  );

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const submitMarks = async () => {
    if (!examName || !subject || !totalMarks) {
      alert("Please fill Exam Name, Subject, and Total Marks!");
      return;
    }
    if (classStudents.length === 0) {
      alert("No students in this class to assign marks!");
      return;
    }

    const results: ExamResult[] = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      marksObtained: marks[student.id] || 'AB' // Assume Absent (AB) if empty
    }));

    try {
      await addDoc(collection(db, 'exams'), {
        date,
        stdClass: selectedClass,
        medium: selectedMedium, // <-- Medium saved in DB
        examName,
        subject,
        totalMarks: Number(totalMarks),
        results,
        timestamp: new Date().getTime()
      });
      alert(`Marks saved for ${examName} (${selectedClass} - ${selectedMedium})! ✅`);
      
      // Clear form
      setExamName('');
      setSubject('');
      setTotalMarks('');
      setMarks({});
      setShowHistory(true); // Switch to history tab after saving
      
      // Refresh without full reload
      const examsSnap = await getDocs(collection(db, 'exams'));
      const examsList = examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamRecord));
      setExamRecords(examsList.sort((a, b) => b.timestamp - a.timestamp));

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      alert("Error saving marks: " + errMsg);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 text-indigo-600 p-10 font-bold flex justify-center items-center">Loading Exams Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans text-gray-900 pb-24">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold text-sm">
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-indigo-900 truncate">
              {showHistory ? '📊 Exam Records' : '📝 Marks Entry'}
            </h1>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full md:w-auto bg-indigo-50 text-indigo-700 px-5 py-3 md:py-2 rounded-xl md:rounded-lg font-bold hover:bg-indigo-100 border border-indigo-200 transition-all text-sm md:text-base shadow-sm"
          >
            {showHistory ? 'Enter New Marks ➕' : 'View Results History 🏆'}
          </button>
        </div>

        {/* ========================================= */}
        {/* VIEW 1: ENTER MARKS */}
        {/* ========================================= */}
        {!showHistory && (
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            
            {/* Exam Configuration Form */}
            <div className="bg-indigo-50/50 p-4 md:p-5 rounded-xl border border-indigo-100 mb-6">
              <h2 className="text-xs md:text-sm font-extrabold text-indigo-800 mb-4 uppercase tracking-wider">Exam Details</h2>
              
              {/* Stack vertically on mobile, grid on PC (Grid layout slightly updated to fit Medium) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">BATCH</label>
                  <select 
                    title="Select Batch"
                    className="bg-white border border-gray-200 text-gray-800 p-2.5 rounded-lg outline-none font-bold"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="8th">8th Standard</option>
                    <option value="9th">9th Standard</option>
                    <option value="10th">10th Standard</option>
                    <option value="11th Sci">11th Science</option>
                    <option value="12th Sci">12th Science</option>
                  </select>
                </div>

                {/* <-- NEW: Medium Dropdown Added Here --> */}
                <div className="flex flex-col">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">MEDIUM</label>
                  <select 
                    title="Select Medium"
                    className="bg-white border border-gray-200 text-gray-800 p-2.5 rounded-lg outline-none font-bold"
                    value={selectedMedium}
                    onChange={(e) => setSelectedMedium(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Semi">Semi-English</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">EXAM NAME</label>
                  <input 
                    type="text" placeholder="e.g. Unit Test 1"
                    title="Exam Name"
                    className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none font-medium text-sm md:text-base"
                    value={examName} onChange={(e) => setExamName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">SUBJECT</label>
                  <input 
                    type="text" placeholder="e.g. Mathematics"
                    title="Subject"
                    className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none font-medium text-sm md:text-base"
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] md:text-xs font-bold text-indigo-600 mb-1">TOTAL MARKS</label>
                  <input 
                    type="number" placeholder="e.g. 50"
                    title="Total Marks"
                    className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg outline-none font-bold text-indigo-700 text-sm md:text-base"
                    value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:col-span-2 md:col-span-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">DATE</label>
                  <input 
                    type="date"
                    title="Exam Date"
                    className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none font-medium text-sm md:text-base"
                    value={date} onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold text-indigo-400 mb-2 md:hidden text-right animate-pulse">Swipe left to enter marks 👉</p>

            {/* Students List for Marks Entry */}
            <div className="overflow-x-auto pb-2 border-x border-gray-50 rounded-lg shadow-inner">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-[11px] md:text-xs uppercase tracking-wider">
                    <th className="p-3 md:p-4 font-bold rounded-tl-xl whitespace-nowrap">Roll No</th>
                    <th className="p-3 md:p-4 font-bold whitespace-nowrap">Student Name</th>
                    <th className="p-3 md:p-4 font-bold text-right rounded-tr-xl whitespace-nowrap">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-8 text-gray-400 text-sm font-bold">No students found for this batch.</td>
                    </tr>
                  ) : (
                    classStudents.map(student => (
                      <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="p-3 md:p-4 font-mono text-gray-500 text-sm">{student.rollNo}</td>
                        <td className="p-3 md:p-4 font-bold text-gray-800 whitespace-nowrap">{student.name}</td>
                        <td className="p-3 md:p-4 text-right">
                          <input 
                            type="text" 
                            title="Marks Obtained"
                            placeholder="Score or AB"
                            className="w-24 md:w-28 bg-white border border-gray-300 p-2 md:p-2.5 rounded-lg outline-none font-bold text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base shadow-sm uppercase"
                            value={marks[student.id] || ''}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={submitMarks} 
              disabled={classStudents.length === 0}
              className="w-full mt-6 md:mt-8 bg-indigo-600 hover:bg-indigo-700 py-3.5 md:py-4 rounded-xl font-bold text-white shadow-md disabled:opacity-50 transition-all text-base md:text-lg"
            >
              Save Results 💾
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2: EXAM HISTORY */}
        {/* ========================================= */}
        {showHistory && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
            {examRecords.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-gray-400 font-bold">No exam records found.</p>
              </div>
            ) : (
              examRecords.map((exam) => (
                <div key={exam.id} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                  
                  {/* Exam Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 pb-4 border-b border-gray-100 gap-3 md:gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-extrabold text-indigo-900">{exam.examName}</h3>
                      <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
                        <span className="text-gray-800 font-bold">{exam.subject}</span> • 📅 {exam.date}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {/* <-- NEW: Added Medium tag display --> */}
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm flex-1 sm:flex-none text-center">
                        Batch: {exam.stdClass} ({exam.medium || 'English'})
                      </span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm flex-1 sm:flex-none text-center">
                        Total: {exam.totalMarks}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-bold text-indigo-400 mb-2 md:hidden text-right animate-pulse">Swipe left for marks 👉</p>

                  {/* Result Table */}
                  <div className="overflow-x-auto pb-2 border-x border-gray-50 rounded-lg shadow-inner">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 text-[11px] md:text-xs uppercase tracking-wider">
                          <th className="p-3 md:p-4 font-bold rounded-tl-xl whitespace-nowrap">Roll No</th>
                          <th className="p-3 md:p-4 font-bold whitespace-nowrap">Student Name</th>
                          <th className="p-3 md:p-4 font-bold text-right rounded-tr-xl whitespace-nowrap">Marks Obtained</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {exam.results?.map((res, idx) => {
                          const isAbsent = res.marksObtained.toUpperCase() === 'AB';
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-3 md:p-4 font-mono text-gray-500 text-xs md:text-sm">{res.rollNo}</td>
                              <td className="p-3 md:p-4 font-bold text-gray-800 text-sm md:text-base whitespace-nowrap">{res.studentName}</td>
                              <td className="p-3 md:p-4 text-right flex justify-end items-center gap-1">
                                {isAbsent ? (
                                  <span className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded font-extrabold text-[10px] md:text-xs">
                                    ABSENT
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-extrabold text-indigo-600 text-base md:text-lg">{res.marksObtained}</span>
                                    <span className="text-gray-400 text-[10px] md:text-xs font-bold">/ {exam.totalMarks}</span>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}