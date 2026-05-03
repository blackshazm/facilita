/**
 * Shared Events for FACILITA Modular Hexagonal Architecture
 * All cross-module events must be defined here for strong typing.
 */

export class OrderMatchedEvent {
  constructor(
    public readonly orderId: string,
    public readonly providerId: string,
  ) {}
}

export class PaymentAuthorizedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly amount: number,
  ) {}
}

// Add more events as needed following the pattern
