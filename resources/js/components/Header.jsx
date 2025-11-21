import React from 'react';

function Header() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-5 border-b-2 border-blue-700 flex justify-between items-center shadow-lg">
            <div className="text-2xl font-bold text-white">🏆 ŠTUDENTSKÉ TURNAJE</div>
            <div className="flex gap-2.5">
                <a href="/login" className="px-4 py-2 border-2 border-white bg-white text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                    Prihlásiť sa
                </a>
                <a href="/register" className="px-4 py-2 border-2 border-white bg-transparent text-white font-semibold cursor-pointer hover:bg-white hover:text-blue-600 rounded-lg transition-colors">
                    Registrovať sa
                </a>
            </div>
        </div>
    );
}

export default Header;
