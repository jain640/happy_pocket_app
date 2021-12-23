import * as actionTypes from '../actions/actionTypes'



export const addToCart = (product)=>({
  type: actionTypes.ADD_TO_CART,
  payload:product
})

export const decreaseFromCart = (product)=>({
  type: actionTypes.DECREASE_FROM_CART,
  payload:product
})

export const increaseCart = (product)=>({
  type: actionTypes.INCREASE_CART,
  payload:product
})

export const emptyCart = ()=>({
  type: actionTypes.EMPTY_CART,
})

export const userProfile = (user)=>({
  type: actionTypes.USER_PROFILE,
  payload: user
})

export const setInitial = (cart,counter,totalAmount)=>({
  type: actionTypes.SET_INITIAL,
  payload: cart,
  counter:counter,
  totalAmount:totalAmount
})

export const setCounterAmount = (counter,totalAmount,saved)=>({
  type: actionTypes.SET_COUNTER_AMOUNT,
  counter:counter,
  totalAmount:totalAmount,
  saved:saved
})

export const selectedAddress = (address)=>({
  type: actionTypes.SELECTED_ADDRESS,
  payload: address,
})

export const selectedLandmark = (landmark)=>({
  type: actionTypes.SELECTED_LANDMARK,
  payload: landmark,
})

export const reOrderAction = (product)=>({
  type: actionTypes.RE_ORDER,
  payload: product,
})

export const removeItem = (product)=>({
  type: actionTypes.REMOVE_ITEM,
  payload: product,
})

export const setStore = (store)=>({
  type: actionTypes.SET_STORE,
  payload: store,
})

export const setStoreType = (storeType)=>({
  type: actionTypes.SET_STORE_TYPE,
  payload: storeType,
})

export const setSelectedStore = (selectedStore)=>({
  type: actionTypes.SET_SELECTED_STORE,
  payload: selectedStore,
})
export const setServerParams = (masterStore,unitTypes,bankList)=>({
  type: actionTypes.SET_SERVER_PARAMS,
  payload: masterStore,
  unitTypes:unitTypes,
  bankList:bankList
})
export const setMyStore = (myStore,storeRole)=>({
  type: actionTypes.SET_MYSTORE,
  payload: myStore,
  storeRole: storeRole
})
export const removeSelectedAddress = ()=>({
  type: actionTypes.RESET_SELECTED_ADRESSS
})
export const removeMyStore = ()=>({
  type: actionTypes.REMOVE_MYSTORE
})
