import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity,AsyncStorage, FlatList, Alert, Button,ScrollView,ToastAndroid,ActivityIndicator,TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import * as actionTypes from '../actions/actionTypes'
import { connect } from 'react-redux';
import cartItems from '../reducers/cartItems'
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from './StyledText';
const SERVER_URL = settings.url
const themeColor = settings.themeColor

export default class SearchCard extends React.Component {

  constructor(props) {
    super(props);

      var prod = props.product;
      var items = props.cartItems;
      var unitType = prod.name.split(' ')
      if(unitType[unitType.length-2]!=undefined){
        var type= unitType[unitType.length-2]
        if (type == 'Litre') {
          unit = 'L'
        }else if (type == 'Millilitre') {
          unit = 'ml'
        }else if (type == 'Gram') {
          unit = 'gm'
        }else if (type == 'Kilogram') {
          unit = 'kg'
        }else if (type == 'Quantity') {
          unit = 'Qty'
        }else{
          unit = unitType[unitType.length-2]
        }
      }
      unitType[unitType.length-2] = unit

      var varientChoices = [unit + " " + unitType[unitType.length-1]]


      var splitName  = prod.name.split(' ')
      splitName.splice(splitName.length-2,2)
      var name = ''
      splitName.forEach((i,idx)=>{
        if(idx!=splitName.length){
          name += i+' '
        }else{
          name += i
        }
      })


    this.state = {
      select: prod.howMuch + " " + unit,
      quantity: 1,
      product : props.product,
      varientChoices : varientChoices,
      inCart : 0,
      mrp : prod.price,
      salePrice : prod.sellingPrice,
      discount :prod.price-prod.sellingPrice ,
      inStock:prod.stock,
      dp : SERVER_URL + '/media/' +  prod.visual,
      name : name,
      unit : unit,
      howMuch : unitType[unitType.length-1],
      selectedPk : prod.subProd,
      selectedIndex : 0,
      sku : props.product.serialNo,
      cartItems:items,
      type:props.product.typ,
      maxOrder : props.product.maxQtyOrder,
      minOrder : props.product.minQtyOrder,
      store:props.store,
      selectedStore:props.selectedStore,
      displayName:prod.name,
      user:null,
      csrf:null,
      sessionid:null,
      cartPk:null,
      cartLoader:false,
    }
  }


  getUser=async()=>{
    var login =  await AsyncStorage.getItem('login');
    if(JSON.parse(login)){
      var pk =  await AsyncStorage.getItem('userpk');
      var csrf =  await AsyncStorage.getItem('csrf');
      var sessionid =  await AsyncStorage.getItem('sessionid');
      this.setState({user:pk,csrf:csrf,sessionid:sessionid})
    }
  }


  componentDidMount() {
    this.getUser()
    if(this.state.cartItems.length >= 1){
      var check = false
      for (var i = 0; i < this.state.cartItems.length; i++) {
        // if(this.state.cartItems[i].store == this.state.selectedStore.pk&&this.state.cartItems[i].product==this.state.product.parent&&this.state.cartItems[i].productVariant==this.state.product.pk){
        //   this.setState({inCart:this.state.cartItems[i].count,cartPk:this.state.cartItems[i].cart})
        //   check = true
        // }
        console.log(this.state.cartItems[i]);
        if(this.state.cartItems[i].pk==this.state.product.pk){
          this.setState({inCart:this.state.cartItems[i].count})
          check = true
        }
    }
    if(!check){
      this.setState({inCart:0,cartPk:null})
    }
  }
  }


  componentWillReceiveProps({cartItems}){

    console.log('kkkk');
    var check = false
    cartItems.forEach((item,idx)=>{
      // if(item.store==this.state.selectedStore.pk&&item.product==this.state.product.parent&&item.productVariant == this.state.product.pk ){
      //       this.setState({inCart:item.count,cartPk:item.cart})
      //       check = true
      // }
      if(item.pk == this.state.product.pk ){
            this.setState({inCart:item.count})
            check = true
      }
    })
    if(!check){
      this.setState({inCart:0,cartPk:null})
    }
   this.getUser()

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

  // addToCartUpdate =()=>{
  //
  //   if(this.state.inStock<=this.state.minOrder){
  //     this.refs.toast.show('The product is SOLD OUT, it will be back soon');
  //     return;
  //   }
  //   var obj = {product:this.state.product.parent,productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:this.state.minOrder,
  //     type:actionTypes.ADD_TO_CART,sellingPrice:this.state.salePrice,mrp:this.state.mrp,
  //     stock:this.state.inStock,discount:this.state.discount,maxQtyOrder:this.state.maxOrder,
  //     minQtyOrder:this.state.minOrder,dp:this.state.dp,displayName:this.state.displayName,user:this.state.user,
  //     cart:null,bulkChart:this.state.product.discountMatrix,discountedPrice:this.state.salePrice,customizable:this.state.product.customizable,taxRate:0,taxPrice:0,totalPrice:this.state.salePrice}
  //   this.postCart(obj,this.state.minOrder)
  // }
  addToCartUpdate =()=>{
    if(this.state.user==null){
      this.props.navigation.navigate('LogInScreen')
      return
    }
    var obj = {productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:this.state.minOrder,type:actionTypes.ADD_TO_CART,}
    this.postServiceCart(obj)
  }

  postCart = (obj,inCart)=>{
    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    console.log(obj.user,'user addddd');
    if(obj.user != null){
      this.setState({cartLoader:true})
      var data = {
        product:obj.product,
        productVariant:obj.productVariant,
        store:obj.store,
        qty:obj.count,
       }

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

              this.setState({inCart : responseJson.qty})
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
              obj.addonPrice = responseJson.addonPrice
              obj.bulkDiscount = responseJson.bulkDiscount
              obj.promoValue = responseJson.promoValue
              obj.totalPrice = responseJson.price
              obj.taxRate = responseJson.product.taxRate
              this.props.onChange(obj)
              this.setState({inCart : responseJson.qty,cartPk:responseJson.pk})
            }
           this.setState({cartLoader:false})
         }).catch((err)=>{
           this.setState({cartLoader:false})
         })

    }else{
      // obj.count = obj.count
      obj.cart = obj.cart
      this.setState({inCart:obj.count})
      this.props.onChange(obj)
      this.setState({inCart : obj.count})
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
       this.setState({cartLoader:true})
      var data = {
        qty:qty,
       }
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
              obj.addonPrice = responseJson.addonPrice
              obj.bulkDiscount = responseJson.bulkDiscount
              obj.promoValue = responseJson.promoValue
              obj.totalPrice = responseJson.price
              obj.taxRate = responseJson.product.taxRate
              this.props.onChange(obj)
              this.setState({ inCart: responseJson.qty })
            }
             this.setState({cartLoader:false})
          }).catch((err)=>{
             this.setState({cartLoader:false})
          })

    }else{
      this.props.onChange(obj)
      // var varientCount = this.state.varientCount;
      // varientCount[this.state.selectedIndex] = qty
      this.setState({ inCart: qty  })
    }
  }

  increaseCart = ()=>{
    if(this.state.user==null){
      this.props.navigation.navigate('LogInScreen')
      return
    }
    var obj = {productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:this.state.inCart+1,type:actionTypes.INCREASE_CART,}
    this.cartDataUpdate(obj)

    // if (this.state.inCart >= this.state.inStock) {
    //   this.refs.toast.show('You cannot order more than '+ this.state.inCart);
    //   return;
    // }
    // if (this.state.inCart >= this.state.maxOrder) {
    //   this.refs.toast.show('You cannot order more than '+ this.state.inCart);
    //   return;
    // }
    // var obj = {product:this.state.product.parent,productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:this.state.inCart,
    //   type:actionTypes.INCREASE_CART,customizable:this.state.product.customizable,sellingPrice:this.state.salePrice,mrp:this.state.mrp,
    //   stock:this.state.inStock,discount:this.state.discount,maxQtyOrder:this.state.maxOrder,
    //   minQtyOrder:this.state.minOrder,dp:this.state.dp,displayName:this.state.displayName,user:this.state.user,
    //   cart:this.state.cartPk,bulkChart:this.state.product.discountMatrix,discountedPrice:this.state.salePrice,taxRate:0,taxPrice:0,totalPrice:Number(this.state.salePrice)*(Number(this.state.inCart)+1)}
    // this.cartUpdate(obj,'increase')



  }


  decreaseCart = ()=>{
    if(this.state.user==null){
      this.props.navigation.navigate('LogInScreen')
      return
    }
    var obj = {productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:this.state.inCart-1,type:actionTypes.DECREASE_FROM_CART,}
    this.cartDataUpdate(obj)

    // if (this.state.minQtyOrder!=undefined&&this.state.inCart <= this.state.minQtyOrder) {
    //     var incart = 0
    // }else{
    //   var incart = this.state.inCart
    // }
    //
    //
    // var obj = {product:this.state.product.parent,productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:incart,
    //   type:actionTypes.DECREASE_FROM_CART,customizable:this.state.product.customizable,sellingPrice:this.state.salePrice,mrp:this.state.mrp,
    //   stock:this.state.inStock,discount:this.state.discount,maxQtyOrder:this.state.maxOrder,
    //   minQtyOrder:this.state.minOrder,dp:this.state.dp,displayName:this.state.displayName,user:this.state.user,
    //   cart:this.state.cartPk,bulkChart:this.state.product.discountMatrix,discountedPrice:this.state.salePrice,taxRate:0,taxPrice:0,totalPrice:this.state.salePrice*(this.state.inCart-1)}
    //
    // // if(this.state.minQtyOrder!=undefined&&obj.count<= this.state.minQtyOrder){
    // //   this.removeCart(obj)
    // // }else{
    // //   this.cartUpdate(obj,'decrease')
    // // }
    // if(obj.count>this.state.minOrder&&obj.count>0){
    //   console.log(obj.count,'update');
    //   this.cartUpdate(obj,'decrease')
    // }else{
    //   console.log(obj.count,'delete');
    //   this.removeCart(obj)
    // }


  }

  removeCart=(obj)=>{
    var sessionid =  this.state.sessionid;
    const csrf = this.state.csrf;

    if(obj.user != null){
       this.setState({cartLoader:true})
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
            return 'success'
          }else{
            return undefined
          }
          })
        .then((responseJson) => {
           this.setState({cartLoader:false})
          if(responseJson!=undefined){
            obj.type ='delete'
            this.setState({inCart:0})
            this.props.onChange(obj)
            return
          }
           this.setState({cartLoader:false})
        }).catch((err)=>{
           this.setState({cartLoader:false})
        })
    }else{
      obj.type ='delete'
      this.setState({inCart:0})
      this.props.onChange(obj)
    }
  }








  render() {
     const color = this.props.store.themeColor
     const themeColor = this.props.store.themeColor


    let cartActions=(this.state.cartLoader?<View style={{width: width * 0.16, height: 27, alignItems:'center',marginTop:15,justifyContent:'center'}}><ActivityIndicator size={20} color={themeColor} /></View>:( this.state.inCart == 0 ?  <TouchableOpacity style={{height: 40,marginTop:15,paddingRight:0}} onPress={this.addToCartUpdate}>
      <View style={{width:70,paddingHorizontal:10}}>
      <MonoText>
      <FontAwesome name="plus" size={14} color={color} />
      <FontAwesome name="shopping-cart" size={32} color={color} />
      </MonoText>
      </View>
    </TouchableOpacity>:(

        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 26,paddingTop:15}}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{width:25, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, justifyContent:'center',alignItems:'center'}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{minWidth:25,paddingHorizontal:2, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, justifyContent:'center',alignItems:'center'}}>
            <MonoText   style={{textAlign: 'center'}} >{this.state.inCart}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, justifyContent:'center',alignItems:'center'}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText>
            </View>
          </TouchableOpacity>



        </View>
      )))



    return (
      <View style={{flex:1,width:width,}}>
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <ScrollView style={{flex:1,}}>

          <Card  containerStyle={[styles.shadow, {  marginTop: 10, marginBottom: 10,padding:0,borderWidth:0 }]}>
          <TouchableWithoutFeedback onPress={()=>{if(!this.state.store.quickadd){this.props.gotoDetails(this.state.product.parent)}}}>
            <View style={{flex:1,flexDirection: 'row',justifyContent: 'center',alignItems: 'flex-start',paddingBottom:10}}>
              <View style={{flex:0.3,alignItems:'flex-start',paddingTop:5}}>
              { this.state.dp == null ||this.state.dp == 'undefined' ||this.state.dp == ''   &&
                <MonoText   style={{fontSize:14,color:"#000"}}>Image Not Found </MonoText>
              }
              { this.state.dp != null &&
                <Image style={{width:'80%',height:width*0.3,resizeMode:'contain'}} source={{uri: this.state.dp}} />
              }
              </View>

                <View style={{flex:0.5,alignItems:'flex-start',justifyContent:'flex-start',paddingTop:width*0.03,}}>
                  <MonoText   style={{fontSize:14,color:"#000"}}>{this.state.displayName} </MonoText>
                  <MonoText   style={{ textAlign: 'left', color: '#a2a2a2' }}>MRP : &#8377;{this.state.mrp}</MonoText>
                  <MonoText   style={{ textAlign: 'left', color: themeColor }}>Happy Price : &#8377;{Math.round(this.state.salePrice)}</MonoText>

                  </View>
              <View style={{flex:0.2,alignItems:'flex-end',justifyContent:'flex-start',width:width*0.02,paddingRight:width*0.03,paddingTop:width*0.03}}>
              <View style={{flexWrap:'nowrap', justifyContent: 'center', alignItems: 'center',paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderColor: themeColor, borderRadius: 3, }}>
              <MonoText   style={{ textAlign: 'center', color: 'red' }}>Save</MonoText>
              <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{Math.round(this.state.discount)}</MonoText>
              </View>
              { this.state.inStock < 1 &&
                <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:10, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 3, backgroundColor: 'red' }}>SOLD OUT</MonoText>
              }
              { this.state.inStock >= 1 &&
                cartActions
              }

              </View>
            </View>
          </TouchableWithoutFeedback>
          </Card>

          </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({

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
