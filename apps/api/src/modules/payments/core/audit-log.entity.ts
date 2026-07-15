export enum AuditLogAction {
  PAUSE_QUEUE = 'PAUSE_QUEUE',
  RESUME_QUEUE = 'RESUME_QUEUE',
}

export class AuditLog {
  id: string;
  adminId: string;
  action: AuditLogAction;
  queueName: string;
  timestamp: Date;
  details?: Record<string, any>;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
  }
}
