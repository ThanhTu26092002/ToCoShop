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
    persist((set) => ({
      auth: null,
      signIn: (payload) =>
        set(() => ({ auth: payload }), false, "@auth/signIn"),
      signOut: () => set({ auth: null }, false, "@auth/signOut"),
    }),
    {
      name: 'auth-tocoshop', // unique name
      // getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
    ))
);
export default useAuth;
