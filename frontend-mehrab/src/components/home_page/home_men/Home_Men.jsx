"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockData } from "../../../data/halagat";

const HalaqaCard = ({ session }) => {
  // تحويل بيانات sheikh لتتناسب مع النموذج من الباك إند
  const sheikhInfo = session.sheikh || {
    name: session.name || "شيخ الحلقة",
    specialty: session.description ? "تحفيظ" : ""
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-emerald-800 mb-2">{session.title || session.name}</h3>
        <p className="text-gray-600 mb-4">{session.description}</p>
        
        <div className="flex items-center mb-4">
          <div>
            <p className="font-semibold text-emerald-700">{sheikhInfo.name}</p>
            <p className="text-gray-500 text-sm">{sheikhInfo.expertise || sheikhInfo.specialty}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">الموعد:</span>
            <span className="text-gray-800">
              {session.startTime ? new Date(session.startTime).toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "مفتوح"}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 text-sm">المشاركون:</span>
            <span className="text-gray-800">
              {session.participants ? (typeof session.participants === 'number' ? session.participants : session.participants.length) : "0"}/
              {session.maxParticipants || "غير محدود"}
            </span>
          </div>
          
          <Link href={`/halaga_page?id=${session.id || session._id}`}>
            <span className="block w-full bg-emerald-600 text-white text-center py-2 rounded-md hover:bg-emerald-700 transition-colors">
              التسجيل في الحلقة
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home_Men = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async (retryCount = 0) => {
      try {
        setLoading(true);
        // استرجاع بيانات الحلقات من الباك إند
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log(`جاري الاتصال بالخادم: ${apiUrl}/api/voice-rooms`);
        
        // تحديد وقت للتوقف (timeout) لمنع الانتظار لفترة طويلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
        
        const response = await fetch(`${apiUrl}/api/voice-rooms`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`فشل في استرجاع البيانات: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('تم استرجاع بيانات الحلقات من الباك إند:', data);
        setSessions(data);
        setError(null);
      } catch (err) {
        console.error('خطأ في استرجاع بيانات الحلقات:', err);
        
        // إعادة المحاولة تلقائيًا حتى 3 مرات مع زيادة وقت الانتظار
        if (retryCount < 2) {
          console.log(`محاولة إعادة الاتصال (${retryCount + 1}/3)...`);
          setTimeout(() => {
            fetchSessions(retryCount + 1);
          }, 1000 * (retryCount + 1)); // زيادة وقت الانتظار في كل مرة
          return;
        }
        
        let errorMessage = 'حدث خطأ أثناء تحميل البيانات';
        
        if (err.name === 'AbortError') {
          errorMessage = 'انتهت مهلة الاتصال بالخادم';
        } else if (err.message === 'Failed to fetch') {
          errorMessage = 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت';
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
        // استخدام البيانات المحلية في حالة فشل الاتصال بالباك إند
        setSessions(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-emerald-800 mb-4">
        حلقات تحفيظ القرآن الكريم
      </h1>
      
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        انضم إلى حلقات تحفيظ القرآن الكريم مع نخبة من المشايخ المتخصصين في التلاوة والتجويد والتفسير
      </p>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الحلقات...</p>
        </div>
      ) : error ? (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative text-center mb-8">
          <strong className="font-bold">تنبيه: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2">تم عرض بيانات افتراضية مؤقتاً</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/voice-rooms`)
                .then(response => response.json())
                .then(data => {
                  setSessions(data);
                  setError(null);
                })
                .catch(err => {
                  setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
                  setSessions(mockData);
                })
                .finally(() => setLoading(false));
            }}
            className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : null}
      
      {!loading && sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => (
            <HalaqaCard key={session.id || session._id} session={session} />
          ))}
        </div>
      ) : !loading && (!sessions || sessions.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد حلقات متاحة حالياً</p>
        </div>
      ) : null}
    </main>
  );
};

export default Home_Men;
