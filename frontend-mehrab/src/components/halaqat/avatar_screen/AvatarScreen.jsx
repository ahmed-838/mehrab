"use client";
import React from "react";
import { useParticipants } from "@/context/ParticipantsContext";
import { useTheme } from "@/context/ThemeContext";

const AvatarScreen = ({ activeUser }) => {
  const { participants } = useParticipants();
  const { isDarkMode } = useTheme();
  
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "؟";
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 h-96 flex flex-col rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-green-500 font-arabic">المشاركون في الحلقة</h2>
        <span className="text-sm bg-green-100 dark:bg-gray-700 px-2 py-1 rounded-full text-green-500 dark:text-green-400">
          {participants.length} مشارك
        </span>
      </div>
      
      {participants && participants.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 overflow-y-auto">
          {participants.map((user) => (
            <div key={user.id} className="flex flex-col items-center group">
              <div className={`relative w-16 h-16 ${user.speakingNow ? 'animate-pulse' : ''}`}>
                <div className={`
                  w-16 h-16 rounded-full 
                  flex items-center justify-center 
                  relative z-10
                  transition-all duration-300
                  ${user.speakingNow ? 
                    'bg-green-100 border-2 border-green-500' : 
                    'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }
                  group-hover:border-green-500
                `}>
                  <span className={`
                    text-xl font-bold
                    ${user.speakingNow ? 'text-green-500' : 'text-gray-800 dark:text-gray-200'}
                  `}>{getInitial(user.name)}</span>
                </div>
                {user.speakingNow && (
                  <div className="absolute inset-0 rounded-full bg-green-200/50 dark:bg-green-500/30 animate-ping z-0"></div>
                )}
              </div>
              <p className="mt-2 text-sm font-arabic text-center text-gray-800 dark:text-gray-200 font-medium">{user.name}</p>
              
              <div className="flex space-x-2 rtl:space-x-reverse mt-1">
                {user.micOn ? (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {user.speakerOn ? (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-arabic">لا يوجد مشاركون حالياً</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarScreen;
