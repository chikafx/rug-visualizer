export type Rug = {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  colour: string;
  sizes: string[];
  imageUrl: string;
  available: boolean;
  createdAt?: unknown;
};
