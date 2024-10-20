import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../../services/payment.service';
import { QueueService } from '../../services/queue.service';

@Controller('payments')
export class PaymentsController {
    constructor(
        public paymentService: PaymentService
    ) {

    }

    @Post()
    public sendMoney(@Body() requestDTO: any) {
        return this.paymentService.sendMoney();
    }

    @Post('transaction/finalization')
    public finalizePayment(@Body() paymentDTO: any) {
        console.log(paymentDTO);
    }

}
