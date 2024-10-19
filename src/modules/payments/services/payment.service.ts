import { createAuthenticatedClient } from '@interledger/open-payments';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('src/certs/private.key', 'utf8');
const WALLET_ADDRESS = "$ilp.interledger-test.dev/41cec755";
@Injectable()
export class PaymentService {

    constructor() {}

    async sendMoney() {
        try {
            // Read the private key from a file

            const client = await createAuthenticatedClient({
                keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
                privateKey: PRIVATE_KEY, // "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3QlFZREsyVndCQ0lFSUh5WWE4VWVrK21Hb095eUNFeEJhVjlzdzJsMlQ1Skk2QXhVQTlOU0czRGsKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQ==",
                walletAddressUrl: WALLET_ADDRESS
              })
    
              const walletAddress = await client.walletAddress.get({
                url: WALLET_ADDRESS,
              });
    
            const incomingPayment = await client.walletAddress.get({
            url: 'https://cloud-nine-wallet.com/incoming-payment/ef56a2cf-e60f-48ab-a7e8-de6af004c9a0'
            });

          } catch (error) {
            throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
              cause: error
            });
          }
 
    }
}
