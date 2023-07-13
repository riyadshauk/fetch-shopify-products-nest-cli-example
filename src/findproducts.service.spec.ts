import { ConfigModule, ConfigService } from '@nestjs/config';
import { FindProductsService } from './findproducts.service';
import { ShopifyAdminService } from './shopifyadmin.service';

describe('FindProductsService', () => {
  const findProductsService = new FindProductsService(
    new ShopifyAdminService(new ConfigService(ConfigModule.forRoot())),
  );

  describe('root', () => {
    it('should return the correct number of results for the provided product-name search-string', async () => {
      const results = await findProductsService.getProducts('glove');
      expect(results.length).toBe(21);
    }, 20000);
  });
});
