import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ShopifyAdminService {
  #adminApiToken: string;
  // #storefrontApiToken: string;
  #shopDomain: string;
  constructor(private configService: ConfigService) {
    this.#adminApiToken = this.configService.get<string>('ADMIN_API_TOKEN');
    // this.#storefrontApiToken = this.configService.get<string>(
    //   'STOREFRONT_API_TOKEN',
    // );
    this.#shopDomain = this.configService.get<string>('SHOP_DOMAIN');
  }
  query(graphql: string): Promise<any> {
    return axios(`https://${this.#shopDomain}/admin/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.#adminApiToken,
      },
      data: JSON.stringify({ query: graphql }),
    });
  }
}
