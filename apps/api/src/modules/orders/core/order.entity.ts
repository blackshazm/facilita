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

export interface CancellationResult {
  displacementFee: number;
  refundAmount: number;
  isWithinFreeGracePeriod: boolean;
  canceledAt: Date;
  reason: string;
}

export const DISPLACEMENT_FEE = 35.0;
export const FREE_CANCELLATION_GRACE_MINUTES = 5;

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

  /**
   * Executa a regra de negócio de cancelamento com cálculo da taxa de deslocamento
   * // PRD: 4.4.2 Cancelamento Assistido e Taxa de Deslocamento
   */
  public cancel(
    reason: string,
    currentTime: Date = new Date(),
  ): CancellationResult {
    if (this.props.status === OrderStatus.DONE) {
      throw new Error('Não é possível cancelar uma ordem de serviço já concluída');
    }
    if (this.props.status === OrderStatus.CANCELED) {
      throw new Error('Esta ordem de serviço já se encontra cancelada');
    }

    const elapsedMs = Math.max(0, currentTime.getTime() - this.props.updatedAt.getTime());
    const elapsedMinutes = elapsedMs / (1000 * 60);

    let isWithinFreeGracePeriod = true;
    let displacementFee = 0;

    // Se estiver PENDING, nenhum prestador foi alocado -> estorno 100% gratuito
    if (this.props.status === OrderStatus.PENDING) {
      isWithinFreeGracePeriod = true;
      displacementFee = 0;
    } else if (
      this.props.status === OrderStatus.ARRIVED ||
      elapsedMinutes > FREE_CANCELLATION_GRACE_MINUTES
    ) {
      // Prestador já chegou no local ou já se passaram mais de 5 minutos desde o matching/saída
      isWithinFreeGracePeriod = false;
      displacementFee = Math.min(DISPLACEMENT_FEE, this.props.totalAmount);
    } else {
      // Cancelamento dentro dos primeiros 5 minutos de deslocamento -> estorno 100% gratuito
      isWithinFreeGracePeriod = true;
      displacementFee = 0;
    }

    const refundAmount = Math.max(0, this.props.totalAmount - displacementFee);

    this.props.status = OrderStatus.CANCELED;
    this.props.updatedAt = currentTime;

    return {
      displacementFee,
      refundAmount,
      isWithinFreeGracePeriod,
      canceledAt: currentTime,
      reason,
    };
  }

  public toJSON() {
    return { ...this.props };
  }
}
