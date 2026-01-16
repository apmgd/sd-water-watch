import React from 'react';
import { AreaGroup, StatusLevel } from '../types';
import { ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  area: AreaGroup;
  onClick: () => void;
}

const getStatusColor = (status: StatusLevel) => {
  switch (status) {
    case StatusLevel.SAFE: return 'text-green-600';
    case StatusLevel.WARNING: return 'text-yellow-500';
    case StatusLevel.DANGER: return 'text-red-600';
    default: return 'text-gray-400';
  }
};

const getStatusIcon = (status: StatusLevel) => {
  switch (status) {
    case StatusLevel.SAFE: return <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />;
    case StatusLevel.WARNING: return <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />;
    case StatusLevel.DANGER: return <XCircle className="w-5 h-5 md:w-6 md:h-6" />;
  }
};

export const BeachListItem: React.FC<Props> = ({ area, onClick }) => {
  const statusColor = getStatusColor(area.worstStatus);

  return (
    <div
      onClick={onClick}
      className="group w-full border-b border-black py-8 cursor-pointer hover:bg-neutral-50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">{area.region}</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight group-hover:translate-x-2 transition-transform duration-300">
            {area.name}
          </h2>

          {/* 48h Metrics */}
          <div className="flex gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-neutral-400">HIGHEST (48H)</span>
              <span className="text-xl font-black">{area.highestReading48h} <span className="text-xs font-normal text-neutral-400">MPN</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono text-neutral-400">AVERAGE (48H)</span>
              <span className="text-xl font-black">{area.averageReading48h} <span className="text-xs font-normal text-neutral-400">MPN</span></span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-3 md:gap-6 ${statusColor}`}>
          <span className="hidden md:inline font-bold uppercase tracking-wider text-sm">{area.worstStatus}</span>
          {getStatusIcon(area.worstStatus)}
          <ChevronRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
