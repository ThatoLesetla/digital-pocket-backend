import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);
    private readonly sqs = new AWS.SQS({
        region: 'us-east-1', // Replace with your region
        accessKeyId: process.env.ACCESS_KEY_ID, // Replace with your AWS access key
        secretAccessKey: process.env.SECRET_ACCESS_KEY, // Replace with your AWS secret key
    });
    private readonly queueUrl = 'https://sqs.us-east-1.amazonaws.com/945647145575/Sabi-payments'; // Replace with your SQS Queue URL

  onModuleInit() {
    // Start polling the payment queue every 5 seconds
    setInterval(() => this.pollQueue(), 5000);
  }

  private async pollQueue(): Promise<void> {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10, // Adjust as per your need
        WaitTimeSeconds: 0, // Short polling
      };

      const result = await this.sqs.receiveMessage(params).promise();

      if (result.Messages && result.Messages.length > 0) {
        for (const message of result.Messages) {
          await this.processMessage(message);
          await this.deleteMessage(message.ReceiptHandle);
        }
      }
    } catch (error) {
      this.logger.error('Error polling the queue', error);
    }
  }

  private async processMessage(message: AWS.SQS.Message): Promise<void> {
    try {
      // Process the message
      this.logger.log(`Processing message: ${message.Body}`);
      // Add your business logic here
    } catch (error) {
      this.logger.error('Error processing message', error);
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      };
      await this.sqs.deleteMessage(params).promise();
      this.logger.log('Message deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting message', error);
    }
  }
}
