export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NoProfessionalFoundError extends DomainError {
  constructor(categoryId: string, radiusKm: number) {
    super(`Nenhum profissional disponível encontrado para a categoria ${categoryId} num raio de ${radiusKm}km.`);
  }
}

export class GpsSignalFailedError extends DomainError {
  constructor(userId: string) {
    super(`Falha ao obter sinal de GPS confiável para o usuário ${userId}. Por favor, verifique sua conexão ou permissões.`);
  }
}
