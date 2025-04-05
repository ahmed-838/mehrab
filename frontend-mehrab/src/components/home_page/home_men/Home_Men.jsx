import React from "react";
import Link from "next/link";
import Image from "next/image";
import { mockData } from "../../../data/halagat";

const HalaqaCard = ({ session }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-emerald-800 mb-2">{session.title}</h3>
        <p className="text-gray-600 mb-4">{session.description}</p>
        
        <div className="flex items-center mb-4">

          <div>
            <p className="font-semibold text-emerald-700">{session.sheikh.name}</p>
            <p className="text-gray-500 text-sm">{session.sheikh.specialty}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">الموعد:</span>
            <span className="text-gray-800">
              {new Date(session.startTime).toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 text-sm">المشاركون:</span>
            <span className="text-gray-800">{session.participantsCount}/{session.maxParticipants}</span>
          </div>
          
          <Link href={`/halaga_page?id=${session._id}`}>
            <span className="block w-full bg-emerald-600 text-white text-center py-2 rounded-md hover:bg-emerald-700 transition-colors">
              التسجيل في الحلقة
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home_Men = ({ sessions = mockData, loading = false, error = null }) => {
  return (
    <main className="container mx-auto px-4 py-12 bg-white">
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
          <p>{error}</p>
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => (
            <HalaqaCard key={session._id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد حلقات متاحة حالياً</p>
        </div>
      )}
    </main>
  );
};

export default Home_Men;
