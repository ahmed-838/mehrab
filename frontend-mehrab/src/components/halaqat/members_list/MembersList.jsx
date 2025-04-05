import React, { useState, useEffect } from "react";
import { participants } from "@/data/participants";
import "@/styles/voice_wave.css";

const MembersList = ({ activeUser, onUserSelect }) => {
  const [showAll, setShowAll] = useState(false);
  const [volumeLevels, setVolumeLevels] = useState({});
  
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
  }, []);
  
  const displayedMembers = showAll ? participants : participants.slice(0, 5);
  
  const getVolumeBarClass = (memberId, barIndex, defaultHeight) => {
    if (volumeLevels[memberId] && volumeLevels[memberId].bars) {
      const level = volumeLevels[memberId].bars[barIndex];
      
      switch(level) {
        case 1: return "h-1 bg-green-300 animate-sound-wave-1";
        case 2: return "h-2 bg-green-400 animate-sound-wave-1";
        case 3: return "h-3 bg-green-500 animate-sound-wave-2";
        case 4: return "h-4 bg-green-600 animate-sound-wave-2";
        case 5: return "h-5 bg-green-700 animate-sound-wave-3";
        default: return `${defaultHeight} bg-green-400 animate-sound-wave-1`;
      }
    }
    
    return `${defaultHeight} bg-green-400 animate-sound-wave-1`;
  };
  
  return (
    <div dir="rtl" className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-emerald-700 mb-4 text-right font-arabic">
        المشاركين
      </h2>
      
      <div className="space-y-1">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              activeUser && activeUser.id === member.id
                ? "bg-emerald-500 border-r-4 border-emerald-700"
                :  "hover:bg-emerald-50"
            }`}
            onClick={() => onUserSelect(member)}
          >
            {/* صورة المستخدم */}
            <div className="relative ml-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                bg-emerald-100 text-emerald-700`}>
                {member.name.charAt(0).toUpperCase() === 'M' ? (
                  <span className="text-md font-bold">M</span>
                ) : (
                  <span className="text-md font-bold font-arabic">
                    {member.name.charAt(0)}
                  </span>
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                  member.online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
            
            {/* معلومات المستخدم */}
            <div className="flex-grow text-right">
              <h3 className={`font-medium text-gray-800 font-arabic`}>
                {member.name}
              </h3>
            </div>
            
            {/* أيقونات المايك والسماعة */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* مؤشر الصوت - يظهر فقط عندما يكون المايك مفتوح والمستخدم يتحدث */}
              {member.micOn && member.speakingNow && (
                <div className="flex items-end h-4 space-x-0.5 rtl:space-x-reverse">
                  <div className={`w-0.5 ${getVolumeBarClass(member.id, 0, "h-1")}`}></div>
                  <div className={`w-0.5 ${getVolumeBarClass(member.id, 1, "h-2")}`}></div>
                  <div className={`w-0.5 ${getVolumeBarClass(member.id, 2, "h-3")}`}></div>
                  <div className={`w-0.5 ${getVolumeBarClass(member.id, 3, "h-2")}`}></div>
                  <div className={`w-0.5 ${getVolumeBarClass(member.id, 4, "h-1")}`}></div>
                </div>
              )}
              
              {/* أيقونة السماعة */}
              <div className="flex items-center">
                {member.speakerOn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${member.id === 4 ? "text-white" : "text-green-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* أيقونة المايك */}
              <div className="flex items-center">
                {member.micOn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${member.id === 4 ? "text-white" : "text-green-600"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {participants.length > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="mt-4 w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-arabic"
        >
          {showAll ? "عرض أقل" : "عرض الكل"}
        </button>
      )}
    </div>
  );
};

export default MembersList;
