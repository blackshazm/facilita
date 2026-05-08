export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  FROZEN = 'FROZEN',
  CANCEL = 'CANCEL',
  PROMO_CREDIT = 'PROMO_CREDIT',
}

export interface WalletTransactionProps {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: bigint;
  orderId?: string;
  externalId?: string;
  description?: string;
  createdAt: Date;
}

export interface WalletProps {
  id: string;
  providerId: string;
  balance: bigint;
  pendingBalance: bigint;
  promoBalance: bigint;
  createdAt: Date;
  updatedAt: Date;
  transactions?: WalletTransactionProps[];
}

export class Wallet {
  constructor(private props: WalletProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get providerId(): string {
    return this.props.providerId;
  }

  public get balance(): bigint {
    return this.props.balance;
  }

  public get pendingBalance(): bigint {
    return this.props.pendingBalance;
  }

  public get promoBalance(): bigint {
    return this.props.promoBalance;
  }

  /**
   * Freezes an amount in the wallet (e.g., when a payment is authorized).
   * This increases the pending balance but not the available balance.
   */
  public freeze(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    this.props.pendingBalance += amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Credits an amount to the available balance (e.g., after payout delay).
   * Usually moves funds from pending to available.
   */
  public release(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    if (this.props.pendingBalance < amount) {
      throw new Error('Insufficient pending balance to release');
    }
    this.props.pendingBalance -= amount;
    this.props.balance += amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Direct credit to available balance (e.g., adjustments).
   */
  public credit(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    this.props.balance += amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Withdraws an amount from the available balance.
   */
  public withdraw(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    if (this.props.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.props.balance -= amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Registers a payout request by debiting the balance immediately.
   */
  public registerPayout(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    if (this.props.balance < amount) {
      throw new Error('Insufficient balance for payout');
    }
    this.props.balance -= amount;
    this.props.updatedAt = new Date();
  }

  /**
   * Reverses a frozen amount.
   */
  public cancel(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    if (this.props.pendingBalance < amount) {
      throw new Error('Insufficient pending balance to cancel');
    }
    this.props.pendingBalance -= amount;
    this.props.updatedAt = new Date();
  }

  public creditPromo(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    this.props.promoBalance += amount;
    this.props.updatedAt = new Date();
  }

  public debitPromo(amount: bigint): void {
    if (amount <= 0n) throw new Error('Amount must be positive');
    if (this.props.promoBalance < amount) {
      throw new Error('Insufficient promo balance');
    }
    this.props.promoBalance -= amount;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      ...this.props,
      balance: this.props.balance.toString(),
      pendingBalance: this.props.pendingBalance.toString(),
      promoBalance: this.props.promoBalance.toString(),
    };
  }
}
