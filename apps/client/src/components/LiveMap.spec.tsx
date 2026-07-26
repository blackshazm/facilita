import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LiveMap from './LiveMap';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }: any) => <div data-testid="marker" data-position={position.join(',')} />,
  useMap: () => ({ flyTo: vi.fn() }),
}));

describe('LiveMap', () => {
  it('should render the map container', () => {
    render(<LiveMap lat={-23.5505} lng={-46.6333} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render a marker at the given coordinates', () => {
    render(<LiveMap lat={-23.5505} lng={-46.6333} />);
    const marker = screen.getByTestId('marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('data-position', '-23.5505,-46.6333');
  });
});
