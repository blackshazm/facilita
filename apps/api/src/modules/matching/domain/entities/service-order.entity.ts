import { Location } from './location.vo';

export enum ServiceOrderStatus {
  CRIADA = 'CRIADA',
  AGUARDANDO_PROFISSIONAL = 'AGUARDANDO_PROFISSIONAL',
  ACEITA = 'ACEITA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
}

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly category: string,
    public readonly location: Location,
    public status: ServiceOrderStatus,
    public professionalId: string | null = null,
    public version: number = 1,
  ) {}

  public requestMatching(): void {
    if (this.status !== ServiceOrderStatus.CRIADA) {
      throw new Error('Apenas ordens no estado CRIADA podem aguardar profissional.');
    }
    this.status = ServiceOrderStatus.AGUARDANDO_PROFISSIONAL;
  }

  public accept(professionalId: string): void {
    if (this.status !== ServiceOrderStatus.AGUARDANDO_PROFISSIONAL) {
      throw new Error('Esta ordem não está disponível para aceite.');
    }
    this.status = ServiceOrderStatus.ACEITA;
    this.professionalId = professionalId;
    this.version += 1;
  }
}
