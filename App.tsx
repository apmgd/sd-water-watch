import React, { useEffect, useState } from 'react';
import { BeachListItem } from './components/BeachListItem';
import { WaterChart } from './components/WaterChart';
import { InfoView } from './components/InfoView';
import { getAreas } from './services/waterData';
import { AreaGroup } from './types';
import { X, Waves, Loader2, LayoutList, Info } from 'lucide-react';

export default function App() {
  const [areas, setAreas] = useState<AreaGroup[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'info'>('monitor');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAreas();
      setAreas(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleClose = () => {
    setSelectedArea(null);
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

      {/* Explainer Section */}
      <div className="max-w-4xl mx-auto mb-8 p-6 bg-neutral-50 border border-neutral-200">
        <h3 className="font-bold text-lg mb-3 uppercase tracking-wider">Understanding Water Quality</h3>
        <div className="text-sm text-neutral-700 space-y-2">
          <p>
            <strong>Safe Levels:</strong> California uses <strong>104 MPN/100ml</strong> (Most Probable Number per 100 milliliters) of enterococcus bacteria as the single-sample threshold for beach advisories and closures. A geometric mean of <strong>35 MPN/100ml</strong> over 30 days is also monitored. These standards are set by the EPA to protect public health from waterborne illnesses.
          </p>
          <p>
            <strong>Why These Levels?</strong> Enterococcus bacteria indicate the presence of fecal contamination, which can contain pathogens causing gastrointestinal illness, skin infections, and respiratory issues. The 104 MPN threshold represents an acceptable level of risk for recreational water use.
          </p>
          <p>
            <strong>Rain Impact:</strong> Water quality typically worsens significantly after rainfall, even without human-caused pollution. Rain washes bacteria, debris, and natural contaminants from land into the ocean. Urban runoff from storms can also carry pollutants from streets and drains. Always check water quality status after rain before swimming.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            <p className="font-mono text-sm text-neutral-500">FETCHING COUNTY DATA...</p>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-20 max-w-2xl mx-auto">
            <p className="font-mono text-red-600 text-lg font-bold mb-4">⚠ REAL-TIME DATA UNAVAILABLE</p>
            <p className="text-neutral-600 mb-4">
              Unable to connect to San Diego County's water quality monitoring system. This may be due to:
            </p>
            <ul className="text-left text-sm text-neutral-600 space-y-2 mb-6 inline-block">
              <li>• Temporary API outage</li>
              <li>• Network connectivity issues</li>
              <li>• County server maintenance</li>
            </ul>
            <p className="text-neutral-700 font-medium mb-4">
              Please check the official source directly:
            </p>
            <a
              href="http://www.sdbeachinfo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Visit SD County Beach Info →
            </a>
            <p className="text-xs text-neutral-400 mt-6">
              Or try refreshing this page in a few minutes.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'monitor' && (
              <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
                {areas.map((area) => (
                  <BeachListItem
                    key={area.id}
                    area={area}
                    onClick={() => setSelectedArea(area)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <InfoView areas={areas} />
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
      {selectedArea && (
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
                <span className="font-mono text-sm text-neutral-500 uppercase">{selectedArea.region}</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mt-2 mb-4">
                  {selectedArea.name}
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  UPDATED: {new Date(selectedArea.lastUpdated).toLocaleDateString()}
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

              {/* Area Overview */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedArea.worstStatus === 'SAFE' ? 'bg-green-500' :
                    selectedArea.worstStatus === 'WARNING' ? 'bg-yellow-500' : 'bg-red-600'
                  }`} />
                  <span className="font-mono text-sm font-bold">AREA STATUS (LAST 48H)</span>
                </div>
                <p className={`text-2xl font-bold mb-4 ${
                  selectedArea.worstStatus === 'SAFE' ? 'text-green-600' :
                  selectedArea.worstStatus === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {selectedArea.worstStatus === 'SAFE' && "SAFE - All Sites Clear"}
                  {selectedArea.worstStatus === 'WARNING' && "ADVISORY - Elevated Bacteria"}
                  {selectedArea.worstStatus === 'DANGER' && "CAUTION - High Contamination"}
                </p>

                {/* 48h Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-xs font-mono text-neutral-500 mb-1">HIGHEST (48H)</div>
                    <div className="text-3xl font-black">{selectedArea.highestReading48h}</div>
                    <div className="text-xs text-neutral-400 mt-1">MPN/100ml</div>
                  </div>
                  <div className="bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-xs font-mono text-neutral-500 mb-1">AVERAGE (48H)</div>
                    <div className="text-3xl font-black">{selectedArea.averageReading48h}</div>
                    <div className="text-xs text-neutral-400 mt-1">MPN/100ml</div>
                  </div>
                </div>
              </div>

              {/* Individual Sites */}
              <div className="space-y-8">
                <h3 className="font-bold text-lg uppercase tracking-wider border-b-2 border-black pb-2">
                  Monitoring Sites ({selectedArea.sites.length})
                </h3>

                {selectedArea.sites.map((site) => (
                  <div key={site.id} className="border-l-4 border-neutral-200 pl-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{site.name}</h4>
                        <span className={`text-xs font-mono font-bold ${
                          site.currentStatus === 'SAFE' ? 'text-green-600' :
                          site.currentStatus === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {site.currentStatus}
                        </span>
                        {site.reason && (
                          <p className="text-xs text-neutral-600 mt-1">
                            Reason: {site.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Site Chart */}
                    <div className="bg-neutral-50 p-3 rounded border border-neutral-100">
                      <WaterChart data={site.history} />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      30-day trend • Threshold: 104 MPN/100ml
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}