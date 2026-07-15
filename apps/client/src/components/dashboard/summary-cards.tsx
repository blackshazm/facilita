'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
  financial?: {
    payouts: number;
    chargebacks: number;
  };
  quality?: {
    ratings: number;
    disputeRatio: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export function SummaryCards({ financial, quality }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {financial?.payouts?.toFixed(2) || '0.00'}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Chargebacks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {financial?.chargebacks?.toFixed(2) || '0.00'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quality?.ratings?.toFixed(1) || '0.0'}</div>
          {quality?.trend && (
            <p className="text-xs text-muted-foreground mt-1">
              Trend: {quality.trend === 'up' ? '↑' : quality.trend === 'down' ? '↓' : '→'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Dispute Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(quality?.disputeRatio ? quality.disputeRatio * 100 : 0).toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
