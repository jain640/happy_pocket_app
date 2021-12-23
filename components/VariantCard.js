import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert,AsyncStorage,ActivityIndicator} from 'react-native';
import { FontAwesome,EvilIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import * as actionTypes from '../actions/actionTypes'
import ImageOverlay from "react-native-image-overlay";
import { MonoText } from './StyledText';
import settings from '../constants/Settings.js';
import moment from 'moment';
import Toast, {DURATION} from 'react-native-easy-toast';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

export default class VariantCard extends React.Component {

  constructor(props) {
    super(props);


    if(props.bundle){
      var name = props.product.name
      var count = 0
    }else{
      var name = props.product.displayName
      var count =null
    }

    this.state = {
      store:props.store,
      details:props.details,
      product:props.product,
      name:name,
      bundle:props.bundle,
      count:count,
      cartItems:props.cartItems,
      cart:null,
      user:null,
      csrf:null,
      sessionid:null,
      loader:false,
      cartLoader:false
    }
  }


  componentWillReceiveProps({cartItems}){
    var count = 0
    var cart = null
    cartItems.forEach((item,idx)=>{
      if(item.productVariant==this.state.product.variant_pk){
        count = item.count
        cart = item.cart
      }
    })
    this.setState({count:count,cart:cart})
    this.getUser()
  }
  getUser=async()=>{
    var login =  await AsyncStorage.getItem('login');
    if(login){
      var pk =  await AsyncStorage.getItem('userpk');
      var csrf =  await AsyncStorage.getItem('csrf');
      var sessionid =  await AsyncStorage.getItem('sessionid');
      this.setState({user:pk,csrf:csrf,sessionid:sessionid})
    }
  }

  componentDidMount(){

  }


 gotoDetails=()=>{
  if(this.state.store.quickadd) return;
  this.props.navigation.push('ProductDetails',{product:this.state.product.parent_pk})
  // this.props.details()
 }

 addToCartUpdate =()=>{
   var selected = this.state.product
   if(this.state.user==null){
     this.props.navigation.navigate('LogInScreen')
     return
   }
   var obj = {productVariant:selected.variant_pk,store:this.state.store.pk,count:selected.minQtyOrder,type:actionTypes.ADD_TO_CART,}
   this.cartDataUpdate(obj)
   // var selected = this.state.product
   // if (selected.stock<selected.minQtyOrder) {
   //   // this.refs.toast.show('The product is SOLD OUT, it will be back soon');
   //   this.props.showtoast('The product is SOLD OUT, it will be back soon')
   //   return;
   // }
   // this.setState({inCart :selected.minQtyOrder})
   // var image = '/media/'+selected.image
   // var imageSel = selected.image.length>0?image:null
   //
   // var totalPrice = selected.sellingPrice
   // var taxRate = this.state.details.taxRate
   // var gstType = this.state.details.gstType
   // var taxPrice = 0
   // if(gstType=='gst_extra'&&taxRate!=null){
   //   totalPrice = totalPrice+(totalPrice*taxRate)/100
   //   taxPrice = (selected.sellingPrice*taxRate)/100
   // }
   // if(taxRate==null){
   //   taxRate = 0
   // }
   // var obj = {product:selected.parent_pk,taxRate:taxRate,totalPrice:totalPrice,taxPrice:taxPrice,productVariant:selected.variant_pk,store:this.state.store.pk,count:selected.minQtyOrder,type:actionTypes.ADD_TO_CART,customizable:null,
   //   sellingPrice:selected.sellingPrice,mrp:selected.sellingPrice,stock:selected.stock,discount:selected.price-selected.sellingPrice, maxQtyOrder:null,minQtyOrder:selected.minQtyOrder,
   //   dp:imageSel,displayName:selected.name,user:this.state.user,cart:null,bulkChart:null,discountedPrice:selected.sellingPrice}
   //
   // this.postCart(obj,selected.minQtyOrder)
 }

 postCart = (obj,count)=>{
   var sessionid =  this.state.sessionid;
   var csrf = this.state.csrf;
   if(obj.user != null){
     var data = {
       product:obj.product,
       productVariant:obj.productVariant,
       store:obj.store,
       qty:obj.count,
      }
      this.setState({loader:true})
       fetch(SERVER_URL +'/api/POS/cart/' , {
         method: 'POST',
         headers:{
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken': csrf
         },
         body: JSON.stringify(data)
       })
         .then((response) => {
           if(response.status==201||response.status==200){
             return response.json()
           }else{
             return undefined
           }
         })
         .then((responseJson) => {
           if(responseJson!=undefined){
             // obj.cart = responseJson.pk
             // obj.count = obj.count
             this.setState({loader:false})
             obj.product = responseJson.product.pk,
           obj.productVariant = responseJson.productVariant.pk,
           obj.store = responseJson.store,
           obj.count = responseJson.qty,
           obj.sellingPrice = responseJson.sellingPrice,
           obj.mrp = responseJson.productVariant.price,
           obj.discount = responseJson.price-responseJson.sellingPrice,
           obj.bulkChart = responseJson.bulk,
           obj.discountedPrice = responseJson.sellingPrice
           obj.cart = responseJson.pk
           obj.count = responseJson.qty
           obj.addon = responseJson.addon
           obj.customDetails = responseJson.customDetails
           obj.customFile = responseJson.customFile
           obj.is_fav = responseJson.is_fav
           obj.is_changed = responseJson.is_changed
           obj.taxPrice = responseJson.taxPrice
           obj.taxRate = responseJson.product.taxRate
           obj.addonPrice = responseJson.addonPrice
           obj.bulkDiscount = responseJson.bulkDiscount
           obj.promoValue = responseJson.promoValue
           obj.totalPrice = responseJson.price
             this.props.onChange(obj)
             this.setState({count : count,cart:obj.cart})
           }

         }).catch((err)=>{
           this.setState({loader:false})
         })

   }else{

     obj.count = count
     obj.cart = obj.cart
     this.props.onChange(obj)
     this.setState({count : count,cart:null})
   }
 }
 cartUpdate =(obj,type)=>{
   var sessionid =  this.state.sessionid;
   var csrf = this.state.csrf;
   if(type=='increase'){
     var qty = obj.count+1
   }else{
     var qty = obj.count-1
   }
   if(obj.user != null){
     var data = {
       qty:qty,
      }
      this.setState({loader:true})
        fetch(SERVER_URL +'/api/POS/cart/'+obj.cart+'/' , {
         method: 'PATCH',
         headers:{
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken': csrf
         },
         body: JSON.stringify(data)
       })
         .then((response) => {
           if(response.status==201||response.status==200){
             return response.json()
           }else{
             return undefined
           }
         })
         .then((responseJson) => {
           if(responseJson!=undefined){
             // obj.cart = responseJson.pk
             // obj.count = qty
             this.setState({loader:false})
             obj.product = responseJson.product.pk,
           obj.productVariant = responseJson.productVariant.pk,
           obj.store = responseJson.store,
           obj.count = responseJson.qty,
           obj.sellingPrice = responseJson.sellingPrice,
           obj.mrp = responseJson.productVariant.price,
           obj.discount = responseJson.price-responseJson.sellingPrice,
           obj.bulkChart = responseJson.bulk,
           obj.discountedPrice = responseJson.sellingPrice
           obj.cart = responseJson.pk
           obj.count = responseJson.qty
           obj.addon = responseJson.addon
           obj.customDetails = responseJson.customDetails
           obj.customFile = responseJson.customFile
           obj.is_fav = responseJson.is_fav
           obj.is_changed = responseJson.is_changed
           obj.taxPrice = responseJson.taxPrice
           obj.taxRate = responseJson.product.taxRate
           obj.addonPrice = responseJson.addonPrice
           obj.bulkDiscount = responseJson.bulkDiscount
           obj.promoValue = responseJson.promoValue
           obj.totalPrice = responseJson.price
             this.props.onChange(obj)
             this.setState({ count: qty ,cart:obj.cart})
           }

         }).catch((err)=>{
           this.setState({loader:false})
         })

   }else{
     this.props.onChange(obj)
     this.setState({ count: qty ,cart:null})
   }
 }

 increaseCart = ()=>{
   var selected = this.state.product
   if(this.state.user==null){
     this.props.navigation.navigate('LogInScreen')
     return
   }
   var obj = {productVariant:selected.variant_pk,store:this.state.store.pk,count:this.state.count+1,type:actionTypes.INCREASE_CART,}
   this.cartDataUpdate(obj)

   // var selected = this.state.product
   // if (this.state.count >= selected.stock) {
   //   // this.refs.toast.show('You cannot order more than '+ selected.stock);
   //   this.props.showtoast('The product is SOLD OUT, it will be back soon')
   //   return;
   // }
   // // if (this.state.count >= selected.maxQtyOrder) {
   // //   this.refs.toast.show('You cannot order more then '+ selected.maxQtyOrder);
   // //   ToastAndroid.show('You cannot order more then ' + selected.maxQtyOrder, ToastAndroid.SHORT);
   // //   return;
   // // }
   //
   // var image = '/media/'+selected.image
   // var imageSel = selected.image.length>0?image:null
   // var totalPrice = selected.sellingPrice
   // var taxRate = this.state.details.taxRate
   // var gstType = this.state.details.gstType
   // var taxPrice = 0
   // if(gstType=='gst_extra'&&taxRate!=null){
   //   totalPrice = totalPrice+(totalPrice*taxRate)/100
   //   taxPrice = (selected.sellingPrice*taxRate)/100
   // }
   // if(taxRate==null){
   //   taxRate = 0
   // }
   // var obj = {product:selected.parent_pk,taxRate:taxRate,totalPrice:totalPrice,taxPrice:taxPrice,productVariant:selected.variant_pk,store:this.state.store.pk,count:this.state.count,type:actionTypes.INCREASE_CART,customizable:null,sellingPrice:selected.sellingPrice,mrp:selected.sellingPrice,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:null,minQtyOrder:selected.minQtyOrder,dp:imageSel,displayName:selected.name,user:this.state.user,cart:this.state.cart,bulkChart:null,discountedPrice:selected.sellingPrice}
   // this.cartUpdate(obj,'increase')



 }


   cartDataUpdate=(obj)=>{

     var sessionid =  this.state.sessionid;
     var csrf = this.state.csrf;

      console.log(obj.count,'jjjjjjjjjjjjjjjj');
       var data = {
         productVariant:obj.productVariant,
         store:obj.store,
         qty:obj.count
        }
        this.setState({cartLoader:true})
          fetch(SERVER_URL +'/api/POS/cartService/' , {
           method: 'POST',
           headers:{
             "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
           },
           body: JSON.stringify(data)
         })
           .then((response) => {
             console.log(response.status,'ptjhujthiop');
             if(response.status==201||response.status==200){
               return response.json()
             }else{
               return undefined
             }
           })
           .then((responseJson) => {
             this.setState({cartLoader:false})
             console.log(responseJson,'ptjhujthiop');
               if(responseJson!=undefined){
                 if(responseJson.msg.length>0){
                   this.refs.toast.show(responseJson.msg)
                 }
                 obj.pk = responseJson.pk
                 obj.count = responseJson.qty
                 this.setState({inCart : responseJson.qty})
                 if(responseJson.qty==0){
                   obj.type = 'delete'
                 }
                 this.props.onChange(obj)
                 this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
               }
           }).catch((err)=>{
             this.setState({cartLoader:false})
           })


   }

   postServiceCart = (obj)=>{

     var sessionid =  this.state.sessionid;
     var csrf = this.state.csrf;

       this.setState({cartLoader:true})
       var data = {
         productVariant:obj.productVariant,
         store:obj.store,
         qty:obj.count,
        }
         fetch(SERVER_URL +'/api/POS/cartService/' , {
           method: 'POST',
           headers:{
             "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
           },
           body: JSON.stringify(data)
         })
           .then((response) => {
             if(response.status==201||response.status==200){
               return response.json()
             }else{
               return undefined
             }
           })
           .then((responseJson) => {
             this.setState({cartLoader:false})
             if(responseJson!=undefined){
               if(responseJson.msg.length>0){
                 this.refs.toast.show(responseJson.msg)
               }
               obj.pk = responseJson.pk
               obj.count = responseJson.qty
               this.setState({inCart : responseJson.qty})
               this.props.onChange(obj)
               this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
             }

           }).catch((err)=>{
             this.setState({cartLoader:false})
           })

   }


 decreaseCart = ()=>{
   var selected = this.state.product
   if(this.state.user==null){
     this.props.navigation.navigate('LogInScreen')
     return
   }
   var obj = {productVariant:selected.variant_pk,store:this.state.store.pk,count:this.state.count-1,type:actionTypes.DECREASE_FROM_CART,}
   this.cartDataUpdate(obj)
   // var selected = this.state.product
   //
   // if (this.state.count <= selected.minQtyOrder) {
   //     this.setState({count:0})
   // }
   // var image = '/media/'+selected.image
   // var imageSel = selected.image.length>0?image:null
   // var totalPrice = selected.sellingPrice
   // var taxRate = this.state.details.taxRate
   // var gstType = this.state.details.gstType
   // var taxPrice = 0
   // if(gstType=='gst_extra'&&taxRate!=null){
   //   totalPrice = totalPrice+(totalPrice*taxRate)/100
   //   taxPrice = (selected.sellingPrice*taxRate)/100
   // }
   // if(taxRate==null){
   //   taxRate = 0
   // }
   // var obj = {product:selected.parent_pk,taxRate:taxRate,totalPrice:totalPrice,taxPrice:taxPrice,productVariant:selected.variant_pk,store:this.state.store.pk,count:this.state.count,type:actionTypes.DECREASE_FROM_CART,customizable:null,sellingPrice:selected.sellingPrice,mrp:selected.sellingPrice,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:null,minQtyOrder:selected.minQtyOrder,dp:imageSel,displayName:selected.name,user:this.state.user,cart:this.state.cart,bulkChart:null,discountedPrice:selected.sellingPrice}
   //
   // if(obj.count>selected.minQtyOrder){
   //   this.cartUpdate(obj,'decrease')
   // }else{
   //   this.removeCart(obj)
   // }
 }

 removeCart=(obj)=>{
   var sessionid =  this.state.sessionid;
   const csrf = this.state.csrf;

   if(obj.user != null){
     fetch(SERVER_URL +'/api/POS/cart/'+obj.cart+'/' , {
       method: 'DELETE',
       headers:{
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
       },
     })
       .then((response) => {
         if(response.status==201||response.status==200||response.status==204){
           obj.type ='delete'
           this.props.onChange(obj)
           return
         }
         })
       .then((responseJson) => {
         return
       })
   }else{
     obj.type ='delete'
     this.props.onChange(obj)
   }
 }


  render() {

   var themeColor = this.props.store.themeColor


    return (
    <Card containerStyle={[{ width: width,margin:0,padding:5}]}>
        <TouchableOpacity style={{flex:1,flexDirection:'row',marginVertical:3}} onPress={()=>{this.gotoDetails()}}>
          <View style={{flex:0.2}}>
            <Image source={{uri:SERVER_URL+'/media/'+this.state.product.image}} style={{width:width*0.2,height:width*0.2,resizeMode:'contain'}} />
          </View>
          <View style={{flex:0.8,marginLeft:10,marginTop:10}}>
            {this.state.bundle&&
            <MonoText   style={{ color: '#000', fontWeight: '700',  textAlign: 'left', fontSize: 15 }} > {this.state.name}</MonoText>
            }
            {!this.state.bundle&&
            <MonoText   style={{ color: '#000', fontWeight: '700',  textAlign: 'left', fontSize: 15 }} > {this.state.name}</MonoText>
            }
            <View style={{}}>
              {!this.state.bundle&&
                <View style={{flexDirection:'row'}}>
                  <MonoText   style={{fontSize:16,color:'grey',textDecorationLine: 'line-through', textDecorationStyle: 'solid'}}> &#8377;{this.state.product.price}</MonoText>
                  <MonoText   style={{fontSize:16,color:'#000',fontWeight: '600'}}> &#8377;{this.state.product.sellingPrice}</MonoText>
                </View>
              }
              {this.state.bundle&&
                <View style={{flex:1,flexDirection:'row',marginTop:5,}}>
                <View style={{flex:1,}}>
                   <MonoText   style={{fontSize:18,color:'grey',fontWeight: '600'}}> &#8377;{this.state.product.sellingPrice}</MonoText>
                </View>
                <View style={{flex:1,alignItems: 'flex-end',justifyContent: 'flex-end',marginRight:10}}>
                {!this.state.cartLoader&&this.state.count==0&&
                  <TouchableOpacity style={{backgroundColor:themeColor,marginLeft:5,alignItems: 'center',height:25,paddingHorizontal:10,justifyContent: 'center'}} onPress={()=>{this.addToCartUpdate()}} >
                    <MonoText   style={{color:'#fff' , fontSize : 13,fontWeight:'700'}}> Add To Cart </MonoText>
                  </TouchableOpacity>
                }
                {this.state.cartLoader&&
                  <View style={{backgroundColor:'#fff',marginLeft:5,alignItems: 'center',height:25,width:100,paddingHorizontal:10,justifyContent: 'center'}} >
                    <ActivityIndicator size={20} color={themeColor} />
                  </View>
                }

                {!this.state.cartLoader&&this.state.count>0&&
                  <View style={{backgroundColor:'#fff',alignItems: 'flex-end',justifyContent: 'center',marginLeft:5}} >
                  <View style={{height:25,flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                  <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:themeColor,height:'100%',alignItems: 'center',justifyContent: 'center'}} onPress={() => {this.decreaseCart()}} >
                  <MonoText   style={{color:'#fff' , fontSize : 15,fontWeight:'700'}}>-</MonoText>
                  </TouchableOpacity>
                  <View style={{paddingHorizontal:10,height:'100%',alignItems: 'center',justifyContent: 'center'}}>
                  <MonoText   style={{color:'#000' , fontSize : 13,fontWeight:'700'}}> {this.state.count}</MonoText>
                  </View>
                  <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:themeColor,height:'100%',alignItems: 'center',justifyContent: 'center'}} onPress={() => {this.increaseCart()}} >
                  <MonoText   style={{color:'#fff' , fontSize : 15,fontWeight:'700'}}>+</MonoText>
                  </TouchableOpacity>
                  </View>
                  </View>
                }
                {/*this.state.product.stock==null&&
                  <View style={{backgroundColor:'red',alignItems: 'center',height:25,justifyContent: 'center',}}>
                  <MonoText   style={{ color:'#fff' , fontSize : 13,fontWeight:'700' }}>SOLD OUT</MonoText>
                  </View>
                */}
                </View>
                </View>
             }
            </View>
          </View>
        </TouchableOpacity>
    </Card>
    );
  }

}

const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
})
