import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../../services/payment.service';

@Controller('payments')
export class PaymentsController {
    constructor(public paymentService: PaymentService) {

    }

    @Post()
    public sendMoney(@Body() requestDTO: any) {
        this.paymentService.sendMoney();
        return 'This is sending money';
    }
}
