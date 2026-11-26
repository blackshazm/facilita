import { Location } from './location.vo';

export enum ProfessionalStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
}

export class Professional {
  constructor(
    public readonly id: string,
    public status: ProfessionalStatus,
    public category: string,
    public location: Location,
  ) {}

  isAvailable(): boolean {
    return this.status === ProfessionalStatus.ONLINE;
  }
}
