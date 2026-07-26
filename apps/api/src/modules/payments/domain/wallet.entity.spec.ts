import { Wallet, TransactionType } from './wallet.entity';

describe('Wallet Entity', () => {
  const makeWallet = (overrides?: Partial<{
    balance: bigint;
    pendingBalance: bigint;
    promoBalance: bigint;
  }>): Wallet => {
    return new Wallet({
      id: 'w1',
      providerId: 'p1',
      balance: overrides?.balance ?? 100000n,
      pendingBalance: overrides?.pendingBalance ?? 0n,
      promoBalance: overrides?.promoBalance ?? 0n,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });
  };

  describe('credit()', () => {
    it('should increase available balance', () => {
      const wallet = makeWallet({ balance: 0n });
      wallet.credit(50000n);
      expect(wallet.balance).toBe(50000n);
    });

    it('should throw if amount is zero', () => {
      const wallet = makeWallet();
      expect(() => wallet.credit(0n)).toThrow('Amount must be positive');
    });

    it('should throw if amount is negative', () => {
      const wallet = makeWallet();
      expect(() => wallet.credit(-100n)).toThrow('Amount must be positive');
    });
  });

  describe('withdraw()', () => {
    it('should decrease available balance', () => {
      const wallet = makeWallet({ balance: 100000n });
      wallet.withdraw(30000n);
      expect(wallet.balance).toBe(70000n);
    });

    it('should throw if insufficient balance', () => {
      const wallet = makeWallet({ balance: 1000n });
      expect(() => wallet.withdraw(5000n)).toThrow('Insufficient balance');
    });

    it('should throw if amount is zero', () => {
      const wallet = makeWallet();
      expect(() => wallet.withdraw(0n)).toThrow('Amount must be positive');
    });
  });

  describe('freeze()', () => {
    it('should increase pending balance', () => {
      const wallet = makeWallet({ pendingBalance: 0n });
      wallet.freeze(25000n);
      expect(wallet.pendingBalance).toBe(25000n);
    });

    it('should not affect available balance', () => {
      const wallet = makeWallet({ balance: 100000n });
      wallet.freeze(25000n);
      expect(wallet.balance).toBe(100000n);
    });

    it('should throw if amount is zero', () => {
      const wallet = makeWallet();
      expect(() => wallet.freeze(0n)).toThrow('Amount must be positive');
    });
  });

  describe('release()', () => {
    it('should move funds from pending to available', () => {
      const wallet = makeWallet({ balance: 0n, pendingBalance: 50000n });
      wallet.release(50000n);
      expect(wallet.balance).toBe(50000n);
      expect(wallet.pendingBalance).toBe(0n);
    });

    it('should throw if insufficient pending balance', () => {
      const wallet = makeWallet({ pendingBalance: 1000n });
      expect(() => wallet.release(5000n)).toThrow('Insufficient pending balance to release');
    });
  });

  describe('cancel()', () => {
    it('should reverse frozen amount', () => {
      const wallet = makeWallet({ pendingBalance: 30000n });
      wallet.cancel(30000n);
      expect(wallet.pendingBalance).toBe(0n);
    });

    it('should throw if insufficient pending balance', () => {
      const wallet = makeWallet({ pendingBalance: 1000n });
      expect(() => wallet.cancel(5000n)).toThrow('Insufficient pending balance to cancel');
    });
  });

  describe('registerPayout()', () => {
    it('should debit balance immediately', () => {
      const wallet = makeWallet({ balance: 100000n });
      wallet.registerPayout(100000n);
      expect(wallet.balance).toBe(0n);
    });

    it('should throw if insufficient balance for payout', () => {
      const wallet = makeWallet({ balance: 5000n });
      expect(() => wallet.registerPayout(10000n)).toThrow('Insufficient balance for payout');
    });
  });

  describe('promo balance', () => {
    it('creditPromo() should increase promo balance', () => {
      const wallet = makeWallet({ promoBalance: 0n });
      wallet.creditPromo(10000n);
      expect(wallet.promoBalance).toBe(10000n);
    });

    it('debitPromo() should decrease promo balance', () => {
      const wallet = makeWallet({ promoBalance: 10000n });
      wallet.debitPromo(5000n);
      expect(wallet.promoBalance).toBe(5000n);
    });

    it('debitPromo() should throw if insufficient promo balance', () => {
      const wallet = makeWallet({ promoBalance: 1000n });
      expect(() => wallet.debitPromo(5000n)).toThrow('Insufficient promo balance');
    });
  });

  describe('toJSON()', () => {
    it('should serialize bigint fields as strings', () => {
      const wallet = makeWallet({ balance: 100000n, pendingBalance: 5000n, promoBalance: 2000n });
      const json = wallet.toJSON();
      expect(json.balance).toBe('100000');
      expect(json.pendingBalance).toBe('5000');
      expect(json.promoBalance).toBe('2000');
    });
  });
});
