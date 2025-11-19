import React from 'react';

function Hero() {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 px-5 text-center border-b border-blue-200">
            <h1 className="text-5xl font-bold mb-4 text-blue-900">Vitajte v systéme študentských turnajov</h1>
            <p className="text-blue-700 text-lg mb-8 max-w-2xl mx-auto">
                Zúčastnite sa turnajov, vytvárajte tímy a súťažte s ostatnými!
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold cursor-pointer text-base hover:from-blue-700 hover:to-cyan-600 rounded-lg shadow-lg transition-all transform hover:scale-105">
                Prejsť na turnaje
            </button>
        </div>
    );
}

export default Hero;
