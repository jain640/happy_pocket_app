import React from 'react';
import { StatusBar, ScrollView, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, AsyncStorage, ToastAndroid,Platform ,TouchableWithoutFeedback} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { MonoText } from './StyledText';
const { width } = Dimensions.get('window');
const height = width * 0.8

import { connect } from 'react-redux';
import cartItems from '../reducers/cartItems'
// import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const items = [{
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
]

export default class ProductViewV2 extends React.Component {




  constructor(props) {
    super(props);
    var prod = props.product;

    const varientChoices = []
    const varientChoicesName = []
    var listofPk = []
    var stock = []
    listofPk[0] = null
    var varientCount = []
    var image = SERVER_URL +prod.image
    var variantCheck = false

    if(props.store.quickadd){
      if(prod.variant==undefined){
      var select = prod.name
      var salePrice = prod.sellingPrice
      var discount = prod.price - prod.sellingPrice
      var mrp = prod.price
      var maxOrder = null
      var sku = null
      var unit = null
      var unitPerpack = null
      image = SERVER_URL+'/media/'+prod.image
    }else{
    for (var i = 0; i < prod.variant.length; i++) {
      listofPk.push(prod.variant[i].pk)
      stock.push(prod.variant[i].stock)
      varientChoices.push(prod.variant[i].displayName)
      if(prod.variant[i].displayName!=null){
        varientChoicesName.push(prod.variant[i].displayName.replace(prod.name,''))
      }else{
        varientChoicesName.push(prod.variant[i].displayName)

      }
      varientCount.push(0)
      if(i==0&&prod.variant[i].images.length>0){
        image = prod.variant[i].images[0].attachment
      }
    }
   }
  }
    if(props.store.quickadd){
      if(prod.variant!=undefined){
        variantCheck = true
      if(prod.variant[0]==undefined){
        var select = null
        var salePrice = null
        var discount = null
        var mrp = null
        var maxOrder = null
        var sku = null
        var unit = null
        var unitPerpack = null
      }else{
        var select = prod.variant[0].displayName
        var salePrice = prod.variant[0].sellingPrice
        var discount = prod.variant[0].price-prod.variant[0].sellingPrice
        var mrp = prod.variant[0].price
        var maxOrder = prod.variant[0].maxQtyOrder
        var sku = prod.variant[0].sku
        var unit = prod.variant[0].unitType
        var unitPerpack = prod.variant[0].displayName
      }
    }
    }
    if(!props.store.quickadd){
       var select = prod.name
       var salePrice = prod.sellingPrice
       var discount = prod.price - prod.sellingPrice
       var mrp = prod.price
       var maxOrder = null
       var sku = null
       var unit = null
       var unitPerpack = null
       image = SERVER_URL+'/media/'+prod.image
    }

    this.state = {
      select: select,
      quantity: 1,
      product : props.product,
      varientChoices : varientChoices,
      inCart : 0,
      pkList:listofPk,
      mrp : mrp,
      stock:stock,
      inStock:stock[0],
      salePrice : salePrice,
      discount : discount,
      dp : image,
      maxOrder : maxOrder,
      selectedPk : null,
      selectedIndex : 0,
      varientCount : varientCount,
      selectedQty: 1,
      sku : sku,
      unit:unit,
      unitPerpack:unitPerpack,
      store:this.props.store,
      varientChoicesName:varientChoicesName,
      variantCheck:variantCheck
    }
  }




    componentWillReceiveProps({cartItems}){
      if(this.state.variantCheck){
      const varientCount = this.state.varientCount;
      for (var i = 0; i < varientCount.length; i++) {
        varientCount[i] = 0
      }
      cartItems.forEach((item,idx)=>{
        if(item.store==this.state.store.pk&&item.product==this.state.product.pk){
          this.state.product.variant.forEach((i,id)=>{
            if(item.productVariant == i.pk ){
              varientCount[id] = cartItems[idx].count
            }
          })
        }
      })
      this.setState({varientCount:varientCount})
      this.setState({inCart:this.state.varientCount[this.state.selectedIndex]})
    }
    }
  componentDidMount() {
    // this.reloadCart()

  }


  dropDownChanged = (itemValue, itemIndex) => {

    var image = this.state.product.image
    var varient = this.state.product.variant[itemIndex]

    if(varient.images.length>0){
      var image = varient.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : varient.price , salePrice : varient.sellingPrice , discount : varient.price-varient.sellingPrice, selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : varient.sku,unit:varient.unitType,unitPerpack:varient.displayName,inStock:this.state.stock[itemIndex]})
    this.setState({ select: itemValue })
  }
  dropDownChangedIos = (itemValue, itemIndex) => {
    if(itemIndex == -1){
      itemIndex = 0
    }
    this.setState({ select: itemValue })
    var image = this.state.product.image
    var varient = this.state.product.variant[itemIndex]

    if(varient.images.length>0){
      var image = varient.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : varient.price , salePrice : varient.sellingPrice , discount : varient.discount, selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : varient.sku,unit:varient.unitType,unitPerpack:varient.displayName,inStock:this.state.stock[itemIndex]})
    this.setState({ select: itemValue })
  }



  addToCartUpdate =()=>{
    this.setState({inCart : 1})
    var varientCount = this.state.varientCount;
    var selectCount = varientCount[this.state.selectedIndex]
    varientCount[this.state.selectedIndex]= 1

    var selected = this.state.product.variant[this.state.selectedIndex]

    var image = selected.images.length>0?selected.images[0].attachment:null

    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.ADD_TO_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:null,bulkChart:null,discountedPrice:selected.sellingPrice}

    this.postCart(obj,varientCount)
  }
  postCart = (obj,varientCount)=>{
    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    if(obj.user != null){
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
              obj.cart = responseJson.pk
              this.setState({inCart : obj.count})
              obj.cart = responseJson.pk
              obj.count = obj.count
              this.props.onChange(obj)
              this.setState({varientCount : varientCount})
            }

          })

    }else{
      obj.count = 1
      obj.cart = obj.cart
      this.props.onChange(obj)
      this.setState({varientCount : varientCount})
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
              obj.cart = responseJson.pk
              obj.count = qty
              this.props.onChange(obj)
              var varientCount = this.state.varientCount;
              varientCount[this.state.selectedIndex] = qty
              this.setState({ inCart: qty , varientCount : varientCount })
            }

          })

    }else{
      this.props.onChange(obj)
      var varientCount = this.state.varientCount;
      varientCount[this.state.selectedIndex] = qty
      this.setState({ inCart: qty , varientCount : varientCount })
    }
  }

  increaseCart = ()=>{

    // if (this.state.inCart == this.state.maxOrder) {
    //   this.refs.toast.show('You cannot order more then '+ this.state.inCart);
      // ToastAndroid.show('You cannot order more then ' + this.state.inCart, ToastAndroid.SHORT);
    //   return;
    // }
    var selected = this.state.product.variant[this.state.selectedIndex]
    var image = selected.images.length>0?selected.images[0].attachment:null
    var varientCount = this.state.varientCount;

    // this.props.onChange({product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:parseInt(this.state.selectedQty),customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,type:actionTypes.INCREASE_CART,displayName:selected.displayName})

    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.INCREASE_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:this.state.varientCart[this.state.selectedIndex],bulkChart:null,discountedPrice:selected.sellingPrice}
    this.cartUpdate(obj,'increase')



  }
  // increaseCart = ()=>{
  //
  //   if (this.state.inCart == this.state.maxOrder) {
  //     this.refs.toast.show('You cannot order more then '+ this.state.inCart);
  //     // ToastAndroid.show('You cannot order more then ' + this.state.inCart, ToastAndroid.SHORT);
  //     return;
  //   }
  //   var selected = this.state.product.variant[this.state.selectedIndex]
  //   var image = selected.images.length>0?selected.images[0].attachment:null
  //
  //   this.props.onChange({product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:parseInt(this.state.selectedQty),customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,type:actionTypes.INCREASE_CART,displayName:selected.displayName})
  //
  //   var varientCount = this.state.varientCount;
  //   varientCount[this.state.selectedIndex] = this.state.inCart+1
  //   this.setState({ inCart: this.state.inCart+1 , varientCount : varientCount })
  //
  // }

  decreaseCart = ()=>{
    var selected = this.state.product.variant[this.state.selectedIndex]
    var image = selected.images.length>0?selected.images[0].attachment:null
    // this.props.onChange({product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:parseInt(this.state.selectedQty),customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,type:actionTypes.DECREASE_CART,displayName:selected.displayName})
    var varientCount = this.state.varientCount;
    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.store.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.DECREASE_FROM_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:this.state.varientCart[this.state.selectedIndex],bulkChart:null,discountedPrice:selected.sellingPrice}

    if(obj.count>1){
      this.cartUpdate(obj,'decrease')
    }else{
      this.removeCart(obj)
    }

    // var varientCount = this.state.varientCount;
    // varientCount[this.state.selectedIndex] = this.state.inCart-1
    // this.setState({ inCart: this.state.inCart-1,  varientCount : varientCount})

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
    const {inCart} = this.state;
    var themeColor = this.props.store.themeColor
    // let varientChoices = this.state.varientChoices.map( (s, i) => {
    //     return <Picker.Item key={i} value={s} label={s} style={{width:width*0.4}} />
    // });
    let varientChoicesName = this.state.varientChoicesName.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s} style={{width:0.04,height:25}} />
    });



    let varientChoicesIos = this.state.varientChoices.map( (s, i) => {
       return {label:s,value:s}
    });



    let cartActions=( this.state.inCart == 0 ?  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ borderWidth: 1, borderColor: themeColor, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, }}>
            <MonoText   style={{ color: '#fff', fontSize: 12, width: width * 0.1, height: 25, paddingVertical: 4, paddingLeft: 3, backgroundColor: themeColor, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }}>Qty</MonoText>
          </View>
          { Platform.OS === 'ios' &&


          <Dropdown
           data={items}
           onChangeText={(itemValue, itemIndex) => this.setState({ selectedQty: itemValue })}
           containerStyle={{height: 27,width: width * 0.26,borderTopRightRadius: 4,
           borderBottomRightRadius: 4,borderColor: themeColor,borderWidth: 1,}}
           inputContainerStyle={{paddingLeft:6,padding:4,   paddingTop:-10,fontSize: 12, height: 27, width: width * 0.26,borderWidth: 0,borderColor: themeColor,borderTopRightRadius: 4,
           borderBottomRightRadius: 4,
           color: '#000', }}
           value={this.state.selectedQty}
          pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
         />

          }
          { Platform.OS === 'android' &&
          <View style={{ borderWidth: 1, borderColor: themeColor}}>

            <Picker
              selectedValue={this.state.selectedQty}
              mode="dropdown"
              style={{ height: 25, width: width * 0.26, }}
              onValueChange={(itemValue, itemIndex) => this.setState({ selectedQty: itemValue })}>
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
            </Picker>
          </View>
        }
          <View style={{ width: width * 0.16, marginLeft: width * 0.02, borderWidth: 1, borderColor: themeColor, }}>
            <TouchableOpacity style={{}} onPress={this.addToCartUpdate}>
              <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', height: 25, paddingVertical: 4, paddingHorizontal: 2, backgroundColor: themeColor }}>+ <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
            </TouchableOpacity>
          </View>

        </View> :(

        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25,paddingTop:3}}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{width:50, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{width:95, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2}}>
            <MonoText   style={{textAlign: 'center'}} >{this.state.inCart}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{width:50, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText>
            </View>
          </TouchableOpacity>
        </View>
      ))


    return (

      <Card containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, width: width * 0.6, marginTop: 10, marginBottom: 5, paddingTop: 5 }]}>
        <View >
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <TouchableWithoutFeedback onPress={()=>{if(this.state.variantCheck) return;this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}}>
          <View style={{ height: 40 }}>
            <MonoText   style={{ color: "#000", alignSelf: 'center', fontWeight: '700', fontSize: 15 }} numberOfLines={2} > {this.state.select}</MonoText>
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>{if(this.state.variantCheck) return;this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}}>
          <View>
            <Image source={{ uri: this.state.dp }} style={{ width: width * 0.4, height: width * 0.4, alignSelf: 'center' }} />
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>{if(this.state.variantCheck) return;this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}}>
          <View style={{ marginTop: 10, padding: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: width * 0.8, flex: 1 }}>
              <MonoText   style={{ textAlign: 'left', color: '#a2a2a2' }}>MRP &#8377;{this.state.mrp}</MonoText>
              <MonoText   style={{ textAlign: 'left', color: themeColor }}>Happy Price &#8377;{this.state.salePrice}</MonoText>
            </View>
            <View style={{ padding: 5, paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderColor: themeColor, borderRadius: 3, }}>
              <MonoText   style={{ textAlign: 'center', color: 'black' }}>Save</MonoText>
              <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{this.state.discount}</MonoText>
            </View>
          </View>

          </TouchableWithoutFeedback>
          {this.state.variantCheck&&
          <View style={{ marginTop: 10, padding: 0, height: 35, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ borderWidth: 1, borderColor: themeColor, width: width * 0.55 }}>
            { Platform.OS === 'ios' &&
            <Dropdown

             data={varientChoicesIos}
             onChangeText={(itemValue, itemIndex)=>this.dropDownChangedIos(itemValue, itemIndex-1)}
             containerStyle={{height: 27, width: width * 0.55,}}
             inputContainerStyle={{paddingLeft:6,padding:4,   paddingTop:-10,fontSize: 12, height: 27, width: width * 0.55,borderWidth: 0,borderColor: themeColor,borderTopRightRadius: 4,
             borderBottomRightRadius: 4,
             color: '#000',}}
             value={this.state.select}
            pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
           />

            }
            { Platform.OS === 'android' &&

              <Picker
                selectedValue={this.state.select}
                mode="dropdown"
                style={{ height: 25, width: width * 0.55,opacity:1 }}
                onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                {varientChoicesName}
              </Picker>
            }
            </View>
          </View>
        }
          {this.state.variantCheck&&
          <View style={{ marginTop: 10, height: 25 }}>
          {this.state.inStock < 1 &&
            <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:0, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 3, backgroundColor: 'red' }}>SOLD OUT</MonoText>
          }
          {this.state.inStock >= 1 &&
          cartActions
          }

          </View>
        }

        </View>
      </Card>
    );


    return null;
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
  },
  scrollContainer: {

  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 27, width: width * 0.26,
    padding:0,
    marginTop:-1,
    paddingLeft:2,
    borderWidth: 1,
    borderColor: themeColor,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    color: '#000', // to ensure the text is never behind the icon
  },
});
const pickerVarientStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 27, width: width * 0.55,
    paddingLeft:3,
    color: '#000', // to ensure the text is never behind the icon
  },
});
