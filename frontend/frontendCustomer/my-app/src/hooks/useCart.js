import create from "zustand";
import { persist, devtools } from "zustand/middleware ";
const persistOption = {
  name: "cart-storage",
  //   getStarage: () => sessionStorage,
  getStarage: () => localStorage,
};
export const useCart = create(
  persist(
    devtools((set, get) => ({
      items: [],
      add: ({ attributeId,product, quantity }) => {
        const items = get().items;
        const found = items.find((x) => x.attributeId === attributeId);
        if (found) {
          found.quantity++;
        } else {
          items.push({ attributeId,product, quantity });
          console.log("acd",items)
        }

        return set({ item: items }, false, { type: "carts/addToCart" });
      },
      remove: (id) => {
        const items = get().items;
        const newItems = items.filter((x) => x.product._id !== id);
        return set({ items: newItems }, false, {
          type: "carts/removeFormCart",
        });
      },
      increase: (id) => {
        const items = get().items;
        const found = items.find((x) => x.product._id === id);
        found.quantity++;
        return set({ items: items }, false, { type: "carts/increase" });
      },
      decrease: (id) => {
        const items = get().items;
        const found = items.find((x) => x.product.id === id);
        if ((found.quantity === 1)) {
          const newItems = items.filter(
            (x) => x.product.id !== found.product._id
          );
          return set({ items: newItems }, false, {
            type: "carts/decrease",
          });
        } else {
          found.quantity--;
          return set({ items: items }, false, { type: "carts/decrease" });
        }
      },
    })),
    persistOption
  )
);
