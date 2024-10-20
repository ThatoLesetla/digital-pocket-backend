import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../../services/payment.service';
import { QueueService } from '../../services/queue.service';

@Controller('payments')
export class PaymentsController {
    constructor(
        public paymentService: PaymentService,
        public queueService: QueueService
    ) {

    }

    @Post()
    public sendMoney(@Body() requestDTO: any) {
        return this.paymentService.sendMoney();
    }

    @Post('queue/start')
    public startQueue() {
        this.queueService.onModuleInit();
    }
}
