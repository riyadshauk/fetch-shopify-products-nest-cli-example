import {
  Injectable,
  // Logger,
} from '@nestjs/common';
import { ShopifyAdminService } from './shopifyadmin.service';
import { ProductEdge } from './types';

@Injectable()
export class FindProductsService {
  // private readonly logger = new Logger(FindProductsService.name);
  constructor(private shopifyAdminService: ShopifyAdminService) {}
  async getProducts(searchString: string): Promise<any> {
    let nextCursor = null;
    let firstQuery = true;
    const productVariantsFlattened = [];
    // const loopCounter = 0;
    while (nextCursor || firstQuery) {
      // console.debug('begin while, loopCounter:', loopCounter);
      const updateFlattenedProductVariants = async () => {
        const results = await this.shopifyAdminService.query(`{
          products(first: 10, query: "title:*${searchString}*", after: ${
          nextCursor === null ? null : `"${nextCursor}"`
        }) {
            edges {
              cursor
              node {
                defaultCursor
                id
                title
                handle
                variants(first: 20) {
                    edges {
                        node {
                            id
                            title
                            price
                        }
                    }
                }
              }
            }
          }
        }`);
        // console.debug('results:', results);
        const productEdges: ProductEdge[] = results.data.data.products.edges;
        nextCursor =
          productEdges.length > 0
            ? productEdges[productEdges.length - 1].cursor
            : null;
        const productVariantsWithProductTitle = productEdges.map(
          (productEdge) => ({
            id: productEdge.node.id,
            title: productEdge.node.title,
            variants: productEdge.node.variants.edges.map(({ node }) => node),
          }),
        );
        productVariantsFlattened.push(
          ...productVariantsWithProductTitle.reduce((acc, productInfo) => {
            if (productInfo.variants.length > 0) {
              const variants = productInfo.variants.map((variant) => ({
                title: productInfo.title,
                variant: variant.title,
                productId: productInfo.id,
                variantId: variant.id,
                price: variant.price,
              }));
              return [...acc, ...variants];
            }
          }, []),
        );
        /**
         * @todo simplification for rate-limit throttling,
         * otherwise exponential backoff may be used here
         * (this is a bit slow, but ensures correct answer
         * -- assuming max cost of requested query cost of 232 and no restoreRate, for simplicity)
         */
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 232));
      };

      await updateFlattenedProductVariants();
      firstQuery = false;

      // loopCounter++;
      // console.debug({ productVariantsFlattened, loopCounter });
      // console.debug('nextCursor:', nextCursor);
      // console.debug(
      //   'productVariantsFlattened.length:',
      //   productVariantsFlattened.length,
      // );
    }

    productVariantsFlattened.sort((a, b) => Number(a.price) - Number(b.price));
    console.log(JSON.stringify(productVariantsFlattened, null, 4));
    return productVariantsFlattened;
  }
}
