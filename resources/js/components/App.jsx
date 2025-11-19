import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Hero from './Hero';
import TournamentList from './TournamentList';
import Sidebar from './Sidebar';
import Footer from './Footer';

function App() {
    console.log('App component rendering');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation />
                <Hero />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="lg:col-span-2">
                        <TournamentList />
                    </div>
                    <div className="lg:col-span-1">
                        <Sidebar />
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default App;
