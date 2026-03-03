"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  qty: number;
  inStock: number;
}

interface CartContextValue {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextValue>({
  cart: [],
  setCart: () => {},
  clearCart: () => {},
  cartCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const clearCart = useCallback(() => setCart([]), []);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}