'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Login page (/) var menu disayala nako
  if (pathname === '/') return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-50 md:hidden shadow-lg">
      <button onClick={() => router.push('/dashboard')} className={`flex flex-col items-center ${pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
        <span className="text-xl">🏠</span>
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button onClick={() => router.push('/students')} className={`flex flex-col items-center ${pathname === '/students' ? 'text-blue-600' : 'text-gray-400'}`}>
        <span className="text-xl">🎓</span>
        <span className="text-[10px] font-bold">Students</span>
      </button>
      <button onClick={() => router.push('/attendance')} className={`flex flex-col items-center ${pathname === '/attendance' ? 'text-blue-600' : 'text-gray-400'}`}>
        <span className="text-xl">✅</span>
        <span className="text-[10px] font-bold">Attend</span>
      </button>
      <button onClick={() => router.push('/fees')} className={`flex flex-col items-center ${pathname === '/fees' ? 'text-blue-600' : 'text-gray-400'}`}>
        <span className="text-xl">💳</span>
        <span className="text-[10px] font-bold">Fees</span>
      </button>
    </div>
  );
}