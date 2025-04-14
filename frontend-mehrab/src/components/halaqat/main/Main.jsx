"use client";
import React, { useState } from "react";
import AvatarScreen from "../avatar_screen/AvatarScreen";
import AudioBar from "../audio_bar/AudioBar";
import MembersList from "../members_list/MembersList";
import JoinDialog from "../join_dialog/JoinDialog";
import { ParticipantsProvider } from "@/context/ParticipantsContext";

const Main = ({ roomId = "default-room-id" }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const handleUserSelect = (user) => {
    setActiveUser(user);
  };

  const handleJoinSuccess = () => {
    setShowJoinDialog(false);
    setIsJoined(true);
  };

  return (
    <ParticipantsProvider>
      <div className="bg-emerald-50 min-h-screen p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-emerald-800 text-center mb-8 font-arabic">
            حلقة تحفيظ القرآن الكريم
          </h1>
          
          {isJoined ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* قائمة الأعضاء - 1/4 من العرض */}
              <div className="lg:col-span-1">
                <MembersList 
                  activeUser={activeUser} 
                  onUserSelect={handleUserSelect} 
                />
              </div>
              
              {/* شاشة العرض الرئيسية - 3/4 من العرض */}
              <div className="lg:col-span-3 flex flex-col">
                <AvatarScreen activeUser={activeUser} />
                <div className="mt-4">
                  <AudioBar />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-emerald-700 mb-4 font-arabic">
                  مرحباً بك في حلقة التحفيظ
                </h2>
                <p className="text-gray-600 mb-6 font-arabic">
                  الرجاء الانضمام إلى الحلقة للمشاركة مع المتواجدين
                </p>
                <button
                  onClick={() => setShowJoinDialog(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-arabic"
                >
                  انضمام إلى الحلقة
                </button>
              </div>
            </div>
          )}
          
          <JoinDialog 
            roomId={roomId}
            isOpen={showJoinDialog}
            onJoinSuccess={handleJoinSuccess}
          />
        </div>
      </div>
    </ParticipantsProvider>
  );
};

export default Main;
