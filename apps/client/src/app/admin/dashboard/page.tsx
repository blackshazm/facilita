'use client';

import React from 'react';
import useSWR from 'swr';
import { SummaryCards } from '../../../components/dashboard/summary-cards';
import { PayoutControls } from '../../../components/dashboard/payout-controls';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: financial } = useSWR('/api/analytics/financial', fetcher, { refreshInterval: 30000 });
  const { data: quality } = useSWR('/api/analytics/quality', fetcher, { refreshInterval: 30000 });

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
