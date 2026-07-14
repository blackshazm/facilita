// PRD: 2.4 Usuários e Personas
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public readonly role: UserRole,
    public name?: string,
    public isVerified: boolean = false,
  ) {}

  verify() {
    this.isVerified = true;
  }
}
