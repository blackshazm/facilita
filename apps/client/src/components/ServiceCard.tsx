import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

interface ServiceCardProps {
  name: string;
  description: string;
  price: string;
  time: string;
  onSelect: () => void;
}

export function ServiceCard({ name, description, price, time, onSelect }: ServiceCardProps) {
  return (
    <div 
      className="bg-slate-900 border border-slate-800 hover:border-blue-500/80 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
      onClick={onSelect}
    >
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-blue-400 transition-colors">{name}</h3>
          <span className="bg-blue-950/80 border border-blue-800/40 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
            <Clock size={12} /> {time}
          </span>
        </div>
        <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">A partir de</span>
          <span className="font-extrabold text-emerald-400 text-base">{price}</span>
        </div>
        <button 
          type="button"
          className="text-xs font-bold bg-blue-600 group-hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Solicitar <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

