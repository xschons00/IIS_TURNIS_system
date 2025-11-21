import React from 'react';

function Navigation({ activePage = 'Domov' }) {
    const navItems = [
        { label: 'Domov', href: '/' },
        { label: 'Turnaje', href: '/tournaments' },
        { label: 'Tímy', href: '/teams' },
        { label: 'Hráči', href: '#' },
        { label: 'Štatistiky', href: '#' }
    ];

    return (
        <div className="bg-blue-700 p-4 px-5 border-b border-blue-800 flex gap-5 shadow-md">
            {navItems.map((item, index) => {
                const isActive = item.label === activePage;
                return (
                    <a
                        key={index}
                        href={item.href}
                        className={`px-3 py-2 font-medium cursor-pointer rounded-md transition-all ${
                            isActive
                                ? 'bg-white text-blue-700 border-2 border-blue-300 shadow-lg'
                                : 'text-white hover:bg-blue-600'
                        }`}
                    >
                        {item.label}
                    </a>
                );
            })}
        </div>
    );
}

export default Navigation;
