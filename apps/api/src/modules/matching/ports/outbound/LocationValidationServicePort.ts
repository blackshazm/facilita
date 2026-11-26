import { Location } from "../../domain/ServiceOrder";

export interface LocationValidationServicePort {
  /**
   * Verifica se o sinal de GPS é válido e tem precisão suficiente.
   * Pode consultar APIs externas ou realizar heurísticas de precisão.
   */
  validateGpsSignal(location: Location): Promise<boolean>;
}
