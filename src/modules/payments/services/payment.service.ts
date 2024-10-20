import { createAuthenticatedClient } from '@interledger/open-payments';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('src/certs/private.key', 'utf8');
const WALLET_ADDRESS = "https://ilp.interledger-test.dev/41cec755";

@Injectable()
export class PaymentService {

    constructor() {}

    async sendMoney(amount, destinationPaymentPointer) {
      try {
          // Read the private key from a file
  
          const client = await createAuthenticatedClient({
              keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
              privateKey: PRIVATE_KEY, // "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3QlFZREsyVndCQ0lFSUh5WWE4VWVrK21Hb095eUNFeEJhVjlzdzJsMlQ1Skk2QXhVQTlOU0czRGsKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQ==",
              walletAddressUrl: WALLET_ADDRESS
          })
  
          // Get the wallet address
          const walletAddress = await client.walletAddress.get({
              url: WALLET_ADDRESS,
          });
  
          // Create an outgoing payment using the Interledger API
          const outgoingPayment = await client.outgoingPayment.create(
            {
              url: new URL(WALLET_ADDRESS).origin,
              accessToken: OUTGOING_PAYMENT_ACCESS_TOKEN,
            },
            {
              walletAddress: WALLET_ADDRESS,
              quoteId: QUOTE_URL,
            },
          );
  
          return outgoingPayment;
      } catch (error) {
          throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
          }, HttpStatus.FORBIDDEN, {
              cause: error
          });
      }
    }

    // Implementing Open Payments Workflows
    async createAccount(paymentPointer) {
        try {
            const client = await createAuthenticatedClient({
                keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
                privateKey: PRIVATE_KEY,
                walletAddressUrl: WALLET_ADDRESS
            });

            const account = await client.account.create({
                url: WALLET_ADDRESS,
                accessToken: ACCOUNT_ACCESS_TOKEN,
            }, {
                paymentPointer,
                assetCode: 'USD',
                assetScale: 2
            });

            return account;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Error creating account',
            }, HttpStatus.BAD_REQUEST, {
                cause: error
            });
        }
    }

    async getIncomingPaymentDetails(incomingPaymentUrl) {
        try {
            const client = await createAuthenticatedClient({
                keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
                privateKey: PRIVATE_KEY,
                walletAddressUrl: WALLET_ADDRESS
            });

            const incomingPayment = await client.incomingPayment.get({
                url: incomingPaymentUrl,
                accessToken: INCOMING_PAYMENT_ACCESS_TOKEN,
            });

            return incomingPayment;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Error fetching incoming payment details',
            }, HttpStatus.BAD_REQUEST, {
                cause: error
            });
        }
    }

    async generateAccessToken(clientId, clientSecret) {
        try {
            const client = await createAuthenticatedClient({
                keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
                privateKey: PRIVATE_KEY,
                walletAddressUrl: WALLET_ADDRESS
            });

            const token = await client.accessToken.create({
                clientId,
                clientSecret
            });

            return token;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Error generating access token',
            }, HttpStatus.BAD_REQUEST, {
                cause: error
            });
        }
    }
}
