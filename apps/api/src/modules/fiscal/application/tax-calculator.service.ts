import { Injectable } from '@nestjs/common';

export interface TaxCalculationResult {
  totalAmount: number;
  marketplaceFee: number;
  providerShare: number;
  ibsAmount?: number; // 2026
  cbsAmount?: number; // 2026
  taxRate: number;
}

export interface TaxStrategy {
  calculate(amount: number): TaxCalculationResult;
}

@Injectable()
export class CurrentTaxStrategy implements TaxStrategy {
  calculate(amount: number): TaxCalculationResult {
    // Current model: 20% commission
    const marketplaceFee = Math.floor(amount * 0.2);
    return {
      totalAmount: amount,
      marketplaceFee,
      providerShare: amount - marketplaceFee,
      taxRate: 0.2,
    };
  }
}

@Injectable()
export class Reforma2026Strategy implements TaxStrategy {
  calculate(amount: number): TaxCalculationResult {
    // 2026 model: 20% commission + IBS (17.7%) + CBS (8.8%) on commission
    // Note: This is an estimation. 
    // In many models, the tax is included in the fee or added.
    // For this implementation, we assume the 20% is the TOTAL take rate including taxes.
    const commissionRate = 0.2;
    const marketplaceFee = Math.floor(amount * commissionRate);
    
    // IBS/CBS on the commission part
    const ibsRate = 0.177;
    const cbsRate = 0.088;
    
    const ibsAmount = Math.floor(marketplaceFee * ibsRate);
    const cbsAmount = Math.floor(marketplaceFee * cbsRate);

    return {
      totalAmount: amount,
      marketplaceFee,
      providerShare: amount - marketplaceFee,
      ibsAmount,
      cbsAmount,
      taxRate: commissionRate,
    };
  }
}

@Injectable()
export class TaxCalculatorService {
  constructor(
    private readonly currentStrategy: CurrentTaxStrategy,
    private readonly reforma2026Strategy: Reforma2026Strategy,
  ) {}

  calculate(amount: number, date: Date = new Date()): TaxCalculationResult {
    const cutoffDate = new Date('2026-01-01');
    if (date >= cutoffDate) {
      return this.reforma2026Strategy.calculate(amount);
    }
    return this.currentStrategy.calculate(amount);
  }
}
