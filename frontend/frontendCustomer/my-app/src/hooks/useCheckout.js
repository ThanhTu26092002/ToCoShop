import create from "zustand";
import { persist, devtools } from "zustand/middleware";
const persistOption = {
    name: "info",
    //   getStarage: () => sessionStorage,
    getStarage: () => localStorage,
  };
  export const useCheckout = create(
    persist(
        devtools((set, get) => ({
            info:{},
            add:({contactInfo,shippingInfo,orderDetail})=>{
                let info = get().info;
                if(contactInfo){
                    info={...info, contactInfo };
                }
                if(shippingInfo){
                    info={...info, shippingInfo };
                }
                if(orderDetail){
                    info={...info, orderDetail };
                }
                
                console.log("info",info)
                return set({ info: info }, false, { type: "info" });
            }
        })
    ),
    persistOption
  ))