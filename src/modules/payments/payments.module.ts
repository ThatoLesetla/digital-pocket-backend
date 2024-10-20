import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments/payments.controller';
import { PaymentService } from './services/payment.service';
import { QueueService } from './services/queue.service';

@Module({
    imports: [PaymentsModule],
    controllers: [PaymentsController],
    providers: [PaymentService, QueueService],
  })
export class PaymentsModule {}
