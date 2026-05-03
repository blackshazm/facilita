export interface Location {
  latitude: number;
  longitude: number;
}

export interface ProviderStatusProps {
  providerId: string;
  categoryId: string;
  isOnline: boolean;
  location?: Location;
  updatedAt: Date;
}

export class ProviderStatus {
  constructor(private props: ProviderStatusProps) {}

  public get providerId(): string {
    return this.props.providerId;
  }

  public get isOnline(): boolean {
    return this.props.isOnline;
  }

  public get categoryId(): string {
    return this.props.categoryId;
  }

  public get location(): Location | undefined {
    return this.props.location;
  }

  public goOnline(location: Location): void {
    this.props.isOnline = true;
    this.props.location = location;
    this.props.updatedAt = new Date();
  }

  public goOffline(): void {
    this.props.isOnline = false;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return { ...this.props };
  }
}
