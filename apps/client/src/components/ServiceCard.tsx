import React from 'react';

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
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
      onClick={onSelect}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight w-3/4">{name}</h3>
          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
        <span className="font-bold text-gray-900 text-lg">{price}</span>
        <button 
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Solicitar
        </button>
      </div>
    </div>
  );
}
