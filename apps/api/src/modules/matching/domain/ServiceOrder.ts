export class Location {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly accuracy?: number
  ) {
    if (latitude < -90 || latitude > 90) throw new Error("Latitude inválida");
    if (longitude < -180 || longitude > 180) throw new Error("Longitude inválida");
  }
}

export enum ServiceOrderStatus {
  CRIADA = "CRIADA",
  AGUARDANDO_PROFISSIONAL = "AGUARDANDO_PROFISSIONAL",
  ACEITA = "ACEITA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CONCLUIDA = "CONCLUIDA",
  CANCELADA = "CANCELADA"
}

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly categoryId: string,
    public readonly location: Location,
    public status: ServiceOrderStatus,
    public assignedProfessionalId?: string
  ) {}

  public markAsAwaitingProfessional(): void {
    if (this.status !== ServiceOrderStatus.CRIADA) {
      throw new Error("Transição de status inválida");
    }
    this.status = ServiceOrderStatus.AGUARDANDO_PROFISSIONAL;
  }
}
