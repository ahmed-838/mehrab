"use client";
import React, { useState, useRef, useEffect } from "react";

const AudioBar = () => {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioStreamRef = useRef(null);

  // تنظيف الموارد عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  // التحقق من حالة إذن الميكروفون عند التحميل
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.permissions) {
        // بعض المتصفحات لا تدعم واجهة Permissions API
        return;
      }
      
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone'
      });
      
      setIsPermissionGranted(permissionStatus.state === 'granted');
      
      permissionStatus.onchange = () => {
        setIsPermissionGranted(permissionStatus.state === 'granted');
        if (permissionStatus.state !== 'granted') {
          stopMicrophone();
        }
      };
    } catch (error) {
      console.error("Error checking microphone permission:", error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    
    // تحديث حالة الصوت النشط بناءً على مستوى الصوت
    setIsAudioActive(newVolume > 0 && !isMuted);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // إذا تم إلغاء كتم الصوت وكان مستوى الصوت أكبر من 0، نعتبر الصوت نشطًا
    if (isMuted && volume > 0) {
      setIsAudioActive(true);
    } else {
      setIsAudioActive(false);
    }
  };

  // تشغيل الميكروفون مع تحسينات طلب الإذن
  const startMicrophone = async () => {
    try {
      // التحقق من دعم واجهة برمجة التطبيقات للميكروفون
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("متصفحك لا يدعم الوصول إلى الميكروفون");
      }
      
      // إيقاف الميكروفون إذا كان يعمل بالفعل
      if (audioStreamRef.current) {
        stopMicrophone();
      }
      
      // طلب صلاحيات الوصول إلى الميكروفون مع معالجة أفضل للأخطاء
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      audioStreamRef.current = stream;
      setIsMicOn(true);
      setIsPermissionGranted(true);
      setMicError(null);
      
      console.log("تم تشغيل الميكروفون بنجاح");
      
      // يمكنك هنا إضافة المزيد من المنطق مثل إرسال الصوت إلى الخادم أو معالجته
      
    } catch (error) {
      console.error("خطأ في الوصول إلى الميكروفون:", error);
      handleMicrophoneError(error);
      setIsMicOn(false);
    }
  };

  // معالجة أخطاء الميكروفون
  const handleMicrophoneError = (error) => {
    let errorMessage = "حدث خطأ غير معروف";
    
    switch(error.name) {
      case 'NotAllowedError':
        errorMessage = "تم رفض إذن الميكروفون. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.";
        break;
      case 'NotFoundError':
        errorMessage = "لم يتم العثور على جهاز ميكروفون.";
        break;
      case 'NotReadableError':
        errorMessage = "لا يمكن قراءة بيانات الميكروفون. قد يكون الجهاز قيد الاستخدام من قبل تطبيق آخر.";
        break;
      case 'OverconstrainedError':
        errorMessage = "لا يمكن تلبية متطلبات الميكروفون المطلوبة.";
        break;
      case 'SecurityError':
        errorMessage = "تم منع الوصول إلى الميكروفون لأسباب أمنية.";
        break;
      default:
        errorMessage = error.message || "حدث خطأ أثناء محاولة الوصول إلى الميكروفون";
    }
    
    setMicError(errorMessage);
  };

  // إيقاف الميكروفون
  const stopMicrophone = () => {
    if (audioStreamRef.current) {
      // إيقاف جميع المسارات الصوتية
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      
      audioStreamRef.current = null;
      setIsMicOn(false);
      console.log("تم إيقاف الميكروفون");
    }
  };

  // تبديل حالة الميكروفون مع تحسينات
  const toggleMic = async () => {
    if (isMicOn) {
      stopMicrophone();
    } else {
      // إذا كان الإذن مرفوضًا، نعرض رسالة بدلاً من طلب الإذن مرة أخرى
      if (micError && micError.includes("رفض")) {
        setMicError("الوصول إلى الميكروفون مرفوض. يرجى تحديث الإذن في إعدادات المتصفح.");
        return;
      }
      
      await startMicrophone();
    }
  };

  const handleLeave = () => {
    stopMicrophone();
    console.log("مغادرة الجلسة");
    window.location.reload();
  };

  // تحديد لون وحالة أزرار التحكم
  const getMicButtonStyle = () => {
    if (micError) {
      return "bg-red-100 text-red-600"; // أحمر للخطأ
    } else if (isMicOn) {
      return "bg-green-500 text-white animate-pulse"; // أخضر عند التشغيل
    } else {
      return "bg-red-500 text-white hover:bg-red-600"; // أحمر عند عدم التشغيل
    }
  };

  const getAudioButtonStyle = () => {
    if (isMuted) {
      return "bg-red-100 text-red-600 hover:bg-red-200"; // أحمر عند كتم الصوت
    } else if (isAudioActive) {
      return "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"; // أخضر عند تشغيل الصوت
    } else {
      return "bg-gray-100 text-gray-600 hover:bg-gray-200"; // أبيض عند عدم التشغيل
    }
  };

  return (
    <div className=" bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          {/* رسالة خطأ الميكروفون */}
          {micError && (
            <div className="text-red-500 text-xs max-w-xs bg-red-50 p-2 rounded-md">
              {micError}
              {micError.includes("رفض") && (
                <button 
                  onClick={() => window.location.reload()}
                  className="text-blue-500 underline mr-1 font-medium"
                >
                  تحديث الصفحة
                </button>
              )}
            </div>
          )}
          
          {/* زر المغادرة */}
          <button
            onClick={handleLeave}
            className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            title="مغادرة الجلسة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          
          {/* زر الميكروفون مع تحسينات */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 ${getMicButtonStyle()}`}
            title={isMicOn ? "إيقاف الميكروفون" : "تشغيل الميكروفون"}
            disabled={!!micError && micError.includes("رفض")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMicOn ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          {/* التحكم في مستوى الصوت مع تحسينات */}
          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-28 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className={`text-xs ml-2 font-medium ${
              isMuted ? "text-red-500" : isAudioActive ? "text-emerald-500" : "text-gray-500"
            }`}>
              {isMuted ? "0" : volume}%
            </span>
          </div>

          {/* زر كتم الصوت مع تحسينات */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 ${getAudioButtonStyle()}`}
            title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioBar;