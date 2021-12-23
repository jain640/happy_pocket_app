import * as actionTypes from '../actions/actionTypes';
import {AsyncStorage } from 'react-native';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url

const initialState = {
    counter: 0,
    cartItem:[],
    user:null,
    selectedAddress:{},
    store:{},
    selectedStore:{},
    storeType:'MULTI-VENDOR',
    selectedLandmark:null,
    masterStore:{},
    unitTypes:{},
    bankList:{},
    myStore:{},
    storeRole:null,
    totalAmount:0,
    saved:0
}

let counter =0
const cartItems = (state = initialState, action) => {
   switch(action.type) {
       case actionTypes.SET_INITIAL:
         AsyncStorage.setItem('counter', JSON.stringify(action.counter));
         AsyncStorage.setItem('cart', JSON.stringify(action.payload,));
         AsyncStorage.setItem('totalAmount', JSON.stringify(action.totalAmount,));
         return {
          ...state,
          counter: action.counter,
          cartItem: action.payload,
          totalAmount: action.totalAmount,
         }
       case actionTypes.SET_COUNTER_AMOUNT:
         AsyncStorage.setItem('counter', JSON.stringify(action.counter));
         AsyncStorage.setItem('totalAmount', JSON.stringify(action.totalAmount,));
         return {
          ...state,
          counter: action.counter,
          totalAmount: action.totalAmount,
          saved: action.saved,
         }
       case actionTypes.ADD_TO_CART:
         var cart = state.cartItem;
         var count = state.counter;
         var totalAmount = state.totalAmount;
         var flag = true;

         // for (var i = 0;i<cart.length;i++){
         //   if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
         //     count++;
         //     flag = false;
         //   }
         // }
         // for (var i = 0;i<cart.length;i++){
         //   if(cart[i].pk === action.payload.pk){
         //     count++;
         //     flag = false;
         //   }
         // }
         // if(flag){
         //   count = count + action.payload.count;
         // }
        cart.push(action.payload);
        // AsyncStorage.setItem('counter', JSON.stringify(count));
        AsyncStorage.setItem('cart', JSON.stringify(cart));
         return {
              ...state,
              cartItem: cart,
              // counter: count,
          }

       case actionTypes.DECREASE_FROM_CART:
         var cart = state.cartItem;
         var isDelete = false
         var index = null
         // for (var i = 0;i<cart.length;i++){
         //   if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
         //     cart[i].count = cart[i].count -1;
         //     cart[i].discountedPrice = action.payload.discountedPrice;
         //     cart[i].totalPrice = action.payload.totalPrice;
         //     cart[i].sellingPrice = action.payload.sellingPrice;
         //     cart[i].taxRate = action.payload.taxRate;
         //     cart[i].taxPrice = action.payload.taxPrice;
         //     if(cart[i].count == 0){
         //     isDelete = true
         //     index = i
         //     }
         //   }
         // }
         for (var i = 0;i<cart.length;i++){
           if(cart[i].pk === action.payload.pk ){
             cart[i].count = action.payload.count ;
             // cart[i].totalPrice = action.payload.totalPrice;
             if(cart[i].count == 0){
             isDelete = true
             index = i
             }
           }
         }
         if(isDelete == true){
           cart.splice(index,1)
         }
         // AsyncStorage.setItem('counter', JSON.stringify(state.counter-1));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
         return {
              ...state,
              cartItem:cart ,
              // counter: state.counter-1
          }
       case actionTypes.INCREASE_CART:
          var cart = state.cartItem;
          // for (var i = 0;i<cart.length;i++){
          //   if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
          //     cart[i].count = cart[i].count +1;
          //     cart[i].totalPrice = action.payload.totalPrice;
          //     cart[i].sellingPrice = action.payload.sellingPrice;
          //     cart[i].taxRate = action.payload.taxRate;
          //     cart[i].taxPrice = action.payload.taxPrice;
          //     cart[i].discountedPrice = action.payload.discountedPrice;
          //   }
          // }
          for (var i = 0;i<cart.length;i++){
          console.log(cart[i]);
            if(cart[i].pk === action.payload.pk ){
              cart[i].count = action.payload.count;
              // cart[i].totalPrice = action.payload.totalPrice;
            }
          }
          // AsyncStorage.setItem('counter', JSON.stringify(state.counter+1));
          AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
              ...state,
              cartItem: cart,
              // counter: state.counter+1
          }
       case actionTypes.EMPTY_CART:
         AsyncStorage.setItem('counter', JSON.stringify(0));
         AsyncStorage.setItem('cart', JSON.stringify([]));
         return {
             ...state,
             cartItem: [],
             counter: 0,
             totalAmount: 0,
           }
       case actionTypes.USER_PROFILE:
         return {
             user:action.payload
         }
       case actionTypes.SELECTED_ADDRESS:
         return {
             ...state,
             selectedAddress:action.payload
         }
       case actionTypes.RE_ORDER:
         var cart = state.cartItem;
         var count = state.counter;
         var flag = true;
         for (var i = 0;i<cart.length;i++){
           if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
             cart[i].count = cart[i].count + action.payload.count;
             flag = false;
           }

         }
         if(flag){
             cart.push(action.payload);
         }
         count = count + action.payload.count;
         AsyncStorage.setItem('counter', JSON.stringify(count));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
               ...state,
               cartItem: cart,
               counter: count
           }

       case actionTypes.REMOVE_ITEM:
         var cart = state.cartItem;
         var count = state.counter;
         var index = null;
         var _noItems = 0;
         for (var i = 0;i<cart.length;i++){
           if(cart[i].pk === action.payload.pk){
             index = i;
             _noItems = cart[i].count;
           }
         }
         cart.splice(index,1);
         count = count - _noItems;

         AsyncStorage.setItem('counter', JSON.stringify(count));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
               ...state,
               cartItem: cart,
               counter: count
           }
       case actionTypes.SET_STORE:
          return {
              ...state,
              store:action.payload,
          }
       case actionTypes.SET_SELECTED_STORE:
        AsyncStorage.setItem('selectedStore', JSON.stringify(action.payload.pk));
          return {
              ...state,
              selectedStore:action.payload,
          }
       case actionTypes.SET_SERVER_PARAMS:
        AsyncStorage.setItem('masterStore', JSON.stringify(action.payload));
        AsyncStorage.setItem('unitTypes', JSON.stringify(action.unitTypes));
        AsyncStorage.setItem('bankList', JSON.stringify(action.bankList));

          return {
              ...state,
              masterStore:action.payload,
              unitTypes:action.unitTypes,
              bankList:action.bankList,
          }
        case actionTypes.SELECTED_LANDMARK:
        AsyncStorage.setItem('landmarkSelected', JSON.stringify(action.payload.pk));
          return {
              ...state,
              selectedLandmark:action.payload
          }

          case actionTypes.SET_MYSTORE:
           AsyncStorage.setItem('myStorePK', JSON.stringify(action.payload.pk));
           AsyncStorage.setItem('storeRole', JSON.stringify(action.storeRole));
             return {
                 ...state,
                 myStore:action.payload,
                 storeRole:action.storeRole
             }
          case actionTypes.REMOVE_MYSTORE:
           AsyncStorage.setItem('myStorePK', JSON.stringify({}));
           AsyncStorage.setItem('storeRole', JSON.stringify({}));
             return {
                 ...state,
                 myStore:{},
                 storeRole:null,
             }
          case actionTypes.RESET_SELECTED_ADRESSS:
            AsyncStorage.setItem('selectedAddress', JSON.stringify({}));
             return {
                 ...state,
                 selectedAddress:{},
             }


       default:
           return state
   }

   return state

};

export default cartItems;
