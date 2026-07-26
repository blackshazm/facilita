import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SummaryCards } from './summary-cards';

describe('SummaryCards', () => {
  it('should render default values when props are missing', () => {
    render(<SummaryCards />);
    
    expect(screen.getByText('Total Payouts')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 0.00')).toHaveLength(2); // Payouts and Chargebacks
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument(); // Rating
    expect(screen.getByText('Dispute Ratio')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // Dispute Ratio
  });

  it('should render formatted values', () => {
    const props = {
      financial: { payouts: 15000, chargebacks: 150 },
      quality: { ratings: 4.8, disputeRatio: 0.05, trend: 'up' as const },
    };
    render(<SummaryCards {...props} />);
    
    expect(screen.getByText('R$ 15000.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 150.00')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
    expect(screen.getByText('Trend: ↑')).toBeInTheDocument();
  });
});
