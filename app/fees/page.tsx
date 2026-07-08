/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

// 1. TypeScript Interfaces (any kadhun taknya sathi)
interface Student {
  id: string;
  name: string;
  rollNo: string;
  stdClass: string;
  medium?: string; // <-- Navin add kela
  totalFees?: number;
}

interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  stdClass: string;
  amount: number;
  date: string;
  timestamp: number;
  nextInstallmentDate?: string;
}

export default function FeesPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showHistory, setShowHistory] = useState(false);
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedMedium, setSelectedMedium] = useState('English'); // <-- Navin State
  const [searchQuery, setSearchQuery] = useState('');
  
  const [feeData, setFeeData] = useState<Record<string, { totalFee: string, amount: string, date: string, nextDate: string }>>({});

  // 2. fetchData function varati move keli (useEffect chya aadhi)
  const fetchData = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsList);

      const txSnap = await getDocs(collection(db, 'fees'));
      const txList = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      
      // Timestamp error fixed due to Transaction interface
      setTransactions(txList.sort((a, b) => b.timestamp - a.timestamp));
      
      const initialData: Record<string, any> = {};
      const today = new Date().toISOString().split('T')[0];
      
      studentsList.forEach(s => {
        initialData[s.id] = {
          totalFee: s.totalFees ? String(s.totalFees) : '', 
          amount: '',
          date: today,
          nextDate: ''
        };
      });
      setFeeData(initialData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Aata fetchData ithe barobar call hoil

  const getTotalPaid = (studentId: string) => {
    return transactions
      .filter(tx => tx.studentId === studentId)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  };

  // Filter madhe Class, Medium ani Search tine add kele
  const filteredStudents = students.filter(s => {
    const matchClass = s.stdClass === selectedClass;
    const matchMedium = (s.medium || 'English') === selectedMedium; // Old records sathi default English
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchMedium && matchSearch;
  });

  const handleInputChange = (studentId: string, field: string, value: string) => {
    setFeeData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  // parameter madhe 'any' chya aivaji 'Student' interface vaparla
  const collectFee = async (student: Student) => {
    const data = feeData[student.id];
    
    if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      alert("Please enter a valid installment amount!");
      return;
    }

    try {
      await addDoc(collection(db, 'fees'), {
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        stdClass: student.stdClass,
        amount: Number(data.amount),
        date: data.date, 
        nextInstallmentDate: data.nextDate, 
        timestamp: new Date().getTime()
      });

      if (data.totalFee) {
        await updateDoc(doc(db, 'students', student.id), {
          totalFees: Number(data.totalFee)
        });
      }

      alert(`₹${data.amount} collected from ${student.name} successfully! ✅`);
      fetchData(); 
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      alert("Error processing payment: " + errMsg);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 text-purple-600 p-10 font-bold flex justify-center items-center">Loading Fees Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans text-gray-900 pb-24 relative">
      <div className="max-w-full mx-auto space-y-4 md:space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold text-sm">
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-purple-900 truncate">
              {showHistory ? '💳 Fee Transactions' : '💰 Fee Collection Panel'}
            </h1>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full md:w-auto bg-purple-50 text-purple-700 px-5 py-3 md:py-2 rounded-xl md:rounded-lg font-bold hover:bg-purple-100 border border-purple-200 transition-all text-sm md:text-base shadow-sm"
          >
            {showHistory ? 'Collect New Fee ➕' : 'View Transaction History 📋'}
          </button>
        </div>

        {!showHistory && (
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            
            <div className="mb-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs md:text-sm font-bold text-gray-500">BATCH:</span>
                  
                  {/* 3. Accessibility Error Fixed: Added aria-label and title */}
                  <select 
                    title="Select Batch"
                    aria-label="Select Batch"
                    className="flex-1 sm:w-auto bg-white border border-gray-200 text-purple-800 p-2.5 rounded-lg outline-none font-bold shadow-sm"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="8th">8th Standard</option>
                    <option value="9th">9th Standard</option>
                    <option value="10th">10th Standard</option>
                    <option value="11th Sci">11th Sci</option>
                    <option value="12th Sci">12th Sci</option>
                  </select>
                </div>

                {/* Navin Medium Dropdown */}
                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="text-xs md:text-sm font-bold text-blue-600">MEDIUM:</span>
                  <select 
                    title="Select Medium"
                    aria-label="Select Medium"
                    className="flex-1 sm:w-auto bg-white border border-gray-200 text-blue-800 p-2.5 rounded-lg outline-none font-bold shadow-sm"
                    value={selectedMedium}
                    onChange={(e) => setSelectedMedium(e.target.value)}
                  >
                    <option value="English">English Medium</option>
                    <option value="Semi">Semi-English</option>
                    <option value="Marathi">Marathi Medium</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-72 mt-2 md:mt-0">
                <input 
                  type="text" 
                  title="Search student name"
                  aria-label="Search student name"
                  placeholder="🔍 Search student name..."
                  className="w-full bg-white border border-gray-200 p-2.5 rounded-lg outline-none font-bold text-gray-700 shadow-sm focus:border-purple-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <p className="text-[10px] font-bold text-purple-400 mb-2 md:hidden text-right animate-pulse">Swipe left to fill details 👉</p>

            <div className="overflow-x-auto pb-2 border-x border-gray-50 rounded-lg shadow-inner">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-[11px] md:text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold rounded-tl-xl whitespace-nowrap">Roll No</th>
                    <th className="p-3 font-bold whitespace-nowrap">Student Name</th>
                    <th className="p-3 font-bold whitespace-nowrap text-gray-700">Total Payable (₹)</th>
                    <th className="p-3 font-bold whitespace-nowrap text-blue-700 bg-blue-50">Amount Taken (₹)</th>
                    <th className="p-3 font-bold whitespace-nowrap text-purple-700 bg-purple-50">Installment (₹)</th>
                    <th className="p-3 font-bold whitespace-nowrap">Inst. Date</th>
                    <th className="p-3 font-bold whitespace-nowrap">Next Due Date</th>
                    <th className="p-3 font-bold text-right rounded-tr-xl whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-gray-400 text-sm font-bold">No students found.</td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const totalPaid = getTotalPaid(student.id);
                      const data = feeData[student.id] || { totalFee: '', amount: '', date: '', nextDate: '' };
                      
                      return (
                        <tr key={student.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="p-3 font-mono text-gray-500 text-sm">{student.rollNo}</td>
                          <td className="p-3 font-bold text-gray-800 whitespace-nowrap">{student.name}</td>
                          
                          <td className="p-3">
                            <input 
                              type="number" 
                              title="Total Fees"
                              aria-label="Total Fees"
                              placeholder="Total Fees"
                              className="w-28 bg-white border border-gray-300 p-2 rounded-lg outline-none font-bold text-gray-700 text-sm"
                              value={data.totalFee}
                              onChange={(e) => handleInputChange(student.id, 'totalFee', e.target.value)}
                            />
                          </td>
                          
                          <td className="p-3 font-extrabold text-blue-600 bg-blue-50/30 whitespace-nowrap">
                            ₹{totalPaid}
                          </td>
                          
                          <td className="p-3 bg-purple-50/30">
                            <input 
                              type="number" 
                              title="Installment Amount"
                              aria-label="Installment Amount"
                              placeholder="Amount"
                              className="w-28 bg-white border border-purple-300 p-2 rounded-lg outline-none font-bold text-purple-700 text-sm"
                              value={data.amount}
                              onChange={(e) => handleInputChange(student.id, 'amount', e.target.value)}
                            />
                          </td>

                          {/* 4. Accessibility Error Fixed: Added aria-label and title to dates */}
                          <td className="p-3">
                            <input 
                              type="date" 
                              title="Installment Date"
                              aria-label="Installment Date"
                              className="w-36 bg-white border border-gray-300 p-2 rounded-lg outline-none font-medium text-gray-700 text-sm"
                              value={data.date}
                              onChange={(e) => handleInputChange(student.id, 'date', e.target.value)}
                            />
                          </td>

                          <td className="p-3">
                            <input 
                              type="date" 
                              title="Next Due Date"
                              aria-label="Next Due Date"
                              className="w-36 bg-white border border-gray-300 p-2 rounded-lg outline-none font-medium text-red-600 text-sm"
                              value={data.nextDate}
                              onChange={(e) => handleInputChange(student.id, 'nextDate', e.target.value)}
                            />
                          </td>

                          <td className="p-3 text-right">
                            <button 
                              onClick={() => collectFee(student)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-all text-sm whitespace-nowrap"
                            >
                              Save
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
        )}

        {showHistory && (
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
             <p className="text-[10px] font-bold text-purple-400 mb-2 md:hidden text-right animate-pulse">Swipe left for details 👉</p>
            <div className="overflow-x-auto pb-2 border-x border-gray-50 rounded-lg shadow-inner">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-[11px] md:text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold rounded-tl-xl whitespace-nowrap">Payment Date</th>
                    <th className="p-3 font-bold whitespace-nowrap">Student Name</th>
                    <th className="p-3 font-bold whitespace-nowrap">Batch</th>
                    <th className="p-3 font-bold whitespace-nowrap">Amount Paid</th>
                    <th className="p-3 font-bold whitespace-nowrap text-red-500 bg-red-50">Next Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-400 text-sm font-bold">No transactions recorded yet.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 text-sm text-gray-500 font-bold whitespace-nowrap">{tx.date}</td>
                        <td className="p-3 font-bold text-gray-800 text-base whitespace-nowrap">{tx.studentName}</td>
                        <td className="p-3 text-sm font-bold text-purple-600 whitespace-nowrap">{tx.stdClass}</td>
                        <td className="p-3 font-extrabold text-green-600 text-lg whitespace-nowrap">₹{tx.amount}</td>
                        <td className="p-3 text-sm font-bold text-red-600 bg-red-50/50 whitespace-nowrap">
                          {tx.nextInstallmentDate ? `📅 ${tx.nextInstallmentDate}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}