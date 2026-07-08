'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  stdClass: string;
  medium: string; 
  phone?: string; // Added Contact Number back
  totalFees?: number;
}

export default function StudentsPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [stdClass, setStdClass] = useState('10th');
  const [medium, setMedium] = useState('English');
  const [phone, setPhone] = useState(''); // State for Contact Number
  const [totalFees, setTotalFees] = useState('');

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      // Sort alphabetically by name
      setStudents(studentList.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNo) return alert("Please fill Name and Roll No");

    try {
      await addDoc(collection(db, 'students'), {
        name,
        rollNo,
        stdClass,
        medium,
        phone, // Saving contact number to database
        totalFees: Number(totalFees) || 0,
        addedAt: new Date().toISOString()
      });
      
      alert("Student Added Successfully! ✅");
      // Reset form
      setName('');
      setRollNo('');
      setPhone('');
      setTotalFees('');
      setShowAddForm(false);
      
      fetchStudents();
    } catch (error) {
      console.error("Error adding student: ", error);
      alert("Error adding student!");
    }
  };

  const deleteStudent = async (id: string, studentName: string) => {
    if (confirm(`Are you sure you want to delete ${studentName}?`)) {
      try {
        await deleteDoc(doc(db, 'students', id));
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student: ", error);
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.rollNo.includes(searchQuery)
  );

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center text-purple-600 font-bold">Loading Students...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold text-sm">
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              👥 Students List
            </h1>
          </div>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-purple-600 text-white px-5 py-3 md:py-2 rounded-xl md:rounded-lg font-bold hover:bg-purple-700 transition-all text-sm shadow-sm"
          >
            {showAddForm ? 'Cancel ❌' : 'Add New Student ➕'}
          </button>
        </div>

        {/* ADD STUDENT FORM */}
        {showAddForm && (
          <form onSubmit={addStudent} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            <h2 className="text-sm font-extrabold text-purple-700 mb-4 uppercase tracking-wider">Student Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1">FULL NAME</label>
                <input type="text" placeholder="e.g. Rahul Sharma" required className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-purple-400 font-medium" value={name} onChange={e => setName(e.target.value)} />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1">ROLL NUMBER</label>
                <input type="text" placeholder="e.g. 101" required className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-purple-400 font-medium" value={rollNo} onChange={e => setRollNo(e.target.value)} />
              </div>
              
              {/* 🔹 NEW FIELD: CONTACT NUMBER 🔹 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1">CONTACT NUMBER</label>
                <input type="tel" placeholder="e.g. 9876543210" className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-purple-400 font-medium" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1">BATCH / CLASS</label>
                <select className="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-purple-400 font-medium text-gray-700" value={stdClass} onChange={e => setStdClass(e.target.value)}>
                  <option value="8th">8th Standard</option>
                  <option value="9th">9th Standard</option>
                  <option value="10th">10th Standard</option>
                  <option value="11th Sci">11th Science</option>
                  <option value="12th Sci">12th Science</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-blue-600 mb-1">MEDIUM</label>
                <select className="bg-blue-50 border border-blue-200 p-3 rounded-lg outline-none focus:border-blue-400 font-bold text-blue-800" value={medium} onChange={e => setMedium(e.target.value)}>
                  <option value="English">English Medium</option>
                  <option value="Semi">Semi-English</option>
                  <option value="Marathi">Marathi Medium</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-green-600 mb-1">TOTAL FEES (₹)</label>
                <input type="number" placeholder="e.g. 15000" className="bg-green-50 border border-green-200 p-3 rounded-lg outline-none focus:border-green-400 font-bold text-green-700" value={totalFees} onChange={e => setTotalFees(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">
              Save Student 💾
            </button>
          </form>
        )}

        {/* SEARCH BAR */}
        <div className="bg-white p-2 md:p-3 rounded-xl border border-gray-100 shadow-sm">
          <input 
            type="text" 
            placeholder="🔍 Search by name or roll no..." 
            className="w-full p-2 outline-none font-medium text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* MOBILE FRIENDLY CARDS UI */}
        {filteredStudents.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 font-bold">
            No students found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative flex flex-col h-full">
                
                {/* Delete Button */}
                <button 
                  onClick={() => deleteStudent(student.id, student.name)}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold hover:bg-red-100 transition-colors"
                  title="Delete Student"
                >
                  ✕
                </button>

                <div className="mb-2 pr-8 flex-1">
                  <h3 className="text-lg font-extrabold text-gray-800 line-clamp-1">{student.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-gray-500 text-xs font-mono font-bold">Roll No: {student.rollNo}</p>
                    {/* Display Contact Number if it exists */}
                    {student.phone && (
                      <p className="text-gray-500 text-xs font-medium flex items-center gap-1">
                        📞 {student.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                  <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">
                    {student.stdClass}
                  </span>
                  
                  <span className={`border px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide
                    ${student.medium === 'Semi' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                      student.medium === 'English' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {student.medium || 'English'}
                  </span>

                  <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ml-auto">
                    ₹{student.totalFees || 0}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}