import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { backOff } from 'exponential-backoff';

@Injectable()
export class ShopifyAdminService {
  #adminApiToken: string;
  #shopDomain: string;
  constructor(private configService: ConfigService) {
    this.#adminApiToken = this.configService.get<string>('ADMIN_API_TOKEN');
    this.#shopDomain = this.configService.get<string>('SHOP_DOMAIN');
  }
  /**
   * @description Attempts Graphql query against Shopify Admin Graphql API.
   * Uses exponential backoff to retry in case of errors.
   * @param graphql the query string (wrapped in { brackets }),
   * without outer-wrapped { query: ... }.
   */
  async query(graphql: string): Promise<AxiosResponse> {
    let results: AxiosResponse;
    const numOfAttempts = 9;
    await backOff(
      async () => {
        results = results = await axios(
          `https://${this.#shopDomain}/admin/api/2023-07/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': this.#adminApiToken,
            },
            data: JSON.stringify({ query: graphql }),
          },
        );
        if (results.status !== 200 || results.data.errors !== undefined) {
          throw new Error(
            'Shopify Admin Graphql API call failed, possibly due to rate-limit/throttling. Will attempt to retry...',
          );
        }
      },
      {
        jitter: 'full',
        startingDelay: 100,
        numOfAttempts,
        retry(e: Error, attemptNumber) {
          console.debug({
            errorMessage: e.message,
            numOfAttempts,
            attemptNumber,
          });
          return attemptNumber < numOfAttempts;
        },
      },
    );
    return results;
  }
}
