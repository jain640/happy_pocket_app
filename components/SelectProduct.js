import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform,TouchableWithoutFeedback,ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const priceTitle = settings.priceTitle
const themeColor = settings.themeColor
import { Dropdown } from 'react-native-material-dropdown-v2';
import { CustomPicker } from 'react-native-custom-picker';
import { MonoText } from './StyledText';
import Modal from "react-native-modal";


export default class SelectProduct extends React.Component {
  constructor(props) {
    super(props);
    var prod = props.product;
    var customUnit = ''
    const varientChoices = []
    const varientChoicesName = []
    const varientChoicesText = []
    var listofPk = []
    var stock = []
    listofPk[0] = null
    var varientCount = []
    var varientCart = []
    var varientMinOrderQty = []
    var varientMaxOrderQty = []
    var image = prod.image
    var value2 = []
    function getUnit(type){
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
        unit = type
      }
      return unit
    }

    for (var i = 0; i < prod.variant.length; i++) {
      listofPk.push(prod.variant[i].pk)
      stock.push(prod.variant[i].stock)
      varientMinOrderQty.push(prod.variant[i].minQtyOrder)
      varientMaxOrderQty.push(prod.variant[i].maxQtyOrder)
      varientChoices.push(prod.variant[i].displayName)
      if(prod.variant[i].displayName!=null){
        if(prod.variant[i].value!=null){
          var unit =
          varientChoicesText.push(prod.variant[i].value+' '+getUnit(prod.variant[i].unitType))
          }else{
            varientChoicesText.push(getUnit(prod.variant[i].unitType))
          }
      }else{
        varientChoicesText.push(getUnit(prod.variant[i].unitType))
      }
        if(prod.variant[i].displayName!=null){
        var showText = prod.variant[i].displayName.replace(prod.name,'')
      }else{
        var showText = ''
      }
        if(prod.variant[i].unitType == 'Size and Color'){
          var text =  prod.variant[i].value
          var color = prod.variant[i].value2
          if(value2.includes(text)){
            var id = value2.indexOf(text)
            if(color!=null){
              varientChoicesName[id].value2.push({color:color,index:i})
              varientChoicesName.push(null)
            }
          }else{
            if(color==null){
              var arr = []
            }else{
              var arr = [{color:color,index:i}]
            }
            varientChoicesName.push({unit:'Size',showText:showText,label:text,color:color,value:i,value2:arr})
            value2.push(text)
          }
          customUnit = 'Size and Color'
        }else{
          varientChoicesName.push({unit:prod.variant[i].unitType,showText:showText,label:prod.variant[i].displayName.replace(prod.name,''),color:'#000000',value:i,value2:null})
          customUnit = prod.variant[i].unitType
        }

      varientCount.push(0)
      varientCart.push(null)
      if(i==0&&prod.variant[i].images.length>0){
        var image = prod.variant[i].images[0].attachment
      }
    }

    if(prod.variant[0]==undefined){
       var select = null
       var selectName = null
       var salePrice = null
       var discount = null
       var mrp = null
       var maxOrder = null
       var minOrder = null
       var sku = null
       var unit = null
       var unitPerpack = null
    }else{
      var select = prod.variant[0].displayName
      if(prod.variant[0].value!=null){
        var selectName = prod.variant[0].value +' '+prod.variant[0].unitType
      }else{
        var selectName = prod.variant[0].unitType
      }
      var salePrice = prod.variant[0].sellingPrice
      var discount = prod.variant[0].price-prod.variant[0].sellingPrice
      var mrp = prod.variant[0].price
      var maxOrder = prod.variant[0].maxQtyOrder
      var minOrder = prod.variant[0].minQtyOrder
      var sku = prod.variant[0].sku
      var unit = prod.variant[0].unitType
      var unitPerpack = prod.variant[0].displayName
    }


    this.state = {
      select: select,
      selectName: selectName,
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
      dp : SERVER_URL +image,
      maxOrder : maxOrder,
      minOrder : minOrder,
      selectedPk : null,
      selectedIndex : 0,
      varientCount : varientCount,
      varientCart : varientCart,
      selectedQty: 1,
      sku : sku,
      unit:unit,
      unitPerpack:unitPerpack,
      store:props.store,
      selectedStore:props.selectedStore,
      varientChoicesName:varientChoicesName,
      varientChoicesText:varientChoicesText,
      user:null,
      sessionid:null,
      csrf:null,
      cartItems:props.cartItems,
      customUnit:customUnit,
      selectedIdx:0,
      colorIndex:0,
      modalVisible:false,
      edit:props.edit
    }
  }





  componentWillReceiveProps({cartItems}){
    const varientCount = this.state.varientCount;
    const varientCart = this.state.varientCart;
    for (var i = 0; i < varientCount.length; i++) {
      varientCount[i] = 0
    }
    cartItems.forEach((item,idx)=>{
      if(item.store==this.state.selectedStore.pk&&item.product==this.state.product.pk){
        this.state.product.variant.forEach((i,id)=>{
          if(item.productVariant == i.pk ){
            varientCount[id] = cartItems[idx].count
            varientCart[id] = cartItems[idx].cart
          }
        })
      }
    })
    this.setState({varientCount:varientCount,varientCart:varientCart})
    this.setState({inCart:this.state.varientCount[this.state.selectedIndex]})
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
  // componentDidMount() {
  //   this.getUser()
  // }

  dropDownChanged = (itemValue, itemIndex) => {

    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if(variant.images.length>0){
      var image = variant.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : variant.price , salePrice : variant.sellingPrice , discount : variant.price-variant.sellingPrice, selectedPk : variant.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : variant.sku,unit:variant.unitType,unitPerpack:variant.displayName,inStock:variant.stock})
    this.setState({maxOrder:variant.maxQtyOrder,minOrder:variant.minQtyOrder})
    this.setState({ select: this.state.varientChoices[itemIndex],selectName:itemValue})

    }
  changeParent = (itemValue, itemIndex)  =>{
    this.setState({selectedIdx:itemIndex})
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if(variant.images.length>0){
      var image = variant.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : variant.price , salePrice : variant.sellingPrice , discount : variant.price-variant.sellingPrice, selectedPk : variant.pk, selectedIndex : itemIndex , sku : variant.sku,unit:variant.unitType,unitPerpack:variant.displayName,inStock:this.state.stock[itemIndex]})
    this.setState({ select: this.state.varientChoices[itemIndex],selectName:itemValue,colorIndex:0})
  }
  changeItem = (colorIndex,itemIndex) => {

    this.setState({colorIndex:colorIndex})
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if(variant.images.length>0){
      var image = variant.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : variant.price , salePrice : variant.sellingPrice , discount : variant.price-variant.sellingPrice, selectedPk : variant.pk,  selectedIndex : itemIndex , sku : variant.sku,unit:variant.unitType,unitPerpack:variant.displayName,inStock:this.state.stock[itemIndex]})
    this.setState({ select: this.state.varientChoices[itemIndex] })

    }



  dropDownChangedIos = (itemValue, itemIndex) => {
    if(itemIndex == -1){
      itemIndex = 0
    }
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if(variant.images.length>0){
      var image = variant.images[0].attachment
    }
    this.setState({dp : SERVER_URL + image, mrp : variant.price , salePrice : variant.sellingPrice , discount : variant.price-variant.sellingPrice, selectedPk : variant.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : variant.sku,unit:variant.unitType,unitPerpack:variant.displayName,inStock:variant.stock})
    this.setState({maxOrder:variant.maxQtyOrder,minOrder:variant.minQtyOrder})
    this.setState({ select: itemValue })
  }


  addToCartUpdate =()=>{
    var selected = this.state.product.variant[this.state.selectedIndex]

    if (selected.stock<selected.minQtyOrder) {
      this.refs.toast.show('We have only '+ selected.stock+' pcs available right now');
      return;
    }


    var varientCount = this.state.varientCount;
    // this.setState({inCart :selected.minQtyOrder})
    var selectCount = varientCount[this.state.selectedIndex]
    varientCount[this.state.selectedIndex]= selected.minQtyOrder


    var image = selected.images.length>0?selected.images[0].attachment:null

    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.selectedStore.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.ADD_TO_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:null,bulkChart:null,discountedPrice:selected.sellingPrice}

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
              console.log(responseJson,'responseJson');
              obj.cart = responseJson.pk
              obj.count = obj.count
              this.setState({ inCart: obj.count , varientCount : varientCount })
              console.log(this.state.inCart,'incart asda');
              this.props.onChange(obj)
            }

          })

    }else{
      obj.count = obj.count
      obj.cart = obj.cart
      this.setState({ inCart: obj.count , varientCount : varientCount })
      this.props.onChange(obj)

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
              var varientCount = this.state.varientCount;
              varientCount[this.state.selectedIndex] = qty
              this.setState({ inCart: qty , varientCount : varientCount })
              this.props.onChange(obj)
            }

          })

    }else{
      var varientCount = this.state.varientCount;
      varientCount[this.state.selectedIndex] = qty
      this.setState({ inCart: qty , varientCount : varientCount })
      this.props.onChange(obj)
    }
  }

  increaseCart = ()=>{

    var selected = this.state.product.variant[this.state.selectedIndex]
    if (this.state.inCart >= selected.maxQtyOrder) {
      this.refs.toast.show('You cannot order more than '+ selected.maxQtyOrder);
      return;
    }
    if (this.state.inCart >= selected.stock) {
      this.refs.toast.show('We have only '+ selected.stock+' pcs available right now');
      return;
    }
    var image = selected.images.length>0?selected.images[0].attachment:null
    var varientCount = this.state.varientCount;


    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.selectedStore.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.INCREASE_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:this.state.varientCart[this.state.selectedIndex],bulkChart:null,discountedPrice:selected.sellingPrice}
    this.cartUpdate(obj,'increase')



  }


  decreaseCart = ()=>{
    var selected = this.state.product.variant[this.state.selectedIndex]

    if (this.state.inCart <= selected.minQtyOrder) {
        this.setState({inCart:0})
    }



    var image = selected.images.length>0?selected.images[0].attachment:null

    var varientCount = this.state.varientCount;
    var obj = {product:this.state.product.pk,productVariant:selected.pk,store:this.state.selectedStore.pk,count:varientCount[this.state.selectedIndex],type:actionTypes.DECREASE_FROM_CART,customizable:selected.customizable,sellingPrice:selected.sellingPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:this.state.user,cart:this.state.varientCart[this.state.selectedIndex],bulkChart:null,discountedPrice:selected.sellingPrice}

    if(obj.count>selected.minQtyOrder){
      this.cartUpdate(obj,'decrease')
    }else{
      this.removeCart(obj)
    }
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

  renderOption=(settings)=>{
    const { item, getLabel } = settings
    return (
      <View style={styles.optionContainer}>
        <View style={styles.innerContainer}>
          <View style={[styles.box, { backgroundColor: item.color }]} />
          <MonoText   style={{ color: item.color, alignSelf: 'flex-start' }}>{getLabel(item)}</MonoText>
        </View>
      </View>
    )
  }

  showHide=()=>{
    this.setState({modalVisible:!this.state.modalVisible})
  }

  navigate=()=>{
    if(!this.state.edit){
      this.props.navigation.navigate('CreateCoupon',{product:this.state.product})
    }else{
      this.props.navigation.state.params.onGoBack(this.state.product)
      this.props.navigation.goBack()
    }
  }

  render(){

    let varientChoicesText = this.state.varientChoicesText.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let varientChoicesName = this.state.varientChoicesName.map( (s, i) => {
      if(s!=null&&s!=undefined){
        return <Picker.Item key={i} value={s.showText} label={s.showText}  ></Picker.Item>
      }
    });

    var themeColor = this.props.store.themeColor

    let varientChoicesIos = this.state.varientChoices.map( (s, i) => {
       return {label:s,value:s}
    });
    let units = this.state.select
    let cartActions=( this.state.inCart == 0 ?
        <TouchableOpacity style={{}} onPress={this.addToCartUpdate}>
          <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center',width: width * 0.16, height: 25, paddingVertical: 4, paddingHorizontal: 2, backgroundColor: themeColor }}>+ <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
      </TouchableOpacity>:(

        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25,paddingTop:3}}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{width:25, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2}}>
            <MonoText   style={{textAlign: 'center'}} >{this.state.inCart}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText>
            </View>
          </TouchableOpacity>


        </View>
      ))


    return (

       <Card containerStyle={[{ width: width,  flex: 1,marginVertical:0 }]}>
        <View>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
          <TouchableWithoutFeedback onPress={()=>{this.navigate()}}>
            <View style={{ width: width * 0.36 }}>
              <Image source={{ uri: this.state.dp }} style={{ width: width * 0.3, height: width * 0.3, alignSelf: 'center' }} />
            </View>
            </TouchableWithoutFeedback>
            <View style={{ width: width * 0.64 }}>
            <TouchableWithoutFeedback onPress={()=>{this.navigate()}}>
              <View style={{ flex: 1, alignItems: 'flex-start', marginRight: 10 }}>
                <MonoText   style={{ color: '#000', fontWeight: '700', marginTop: 10, textAlign: 'left', fontSize: 15 }}> {this.state.select}</MonoText>
              </View>
              </TouchableWithoutFeedback>
              <View style={{ flex: 1, alignItems: 'flex-start', marginTop: 10, marginRight: 20 }}>
              <TouchableWithoutFeedback onPress={()=>{this.navigate()}}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
                  <View style={{ width: width * 0.27, paddingHorizontal: 3, paddingVertical: 2, borderWidth: 1, borderColor: themeColor, borderRadius: 3, marginRight: 10 }}>
                    <MonoText   style={{ textAlign: 'center', color: 'black' }}>Save</MonoText>
                    <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{Math.round(this.state.discount)}</MonoText>
                  </View>
                  <View >
                    <MonoText   style={{ color: '#a2a2a2', marginTop: 2, fontSize: 14 }}>MRP &#8377;{this.state.mrp}</MonoText>
                    <MonoText   style={{ color: themeColor, marginTop: 1, fontSize: 14 }}>{priceTitle} &#8377;{this.state.salePrice}</MonoText>
                  </View>
                </View>
                </TouchableWithoutFeedback>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10 }}>
                  <View style={{ borderWidth:this.state.customUnit=='Size and Color'?!this.state.store.quickadd?0:1:1, borderColor: themeColor, marginRight:this.state.customUnit=='Size'?!this.state.store.quickadd?0:10:10, }}>
                    { this.state.varientChoicesName.length <=1 && this.state.customUnit!='Size and Color'&&this.state.varientChoicesName[0]!=undefined&&
                      <MonoText   style={{ color: '#000',  fontSize: 16,width: this.state.store.quickadd?(width * 0.27):(width * 0.54) ,height:25,textAlign:'center',paddingHorizontal: 4}} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
                    }
                    {this.state.store.quickadd&&this.state.customUnit=='Size and Color'&&this.state.varientChoicesName.length <=1 &&this.state.varientChoicesName[0]!=undefined&&
                    <MonoText   style={{ color: '#000',  fontSize: 16,width:width * 0.27,height:25,textAlign:'center',paddingHorizontal: 4}} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
                    }
                    {this.state.store.quickadd&&this.state.customUnit=='Size and Color'&&this.state.varientChoices.length >1 &&
                    <Picker
                      selectedValue={this.state.selectName}
                      mode="dropdown"
                      style={{ flex:1,height:25, width:width * 0.27 }}
                      onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                      {varientChoicesText}
                    </Picker>
                    }

                    { !this.state.store.quickadd&&this.state.customUnit=='Size and Color'&&


                    <View style={{width:'100%'}}>
                      <View style={{flex:1}}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                          <View style={{flexDirection:'row',}}>
                            <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 5, paddingLeft: 0,marginBottom:10,paddingBottom:0,}}
                            data={this.state.varientChoicesName}
                            keyExtractor={(item,index) => {
                              return index.toString();
                            }}
                            extraData={this.state}
                            horizontal={true}
                            nestedScrollEnabled={true}
                            renderItem={({item, index}) => (
                              <View>
                              {item!=null&&
                                <TouchableOpacity onPress={()=>this.changeParent(item.showText, index)} style={{backgroundColor:this.state.selectedIdx==index?themeColor:'#fff',height:30,minWidth:40,marginRight:10,borderRadius: 5,borderWidth:1,borderColor:this.state.selectedIdx==index?themeColor:'grey',alignItems: 'center',justifyContent: 'center',paddingHorizontal: 10,}}>
                                <MonoText   style={{color:this.state.selectedIdx==index?'#fff':'grey'}}>{item.label}</MonoText>
                                </TouchableOpacity>
                              }
                              </View>
                            )}
                            />
                          </View>
                        </ScrollView>
                      </View>

                      <View style={{ flex:1}}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                          <View style={{}}>
                          {this.state.varientChoicesName[this.state.selectedIdx].value2!=null&&
                            <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 0 ,marginBottom:0,paddingBottom:0}}
                            data={this.state.varientChoicesName[this.state.selectedIdx].value2}
                            keyExtractor={(item,index) => {
                              return index.toString();
                            }}
                            extraData={this.state}
                            horizontal={true}

                            nestedScrollEnabled={true}
                            renderItem={({item, index}) => (
                              <View style={{justifyContent: 'center',height:30}}>
                              <TouchableOpacity onPress={()=>{this.changeItem(index,item.index)}} style={{backgroundColor: item.color,width:index==this.state.colorIndex?26:22,height:index==this.state.colorIndex?26:22,marginRight:20,borderRadius: index==this.state.colorIndex?13:11}}>
                              </TouchableOpacity>
                              </View>
                            )}
                            />
                          }
                          </View>
                        </ScrollView>
                      </View>
                     </View>

                    }

                    { (this.state.varientChoices.length >1&& Platform.OS === 'ios') &&
                        <Dropdown
                         data={varientChoicesIos}
                         onChangeText={(itemValue, itemIndex)=>this.dropDownChangedIos(itemValue, itemIndex-1)}
                         containerStyle={{
                           height:25
                         }}
                         inputContainerStyle={{
                           height:25,paddingLeft:6,padding:4, width: width * 0.27,  paddingTop:-10, borderWidth: 0,fontSize:16,backgroundColor:'#ffffff'
                         }}
                         value={this.state.select}
                        pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
                       />
                      }


                  { (this.state.customUnit!='Size and Color'&&this.state.varientChoices.length >1&& Platform.OS === 'android')  &&

                  <Picker
                    selectedValue={this.state.selectName}
                    mode="dropdown"
                    style={{ flex:1,height:25, width: this.state.store.quickadd?(width * 0.27):(width * 0.54) }}
                    onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                    {varientChoicesText}
                  </Picker>

                  }

                  </View>
                  {this.state.store.quickadd&&
                  <View>
                  { this.state.inStock < 1 &&
                    <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:10, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 5, backgroundColor: 'red' }}>SOLD OUT</MonoText>
                  }
                  { this.state.inStock >= 1 &&
                  cartActions
                  }
                  </View>
                }
                </View>
              </View>
            </View>
          </View>








         </View>
        </Card>

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
  },
  modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width-30 ,
     borderRadius:5,
    },
})

const pickerVarientStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 25, width: width * 0.30 ,
    paddingLeft:3,
    color: '#000',
    borderWidth: 1,
    borderColor:'red'// to ensure the text is never behind the icon
  },
});
