import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';import { NewRideBroadcastDto } from './new-ride-broadcast.dto';

interface RideDetailsPayload {
  rideId: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedFare: number;
}
// This opens a WebSocket server on the same port as your HTTP server
@WebSocketGateway({ cors: { origin: '*' } }) // Restrict origin in production
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Logs when a driver's app opens the two-way pipe
  handleConnection(client: Socket) {
    // 1. Extract the actual driver ID from auth headers or query params
    const driverId = client.handshake.query.driverId as string;

    if (!driverId) {
      client.disconnect(); // Reject unauthenticated or anonymous connections
      return;
    }

    // 2. Join a dedicated room named after the unique driver ID
    client.join(`driver:${driverId}`);
    console.log(`Driver ${driverId} connected on socket ${client.id}`);
  }

  // Logs when a driver closes the app
  handleDisconnect(client: Socket) {
    console.log(`Driver disconnected: ${client.id}`);
  }

  // The custom function our Service will call to blast out the notification
  broadcastNewRide(driverIds: string[], rideDetails: NewRideBroadcastDto) {
    // In a production app with private rooms, we would loop through the driverIds.
    if (!driverIds || driverIds.length === 0) return;
    // 3. Loop through matching IDs and target their private rooms securely
    driverIds.forEach((driverId) => {
      this.server
        .to(`driver:${driverId}`)
        .emit('new-ride-request', rideDetails);
    });
  }
}
