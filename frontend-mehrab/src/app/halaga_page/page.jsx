"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Main from '@/components/halaqat/main/Main';

export default function HalaqaPage() {
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the room ID from URL query parameters
    const id = searchParams.get('id');
    
    if (!id) {
      setError("معرف الغرفة غير موجود");
      setIsLoading(false);
      return;
    }
    
    // Fetch room details to verify it exists
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/voice-rooms/${id}`);
        
        if (!response.ok) {
          throw new Error("فشل تحميل بيانات الغرفة");
        }
        
        const roomData = await response.json();
        setRoomId(roomData._id);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching room details:", error);
        setError("حدث خطأ أثناء تحميل بيانات الغرفة");
        setIsLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="bg-emerald-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-emerald-800 mb-2 font-arabic">جاري التحميل...</h2>
          <p className="text-gray-600 font-arabic">يرجى الانتظار بينما نقوم بتحميل بيانات الحلقة</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-emerald-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2 font-arabic">حدث خطأ</h2>
          <p className="text-gray-700 mb-4 font-arabic">{error}</p>
          <a href="/" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors font-arabic">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  return <Main roomId={roomId} />;
}