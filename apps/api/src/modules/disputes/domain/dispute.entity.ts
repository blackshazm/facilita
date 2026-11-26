export type DisputeStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';
export type DisputeOutcome = 'REFUND_FULL' | 'SPLIT_50_50' | 'RELEASE_PROVIDER';

export interface DisputeProps {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  outcome?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Dispute {
  private readonly _id: string;
  private readonly _orderId: string;
  private readonly _reason: string;
  private readonly _description: string;
  private _status: DisputeStatus;
  private _outcome: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: DisputeProps) {
    this._id = props.id;
    this._orderId = props.orderId;
    this._reason = props.reason;
    this._description = props.description;
    this._status = props.status;
    this._outcome = props.outcome ?? null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(params: {
    id: string;
    orderId: string;
    reason: string;
    description: string;
  }): Dispute {
    if (!params.reason || params.reason.trim().length === 0) {
      throw new Error('Motivo da disputa é obrigatório');
    }
    if (!params.description || params.description.trim().length === 0) {
      throw new Error('Descrição da disputa é obrigatória');
    }

    const now = new Date();
    return new Dispute({
      id: params.id,
      orderId: params.orderId,
      reason: params.reason,
      description: params.description,
      status: 'OPEN',
      outcome: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  resolve(outcome: DisputeOutcome, notes?: string): void {
    if (this._status !== 'OPEN') {
      throw new Error('Apenas disputas com status OPEN podem ser resolvidas');
    }
    this._status = 'RESOLVED';
    this._outcome = notes ? `${outcome}: ${notes}` : outcome;
    this._updatedAt = new Date();
  }

  close(): void {
    this._status = 'CLOSED';
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get reason(): string {
    return this._reason;
  }

  get description(): string {
    return this._description;
  }

  get status(): DisputeStatus {
    return this._status;
  }

  get outcome(): string | null {
    return this._outcome;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): DisputeProps {
    return {
      id: this._id,
      orderId: this._orderId,
      reason: this._reason,
      description: this._description,
      status: this._status,
      outcome: this._outcome,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
