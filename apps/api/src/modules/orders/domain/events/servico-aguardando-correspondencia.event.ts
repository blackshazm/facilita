export class ServicoAguardandoCorrespondenciaEvent {
  constructor(
    public readonly ordemServicoId: string,
    public readonly clienteId: string,
    public readonly categoriaId: string,
    public readonly localizacao: { latitude: number; longitude: number },
    public readonly dataOcorrencia: Date = new Date(),
  ) {}
}
