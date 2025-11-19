import React from 'react';

function Navigation() {
    const navItems = ['Domov', 'Turnaje', 'Tímy', 'Hráči', 'Štatistiky'];

    return (
        <div className="bg-blue-700 p-4 px-5 border-b border-blue-800 flex gap-5 shadow-md">
            {navItems.map((item, index) => (
                <div
                    key={index}
                    className="px-3 py-2 text-white font-medium cursor-pointer hover:bg-blue-600 rounded-md transition-colors"
                >
                    {item}
                </div>
            ))}
        </div>
    );
}

export default Navigation;
