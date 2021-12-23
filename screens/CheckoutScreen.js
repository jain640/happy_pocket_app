import * as React from 'react';
import { StatusBar ,View,FlatList,NativeModules,LayoutAnimation,Picker,TouchableWithoutFeedback,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView ,Keyboard, KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import { Card ,CheckBox} from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { FontAwesome,Ionicons,AntDesign } from '@expo/vector-icons';
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
const storeType = settings.storeType
const themeColor = settings.themeColor
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import { NavigationActions } from 'react-navigation';
import Modal from "react-native-modal";
import NetInfo from '@react-native-community/netinfo';
import { MonoText } from '../components/StyledText';
import RazorpayCheckout from 'react-native-razorpay';
import { Dropdown } from 'react-native-material-dropdown-v2';

import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'




const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);


class CheckoutScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Checkout',

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
    cartItems : props.cart,
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
    discountedPrice:0,
    selectedStore:props.selectedStore,
    coupon:'',
    addressPk:null,
    couponDiscount:null,
    discussionData:'',
    quoteTime:'',
    status:'quote',
    keyboardOffset: 0,
    keyboardOpen : false,
    advance:0,
    cod:true,
    showError:false,
    discountObj:undefined,
    timeSlot:null,
    timeSlots:null,
    minimumOrdervalue:0,
    updateDetails:{placeorder:true},
    orderRetry:null,
    first_name:'',
    last_name:'',
    email:'',
    mobile:''
  };
  willFocus = props.navigation.addListener(
   'didFocus',
     payload => {
        // this.setCartItems()
        this.getUserInfo()
        this.setTimeSlot()
        this.getInitial()
        this.setState({loader:false})
       }
  );
  Keyboard.addListener(
  'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
   )
}

getUserInfo=async()=>{
  const userToken = await AsyncStorage.getItem('userpk');
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrf = await AsyncStorage.getItem('csrf');
  console.log(userToken,'userrrrrrcdaggsdgbsrrrrrrrrrrrrrr');
  if(userToken!=null){
    fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
      headers: {
         "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
      }
    }).then((response) => response.json())
      .then((responseJson) => {
         this.setState({first_name:responseJson.first_name,last_name:responseJson.last_name,email:responseJson.email,mobile:responseJson.profile.mobile})
      })
      .catch((error) => {
        return
      });
  }
}

addressAsync =async () => {
  try {
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf})

    var url = SERVER_URL + '/api/POS/address/?user='+ userToken+'&primary='+true

    if(userToken !== null ){
      fetch(url , {
        headers: {
          "Cookie" :"csrftoken="+this.state.csrf+"sessionid=" + this.state.sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': this.state.csrf
        },
        method: 'GET'
        })
        .then((response) =>{
          return response.json()
        } )
        .then((responseJson) => {
          if(responseJson[0]!=undefined){
            console.log(responseJson[0],'AddressServer');
            if(storeType == 'MULTI-OUTLET'){
              if(responseJson[0].landMarkAddress == this.state.selectedLandmark.pk){
                this.props.selectedAddressFunction(responseJson[0])
              }
            }else{
              this.props.selectedAddressFunction(responseJson[0])
            }
          }
        })
        .catch((error) => {
          return
        });
    }
  }catch(error){
    return
  }

};

setTimeSlot=()=>{
  // if(this.props.selectedLandmark!=null){
  //   if(this.props.selectedLandmark.timeSlots!=null&&this.props.selectedLandmark.timeSlots!=undefined){
  //   var timeSlots = this.props.selectedLandmark.timeSlots.split('||')
  //   this.setState({timeSlots:timeSlots,timeSlot:timeSlots[0]})
  // }
  // }
}

checkLandmark =()=>{
  var checked = this.state.checked
  if(this.props.selectedLandmark!=null){
    this.setState({selectedLandmark:this.props.selectedLandmark})
    if(!this.props.selectedLandmark.isCod){
      checked = 'Card'
    }
  }
  this.setState({checked:checked,cartItems:this.props.cart})
}

// getShipphingCharge=()=>{
  // var total = 0
  // nextProps.cart.forEach((i)=>{
  //   total += i.count*i.sellingPrice
  // })
//   var addressPk = null
//   if(nextProps.selectedAddress.pk!=undefined){
//     addressPk = nextProps.selectedAddress.pk
//     this.setState({addressPk:addressPk})
//   }
//   this.setState({cartItems:nextProps.cart})
//
//   if(addressPk!=null){
//     var url = SERVER_URL + '/api/POS/getShippingPrice/?coupon='+this.state.coupon+'&addressid='+addressPk
//   }else{
//     var url = SERVER_URL + '/api/POS/getShippingPrice/?coupon='+this.state.coupon
//   }
//   fetch(url).then((response) => response.json())
//   .then((responseJson) => {
//     this.setState({shippingPrice:responseJson.shippingPrice})
//   })
//   .catch((error) => {
//     return
//   });
//
// }

getInitial=async()=>{
  console.log('rrrrrrrrr');
  var pk =  await AsyncStorage.getItem('userpk');
  var login =  await AsyncStorage.getItem('login');
  var sessionid =  await AsyncStorage.getItem('sessionid');
  var csrf = await AsyncStorage.getItem('csrf');

  if(pk!=null&&JSON.parse(login)){
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
      var count = 0
      var arr = responseJson.cartObj.map((item)=>{
        if(item.productVariant.images.length>0){
          var image = '/media'+item.productVariant.images[0].attachment.split('/media')[1]
        }else{
          var image = null
        }
          count += item.qty
          var obj = {product:item.product.pk,productVariant:item.productVariant.pk,store:item.store,count:item.qty,type:'GET_CART',customizable:item.productVariant.customizable,taxRate:item.product.taxRate,sellingPrice:item.sellingPrice,mrp:item.productVariant.price,stock:item.productVariant.stock,discount:item.price-item.sellingPrice,maxQtyOrder:item.productVariant.maxQtyOrder,minQtyOrder:item.productVariant.minQtyOrder,dp:image,displayName:item.productVariant.displayName,user:pk,cart:item.pk,bulkChart:item.bulk,
          discountedPrice:item.sellingPrice,totalPrice:item.price,addon:item.addon,customDetails:item.customDetails,customFile:item.customFile,is_fav:item.is_fav,is_changed:item.is_changed,taxPrice:item.taxPrice,addonPrice:item.addonPrice,bulkDiscount:item.bulkDiscount,promoValue:item.promoValue,  }
          return obj
      })
      var promises = [];
      // this.props.setInitialFunction(arr,count)
      this.setState({cartItems:arr})
    })
    .catch((error) => {
      console.log('df');
      return
    });
  }
}

async componentWillReceiveProps(nextProps){
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrf = await AsyncStorage.getItem('csrf');
  this.setState({sessionid:sessionid,csrf:csrf});

    var addressPk = null
    if(nextProps.selectedAddress.pk!=undefined){
      addressPk = nextProps.selectedAddress.pk
      this.setState({addressPk:addressPk})
    }

    await fetch(SERVER_URL + '/api/POS/getShippingPrice/?coupon='+this.state.coupon+'&addressid='+addressPk,{
      method: 'GET',
      headers:{
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }}).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson,'hhhhhhhhhhhhhhhhhhhhhh');
      if(responseJson!=undefined){
        this.setState({minimumOrdervalue:responseJson.minimumOrdervalue})
        if(responseJson.shippingPrice != undefined) this.setState({shippingPrice:responseJson.shippingPrice});
        if(responseJson.discountPrice != undefined) this.setState({discountedPrice:responseJson.discountPrice});
        if(responseJson.advance != undefined) this.setState({advance:responseJson.advance});
        var checked = this.state.checked
        if(responseJson.cod!=undefined){
            if(!responseJson.cod){
              checked = 'Card'
            }
            this.setState({cod:responseJson.cod})
        }
        this.setState({checked:checked})
        // this.setState({shippingPrice:responseJson.shippingPrice,discountedPrice:responseJson.discountPrice,advance:responseJson.advance})
        this.setState({discountObj:responseJson.couponDiscount})
        if(responseJson.couponDiscount!=undefined){
          this.setState({couponDiscount:responseJson.couponDiscount})
        }else{
          this.setState({couponDiscount:null,})
        }
      }
    })
    .catch((error) => {
      return
    });

}

keyboardDidShow=(event)=> {
    this.setState({keyboardOpen : true})
       this.setState({
           keyboardOffset: event.endCoordinates.height+27,
       })
   }

   keyboardDidHide=()=> {
     this.setState({keyboardOpen : false})
       this.setState({
           keyboardOffset: 0,
       })
   }



  userAsync = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf});


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

          this.setState({ loader: false})

        })
        .catch((error) => {
          return
        });




    } catch (error) {
      return
    }
  };


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

changeTimeSlot=(value,idx)=>{
  this.setState({timeSlot:value})
}

getAppSettings=()=>{
   fetch(SERVER_URL + '/api/POS/getAppSettings/')
     .then((response) =>{ return response.json()})
     .then((responseJson) => {
       if(responseJson!=undefined){
         this.setState({updateDetails:responseJson})
       }
     })
     .catch((error) => {
       return
     });
}

  componentDidMount() {
    this.getUserInfo()
     this.getAppSettings()
    this.props.navigation.setParams({
      themeColor: this.state.store.themeColor,
    });
    if(this.props.selectedLandmark!=null){
      if(this.props.selectedLandmark.timeSlots!=null&&this.props.selectedLandmark.timeSlots!=undefined){
      var timeSlots = this.props.selectedLandmark.timeSlots.split('||')
      timeSlots.pop()
      console.log(timeSlots,'ppppppppppp');
      this.setState({timeSlots:timeSlots,timeSlot:timeSlots[0]})
    }
    }
    this.addressAsync()
    this.setState({ loader: false})
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
     // this.getCoupon()
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
        this.setState({cartItems: this.props.cart});
      }
      if(prevProps.selectedAddress !== this.props.selectedAddress) {
        this.setState({primaryAddress: this.props.selectedAddress});
      }
  }

  decreaseCart = (item,idx)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      this.setState({disabled:false})
      return
    }
    this.setState({disabled:true})
    if(item.count == item.minQtyOrder){
      this.removeCart(item,idx)
    }else{
      this.cartUpdate(item,idx,'decrease')

    }

  }
  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  increaseCart = (item,idx)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      this.setState({disabled:false})
      return
    }
    this.setState({disabled:true})
    if (item.count >= item.stock) {
      ToastAndroid.show('You cannot order more than ' + item.count, ToastAndroid.SHORT);
      this.setState({disabled:false})
      return;
    }
    if (item.count >= item.maxQtyOrder) {
      ToastAndroid.show('You cannot order more than ' + item.count, ToastAndroid.SHORT);
      this.setState({disabled:false})
      return;
    }
    this.cartUpdate(item,idx,'increase')

  }
  removeItem = (item,idx)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }
    this.removeCart(item,idx)

  }

  setAddress=(selected)=> {
    if(selected == null && selected == undefined){
      this.userAsync()
    }else{

      this.props.selectedAddressFunction(selected)
    }

  }

  paymentDetails=(payment)=>{
    if(payment.orderId == null){
      var orderId = 'Try again..'
    }else{
      var orderId = 'ORDER ID: '+ payment.orderId.toString()
    }
    var message =  payment.type.toString()
    new Promise((resolve, reject) => {
        Alert.alert(
            message,
            orderId,
            [
                 {
                   text: 'OK',
                   onPress: () => {return},
                 },
            ],
            { cancelable: false }
        )
    })
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

showError=()=>{

}

razorpayAppPaymentResponse=async(data)=>{
  const userToken = await AsyncStorage.getItem('userpk');
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrf = await AsyncStorage.getItem('csrf');
  console.log(data,'jjjjjjjjj');
  this.setState({loader:true})
  var responseData ={
    razorpay_order_id: data.razorpay_order_id,
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_signature: data.razorpay_signature
  }
  console.log(responseData,'lllllllllll');
  fetch(SERVER_URL + '/razorpayAppPaymentResponse/', {
    headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL,
      'X-CSRFToken':csrf
    },
    body: JSON.stringify(responseData),
    method: 'POST',
  })
  .then((response) =>{
    console.log(response,response.status,'llllll');
    if(response.status ==200||response.status == 201){
      return response.json()
    }else{
      return undefined
    }
  })
  .then((responseJson) => {
    // this.setState({loader:false})
    if(responseJson!=undefined){
      console.log(responseJson,'ttttttttttttttttttt');
      this.props.navigation.navigate('OrderSuceesScreen',{
        orderId:this.state.orderRetry.pk
      })
    }else{
      this.setState({loader:false})
      this.responseFailure(data)
    }

  }).catch(()=>{
    this.setState({loader:false})
    this.responseFailure(data)
    return
  })
}


  responseFailure=(data)=>{
    var message = 'Something Went Wrong'
    var orderId = 'Order Id : '+data.razorpay_payment_id
    new Promise((resolve, reject) => {
        Alert.alert(
            message,
            orderId,
            [
                 {
                   text: 'Retry',
                   onPress: () => {this.razorpayAppPaymentResponse(data)},
                 },
                 {
                   text: 'Cancel',
                   onPress: () => {this.setState({orderRetry:null});return},
                 },
            ],
            { cancelable: false }
        )
    })
  }
  paymentFailure=(data)=>{
    var message = data.description
    var orderId = 'Order Id : #'+this.state.orderRetry.pk
    new Promise((resolve, reject) => {
        Alert.alert(
            message,
            orderId,
            [
                 {
                   text: 'Cancel',
                   onPress: () => {this.setState({orderRetry:null})},
                 },
                 {
                   text: 'Retry',
                   onPress: () => {this.retryPayment()},
                 },
            ],
            { cancelable: false }
        )
    })
  }

  retryPayment=()=>{
    if(this.state.orderRetry!=null){
      var userObj = this.checkFields()
      var options = {
          description: ' Ecommerce Purchase',
          image: 'https://new.happypockets.in/static/happy_app.png',
          currency: 'INR',
          key: 'rzp_live_zAEkT0neSSKrol',
          amount: this.state.orderRetry.order.amountToPaid*100 +'',
          name: 'Happy Pockets',
          order_id: this.state.orderRetry.order.paymentRefId,
          prefill: {
            email: userObj.email,
            contact: userObj.mobile,
            name: this.state.orderRetry.order.name,
          },
          theme: {color: '#efa834'}
        };
      RazorpayCheckout.open(options).then((data) => {
      // handle success
      console.log(data,data);
      // var url = SERVER_URL+'/razorpayPaymentResponseApp/?orderid='+responseJson.pk
      this.setState({loader:false})
      this.razorpayAppPaymentResponse(data)
      // alert(`Success: ${data.razorpay_payment_id}`);
      }).catch((error) => {
      // handle failure
      this.setState({loader:false})
      this.paymentFailure(error)
      // alert(`Error: ${error.code} | ${error.description}`);
      });
    }else{
      return
    }

  }

 checkFields=()=>{
   var email,mobile
   email = this.state.email
   mobile = this.state.mobile
   if(this.state.email==null||this.state.email==undefined){
     email = ''
   }
   if(this.state.mobile==null||this.state.mobile==undefined){
     mobile = ''
   }
   return {email:email,mobile:mobile}
 }


  order = async() =>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }



    // return
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');

    if ( this.state.cartItems.length <1 ) {
        this.refs.toast.show('Your cart is empty');
         // ToastAndroid.show('Please provide delivery address ', ToastAndroid.SHORT);
         return;
       }

    if (Object.keys(this.state.primaryAddress).length === 0 ) {
        this.refs.toast.show('Please provide delivery address ');
         // ToastAndroid.show('Please provide delivery address ', ToastAndroid.SHORT);
         return;
       }

    var osType = 'android'

    if (Platform.OS === 'ios'){
       osType = 'ios'
    }else{
       osType = 'android'
    }

      var total = 0
      for (var i = 0; i < this.state.cartItems.length; i++) {
        // var p = this.state.cartItems[i]
        total += this.state.cartItems[i].totalPrice


        }
        if(this.state.minimumOrdervalue>total){
          this.refs.toast.show('Minimum Order value is '+this.state.minimumOrdervalue+' Rupees');
          return
        }

        this.setState({loader:true})

     var masterStore = AsyncStorage.getItem('masterStore')

     var store = this.state.selectedStore.pk

     var data = {
        billingAddress:{
          street:'',
          city:'',
          state:'',
          pincode:0,
          country:'India',
          landMark:'',
        },
        mobile:null,
        address:{
          billingStreet:this.state.primaryAddress.billingStreet,
          billingCity:this.state.primaryAddress.billingCity,
          billingState:this.state.primaryAddress.billingState,
          billingPincode:this.state.primaryAddress.billingPincode,
          billingCountry:this.state.primaryAddress.billingCountry,
          billingLandMark:this.state.primaryAddress.billingLandMark,
          title:this.state.primaryAddress.title,
          primary:this.state.primaryAddress.primary,
          city:this.state.primaryAddress.city,
          country : this.state.primaryAddress.country,
          landMark:this.state.primaryAddress.landMark,
          mobileNo:this.state.primaryAddress.mobileNo,
          pincode:this.state.primaryAddress.pincode,
          sameAsShipping:this.state.primaryAddress.sameAsShipping,
          state:this.state.primaryAddress.state,
          street:this.state.primaryAddress.street,
          pk:this.state.primaryAddress.pk

        },
        modeOfPayment:this.state.checked,
        modeOfShopping:"online",
        paidAmount:0,
        store:store,
        total:total,
        shippingPrice:this.state.shippingPrice,
        osType:osType,
        // typ:userToken
      }
     console.log(data,'jjjjjjjjjjjjjj');
      if(this.state.discountObj!=undefined){
        data.coupon = this.state.discountObj.pk
      }
      if(this.state.checked==='discussion'){
        if(this.state.discussionData.length>0){
          data.discussionData = this.state.discussionData
          data.quoteTime = this.state.quoteTime
          data.status = 'quote'
        }
      }

      if(storeType=="MULTI-OUTLET"){
        data.timeSlot = this.state.timeSlot
      }

      fetch(SERVER_URL + '/api/POS/createOrder/', {
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken':csrf
        },
        body: JSON.stringify(data),
        method: 'POST',
      })
      .then((response) =>{
        return response.json()
      })
      .then((responseJson) => {

        if(responseJson!=undefined&&responseJson!=null){
          if(this.state.checked == 'Card'){
            var userObj = this.checkFields()
            console.log(userObj,responseJson.order,'kkkkkkkkkkkkkkkksaubffffffff');
            // 'https://i.imgur.com/3g7nmJC.png'
            this.setState({orderRetry:responseJson})
            var options = {
                description: ' Ecommerce Purchase',
                image: 'https://new.happypockets.in/static/happy_app.png',
                currency: 'INR',
                key: 'rzp_live_zAEkT0neSSKrol',
                amount: responseJson.order.amountToPaid*100 +'',
                name: 'Happy Pockets',
                order_id: responseJson.order.paymentRefId,
                prefill: {
                  email: userObj.email,
                  contact: userObj.mobile,
                  name: responseJson.order.name,
                },
                theme: {color: '#efa834'}
              };
            RazorpayCheckout.open(options).then((data) => {
            // handle success
            console.log(data,data);
            // var url = SERVER_URL+'/razorpayPaymentResponseApp/?orderid='+responseJson.pk
            this.setState({loader:false})
            this.razorpayAppPaymentResponse(data)
            // alert(`Success: ${data.razorpay_payment_id}`);
            }).catch((error) => {
            // handle failure
            this.paymentFailure(error)
            this.setState({loader:false})
            // alert(`Error: ${error.code} | ${error.description}`);
            });
            // var url = SERVER_URL+'/makeOnlinePayment/?orderid='+responseJson.pk
            // // this.setState({loader:false})
            // this.props.navigation.navigate('PaymentScreen',{
            //   url:url,
            //   odnumber:responseJson.pk,
            //   paymentBack: (payment) => this.paymentDetails(payment)
            // })


          }else if(this.state.checked=='COD'&&storeType == 'MULTI-VENDOR'&&this.state.advance>0){
              console.log(this.state.advance,this.state.checked,storeType,'advance');
              var url = SERVER_URL+'/makeOnlinePayment/?orderid='+responseJson.pk
              // this.setState({loader:false})
              this.props.navigation.navigate('PaymentScreen',{
                url:url,
                odnumber:responseJson.pk,
                paymentBack: (payment) => this.paymentDetails(payment)
              })
            }else{
              this.props.setInitialFunction([],0,0)
              this.props.setCounterAmount(0,0,0)
              // this.setState({loader:false})
              // this.props.emptyCartFunction()
              this.props.navigation.navigate('OrderSuceesScreen',{
                orderId:responseJson.pk
              })
            }
        }else{
          this.setState({loader:false})
        }


      })
      .catch((error) => {
        console.log(error,'errrrrrr');
        this.setState({loader:false})
        this.paymentDetails({
          orderId:null,
          type:'Order was not created!',
          errorname:'Order was not created!'
        })
      });
  }


  onNavigationStateChange = navState => {

  };


cartUpdate =(obj,idx,text)=>{
  var sessionid =  this.state.sessionid;
  var csrf = this.state.csrf;
  if(obj.user != null){
    if(text=='increase'){
      var data = {qty:obj.count+1}
      var rateCount = obj.count+1
    }else{
      var data = {qty:obj.count-1}
      var rateCount = obj.count-1
    }
    var discount =  this.findDiscount(obj.bulkChart,rateCount)
    if(discount!=null){
      obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
    }else{
      obj.discountedPrice = obj.sellingPrice
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
            if(text=='decrease'){
              this.props.decreaseFromCartFunction(obj);
              this.setState({disabled:false})
            }else{
              this.props.increaseCartFunction(obj)
              this.setState({disabled:false})
            }
          }

        })

  }else{
    if(text=='increase'){
      var data = {qty:obj.count+1}
      var discount =  this.findDiscount(obj.bulkChart,obj.count+1)
      if(discount!=null){
        obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
      }else{
        obj.discountedPrice = obj.sellingPrice
      }
      this.props.increaseCartFunction(this.state.cartItems[idx])
      this.setState({disabled:false})

    }else{
      var data = {qty:obj.count-1}
      var discount =  this.findDiscount(obj.bulkChart,obj.count-1)
      if(discount!=null){
        obj.discountedPrice = obj.sellingPrice-(obj.sellingPrice*(discount/100))
      }else{
        obj.discountedPrice = obj.sellingPrice
      }
      this.props.decreaseFromCartFunction(this.state.cartItems[idx]);
      this.setState({disabled:false})

    }
  }
}

removeCart=(obj)=>{
  var sessionid =  this.state.sessionid;
  var csrf = this.state.csrf;

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

          this.props.removeItemFunction(obj)
          this.setState({disabled:false})
          return
        }
        })
      .then((responseJson) => {
        return
      })
  }else{
    this.props.removeItemFunction(obj)
    this.setState({disabled:false})
  }
}

modalShow=(bool)=>{
  this.setState({customize:bool})
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

  capitalize=(str)=>{
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  getCoupon=()=>{

    const sessionid = this.state.sessionid
    const csrf = this.state.csrf
    this.setState({sessionid:sessionid,csrf:csrf})
    var url = SERVER_URL + '/api/POS/getShippingPrice/?coupon='+this.state.coupon+'&addressid='+this.state.addressPk

     fetch(url,{
      method: 'GET',
      headers:{
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      },
    })
      .then((response) => {
        if(response.status==201||response.status==200){
          return response.json()
        }else{
          return undefined
        }
      })
      .then((responseJson) => {
        console.log(responseJson,'getCoupon');
        if(responseJson!=undefined){
          this.setState({minimumOrdervalue:responseJson.minimumOrdervalue})
          if(responseJson.shippingPrice != undefined) this.setState({shippingPrice:responseJson.shippingPrice});
          if(responseJson.discountPrice != undefined) this.setState({discountedPrice:responseJson.discountPrice});
          if(responseJson.advance != undefined) this.setState({advance:responseJson.advance});
          var checked = this.state.checked
          if(responseJson.cod!=undefined){
              if(!responseJson.cod){
                checked = 'Card'
                this.setState({cod:responseJson.cod})
              }
          }
          this.setState({checked:checked,discountObj:responseJson.couponDiscount})
          // this.setState({shippingPrice:responseJson.shippingPrice,discountedPrice:responseJson.discountPrice,advance:responseJson.advance})
          if(responseJson.couponDiscount!=undefined){
            this.setState({showError:false})
            this.setState({couponDiscount:responseJson.couponDiscount})
          }else{
            this.setState({showError:true})
            this.setState({couponDiscount:null})
          }
        }else{
          this.setState({showError:true})
        }
      })
      .catch((error) => {
        this.setState({showError:true})
        return
      });
  }

  render() {
   const { navigation } = this.props;
   const color = navigation.getParam('color','#000')
   var themeColor = this.props.store.themeColor
   var totalCount = 0;
   var totalValue = 0;
   var totalDiscount = 0;

   for (var i = 0; i < this.state.cartItems.length; i++) {
       totalValue += this.state.cartItems[i].totalPrice;
       totalCount += this.state.cartItems[i].count;
       totalDiscount += (this.state.cartItems[i].mrp-this.state.cartItems[i].sellingPrice) *  this.state.cartItems[i].count;
   }
   totalValue = totalValue + this.state.shippingPrice
   totalValue = totalValue - this.state.discountedPrice
   totalDiscount = totalDiscount + this.state.discountedPrice

   if(this.state.timeSlots!=null){
     var timeSlots = this.state.timeSlots.map( (s, i) => {
       return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
     });
     var timeSlotsDropdown = this.state.timeSlots.map( (s, i) => {
       return {value:s}
     });
   }else{
     var timeSlots = []
     var timeSlotsDropdown = []
   }
    if(this.state.loader == true){
      return (
        <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position='top'/>
        <ActivityIndicator size="large" color={themeColor} />
        </View>
      )
    }

    else{
      if(this.state.webview){
          return(
            <WebView
            source={{uri: this.state.paymenturl}}
            onNavigationStateChange={this.onNavigationStateChange}
            startInLoadingState
            scalesPageToFit
            javaScriptEnabled
            style={{ flex: 1,width:width*1 }}

            />
          )
      }else{

    return (

      <View  style={{flex:1,backgroundColor:'#e6e6e6'}} >
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position='top'/>

         <ScrollView contentContainerStyle={{paddingBottom:this.state.keyboardOpen?this.state.keyboardOffset:0}}>
          <View style={{marginHorizontal:0}}>

           <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 0,paddingVertical:20,paddingHorizontal:3,backgroundColor:'#fff' }}>

             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15, }}>Total Items</MonoText>
               <MonoText   style={{  color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}>{this.props.counter}</MonoText>
             </View>

             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15, }}>Saved </MonoText>
               <MonoText   style={{  color: 'red', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {Math.round(this.props.saved)}</MonoText>
             </View>

             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15, }}>Delivery</MonoText>
               <MonoText   style={{  color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {Math.round(this.state.shippingPrice)}</MonoText>
             </View>

             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{  color: 'grey', marginTop: 2, fontSize: 15, }}>Total</MonoText>
               <MonoText   style={{  color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {Math.round(this.props.totalAmount+this.state.shippingPrice)}</MonoText>
             </View>

          </View>



          <View style={{borderTopWidth:3,borderTopColor:'#e6e6e6',borderBottomWidth:0,borderBottomColor:'#e6e6e6',backgroundColor:'#fff'}}>
            <ScrollView contentContainerStyle={{}}>
            {this.state.primaryAddress.pk!=undefined&&
              <View style={{flex:1,paddingBottom:20}}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',padding:10,paddingBottom:10,marginBottom:0 }}>
                  <View style={{ flex: 0.5,flexDirection:'row',alignItems:'center',paddingTop:5}}>
                    <FontAwesome name="thumb-tack" size={20} color="grey" />
                    <MonoText   style={{  color: '#000', fontSize: 15, }}>  Deliver To </MonoText>
                  </View>
                  <View style={{ flex: 0.5,alignItems:'flex-end' }}>
                    <TouchableOpacity style={{paddingLeft:20,paddingRight:15,paddingVertical:5}} onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}}>{/*<FontAwesome name="pencil" size={20} color={themeColor} />*/}
                       <MonoText style={{ color: themeColor, fontSize: 15,}}>Edit</MonoText>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1,paddingLeft:20,marginBottom: 0,paddingRight:10, }}>
                  <MonoText   style={{ fontSize:15,color:'grey',}}>{this.state.primaryAddress.street}  {this.state.primaryAddress.landMark}  {this.state.primaryAddress.city}  {this.state.primaryAddress.mobileNo} {this.state.primaryAddress.state!=null?(this.state.primaryAddress.state!=undefined?this.capitalize(this.state.primaryAddress.state):''):''} {this.state.primaryAddress.country} {this.state.primaryAddress.pincode}.</MonoText>
                </View>
              </View>
             }
              {this.state.primaryAddress.pk==undefined&&
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}} style={{flex:1}}>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',padding:10,paddingBottom:10,marginBottom:0 }}>
                    <View style={{ flex: 0.5, }}>
                      <MonoText   style={{  color: '#000', fontSize: 15, }}><FontAwesome name="thumb-tack" size={20} color="grey" />  Deliver To </MonoText>
                    </View>
                  { /* <View style={{ flex: 0.5,alignItems:'flex-end' }}>
                      <TouchableOpacity onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}}><FontAwesome name="pencil" size={20} color="#0000ff" /></TouchableOpacity>
                    </View>*/}
                  </View>
                <View  numberOfLines={2} style={{ flex: 1,paddingLeft:20,paddingRight:10,paddingTop:10,paddingBottom:45  }}>
                  <MonoText   style={{ fontSize:15,color:'grey',}}>Tap here to Select Address.</MonoText>
                </View>
              </TouchableOpacity>
             }
            </ScrollView>
          </View>

          {storeType=='MULTI-OUTLET'&&this.state.primaryAddress.pk!=undefined&&timeSlots.length>0&&
          <View style={{flexDirection:'row',padding:10,paddingVertical:15,borderTopWidth:3,borderTopColor:'#e6e6e6',backgroundColor:'#fff'}}>
            <View style={{flex:1}}>
              <MonoText style={{fontSize:16,color:'#000',}}>Select Timeslot</MonoText>
            </View>
            <View style={{flex:1}}>
            {Platform.OS === 'android'&&
              <Picker
              selectedValue={this.state.timeSlot}
              mode="dropdown"
              style={{ flex:1,height:25, width:'100%' }}
              onValueChange={(itemValue, itemIndex)=>this.changeTimeSlot(itemValue, itemIndex)}>
              {timeSlots}
              </Picker>
            }
            {Platform.OS === 'ios'&&

              <Dropdown
                data={timeSlotsDropdown}
                onChangeText={(itemValue, itemIndex)=>this.setState({timeSlot:itemValue})}
                containerStyle={{
                  height:25,
                  width: '100%',backgroundColor:'#ffffff',borderRadius:5,borderWidth: 0,borderColor:'#ffffff'
                }}
                inputContainerStyle={{
                  height:25, width: '100%',fontSize:16,backgroundColor:'#ffffff',paddingTop:-20,paddingHorizontal: 10,borderRadius:5,borderWidth: 0,borderColor:'#ffffff',borderBottomColor:'transparent'
                }}
                value={this.state.timeSlot}
               pickerStyle={{borderWidth:0,  borderRadius:10,width:width-40,marginTop:width * 0.03,marginHorizontal: 10}}
              />
            }

            </View>
          </View>
        }

          {storeType=='MULTI-OUTLET'&&
          <View style={{backgroundColor:'#fff',padding:10,borderTopWidth:3,borderTopColor:'#e6e6e6'}}>
               <MonoText   style={{  color: '#000', fontSize: 15, }}>Coupon Code</MonoText>

               <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',marginVertical:10}}>
                  <View style={{flex:0.75,}}>
                    <TextInput style={{height:40,paddingHorizontal:10,marginTop:5,borderWidth:1,borderColor:'#e2e2e2',fontSize:18,color:'#000'}}
                    onChangeText={(coupon)=>{this.setState({coupon:coupon,showError:false});}}
                    value={this.state.coupon}  >
                    </TextInput>
                  </View>
                  <TouchableOpacity onPress={()=>{this.getCoupon()}} style={{flex:0.25,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderRightWidth:1,borderColor:'#e2e2e2',height:40,marginTop:5}}>
                    {/*<AntDesign  name={'arrowright'}  size={25} color={'grey'}/>*/}
                    <MonoText   style={{ fontSize:16,fontWeight:'700',color:themeColor}}>Apply</MonoText>
                  </TouchableOpacity>
             </View>


             {this.state.discountObj!=undefined&&
               <View>
                <MonoText   style={{ color:themeColor,fontSize:14}}>&#8377; {this.state.discountObj.discount} Applied Sucessfully.</MonoText>
              </View>
            }
             {this.state.discountObj==undefined&&this.state.showError&&
               <View>
                <MonoText   style={{ color:'red',fontSize:14}}>Coupon code Not Valid .</MonoText>
              </View>
            }

          </View>
        }

            <View style={{backgroundColor:'#fff',paddingBottom: 10,padding:10,borderTopWidth:3,borderTopColor:'#e6e6e6'}}>
              <MonoText   style={{  color: '#000', fontSize: 15, }}>Payment Options  </MonoText>
              <View style={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                { Platform.OS === 'ios' &&
                <CheckBox
                         checkedIcon={<Image source={ require('../assets/images/checkedB.png') } style={{height:20,width:20}} />}
                         uncheckedIcon={<Image source={require('../assets/images/uncheckedB.png')} style={{height:20,width:20}} />}
                        checked={this.state.checked==='COD'  ? true:false}
                        onPress={() => this.setState({checked: 'COD'})}
                        checkedColor='green'
                        containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-6}}
                        />
              }{ Platform.OS === 'android' &&
                  <RadioButton
                    value="COD"
                    color="#006400"
                    disabled={this.state.cod?false:true}
                    status={this.state.checked === 'COD' ? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ checked: 'COD' }); }}
                  />}
                  <MonoText   style={{  color:this.state.cod?'#000':'#d2d2d2', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>Cash On Delivery</MonoText>
                  {this.state.advance>0&&this.state.checked=='COD'&&
                  <MonoText  numberOfLines={1}  style={{  color: 'grey', fontSize: 14,marginLeft:0,marginTop:6,marginRight:5 }}>
                  (<MonoText   style={{ fontWeight:'700',color:'#000'}}>&#8377;{this.state.advance} </MonoText> to be paid in advance.)
                  </MonoText>
                  }
                </View>
                <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                { Platform.OS === 'ios' &&
                <CheckBox

                         checkedIcon={<Image source={ require('../assets/images/checkedB.png') } style={{height:20,width:20}} />}
                         uncheckedIcon={<Image source={require('../assets/images/uncheckedB.png')} style={{height:20,width:20}} />}
                        checked={this.state.checked==='Card'  ? true:false}
                        onPress={() => this.setState({checked: 'Card' })}
                        checkedColor='green'
                        containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-6}}
                        />
              }{ Platform.OS === 'android' &&
                <RadioButton
                  value="Card"
                  color="#006400"
                  status={this.state.checked === 'Card' ? 'checked' : 'unchecked'}
                  onPress={() => { this.setState({ checked: 'Card' }); }}
                />}
                  <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>Pay Online</MonoText>
                </View>

                <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                { Platform.OS === 'ios' && storeType!='MULTI-OUTLET' &&
                <CheckBox

                         checkedIcon={<Image source={ require('../assets/images/checkedB.png') } style={{height:20,width:20}} />}
                         uncheckedIcon={<Image source={require('../assets/images/uncheckedB.png')} style={{height:20,width:20}} />}
                        checked={this.state.checked==='discussion'  ? true:false}
                        onPress={() => this.setState({checked: 'discussion' })}
                        checkedColor='green'
                        containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-6}}
                        />
              }{ Platform.OS === 'android' && storeType!='MULTI-OUTLET' &&
                <RadioButton
                  value="discussion"
                  color="#006400"
                  status={this.state.checked === 'discussion' ? 'checked' : 'unchecked'}
                  onPress={() => { this.setState({ checked: 'discussion' }); }}
                />}
                {storeType!='MULTI-OUTLET' &&
                  <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>Request Quotation</MonoText>
                }
                </View>
              </View>

              {this.state.checked==='discussion'&& storeType!='MULTI-OUTLET' &&
              <View style={{flex:1,marginTop:10}}>
                  <TextInput
                    style={{height: 90, borderWidth: 0,width:'100%',paddingHorizontal:20,paddingVertical:15,fontSize:16, textAlignVertical:'top',borderWidth:1,borderColor:'#f2f2f2'}}
                    underlineColorAndroid='#fff'
                    multiline={true}
                    numberOfLines={3}
                    placeholder="Add Comments"
                    value={this.state.discussionData}
                    onChangeText={(text) =>{LayoutAnimation.spring(); this.setState({discussionData:text})}}
               />
               </View>
             }
             {this.state.checked==='discussion'&& storeType!='MULTI-OUTLET' &&
              <View style={{flex:1,marginTop:10}}>
                   <MonoText   style={{  color: '#000', fontSize: 15,marginBottom:5 }}>Within how many days You will Place the Order?</MonoText>
                  <TextInput
                    style={{height: 90, borderWidth: 0,width:'100%',paddingHorizontal:20,paddingVertical:15,fontSize:16, textAlignVertical:'top',borderWidth:1,borderColor:'#f2f2f2'}}
                    underlineColorAndroid='#fff'
                    multiline={true}
                    numberOfLines={2}
                    placeholder="Within how many days You will Place the Order"
                    value={this.state.quoteTime}
                    onChangeText={(text) => this.setState({quoteTime:text})}
               />
              </View>
            }



            </View>

            </View>
          </ScrollView>



          {this.state.updateDetails.placeorder&&
            <View style={{position:'absolute',right:0,bottom:0,left:0,height:45}}>
              <TouchableOpacity onPress={()=>{this.order()}} style={{alignItems:'center',justifyContent:'center',height:'100%',backgroundColor:themeColor}}>
                <MonoText   style={{ color:'#fff',fontSize:16,}}>PLACE THE ORDER</MonoText>
              </TouchableOpacity>
          </View>
        }

      </View>
    )
  } };
  }
}


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    totalAmount: state.cartItems.totalAmount,
    saved: state.cartItems.saved,
    cart : state.cartItems.cartItem,
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
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address)),
    setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen);



const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10
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
  },
  searchcontainer: {
    backgroundColor: 'red',
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
