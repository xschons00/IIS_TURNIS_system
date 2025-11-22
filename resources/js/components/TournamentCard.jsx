import React from 'react';

function TournamentCard({ tournament }) {
    const getStatusColor = (status) => {
        if (status === 'REGISTRÁCIA') return 'bg-green-100 text-green-700 border-green-300';
        if (status === 'PREBIEHA') return 'bg-blue-100 text-blue-700 border-blue-300';
        return 'bg-orange-100 text-orange-700 border-orange-300';
    };

    return (
        <div className="border border-blue-200 p-5 mb-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between mb-3">
                <div className="font-bold text-xl text-blue-900">{tournament.title}</div>
                <div className={`px-3 py-1 border rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                </div>
            </div>
            <div className="text-blue-600 my-2 text-sm">
                📅 Dátum: {tournament.date}
            </div>
            <div className="text-blue-600 my-2 text-sm">
                👥 Typ: {tournament.type}
            </div>
            <div className="text-blue-600 my-2 text-sm">
                🎯 Max. účastníci: {tournament.maxParticipants}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center">
                <span className="text-blue-700 font-medium">
                    Prihlásených: {tournament.registered}/{tournament.maxParticipants}
                </span>
                <a
                    href={`/tournaments/${tournament.id}`}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 rounded-lg transition-colors"
                >
                    Detail
                </a>
            </div>
        </div>
    );
}

export default TournamentCard;
