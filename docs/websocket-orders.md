# WebSocket Order Management System

This document describes the WebSocket-based real-time order management system for the food delivery platform.

## Overview

The system enables real-time communication between users, restaurants, and drivers for order management. It uses Socket.IO for WebSocket connections.

## Connection

Connect to the WebSocket server at: `ws://your-server/orders`

### Authentication
Include JWT token in the connection:
- Via auth header: `{ auth: { token: 'your-jwt-token' } }`
- Via authorization header: `{ headers: { authorization: 'Bearer your-jwt-token' } }`

## User Roles and Rooms

### User (Customer)
- Joins: `user-{userId}` room
- Receives: Order creation confirmations, status updates

### Restaurant (Owner)
- Joins: `restaurant-{restaurantId}` room  
- Receives: New orders, order status updates

### Driver
- Joins: `drivers-pool` room and `driver-{driverId}` room
- Receives: Available orders, order assignments, status updates
- Additional: Joins `order-{orderId}` room when accepting an order

## Events

### Client to Server Events

#### 1. `update-order-status`
Update order status (Restaurant/Driver only)
```json
{
  "orderId": 123,
  "status": "preparing"
}
```
**Allowed statuses by role:**
- **Restaurant**: `confirmed`, `preparing`, `ready_for_pickup`, `cancelled`
- **Driver**: `out_for_delivery`, `delivered`

#### 2. `accept-order`
Accept an available order (Driver only)
```json
{
  "orderId": 123
}
```

#### 3. `get-available-orders`
Request list of available orders (Driver only)
```json
{}
```

#### 4. `get-restaurant-orders`
Request list of restaurant orders (Restaurant only)
```json
{}
```

### Server to Client Events

#### 1. `order-created`
Sent to user when they place an order
```json
{
  "order": {
    "id": 123,
    "status": "pending",
    "userId": 456,
    "restaurantId": 789,
    // ... full order object
  }
}
```

#### 2. `new-order`
Sent to restaurant when new order is placed
```json
{
  "order": {
    "id": 123,
    "status": "pending",
    "userId": 456,
    // ... full order object
  }
}
```

#### 3. `order-updated`
Sent to all relevant parties when order status changes
```json
{
  "order": {
    "id": 123,
    "status": "preparing",
    // ... full order object
  }
}
```

#### 4. `new-available-order`
Sent to all drivers when order becomes available for pickup
```json
{
  "order": {
    "id": 123,
    "status": "ready_for_pickup",
    // ... full order object
  }
}
```

#### 5. `order-taken`
Sent to drivers pool when an order is accepted by another driver
```json
{
  "orderId": 123
}
```

#### 6. `order-accepted`
Sent to driver who accepted an order
```json
{
  "order": {
    "id": 123,
    "status": "out_for_delivery",
    "driverId": 456,
    // ... full order object
  }
}
```

#### 7. `order-assigned`
Sent to driver when they're assigned to an order
```json
{
  "order": {
    "id": 123,
    "driverId": 456,
    // ... full order object
  }
}
```

#### 8. `available-orders`
Response to `get-available-orders` request
```json
{
  "orders": [
    {
      "id": 123,
      "status": "ready_for_pickup",
      // ... order objects
    }
  ]
}
```

#### 9. `restaurant-orders`
Response to `get-restaurant-orders` request
```json
{
  "orders": [
    {
      "id": 123,
      "status": "preparing",
      // ... order objects
    }
  ]
}
```

#### 10. `error`
Sent when an error occurs
```json
{
  "message": "Error description"
}
```

## Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
                 ↓
              CANCELLED
```

## Example Usage

### Restaurant Client
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/orders', {
  auth: { token: restaurantJwtToken }
});

// Listen for new orders
socket.on('new-order', (data) => {
  console.log('New order received:', data.order);
  // Update restaurant dashboard
});

// Update order status
socket.emit('update-order-status', {
  orderId: 123,
  status: 'preparing'
});

// Get all restaurant orders
socket.emit('get-restaurant-orders', {});
socket.on('restaurant-orders', (data) => {
  console.log('Restaurant orders:', data.orders);
});
```

### Driver Client
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/orders', {
  auth: { token: driverJwtToken }
});

// Listen for available orders
socket.on('new-available-order', (data) => {
  console.log('New order available:', data.order);
  // Show in driver app
});

// Get all available orders
socket.emit('get-available-orders', {});
socket.on('available-orders', (data) => {
  console.log('Available orders:', data.orders);
});

// Accept an order
socket.emit('accept-order', { orderId: 123 });
socket.on('order-accepted', (data) => {
  console.log('Order accepted:', data.order);
});

// Update delivery status
socket.emit('update-order-status', {
  orderId: 123,
  status: 'delivered'
});
```

### User Client
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/orders', {
  auth: { token: userJwtToken }
});

// Listen for order updates
socket.on('order-updated', (data) => {
  console.log('Order status updated:', data.order);
  // Update order tracking UI
});

// Listen for order creation confirmation
socket.on('order-created', (data) => {
  console.log('Order created:', data.order);
});
```

## Security Notes

- All connections require valid JWT authentication
- Users can only access their own orders
- Restaurants can only access their own orders
- Drivers can only accept available orders and update assigned orders
- Rate limiting should be implemented in production

## Error Handling

All client events may result in an `error` event if:
- Invalid authentication
- Insufficient permissions
- Invalid order ID
- Order not found
- Invalid status transition
