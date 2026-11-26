export enum ProfissionalStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class Profissional {
  constructor(
    public readonly id: string,
    public name: string,
    public categoria: string,
    public status: ProfissionalStatus = ProfissionalStatus.OFFLINE,
    public location?: Coordinates,
  ) {}

  updateLocation(latitude: number, longitude: number): void {
    this.location = { latitude, longitude };
  }

  changeStatus(newStatus: ProfissionalStatus): void {
    this.status = newStatus;
  }

  isAvailable(): boolean {
    return this.status === ProfissionalStatus.ONLINE;
  }
}
