import create from "zustand";
import { devtools, persist } from "zustand/middleware";


const useAuth = create(
  devtools(
    persist(
      (set) => ({
        auth: null,
        signIn: (payload) =>
          set(() => ({ auth: payload }), false, "@auth/signIn"),
        signOut: () => set({ auth: null }, false, "@auth/signOut"),
      }),
      {
        name: "auth-toCoShop", // unique name
        // getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
      }
    )
  )
);

 export const orderDetails = create(
  devtools(
      persist(
        devtools((set, get) => ({
          items: [],
          add: ({ product, quantity }) => {
            const items = get().items;
            const found = items.find((x) => x.product.id === product.id);
            if (found) {
              found.quantity++;
            } else {
              items.push({ product, quantity });
            }
    
            return set({ items: items }, false, { type: 'carts/addToCart' });
          },
          remove: (id) => {
            const items = get().items;
            const newItems = items.filter((x) => x.product.id !== id);
            return set({ items: newItems }, false, { type: 'carts/removeFromCart' });
          },
          increase: (id) => {
            const items = get().items;
            const found = items.find((x) => x.product.id === id);
            found.quantity++;
            return set({ items: items }, false, { type: 'carts/increase' });
          },
          decrease: (id) => {
            const items = get().items;
            const found = items.find((x) => x.product.id === id);
            if (found.quantity === 1) {
              const newItems = items.filter((x) => x.product.id !== found.product.id);
              return set({ items: newItems }, false, { type: 'carts/decrease' });
            } else {
              found.quantity--;
              return set({ items: items }, false, { type: 'carts/increase' });
            }
          },
        })),
      ),
      {
        name: "orderDetails", // unique name
        // getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
      }
  )
);

// export const useCurrentPage = create(
//   devtools(
//     persist(
//     (set) => ({
//     currentPage: null,
//     setCurrentPage: (page) =>
//       set(() => ({ currentPage: page }), false, "@CurrentPage/setCurrentPage"),
//     // signOut: () => set({ auth: null }, false, "@auth/signOut"),
//   }),
//   {
//     name: "currentPage-toCoShop", // unique name
//     // getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
//   }
// ))
// );

export default useAuth;
