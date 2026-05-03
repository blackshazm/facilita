export enum EvidenceType {
  PRE_SERVICE = 'PRE_SERVICE',
  POST_SERVICE = 'POST_SERVICE',
}

export enum EvidenceStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export interface EvidenceMetadata {
  latitude?: number;
  longitude?: number;
  capturedAt?: Date;
  deviceInfo?: string;
}

export interface EvidenceProps {
  id: string;
  orderId: string;
  providerId: string;
  type: EvidenceType;
  imageUrl: string;
  status: EvidenceStatus;
  metadata: EvidenceMetadata;
  createdAt: Date;
}

export class Evidence {
  constructor(private props: EvidenceProps) {}

  public get id(): string { return this.props.id; }
  public get orderId(): string { return this.props.orderId; }
  public get status(): EvidenceStatus { return this.props.status; }
  public get metadata(): EvidenceMetadata { return this.props.metadata; }

  public validate(orderLocation: { lat: number; lng: number }): void {
    if (!this.props.metadata.latitude || !this.props.metadata.longitude) {
      this.props.status = EvidenceStatus.FLAGGED;
      return;
    }

    const distance = this.calculateDistance(
      this.props.metadata.latitude,
      this.props.metadata.longitude,
      orderLocation.lat,
      orderLocation.lng
    );

    // If distance > 500 meters, reject
    if (distance > 500) {
      this.props.status = EvidenceStatus.REJECTED;
    } else {
      this.props.status = EvidenceStatus.VALIDATED;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dPhi = ((lat2 - lat1) * Math.PI) / 180;
    const dLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public toJSON() {
    return { ...this.props };
  }
}
