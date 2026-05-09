import { useState, useCallback } from 'react';

export interface Payout {
  id: string;
  providerId: string;
  amount: string;
  fee: string;
  status: string;
  providerName: string;
  maskedBankData: string;
  createdAt: string;
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = useCallback(async (status?: string, page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(status && { status }),
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/payouts?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payouts');
      const data = await response.json();
      setPayouts(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approvePayout = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/payouts/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve payout');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const blockPayout = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/payouts/${id}/block`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to block payout');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startBatchPayout = async (payoutIds: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/payouts/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutIds }),
      });
      if (!response.ok) throw new Error('Failed to start batch payout');
      const data = await response.json();
      return data; // returns batchId string
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getBatchStatus = async (batchId: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/batch/${batchId}`);
      if (!response.ok) throw new Error('Failed to fetch batch status');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const getBalance = async () => {
    try {
      const response = await fetch(`/api/admin/payouts/balance`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      return data.available;
    } catch (err: any) {
      setError(err.message);
      return '0';
    }
  };

  return {
    payouts,
    total,
    isLoading,
    error,
    fetchPayouts,
    approvePayout,
    blockPayout,
    startBatchPayout,
    getBatchStatus,
    getBalance,
  };
}
