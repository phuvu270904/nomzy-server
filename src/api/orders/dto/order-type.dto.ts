export enum OrderType {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class GetOrdersByTypeDto {
  type: OrderType;
}
