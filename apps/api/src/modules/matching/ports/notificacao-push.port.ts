export interface INotificacaoPushPayload {
  ordemServicoId: string;
  titulo: string;
  mensagem: string;
  dadosAdicionais?: Record<string, any>;
}

export const NOTIFICACAO_PUSH_PORT = Symbol('NOTIFICACAO_PUSH_PORT');

export interface NotificacaoPushPort {
  /**
   * Dispara alertas/notificações em tempo real para a lista de profissionais elegíveis encontrados.
   * @param profissionaisIds Lista de IDs dos profissionais elegíveis.
   * @param payload Dados da notificação.
   */
  enviarNotificacaoParaProfissionaisElegiveis(
    profissionaisIds: string[],
    payload: INotificacaoPushPayload,
  ): Promise<void>;
}
