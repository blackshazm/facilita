// PRD: 4.1 Catálogo de Serviços
export enum ServiceCategory {
  ELETRICA = 'ELETRICA',
  HIDRAULICA = 'HIDRAULICA',
  REPAROS = 'REPAROS'
}

export class ServiceItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: ServiceCategory,
    public readonly fixedPrice: number, // In cents (e.g., R$ 120,00 = 12000)
    public readonly estimatedTimeMinutes: number,
    public readonly includedItems: string[],
    public readonly excludedItems: string[],
    public readonly isActive: boolean = true,
  ) {}

  get formattedPrice(): string {
    return `R$ ${(this.fixedPrice / 100).toFixed(2).replace('.', ',')}`;
  }
}
