import React from 'react';

function TeamCard({ team }) {
    return (
        <div className="border-2 border-blue-300 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-xl transition-all">
            {/* Team Header with Logo */}
            <div className="flex gap-4 items-start mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                    {team.team_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-1">{team.team_name}</h3>
                    <div className="text-sm text-blue-600">Ranking: #{team.ranking || 'N/A'}</div>
                </div>
            </div>

            {/* Team Meta Info */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Členov</div>
                    <div className="font-bold text-blue-900">{team.members || '0'}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Turnaje</div>
                    <div className="font-bold text-blue-900">{team.tournaments || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Výhry</div>
                    <div className="font-bold text-blue-900">{team.wins || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Body</div>
                    <div className="font-bold text-blue-900">{team.points ? team.points.toLocaleString() : 0}</div>
                </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-blue-200">
                <a
                    href={`/teams/${team.team_ID}`}
                    className="block w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all text-center"
                >
                    Zobraziť detail
                </a>
            </div>
        </div>
    );
}

export default TeamCard;
