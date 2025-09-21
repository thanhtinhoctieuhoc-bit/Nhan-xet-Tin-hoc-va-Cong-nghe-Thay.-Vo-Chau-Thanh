import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8 py-4 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Nhận xét Tin học & Công nghệ – TT27
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tác giả: Thầy. Võ Châu Thanh</p>
      </div>
    </header>
  );
};

export default Header;