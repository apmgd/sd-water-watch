
import React, { useState } from 'react';
import { AreaGroup, BeachSite, StatusLevel, WaterDataPoint } from '../types';
import { Database, FileDown, CalendarDays } from 'lucide-react';

interface Props {
  areas: AreaGroup[];
}

type TimeRange = 7 | 30 | 180;

// Sub-component for individual site rows to manage their own state
const SiteDataRow: React.FC<{ site: BeachSite; areaName: string }> = ({ site, areaName }) => {
  const [range, setRange] = useState<TimeRange>(7);

  // Filter history based on range
  const visibleHistory = site.history.slice(-range).reverse(); // Show newest first

  return (
    <div className="border border-neutral-200 bg-white mb-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Site Header */}
      <div className="p-4 md:p-6 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{site.name}</h3>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-2 h-2 rounded-full ${
                site.currentStatus === StatusLevel.SAFE ? 'bg-green-500' :
                site.currentStatus === StatusLevel.WARNING ? 'bg-yellow-500' : 'bg-red-600'
             }`} />
             <span className="text-xs font-mono text-neutral-500 uppercase">
               {site.currentStatus} {site.reason && `• ${site.reason}`} • {areaName}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Time Range Toggle */}
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              {[7, 30, 180].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r as TimeRange)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    range === r 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>

            {/* Placeholder for CSV Link */}
            <button 
                disabled 
                className="p-2 text-neutral-300 cursor-not-allowed" 
                title="Raw Data Download (Coming Soon)"
            >
                <FileDown className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="max-h-64 overflow-y-auto bg-neutral-50 no-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-100 text-xs text-neutral-500 sticky top-0 font-mono uppercase">
                <tr>
                    <th className="p-3 border-b border-neutral-200">Date</th>
                    <th className="p-3 border-b border-neutral-200 text-right">Enterococcus (MPN)</th>
                    <th className="p-3 border-b border-neutral-200 w-24">Status</th>
                </tr>
            </thead>
            <tbody className="text-sm font-mono">
                {visibleHistory.map((point, i) => {
                    const isDanger = point.value > point.threshold;
                    return (
                        <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-white transition-colors">
                            <td className="p-3 text-neutral-600">
                                {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className={`p-3 text-right font-bold ${isDanger ? 'text-red-600' : 'text-neutral-800'}`}>
                                {point.value}
                            </td>
                            <td className="p-3">
                                <span className={`inline-block px-2 py-0.5 text-[10px] rounded border ${
                                    isDanger 
                                    ? 'bg-red-50 border-red-200 text-red-700' 
                                    : 'bg-green-50 border-green-200 text-green-700'
                                }`}>
                                    {isDanger ? 'UNSAFE' : 'SAFE'}
                                </span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
      <div className="bg-white p-2 border-t border-neutral-200 text-center">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
            Showing last {range} records
        </p>
      </div>
    </div>
  );
};

export const InfoView: React.FC<Props> = ({ areas }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("South Bay");

  // Get unique regions
  const regions = Array.from(new Set(areas.map(a => a.region))).sort((a: string, b: string) => {
    // Custom sort to keep South Bay first as it's the priority
    if (a === 'South Bay') return -1;
    if (b === 'South Bay') return 1;
    return a.localeCompare(b);
  });

  // Flatten areas to get all sites with their area names
  const sitesWithAreas = areas.flatMap(area =>
    area.sites.map(site => ({ site, areaName: area.name, region: area.region }))
  );

  const filteredSites = sitesWithAreas.filter(s => s.region === selectedRegion);

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8 border-b border-black pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8" /> Data Explorer
        </h2>
        <p className="text-neutral-500 mt-2 max-w-2xl">
            Detailed historical water quality logs by zone. Select a region below to view individual site data.
        </p>
      </div>

      {/* Region Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {regions.map((region) => (
            <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                    selectedRegion === region
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black'
                }`}
            >
                {region}
            </button>
        ))}
      </div>

      {/* Zone Content */}
      <div className="space-y-8">
        {filteredSites.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 text-neutral-400 font-mono">
                NO DATA AVAILABLE FOR THIS ZONE
            </div>
        ) : (
            filteredSites.map(({ site, areaName }) => (
                <SiteDataRow key={site.id} site={site} areaName={areaName} />
            ))
        )}
      </div>

      <div className="mt-12 p-6 bg-neutral-100 text-xs text-neutral-500 font-mono">
         <h4 className="font-bold text-black mb-2 flex items-center gap-2">
            <CalendarDays className="w-4 h-4"/> DATA DISCLAIMER
         </h4>
         <p>
            Historical MPN values presented here are projected estimates based on official status reports (Open/Advisory/Closure) 
            where raw lab data is not immediately available via the public API. Always obey posted lifeguard signage at the beach.
         </p>
      </div>

    </div>
  );
};
