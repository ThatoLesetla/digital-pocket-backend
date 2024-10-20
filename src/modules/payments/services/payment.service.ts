import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { RedisService } from './redis.service';

const PRIVATE_KEY = fs.readFileSync('src/certs/private.key', 'utf8');
const WALLET_ADDRESS = "https://ilp.interledger-test.dev/41cec755";

@Injectable()
export class PaymentService {

    constructor(
      private redisService: RedisService
    ) {}

    async sendMoney() {
      try {
        console.log(process.env.KEY_ID)
          // Read the private key from a file
          const client = await createAuthenticatedClient({
              keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
              privateKey: PRIVATE_KEY,
              walletAddressUrl: WALLET_ADDRESS
          })
  
          // Get the wallet address
          const walletAddress = await client.walletAddress.get({
              url: WALLET_ADDRESS,
          });
  
          // Generate a grant request
          let grant = await this.requestGrant(client, walletAddress);
          let incomingPayment = await this.createIncomingPayment(client, grant.access_token.value);
          let quoteGrant = await this.requestQuoteGrant(client, walletAddress);
          let quote = await this.createQuote(client, quoteGrant.access_token.value, incomingPayment.id);
          let outgoingPaymentGrant = await this.requestOutgoingPaymentGrant(client, walletAddress, quote.debitAmount.value, quote.receiveAmount.value);

          await this.redisService.set('outgoingPaymentGrant', outgoingPaymentGrant);
          await this.redisService.set('quote', quote);

          return outgoingPaymentGrant;

      } catch (error) {
          throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
          }, HttpStatus.FORBIDDEN, {
              cause: error
          });
      }
    }

    async createIncomingPayment(client, token) {
      return await client.incomingPayment.create(
        {
          url: new URL(WALLET_ADDRESS).origin,
          accessToken: token,
        },
        {
          walletAddress: WALLET_ADDRESS,
          incomingAmount: {
            value: "100",
            assetCode: "EUR",
            assetScale: 2,
          },
          expiresAt: new Date(Date.now() + 60_000 * 10).toISOString(),
        },
      );
    }

    async requestGrant(client, walletAddress) {
      return await client.grant.request(
        {
          url: walletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "incoming-payment",
                actions: ["list", "read", "read-all", "complete", "create"],
              },
            ],
          },
        },
      );
    }

    async requestQuoteGrant(client, walletAddress) {
      return await client.grant.request(
        {
          url: walletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "quote",
                actions: ["create", "read", "read-all"],
              },
            ],
          },
        },
      );
    }

    async createQuote(client, quoteToken, incomingPaymentUrl) {
      return await client.quote.create(
        {
          url: new URL(WALLET_ADDRESS).origin,
          accessToken: quoteToken,
        },
        {
          method: "ilp",
          walletAddress: WALLET_ADDRESS,
          receiver: incomingPaymentUrl,
        },
      );
    }

    async requestOutgoingPaymentGrant(client, walletAddress, debitAmount, receiverAmount) {
      return await client.grant.request(
        {
          url: walletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                identifier: walletAddress.id,
                type: "outgoing-payment",
                actions: ["list", "list-all", "read", "read-all", "create"],
                // limits: {
                //   debitAmount: debitAmount,
                //   receiveAmount: receiverAmount,
                // },
              },
            ],
          },
          interact: {
            start: ["redirect"],
            finish: {
              method: "redirect",
              uri: "http://localhost:3000",
              nonce: '',
            },
          },
        },
      );
    }

    async createOutgoingPayment(client, outgoingToken, walletAddress, quoteUrl) {
      return await client.outgoingPayment.create(
        {
          url: new URL(walletAddress).origin,
          accessToken: outgoingToken,
        },
        {
          walletAddress: WALLET_ADDRESS,
          quoteId: quoteUrl,
        },
      );
    }

    async finalizePayment(hash: any, interactRef: any) {
      let outgoingPaymentGrant = await this.redisService.get('outgoingPaymentGrant');
      let quote = await this.redisService.get('quote');

      const client = await createAuthenticatedClient({
        keyId: "08e6819c-3ce8-48d0-8fdb-3bbe01cad963",
        privateKey: PRIVATE_KEY,
        walletAddressUrl: WALLET_ADDRESS
      })

      // Get the wallet address
      const walletAddress = await client.walletAddress.get({
        url: WALLET_ADDRESS,
      });

      const finalizedOutgoingPaymentGrant = await client.grant.continue({
        url: "https://auth.interledger-test.dev/continue/6b44d5d1-2d00-44c8-81a2-9cfac011d064",
        accessToken: "39D0FE573C5E02D0FEC4",
      });

      let isGrant = isFinalizedGrant(finalizedOutgoingPaymentGrant);
      // let outgoingPayment = await this.createOutgoingPayment(client, finalizedOutgoingPaymentGrant.continue.access_token.value, walletAddress, quote.id);

    }

    writeObjectToFile(filename: string, data: any): void {
      // Create the file path (adjust the directory as needed)
      const filePath = join(__dirname, '..', '..', 'data', filename);
  
      // Convert the object to JSON string
      const jsonData = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
  
      // Write the JSON string to the file
      fs.writeFileSync(filePath, jsonData, 'utf-8');
    }
}
