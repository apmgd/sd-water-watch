import React, { useEffect, useState } from 'react';
import { BeachListItem } from './components/BeachListItem';
import { WaterChart } from './components/WaterChart';
import { InfoView } from './components/InfoView';
import { getBeaches } from './services/waterData';
import { BeachGroup } from './types';
import { X, Waves, Loader2, LayoutList, Info } from 'lucide-react';

export default function App() {
  const [beaches, setBeaches] = useState<BeachGroup[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<BeachGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'info'>('monitor');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getBeaches();
      setBeaches(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleClose = () => {
    setSelectedBeach(null);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Header with Wave Background */}
      <header className="relative mb-12 border-b-4 border-black overflow-hidden bg-black group">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/header-wave.jpg" 
            alt="Ocean Wave" 
            className="w-full h-full object-cover brightness-50 contrast-125 group-hover:scale-105 transition-transform duration-1000"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-6 md:p-10 pt-16 md:pt-24">
          <div>
            <h1 className="text-white text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] drop-shadow-xl">
              SD Water<br/>Watch
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('monitor')}
              className={`flex-1 md:flex-none px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all border border-transparent ${
                activeTab === 'monitor' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'bg-black/40 text-white backdrop-blur-md hover:bg-black/60 border-white/20'
              }`}
            >
               <span className="flex items-center justify-center gap-2"><LayoutList className="w-4 h-4"/> Live Monitor</span>
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 md:flex-none px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all border border-transparent ${
                activeTab === 'info' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'bg-black/40 text-white backdrop-blur-md hover:bg-black/60 border-white/20'
              }`}
            >
              <span className="flex items-center justify-center gap-2"><Info className="w-4 h-4"/> Data & Info</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            <p className="font-mono text-sm text-neutral-500">FETCHING COUNTY DATA...</p>
          </div>
        ) : beaches.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-red-500">UNABLE TO CONNECT TO COUNTY SERVERS</p>
          </div>
        ) : (
          <>
            {activeTab === 'monitor' && (
              <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
                {beaches.map((beach) => (
                  <BeachListItem 
                    key={beach.id} 
                    beach={beach} 
                    onClick={() => setSelectedBeach(beach)} 
                  />
                ))}
              </div>
            )}
            
            {activeTab === 'info' && (
              <InfoView beaches={beaches} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 py-4 px-6 text-xs font-mono text-neutral-400 flex justify-between z-10">
        <span>SOURCE: SD COUNTY DEHQ</span>
        <span>© 2025 SDWW</span>
      </footer>

      {/* Detail Pane / Overlay */}
      {selectedBeach && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />
          
          {/* Drawer */}
          <div className="relative w-full md:w-[600px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-black">
            
            {/* Drawer Header */}
            <div className="p-6 md:p-10 pb-0 flex justify-between items-start">
              <div>
                <span className="font-mono text-sm text-neutral-500 uppercase">{selectedBeach.region}</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mt-2 mb-4">
                  {selectedBeach.name}
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  UPDATED: {new Date(selectedBeach.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-8 no-scrollbar">
              
              {/* Status Indicator */}
              <div className="mb-12">
                 <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedBeach.currentStatus === 'SAFE' ? 'bg-green-500' : 
                      selectedBeach.currentStatus === 'WARNING' ? 'bg-yellow-500' : 'bg-red-600'
                    }`} />
                    <span className="font-mono text-sm font-bold">CURRENT STATUS</span>
                 </div>
                 <p className={`text-3xl font-bold ${
                    selectedBeach.currentStatus === 'SAFE' ? 'text-green-600' : 
                    selectedBeach.currentStatus === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                 }`}>
                   {selectedBeach.currentStatus === 'SAFE' && "OPEN - Safe to Swim"}
                   {selectedBeach.currentStatus === 'WARNING' && "ADVISORY - Bacteria High"}
                   {selectedBeach.currentStatus === 'DANGER' && "CLOSED - Do Not Enter"}
                 </p>
              </div>

              {/* Chart */}
              <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Waves className="w-5 h-5" /> 30-Day Trend
                  </h3>
                  <div className="text-xs font-mono text-neutral-500">ENTEROCOCCUS LEVELS</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                  <WaterChart data={selectedBeach.history} />
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  *Historical data projected based on current County safety status.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}