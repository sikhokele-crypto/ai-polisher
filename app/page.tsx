"use client";
import { useState } from "react";

export default function SoccerDashboard() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [isVip, setIsVip] = useState(false); // Toggle this to true to show predictions

  const matches = [
    { id: 1, home: "Arsenal", away: "Liverpool", time: "20:45", league: "Premier League", winner: "Home Win", corners: "Over 9.5", btts: "Yes" },
    { id: 2, home: "Real Madrid", away: "Barcelona", time: "21:00", league: "La Liga", winner: "Draw", corners: "Under 10.5", btts: "Yes" },
  ];

  const handleWhatsAppPay = () => {
    // Replace with your actual number
    const myNumber = "27123456789"; 
    const message = encodeURIComponent("I want to buy the R20 Daily Pass for GOALPRO VIP Predictions.");
    window.open(`https://wa.me/${myNumber}?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4">
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-blue-500 italic">GOALPRO</h1>
        {!isVip && (
          <button onClick={() => setShowPaywall(true)} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
            GET VIP ACCESS
          </button>
        )}
      </nav>

      <div className="grid gap-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-[#1e293b] rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex justify-between text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">
              <span>{match.league}</span>
              <span>{match.time}</span>
            </div>
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="font-bold text-lg">{match.home}</span>
              <span className="text-slate-600 italic">VS</span>
              <span className="font-bold text-lg">{match.away}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                <p className="text-[8px] text-slate-500 uppercase">1X2 Tip</p>
                <p className="text-blue-400 font-bold text-xs">{match.winner}</p>
              </div>
              
              {/* CORNERS TIP */}
              <div className={`p-2 rounded-lg text-center ${isVip ? 'bg-slate-900/50' : 'bg-blue-500/10 blur-[3px]'}`}>
                <p className="text-[8px] text-slate-500 uppercase">Corners</p>
                <p className="text-emerald-400 font-bold text-xs">{isVip ? match.corners : "??"}</p>
              </div>

              {/* BTTS TIP */}
              <div className={`p-2 rounded-lg text-center ${isVip ? 'bg-slate-900/50' : 'bg-blue-500/10 blur-[3px]'}`}>
                <p className="text-[8px] text-slate-500 uppercase">BTTS</p>
                <p className="text-orange-400 font-bold text-xs">{isVip ? match.btts : "??"}</p>
              </div>
            </div>

            {!isVip && (
              <button onClick={() => setShowPaywall(true)} className="w-full mt-4 py-2 text-[9px] uppercase font-black text-blue-500 tracking-tighter hover:text-blue-400 transition-colors">
                Unlock VIP Markets (Corners/BTTS) →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-8 border border-blue-500/40 shadow-2xl">
            <h2 className="text-xl font-black text-center mb-6">VIP ACCESS</h2>
            <button 
              onClick={handleWhatsAppPay}
              className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm flex justify-between px-6 items-center hover:bg-blue-700 active:scale-95 transition-all mb-4"
            >
              <span>DAILY PASS</span>
              <span>R20.00</span>
            </button>
            <button onClick={() => setShowPaywall(false)} className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Maybe Later</button>
          </div>
        </div>
      )}
    </main>
  );
}