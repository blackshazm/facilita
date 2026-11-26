import { Location } from "../../domain/ServiceOrder";

export interface Professional {
  id: string;
  name: string;
  location: Location;
}

export interface ProfessionalRepositoryPort {
  findAvailableProfessionals(
    categoryId: string,
    location: Location,
    radiusKm: number
  ): Promise<Professional[]>;
}
