'use client';

import React from 'react';
import useSWR from 'swr';
import { SummaryCards } from '../../../components/dashboard/summary-cards';
import { PayoutControls } from '../../../components/dashboard/payout-controls';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('API Error');
  return res.json();
}).catch(() => {
  if (url.includes('financial')) return MOCK_FINANCIAL;
  if (url.includes('quality')) return MOCK_QUALITY;
  return null;
});

const MOCK_FINANCIAL = { payouts: 15420.50, chargebacks: 320.00 };
const MOCK_QUALITY = { ratings: 4.8, disputeRatio: 0.02, trend: 'up' as const };

export default function DashboardPage() {
  const { data: financial } = useSWR('/api/analytics/financial', fetcher, { 
    refreshInterval: 30000, 
    fallbackData: MOCK_FINANCIAL 
  });
  const { data: quality } = useSWR('/api/analytics/quality', fetcher, { 
    refreshInterval: 30000, 
    fallbackData: MOCK_QUALITY 
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Overview</h2>
        <PayoutControls />
      </div>
      
      <SummaryCards financial={financial} quality={quality} />
    </div>
  );
}
