"use client";
import React, { useState } from "react";
import AvatarScreen from "../avatar_screen/AvatarScreen";
import AudioBar from "../audio_bar/AudioBar";
import MembersList from "../members_list/MembersList";

const Main = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handleUserSelect = (user) => {
    setActiveUser(user);
  };

  const handleAudioToggle = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  return (
    <div className="bg-emerald-50 min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-emerald-800 text-center mb-8 font-arabic">
          حلقة تحفيظ القرآن الكريم
        </h1>
        
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
              <AudioBar 
                isPlaying={isAudioPlaying} 
                onTogglePlay={handleAudioToggle} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
