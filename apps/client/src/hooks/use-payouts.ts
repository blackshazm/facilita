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

  return {
    payouts,
    total,
    isLoading,
    error,
    fetchPayouts,
    approvePayout,
    blockPayout,
  };
}
