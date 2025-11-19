import React from 'react';
import TournamentCard from './TournamentCard';

function TournamentList() {
    const tournaments = [
        {
            id: 1,
            title: 'Šachový turnaj 2025',
            status: 'REGISTRÁCIA',
            date: '15.10.2025',
            type: 'Jednotlivci',
            maxParticipants: 16,
            registered: 8,
        },
        {
            id: 2,
            title: 'CS:GO Liga - Jar',
            status: 'PREBIEHA',
            date: '01.10.2025',
            type: 'Tímy (5 hráčov)',
            maxParticipants: 8,
            registered: 8,
        },
        {
            id: 3,
            title: 'Šípky Championship',
            status: 'ČOSKORO',
            date: '20.10.2025',
            type: 'Jednotlivci',
            maxParticipants: 32,
            registered: 0,
        },
    ];

    return (
        <div className="border border-blue-200 p-6 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold mb-5 pb-3 border-b-2 border-blue-300 text-blue-900">
                📋 Aktuálne turnaje
            </div>

            {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
            ))}

            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold cursor-pointer mt-3 hover:from-blue-700 hover:to-cyan-600 rounded-lg shadow-md transition-all">
                Zobraziť všetky turnaje
            </button>
        </div>
    );
}

export default TournamentList;
