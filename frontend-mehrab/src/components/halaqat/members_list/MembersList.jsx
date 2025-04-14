"use client";
import React, { useState, useEffect } from "react";
import { useParticipants } from "@/context/ParticipantsContext";
import { useTheme } from "@/context/ThemeContext";
import "@/styles/voice_wave.css";

const MembersList = ({ activeUser, onUserSelect }) => {
  const [showAll, setShowAll] = useState(false);
  const [volumeLevels, setVolumeLevels] = useState({});
  const { participants, leaveRoom } = useParticipants();
  const { isDarkMode } = useTheme();
  
  useEffect(() => {
    const updateVolumeLevels = () => {
      const newVolumeLevels = {};
      
      participants.forEach(member => {
        if (member.speakingNow && member.micOn) {
          newVolumeLevels[member.id] = {
            bars: [
              Math.floor(Math.random() * 5) + 1,
              Math.floor(Math.random() * 5) + 1,
              Math.floor(Math.random() * 5) + 1,
              Math.floor(Math.random() * 5) + 1,
              Math.floor(Math.random() * 5) + 1
            ]
          };
        }
      });
      
      setVolumeLevels(newVolumeLevels);
    };
    
    const intervalId = setInterval(updateVolumeLevels, 200);
    
    return () => clearInterval(intervalId);
  }, [participants]);
  
  const displayedMembers = showAll ? participants : participants.slice(0, 5);
  
  const getVolumeBarClass = (memberId, barIndex, defaultHeight) => {
    if (volumeLevels[memberId] && volumeLevels[memberId].bars) {
      const level = volumeLevels[memberId].bars[barIndex];
      
      switch(level) {
        case 1: return "h-1 bg-primary/40 animate-sound-wave-1";
        case 2: return "h-2 bg-primary/50 animate-sound-wave-1";
        case 3: return "h-3 bg-primary/70 animate-sound-wave-2";
        case 4: return "h-4 bg-primary/80 animate-sound-wave-2";
        case 5: return "h-5 bg-primary animate-sound-wave-3";
        default: return `${defaultHeight} bg-primary/60 animate-sound-wave-1`;
      }
    }
    
    return `${defaultHeight} bg-primary/60 animate-sound-wave-1`;
  };

  const handleLeaveRoom = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مغادرة الحلقة؟')) {
      await leaveRoom();
      window.location.href = '/';
    }
  };
  
  return (
    <div className="card bg-white dark:bg-secondary p-6 h-96 flex flex-col rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary dark:text-primary font-arabic">قائمة المشاركين</h2>
        <button 
          onClick={handleLeaveRoom}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
          title="مغادرة الحلقة"
        >
          مغادرة
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {participants.length > 0 ? (
          <ul className="space-y-2">
            {displayedMembers.map(member => (
              <li 
                key={member.id} 
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer 
                  transition-colors duration-200
                  ${activeUser && activeUser.id === member.id 
                    ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30' 
                    : 'hover:bg-secondary dark:hover:bg-accent/30'
                  }
                `}
                onClick={() => onUserSelect && onUserSelect(member)}
              >
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center ml-3 rtl:ml-3 rtl:mr-0
                    ${activeUser && activeUser.id === member.id 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-secondary dark:bg-accent/50 border border-border'
                    }
                  `}>
                    <span className={`
                      font-bold text-lg
                      ${activeUser && activeUser.id === member.id 
                        ? 'text-primary' 
                        : 'text-foreground'
                      }
                    `}>
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-foreground font-arabic">{member.name}</span>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {/* مؤشر التحدث */}
                  {member.speakingNow && member.micOn && (
                    <div className="flex space-x-0.5 rtl:space-x-reverse h-5 items-end ml-4 rtl:ml-4 rtl:mr-0">
                      <div className={`w-1 rounded-t-full mx-px ${getVolumeBarClass(member.id, 0, "h-1")}`}></div>
                      <div className={`w-1 rounded-t-full mx-px ${getVolumeBarClass(member.id, 1, "h-2")}`}></div>
                      <div className={`w-1 rounded-t-full mx-px ${getVolumeBarClass(member.id, 2, "h-3")}`}></div>
                      <div className={`w-1 rounded-t-full mx-px ${getVolumeBarClass(member.id, 3, "h-2")}`}></div>
                      <div className={`w-1 rounded-t-full mx-px ${getVolumeBarClass(member.id, 4, "h-1")}`}></div>
                    </div>
                  )}
                  
                  {/* حالة المايك */}
                  {member.micOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-border dark:text-border mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 font-arabic">لا يوجد مشاركون حالياً</p>
            </div>
          </div>
        )}
      </div>
      
      {participants.length > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="btn btn-secondary w-full mt-4"
        >
          {showAll ? 'عرض أقل' : `عرض الكل (${participants.length})`}
        </button>
      )}
    </div>
  );
};

export default MembersList;
