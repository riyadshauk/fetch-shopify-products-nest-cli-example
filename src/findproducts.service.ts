import { Injectable } from '@nestjs/common';
import { ShopifyAdminService } from './shopifyadmin.service';
import { ProductEdge } from './types';

@Injectable()
export class FindProductsService {
  constructor(private shopifyAdminService: ShopifyAdminService) {}
  async getProducts(searchString: string): Promise<any> {
    let nextCursor = null;
    let firstQuery = true;
    const productVariantsFlattened = [];
    while (nextCursor || firstQuery) {
      const results = await this.shopifyAdminService.query(`{
          products(first: 10, query: "title:${
            // this enables us to pass in an empty string to search for all products (via findproducts.command)
            searchString !== '' ? '*' : ''
          }${searchString}*", after: ${
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

      // /**
      //  * @todo simplification for rate-limit throttling,
      //  * otherwise exponential backoff may be used here
      //  * (this is a bit slow, but ensures correct answer, for simplicity)
      //  */
      // if (nextCursor) {
      //   await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      // }
      firstQuery = false;
    }

    productVariantsFlattened.sort((a, b) => Number(a.price) - Number(b.price));
    console.log(JSON.stringify(productVariantsFlattened, null, 4));
    return productVariantsFlattened;
  }
}
