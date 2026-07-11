import { useState } from 'react';

export default function AttendanceHistoryApp() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Dummy Data
  const classesList = ['10th English Medium', '9th English Medium', '8th Marathi Medium'];
  const datesList = ['11-July-2026', '10-July-2026', '09-July-2026'];
  
  // Detailed Information added (Time & Contact)
  const attendanceData = [
    { rollNo: 1, name: 'Aditya Bhumkar', status: 'Present', time: '08:30 AM', contact: '9876543210' },
    { rollNo: 2, name: 'Rahul Sharma', status: 'Absent', time: '-', contact: '9123456789' },
    { rollNo: 3, name: 'Neha Patil', status: 'Present', time: '08:35 AM', contact: '9988776655' },
  ];

  return (
    // 'max-w-md mx-auto' makes it look exactly like a Mobile App screen on laptops too
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen border-x border-gray-200 shadow-sm font-sans">
      
      {/* APP HEADER (Sticky top) */}
      <header className="bg-white px-4 py-4 border-b border-gray-200 flex items-center sticky top-0 z-10">
        {(selectedClass) && (
          <button 
            onClick={() => selectedDate ? setSelectedDate(null) : setSelectedClass(null)}
            className="mr-3 text-blue-600 font-bold text-xl px-2"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-800">History</h1>
          {selectedClass && <p className="text-xs text-gray-500">{selectedClass} {selectedDate && `| ${selectedDate}`}</p>}
        </div>
      </header>

      <main className="p-4">
        
        {/* STEP 1: CLASS SELECTION */}
        {!selectedClass && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Select Class</h2>
            {classesList.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left flex justify-between items-center active:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-800">{cls}</span>
                <span className="text-gray-400">➔</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: DATE SELECTION */}
        {selectedClass && !selectedDate && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Select Date</h2>
            {datesList.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left flex justify-between items-center active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">📅</div>
                  <span className="font-medium text-gray-800">{date}</span>
                </div>
                <span className="text-gray-400">➔</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: DETAILED TABLE (App Format) */}
        {selectedClass && selectedDate && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Summary Header */}
            <div className="bg-gray-100 p-3 flex justify-between text-sm border-b border-gray-200">
              <span className="font-medium text-gray-600">Total Students: {attendanceData.length}</span>
              <span className="text-green-600 font-semibold">
                Present: {attendanceData.filter(s => s.status === 'Present').length}
              </span>
            </div>

            {/* Detailed List */}
            <div className="flex flex-col">
              {attendanceData.map((student, index) => (
                <div key={student.rollNo} className={`p-4 flex items-center justify-between ${index !== attendanceData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  
                  {/* Left Side: Roll No & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex justify-center items-center font-bold text-xs">
                      {student.rollNo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-xs text-gray-500">📞 {student.contact}</p>
                    </div>
                  </div>

                  {/* Right Side: Status & Time */}
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      student.status === 'Present' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{student.time}</p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}