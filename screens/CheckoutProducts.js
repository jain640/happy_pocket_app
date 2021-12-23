import * as React from 'react';
import { StatusBar ,View,FlatList,TouchableWithoutFeedback,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import { Card ,CheckBox} from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { FontAwesome,Ionicons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import ImageOverlay from "react-native-image-overlay";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { RadioButton } from 'react-native-paper';
import TextLoader from '../components/TextLoader';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const storeType = settings.storeType
const priceTitle = settings.priceTitle
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import { NavigationActions } from 'react-navigation';
import Modal from "react-native-modal";
import NetInfo from '@react-native-community/netinfo';
import { MonoText } from '../components/StyledText';
import { Modalize } from 'react-native-modalize';
import ModalBox from 'react-native-modalbox';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'




class CheckoutProducts extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Cart Items',

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTintColor: '#fff',
    }
  };

  constructor(props) {
    super(props);


this.state = {
    cartItems : [],
    houseNumber : "",
    Society : "",
    pincode : "",
    city : "",
    state : "",
    sessionid:'',
    userpk:null,
    loader:true,
    addressList : [],
    primaryAddress:props.selectedAddress,
    csrf:'',
    webview:false,
    paymenturl:'',
    customizationList:[],
    customize:false,
    instruction:'',
    selectedImage:null,
    selectedCartIndex:null,
    selectedCustomizePk:null,
    store:props.store,
    disabled:false,
    selectedLandmark:props.selectedLandmark,
    checked: 'COD',
    shippingPrice:0,
    selectedStore:props.selectedStore,
    cartLoader:false,
    selectedIndex:null,
    showModal:false,
    loader:true
  };
  willFocus = props.navigation.addListener(
   'didFocus',
     payload => {
        // this.getInitial()
        this.checkLandmark()
        this.getWaiverCharge()
       }
  );
}
getWaiverCharge=()=>{


  if(storeType == 'MULTI-OUTLET'){
    console.log(SERVER_URL + '/api/POS/getShippingPrice/?landmarkid='+this.state.selectedLandmark.pk,'waivervu');
    var url = SERVER_URL + '/api/POS/getShippingPrice/?landmarkid='+this.state.selectedLandmark.pk
    fetch(url).then((response) => response.json())
    .then((responseJson) => {
      if(responseJson!=undefined){
        console.log(responseJson,'waivereeeeeedefefef');
        if(responseJson.avialDeliveryWaiver>0){
          console.log('cameee');
          this.setState({waiverCharge:responseJson.avialDeliveryWaiver})
          // this.timer = setTimeout(() => {
           this.setState({showModal:true})
          // }, 1000);

          // this.modalizeRef.open()
        }
      }
    })
    .catch((error) => {
      return
    });
  }
}

renderModal1=()=>{
  if(storeType=='MULTI-OUTLET'){
     return(
       <ModalBox isOpen={this.state.showModal}
       onClosed={()=>{this.setState({attachOpen:false})}}
       style={{height:width*0.4}}>
           <View style={{}}>
           <View style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:'green'}}>
                <MonoText style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Free Delivery</MonoText>
           </View>
           <View style={{flex:1,justifyContent:'center',height:width*0.4-45,marginHorizontal:15,alignItems:'center'}}>
               <MonoText style={{fontSize:17,fontWeight:'700',color:'grey',textAlign:'center'}}>Add &#8377;{Math.round(this.state.waiverCharge)} to your Cart to avail free Delivery!</MonoText>
           </View>
           </View>
           </ModalBox>

     )
  }else{
    return null
  }
  // <ModalBox ref={(ref) =>{this.modalizeRef = ref}} modalStyle={styles.content__modal}
  // alwaysOpen={0}
  // modalHeight={width*0.4}
  // onBackButtonPress={()=>this.modalizeRef.close()}
  // withHandle={false}>
  //     <View style={{}}>
  //     <View style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:'green'}}>
  //          <MonoText style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Free Delivery</MonoText>
  //     </View>
  //     <View style={{flex:1,justifyContent:'center',height:width*0.4-45,marginHorizontal:15,alignItems:'center'}}>
  //         <MonoText style={{fontSize:17,fontWeight:'700',color:'grey',textAlign:'center'}}>Add &#8377;{Math.round(this.state.waiverCharge)} to your Cart to avail free Delivery!</MonoText>
  //     </View>
  //     </View>
  //     </ModalBox>
}


getUnit=(type,value)=>{
 if(value!=null){
   var newValue = value
   if (type == 'Litre') {
     unit = 'L'
     return newValue+' '+unit
   }else if (type == 'Millilitre') {
     if(newValue>=1000){
       unit = 'L'
       newValue = newValue/1000
       if(newValue % 1 != 0){
         newValue = (newValue/1000).toFixed(1)
       }
     }else{
       unit = 'ml'
     }
      return newValue+' '+unit
   }else if (type == 'Gram') {
     if(newValue>=1000){
       unit = 'kg'
       newValue = newValue/1000
       if(newValue % 1 != 0){
         newValue = (newValue/1000).toFixed(1)
       }
     }else{
       unit = 'gm'
     }
      return newValue+' '+unit
   }else if (type == 'Kilogram') {
     unit = 'kg'
      return newValue+' '+unit
   }else if (type == 'Quantity') {
     unit = 'Qty'
      return newValue+' '+unit
   }else{
     unit = type
      return unit+' '+newValue
   }
   return unit+' '+newValue
 }else{
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

}

getInitial=async()=>{
  var pk =  await AsyncStorage.getItem('userpk');
  var login =  await AsyncStorage.getItem('login');
  var sessionid =  await AsyncStorage.getItem('sessionid');
  var csrf = await AsyncStorage.getItem('csrf');
   this.setState({userpk:pk,sessionid:sessionid,csrf:csrf});
  if(pk!=null&&JSON.parse(login)){
    console.log('rrrrrrrrr');

    this.setState({loader:true})
  await fetch(SERVER_URL + '/api/POS/getAllCart/?user='+pk+'&store='+this.state.selectedStore.pk,{
    headers: {
       "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL,
       'X-CSRFToken': csrf
    }
  })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson,'lllllllll');
      var count = 0
      if(responseJson!=undefined){
        var arr = responseJson.cartObj.map((item)=>{
          if(item.productVariant.images.length>0){
            var image = '/media'+item.productVariant.images[0].attachment.split('/media')[1]
          }else{
            var image = null
          }
            count += item.qty
            var unit = this.getUnit(item.productVariant.unitType,item.productVariant.value)
            var nameeDisplay = item.product.name+' '+unit
            var obj = {nameDisplay:nameeDisplay,product:item.product.pk,productVariant:item.productVariant.pk,store:item.store,count:item.qty,type:'GET_CART',customizable:item.productVariant.customizable,taxRate:item.product.taxRate,sellingPrice:item.sellingPrice,mrp:item.productVariant.price,stock:item.productVariant.stock,discount:item.price-item.sellingPrice,maxQtyOrder:item.productVariant.maxQtyOrder,minQtyOrder:item.productVariant.minQtyOrder,dp:image,displayName:item.productVariant.displayName,user:pk,cart:item.pk,bulkChart:item.bulk,
            discountedPrice:item.sellingPrice,totalPrice:item.price,addon:item.addon,customDetails:item.customDetails,customFile:item.customFile,is_fav:item.is_fav,is_changed:item.is_changed,taxPrice:item.taxPrice,addonPrice:item.addonPrice,bulkDiscount:item.bulkDiscount,promoValue:item.promoValue,  }
            return obj
        })
        this.setState({cartItems:arr})

      }

      this.setState({loader:false})
    })
    .catch((error) => {
      this.setState({loader:false})
      return
    });
  }else{
    this.setState({loader:false})
  }
}

renderModal=()=>{
  if(storeType=='MULTI-OUTLET'){
     return(
       <ModalBox
         style={{height:width*0.45,borderTopLeftRadius:15,borderTopRightRadius:15}}
         position={'bottom'}
         ref={'attachModal'}
         isOpen={this.state.showModal}
         onClosed={()=>{this.setState({showModal:false})}}>
           <View style={{}}>
           <View style={{height:45,alignItems:'center',justifyContent:'center',backgroundColor:themeColor,borderTopLeftRadius:15,borderTopRightRadius:15}}>
                <MonoText style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Free Delivery</MonoText>
           </View>
           <View style={{justifyContent:'center',height:width*0.45-45,marginHorizontal:15,alignItems:'center'}}>
               <MonoText style={{fontSize:18,fontWeight:'600',color:'#000',textAlign:'center'}}>Add
               <Text style={{fontSize:18,fontWeight:'600',color:'#f00',textAlign:'center',}}> &#8377;{Math.round(this.state.waiverCharge)} </Text>to your cart to avail free delivery!</MonoText>
           </View>
           </View>
           </ModalBox>
     )
  }else{
    return null
  }
}

checkLandmark =()=>{
  var checked = 'COD'
  if(this.props.selectedLandmark!=null){
    this.setState({selectedLandmark:this.props.selectedLandmark})
    if(!this.props.selectedLandmark.isCod){
      checked = 'Card'
    }
  }
  this.setState({checked:checked,})
}

// getShipphingCharge=()=>{
//   var total = 0
//   nextProps.cart.forEach((i)=>{
//     total += i.count*i.sellingPrice
//   })
//   var addressPk = null
//   if(nextProps.selectedAddress.pk!=undefined){
//     addressPk = nextProps.selectedAddress.pk
//   }
//   this.setState({cartItems:nextProps.cart})
//   if(total>0){
//     var url = SERVER_URL + '/api/POS/getShippingPrice/?addressid='+addressPk+'&amount='+total
//     fetch(url).then((response) => response.json())
//     .then((responseJson) => {
//       this.setState({shippingPrice:responseJson.shippingPrice})
//     })
//     .catch((error) => {
//       return
//     });
//   }else{
//     this.setState({shippingPrice:0})
//   }
// }

componentWillReceiveProps(nextProps){

    // if(this.props.cart!=nextProps.cart){
    //   this.getWaiverCharge()
    // }
}



  userAsync = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf});
      console.log(sessionid,csrf,'ooooooooo');

      fetch(SERVER_URL + '/api/ecommerce/address/?user='+ userToken , {
        headers: {
           "Cookie" :"sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL
        }
      }).then((response) => response.json())
        .then((responseJson) => {

          this.setState({ addressList: responseJson})
          for (var i = 0; i < this.state.addressList.length; i++) {
            if(this.state.addressList[i].primary){
                this.props.selectedAddressFunction(this.state.addressList[i])
            }
          }

          // this.setState({ loader: false})

        })
        .catch((error) => {
          return
        });




    } catch (error) {
      return
    }
  };

 getUserDetails=async()=>{
   const userToken = await AsyncStorage.getItem('userpk');
   const sessionid = await AsyncStorage.getItem('sessionid');
   const csrf = await AsyncStorage.getItem('csrf');
   this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf});
 }

  checkCustomize = async()=>{
    let customize =await AsyncStorage.getItem('customize')
    customize = JSON.parse(customize)
    if(customize!=null){
      this.setState({customizationList:customize})
    }
  }

  componentWillUnmount=()=>{
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  setSelected=(i,cartIdx)=>{
    this.setState({instruction:i.text,selectedImage:i.image,selectedCartIndex:cartIdx,selectedCustomizePk:i.customizePk})
    this.modalShow(true)
  }

  renderView=(cart,cartIdx)=>{
    for (var j = 0; j < this.state.customizationList.length; j++) {
      var i = this.state.customizationList[j]
      if(cart.varient == i.varient &&cart.pk == i.parent){
        return(
          <TouchableOpacity onPress={()=>this.setSelected(i,cartIdx)} style={{backgroundColor: themeColor,alignSelf: 'flex-start',paddingVertical: 5,paddingHorizontal: 5}}>
          <MonoText   style={{  color: '#fff', marginTop: 1, fontSize: 14 }}>View Customization </MonoText>
           </TouchableOpacity>
        )
      }
    }
  }

  handleConnectivityChange = (state) => {
       if(state.isConnected){
          this.setState({connectionStatus : true})
       }else{
         this.setState({connectionStatus : false})
       }
};

  componentDidMount() {
    this.getInitial()
    // this.getUserDetails()
    this.props.navigation.setParams({
      themeColor: this.state.store.themeColor,
    });

    // this.setState({ loader: false})
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

  }

  pincodeChanged = (pincode)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }

      if(pincode.length ==6){

      fetch(SERVER_URL + '/api/ecommerce/genericPincode/?pincode__iexact=' + pincode)
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ state: responseJson[0].state , city : responseJson[0].city})
        })
        .catch((error) => {
          return
        });
        this.setState({pincode: pincode})
      }
  }
  componentDidUpdate(prevProps){

      AsyncStorage.setItem('cart', JSON.stringify(this.state.cartItems));
      if(prevProps.cart !== this.props.cart) {
        // this.setState({cartItems: this.props.cart});
        this.getInitial()
      }
      if(prevProps.selectedAddress !== this.props.selectedAddress) {
        this.setState({primaryAddress: this.props.selectedAddress});
      }
  }

  decreaseCart = (item,idx)=>{
    this.setState({selectedIndex:idx})
    if(!this.state.connectionStatus){
      this.showNoInternet()
      this.setState({disabled:false,selectedIndex:false,cartLoader:false})
      return
    }
    var decreaseObj = {productVariant:item.productVariant,store:item.store,count:item.count-1,type:actionTypes.DECREASE_FROM_CART,}
    this.cartDataUpdate(decreaseObj,idx)
    return
    // this.setState({disabled:true})
    // if(item.count == item.minQtyOrder){
    //   this.removeCart(item,idx)
    // }else{
    //   this.cartUpdate(item,idx,'decrease')
    //
    // }

  }
  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  increaseCart = (item,idx)=>{

    this.setState({selectedIndex:idx})
    if(!this.state.connectionStatus){
      this.showNoInternet()
      this.setState({disabled:false,selectedIndex:null,cartLoader:false})
      return
    }
    var increaseObj = {productVariant:item.productVariant,store:item.store,count:item.count+1,type:actionTypes.INCREASE_CART,}
    this.cartDataUpdate(increaseObj,idx)
    return
    // this.setState({disabled:true})
    // if (item.count >= item.stock) {
    //   this.refs.toast.show('You cannot order more than ' + item.count)
    //   // ToastAndroid.show('You cannot order more than ' + item.count, ToastAndroid.SHORT);
    //   this.setState({disabled:false,selectedIndex:null,cartLoader:false})
    //   return;
    // }
    // if (item.count >= item.maxQtyOrder) {
    //   this.refs.toast.show('You cannot order more than ' + item.count)
    //   // ToastAndroid.show('You cannot order more than ' + item.count, ToastAndroid.SHORT);
    //   this.setState({disabled:false,selectedIndex:null,cartLoader:false})
    //   return;
    // }
    // this.cartUpdate(item,idx,'increase')

  }
  removeItem = (item,idx)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      this.setState({selectedIndex:null,cartLoader:false})
      return
    }
    var decreaseObj = {productVariant:item.productVariant,store:item.store,count:0,type:'delete',}
    this.cartDataUpdate(decreaseObj,idx)
    // this.removeCart(item,idx)

  }





  findDiscount=(discountArr,qty)=>{
      if(discountArr==null){
        return 0
      }
      var arr = discountArr.map((item)=>{
        return item.qty
      })
     var dataa = arr.map((item)=>{
       return item
     })
     dataa.push(qty)
     var data = dataa.sort(function(a, b){return a-b;})
     var index = data.lastIndexOf(qty)
     if(index === 0){
       return null;
     }else if(index === data.length-1){
       return discountArr[arr.length-1].discount;
     }else{
       var min = index-1
       return discountArr[min].discount;
     }
  }


cartUpdate =(obj,idx,text)=>{
  var sessionid =  this.state.sessionid;
  var csrf = this.state.csrf;
  // return

  // if(obj.user != null){
    if(text=='increase'){
      var increaseObj = {productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:obj.count+1,type:actionTypes.INCREASE_CART,}
      this.cartDataUpdate(increaseObj)
      return
      // var data = {qty:obj.count+1}
      // var rateCount = obj.count+1
    }else{
      var obj = {productVariant:this.state.product.pk,store:this.state.selectedStore.pk,count:obj.count-1,type:actionTypes.INCREASE_CART,}
      this.cartDataUpdate(obj)
      return
      // var data = {qty:obj.count-1}
      // var rateCount = obj.count-1
    }
    // var discount =  this.findDiscount(obj.bulkChart,rateCount)
    // if(discount!=null){
    //   obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
    // }else{
    //   obj.discountedPrice = obj.sellingPrice
    // }
    this.setState({cartLoader:true})

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
            obj.totalPrice  = responseJson.price
            if(text=='decrease'){
              obj.count = obj.count +1
              this.props.decreaseFromCartFunction(obj);
              this.setState({disabled:false})
            }else{
              obj.count = obj.count -1
              this.props.increaseCartFunction(obj)
              this.setState({disabled:false})
            }
          }
            this.setState({cartLoader:false,selectedIndex:null})
        }).catch((err)=>{
          this.setState({cartLoader:false,selectedIndex:null})
        })

  // }else{
  //   if(text=='increase'){
  //     var data = {qty:obj.count+1}
  //     var discount =  this.findDiscount(obj.bulkChart,obj.count+1)
  //     if(discount!=null){
  //       obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
  //     }else{
  //       obj.discountedPrice = obj.sellingPrice
  //     }
  //     this.props.increaseCartFunction(this.state.cartItems[idx])
  //     this.setState({disabled:false,selectedIndex:null,cartLoader:false})
  //
  //   }else{
  //     var data = {qty:obj.count-1}
  //     var discount =  this.findDiscount(obj.bulkChart,obj.count-1)
  //     if(discount!=null){
  //       obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
  //     }else{
  //       obj.discountedPrice = obj.sellingPrice
  //     }
  //     this.props.decreaseFromCartFunction(this.state.cartItems[idx]);
  //     this.setState({disabled:false,selectedIndex:null,cartLoader:false})
  //
  //   }
  // }
}

removeCart=(obj,idx)=>{

  var sessionid =  this.state.sessionid;
  var csrf = this.state.csrf;

  var decreaseObj = {productVariant:obj.productVariant,store:obj.store,count:0,type:'delete',}
  this.cartDataUpdate(decreaseObj,idx)
  return

  console.log(sessionid,csrf,'kkkkkkkk');
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
        console.log(this.state.connectionStatus,'kkkkkkkkkkk');

        if(response.status==201||response.status==200||response.status==204){

          this.props.removeItemFunction(obj)
          this.setState({disabled:false})
          return
        }
        })
      .then((responseJson) => {
        this.setState({cartLoader:false,selectedIndex:null})
        return
      }).catch((err)=>{
        this.setState({cartLoader:false,selectedIndex:null})
      })
  }else{
    this.props.removeItemFunction(obj)
    this.setState({disabled:false,selectedIndex:null,cartLoader:false})
  }
}



uploadCustomization=()=>{
  var formData  = new FormData();
  let filename = this.state.selectedImage.split('/').pop();
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;

  const photo = {
    uri: this.state.selectedImage,
    type: type,
    name:filename,
  };
  formData.append('image', photo);
  formData.append('data', this.state.instruction);
  fetch(SERVER_URL + '/api/ecommerce/customization/'+this.state.selectedCustomizePk+'/', {
    method: 'PATCH',
    headers:{
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    body: formData
  })
    .then((response) => {
      if(response.status==201||response.status==200){
        return response.json()
      }else{
        return undefined
      }
    })
    .then((responseJson) => {

      var arr = this.state.customizationList

      arr.forEach((item)=>{
        if(responseJson.pk == item.customizePk){
          item.text = responseJson.data
          item.image = responseJson.image
        }
      })
      AsyncStorage.setItem('customize', JSON.stringify(arr));
      this.setState({customize:false,instruction:''.data,selectedImage:null,selectedCustomizePk:null,selectedCartIndex:null,})
    })
    .catch((error) => {
      return
    });
}

  removeCustomization=()=>{

  }

  cartDataUpdate=(obj,idx)=>{

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
            this.setState({cartLoader:false,selectedIndex:null})
            console.log(responseJson,'ptjhujthiop');
              if(responseJson!=undefined){
                if(responseJson.msg.length>0){
                  this.refs.toast.show(responseJson.msg)
                }
                obj.pk = responseJson.pk
                obj.count = responseJson.qty
                var cartItems = this.state.cartItems
                console.log(idx,'ttttttttttt');
                cartItems[idx].count = responseJson.qty
                console.log(cartItems[idx].count,'kkkkkkkkkkkkkkk');
                this.setState({cartItems:cartItems})
                if(responseJson.qty==0){
                  obj.type = 'delete'
                  cartItems.splice(idx,1)
                  this.setState({cartItems : cartItems})
                  this.props.removeItemFunction(obj)
                  this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
                  return
                }
                if(obj.type==actionTypes.INCREASE_CART){
                  this.props.increaseCartFunction(obj)
                }else{
                  this.props.decreaseFromCartFunction(obj);
                }
                this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
              }
          }).catch((err)=>{
            this.setState({cartLoader:false,selectedIndex:null})
          })


  }



  render() {
   const { navigation } = this.props;

   var themeColor = this.props.store.themeColor
   var totalCount = 0;
   var totalValue = 0;
   var totalDiscount = 0;

   for (var i = 0; i < this.state.cartItems.length; i++) {
       totalValue += this.state.cartItems[i].totalPrice;
       totalCount += this.state.cartItems[i].count;
       totalDiscount += (this.state.cartItems[i].mrp-this.state.cartItems[i].sellingPrice) *  this.state.cartItems[i].count;
   }
   // totalValue = totalValue + this.state.shippingPrice
   // totalValue = totalValue - this.state.discountedPrice
   // totalDiscount = totalDiscount + this.state.discountedPrice


    return (

      <View  style={{flex:1,backgroundColor:'#fff'}} >
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position='top'/>

      {this.state.loader&&
          <View  style={{flex:1,alignItems:'center',justifyContent:'center'}} >
              <ActivityIndicator size={'large'} color={themeColor} />
          </View>
      }


        {!this.state.loader&&
        <View   style={{flex:1,paddingBottom:storeType=='MULTI-OUTLET'?110:45}} >

             {this.renderModal()}
            <View style={{flex:1,backgroundColor:'#fff' }}>
              {/*<MonoText   style={{ color: '#000',  fontSize: 15,margin:10 }}><FontAwesome name="shopping-cart" size={20} color="grey" />  Cart </MonoText>*/}
              <FlatList
                style={{ flex:1,marginBottom: 0,paddingLeft:10, paddingRight:10,}}
                data={this.state.cartItems}
                keyExtractor={(item,index) => {
                  return index.toString();
                }}
                scrollEnabled = {true}
                renderItem={({item, index, separators}) =>{
                  if(this.state.selectedIndex!=null&&index==this.state.selectedIndex){
                    var check = true
                  }else{
                    check = false
                  }
                 return(

                      <View style={{ flex: 1, alignItems: 'flex-start', paddingTop: 10,backgroundColor:'#fff' }}>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10,paddingBottom:10 }} >
                          <TouchableOpacity onPress={()=>this.removeItem(item,index)} style={{justifyContent: 'center', alignItems: 'flex-start', height:60,width:20, marginLeft:20 ,borderWidth:0,borderRadius:10,zIndex: 100,borderColor:'grey'}}>
                            <FontAwesome name="trash-o" size={20} />
                          </TouchableOpacity>
                          <View style={{ width:width*0.2 }}>
                            <Image source={{ uri: SERVER_URL+item.dp }} style={{ width: 60, height: 60, alignSelf: 'center' }} />
                          </View>


                          <View style={{flex:0.5,width:width*0.4}}>
                            <MonoText   style={{ color: '#000',  marginTop: 2, fontSize: 15, }}>{item.nameDisplay}</MonoText>

                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 5 }}>
                              <MonoText style={{ color: '#000',  marginTop: 1, fontSize: 14 ,paddingRight:10,borderRightWidth:1,borderRightColor:'#000'}}>&#8377;{Math.round(item.sellingPrice)}</MonoText>
                              <MonoText style={{ color: 'grey', marginTop: 1, fontSize: 14 , paddingRight:10,borderRightWidth:1,marginLeft:10,borderRightColor:'#000'}}>&#8377;{Math.round(item.mrp)}</MonoText>
                              <MonoText style={{ color: 'red', marginTop: 1, fontSize: 14 , paddingRight:10,marginLeft:10}}><MonoText style={{color:'red'}}>Save</MonoText> &#8377;{Math.round(item.mrp-item.sellingPrice)}</MonoText>
                            </View>
                            
                            {/*<MonoText   style={{ color: themeColor, marginTop: 1, fontSize: 14 }}>{priceTitle} &#8377;{Math.round(item.sellingPrice)}
                             <MonoText   style={{textDecorationLine: 'line-through', color: '#a2a2a2',}}> &#8377;{item.mrp}</MonoText>
                            </MonoText>*/}
                              {/*<MonoText   style={{ color: '#a2a2a2',}}>(&#8377;{item.sellingPrice} + {item.taxRate}% GST)</MonoText>*/}
                            {this.renderView(item,index)}
                          </View>
                          {!check&&<View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width:width*0.1,}}>
                          <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25, paddingTop:3,marginTop:10, marginLeft:20}}>


                              <TouchableOpacity onPress={()=>{this.decreaseCart(item,index )}} >
                                <View style={{width:25, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
                                  <MonoText   style={{textAlign: 'center',  color:'white'}} >-</MonoText>
                                </View>
                              </TouchableOpacity>

                              <View style={{minWidth:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2,paddingHorizontal:2}}>
                                <MonoText   style={{textAlign: 'center',color:'#000' }} >{item.count}</MonoText>
                              </View>

                              <TouchableOpacity onPress={()=>this.increaseCart(item,index)} >
                                <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
                                  <MonoText   style={{textAlign: 'center',  color:'white'}} >+</MonoText>
                                </View>
                              </TouchableOpacity>

                            </View>

                          </View>
                        }

                          {check&&this.state.cartLoader&&
                            <View style={{ flex: 0.4, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width:width*0.1,marginTop:20}}>
                              <ActivityIndicator size={20} color={themeColor} />
                            </View>
                          }


                        </View>

                      </View>
                    )
                }}
               />
              </View>
           </View>
         }

           {!this.state.loader&&
           <View style={{position:'absolute',right:0,bottom:0,left:0,height:110}}>
             <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 0,marginHorizontal:10,paddingHorizontal:3,height:60,paddingTop:5,marginBottom:5,backgroundColor:'#fff' }]}>

               <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
                 <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15, }}>Total Items</MonoText>
                 <MonoText   style={{  color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}>{this.props.counter}</MonoText>
               </View>

               <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
                 <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15,marginLeft:10 }}>Saved </MonoText>
                 <MonoText   style={{  color: 'red', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {Math.round(this.props.saved)}</MonoText>
               </View>


               <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
                 <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15,marginLeft:10 }}>Total</MonoText>
                 <MonoText   style={{  color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {Math.round(this.props.totalAmount)}</MonoText>
               </View>

            </View>
               <TouchableOpacity onPress={()=>{this.props.navigation.navigate('checkoutScreen')}} style={{alignItems:'center',justifyContent:'center',height:45,backgroundColor:themeColor}}>
                 <MonoText   style={{color:'#fff', fontSize:16,}}>PROCEED FOR CHECKOUT</MonoText>
               </TouchableOpacity>
           </View>
         }
         {!this.state.loader&&storeType!='MULTI-OUTLET'&&
         <View style={{position:'absolute',right:0,bottom:0,left:0,height:45}}>
             <TouchableOpacity onPress={()=>{this.props.navigation.navigate('checkoutScreen')}} style={{alignItems:'center',justifyContent:'center',height:45,backgroundColor:themeColor}}>
               <MonoText   style={{color:'#fff', fontSize:16,}}>PROCEED FOR CHECKOUT</MonoText>
             </TouchableOpacity>
         </View>
         }
      </View>
    )

  }
}


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    totalAmount:state.cartItems.totalAmount,
    saved:state.cartItems.saved,
    selectedAddress : state.cartItems.selectedAddress,
    store:state.cartItems.store,
    selectedLandmark:state.cartItems.selectedLandmark,
    selectedStore:state.cartItems.selectedStore,
    masterStore:state.cartItems.masterStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address)),
    setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutProducts);



const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10
  },
  shadow: {
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchcontainer: {
    backgroundColor: 'red',
  },
  shadow: {
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content__modal: {
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 6 },
   shadowOpacity: 3.84,
   shadowRadius: 16,
 },

})

// <View style={{flex:0.1,  flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 10,paddingVertical:10,paddingHorizontal:3,backgroundColor:'#fff',paddingBottom:10 , }}>
//   <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
//     <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Total Items</MonoText>
//     <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}>{totalCount}</MonoText>
//   </View>
//
//   <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
//     <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Saved </MonoText>
//     <MonoText   style={{ color: 'red', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {totalDiscount}</MonoText>
//   </View>
//
//   <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
//     <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Delivery</MonoText>
//     <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {this.state.shippingPrice}</MonoText>
//   </View>
//   <View style={{ flex: 1,alignItems:'center',justifyContent:'center' }}>
//     <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Total</MonoText>
//     <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {totalValue}</MonoText>
//   </View>
// </View>
//
