export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id: string;
  items: IOrderItem[];
  customerName: string;
  phone: string;
  location: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid';
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: string;
  image: string;
  badge?: string;
  specs: string[];
  inStock: number;
  createdAt: string;
  updatedAt: string;
}