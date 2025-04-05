import React from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <header className="bg-emerald-700 text-white py-6 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-3xl font-bold font-arabic">محراب</div>
          <span className="mx-2 text-emerald-300">|</span>
          <div className="text-lg font-arabic">منصة حلقات تحفيظ القرآن الكريم</div>
        </div>
        <nav>
          <ul className="flex space-x-6 space-x-reverse">
            <li>
              <Link href="/" className="font-arabic hover:text-emerald-200 transition-colors">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/about" className="font-arabic hover:text-emerald-200 transition-colors">
                عن المنصة
              </Link>
            </li>
            <li>
              <Link href="/contact" className="font-arabic hover:text-emerald-200 transition-colors">
                اتصل بنا
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
