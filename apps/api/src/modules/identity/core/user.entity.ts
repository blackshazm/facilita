export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  id: string;
  phone: string;
  name?: string;
  role: UserRole;
  isVerified: boolean;
  inviteCode?: string;
  invitedById?: string;
  referralCount: number;
  referralLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  public get id(): string {
    return this.props.id;
  }

  public get phone(): string {
    return this.props.phone;
  }

  public get name(): string | undefined {
    return this.props.name;
  }

  public get role(): UserRole {
    return this.props.role;
  }

  public get isVerified(): boolean {
    return this.props.isVerified;
  }

  public isProvider(): boolean {
    return this.props.role === UserRole.PROVIDER;
  }

  public canExecuteJobs(): boolean {
    return this.isProvider() && this.props.isVerified;
  }

  public verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public get inviteCode(): string | undefined {
    return this.props.inviteCode;
  }

  public get invitedById(): string | undefined {
    return this.props.invitedById;
  }

  public get referralCount(): number {
    return this.props.referralCount;
  }

  public get referralLimit(): number {
    return this.props.referralLimit;
  }

  public setInviteCode(code: string): void {
    this.props.inviteCode = code;
  }

  public setInvitedBy(referrerId: string): void {
    this.props.invitedById = referrerId;
  }

  public incrementReferralCount(): void {
    this.props.referralCount += 1;
  }

  public updateReferralLimit(limit: number): void {
    this.props.referralLimit = limit;
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}
