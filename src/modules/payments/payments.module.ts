import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments/payments.controller';
import { PaymentService } from './services/payment.service';

@Module({
    imports: [PaymentsModule],
    controllers: [PaymentsController],
    providers: [PaymentService],
  })
export class PaymentsModule {}
