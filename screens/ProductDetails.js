import * as React from 'react';
import { Animated,StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, Keyboard,TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform,ScrollView,ActivityIndicator,TextInput,PanResponder,TouchableWithoutFeedback,Easing,SafeAreaView,Share} from 'react-native';
import { FontAwesome,Entypo } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
import StarRating from '../components/StarRating.js';
import VariantCard from '../components/VariantCard.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { Dropdown } from 'react-native-material-dropdown-v2';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import Modal from "react-native-modal";
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {State, PinchGestureHandler} from 'react-native-gesture-handler';
import {ListItem} from 'react-native-elements';
import HTMLView from 'react-native-htmlview';
import NetInfo from '@react-native-community/netinfo';
import { MonoText } from '../components/StyledText';
import { Icon } from "react-native-elements";
import ModalBox from 'react-native-modalbox';
import Loader from '../components/Loader';
import ProductDetailsLoader from '../components/ProductDetailsLoader';
import { Switch } from 'react-native-paper';
import * as Linking from 'expo-linking';
const storeType = settings.storeType
const chatView = settings.chat
const productShareMessage = settings.productShareMessage


function renderNode(node, index, siblings, parent, defaultRenderer){
 if (node.name == 'p') {
   const specialStyle = node.attribs.style
   return (
     <MonoText  key={index} style={[specialStyle,{ }]}>
       {defaultRenderer(node.children,parent)}
     </MonoText>
   );
 }
}


class ProductDetails extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title: '',
      headerRight:(
        <TouchableOpacity onPress={()=>{params.onShare()}} style={{marginRight:15}}>
          <FontAwesome color={'#fff'} name="share-alt" size={25} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerTintColor: '#fff',
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      product:null,
      selected:null,
      parent:false,
      options:[],
      unitType:'',
      taxCode:0,
      taxRate:0,
      gstType:'',
      cartItems : props.cart,
      cartCounts:[],
      images:[],
      scrollX : new Animated.Value(0),
      scrollY: new Animated.Value(0),
      userScreen:'LogInScreen',
      customize:false,
      instruction:'',
      customizeImage:null,
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      selectedImage:null,
      imageVisible:false,
      currentPanValue:{x:0,y:0},
      customizePks:[],
      storeCustomPk:[],
      selectdImgTab:0,
      store:this.props.store,
      selectedimage:0,
      secondOptionsIdx:null,
      selectedIdx:null,
      csrf:null,
      sessionid:null,
      user:null,
      discount:[],
      salePrice:0,
      saleDiscount:0,
      disabled:false,
      uploadCustomize:null,
      title:'',
      starIcon : ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'],
      rateColor : ['#000','#000','#000','#000','#000'],
      starRating : 0 ,
      ratingStars:null,
      rating:false,
      userRatings:[],
      remark:'',
      reviewImages:[{link:null}],
      reviewVisible:false,
      loadingVisible:true,
      myStore:this.props.myStore,
      login:false,
      bundle:[],
      suggestion:[],
      totalratingscount:0,
      starCount:0,
      halfRated:false,
      showForm:false,
      storeData:null,
      offset:0,
      showMore:true,
      totalCartPrice:0,
      loader:false,
      imageView:false,
      keyboardOffset: 0,
      keyboardOpen : false,
    }
    this.offsetValue = {x: 0, y:0};
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
  )
    willFocus = props.navigation.addListener(
      'didFocus',
      payload => {

        NetInfo.fetch().then(state => {
          if(state.isConnected){
            // this.getInitial()
            this.getDetails(this.props.navigation.state.params.product)
            this.getUserfeedback(0,this.props.navigation.state.params.product)
          }
      })
      this.setState({imageView:false})
      }
    );
}

keyboardDidShow=(event)=> {
      this.setState({
          keyboardOpen:true,keyboardOffset: event.endCoordinates.height+27,
      })
  }

  keyboardDidHide=()=> {
      this.setState({
          keyboardOpen:false,keyboardOffset: 27,
      })
 }

rating = (count) => {
 let arr = ['#000','#000','#000','#000','#000'];
 let staricon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'];
 arr.forEach((val,index)=>{
   if(index>count-1)return;
   arr[index] = this.state.store.themeColor
 })
 staricon.forEach((val,index)=>{
   if(index>count-1)return;
   staricon[index] = 'ios-star'
 })
 this.setState({starIcon:staricon, rateColor:arr, starRating:count});
}


handleConnectivityChange=(state)=>{
    if(state.isConnected){
      this.setState({connectionStatus:true})
    }else{
      this.setState({connectionStatus : false})
      this.showNoInternet()
    }
}

getUserfeedback=(offset,pk)=>{
  fetch(SERVER_URL + '/api/POS/userfeedback/?product='+pk+'&limit=5&offset='+this.state.offset)
   .then((response) => response.json())
   .then((responseJson) => {
     if(responseJson==undefined){
       return
     }
     var arr = this.state.userRatings
     responseJson.results.forEach((i)=>{
       arr.push(i)
     })
     if(responseJson.count==arr.length){
       this.setState({showMore:false})
     }
      this.setState({userRatings:arr,offset:offset+5})
    })
   .catch((error) => {
     return;
   });
}


getInitial=async()=>{

  var pk =  await AsyncStorage.getItem('userpk');
  var login =  await AsyncStorage.getItem('login');
  var sessionid =  await AsyncStorage.getItem('sessionid');
  var csrf = await AsyncStorage.getItem('csrf');
  if(pk!=null&&JSON.parse(login)){
    this.setState({cartLoaderShow:true})

  await fetch(SERVER_URL + '/api/POS/getAllCart/?user='+pk+'&store='+this.state.store.pk,{
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
      this.props.setInitialFunction(arr,count)
      this.setState({cartItems:arr})

    })
    .catch((error) => {
      return
    });
  }else{
  }


}
// componentWillReceiveProps(nextProps){
//
//
//   var cartParent = nextProps.cart.map((item)=>{
//     return item.product
//   })
//
//   var cartVarient = nextProps.cart.map((item)=>{
//     return item.productVariant
//   })
//   if(this.state.product!=null){
//   var selected = this.state.selected
//    if(cartParent.includes(this.state.product.pk)){
//      if(cartVarient.includes(selected.options[this.state.secondOptionsIdx].pk)){
//        selected.options[this.state.secondOptionsIdx].count = nextProps.cart[cartVarient.indexOf(selected.options[this.state.secondOptionsIdx].pk)].count
//        selected.options[this.state.secondOptionsIdx].cart = nextProps.cart[cartVarient.indexOf(selected.options[this.state.secondOptionsIdx].pk)].cart
//      }
//    }
//    this.setState({selected:selected})
//  }
//
// }

componentWillMount() {
  StatusBar.setBarStyle('light-content',true)


this._panResponder = PanResponder.create({
  onMoveShouldSetResponderCapture: () => true,
 onMoveShouldSetPanResponderCapture: () => true,

 onPanResponderGrant: (e, gestureState) => {
    this.state.pan.setValue({x: 0, y: 0});
 },


 onPanResponderMove:Animated.event([
      null, {dx: this.state.pan.x, dy: this.state.pan.y},
    ]),

 onPanResponderRelease: (e, gestureState) => {
   this.offsetValue = {x: gestureState.dx, y: gestureState.dy}
   this.state.pan.setValue({x: 0, y: 0});
 }
});
}

  modalShow=(bool)=>{
    this.setState({customize:bool})
  }
  modalImage=(bool)=>{
    this.setState({imageVisible:bool})
  }

  calculateRating=(obj)=>{
    var count = ((1*obj.star_1)+(2*obj.star_2)+(3*obj.star_3)+(4*obj.star_4)+(5*obj.star_5))/obj.totalratingscount
    if(Number.isInteger(count)){
      this.setState({totalratingscount:obj.totalratingscount,starCount:count,halfRated:false})
    }else{
      count = count.toString().split('.')[0]
      this.setState({totalratingscount:obj.totalratingscount,starCount:count,halfRated:true})
    }
  }



  getDetails =(pk)=>{
    this.setState({cartItems:this.props.cart})
     fetch(SERVER_URL + '/api/POS/productDetails/'+pk +'/')
      .then((response) => response.json())
      .then((responseJson) => {
         var images = responseJson.options.options[0].options[0].images.map((item)=>{
           return item
         })
         // var cartParent = this.state.cartItems.map((item)=>{
         //   return item.product
         // })
         // var cartStore = this.state.cartItems.map((item)=>{
         //   return item.store
         // })
         var cartVarient = this.state.cartItems.map((item)=>{
           return item.pk
         })
         responseJson.options.options.forEach((item,idx)=>{
            item.options.forEach((i,child)=>{
              i.count = 0
              // if(cartParent.includes(responseJson.pk)){
                if(cartVarient.includes(i.pk)){
                  i.count = this.state.cartItems[cartVarient.indexOf(i.pk)].count
                  // i.cart = this.state.cartItems[cartVarient.indexOf(i.pk)].cart
                }
              // }
            })
         })
         this.setState({product:responseJson,storeData:responseJson.options.storeData,selected:responseJson.options.options[0],suggestion:responseJson.options.suggestion,bundle:responseJson.options.bundle,options:responseJson.options.options,images:images,selectedIdx:0,secondOptionsIdx:0,rating:responseJson.options.rating,ratingStars:responseJson.options.ratingstars})
         if(isFinite(String(responseJson.taxRate))){
           this.setState({taxRate:Number(responseJson.taxRate).toFixed(2)})
         }
         this.setState({unitType:responseJson.options.typ,gstType:responseJson.gstType,taxCode:responseJson.taxCode})
         this.calculateRating(responseJson.options.ratingstars)
         this.props.navigation.setParams({
           title:this.state.selected.options[this.state.secondOptionsIdx].displayName,
           onShare:this.onShare
         })
         // this.setState({productTitle:this.state.selected.options[this.state.secondOptionsIdx].displayName})
         this.getDiscount(pk,responseJson.options.options[0].options[0])
       })
      .catch((error) => {
        return
      });
  }
  getDiscount =(pk,selected)=>{
     fetch(SERVER_URL + '/api/POS/discountsv/?product='+pk )
      .then((response) => response.json())
      .then((responseJson) => {
         var discount = this.findDiscount(responseJson,selected.count)
         if(discount!=null){
           var salePrice = selected.sellingPrice-(selected.sellingPrice*(discount/100))
           var saleDiscount = selected.price-salePrice
         }else{
           var salePrice = selected.sellingPrice
           var saleDiscount = selected.price-salePrice
         }
         this.setState({discount:responseJson,salePrice:salePrice,saleDiscount:saleDiscount})
       })
      .catch((error) => {
        return
      });
  }


  componentWillUnmount() {
    StatusBar.setHidden(false)
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }



  getProduct=async(pk)=>{

    await fetch(SERVER_URL + '/api/POS/productlitesv/'+pk +'/')
      .then((response) => response.json())
      .then((responseJson) => {
        var count = [0]
        var varient = []
        var images = []
        var options = []
        responseJson.variant.forEach((item,index)=>{
          count.push(0)
          varient.push(item.pk)
          item.index = index+1
          var image = item.images.length >0?SERVER_URL+item.images[0].attachment:null;
          images.push({img:image})
          options.push(item)
        })
        this.setState({product:responseJson,selected:responseJson.variant[0],parent:true,options:options,images:images})

        this.state.cartItems.forEach((item,index)=>{
          if(item.pk == responseJson.product.pk){
            if(item.varient == null){
              count[0]=item.count
            }else{
              if(varient.includes(item.varient)){
                count[varient.indexOf(item.varient)+1]=item.count
              }
            }
          }
        })
        this.setState({cartCounts:count})
      })
      .catch((error) => {
        return
      });
  }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });

    this.setState({ primaryColor: themeColor })
    var product = this.props.navigation.getParam('product',null)
    var userScreen = this.props.navigation.getParam('userScreen',null)
    if(product!=null){
      this.setState({userScreen:userScreen})
    }
    this.getUser()
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
     this.rating(5)
  }

  getUser=async()=>{
    var pk =  await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    var login = await AsyncStorage.getItem('login');
    this.setState({user:pk,sessionid:sessionid,csrf:csrf,login:JSON.parse(login)})
  }

  login = () => {

    this.props.navigation.navigate(this.state.userScreen, {
      color: this.state.primaryColor
    })
  }

  gotoDiscoverScreen = ()=>{
    this.props.navigation.navigate('DiscoverSellerScreen', {
      color: this.state.primaryColor
    })
  }

  gotoChatScreen = async()=>{
    var login = await AsyncStorage.getItem("login")
     if(JSON.parse(login)){
       if(this.state.myStore.pk!=undefined){
          this.props.navigation.navigate('ChatListScreen', {
           color: this.state.primaryColor
         })
       }else{
         this.props.navigation.navigate('NewStore')
       }
     }else{
       this.login()
     }
  }


  search = () => {
    this.props.navigation.navigate('SearchBar', {
      color: this.state.primaryColor
    })
  }

  makeSelect=(index)=>{

  }

  // updateCart = (args) =>{
  //   if (args.type == actionTypes.ADD_TO_CART){
  //       this.props.addTocartFunction(args);
  //   }
  //   if (args.type == actionTypes.INCREASE_CART){
  //       this.props.increaseCartFunction(args);
  //
  //   }
  //   if (args.type == actionTypes.DECREASE_FROM_CART){
  //       this.props.decreaseFromCartFunction(args);
  //
  //   }
  //
  // }

  login = () => {

    this.props.navigation.navigate(this.state.userScreen, {
      color: this.state.primaryColor
    })
  }


  checkout=async()=>{

   var login = await AsyncStorage.getItem("login")

    if(JSON.parse(login)){
      if(this.props.counter > 0){
        this.props.navigation.navigate('CheckoutProducts', {
          color: this.state.primaryColor
      })
    }else{
        this.refs.toast.show('No Items Added in the Cart ')
      }


    }else{
      this.login()
    }


  }



  gotoCategories = ()=>{
    this.props.navigation.navigate('CategoriesScreen', {
      color: themeColor
    })
  }

  getUserPk = async()=>{
    var user = await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    if(user!=null){
      user = JSON.parse(user)
      var data = {user:user,csrf:csrf,sessionid:sessionid}
    }else{
      var data = {user:null,csrf:null,sessionid:null}
    }
    return data
  }

  postCart = (obj)=>{

    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;
    if(obj.user != null){
      this.setState({loader:true})
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
            this.setState({loader:false})
            if(responseJson!=undefined){
              obj.product = responseJson.product.pk,
              obj.productVariant = responseJson.productVariant.pk,
              obj.store = responseJson.store,
              obj.count = responseJson.qty,
              obj.sellingPrice = responseJson.sellingPrice,
              obj.mrp = responseJson.productVariant.price,
              obj.discount = responseJson.productVariant.price-responseJson.sellingPrice,
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
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = responseJson.qty
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].cart = responseJson.pk
              this.setState({options:options})
              this.updateCart(obj)
              this.setState({disabled:false})
              if(obj.customizable){
                this.attachShow(true,obj)
                return
              }
            }

          }).catch((err)=>{
            this.setState({loader:false})
          })

    }else{
      options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = obj.count
      this.setState({options:options})
      this.updateCart(obj)
      this.setState({disabled:false})
    }
    this.setState({disabled:false})

  }

  cartUpdate =(obj)=>{

    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;
    if(obj.user != null){
      var data = {
        qty:obj.count,
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
            this.setState({loader:false})
            if(responseJson!=undefined){
              obj.product = responseJson.product.pk,
              obj.productVariant = responseJson.productVariant.pk,
              obj.store = responseJson.store,
              obj.count = responseJson.qty,
              obj.sellingPrice = responseJson.sellingPrice,
              obj.mrp = responseJson.productVariant.price,
              obj.discount = responseJson.productVariant.price-responseJson.sellingPrice,
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
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = responseJson.qty
              this.setState({options:options})
              this.updateCart(obj)
              this.setState({disabled:false})
            }

          }).catch((err)=>{
            this.setState({loader:false})
          })

    }else{
      options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = obj.count
      this.setState({options:options})

      this.updateCart(obj)
      this.setState({disabled:false})
    }
    this.setState({disabled:false})
  }

  removeCart=(obj)=>{

    var sessionid =  this.state.sessionid;
    const csrf = this.state.csrf;
    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;
    if(obj.user != null){
      this.setState({loader:true})
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
            obj.count =1
            options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = 0
            this.setState({options:options})
            this.props.removeItemFunction(obj)
            this.setState({disabled:false})
            return
          }
          })
        .then((responseJson) => {
          this.setState({loader:false})
          return
        }).catch((err)=>{
          this.setState({loader:false})
        })
    }else{
      obj.count =1
      options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = 0
      this.setState({options:options})
      this.props.removeItemFunction(obj)
      this.setState({disabled:false})
    }
    this.setState({disabled:false})
  }

  cartAction = (type,typStr)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }
    var user =this.state.user
    if(user==null){
      this.props.navigation.navigate('LogInScreen')
      return
    }
    this.setState({disabled:true})

    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;

    var image = selected.images.length>0?selected.images[0].attachment:null
    if(typStr == 'add'){
      var count = selected.minQtyOrder
      var obj = {productVariant:selected.pk,store:this.state.store.pk,count:count,type:actionTypes.ADD_TO_CART}
      this.postServiceCart(obj)
      return
    }else if(typStr == 'increase'){
      var count = selected.count+1
      var obj = {productVariant:selected.pk,store:this.state.store.pk,count:count,type:actionTypes.INCREASE_CART}
      this.cartDataUpdate(obj)
      return
    }else{
      var count = selected.count-1
      var obj = {productVariant:selected.pk,store:this.state.store.pk,count:count,type:actionTypes.DECREASE_FROM_CART}
      this.cartDataUpdate(obj)
      return
    }
  }
    // var discount = this.findDiscount(this.state.discount,count)
    // if(discount!=null){
    //   var salePrice = selected.sellingPrice-(selected.sellingPrice*(discount/100))
    //   var saleDiscount = selected.price-salePrice
    // }else{
    //   var salePrice = selected.sellingPrice
    //   var saleDiscount = selected.price-salePrice
    // }
    // this.setState({salePrice:salePrice,saleDiscount:saleDiscount})
    // var totalPrice = selected.sellingPrice
    // var taxRate = this.state.product.taxRate
    // var gstType = this.state.product.gstType
    // var taxPrice = 0
    // if(gstType=='gst_extra'&&taxRate!=null){
    //   totalPrice = totalPrice+(totalPrice*taxRate)/100
    //   taxPrice = (selected.sellingPrice*taxRate)/100
    // }
    // if(taxRate==null){
    //   taxRate = 0
    // }
    // var obj = {product:this.state.product.pk,taxPrice:taxPrice,totalPrice:totalPrice*count,taxRate:taxRate,productVariant:selected.pk,store:this.state.store.pk,count:count,type:type,customizable:selected.customizable,sellingPrice:totalPrice,mrp:selected.price,stock:selected.stock,discount:selected.price-selected.sellingPrice,maxQtyOrder:selected.maxQtyOrder,minQtyOrder:selected.minQtyOrder,dp:image,displayName:selected.displayName,user:user,cart:selected.cart,bulkChart:this.state.discount,discountedPrice:salePrice}
    //
    // if(typStr == 'add'){
    //   this.postServiceCart(obj)
    // }else{
    //   if(count >= 1){
    //     this.cartUpdate(obj)
    //   }else{
    //     this.removeCart(obj)
    //   }
    // }



  cartDataUpdate=(obj)=>{

    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;
     console.log(obj.count,'jjjjjjjjjjjjjjjj');
      var data = {
        productVariant:obj.productVariant,
        store:obj.store,
        qty:obj.count
       }
       this.setState({loader:true})
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
            this.setState({disabled:false,loader:false})
            console.log(responseJson,'ptjhujthiop');
            if(responseJson!=undefined){
              if(responseJson.msg.length>0){
                this.refs.toast.show(responseJson.msg)
              }
              obj.pk = responseJson.pk
              obj.count = responseJson.qty
              obj.totalPrice = responseJson.price
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = responseJson.qty
              this.setState({options:options})
              if(responseJson.qty==0){
                obj.type = 'delete'
              }
              this.updateCart(obj)
              this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
              this.setState({disabled:false,loader:false})
            }
          }).catch((err)=>{
            this.setState({disabled:false,loader:false})
          })


  }

  postServiceCart = (obj)=>{

    var sessionid =  this.state.sessionid;
    var csrf = this.state.csrf;
    var selected = this.state.selected.options[this.state.secondOptionsIdx];
    var options = this.state.options;
      this.setState({loader:true})
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
            this.setState({disabled:false,loader:false})
            if(responseJson!=undefined){
              if(responseJson.msg.length>0){
                this.refs.toast.show(responseJson.msg)
              }
              obj.pk = responseJson.pk
              obj.count = responseJson.qty
              obj.totalPrice = responseJson.price
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].count = responseJson.qty
              options[this.state.selectedIdx].options[this.state.secondOptionsIdx].cart = responseJson.pk
              this.setState({options:options})
              this.updateCart(obj)
              this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
              this.setState({disabled:false,loader:false})
              if(obj.customizable){
                this.attachShow(true,obj)
                return
              }
            }

          }).catch((err)=>{
            this.setState({disabled:false,loader:false})
          })

  }

  renderHeader = () => {

    return (
      <View style={{paddingVertical: 10,flex:1,backgroundColor:this.state.store.themeColor,flexDirection: 'row'}}>
        <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#fff'}}>Quantity</MonoText>
        </View>
        <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#fff'}}>Discount</MonoText>
        </View>
        <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#fff'}}>Unit Price</MonoText>
        </View>
      </View>
    )
   };

  renderWarranty = () => {
    var product = this.state.selected;
    if(product.options[this.state.secondOptionsIdx].isWarranty){
      return (
        <View style={{flex:1,backgroundColor:'#fff',marginHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',marginVertical:15}}>
          <View style={{paddingVertical: 10,flex:1,backgroundColor:this.state.store.themeColor,justifyContent:'center',alignItems:'center'}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#fff'}}>Warranty</MonoText>
          </View>
          <View style={{paddingVertical: 10,flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',flexDirection: 'row',}}>
            <View style={{flex:0.4,alignItems: 'center',justifyContent: 'center',}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>Type</MonoText>
            </View>
            <View style={{flex:0.6,alignItems: 'flex-start',justifyContent: 'center'}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>{product.options[this.state.secondOptionsIdx].warrantyType}</MonoText>
            </View>
          </View>
          <View style={{paddingVertical: 10,flex:1,backgroundColor:'#f2f2f2',justifyContent:'center',alignItems:'center',flexDirection: 'row',}}>
            <View style={{flex:0.4,alignItems: 'center',justifyContent: 'center',}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>Period</MonoText>
            </View>
            <View style={{flex:0.6,alignItems: 'flex-start',justifyContent: 'center'}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>{product.options[this.state.secondOptionsIdx].warrantyPeriod} {product.options[this.state.secondOptionsIdx].warrantyLimit}</MonoText>
            </View>
          </View>
          <View style={{paddingVertical: 10,flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',flexDirection: 'row',}}>
            <View style={{flex:0.4,alignItems: 'center',justifyContent: 'center',}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>Provider</MonoText>
            </View>
            <View style={{flex:0.6,alignItems: 'flex-start',justifyContent: 'center'}}>
              <MonoText  style={{ fontSize: 16,fontWeight: '600',color:'#000'}}>{product.options[this.state.secondOptionsIdx].warrantyProvider}</MonoText>
            </View>
          </View>

        </View>
      )
    }else{
      return null
    }

   };




  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.makeSelect(page)
      this.setState({selectdImgTab:page})
    }
  }

  attachShow=async(bool,obj)=>{
    const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({customize:bool,uploadCustomize:obj})
        }else{
          this.getCameraRollAsync(obj)
        }
      }else{
        this.getCameraAsync(obj)
      }

  }
  attachReview=async(bool)=>{
    const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({reviewVisible:bool})
        }else{
          this.getCameraRollreview()
        }
      }else{
        this.getCamerareview(obj)
      }

  }

      modalAttach =async (event) => {
        if(event == 'gallery') return this._pickImage();
        if(event == 'camera') {
          this.handlePhoto()
        }
      };
      modalReview =async (event) => {
        if(event == 'gallery') return this._pickImageReview();
        if(event == 'camera') {
          this.handlePhotoReview()
        }
      };

      getCamerareview=async()=> {

      const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
      if (status === 'granted') {
        this.attachReview(true)
      } else {
        throw new Error('Camera permission not granted');
      }
    }
      getCameraAsync=async(obj)=> {

      const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
      if (status === 'granted') {
        this.attachShow(true,obj)
      } else {
        throw new Error('Camera permission not granted');
      }
    }

     getCameraRollAsync=async(obj)=> {

      const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        this.attachShow(true,obj)
      } else {
        throw new Error('Gallery permission not granted');
      }
    }
     getCameraRollreview=async(obj)=> {

      const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        this.attachReview(true)
      } else {
        throw new Error('Gallery permission not granted');
      }
    }


      _pickImage = async () => {

          let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: true
         });
          let img = new FormData();
          let filename = result.uri.split('/').pop();
          let match = /\.(\w+)$/.exec(filename);

          var type = match ? `image/${match[1]}` : `image`;


          const photo = {
            uri: result.uri,
            type: type,
            name:filename,
          };

          this.setState({ customizeImage: photo });

     };
      _pickImageReview = async () => {
        let csrf = await AsyncStorage.getItem('csrf');
        let sessionid = await AsyncStorage.getItem('sessionid');

          let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: true
         });

          let filename = result.uri.split('/').pop();
          let match = /\.(\w+)$/.exec(filename);

          var type = match ? `image/${match[1]}` : `image`;


          const photo = {
            uri: result.uri,
            type: type,
            name:filename,
          };
          var formData = new FormData();
          if(photo.uri ==null||photo.name == null ){
            this.attachReview(false)
            return
          }

          formData.append("file",photo);
          fetch(SERVER_URL+'/api/POS/saveimageapi/', {
             method: 'POST',
             headers: {
               "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
               'Content-Type': 'multipart/form-data;',
               'X-CSRFToken':csrf,
               'Referer': SERVER_URL,
             },
             body:formData,
             }).then((response) =>{
                return response.json()
             }).then((json) => {
               var images =this.state.reviewImages;
               images.unshift(json)
               this.setState({reviewImages:images});
           }).catch((error) => {
               return
           });
          this.attachReview(false)

     };
    handlePhoto = async () => {

     let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});

     if(picture.cancelled == true){
       return
     }


     let img = new FormData();
     let filename = picture.uri.split('/').pop();
     let match = /\.(\w+)$/.exec(filename);
     let type = match ? `image/${match[1]}` : `image`;

     const photo = {
       uri: picture.uri,
       type: type,
       name:filename,
     };

     this.setState({ customizeImage: photo });

    }
    handlePhotoReview = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
     let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});

     if(picture.cancelled == true){
       return
     }



     let filename = picture.uri.split('/').pop();
     let match = /\.(\w+)$/.exec(filename);
     let type = match ? `image/${match[1]}` : `image`;

     const photo = {
       uri: picture.uri,
       type: type,
       name:filename,
     };

     var formData = new FormData();
     if(photo.uri ==null||photo.name == null ){
       this.attachReview(false)
       return
     }

     formData.append("file",photo);
     fetch(SERVER_URL+'/api/POS/saveimageapi/', {
        method: 'POST',
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Content-Type': 'multipart/form-data;',
          'X-CSRFToken':csrf,
          'Referer': SERVER_URL,
        },
        body:formData,
        }).then((response) =>{
           return response.json()
        }).then((json) => {
          var images =this.state.reviewImages;
          images.unshift(json)
          this.setState({reviewImages:images});
      }).catch((error) => {
          return
      });
     this.attachReview(false)

    }

    getCustomize = async()=>{
      return
      await fetch(SERVER_URL + '/api/ecommerce/customization/')
        .then((response) => response.json())
        .then((responseJson) => {
          var listPk = []
          responseJson.forEach((item,idx)=>{
            listPk.push(item.pk)
          })
          this.setState({customizePks:listPk})
          this.checkCustomize(listPk)
        })
        .catch((error) => {
          return
        });
    }

    checkCustomize = async(listPk)=>{
      let customize =await AsyncStorage.getItem('customize')
      customize = JSON.parse(customize)
      var newCustomize = []
      if(customize!=null){
        customize.forEach((item,idx)=>{
          if(listPk.includes(item.customizePk)){
            newCustomize.push(item)
          }
        })
        AsyncStorage.setItem('customize', JSON.stringify(newCustomize));
        this.setState({storeCustomPk:newCustomize})
        newCustomize.forEach((item)=>{
          if(this.state.product.product.pk == item.parent&&item.varient == null){
            this.setState({instruction:item.text,customizeImage:item.image,})
          }
        })
      }else{
        AsyncStorage.setItem('customize',  JSON.stringify([]));
      }
    }

    setCustomize=async(obj)=>{
      let customize =await AsyncStorage.getItem('customize')
      customize = JSON.parse(customize)
      var valueReturn = null
      if(customize!=null){
        customize.forEach((item,idx)=>{
          if(obj.parent==item.parent&&obj.varient==item.varient){
            valueReturn = item.customizePk
            item.customizePk = obj.customizePk
          }else{
            customize.push(obj)
          }
        })
        AsyncStorage.setItem('customize', JSON.stringify(customize));
      }else{
        AsyncStorage.setItem('customize',  JSON.stringify([obj]));
      }
    }

    renderHeaderColor=()=>{
      return(
        <View><MonoText  style={{ color:'#000',fontSize:15,fontWeight: '600'}}>Color</MonoText> </View>
      )
    }

    updateCart = (args) =>{
      if(args.type == 'delete'){
        this.props.removeItemFunction(args)
        return
      }
      if (args.type == actionTypes.ADD_TO_CART){
          this.props.addTocartFunction(args);
      }
      if (args.type == actionTypes.INCREASE_CART){
          this.props.increaseCartFunction(args);
      }
      if (args.type == actionTypes.DECREASE_FROM_CART){
          this.props.decreaseFromCartFunction(args);
      }

    }

    uploadCustomization=()=>{
      var formData  = new FormData();
      formData.append('customFile', this.state.customizeImage);
      formData.append('customDetails', this.state.instruction);

      fetch(SERVER_URL +'/api/POS/cart/'+this.state.uploadCustomize.cart+'/', {
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

          this.setState({instruction:'',customizeImage:null})
          this.attachShow(false,null)
        })
        .catch((error) => {
          return
        });
    }

    removeCustomization=()=>{
       this.attachShow(false,null)
    }

    removeReview=(index)=>{
       var img = this.state.reviewImages
       img.splice(index,1)
       this.setState({reviewImages:img})
    }

    optionsChange=(item,idx)=>{
      var options = this.state.options
      var selected = options[idx]
      this.setState({selectedIdx:idx,secondOptionsIdx:0})
      // if(selected.options.length-1<=this.state.secondOptionsIdx){
        this.setState({selected:selected,images:selected.options[0].images,})
        this.props.navigation.setParams({
          title:selected.options[0].displayName,
        })
        this.scrollImage.scrollTo({x:0})
        var cartParent = this.state.cartItems.map((item)=>{
          return item.product
        })
        var cartVarient = this.state.cartItems.map((item)=>{
          return item.productVariant
        })
        //
        if(cartParent.includes(this.state.product.pk)){
          if(cartVarient.includes(selected.options[0].pk)){
            selected.options[0].count = this.state.cartItems[cartVarient.indexOf(selected.options[0].pk)].count
            selected.options[0].cart = this.state.cartItems[cartVarient.indexOf(selected.options[0].pk)].cart
          }
        }
       this.setState({loader:false,})
      // }else{
      //   this.setState({selected:selected,images:selected.options[this.state.secondOptionsIdx].images})
      // }
    }

    findDiscount=(discountArr,qty)=>{
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

    showNoInternet=()=>{
      if(this.refs.toast!=undefined){
        this.refs.toast.show('No Internet Connection')
      }
    }



    checkLogin = async()=>{
      var login = await  AsyncStorage.getItem('login');
      if(login == 'true'){
        this.props.navigation.navigate('GiftSection')
      }else{
        this.props.navigation.navigate('LogInScreen')
      }
    }

    gotoProfile = ()=>{
      this.props.navigation.navigate('ProfileScreen', {
        color: this.state.store.themeColor
      })
    }
    gotoHome = ()=>{
      this.props.navigation.navigate('HomeScreen')
    }

    showtoast=(text)=>{
      this.refs.toast.show(text);
      return
    }


   giveRating=async()=>{
     var sessionid =  await AsyncStorage.getItem('sessionid');
     var csrf = await AsyncStorage.getItem('csrf');
     if(this.state.starRating==0){
       return
     }
     var images =''
     var url = SERVER_URL.split('//')[1]
     this.state.reviewImages.forEach((i,idx)=>{
       if(i.link!=null){
         if(idx!=0){
           images += '||'+'//'+url+i.link
         }else if(idx==0){
           images += '//'+url+i.link
         }
       }
     })
     var data = {
       description:this.state.remark,
       image:images,
       product:this.state.product.pk,
       rating:this.state.starRating,
       title:this.state.title
     }
     if(data.description.length<1){
       this.refs.toast.show('Write Description about Product !');
       return
     }
     if(data.title.length<1){
       this.refs.toast.show('Please Add Title!');
       return
     }
     if(csrf!=null){

       fetch(SERVER_URL +'/api/POS/userfeedback/' , {
         method: 'POST',
         headers:{
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Content-Type': 'application/json',
           'X-CSRFToken':csrf,
           'Referer': SERVER_URL,
         },
         body: JSON.stringify(data)
       })
       .then((response) => {
         if(response.status==201||response.status==200){
           this.refs.toast.show('Feedback Posted Sucessfully...');
           return response.json()
         }else{
           this.refs.toast.show('Something went wrong...');
           return undefined
         }
       })
       .then((responseJson) => {
         this.textInput.clear()
         this.setState({title:' ',remark:' ',reviewImages:[{link:null}],starRating:0})
         this.getDetails(this.state.product.pk)
         if(responseJson==undefined){
           return
         }
       })
     }
   }

    starFeedBack=()=>{
      var starRating = this.state.ratingStars
      var themeColor = this.state.store.themeColor
      if(starRating!=null){
        var total = starRating.totalratingscount
        var star1 = Math.round((starRating.star_1/total)*100)
        var star2 = Math.round((starRating.star_2/total)*100)
        var star3 = Math.round((starRating.star_3/total)*100)
        var star4 = Math.round((starRating.star_4/total)*100)
        var star5 = Math.round((starRating.star_5/total)*100)
      }else{
        var total = 0
        var star1 = 0
        var star2 = 0
        var star3 = 0
        var star4 = 0
        var star5 = 0
      }
      if(isNaN(star1)){
        var star1 = 0
        var star2 = 0
        var star3 = 0
        var star4 = 0
        var star5 = 0
      }
      return(
        <View style={{flex:1,marginVertical:15,}}>
        <MonoText  style={{ fontSize:16,color:'#000',fontWeight:'700'}}>Ratings</MonoText>
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <View style={[{width:width/2,}]}>
            <View style={{flexDirection:'row',marginTop:10}}>
              <View style={{width:40}}>
                <MonoText  style={{ color:'grey',fontSize:15}}>{star1}%</MonoText>
              </View>
              <StarRating rating={1} size={20} color={themeColor}/>
            </View>
            <View style={{flexDirection:'row',marginTop:10}}>
              <View style={{width:40}}>
                <MonoText  style={{ color:'grey',fontSize:15}}>{star2}%</MonoText>
              </View>
              <StarRating rating={2} size={20} color={themeColor} />
            </View>
            <View style={{flexDirection:'row',marginTop:10}}>
              <View style={{width:40}}>
                <MonoText  style={{ color:'grey',fontSize:15}}>{star3}%</MonoText>
              </View>
              <StarRating rating={3} size={20} color={themeColor} />
            </View>
            <View style={{flexDirection:'row',marginTop:10}}>
              <View style={{width:40}}>
                <MonoText  style={{ color:'grey',fontSize:15}}>{star4}%</MonoText>
              </View>
              <StarRating rating={4} size={20} color={themeColor} />
            </View>
            <View style={{flexDirection:'row',marginTop:10}}>
              <View style={{width:40}}>
                <MonoText  style={{ color:'grey',fontSize:15}}>{star5}%</MonoText>
              </View>
              <StarRating rating={5} size={20} color={themeColor} />
            </View>
          </View>
        </View>
        </View>
      )
    }

    goToChat=async()=>{

      var userName = await AsyncStorage.getItem('user_name');
      var login = await AsyncStorage.getItem('userpk');
      if(JSON.parse(login)){
        this.props.navigation.navigate('TalkToSeller',{chatWith:this.state.owner,store:null,storePk:this.state.storeData.pk,userName:JSON.parse(userName)})
      }else{
        this.props.navigation.navigate('LogInScreen')

      }
    }

    onShare = async () => {
      var name = this.state.selected.options[this.state.secondOptionsIdx].displayName.split(' ').join('-').split('/').join('-')
      var url = SERVER_URL+'/details/'+this.state.product.pk+'/'+name+'/'
      // var url = '/details/'+this.state.product.pk+'/'+name+'/'
      // console.log();
      // return
      var message = productShareMessage +' '+ this.state.selected.options[this.state.secondOptionsIdx].displayName
      // Linking.makeUrl(
      try {
        const result = await Share.share({
          message: message+'\n\nView Product Details '+url,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error.message);
      }
    };

  render() {
    let {loadingVisible,gstType,taxCode,taxRate,unitType} = this.state
    let position = Animated.divide(this.state.scrollX, width);
    let [translateX, translateY,scale] = [this.state.pan.x, this.state.pan.y,this.state.scale]
    var themeColor = this.state.store.themeColor
    let val = this.state.selectdImgTab
    var rangeOfInput = []
    var rangeOfOutput= []
    if(this.state.images!=undefined){
      this.state.images.forEach((item,idx)=>{
        rangeOfInput.push(idx*width)
        rangeOfOutput.push(idx*12)
      })
    }
    if(rangeOfInput.length<2){
      var rangeOfInput = [0,1*width]
      var rangeOfOutput= [0,0]
    }
    let left = this.state.scrollX.interpolate({
      inputRange:rangeOfInput,
      outputRange: rangeOfOutput,
      extrapolate: 'clamp',
      useNativeDriver:true
    });


    var {counter} = this.props
    counter = counter.toString()


    if(this.state.product!=null){
      var product = this.state.selected;
      var name = product.options[this.state.secondOptionsIdx].displayName;
      var price = product.options[this.state.secondOptionsIdx].price.toFixed(2);
      var withoutGSTPrice = product.options[this.state.secondOptionsIdx].sellingPrice
      var discountDetail = this.findDiscount(this.state.discount,product.options[this.state.secondOptionsIdx].count)
      if(discountDetail!=null){
        var sellingPrice = product.options[this.state.secondOptionsIdx].sellingPrice-(product.options[this.state.secondOptionsIdx].sellingPrice*(discountDetail/100))
        withoutGSTPrice = sellingPrice
        if(gstType=='gst_included'){
          withoutGSTPrice = sellingPrice-(sellingPrice*taxRate)/100
        }else if (gstType=='gst_extra') {
          withoutGSTPrice = sellingPrice
          sellingPrice = sellingPrice+(sellingPrice*taxRate)/100
        }else if (gstType=='gst_not_applicable') {
          withoutGSTPrice = sellingPrice
        }
      }else{
        var sellingPrice = product.options[this.state.secondOptionsIdx].sellingPrice
        if(gstType=='gst_included'){
          withoutGSTPrice = sellingPrice-(sellingPrice*taxRate)/100
        }else if (gstType=='gst_extra') {
          withoutGSTPrice = sellingPrice
          sellingPrice = sellingPrice+(sellingPrice*taxRate)/100
        }else if (gstType=='gst_not_applicable') {
          withoutGSTPrice = sellingPrice
        }
      }
      var discount = Math.round(((product.options[this.state.secondOptionsIdx].price-sellingPrice)*100)/product.options[this.state.secondOptionsIdx].price);
      var stock = product.options[this.state.secondOptionsIdx].stock;

      var totalCartPrice = 0
      this.state.cartItems.forEach((i)=>{
        totalCartPrice+=i.totalPrice
      })

      return (
        <View style={{flex:1,}}>
          <View style={{flex:1}}>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <ScrollView style={{marginBottom: this.state.keyboardOpen?0:width * 0.15}} >
              <View style={{alignItems: 'center',paddingVertical:10,}}>
                <ScrollView
                  horizontal={true}
                  pagingEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  ref={(node) => {this.scrollImage = node}}
                  onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: this.state.scrollX } } }] )}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={this.handlePageChange}
                  >
                  {this.state.images.map((item, i) => {
                    var uri = SERVER_URL+item.attachment
                      return (
                        <View key={i} style={{backgroundColor: '#fff',width:width*1,paddingVertical: 5,paddingHorizontal: 25,paddingTop: 0,alignItems: 'center',justifyContent: 'center'}}>
                        <TouchableWithoutFeedback onPress={()=>{this.setState({imageView:true});this.props.navigation.navigate('ImageViewScreen',{images:this.state.images,selected:i,color:themeColor})}}>
                         <Image key={i} style={{width:width*0.6,height:width*0.6,resizeMode: 'contain'}}   source={{uri:uri}}/>
                        </TouchableWithoutFeedback>
                        </View>
                      );
                    })}
                    {this.state.images.length<1&&
                      <View style={{backgroundColor: '#fff',width:width*1,height:(width*0.6),paddingVertical: 5,paddingHorizontal: 25,paddingTop: 0,}} >
                      </View>
                    }
                </ScrollView>

              </View>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View
                style={{ flexDirection: 'row' }}>
                {this.state.images.map((_, i) => {
                  let opacity = position.interpolate({
                     inputRange: [i - 1, i, i + 1],
                     outputRange: [0.3, 1, 0.3],
                     extrapolate: 'clamp'
                   });
                  return (
                    <Animated.View
                      key={i}
                      style={{ height: 6, width: 6, backgroundColor: '#595959', margin: 3, borderRadius: 5,opacity:0.3 }}
                    />
                  );
                })}
                {this.state.images.length>0&&
                  <Animated.View style={{position:'absolute',left:0,top:0, height: 6, width: 6, backgroundColor: themeColor, margin: 3, borderRadius: 5 ,  transform: [{translateX:left}]}}
                  />

                }
                </View>
              </View>
              {/*<View style={{alignItems:'flex-end',justifyContent:'flex-end',marginRight:25}}>
                <TouchableOpacity onPress={()=>{this.onShare()}}>
                  <FontAwesome color={themeColor} name="share-alt" size={25}/>
                </TouchableOpacity>
              </View>*/}
              <View style={{margin:15,marginBottom:5}}>
                {/*<Animated.View style={{opacity:headerOpacity,transform: [{scale: headerScale}]}}>*/}
                <MonoText  style={{ color:'#000',fontWeight:'700',fontSize:18}}>{this.state.selected.options[this.state.secondOptionsIdx].displayName}</MonoText>
                {/*</Animated.View>*/}
              </View>

                <View style={{ flex: 1,marginVertical:10,}}>
                {this.state.options.length>1?
                  <View style={{ flex: 1,}}>
                  <MonoText  style={{ color:'#000',fontSize:15,fontWeight: '600',paddingLeft: 15}}>{unitType}</MonoText>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                    <View style={{flexDirection:'row',}}>
                      <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 5, paddingLeft: 0,marginBottom:10,paddingBottom:0,paddingLeft: 15}}
                      data={this.state.options}
                      keyExtractor={(item,index) => {
                        return index.toString();
                      }}
                      extraData={this.state}
                      horizontal={true}
                      nestedScrollEnabled={true}
                      renderItem={({item, index}) => (
                        <View>
                        <TouchableOpacity disabled={this.state.loader} onPress={()=>this.optionsChange(item,index)} style={{backgroundColor:this.state.selectedIdx==index?themeColor:'#fff',height:30,minWidth:40,marginRight:10,borderRadius: 5,borderWidth:1,borderColor:this.state.selectedIdx==index?themeColor:'grey',alignItems: 'center',justifyContent: 'center',paddingHorizontal: 10,}}>
                          <MonoText  style={{ color:this.state.selectedIdx==index?'#fff':'grey'}}>{item.value}</MonoText>
                        </TouchableOpacity>
                        </View>
                      )}
                      />
                    </View>
                  </ScrollView>
                  </View>:null
                }
                  <View style={{ flex: 1,}}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                      <View style={{}}>
                      {this.state.selected.options[this.state.secondOptionsIdx].value2!=null&&
                        <View>
                        <MonoText  style={{ color:'#000',fontSize:15,fontWeight: '600',paddingLeft: 15}}>Color</MonoText>
                        </View>
                      }

                      {this.state.selected.options[this.state.secondOptionsIdx].value2!=null&&
                        <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 0, paddingLeft: 15,marginBottom:0,paddingBottom:0}}
                        data={this.state.selected.options}
                        keyExtractor={(item,index) => {
                          return index.toString();
                        }}
                        extraData={this.state}
                        horizontal={true}

                        nestedScrollEnabled={true}
                        renderItem={({item, index}) => (
                          <View style={{justifyContent: 'center',height:30}}>
                          <TouchableOpacity disabled={this.state.loader} onPress={()=>this.setState({ secondOptionsIdx: index,images:this.state.selected.options[index].images })} style={{backgroundColor: item.value2,width:index==this.state.secondOptionsIdx?26:22,height:index==this.state.secondOptionsIdx?26:22,marginRight:20,borderRadius: index==this.state.secondOptionsIdx?13:11}}>
                          </TouchableOpacity>
                          </View>
                        )}
                        />
                      }
                      </View>
                    </ScrollView>
                  </View>
                </View>




              <View style={{marginHorizontal: 15,marginBottom: 20,flexDirection: 'row'}}>
               <View style={{flex:1}}>
                  {this.state.rating&&
                  <View style={{flexDirection:'row'}}>
                    <View style={{width:100}}>
                      <StarRating rating={this.state.starCount} halfRated={this.state.halfRated} size={15} color={themeColor} />
                    </View>
                    <MonoText  style={{ fontSize:14,color:themeColor,marginLeft:5,fontWeight: '600',marginTop:-3}}>{this.state.totalratingscount} {this.state.totalratingscount<2?'rating':'ratings'}</MonoText>
                  </View>
                 }
                </View>

              </View>

              <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingBottom:20}}>
                {/*<View style={{flex:1, paddingLeft:20}}>
                  <MonoText  style={{ fontSize:16,color:'#000',fontWeight:'700',}}>Price/unit</MonoText>
                </View>*/}
                <View style={{flex:1,flexDirection:'row',paddingHorizontal:20}}>
                  <View style={{flex:0.6,justifyContent: 'flex-start'}}>
                    <MonoText  style={{ fontSize:17,color:'grey',textDecorationLine: 'line-through', textDecorationStyle: 'solid',fontWeight: '700',}}>&#8377;{price}/{unitType}</MonoText>
                    <MonoText  style={{ fontSize:17,color:'#000',fontWeight: '700',marginTop:5}}>&#8377;{sellingPrice}/{unitType}  </MonoText>
                    <MonoText  style={{ fontSize:15,color:'grey',fontWeight: '600',textAlign:'left',marginTop:5}}>(&#8377;{withoutGSTPrice} + {taxRate}% GST)</MonoText>
                  </View>
                  <View style={{flex:0.4,alignItems: 'flex-end',justifyContent: 'flex-end'}}>
                  {!this.state.loader&&stock!=null&&this.state.selected.options[this.state.secondOptionsIdx].count==0&&
                      <TouchableOpacity style={{backgroundColor:themeColor,alignItems: 'center',height:30,width:'80%',justifyContent: 'center'}} onPress={() =>{this.cartAction(actionTypes.ADD_TO_CART,'add')}} disabled={this.state.disabled}>
                        <MonoText  style={{ color:'#fff' , fontSize : 13,fontWeight:'700'}}> Add To Cart <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
                      </TouchableOpacity>
                    }
                    {!this.state.loader&&stock!=null&&this.state.selected.options[this.state.secondOptionsIdx].count>0&&
                      <View style={{backgroundColor:'#fff',flex:1,alignItems: 'flex-end',justifyContent: 'flex-end',width:'80%'}} >
                        <View style={{height:30,flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                         <TouchableOpacity style={{flex:0.3,backgroundColor:themeColor,height:'100%',alignItems: 'center',justifyContent: 'center'}} onPress={() => {this.cartAction(actionTypes.DECREASE_FROM_CART,'decrease')}} disabled={this.state.disabled}>
                            <MonoText  style={{ color:'#fff' , fontSize : 15,fontWeight:'700'}}>-</MonoText>
                         </TouchableOpacity>
                         <View style={{flex:0.4,height:'100%',alignItems: 'center',justifyContent: 'center'}}>
                            <MonoText  style={{ color:'#000' , fontSize : 13,fontWeight:'700',paddingHorizontal:2}}>{this.state.selected.options[this.state.secondOptionsIdx].count}</MonoText>
                         </View>
                         <TouchableOpacity style={{flex:0.3,backgroundColor:themeColor,height:'100%',alignItems: 'center',justifyContent: 'center'}} onPress={() => {this.cartAction(actionTypes.INCREASE_CART,'increase')}} disabled={this.state.disabled}>
                            <MonoText  style={{ color:'#fff' , fontSize : 15,fontWeight:'700'}}>+</MonoText>
                         </TouchableOpacity>
                        </View>
                      </View>
                    }
                    {this.state.loader&&
                      <View style={{backgroundColor:'#fff',alignItems: 'center',height:30,width:'80%',justifyContent: 'center',}}>
                      <ActivityIndicator size={20} color={themeColor} />
                      </View>
                   }
                    {stock==null&&
                      <View style={{backgroundColor:'red',alignItems: 'center',height:30,width:'80%',justifyContent: 'center',}}>
                      <MonoText  style={{  color:'#fff' , fontSize : 13,fontWeight:'700' }}>SOLD OUT</MonoText>
                      </View>
                   }

                  </View>
                </View>
              </View>
              <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingVertical:15}}>
                <View style={{flex:0.5,paddingLeft:20}}>
                  <MonoText  style={{ fontSize:16,color:'#000',fontWeight:'700',}}>Saved</MonoText>
                </View>
                <View style={{flex:0.5,alignItems:'flex-end',paddingRight:20}}>
                  <MonoText  style={{ fontSize:16,color:'green',fontWeight: '600',textAlign:'right'}}>{discount}% OFF </MonoText>
                </View>
              </View>
              <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingVertical:15,}}>
                <View style={{flex:0.5,paddingLeft:20}}>
                  <MonoText  style={{ fontSize:16,color:'#000',fontWeight:'700',}}>MOQ</MonoText>
                </View>
                <View style={{flex:0.5,alignItems:'flex-end',paddingRight:20}}>
                  <MonoText  style={{ fontSize:16,color:'#000',fontWeight:'700',}}>{product.options[this.state.secondOptionsIdx].minQtyOrder} {unitType}</MonoText>
                </View>
              </View>

              {this.state.product.detailedDescription != null&&
              <View style={{marginHorizontal: 15,marginTop: 15}}>
                <MonoText  style={{ fontWeight:'700',fontSize:16,color:'#000',}} >Product Details</MonoText>
                <HTMLView value = {"<div>"+this.state.product.detailedDescription+"</div>"} stylesheet={styles}/>
              </View>
             }

             {this.state.storeData!=null&&this.state.storeData!=undefined&&storeType=='MULTI-VENDOR'&&
             <View style={{}}>
                <View style={{flexDirection:'row',paddingVertical:15,paddingHorizontal:20,borderBottomWidth:1,borderColor:'#f2f2f2',}}>
                  <View style={{flex:1,alignItems:'flex-start'}} >
                    <MonoText  style={{ color:'#000',fontSize:16,fontWeight:'700'}}>Seller Info</MonoText>
                  </View>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('SellerDetails',{sellerPk:this.state.storeData.pk})}} style={{flex:1,alignItems:'flex-end'}} >
                    <MonoText  style={{ color:themeColor,fontSize:16,fontWeight:'700'}}>View</MonoText>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row',paddingVertical:10,paddingHorizontal:15}}>
                  <View style={{flex:0.2,alignItems:'flex-start',justifyContent:'center'}}>
                      <View style={{height:40,width:40,borderRadius:20,backgroundColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                        <MonoText  style={{ fontSize:22,color:'#fff'}}>{this.state.storeData.name!=undefined?this.state.storeData.name.charAt(0):''}</MonoText>
                      </View>
                  </View>
                  <View style={{flex:0.8,alignItems:'flex-start',justifyContent:'center',}}>
                      <MonoText  style={{ fontSize:18,color:'#000'}}>{this.state.storeData.name} <MonoText  style={{ fontSize:14}}>({this.state.storeData.vendorType})</MonoText> </MonoText>
                      <View style={{flexDirection:'row',justifyContent:'center'}}>
                        <View style={{marginTop:3}}>
                          <FontAwesome  name="map-marker" size={20} color={themeColor} />
                        </View>
                        <MonoText  style={{ fontSize:16,color:'#000',marginLeft:5}}>{this.state.storeData.address}</MonoText>
                      </View>
                  </View>
                </View>
                <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',paddingBottom:15,paddingHorizontal:15}}>
                  {chatView&&<TouchableOpacity onPress={()=>{this.goToChat()}} style={{alignItems:'center',justifyContent:'center',height:40,flexDirection:'row',backgroundColor:'#f2f2f2'}}>
                    <FontAwesome  name="wechat" size={25} color={themeColor} />
                    <MonoText  style={{ color:themeColor,fontSize:16,marginLeft:5}}>Chat with seller Now</MonoText>
                  </TouchableOpacity>}
                </View>
             </View>
            }
            {this.renderWarranty()}
            {this.state.discount.length>0&&
            <View style={{marginHorizontal: 15,marginBottom: 20}}>
            <MonoText  style={{ fontWeight:'700',fontSize:16,color:'#000',marginVertical: 10,}} >Available Offers</MonoText>
            <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',}}
            data={this.state.discount}
            keyExtractor={(item,index) => {
              return index.toString();
            }}
            ListHeaderComponent={this.renderHeader}
            nestedScrollEnabled={true}
            renderItem={({item, index}) => (
              <View style={{paddingVertical: 10,flex:1,backgroundColor:(index+1)%2==0?'#f2f2f2':'#fff',flexDirection: 'row',borderRightWidth: 1,borderLeftWidth: 1,borderColor: '#f2f2f2'}}>
                <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                  <MonoText  style={{ fontSize: 18,fontWeight: '400',color:'#000'}}>{item.qty}</MonoText>
                </View>
                <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                  <MonoText  style={{ fontSize: 18,fontWeight: '400',color:'#000'}}>{Math.round(Number(item.discount))}%</MonoText>
                </View>
                <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                  <MonoText  style={{ fontSize: 18,fontWeight: '400',color:'#000'}}>{Math.round(product.options[this.state.secondOptionsIdx].sellingPrice-(product.options[this.state.secondOptionsIdx].sellingPrice*(Math.round(Number(item.discount))/100)))}</MonoText>
                </View>
              </View>
            )}
            />
            </View>
            }

             {this.state.bundle.length>0&&
               <View style={{marginTop: 10}}>
                 <MonoText  style={{ fontSize:16,color:'#000',paddingHorizontal:20,fontWeight:'700'}} >Bought Together</MonoText>
                 <FlatList style={{margin:0,backgroundColor:'#fff',marginTop: 10 , borderRadius:10}}
                 data={this.state.bundle}
                 extraData={this.state}
                 showsVerticalScrollIndicator={false}
                 showsHorizontalScrollIndicator={false}
                 keyExtractor={(item,index) => {
                   return index.toString();
                 }}
                 nestedScrollEnabled={true}
                 renderItem={({item, index}) => (
                   <View style={{}}>
                      <VariantCard showtoast={(text)=>{this.showtoast(text)}} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)} product={item} store={this.state.store} details={this.state.product} onChange={ (args)=> this.updateCart(args)} cartItems={this.state.cartItems} bundle={true} navigation={this.props.navigation} details={()=>this.getDetails(item.parent_pk)} />
                   </View>
                 )}
                 />
               </View>
             }
             {this.state.suggestion.length>0&&
               <View style={{marginTop: 10}}>
                 <MonoText  style={{ fontSize:16,color:'#000',paddingHorizontal:20,fontWeight:'700'}} >Similar Products</MonoText>
                 <FlatList style={{margin:0,backgroundColor:'#fff',marginTop: 10  , borderRadius:10}}
                 data={this.state.suggestion}
                 extraData={this.state}
                 showsVerticalScrollIndicator={false}
                 showsHorizontalScrollIndicator={false}
                 keyExtractor={(item,index) => {
                   return index.toString();
                 }}
                 nestedScrollEnabled={true}
                 renderItem={({item, index}) => (
                   <View style={{}}>
                      <VariantCard showtoast={(text)=>{this.showtoast(text)}} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)}  product={item} store={this.state.store} details={this.state.product}  cartItems={this.state.cartItems} bundle={false} navigation={this.props.navigation} details={()=>this.getDetails(item.parent_pk)} />
                   </View>
                 )}
                 />
               </View>
             }
             {this.state.rating&&this.state.login&&
             <View style={{marginHorizontal: 20,marginBottom: 20}}>
               <MonoText  style={{ fontSize:16,color:'#000',marginTop: 10,}} >Have you used this product?</MonoText>
               <View style={{flexDirection:'row',marginTop: 5,}}>
                   <View style={{flex:0.7}}>
                     <MonoText  style={{ fontSize:16,color:'#000',}} >Leave Feedback</MonoText>
                   </View>
                   <View style={{flex:0.3,flexDirection:'row'}}>
                     <TouchableOpacity onPress={()=>this.setState({showForm:true})} style={{flex:0.5,alignItems:'flex-end'}}>
                     <MonoText  style={{ fontSize:18,color:this.state.showForm?'#3A8DFA':'#000',}} >Yes</MonoText>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={()=>this.setState({showForm:false})} style={{flex:0.5,alignItems:'flex-end'}}>
                     <MonoText  style={{ fontSize:18,color:!this.state.showForm?'#3A8DFA':'#000',}} >No</MonoText>
                      </TouchableOpacity>
                     {/*<Switch
                      onValueChange={()=>{this.setState({showForm:!this.state.showForm})}}
                      value={this.state.showForm}
                      color={themeColor}
                      />*/}
                    </View>
                  </View>
            {this.state.showForm&&
              <View>
               <TextInput style={{height:40,marginTop:20,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                   onChangeText={(title)=>this.setState({title:title})} value={this.state.title} placeholder="Title">
               </TextInput>
               <View style={[styles.signupTextCont,{paddingHorizontal:15}]}>
                       <TouchableOpacity  onPress={() => this.rating(1)}>
                          <Icon type="ionicon" name={this.state.starIcon[0]} color={this.state.rateColor[0]} size={32} style={{textAlignVertical: 'center'}}/>
                        </TouchableOpacity  >
                       <TouchableOpacity  onPress={() => this.rating(2)}>
                          <Icon type="ionicon" name={this.state.starIcon[1]} color={this.state.rateColor[1]} size={32} style={{textAlignVertical: 'center'}}/>
                        </TouchableOpacity  >
                       <TouchableOpacity  onPress={() => this.rating(3)}>
                          <Icon type="ionicon" name={this.state.starIcon[2]} color={this.state.rateColor[2]} size={32} style={{textAlignVertical: 'center'}}/>
                        </TouchableOpacity  >
                       <TouchableOpacity  onPress={() => this.rating(4)}>
                          <Icon type="ionicon" name={this.state.starIcon[3]} color={this.state.rateColor[3]} size={32} style={{textAlignVertical: 'center'}}/>
                        </TouchableOpacity  >
                       <TouchableOpacity  onPress={() => this.rating(5)}>
                          <Icon type="ionicon" name={this.state.starIcon[4]} color={this.state.rateColor[4]} size={32} style={{textAlignVertical: 'center'}}/>
                        </TouchableOpacity  >
               </View>
               <TextInput
                      style={{height: 120, borderWidth: 0, marginTop:15,paddingHorizontal:20,paddingVertical:15,fontSize:18, textAlignVertical:'top',borderWidth:1,borderColor:'#f2f2f2'}}
                      underlineColorAndroid='#fff'
                      ref={input => { this.textInput = input }}
                      multiline={true}
                      numberOfLines={5}
                      placeholder="Describe Your Experience"
                      onChangeText={(text) => this.setState({remark:text})}
                 />
                 <View style={{flex:1,marginTop:15}}>
                   <FlatList style={{margin:0,backgroundColor:'#fff',marginBottom: 10 , borderRadius:10}}
                   data={this.state.reviewImages}
                   showsVerticalScrollIndicator={false}
                   numColumns={5}
                   showsHorizontalScrollIndicator={false}
                   keyExtractor={(item,index) => {
                     return index.toString();
                   }}
                   nestedScrollEnabled={true}
                   renderItem={({item, index}) => (
                     <View style={{height:'100%'}}>
                     {item.link!=null&&
                       <TouchableOpacity style={{borderRadius:10,}} onPress={()=>this.removeReview(index)}>
                         <Image
                         source={{uri:SERVER_URL+item.link}}
                         style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02 }}
                         />
                         <View style={{position: 'absolute',top:0,right:-10,width:20,height:20,backgroundColor: '#fa4616',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                           <FontAwesome  name="close" size={15} color="#fff" />
                         </View>
                       </TouchableOpacity>
                     }
                     {item.link==null&&
                     <TouchableOpacity style={{borderRadius:10,}} onPress={()=>{this.attachReview(true)}}>
                       <View style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02,backgroundColor: '#f2f2f2',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                         <FontAwesome  name="plus" size={15} color="#000" />
                       </View>
                     </TouchableOpacity>
                   }
                    </View>
                   )}
                   />
                 </View>
                 <View style={{alignItems:'flex-end',justifyContent:'center',marginTop:15}}>
                 <TouchableOpacity onPress={()=>{this.giveRating()}} style={{backgroundColor:themeColor,paddingHorizontal:15,paddingVertical:7}}>
                    <MonoText  style={{ color:'#fff',fontSize:16,}}>SUBMIT</MonoText>
                 </TouchableOpacity>
                 </View>
                 </View>
               }
                 {this.starFeedBack()}
                 {this.state.userRatings.length>0&&
                   <View>
                   <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',}}
                  data={this.state.userRatings}
                  keyExtractor={(item,index) => {
                    return index.toString();
                  }}
                  horizontal={false}
                  nestedScrollEnabled={true}
                  renderItem={({item, index}) =>{
                     var arr = item.image.split('||')
                    return (
                    <View style={{marginTop:20}}>
                      <View style={{flexDirection:'row'}}>
                        <View style={{height:40,width:40,borderRadius:20,backgroundColor:'#f2f2f2'}}>
                        {item.user!=null&&item.user.profile!=null&&
                            <Image source={{uri:SERVER_URL+item.user.profile.displayPicture}} style={{height:'100%',width:'100%',borderRadius:20}} />
                          }
                        </View>

                        <View style={{justifyContent:'center',marginHorizontal:15}}>
                          {item.user!=null&&
                          <MonoText  style={{ color:'#000',fontSize:16,fontWeight:'700'}}>{item.user.username}</MonoText>
                         }
                          <View style={{width:100}}>
                            <StarRating rating={item.rating} size={15} color={themeColor} / >
                          </View>
                          {item.description!=null&&
                            <MonoText  style={{ color:'grey',fontSize:14,marginTop:5}}>{item.description}</MonoText>
                          }
                          <View style={{marginTop:15}}>
                          {arr.length>0&&arr[0].length>0&&

                                  <FlatList style={{margin:0,backgroundColor:'#fff',marginBottom: 10 , borderRadius:10}}
                                  data={arr}
                                  showsVerticalScrollIndicator={false}
                                  numColumns={4}
                                  showsHorizontalScrollIndicator={false}
                                  keyExtractor={(item,index) => {
                                    return index.toString();
                                  }}
                                  nestedScrollEnabled={true}
                                  renderItem={({item, index}) => (
                                    <View style={{height:'100%'}}>
                                      <View style={{borderRadius:10,}}>
                                      <Image
                                      source={{uri:SERVER_URL+'/media'+item.split('/media')[1]}}
                                      style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%4==0?0:width*0.03,marginTop:width*0.02 }}
                                      />
                                      </View>
                                    </View>
                                  )}
                                  />
                          }

                          </View>
                        </View>
                      </View>
                    </View>
                  )}}
                  />
                  {this.state.showMore&&<View style={{alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>{this.getUserfeedback(this.state.offset,this.state.product.pk)}}  style={{marginTop:10,padding:7,borderWidth:1,backgroundColor:'#f2f2f2',borderColor:'#f2f2f2',}} >
                      <MonoText  style={{ color:themeColor,fontSize:15}}>Load More</MonoText>
                    </TouchableOpacity>
                  </View>
                }
                 </View>
               }
               </View>


             }
            </ScrollView>
          </View>
          {!this.state.keyboardOpen&&storeType=='MULTI-OUTLET' &&
            <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.checkLogin()}>
              <View style={styles.account}>

              <MonoText  style={{ color:'#fff' , }}> <Entypo name="wallet" size={25} color={this.state.store.themeColor} /> </MonoText>
              <MonoText  style={{ color:this.state.store.themeColor}}>Wallet</MonoText>
              </View>
              </TouchableOpacity>
              <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',}} onPress={this.checkout}>
                <View style={[styles.account,{height:'100%',width:'100%'}]}>

                  <MonoText  style={{ color:'#fff' , }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <View style={[styles.cartItemNo]}>
                  <View style={[styles.cartItemPosition,{borderColor:this.state.store.themeColor,color:this.state.store.themeColor,}]}>
                  <MonoText numberOfLines={1}  style={{ color:this.state.store.themeColor,alignSelf:'center',fontSize:14,fontWeight:'700',}}>{this.props.counter}</MonoText>
                   </View>
                  </View>
                  <MonoText  style={{ color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
                </View>
              </TouchableOpacity>
              </View>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
                <View style={[styles.account,{height:'100%'}]}>
                  <MonoText  style={{ color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <MonoText  style={{ color:this.state.store.themeColor , fontSize : 14,}}>Categories</MonoText>
                </View>
              </TouchableOpacity>
            </View>
        }
        {!this.state.keyboardOpen&&storeType!='MULTI-OUTLET'&&
          <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

          <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoHome()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText  style={{ color:'#fff' , }}> <FontAwesome name="home" size={20} color={this.state.store.themeColor} /> </MonoText>
              <MonoText  style={{ color:this.state.store.themeColor , fontSize : 13,}}>Home</MonoText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{flex:1,paddingHorizontal:10}} onPress={() => this.props.navigation.navigate('ReferEarn')}>
                <View style={styles.account}>
                <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
                <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
                </View>
          </TouchableOpacity> 
            <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity style={{backgroundColor:'#fff',}} onPress={this.checkout}>
              <View style={[styles.account,{height:'100%',width:'100%'}]}>

                <MonoText style={{ color:'#fff' ,}}> <FontAwesome name="shopping-cart" size={20} color={this.state.store.themeColor} /></MonoText>
                <View style={[styles.cartItemNo]}>
                  <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,color:this.state.store.themeColor,}]}>
                    <MonoText numberOfLines={1} style={{ color:this.state.store.themeColor,alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:14),fontWeight:'700',}}>{counter}</MonoText>
                  </View>
                </View>
                <MonoText style={{ color:this.state.store.themeColor ,fontSize : 13, }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
              </View>
            </TouchableOpacity>
            </View>


            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoDiscoverScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText  style={{color:'#fff' ,  }}> <FontAwesome name="users" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText  style={{ color:this.state.store.themeColor , fontSize : 13,}}>Discover</MonoText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoChatScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText  style={{ color:'#fff' , }}> <FontAwesome name="wechat" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText  style={{ color:this.state.store.themeColor , fontSize : 13,}}>Chat</MonoText>
              </View>
            </TouchableOpacity>
          </View>
      }

          <Modal style={{justifyContent: 'center',alignItems: 'center',margin: 0}} isVisible={this.state.customize} animationIn="fadeIn"  animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} onRequestClose={() => { this.modalShow(false) }}  >
              <View style={{width:width*0.9,height:width,backgroundColor: '#fff',paddingHorizontal:25,paddingVertical: 30,}}>
              <View style={{flex:1,}}>
                <View style={{flex:0.4,}}>
                  <MonoText  style={{ fontSize:16,marginBottom: 10,fontWeight:'bold'}}>Write Instruction</MonoText>
                  <TextInput style={{fontSize: 16,color: '#000',height: 80,borderWidth: 0.5,borderColor:'#f2f2f2',paddingVertical:10,paddingHorizontal: 10,width:'100%',marginBottom: 20,}}
                   placeholder="Write Instruction here..."
                   underlineColorAndroid='transparent'
                   ref={input => { this.textInput = input }}
                   onChangeText={(text) => this.setState({instruction:text})}
                   value={this.state.instruction}
                   multiline={true}/>
                </View>
                 <View style={{flex:0.4,}}>
                   <MonoText  style={{ fontSize:16,marginBottom: 10,fontWeight:'bold'}}>Choose Image</MonoText>
                   <View style={{flex:1,flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
                      <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                        <FontAwesome  name="photo" size={25} color="#fff" />
                      </View>
                      <MonoText  style={{ fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
                      <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                        <FontAwesome  name="camera" size={25} color="#fff" />
                      </View>
                      <MonoText  style={{ fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText>
                    </TouchableOpacity>
                    {this.state.customizeImage!=null&&
                      <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                      <View style={{height:40,width:40,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 10}} >
                      <Image source={{uri:this.state.customizeImage.uri}} style={{width:'100%',height:'100%'}}  />
                      </View>
                      </View>
                    }
                    </View>
                  </View>
                  <View style={{flex:0.2,flexDirection: 'row',backgroundColor: '#fff',alignItems: 'flex-end',justifyContent: 'center',}}>
                    <TouchableOpacity style={[{paddingHorizontal: 15,paddingVertical: 8,backgroundColor: themeColor}]} onPress={()=>{this.uploadCustomization()}} >
                      <MonoText  style={{ fontSize: 18,color:'#fff',fontWeight: '600',}}>Upload</MonoText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[{paddingHorizontal: 15,paddingVertical: 8,backgroundColor: 'red'}]} onPress={()=>{this.removeCustomization()}} >
                      <MonoText  style={{ fontSize: 18,color:'#fff',fontWeight: '600',}}>Exit</MonoText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
        </Modal>

        <ModalBox
          style={{height:150}}
          position={'bottom'}
          ref={'attachModal'}
          isOpen={this.state.reviewVisible}
          onClosed={()=>{this.setState({reviewVisible:false})}}>
            <View style={{flex:1,flexDirection: 'row'}}>
              <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalReview('gallery')}}>
                <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                  <FontAwesome  name="photo" size={35} color="#fff" />
                </View>
                <MonoText  style={{ fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalReview('camera')}}>
                <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                  <FontAwesome  name="camera" size={25} color="#fff" />
                </View>
                <MonoText  style={{ fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText>
              </TouchableOpacity>
            </View>
          </ModalBox>

        </View>
      );
    }else{
      return (
        <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
          <ProductDetailsLoader
          modalVisible = {loadingVisible}
          backdropColor={'#fff'}
          hasBackdrop={false}
          animationType="fade"
          />
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        </View>
      );
    }



  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: width * 0.15,
    borderWidth: 0,
  },
  account:{
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemNo:{
    position:'absolute',
    alignItems:'center',
    justifyContent:'center',
    top:3
  },
  cartItemPosition:{
    width:21,
    height:21,
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius:15,
    alignItems:'center',
    justifyContent:'center',
    fontSize:14,
    fontWeight:'700',
    position:'absolute',
    left:6,
    top:0
  },
  onlyPadding:{
    minWidth:21,
    paddingHorizontal:2,
    height:21,
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius:15,
    // alignItems:'center',
    // justifyContent:'center',
    fontSize:12,
    fontWeight:'700',
    position:'absolute',
    left:6,
    top:0
  },
  cartItemPositionn:{
    paddingHorizontal:5,
    height:25,
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius:10.5,
    textAlign:'center',
    fontSize:14,
    fontWeight:'700',
    position:'absolute',
    left:6,
    top:0
  },
  cartItemNumber:{
    position: 'absolute',
    right:-2,
    top:3,
    fontSize:14,
    fontWeight:'700',
    backgroundColor: '#fff',
    borderWidth: 1,
    color:'#efa834',
    borderColor: '#efa834',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:'center',
  },
  scrollContainer: {
    flex: 1,
  },
  image: {
    width:width*0.8,
    height:width*0.8
  },
  statusBar: {
   backgroundColor: themeColor,
   height: Constants.statusBarHeight,

},
p:{
    fontSize:16,
    marginVertical:20,
  },
  signupTextCont:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 20,
 },

})


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    totalAmount: state.cartItems.totalAmount,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    myStore:state.cartItems.myStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetails);


// <MonoText  style={{fontSize:18,color:'#000',fontWeight: '400'}}>Price :<MonoText  style={{fontSize:16,color:'grey',textDecorationLine: 'line-through', textDecorationStyle: 'solid'}}> &#8377;{price}</MonoText> <MonoText  style={{fontSize:16,color:'#000',fontWeight: '600'}}> &#8377;{sellingPrice}</MonoText> <MonoText  style={{fontSize:14,color:'green',fontWeight: '600'}}>{discount}% OFF </MonoText> </MonoText>
// <MonoText  style={{fontSize:14,color:'grey',fontWeight: '600'}}>(&#8377;{withoutGSTPrice} + {taxRate}% GST)</MonoText>
// <MonoText  style={{fontSize:14,color:'grey',fontWeight: '600'}}>Delivered in : {this.state.selected.options[this.state.secondOptionsIdx].customizable?this.state.selected.options[this.state.secondOptionsIdx].customisedDeliveryTime:this.state.selected.options[this.state.secondOptionsIdx].deliveryTime} days</MonoText>
// <MonoText  style={{fontSize:14,color:'grey',fontWeight: '600'}}>Cash on Delivery : {this.state.product.iscod?'Yes':'No'}</MonoText>


// {item.image[0].length>2&&item.image.map((i,idx)=>{
//
//     return(
//         <FlatList style={{margin:0,backgroundColor:'#fff',marginBottom: 10 , borderRadius:10}}
//         data={arr}
//         showsVerticalScrollIndicator={false}
//         numColumns={4}
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item,index) => {
//           return index.toString();
//         }}
//         nestedScrollEnabled={true}
//         renderItem={({item, index}) => (
//           <View style={{height:'100%'}}>
//             <View style={{borderRadius:10,}}>
//             <Image
//             source={{uri:SERVER_URL+'/media'+item.split('/media')[1]}}
//             style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%4==0?0:width*0.03,marginTop:width*0.02 }}
//             />
//             </View>
//           </View>
//         )}
//         />
// )
// })
// <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoCategories()}>
//   <View style={[styles.account,{height:'100%'}]}>
//     <MonoText  style={{ color:'#fff' , }}> <FontAwesome name="th-large" size={20} color={this.state.store.themeColor} /> </MonoText>
//     <MonoText  style={{ color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
//   </View>
// </TouchableOpacity>
