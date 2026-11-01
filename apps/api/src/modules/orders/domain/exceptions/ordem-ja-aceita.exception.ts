export class OrdemJaAceitaException extends Error {
  constructor(message: string = 'Esta ordem de serviço já foi aceita por outro profissional.') {
    super(message);
    this.name = 'OrdemJaAceitaException';
    Object.setPrototypeOf(this, OrdemJaAceitaException.prototype);
  }
}
