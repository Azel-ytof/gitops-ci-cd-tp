import products from "../data/products.json" with { type: "json" };

export type Product = {
  id: string;
  name: string;
  producer: string;
  /** Prix en centimes */
  price: number;
  unit: string;
  image: string;
  emoji: string;
};

export function allProducts(): Product[] {
  return products;
}

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
