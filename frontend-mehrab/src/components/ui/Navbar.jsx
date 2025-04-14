"use client";

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const Navbar = ({ showThemeToggle = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* الشعار */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-500">محراب</span>
          </Link>

          {/* القائمة */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <Link href="/" className="text-gray-800 dark:text-gray-200 hover:text-green-500 transition-colors">
              الرئيسية
            </Link>
            <Link href="/about" className="text-gray-800 dark:text-gray-200 hover:text-green-500 transition-colors">
              من نحن
            </Link>
            <Link href="/contact" className="text-gray-800 dark:text-gray-200 hover:text-green-500 transition-colors">
              اتصل بنا
            </Link>
          </nav>

          {/* زر تبديل السمة وأزرار إضافية */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                aria-label={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}
            
            <Link href="/login" className="px-4 py-2 rounded-md border border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-medium transition-colors duration-200">
              تسجيل الدخول
            </Link>
            
            <Link href="/register" className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 font-medium transition-colors duration-200">
              التسجيل
            </Link>
            
            {/* قائمة منسدلة للشاشات الصغيرة */}
            <div className="md:hidden">
              <button className="text-gray-800 dark:text-gray-200 hover:text-green-500 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 