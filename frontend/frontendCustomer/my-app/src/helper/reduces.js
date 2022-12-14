import * as Actiontypes from './types'
const newaction =0
const counterReduct=(state,action)=>{
    switch(action.type){
        case Actiontypes.newfs:
          newaction =8
            return{...state,newaction}
        case Actiontypes.womenfs:
        newaction =12
            return{...state,newaction}    
        default:
            return state;    
    }
}
export default counterReduct;