"use client";
import React, { useState, useRef, useEffect } from "react";

const AudioRecordTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // تنظيف الموارد عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      // التحقق من دعم واجهة برمجة التطبيقات للميكروفون
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("متصفحك لا يدعم الوصول إلى الميكروفون");
      }
      
      // إعادة تعيين الحالة
      setError(null);
      audioChunksRef.current = [];
      setRecordedAudio(null);
      
      // طلب صلاحيات الوصول إلى الميكروفون
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      // إنشاء مسجل الوسائط
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // إعداد مستمع لحدث البيانات
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // إعداد مستمع لحدث إيقاف التسجيل
      mediaRecorder.onstop = () => {
        // إنشاء ملف صوتي من البيانات المسجلة
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // إيقاف جميع المسارات
        stream.getTracks().forEach(track => track.stop());
      };
      
      // بدء التسجيل
      mediaRecorder.start();
      setIsRecording(true);
      
      // بدء مؤقت لعرض وقت التسجيل
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log("بدأ التسجيل");
      
      // إيقاف التسجيل تلقائيًا بعد 10 ثوانٍ
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      }, 10000); // 10 ثوانٍ
      
    } catch (error) {
      console.error("خطأ في الوصول إلى الميكروفون:", error);
      handleRecordingError(error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      console.log("توقف التسجيل");
    }
  };
  
  const handleRecordingError = (error) => {
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
      default:
        errorMessage = error.message || "حدث خطأ أثناء محاولة الوصول إلى الميكروفون";
    }
    
    setError(errorMessage);
  };
  
  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.play();
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto my-8">
      <h2 className="text-xl font-bold text-center mb-6">اختبار تسجيل الصوت</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-right">
          {error}
          {error.includes("رفض") && (
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-500 underline mr-2"
            >
              تحديث الصفحة
            </button>
          )}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4">
        {isRecording && (
          <div className="text-center">
            <div className="text-red-500 animate-pulse mb-2">جاري التسجيل...</div>
            <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-4 py-2 rounded-full ${
              isRecording 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            } transition-colors focus:outline-none`}
          >
            بدء التسجيل
          </button>
          
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-4 py-2 rounded-full ${
              !isRecording 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-red-500 hover:bg-red-600 text-white"
            } transition-colors focus:outline-none`}
          >
            إيقاف التسجيل
          </button>
        </div>
        
        {recordedAudio && (
          <div className="mt-4 text-center">
            <p className="mb-2">تم التسجيل بنجاح!</p>
            <button
              onClick={playRecording}
              className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none"
            >
              تشغيل التسجيل
            </button>
            
            <div className="mt-4">
              <audio controls src={recordedAudio} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordTest; 