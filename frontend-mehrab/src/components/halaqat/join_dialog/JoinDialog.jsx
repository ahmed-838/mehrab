"use client";
import React, { useState } from 'react';
import { useParticipants } from '@/context/ParticipantsContext';

const JoinDialog = ({ roomId, onJoinSuccess, isOpen }) => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinRoom } = useParticipants();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('يرجى إدخال اسمك');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await joinRoom(roomId, userName);
      
      if (success) {
        onJoinSuccess();
      } else {
        setError('حدث خطأ أثناء الانضمام للحلقة، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4 text-center font-arabic">
          الانضمام إلى الحلقة
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userName" className="block mb-2 font-medium text-gray-700 font-arabic">
              الاسم
            </label>
            <input
              type="text"
              id="userName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="أدخل اسمك"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
              dir="rtl"
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-center font-arabic">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full p-3 rounded-md font-medium text-white transition-colors ${
              isLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'جاري الانضمام...' : 'انضمام'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinDialog; 