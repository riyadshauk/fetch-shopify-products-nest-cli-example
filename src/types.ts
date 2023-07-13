export interface ProductEdge {
  cursor: string;
  node: Product;
}

export interface Product {
  defaultCursor: string;
  id: string;
  title: string;
  handle: string;
  variants: VariantEdges;
}

export interface VariantEdges {
  edges: Edge[];
}

export interface Edge {
  node: Variant;
}

export interface Variant {
  id: string;
  title: string;
  price: string;
}

// export interface ProductVariantEdge {
//   cursor: string;
//   node: ProductVariant;
// }

// export interface ProductVariant {
//   defaultCursor: string;
//   id: string;
//   title: string;
//   price: string;
// }
