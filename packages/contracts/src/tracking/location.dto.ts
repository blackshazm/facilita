export interface LocationUpdatePayload {
  providerId: string;
  orderId: string;
  latitude: number;
  longitude: number;
}

export interface OrderMatchedPayload {
  orderId: string;
  providerId: string;
  tier: 'OURO' | 'PRATA' | 'BRONZE';
  estimatedArrivalMinutes: number;
}
