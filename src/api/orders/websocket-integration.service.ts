import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OrdersGateway } from './orders.gateway';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class WebSocketIntegrationService implements OnModuleInit {
  private ordersGateway: OrdersGateway;

  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    // Get the gateway instance after module initialization
    this.ordersGateway = this.moduleRef.get(OrdersGateway, { strict: false });
  }

  async notifyOrderCreated(order: OrderEntity) {
    if (this.ordersGateway) {
      await this.ordersGateway.notifyNewOrder(order);
    }
  }

  async notifyOrderUpdated(order: OrderEntity) {
    if (this.ordersGateway) {
      await this.ordersGateway.broadcastOrderUpdate(order);
    }
  }

  async notifyDriverAssigned(order: OrderEntity) {
    if (this.ordersGateway) {
      await this.ordersGateway.notifyDriverAssignment(order);
    }
  }
}
