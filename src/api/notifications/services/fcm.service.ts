import { Injectable, Logger } from '@nestjs/common';
import { getMessaging } from 'src/api/config/firebase.config';
import * as admin from 'firebase-admin';

export interface FCMNotification {
  title: string;
  message: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface FCMSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);

  /**
   * Send push notification to a single device
   */
  async sendToDevice(
    token: string,
    notification: FCMNotification,
  ): Promise<FCMSendResult> {
    try {
      const messaging = getMessaging();

      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.message,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.send(message);
      this.logger.log(`Successfully sent message: ${response}`);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error(`Error sending FCM message to token ${token}:`, error);

      // Handle invalid token errors
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return {
          success: false,
          error: 'INVALID_TOKEN',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    notification: FCMNotification,
  ): Promise<{
    successCount: number;
    failureCount: number;
    invalidTokens: string[];
  }> {
    try {
      const messaging = getMessaging();

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.message,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      // Collect invalid tokens for cleanup
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      this.logger.log(
        `Multicast message sent. Success: ${response.successCount}, Failure: ${response.failureCount}, Invalid tokens: ${invalidTokens.length}`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      this.logger.error('Error sending multicast FCM message:', error);
      throw error;
    }
  }
}
