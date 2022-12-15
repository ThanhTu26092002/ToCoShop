import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import axiosClient from "../config/axios";
import {
  dateFormatList,
  URLOrder,
  URLTransportation,
  URLProduct,
  sizeList,
} from "../config/constants";
const useAuth = create(
  devtools(
    persist(
      (set, get) => ({
        auth: null,
        signIn: (payload) =>
          set(() => ({ auth: payload }), false, "@auth/signIn"),
        setEmployee: (payload) => {
          const savedContent = get().auth;
          savedContent.employeeInfo = payload;
          return set(
            () => ({ auth: savedContent }),
            false,
            "@auth/setEmployee"
          );
        },
        signOut: () => set({ auth: null }, false, "@auth/signOut"),
      }),
      {
        name: "auth-toCoShop", // unique name
        // getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
      }
    )
  )
);
//
export const useTransportations = create(
  devtools(
    persist(
      (set) => ({
        hookTransportationData: [],
        hookSetTransportation: (payload) =>
          set(
            () => ({ hookTransportationData: payload }),
            false,
            "@transportation/hookSetTransportation"
          ),
      }),
      {
        name: "transportations-toCoShop",
      }
    )
  )
);
export const useProducts = create(
  devtools(
    persist(
      (set) => ({
        hookProductData: [],
        hookSetProduct: (payload) =>
          set(
            () => ({ hookProductData: payload }),
            false,
            "@product/hookSetProduct"
          ),
      }),
      {
        name: "product-toCoShop",
      }
    )
  )
);
export const useOrderDetail = create(
  devtools(
    persist(
      (set) => ({
        hookOrderDetailData: null,
        hookSetOrderDetail: (payload) =>
          set(
            () => ({ hookOrderDetailData: payload }),
            false,
            "@orderDetail/hookSetOrderDetail"
          ),
      }),
      {
        name: "orderDetail-toCoShop",
      }
    )
  )
);
export default useAuth;
