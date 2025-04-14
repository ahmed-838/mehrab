"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // استرجاع التفضيل المحفوظ أو استخدام تفضيل النظام عند بدء التشغيل
  useEffect(() => {
    const savedTheme = localStorage.getItem('mehrab-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // استخدام تفضيل النظام كقيمة افتراضية
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // تطبيق الوضع المحدد على العناصر الأساسية
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('mehrab-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mehrab-theme', 'light');
    }
  }, [isDarkMode]);

  // تبديل وضع السمة
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 