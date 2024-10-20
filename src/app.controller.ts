import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { PaymentService } from './modules/payments/services/payment.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private paymentsService: PaymentService
  ) {}

  @Get('/') // Define the endpoint
  handleQuery(@Query() query: { hash: string; interact_ref: string }, @Res() res: Response) {
    const { hash, interact_ref } = query;

    // Perform your logic here, e.g., logging or processing the data
    console.log('Hash:', hash);
    console.log('Interact Reference:', interact_ref);

    this.paymentsService.finalizePayment(hash, interact_ref);
    
    res.status(HttpStatus.OK).json([]);
  }
}
