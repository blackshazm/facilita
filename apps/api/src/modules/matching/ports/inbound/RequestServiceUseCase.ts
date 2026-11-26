import { Location, ServiceOrder } from "../../domain/ServiceOrder";

export interface RequestServiceCommand {
  customerId: string;
  categoryId: string;
  location: Location;
}

export interface RequestServiceUseCase {
  execute(command: RequestServiceCommand): Promise<ServiceOrder>;
}
