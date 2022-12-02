import create from "zustand";
import { devtools, persist } from "zustand/middleware";

// const useAuth = create(
//   devtools((set) => ({
//     auth: null,
//     signIn: (payload) => set(() => ({ auth: payload }), false, '@auth/signIn'),
//     signOut: () => set({ auth: null }, false, '@auth/signOut'),
//   })),
// );
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

//  export const useOthers = create(
//   devtools((set) => ({
//     loading: false,
//     setLoading: (payload) =>
//       set(() => ({ loading: payload }), false, "@Others/loading"),
//     // signOut: () => set({ auth: null }, false, "@auth/signOut"),
//   }))
// );

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
