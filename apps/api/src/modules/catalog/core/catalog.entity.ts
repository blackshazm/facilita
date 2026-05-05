export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string,
    public readonly iconUrl?: string,
  ) {}
}

export enum UnitType {
  HOUR = 'HOUR',
  FIXED = 'FIXED',
  M2 = 'M2',
  M3 = 'M3',
}

export class Service {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly basePrice: number,
    public readonly unitType: UnitType,
    public readonly description?: string,
  ) {}
}
