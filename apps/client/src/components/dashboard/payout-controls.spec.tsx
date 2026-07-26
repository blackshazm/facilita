import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PayoutControls } from './payout-controls';

describe('PayoutControls', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should open dialog when clicked', () => {
    render(<PayoutControls />);
    const trigger = screen.getByText('Halt Payouts');
    fireEvent.click(trigger);
    expect(screen.getByText('Halt All Payouts')).toBeInTheDocument();
  });

  it('should remain disabled until CONFIRMAR is typed', () => {
    render(<PayoutControls />);
    fireEvent.click(screen.getByText('Halt Payouts'));
    
    const input = screen.getByPlaceholderText('CONFIRMAR');
    const haltBtn = screen.getByRole('button', { name: 'Halt' });
    
    expect(haltBtn).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'CONFIR' } });
    expect(haltBtn).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'CONFIRMAR' } });
    expect(haltBtn).not.toBeDisabled();
  });

  it('should call fetch and change state on submit', async () => {
    render(<PayoutControls />);
    fireEvent.click(screen.getByText('Halt Payouts'));
    
    fireEvent.change(screen.getByPlaceholderText('CONFIRMAR'), { target: { value: 'CONFIRMAR' } });
    fireEvent.click(screen.getByRole('button', { name: 'Halt' }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/bulk/pause', { method: 'POST' });
    });
    
    expect(screen.getByText('Resume Payouts')).toBeInTheDocument();
  });
});
