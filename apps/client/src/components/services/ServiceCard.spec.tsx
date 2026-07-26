import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServiceCard } from '../ServiceCard';

describe('ServiceCard', () => {

  it('should render service details correctly', () => {
    const handleSelect = vi.fn();
    render(
      <ServiceCard 
        name="Limpeza Padrão"
        description="Limpeza do dia a dia"
        price="R$ 150,00"
        time="120 min"
        onSelect={handleSelect}
      />
    );
    
    expect(screen.getByText('Limpeza Padrão')).toBeInTheDocument();
    expect(screen.getByText('Limpeza do dia a dia')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    expect(screen.getByText('120 min')).toBeInTheDocument();
  });
});
