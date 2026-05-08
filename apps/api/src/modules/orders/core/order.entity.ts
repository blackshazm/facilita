export enum OrderStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
}

export interface OrderProps {
  id: string;
  userId: string;
  providerId?: string;
  status: OrderStatus;
  totalAmount: number;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  constructor(private props: OrderProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get status(): OrderStatus {
    return this.props.status;
  }

  public get location(): { lat: number; lng: number } | undefined {
    if (this.props.latitude && this.props.longitude) {
      return { lat: this.props.latitude, lng: this.props.longitude };
    }
    return undefined;
  }

  public assignProvider(providerId: string): void {
    this.props.providerId = providerId;
    this.props.status = OrderStatus.MATCHED;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: OrderStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return { ...this.props };
  }
}
