'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  rollNo?: string;
  stdClass: string;
  medium?: string; 
  parentPhone?: string;
  totalFees?: number;
}

export default function StudentsPage() {
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<'menu' | 'add' | 'class-list' | 'student-list'>('menu');
  const [selectedViewClass, setSelectedViewClass] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [stdClass, setStdClass] = useState('10th');
  const [medium, setMedium] = useState('Semi'); 
  const [parentPhone, setParentPhone] = useState('');
  const [totalFees, setTotalFees] = useState('');

  const allClasses = [
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', 
    '11th Sci', '11th Com', '11th Art', '12th Sci', '12th Com', '12th Art'
  ];

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentList = querySnapshot.docs.map(document => ({ id: document.id, ...document.data() })) as Student[];
      
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

  useEffect(() => {
    const loadData = async () => {
      await fetchStudents();
    };
    loadData();
  }, []);
  
  const saveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalPhone = parentPhone.replace(/\D/g, '');
    if (finalPhone.length > 0 && finalPhone.length !== 10 && finalPhone.length !== 12) {
      return alert("कृपया बरोबर WhatsApp नंबर टाका!");
    }
    if (finalPhone.length === 10) finalPhone = `91${finalPhone}`;

    if (!editingId) {
      const isDuplicate = students.some(
        s => s.name.toLowerCase() === name.toLowerCase() && s.stdClass === stdClass
      );
      if (isDuplicate) {
        return alert("⚠️ हा विद्यार्थी याच क्लासमध्ये आधीच Database मध्ये आहे! (Duplicate Entry)");
      }
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'students', editingId), { name, rollNo, stdClass, medium, parentPhone: finalPhone, totalFees: Number(totalFees) || 0 });
        alert("Student Updated! ✅");
        setCurrentView('student-list');
      } else {
        await addDoc(collection(db, 'students'), { name, rollNo, stdClass, medium, parentPhone: finalPhone, totalFees: Number(totalFees) || 0, addedAt: new Date().toISOString() });
        alert("Student Added! ✅");
        setCurrentView('menu');
      }
      resetForm();
      fetchStudents();
    } catch (error) { console.error(error); alert("Error saving!"); }
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setRollNo(student.rollNo || '');
    setStdClass(student.stdClass);
    setMedium(student.medium || 'Semi');
    setParentPhone(student.parentPhone?.replace('91', '') || '');
    setTotalFees(student.totalFees?.toString() || '');
    setCurrentView('add'); 
  };

  const resetForm = () => {
    setName(''); setRollNo(''); setParentPhone(''); setTotalFees('');
    setEditingId(null);
  };

  const deleteStudent = async (id: string, studentName: string) => {
    if (confirm(`Delete ${studentName}?`)) {
      await deleteDoc(doc(db, 'students', id));
      fetchStudents();
    }
  };

  const uploadBulkData = async () => {
    const confirmUpload = confirm("सगळे विद्यार्थी Database मध्ये add करायचे का?");
    if (!confirmUpload) return;

    const bulkData = [
      { rollNo: "1", name: "Vaishanvi Balkrishna Sapte", stdClass: "10th", parentPhone: "917798008201", medium: "Semi" },
      { rollNo: "2", name: "Ambika Nangath Lingampile", stdClass: "10th", parentPhone: "918766822454", medium: "Semi" },
      { rollNo: "3", name: "Khushi Suresh Gonewar", stdClass: "10th", parentPhone: "918390309001", medium: "Semi" },
      { rollNo: "4", name: "Shinde shreya shivaji", stdClass: "10th", parentPhone: "918888381542", medium: "Semi" },
      { rollNo: "5", name: "Rutuja Thaware", stdClass: "10th", parentPhone: "919657680670", medium: "Semi" },
      { rollNo: "6", name: "Sandhya shigle", stdClass: "10th", parentPhone: "918275940691", medium: "Semi" },
      { rollNo: "7", name: "Adarsh Vasant kadam", stdClass: "10th", parentPhone: "919130205674", medium: "Semi" },
      { rollNo: "8", name: "Prathamesh shinde", stdClass: "10th", parentPhone: "919552394473", medium: "Semi" },
      { rollNo: "9", name: "Sainath Jadhav", stdClass: "10th", parentPhone: "919922399804", medium: "Semi" },
      { rollNo: "10", name: "Kunal Gangadhar chavan", stdClass: "10th", parentPhone: "919552921574", medium: "Semi" },
      { rollNo: "11", name: "Dinesh Ganore", stdClass: "10th", parentPhone: "917720938092", medium: "Semi" },
      { rollNo: "12", name: "Abdul pathan", stdClass: "10th", parentPhone: "919527236204", medium: "Semi" },
      { rollNo: "13", name: "Aditya Borgawe", stdClass: "10th", parentPhone: "917397889849", medium: "Semi" },
      { rollNo: "14", name: "Anand surywanshi", stdClass: "10th", parentPhone: "919049103387", medium: "Semi" },
      { rollNo: "15", name: "Laxman khandelote", stdClass: "10th", parentPhone: "918459746146", medium: "Semi" },
      { rollNo: "16", name: "Mahesh Hivrale", stdClass: "10th", parentPhone: "9193870452078", medium: "Semi" },
      { rollNo: "17", name: "Rajesh kandare", stdClass: "10th", parentPhone: "918010201355", medium: "Semi" },
      { rollNo: "18", name: "Sarthak Damodhar", stdClass: "10th", parentPhone: "917875622096", medium: "Semi" },
      { rollNo: "19", name: "Shriniwas kadam", stdClass: "10th", parentPhone: "919923720946", medium: "Semi" },
      { rollNo: "20", name: "Vedant sungurwad", stdClass: "10th", parentPhone: "917820840319", medium: "Semi" },
      { rollNo: "21", name: "Vijay Puyad", stdClass: "10th", parentPhone: "919881619683", medium: "Semi" },
      { rollNo: "22", name: "Vitthal Bhutawale", stdClass: "10th", parentPhone: "917620812482", medium: "Semi" },

      { rollNo: "1", name: "Vranda Bachuwar", stdClass: "9th", parentPhone: "919421762916", medium: "Semi" },
      { rollNo: "2", name: "Priyanka Dhage", stdClass: "9th", parentPhone: "918805470594", medium: "Semi" },
      { rollNo: "3", name: "Shreya Dhage", stdClass: "9th", parentPhone: "919767072722", medium: "Semi" },
      { rollNo: "4", name: "Sanskruti Dhage", stdClass: "9th", parentPhone: "919527458156", medium: "Semi" },
      { rollNo: "5", name: "Arya Kete", stdClass: "9th", parentPhone: "919527264249", medium: "Semi" },
      { rollNo: "6", name: "Snehal Dhere", stdClass: "9th", parentPhone: "919373463669", medium: "Semi" },
      { rollNo: "7", name: "Radhika Wattamwar", stdClass: "9th", parentPhone: "919943574748", medium: "Semi" },
      { rollNo: "8", name: "Trisha Gangasagre", stdClass: "9th", parentPhone: "918087818450", medium: "Semi" },
      { rollNo: "9", name: "Shruti Wadikar", stdClass: "9th", parentPhone: "919767510699", medium: "Semi" },
      { rollNo: "10", name: "Sidhika dhere", stdClass: "9th", parentPhone: "919767203704", medium: "Semi" },
      { rollNo: "11", name: "Shreya Jadhav", stdClass: "9th", parentPhone: "919890207829", medium: "Semi" },
      { rollNo: "12", name: "Bhakti Mathpati", stdClass: "9th", parentPhone: "919309891771", medium: "Semi" },
      { rollNo: "13", name: "Aakshra Honshette", stdClass: "9th", parentPhone: "919021563195", medium: "Semi" },
      { rollNo: "14", name: "Rutuja Shinde", stdClass: "9th", parentPhone: "917620024835", medium: "Semi" },
      { rollNo: "15", name: "Madhav Panchal", stdClass: "9th", parentPhone: "917498994887", medium: "Semi" },
      { rollNo: "16", name: "Nandini Supare", stdClass: "9th", parentPhone: "919322911165", medium: "Semi" },
      { rollNo: "17", name: "Vaishanvi Asore", stdClass: "9th", parentPhone: "919623500752", medium: "Semi" },
      { rollNo: "18", name: "Pruthviraj Shinde", stdClass: "9th", parentPhone: "919011196039", medium: "Semi" },
      { rollNo: "19", name: "Prasad Manurkar", stdClass: "9th", parentPhone: "919579431451", medium: "Semi" },
      { rollNo: "20", name: "Pranjali Honshette", stdClass: "9th", parentPhone: "919850615987", medium: "Semi" },
      { rollNo: "21", name: "Raj Thakre", stdClass: "9th", parentPhone: "919767225298", medium: "Semi" },
      { rollNo: "22", name: "Rudrayni Honshette", stdClass: "9th", parentPhone: "918698676019", medium: "Semi" },
      { rollNo: "23", name: "Rutuja Aneray", stdClass: "9th", parentPhone: "917875137598", medium: "Semi" },
      { rollNo: "24", name: "Sairaj Khandre", stdClass: "9th", parentPhone: "919730495482", medium: "Semi" },
      { rollNo: "25", name: "Samruddhi Panchal", stdClass: "9th", parentPhone: "918551049327", medium: "Semi" },
      { rollNo: "26", name: "Vivek Anantwar", stdClass: "9th", parentPhone: "918766525171", medium: "Semi" },
      { rollNo: "27", name: "Shital Honshette", stdClass: "9th", parentPhone: "918378031304", medium: "Semi" },
      { rollNo: "28", name: "Shivhar Lingade", stdClass: "9th", parentPhone: "919011899952", medium: "Semi" },

      { rollNo: "1", name: "Maroti Honshette", stdClass: "8th", parentPhone: "919145579275", medium: "Semi" },
      { rollNo: "2", name: "Nagesh Nilewar", stdClass: "8th", parentPhone: "918605163142", medium: "Semi" },
      { rollNo: "3", name: "Nikita Jadhav", stdClass: "8th", parentPhone: "919356163218", medium: "Semi" },
      { rollNo: "4", name: "Pavan Jadhav", stdClass: "8th", parentPhone: "917757816403", medium: "Semi" },
      { rollNo: "5", name: "Swapnil Jadhav", stdClass: "8th", parentPhone: "917887681030", medium: "Semi" },
      { rollNo: "6", name: "Vaishnavi chandapure", stdClass: "8th", parentPhone: "917768947120", medium: "Semi" },

      { rollNo: "1", name: "Anushka kadam", stdClass: "7th", parentPhone: "919130205674", medium: "Semi" },
      { rollNo: "2", name: "Manmath Ghogre", stdClass: "7th", parentPhone: "919834757717", medium: "Semi" },
      { rollNo: "3", name: "Aditi Ghogre", stdClass: "7th", parentPhone: "919049515429", medium: "Semi" },
      { rollNo: "4", name: "Ankita Honshette", stdClass: "7th", parentPhone: "918390815264", medium: "Semi" },
      { rollNo: "5", name: "Omkar gangasagre", stdClass: "7th", parentPhone: "919579463390", medium: "Semi" },
      { rollNo: "6", name: "Balaji Panchal", stdClass: "7th", parentPhone: "917498994887", medium: "Semi" },
      { rollNo: "7", name: "Pankaja Honshette", stdClass: "7th", parentPhone: "919850428724", medium: "Semi" },
      { rollNo: "8", name: "Pankaja Jadhav", stdClass: "7th", parentPhone: "919322376140", medium: "Semi" },
      { rollNo: "9", name: "Samrudhi Jadhav", stdClass: "7th", parentPhone: "919307438315", medium: "Semi" },
      { rollNo: "10", name: "Pranita Landge", stdClass: "7th", parentPhone: "918459987709", medium: "Semi" },
      { rollNo: "11", name: "Rutuja Honshette", stdClass: "7th", parentPhone: "918698676019", medium: "Semi" },
      { rollNo: "12", name: "Maroti Aneray", stdClass: "7th", parentPhone: "917875137598", medium: "Semi" },
      { rollNo: "13", name: "Sidhant Aneraye", stdClass: "7th", parentPhone: "917350696218", medium: "Semi" },
      { rollNo: "14", name: "Omkar Supare", stdClass: "7th", parentPhone: "919637084740", medium: "Semi" },
      { rollNo: "15", name: "Mategawde", stdClass: "7th", parentPhone: "919359651308", medium: "Semi" },
      { rollNo: "16", name: "Tushar mutadkar", stdClass: "7th", parentPhone: "917083304889", medium: "Semi" },

      { rollNo: "1", name: "Rudransh Honshette", stdClass: "5th", parentPhone: "918698676019", medium: "Semi" },
      { rollNo: "2", name: "Varad Honshette", stdClass: "5th", parentPhone: "919021563195", medium: "Semi" },
      { rollNo: "3", name: "Sonakshi Honshette", stdClass: "5th", parentPhone: "918412949219", medium: "Semi" }
    ];

    try {
      let addedCount = 0;
      let skippedCount = 0; // 🟢 Variable properly declared
      
      for (const student of bulkData) {
        const isDuplicate = students.some(
          s => s.name.toLowerCase() === student.name.toLowerCase() && s.stdClass === student.stdClass
        );

        if (!isDuplicate) {
          await addDoc(collection(db, 'students'), { ...student, addedAt: new Date().toISOString() });
          addedCount++;
        } else {
          skippedCount++;
        }
      }
      
      // 🟢 Fixed: Variables are used successfully in the alert box
      alert(`🔥 Success! ${addedCount} Students Save झाले! (⚠️ ${skippedCount} Duplicate skip केले)`);
      fetchStudents(); 
    } catch (error) {
      console.error(error);
      alert("Error in bulk upload!");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.parentPhone && s.parentPhone.includes(searchQuery)) ||
    (s.rollNo && s.rollNo.includes(searchQuery))
  );

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-extrabold text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans pb-24 md:pb-28">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
        
        {/* 🔹 MAIN HEADER 🔹 */}
        <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-black shadow-sm">
          <button 
            onClick={() => {
              if (currentView === 'menu') router.push('/dashboard');
              else if (currentView === 'student-list') setCurrentView('class-list');
              else setCurrentView('menu');
            }} 
            className="bg-white border-2 border-black text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-extrabold hover:bg-gray-100 transition-all"
          >
            ← Back
          </button>
          <h1 className="text-lg md:text-2xl font-black text-black hidden sm:block">Students Mgmt</h1>
          
          <div className="flex gap-2">
            <button onClick={uploadBulkData} className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm border-2 border-black hover:bg-blue-700">
              Bulk Upload 🚀
            </button>
          </div>
        </div>

        {/* 🔹 VIEW 1: MAIN MENU (Mobile Optimized) 🔹 */}
        {currentView === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-4 md:py-10 animate-fade-in">
            <div 
              onClick={() => { resetForm(); setCurrentView('add'); }} 
              className="cursor-pointer bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="text-4xl md:text-6xl">➕</div>
              <h2 className="text-xl md:text-2xl font-black text-black">Add New Student</h2>
              <p className="text-xs md:text-base text-gray-600 font-bold">Register a new student</p>
            </div>
            
            <div 
              onClick={() => setCurrentView('class-list')} 
              className="cursor-pointer bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="text-4xl md:text-6xl">📂</div>
              <h2 className="text-xl md:text-2xl font-black text-black">View Students</h2>
              <p className="text-xs md:text-base text-gray-600 font-bold">Class-wise student list</p>
            </div>
          </div>
        )}

        {/* 🔹 VIEW 2: ADD / EDIT STUDENT FORM 🔹 */}
        {currentView === 'add' && (
          <form onSubmit={saveStudent} className="bg-white p-5 md:p-8 rounded-xl md:rounded-2xl border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
            <h2 className="text-xl md:text-2xl font-black text-black mb-4 md:mb-6 border-b-[3px] md:border-b-4 border-black pb-2">{editingId ? 'EDIT STUDENT' : 'ADD NEW STUDENT'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <input type="text" placeholder="Name" required className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base placeholder-gray-500" value={name} onChange={e => setName(e.target.value)} />
              <input type="text" placeholder="Roll No" className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base placeholder-gray-500" value={rollNo} onChange={e => setRollNo(e.target.value)} />
              <input type="tel" maxLength={10} placeholder="WhatsApp No (10 digits)" required className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base placeholder-gray-500" value={parentPhone} onChange={e => setParentPhone(e.target.value.replace(/\D/g, ''))} />
              
              <select className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base" value={stdClass} onChange={e => setStdClass(e.target.value)}>
                {allClasses.map(c => <option key={c} value={c}>{c} Standard</option>)}
              </select>
              
              <select className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base" value={medium} onChange={e => setMedium(e.target.value)}>
                {['Semi', 'English', 'Marathi'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" placeholder="Total Fees" className="bg-white border-2 border-black p-3 md:p-4 rounded-xl text-black font-bold text-sm md:text-base placeholder-gray-500" value={totalFees} onChange={e => setTotalFees(e.target.value)} />
            </div>
            <button type="submit" className="w-full mt-6 md:mt-8 bg-black text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg border-2 border-black hover:bg-gray-800 hover:shadow-lg transition-all">{editingId ? 'Update Student 🔄' : 'Save Student 💾'}</button>
          </form>
        )}

        {/* 🔹 VIEW 3: CLASS LIST (BATCHES) 🔹 */}
        {currentView === 'class-list' && (
          <div className="animate-fade-in">
            <h2 className="text-xl md:text-2xl font-black text-black mb-4 md:mb-6">Select a Class</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {allClasses.map(cls => {
                const count = students.filter(s => s.stdClass === cls).length;
                return (
                  <button 
                    key={cls} 
                    onClick={() => { setSelectedViewClass(cls); setCurrentView('student-list'); }} 
                    className="bg-white border-[3px] border-black p-4 md:p-6 rounded-xl md:rounded-2xl hover:bg-gray-100 active:scale-95 md:hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
                  >
                    <h3 className="text-lg md:text-xl font-black text-black">{cls}</h3>
                    <p className="text-[10px] md:text-sm font-bold text-gray-600 mt-2 bg-gray-100 px-2 py-1 md:px-3 md:py-1 rounded-full border border-gray-300">Students: {count}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 🔹 VIEW 4: STUDENT LIST (SPECIFIC CLASS) 🔹 */}
        {currentView === 'student-list' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4 md:mb-6 border-b-[3px] md:border-b-4 border-black pb-3 md:pb-4">
              <h2 className="text-lg md:text-2xl font-black text-black">{selectedViewClass} Std.</h2>
              <span className="bg-black text-white font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full border-2 border-black text-xs md:text-sm">
                Total: {students.filter(s => s.stdClass === selectedViewClass).length}
              </span>
            </div>

            <input 
              type="text" 
              placeholder="🔍 Search Student..." 
              className="w-full p-3 md:p-4 mb-4 md:mb-6 rounded-xl border-2 border-black text-black bg-white font-bold text-sm md:text-base placeholder-gray-500 shadow-sm" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {filteredStudents.filter(s => s.stdClass === selectedViewClass).length === 0 ? (
                <div className="col-span-full p-6 md:p-10 text-center font-bold text-gray-400 bg-white rounded-xl border-2 border-gray-200">
                  No students found.
                </div>
              ) : (
                filteredStudents.filter(s => s.stdClass === selectedViewClass).map((s) => (
                  <div key={s.id} className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-black text-base md:text-lg mb-1 md:mb-2 leading-tight">
                        <span className="text-gray-500 mr-1">#{s.rollNo || '-'}</span> {s.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700 font-bold">📱 {s.parentPhone || 'N/A'}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-5">
                      <button onClick={() => setViewStudent(s)} className="flex-1 bg-white border-2 border-black text-black py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs active:bg-gray-100">Info 👁️</button>
                      <button onClick={() => startEdit(s)} className="flex-1 bg-white border-2 border-black text-black py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs active:bg-gray-100">Edit ✏️</button>
                      <button onClick={() => deleteStudent(s.id, s.name)} className="flex-1 bg-red-50 border-2 border-black text-red-700 py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs active:bg-red-100">Delete ✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 🔹 SINGLE STUDENT INFO MODAL 🔹 */}
        {viewStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-3 md:p-4 z-50 animate-fade-in">
            <div className="bg-white border-[3px] md:border-4 border-black p-6 md:p-8 rounded-2xl md:rounded-3xl max-w-[90%] md:max-w-sm w-full shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative">
              <button 
                onClick={() => setViewStudent(null)} 
                className="absolute top-3 right-4 md:top-4 md:right-5 font-black text-xl md:text-2xl text-black hover:text-red-600"
              >
                ✕
              </button>
              <h2 className="text-lg md:text-2xl font-black text-black mb-4 md:mb-6 border-b-[3px] border-black pb-2">Student Info</h2>
              <div className="space-y-3 md:space-y-4 text-black font-bold text-sm md:text-lg">
                <p><span className="text-gray-500 block text-xs md:text-sm">Name</span> {viewStudent.name}</p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <p><span className="text-gray-500 block text-xs md:text-sm">Class</span> {viewStudent.stdClass}</p>
                  <p><span className="text-gray-500 block text-xs md:text-sm">Roll No</span> {viewStudent.rollNo || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <p><span className="text-gray-500 block text-xs md:text-sm">Medium</span> {viewStudent.medium || 'Semi'}</p>
                  <p><span className="text-gray-500 block text-xs md:text-sm">Fees</span> ₹{viewStudent.totalFees || '0'}</p>
                </div>
                <p><span className="text-gray-500 block text-xs md:text-sm">Phone</span> {viewStudent.parentPhone}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}