'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { LocationUpdatePayload } from '@facilita/contracts';

// Dynamically import LeafletMap with SSR disabled to prevent window is not defined errors
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">Carregando Mapa...</div>
});

interface LiveTrackingProps {
  orderId: string;
}

export function LiveTrackingMap({ orderId }: LiveTrackingProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [location, setLocation] = useState<LocationUpdatePayload | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('MATCHING');
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/tracking', {
      auth: { token: 'valid-mock-token' },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('subscribe_order', { orderId });
    });

    newSocket.on('location_broadcast', (data: LocationUpdatePayload) => {
      setLocation(data);
    });

    newSocket.on('status_updated', (data) => {
      setOrderStatus(data.status);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  const triggerMockDispatch = async () => {
    try {
      setOrderStatus('MATCHING_IN_PROGRESS...');
      // Fake delay for UI
      setTimeout(() => {
        setOrderStatus('DISPATCHED (Ouro Tier)');
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateLocationUpdate = () => {
    if (socket) {
      const mockPayload: LocationUpdatePayload = {
        providerId: 'provider-123',
        orderId: orderId,
        latitude: -23.5505 + (Math.random() * 0.01),
        longitude: -46.6333 + (Math.random() * 0.01),
      };
      socket.emit('update_location', mockPayload);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rastreamento ao Vivo</h3>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMapType(prev => prev === 'streets' ? 'satellite' : 'streets')}
            className="text-sm px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-slate-700 font-medium"
          >
            Ver {mapType === 'streets' ? 'Satélite' : 'Ruas'}
          </button>
          
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {orderStatus}
          </span>
        </div>
      </div>

      {/* MOCK PANEL FOR UAT TESTING */}
      <div className="flex space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <span className="text-xs font-bold text-yellow-800 flex items-center px-2">UAT TOOLS:</span>
        <button onClick={triggerMockDispatch} className="text-xs px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded">Test Smart Dispatch</button>
        <button onClick={simulateLocationUpdate} className="text-xs px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded">Simular Movimento GPS</button>
      </div>

      <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
        <LeafletMap location={location ? { lat: location.latitude, lng: location.longitude } : null} mapType={mapType} />
      </div>
      
      {location && (
        <div className="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Lat: {location.latitude.toFixed(6)}</span>
          <span>Lng: {location.longitude.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
