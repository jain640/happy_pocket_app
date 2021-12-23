import * as React from 'react';
import { StatusBar ,View,FlatList,TouchableWithoutFeedback,StyleSheet,PanResponder,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
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
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import { NavigationActions } from 'react-navigation';
import Modal from "react-native-modal";
import NetInfo from '@react-native-community/netinfo';
import { MonoText } from '../components/StyledText';

import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'




class CheckoutScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Checkout',

      headerStyle: {
        backgroundColor: params.themeColor,
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
    selectedStore:props.selectedStore,
    parentScrollEnabled: true,
    childScrollEnabled: true,
    childScrollViewContentOffsetY: 0,
  };
  willFocus = props.navigation.addListener(
   'didFocus',
     payload => {
        this.checkLandmark()
       }
  );
}

handleChildScrollViewDirection = (e) =>{
    if(e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height){
        if(Platform.OS == 'android'){
            this.refs.parentScrollView.scrollToEnd({duration: 500});
        }else if(Platform.OS == 'ios'){
            this.refs.parentScrollView.scrollToEnd({animated: true});
        }
    }else if(this.state.childScrollViewContentOffsetY >= e.nativeEvent.contentOffset.y && e.nativeEvent.contentOffset.y < 10){
        if(Platform.OS == 'android'){
            this.refs.parentScrollView.scrollTo({x: 0, y: 0, duration: 1});
        }else if(Platform.OS == 'ios'){
            this.refs.parentScrollView.scrollTo({x: 0, y: 0, animated: true});
        }
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
  this.setState({checked:checked,cartItems:this.props.cart})
}

getShipphingCharge=()=>{
  var total = 0
  nextProps.cart.forEach((i)=>{
    total += i.count*i.sellingPrice
  })
  var addressPk = null
  if(nextProps.selectedAddress.pk!=undefined){
    addressPk = nextProps.selectedAddress.pk
  }
  this.setState({cartItems:nextProps.cart})
  if(total>0){
    var url = SERVER_URL + '/api/POS/getShippingPrice/?addressid='+addressPk+'&amount='+total
    fetch(url).then((response) => response.json())
    .then((responseJson) => {
      this.setState({shippingPrice:responseJson.shippingPrice})
    })
    .catch((error) => {
      return
    });
  }else{
    this.setState({shippingPrice:0})
  }
}

componentWillReceiveProps(nextProps){


    var total = 0
    nextProps.cart.forEach((i)=>{
      total += i.count*i.sellingPrice
    })
    var addressPk = null
    if(nextProps.selectedAddress.pk!=undefined){
      addressPk = nextProps.selectedAddress.pk
    }
    if(total>0){
      var url = SERVER_URL + '/api/POS/getShippingPrice/?addressid='+addressPk+'&amount='+total
      fetch(url).then((response) => response.json())
      .then((responseJson) => {
        this.setState({shippingPrice:responseJson.shippingPrice})
      })
      .catch((error) => {
        return
      });
    }else{
        this.setState({shippingPrice:0})
    }
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
          <TouchableOpacity onPress={()=>this.setSelected(i,cartIdx)} style={{backgroundColor: themeColor,alignSelf: 'flex-start',paddingVertical: 5,paddingHorizontal: 5}}><MonoText   style={{ color: '#fff', marginTop: 1, fontSize: 14 }}>View Customization </MonoText> </TouchableOpacity>
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
    this.props.navigation.setParams({
      themeColor: this.state.store.themeColor,
    });

    this.setState({ loader: false})
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




      var total = 0
      for (var i = 0; i < this.state.cartItems.length; i++) {
        // var p = this.state.cartItems[i]
        total += this.state.cartItems[i].count*this.state.cartItems[i].sellingPrice


        }
        if(this.state.selectedLandmark!=null){
          if(this.state.selectedLandmark.minimumOrdervalue>total){
            this.refs.toast.show('Minimum Order value is '+this.state.selectedLandmark.minimumOrdervalue+' Rupees');
            return
          }
        }

        this.setState({loader:true})

     var masterStore = AsyncStorage.getItem('masterStore')

     var store = this.state.selectedStore.pk


      fetch(SERVER_URL + '/api/POS/createOrder/', {
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken':csrf
        },
        body: JSON.stringify({
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
           // typ:userToken
         }),
        method: 'POST',
      })
      .then((response) =>{

        return response.json()
      })
      .then((responseJson) => {
        console.log(responseJson,'pppppppppp');
        if(this.state.checked == 'Card'){

          var url = SERVER_URL+'/makeOnlinePayment/?orderid='+responseJson.pk
          this.setState({loader:false})
          this.props.navigation.navigate('PaymentScreen',{
            url:url,
            odnumber:responseJson.pk,
            paymentBack: (payment) => this.paymentDetails(payment)
          })


        }else{
          // this.setState({cartItems:[]})
          // AsyncStorage.setItem('cart',JSON.stringify(this.state.cartItems))
          // AsyncStorage.setItem('inCart',JSON.stringify(0))
          this.setState({loader:false})
          this.props.emptyCartFunction()
          this.props.navigation.navigate('OrderSuceesScreen',{
              orderId:responseJson.pk
            })

        }


      })
      .catch((error) => {
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



  render() {
   const { navigation } = this.props;
   const color = navigation.getParam('color','#000')
   var themeColor = this.props.store.themeColor
   var totalCount = 0;
   var totalValue = 0;
   var totalDiscount = 0;

   for (var i = 0; i < this.state.cartItems.length; i++) {
       totalValue += this.state.cartItems[i].discountedPrice*this.state.cartItems[i].count;
       totalCount += this.state.cartItems[i].count;
       totalDiscount += (this.state.cartItems[i].mrp-this.state.cartItems[i].discountedPrice) *  this.state.cartItems[i].count;
   }
   totalValue += this.state.shippingPrice

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

      <ScrollView  ref='parentScrollView'  scrollEnabled={this.state.parentScrollEnabled} contentContainerStyle={{flexWrap:'nowrap',backgroundColor:'#e6e6e6'}} >
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position='top'/>
      <TouchableOpacity
                activeOpacity={1}
                onPressIn= {()=>this.setState({parentScrollEnabled: true})}>
      <View>

        <ScrollView  scrollEnabled={this.state.childScrollEnabled} onScrollBeginDrag={(e) => this.setState({ childScrollViewContentOffsetY: e.nativeEvent.contentOffset.y})}
                onScrollEndDrag={(e)=> this.handleChildScrollViewDirection(e)}    contentContainerStyle={{flexWrap:'wrap',flex:1,paddingLeft:10, paddingRight:10, paddingBottom:0,}} >


          <TouchableOpacity activeOpacity={1} onPressIn={()=>this.setState({parentScrollEnabled: false, childScrollEnabled: true})}>
          <View style={{ flexWrap: 'wrap',backgroundColor:'#fff',height:height*0.6 }}>
          <MonoText   style={{ color: '#000', fontSize: 15,margin:10 }}><FontAwesome name="shopping-cart" size={20} color="grey" />  Cart </MonoText> 
          <FlatList
            style={{ flex:0.7,marginBottom: 0,}}
            data={this.state.cartItems}
            nestedScrollEnabled={true}
            keyExtractor={(item,index) => {
              return index.toString();
            }}
            scrollEnabled = {true}
            renderItem={({item, index, separators}) =>{
             return(

                  <View style={{ flex: 1, alignItems: 'flex-start', paddingTop: 10,backgroundColor:'#fff' }}>

                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10,paddingBottom:10 }}>

                    <TouchableOpacity onPress={()=>this.removeItem(item,index)} style={{height:20,width:20,position:'absolute',left:2,top:0,paddingHorizontal:6,paddingVertical: 4,borderWidth:0,borderRadius:10,zIndex: 100,backgroundColor: 'grey',borderColor:'grey'}}>
                     <Ionicons name="md-close" size={12} color="#fff" />
                    </TouchableOpacity>
                      <View style={{ width:width*0.2 }}>
                        <Image source={{ uri: SERVER_URL+item.dp }} style={{ width: 60, height: 60, alignSelf: 'center' }} />
                      </View>


                      <View style={{flex:0.6,width:width*0.7}}>
                        <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15, }}>{item.displayName}</MonoText> 
                        <MonoText   style={{ color: themeColor, marginTop: 1, fontSize: 14 }}>Happy Price &#8377;{item.discountedPrice} <MonoText   style={{textDecorationLine: 'line-through',color: '#a2a2a2',}}>&#8377; {item.mrp}</MonoText> </MonoText> 
                        {this.renderView(item,index)}
                      </View>
                      <View style={{ flex: 0.4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width:width*0.1,}}>

                        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25,paddingTop:3,marginTop:10}}>

                          <TouchableOpacity onPress={()=>{this.decreaseCart(item,index )}} disabled={this.state.disabled}>
                            <View style={{width:25, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
                              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText> 
                            </View>
                          </TouchableOpacity>

                          <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2}}>
                            <MonoText   style={{textAlign: 'center'}} >{item.count}</MonoText> 
                          </View>

                          <TouchableOpacity onPress={()=>this.increaseCart(item,index)} disabled={this.state.disabled}>
                            <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
                              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText> 
                            </View>
                          </TouchableOpacity>

                        </View>


                      </View>

                    </View>

                  </View>
                )
            }}
           />
           <View style={{flex:0.25,flexWrap: 'wrap',  flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginVertical: 10,paddingVertical:10,paddingHorizontal:3,backgroundColor:'#fff',marginBottom: 10,paddingBottom:10 , }}>
             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Total Items</MonoText> 
               <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}>{totalCount}</MonoText> 
             </View>

             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Saved </MonoText> 
               <MonoText   style={{ color: 'red', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {totalDiscount}</MonoText> 
             </View>

             <View style={{ flex: 1,alignItems:'center' }}>
             <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Delivery</MonoText> 
             <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {this.state.shippingPrice}</MonoText> 
             </View>
             <View style={{ flex: 1,alignItems:'center' }}>
               <MonoText   style={{ color: 'grey', marginTop: 2, fontSize: 15, }}>Total</MonoText> 
               <MonoText   style={{ color: '#000', marginTop: 2, fontSize: 15,fontWeight: '700', }}> &#8377; {totalValue}</MonoText> 
             </View>
           </View>
           </View>
           </TouchableOpacity>


            </ScrollView>
{/*position:'absolute',bottom:0,left:10,right:10,*/}
          <View style={{marginHorizontal:10,borderTopWidth:3,borderTopColor:'#e6e6e6',borderBottomWidth:3,borderBottomColor:'#e6e6e6',}}>
            <ScrollView nestedScrollEnabled={true} style={{flex:1,backgroundColor:'#fff',height:height*0.15}}>
            {this.state.primaryAddress.pk!=undefined&&
              <View style={{flex:1}}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',padding:10,paddingBottom:10,marginBottom:0 }}>
                  <View style={{ flex: 0.5, }}>
                    <MonoText   style={{ color: '#000', fontSize: 15, }}><FontAwesome name="thumb-tack" size={20} color="grey" />  Deliver To </MonoText> 
                  </View>
                  <View style={{ flex: 0.5,alignItems:'flex-end' }}>
                    <TouchableOpacity onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}}><FontAwesome name="pencil" size={20} color="#0000ff" /></TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1,paddingLeft:20,marginBottom: 20,paddingRight:10, }}>
                  <MonoText   style={{fontSize:15,color:'grey',}}>{this.state.primaryAddress.landMark}  {this.state.primaryAddress.street} {this.state.primaryAddress.city}   {this.state.primaryAddress.mobileNo} {this.state.primaryAddress.state} {this.state.primaryAddress.country} {this.state.primaryAddress.pincode}.</MonoText> 
                </View>
              </View>
             }
              {this.state.primaryAddress.pk==undefined&&
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}} style={{flex:1}}>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',padding:10,paddingBottom:10,marginBottom:0 }}>
                    <View style={{ flex: 0.5, }}>
                      <MonoText   style={{ color: '#000', fontSize: 15, }}><FontAwesome name="thumb-tack" size={20} color="grey" />  Deliver To </MonoText> 
                    </View>
                    {/*<View style={{ flex: 0.5,alignItems:'flex-end' }}>
                      <TouchableOpacity onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))}}><FontAwesome name="pencil" size={20} color="#0000ff" /></TouchableOpacity>
                    </View>height:height*0.17*/}
                  </View>
                <View  numberOfLines={2} style={{ flex: 1,paddingLeft:20,paddingRight:10,paddingTop:10,paddingBottom:35 }}>
                  <MonoText   style={{fontSize:15,color:'#c2c2c2',}}>Tap here to Select Address.</MonoText> 
                </View>
              </TouchableOpacity>
             }
            </ScrollView>
            </View>

            <View style={{marginHorizontal:10,backgroundColor:'#fff',marginBottom: 10,padding:10,borderTopWidth:0,borderTopColor:'#e6e6e6',}}>
              <MonoText   style={{ color: '#000', fontSize: 15, }}>Payment Option  </MonoText> 
              <View style={{flex:1,justifyContent: 'flex-start', alignItems: 'flex-start',}}>
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
                    disabled={this.state.selectedLandmark!=null?(this.state.selectedLandmark.isCod?false:true):false}
                    status={this.state.checked === 'COD' ? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ checked: 'COD' }); }}
                  />}
                  <MonoText   style={{ color: this.state.selectedLandmark!=null?(this.state.selectedLandmark.isCod?'#000':'#d2d2d2'):'#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>Cash On Delivery</MonoText> 
                </View>
                <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',marginVertical:2}}>
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
                  <MonoText   style={{ color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>Pay Online</MonoText> 
                </View>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start',marginTop:10}}>
              <TouchableOpacity onPress={()=> this.order()} style={{backgroundColor: themeColor,padding:6,}}>
                <MonoText   style={{color:'#fff',fontSize:15,fontWeight:'700'}}>Place the order</MonoText> 
              </TouchableOpacity>

              </View>


        </View>
        <Modal style={{justifyContent: 'center',alignItems: 'center',margin: 0}} isVisible={this.state.customize} animationIn="fadeIn"  animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} onRequestClose={() => { this.modalShow(false) }} onBackdropPress={() => {this.modalShow(false)}} >
            <View style={{width:width*0.9,height:width,backgroundColor: '#fff',paddingHorizontal:25,paddingVertical: 30,}}>
            <View style={{flex:1,}}>
              <View style={{flex:0.4,}}>
                <MonoText   style={{fontSize:16,marginBottom: 10,fontWeight:'bold'}}>Write Instruction</MonoText> 
                <TextInput style={{fontSize: 16,color: '#000',height: 80,borderWidth: 0.5,borderColor:'#f2f2f2',paddingVertical:10,paddingHorizontal: 10,width:'100%',marginBottom: 20,}}
                 placeholder="Write Instruction here..."
                 underlineColorAndroid='transparent'
                 ref={input => { this.textInput = input }}
                 onChangeText={(text) => this.setState({instruction:text})}
                 value={this.state.instruction}
                 multiline={true}/>
              </View>
               <View style={{flex:0.4,}}>
                 <MonoText   style={{fontSize:16,marginBottom: 10,fontWeight:'bold'}}>Choose Image</MonoText> 
                 <View style={{flex:1,flexDirection: 'row'}}>
                  <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
                    <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                      <FontAwesome  name="photo" size={25} color="#fff" />
                    </View>
                    <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText> 
                  </TouchableOpacity>
                  <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
                    <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                      <FontAwesome  name="camera" size={25} color="#fff" />
                    </View>
                    <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText> 
                  </TouchableOpacity>
                  {this.state.selectedImage!=null&&
                    <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                    <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                    <Image source={{uri:this.state.selectedImage}} style={{width:'100%',height:'100%'}}  />
                    </View>
                    </View>
                  }
                  </View>
                </View>
                <View style={{flex:0.2,flexDirection: 'row',backgroundColor: '#fff',alignItems: 'center',justifyContent: 'flex-end',}}>
                  <TouchableOpacity style={[{paddingHorizontal: 15,paddingVertical: 8,backgroundColor: themeColor}]} onPress={()=>{this.uploadCustomization()}} >
                    <MonoText   style={{fontSize: 18,color:'#fff',fontWeight: '600',}}>Upload</MonoText> 
                  </TouchableOpacity>
                  <TouchableOpacity style={[{paddingHorizontal: 15,paddingVertical: 8,backgroundColor: 'red'}]} onPress={()=>{this.removeCustomization()}} >
                    <MonoText   style={{fontSize: 18,color:'#fff',fontWeight: '600',}}>Remove</MonoText> 
                  </TouchableOpacity>
                </View>
              </View>
            </View>
      </Modal>
      </View>
      </TouchableOpacity>
      </ScrollView>
    )
  } };
  }
}


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
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
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address))

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
