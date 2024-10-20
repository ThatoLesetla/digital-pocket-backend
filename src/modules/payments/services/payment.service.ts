import { createAuthenticatedClient } from '@interledger/open-payments';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('src/certs/private.key', 'utf8');
const WALLET_ADDRESS = "https://ilp.interledger-test.dev/41cec755";

@Injectable()
export class PaymentService {

    constructor() {}

    async sendMoney() {
      try {
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
          let incomingPayment = await this.createIncomingPayment(client, grant.access_token);

          return incomingPayment;

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
            value: "1000",
            assetCode: "USD",
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
}
