"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParticipants } from "@/context/ParticipantsContext";
import { useTheme } from "@/context/ThemeContext";
import dynamic from 'next/dynamic';

// تصدير المكون كمكون جانب العميل فقط
const AudioBar = dynamic(() => Promise.resolve(AudioBarComponent), {
  ssr: false,
});

// المكون الأساسي مبسط
const AudioBarComponent = () => {
  // المتغيرات الأساسية
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // مراجع لتخزين البيانات
  const audioStreamRef = useRef(null);
  const peersRef = useRef({});
  const SimplePeerRef = useRef(null);
  const connectionInitialized = useRef(false);
  
  // الوصول إلى السياق
  const { currentUser, participants, toggleMic, toggleSpeaker, socket } = useParticipants();
  const { isDarkMode } = useTheme();

  // تحميل مكتبة SimplePeer عند التهيئة
  useEffect(() => {
    setIsClient(true);
    
    // تحميل SimplePeer على جانب العميل فقط
    if (typeof window !== 'undefined') {
      import('simple-peer').then(module => {
        SimplePeerRef.current = module.default;
        console.log("SimplePeer loaded");
      });
    }
    
    // تنظيف عند إزالة المكون
    return () => {
      stopMicrophone();
    };
  }, []);

  // إعداد أحداث WebRTC مرة واحدة فقط
  useEffect(() => {
    if (!isClient || !socket || !SimplePeerRef.current || connectionInitialized.current) return;
    
    // تسجيل الأحداث مرة واحدة فقط
    console.log("Setting up WebRTC events");
    connectionInitialized.current = true;
    
    // اتصال مستخدم جديد
    socket.on('user-connected', (userData) => {
      if (!currentUser || userData.userId === currentUser.id || !isMicOn) return;
      console.log("User connected:", userData.userId);
      createPeer(userData.userId, true);
    });
    
    // استقبال إشارة من مستخدم
    socket.on('user-joined', ({ signal, callerId }) => {
      if (!currentUser || callerId === currentUser.id || !isMicOn) return;
      console.log("Received join signal from:", callerId);
      
      const peer = createPeer(callerId, false);
      if (peer) peer.signal(signal);
    });
    
    // استقبال إشارة الرد
    socket.on('receiving-returned-signal', ({ signal, id }) => {
      if (!peersRef.current[id]) return;
      console.log("Received return signal from:", id);
      peersRef.current[id].signal(signal);
    });
    
    // قطع اتصال مستخدم
    socket.on('user-disconnected', (userId) => {
      console.log("User disconnected:", userId);
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
      }
      
      const audioEl = document.getElementById(`audio-${userId}`);
      if (audioEl) audioEl.remove();
    });
    
    return () => {
      socket.off('user-connected');
      socket.off('user-joined');
      socket.off('receiving-returned-signal');
      socket.off('user-disconnected');
    };
  }, [isClient, socket, currentUser, SimplePeerRef.current]);
  
  // معالجة تغيير حالة الميكروفون
  useEffect(() => {
    if (!isClient || !currentUser) return;
    
    if (isMicOn) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
  }, [isMicOn, isClient, currentUser]);

  // إنشاء اتصال الند للند
  const createPeer = (userId, initiator) => {
    if (!SimplePeerRef.current || !audioStreamRef.current || !socket || !currentUser) return null;
    
    // تدمير الاتصال القديم إن وجد
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
    }
    
    console.log(`Creating ${initiator ? 'initiator' : 'receiver'} peer for:`, userId);
    
    try {
      const peer = new SimplePeerRef.current({
        initiator,
        stream: audioStreamRef.current,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });
      
      // إرسال إشارة الاتصال
      peer.on('signal', signal => {
        if (initiator) {
          socket.emit('sending-signal', { userToSignal: userId, callerId: currentUser.id, signal });
        } else {
          socket.emit('returning-signal', { signal, callerId: userId });
        }
      });
      
      // استقبال بث الصوت
      peer.on('stream', stream => {
        console.log("Received audio stream from:", userId);
        playAudio(stream, userId);
      });
      
      // معالجة الأخطاء
      peer.on('error', err => {
        console.error("Peer error:", err);
        if (peersRef.current[userId] === peer) {
          delete peersRef.current[userId];
        }
      });
      
      // تنظيف عند إغلاق الاتصال
      peer.on('close', () => {
        if (peersRef.current[userId] === peer) {
          delete peersRef.current[userId];
        }
      });
      
      peersRef.current[userId] = peer;
      return peer;
    } catch (error) {
      console.error("Error creating peer:", error);
      return null;
    }
  };

  // بدء تشغيل الميكروفون
  const startMicrophone = async () => {
    try {
      // إيقاف أي بث قديم
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // الحصول على بث الميكروفون
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      audioStreamRef.current = stream;
      console.log("Microphone started successfully");
      
      // إنشاء اتصالات مع المشاركين الحاليين
      if (participants && currentUser) {
        participants.forEach(participant => {
          if (participant.id !== currentUser.id) {
            createPeer(participant.id, true);
          }
        });
      }
      
      // إعداد مراقبة مستوى الصوت
      setupBasicAudioMeter(stream);
    } catch (error) {
      console.error("Error starting microphone:", error);
      setMicError("تعذر الوصول للميكروفون. تأكد من صلاحيات الميكروفون.");
      setIsMicOn(false);
      toggleMic();
    }
  };

  // إيقاف الميكروفون وتنظيف الموارد
  const stopMicrophone = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // تدمير جميع اتصالات الأقران
    Object.values(peersRef.current).forEach(peer => {
      if (peer && typeof peer.destroy === 'function') {
        peer.destroy();
      }
    });
    peersRef.current = {};
  };

  // مراقبة بسيطة لمستوى الصوت
  const setupBasicAudioMeter = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateLevel = () => {
        if (!audioStreamRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        const average = sum / bufferLength;
        const level = Math.min(100, Math.max(0, average * 100 / 255));
        setAudioLevel(level);
        
        if (audioStreamRef.current) {
          requestAnimationFrame(updateLevel);
        }
      };
      
      updateLevel();
    } catch (error) {
      console.error("Error setting up audio meter:", error);
    }
  };

  // تشغيل الصوت الوارد
  const playAudio = (stream, userId) => {
    if (!isClient) return;
    
    try {
      const audioId = `audio-${userId}`;
      let audio = document.getElementById(audioId);
      
      if (audio) {
        audio.srcObject = stream;
        return;
      }
      
      audio = document.createElement('audio');
      audio.id = audioId;
      audio.autoplay = true;
      audio.srcObject = stream;
      audio.volume = isMuted ? 0 : volume / 100;
      
      document.body.appendChild(audio);
      
      audio.onloadedmetadata = () => {
        audio.play().catch(err => {
          console.warn("AutoPlay prevented:", err);
          const resumeAudio = () => {
            audio.play();
            document.removeEventListener('click', resumeAudio);
          };
          document.addEventListener('click', resumeAudio, { once: true });
        });
      };
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // تبديل حالة الميكروفون
  const toggleMicrophone = () => {
    setIsMicOn(!isMicOn);
    toggleMic();
  };

  // تبديل حالة كتم الصوت
  const toggleMuteAudio = () => {
    setIsMuted(!isMuted);
    toggleSpeaker();
    
    // تحديث مستوى الصوت لجميع عناصر الصوت
    document.querySelectorAll('audio[id^="audio-"]').forEach(audio => {
      audio.volume = isMuted ? 0 : volume / 100;
    });
  };

  // تحديث مستوى الصوت
  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    
    if (!isMuted) {
      document.querySelectorAll('audio[id^="audio-"]').forEach(audio => {
        audio.volume = newVolume / 100;
      });
    }
  };

  // عدم تقديم أي شيء على الخادم
  if (!isClient) return null;

  // واجهة المستخدم المبسطة
  return (
    <div className="card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        {/* أزرار التحكم */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* زر الميكروفون */}
          <button 
            onClick={toggleMicrophone}
            className={`p-3 rounded-full transition-colors ${isMicOn 
              ? 'bg-green-100 text-green-500 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'}`}
            title={isMicOn ? "إيقاف الميكروفون" : "تشغيل الميكروفون"}
          >
            {isMicOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* زر السماعة */}
          <button 
            onClick={toggleMuteAudio}
            className={`p-3 rounded-full transition-colors ${!isMuted 
              ? 'bg-green-100 text-green-500 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'}`}
            title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {!isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {/* شريط مستوى الصوت */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse flex-grow mx-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
          </svg>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* مؤشر مستوى الصوت */}
        <div className="w-10 text-center px-2 py-1 text-sm font-medium bg-green-100 dark:bg-gray-700 text-green-500 dark:text-green-400 rounded-full">
          {isMuted ? "0%" : `${volume}%`}
        </div>
      </div>
      
      {/* مؤشر مستوى الصوت */}
      {isMicOn && (
        <div className="mt-3">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-75 ${
                audioLevel > 60 ? 'bg-red-500' : 
                audioLevel > 30 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, audioLevel)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* رسالة خطأ الميكروفون */}
      {micError && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm text-center rounded-md">
          {micError}
        </div>
      )}
    </div>
  );
};

export default AudioBar;