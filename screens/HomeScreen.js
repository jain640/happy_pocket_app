import React from 'react';
import SmsRetriever from 'react-native-sms-retriever';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  Slider,
  Dimensions,Animated, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,Vibration,TouchableNativeFeedback,ImageBackground
} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import { FontAwesome,Entypo,SimpleLineIcons,MaterialIcons,Feather} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import Productcard from '../components/Productcard.js';
import ProductFullCardV2 from '../components/ProductFullCardV2.js';
import SimpleList from '../components/SimpleList.js';
import ProductViewV2 from '../components/ProductViewV2.js';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import ProductScreen from '../screens/ProductScreen';
import NetInfo from '@react-native-community/netinfo';
import Modal from "react-native-modal";
// import { Linking} from 'expo';
import AppLink from 'react-native-app-link';
import { Card } from 'react-native-elements';
import Loader from '../components/Loader';
import CategoryScroll from '../components/CategoryScroll';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import * as Network from 'expo-network';
import * as Updates from 'expo-updates';
import * as Linking from 'expo-linking';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { width } = Dimensions.get('window');
const height = width * 0.8
const images = [
  {
    uri: require('../assets/images/background_curosel.png'),
  },
  {
    uri: require('../assets/images/background_curosel.png'),
  },
  {
    uri: require('../assets/images/background_curosel.png'),
  },
];

const SERVER_URL = settings.url
const playStoreUrl = settings.playStoreUrl
const appStoreUrl = settings.appStoreUrl
const appName = settings.appName
const chatView = settings.chat
const packageName = settings.packageName
const storeType = settings.storeType
const themeColor = settings.themeColor
const sellerZone = settings.sellerZone
const newFeatures = settings.newFeatures
const expoUpdate = settings.expoUpdate
const expoManualUpdate = settings.expoManualUpdate
const productListShow = settings.productListShow



class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {


    }
  }

  componentWillReceiveProps({icons}){
    this.setState({icons:icons})
  }

  render() {
    // var themeColor = this.props.themeColor
    if (this.state.icons && this.state.icons.length>0) {

      return (
        <View style={{height:100}}>

        </View>
      );
    }

    return null;
  }
}




class Carousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      icons:props.icons,
      images:props.images,
      themeColor:props.themeColor,
      currentPosition:0,
    }
    this.autoplay = false
    this.autoplaying = false
    this.animatedValue = new Animated.Value(0);
  }

  setUpTimer = () => {
    // setInterval(()=>{
    //   if(this.scrollView!=undefined){
    //     this.scrollView.scrollTo({ y: 0, x: width });
    //   }
    // },2000)
  }

  componentWillMount() {
    this.startAutoplay()
    // let self = this;
    //
    // this.animatedListenerId = this.animatedValue.addListener(
    //   ({value}) => {
    //     console.log("VALUE: ", value)
    //     this.refs.listview.scrollTo({x: (self._contentWidth/180)*value, y:0, animated: false})
    //   });
    //
    // Animated.timing(this.animatedValue, {
    //   toValue: 180,
    //   duration: 180*1000,
    //   easing: Easing.linear
    // }).start();
  }

 // componentWillReceiveProps({icons,images}){
 //   this.setState({icons:icons,images:images})
 // }

  _onSmsListenerPressed = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          console.log(event.message);
          SmsRetriever.removeSmsListener();
        }); 
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };

  startAutoplay () {

     this.autoplay = true;
     if (this.autoplaying) {
         return;
     }
     clearTimeout(this.autoplayTimeout);
     this.autoplayTimeout = setTimeout(() => {
         this.autoplaying = true;
         this.autoplayInterval = setInterval(() => {
             if (this.autoplaying) {
                 this.snapToNext();
             }
         }, 5000);
     }, 5000);
  }

  onScrollEnd (event) {

    if (this.autoplay && !this.autoplaying) {
        clearTimeout(this.enableAutoplayTimeout);
        this.enableAutoplayTimeout = setTimeout(() => {
            this.startAutoplay();
        }, 5000 + 50);
    }
  }
  snapToNext (animated = true, fireCallback = true) {
   if(this.state.icons!=undefined){
        const itemsLength = this.state.icons.length

        let newIndex = this.state.currentPosition + 1;
        if (newIndex > itemsLength - 1) {
            newIndex = 0;
        }
        this.snapToItem(newIndex, animated, fireCallback);
      }
    }

    snapToItem (index, animated = true, fireCallback = true, initial = false, lockScroll = true) {

      if(this.state.icons!=undefined){
        const itemsLength = this.state.icons.length;


        if (!index || index < 0) {
            index = 0;
        } else if (itemsLength > 0 && index >= itemsLength) {
            index = itemsLength - 1;
        }

        if (index !== this.state.currentPosition) {
            this.setState({currentPosition:index})
            this.scrollView.scrollTo({ x: index*width, animated: true });
        }
      }  
    }

    scrolling=()=>{
      if (this.state.icons!=undefined  && this.state.icons.length>1) {
          var position = this.state.currentPosition
          if(this.state.currentPosition != this.state.icons.length){
            position = this.state.currentPosition + 1;
          }
          this.scrollView.scrollTo({ x: position*width, animated: true });

          // Set animation to repeat at end of scroll
          if (this.state.currentPosition == this.state.icons.length) {
              this.scrollView.scrollTo({ x: 0, animated: false })
              this.setState({ currentPosition: 0 });
          }
          else {
              this.setState({ currentPosition: position });
          }
      }
    }

  stopAutoplay () {
      this._autoplay = false;
     this.pauseAutoPlay();
  }

  componentDidMount=()=>{    
    // this.activeInterval = setInterval(this.scrolling, 10000);
    this.startAutoplay()

  }

  pauseAutoPlay () {
       this.autoplaying = false;
       clearTimeout(this.autoplayTimeout);
       clearTimeout(this.enableAutoplayTimeout);
       clearInterval(this.autoplayInterval);
   }

  componentWillUnmount(){
    // clearInterval(this.activeInterval);
    this.stopAutoplay();
    clearTimeout(this.autoplayTimeout);
  }

  componentWillReceiveProps({icons}){
    this.setState({icons:icons})


  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({currentPosition:page+1})
    }
    // <Image  style={{width:width*0.20,height:width*0.20,position:'absolute',right:20,top:width*0.05,resizeMode:'contain',zIndex:100}} source={{uri:item.imagePortrait}} />
    // <View style={{width:width*0.6,height:width*0.2,position:'absolute',left:20,top:width*0.03,alignItems:'flex-start',justifyContent:'flex-end'}}>
    //   <MonoText style={{color:'#000',fontSize:16,fontWeight:'700', textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.title}</MonoText>
    // </View>
    // <View style={{width:width*0.6,height:width*0.25,position:'absolute',left:20,top:width*0.23,alignItems:'flex-start',justifyContent:'flex-start'}}>
    //   <MonoText style={{color:'#000',fontSize:14,  fontWeight:'700',textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.subtitle}</MonoText>
    // </View>
    // <Image  style={{width:width*0.20,height:width*0.20,position:'absolute',right:20,top:width*0.05,resizeMode:'contain',zIndex:100}} source={{uri:item.imagePortrait}} />
    // <View style={{width:width*0.6,height:width*0.2,position:'absolute',left:20,top:width*0.03,alignItems:'flex-start',justifyContent:'flex-end'}}>
    //   <MonoText style={{color:'#000',fontSize:16,fontWeight:'700', textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.title}</MonoText>
    // </View>
    // <View style={{width:width*0.6,height:width*0.25,position:'absolute',left:20,top:width*0.23,alignItems:'flex-start',justifyContent:'flex-start'}}>
    //   <MonoText style={{color:'#000',fontSize:14,  fontWeight:'700',textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.subtitle}</MonoText>
    // </View>
  }

  render() {
    var themeColor = this.props.themeColor
    if (this.state.icons!=undefined && this.state.icons.length>0) {
      return (
        <View style={styles.scrollContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            bounces={true}
            onMomentumScrollEnd={this.onScrollEnd}
            ref={(ref) => { this.scrollView = ref; }}
            showsHorizontalScrollIndicator={false}>
            {this.state.icons.map((item,index) => {
              var banner = ''
              var imagePortrait = ''
              if(item.mobileBanner!=null||item.mobileBanner!=undefined){
                 banner = SERVER_URL+'/media/'+item.mobileBanner.split('/media/')[1]
              }
              if(item.imagePortrait!=null||item.imagePortrait!=undefined){
                 imagePortrait = SERVER_URL+'/media/'+item.imagePortrait.split('/media/')[1]
              }
              return (
              <View key = { index } style={[styles.image,{backgroundColor:'#fff',}]}>
              <Image  style={{ flex: 1,width: width,height: width * 0.5,resizeMode: 'cover',alignItems:'flex-start',zIndex:99  }} source={banner.length!=0?{uri:banner}:null} />
              <Image  style={{width:width*0.20,height:width*0.20,position:'absolute',right:20,top:width*0.05,resizeMode:'contain',zIndex:100}} source={imagePortrait.length!=0?{uri:imagePortrait}:null} />
             <View style={{width:width*0.6,height:width*0.2,position:'absolute',left:20,top:width*0.03,alignItems:'flex-start',justifyContent:'flex-end'}}>
               <MonoText style={{color:'#000',fontSize:16,fontWeight:'700', textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.title}</MonoText>
             </View>
             <View style={{width:width*0.6,height:width*0.25,position:'absolute',left:20,top:width*0.23,alignItems:'flex-start',justifyContent:'flex-start'}}>
               <MonoText style={{color:'#000',fontSize:14,  fontWeight:'700',textShadowRadius: 0.1,textShadowColor: '#fff'}}>{item.subtitle}</MonoText>
             </View>
              </View>
            )})}
          </ScrollView>
        </View>
      );
    }

    return null;
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    header:null,
  }

  constructor(props) {
    super(props);
    homeScreen = this;
    this.mounted=false
    this.state = {
      primaryColor: '',
      topProducts: [],
      products: [],
      cartItems : this.props.cart,
      userScreen:this.props.navigation.getParam('screen', 'LogInScreen'),
      offset:24,
      load:false,
      userdetails:'',
      serverCart:[],
      firstLaunch:null,
      loader:true,
      refreshing: false,
      userPk:null,
      sessionid:null,
      csrf:null,
      store:this.props.store,
      selectedStore:this.props.selectedStore,
      modalVisible:false,
      connectionStatus:false,
      initial:false,
      banners:[],
      icons:[],
      pageIndex:0,
      myStore:this.props.myStore,
      storeType:this.props.storeType,
      loadingVisible:true,
      expoPushToken:'',
      notification: {},
      simpleList:[],
      simpleListName:'',
      showOrder:{categoryList:1,simpleList:2,storesList:3},
      variantShow:false,
      selectedProduct:null,
      networkStatus:true,
      initialRender:false,
      storesList:[],
      storeShow:false,
      recentlist:[],
      recentlistName:'',
      bestSelling:[],
      bestSellingName:'',
      notifyAvailable:false,
      appUpdate:false,
      updateLoader:false,
      updateDetails:null,
      settingMessage:false,
      cartLoaderShow:false,
      loadMoreProduct:false,
      page:0,
      playStoreUpdate:false,
      categories : false,
    }

    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
          // this.getInitial()
          this.loginOrNot()
          this.getMyStore()
          this.getBanner()
          this.registerForPushNotificationsAsync()
         }
    );
  }

  handleConnectivityChange=(state)=>{
    if(state.isConnected){
       this.setState({connectionStatus : true,loader:true})
       fetch(SERVER_URL + '/api/POS/categorysortlist/?store='+this.state.store.pk)
         .then((response) => response.json())
         .then((responseJson) => {
           this.setState({loader:false})
           var subChildArr = []
           // responseJson.forEach((i,idx)=>{
           //   if(i.child.length>0){
           //    i.child.forEach((child)=>{
           //     if(child.subChild.length>0){
           //       child.subChild.forEach((subchild)=>{
           //       subChildArr.push({sub:subchild,idx:idx})
           //       })
           //     }
           //     })
           //   }
           // })
           // subChildArr.forEach((i)=>{
           //   responseJson[i.idx].child.push(i.sub)
           // })
           var filteredArr = responseJson.filter((i)=>{
             if(i.child.length>0){
               return i
             }
           })
           this.setState({ categories: filteredArr })
         })
         .catch((error) => {
           this.setState({loader:false})
           this.refs.toast.show('Try Again.')
         });
    }else{
      this.setState({connectionStatus : false})
      this.showNoInternet()
    }
  }

  callToast=(msg)=>{
    this.refs.toastMsg.show(msg)
  }

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }
  showPoorConnection=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('Internet was very slow .switch to better Network ..')
    }
  }

  getBanner=async()=>{
    fetch(SERVER_URL + '/api/POS/uielements/')
     .then((response) => response.json())
     .then((responseJson) => {
       var simplelist = []
       var recentlyviewedlist = []
       var bestSelling = []
       var appendSimple = false
       var appendRecentlyviewed = false
       var appendBestSelling = false
       var appendCategories = false
       var appendStores = false
       var showOrder = this.state.showOrder
       console.log(responseJson,'lllllllllll');
       responseJson.forEach((i)=>{
         var str = i.type
         if(str.startsWith("banner")&&i.isAvailableInApp){
           data = JSON.parse(i.data.replace(/\\/, "\\\\"))
           image = SERVER_URL + data.background
           // var banners = this.state.banners
           // banners.push(image)
           this.bannerGorup(i.target)
         }
         if(i.type=='simple_list'&&i.isAvailableInApp&&!appendSimple){
           simplelist.push(i)
           appendSimple = true
           showOrder.simpleList = i.order
         }
         if(i.type=='categories_list'&&i.isAvailableInApp&&!appendCategories){
           appendCategories = true
           showOrder.categoryList = i.order
         }
         if(i.type=='stores_list'&&i.isAvailableInApp&&!appendStores){
           appendStores = true
           showOrder.storesList = i.order
           this.setState({storeShow:true})
           this.getstoresList(i.name)
         }
         if(i.type=='recentlyviewed'&&i.isAvailableInApp&&!appendRecentlyviewed){
           recentlyviewedlist.push(i)
           appendRecentlyviewed = true
         }
         if(i.type=='bestSelling'&&i.isAvailableInApp&&!appendBestSelling){
           bestSelling.push(i)
           appendBestSelling = true
         }
       })
       this.setState({showOrder:showOrder})
       if(simplelist.length>0){
         this.getAllProducts(simplelist[0])
       }
       if(recentlyviewedlist.length>0){
         this.recentlyViewedList(recentlyviewedlist[0])
       }
       if(bestSelling.length>0){
         this.getBestSelling(bestSelling[0])
       }
     })
     .catch((error) => {
       return
     });
  }


  getBestSelling=(bestSelling)=>{
    // const userToken = await AsyncStorage.getItem('userpk');
    // const sessionid = await AsyncStorage.getItem('sessionid');
    // const csrf = await AsyncStorage.getItem('csrf');
    // const login = await AsyncStorage.getItem('login');
    // if(JSON.parse(login)){
    fetch(SERVER_URL + '/api/POS/bestSellingProducts/')
     .then((response) =>{return response.json()})
     .then((responseJson) => {
       if(responseJson==undefined){
         return
       }
       if(responseJson!=undefined){
         var arr = []
         responseJson.forEach((i)=>{
           if(i.variant!=undefined){
             arr.push(i)
           }
         })
         this.setState({bestSelling:arr,bestSellingName:bestSelling.name})
       }
     })
     .catch((error) => {
       this.setState({bestSelling:[],bestSellingName:''})
       return
     });
  }
  recentlyViewedList=async(recentlist)=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const login = await AsyncStorage.getItem('login');
    if(JSON.parse(login)){
    fetch(SERVER_URL + '/api/POS/recentlyViewdList/?store='+this.state.selectedStore.pk,{
      method:'GET',
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      },
    })
     .then((response) =>{return response.json()})
     .then((responseJson) => {
       if(responseJson==undefined){
         return
       }
       if(responseJson!=undefined&&responseJson.products!=undefined){
         this.setState({recentlist:responseJson.products,recentlistName:recentlist.name})
       }
     })
     .catch((error) => {
       return
     });
   }else{
      this.setState({recentlist:[],recentlistName:''})
   }
  }

  enableFilter=(obj)=>{
    var arr = []
    obj.variant.forEach((i)=>{
      if(i.enabled){
        arr.push(i)
      }
    })
    obj.variant = arr
    return obj
  }

  getAllProducts=(simplelist)=>{
    fetch(SERVER_URL + '/api/POS/getallgroup/?name='+simplelist.target+'&store='+this.state.selectedStore.pk)
     .then((response) =>{return response.json()})
     .then((responseJson) => {
       if(responseJson==undefined){
         return
       }
       if(responseJson!=undefined&&responseJson.products!=undefined){

         this.setState({simpleList: responseJson.products,simpleListName:responseJson.displayName})
       }
     })
     .catch((error) => {
       return
     });
  }

  getstoresList=(name)=>{
    fetch(SERVER_URL + '/api/POS/searchStore/?home=true')
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson==undefined){
          return
        }

        var response = responseJson.stores
        this.setState({storesList:response,storeDisplayName:name})
      })
      .catch((error) => {
        return
      });
  }

  renderBestSelling=()=>{
    if(this.state.bestSelling.length>0){
      return(
        <View style={{flex:1,}}>
          <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width, flexDirection:'row'}}>
            <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,}}>{this.state.bestSellingName}</MonoText>
            <TouchableNativeFeedback style={{ width:60}} onPress={()=>{this.props.navigation.navigate('ViewAllScreen')}} >
              <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,borderWidth:1, backgroundColor:'#fff', borderColor:'#000', borderRadius:3, paddingVertical:4, paddingHorizontal:8, marginLeft:'auto'}}>View All</MonoText>                          
            </TouchableNativeFeedback>
          </View>
        
        <FlatList style={{}}
        data={this.state.bestSelling.slice(0,2)}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        renderItem={({item, index}) => (
          <View style={{paddingLeft:index==0?15:0,paddingRight:index==this.state.bestSelling.length-1?15:0}}>
          <SimpleList ref={(ref) => this.refs['best'+index] = ref} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)} callToast={(msg)=>this.callToast(msg)} cartLoaderShow={this.state.cartLoaderShow} product={item} key={index} index={index} openVariantSelection={(state)=>{this.openVariantSelection(state,'best')}}  product={item}  selectedStore={this.state.selectedStore} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
          </View>
        )}
        extraData={this.state.cartItems}
        />
        </View>
      )

    }else{
      return null
    }
  }
  renderRecentList=()=>{
    if(this.state.recentlist.length>0){
      return(
        <View style={{flex:1,}}>
        <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width, flexDirection:'row'}}>
          <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,}}>{this.state.recentlistName}</MonoText>
          <TouchableNativeFeedback style={{ width:60}} onPress={()=>{this.props.navigation.navigate('ViewAllScreen')}} >
            <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,borderWidth:1, backgroundColor:'#fff', borderColor:'#000', borderRadius:3, paddingVertical:4, paddingHorizontal:8, marginLeft:'auto'}}>View All</MonoText>                          
          </TouchableNativeFeedback>
        </View>
        <FlatList style={{width: "100%"}}
        data={this.state.recentlist.slice(0,2)}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={false}
        renderItem={({item, index}) => (
          <View >
            <SimpleList ref={(ref) => this.refs['recent'+index] = ref} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)} callToast={(msg)=>this.callToast(msg)} cartLoaderShow={this.state.cartLoaderShow} product={item} key={index} index={index} openVariantSelection={(state)=>{this.openVariantSelection(state,'recent')}}  product={item}  selectedStore={this.state.selectedStore} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
          </View>
        )}
        extraData={this.state.cartItems}
        />
        </View>
      )

    }else{
      return null
    }
  }

  renderStoresList=()=>{
      var themeColor = this.props.store.themeColor
      if(storeType=='MULTI-VENDOR'&&sellerZone&&this.state.storeShow&&this.state.storesList.length>0){
        return(
        <View style={{flex:1,borderColor : '#f2f2f2' , borderWidth:0,}}>
        <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width}}>
          <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20, }}>{this.state.storeDisplayName}</MonoText>
        </View>
            <ScrollView
              horizontal
              pagingEnabled={true}
              indicatorStyle={'black'}
              scrollIndicatorInsets={10,10,10,10}
              showsHorizontalScrollIndicator={true}>
              {this.state.storesList.length>0&&this.state.storesList.map((item,index) => {
                if(item.banner==null||item.banner.length==0){
                  var banner = null
                }else{
                  var banner = SERVER_URL+item.banner
                }
                if(item.logo==null||item.logo.length==0){
                  var logo = null
                }else{
                  var logo = SERVER_URL+item.logo
                }
                return(
              <View style={{flex:1,backgroundColor:'#fff',height:'100%',paddingHorizontal:20,paddingTop:5,paddingBottom:10,width:'100%'}}>
                <TouchableWithoutFeedback onPress={()=>{this.props.navigation.navigate('SellerDetails',{sellerPk:item.pk})}}>
                  <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff',borderRadius:5,width:width-40,height:(width*0.5)-40,margin:0,padding:0,marginRight:0,marginLeft:0}]}>
                    <View style={{height:'100%'}}>
                      <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,}}>
                        {banner!=null&&<Image source={{uri:banner}} style={{ width: '100%', height:'100%',resizeMode:'cover',borderRadius:5,opacity:0.8,backgroundColor:'grey'}} />}
                        {/*banner==null&&<Image source={require('../assets/images/noImage.png')} style={{ width: '100%', height:'100%',resizeMode:'cover',borderRadius:5,opacity:0.8,backgroundColor:'grey'}} />*/}
                        {banner==null&&<View  style={{ width: '100%', height:'100%',resizeMode:'cover',borderRadius:5,opacity:0.8,backgroundColor:'grey'}} />}

                      </View>
                      <View style={{flex:1,padding:10,paddingHorizontal:15}}>

                        <View style={{flex:1,flexDirection:'row',}}>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-end'}}>
                              {logo!=null&&<Image source={{uri:logo}} style={{width: 40, height:40,overflow: "hidden",resizeMode:'cover',borderRadius:20,borderWidth:1,borderColor:'#f2f2f2',}} />}
                              {logo==null&&<View style={{backgroundColor:'#f2f2f2', width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'#f2f2f2',alignItems:'center',justifyContent:'center'}} >
                              <MaterialIcons name={'store'}  size={25} color={'grey'}/>
                              </View>
                              }
                          </View>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-end'}}>
                              <View style={{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'#f2f2f2',alignItems:'center',justifyContent:'center',backgroundColor:'#f2f2f2'}} >
                                <FontAwesome name={'map-marker'}  size={25} color={'grey'}/>
                              </View>
                          </View>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-end'}}>
                              <View style={{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'#f2f2f2',alignItems:'center',justifyContent:'center',backgroundColor:'#f2f2f2'}} >
                              <Feather name="type" size={22} color="grey" />
                                {/*<MonoText   style={{  color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={2}>{entities.decode(item.vendor_typ)}</MonoText>*/}
                              </View>
                          </View>
                        </View>

                        <View style={{flex:1,flexDirection:'row',}}>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                              <MonoText   style={{marginTop:10,color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={2}>{entities.decode(item.name)}</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                              <MonoText   style={{ marginTop:10, color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={2}>{entities.decode(item.city)}</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                          <MonoText   style={{marginTop:10,  color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={2}>{entities.decode(item.vendor_typ)}</MonoText>

                          </View>
                        </View>
                        <View style={{flexDirection:'row',}}>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                              <MonoText   style={{  color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={1}>{item.connections} Connections</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                          <MonoText   style={{  color: '#fff',fontSize: 14,fontWeight:'700',textAlign:'center',textShadowColor:'#000',textShadowOffset: {width: -1, height: 1},textShadowRadius: 2}} numberOfLines={2}>{item.varient_count} Listings</MonoText>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card>
                  </TouchableWithoutFeedback>
                </View>
              )})}
            </ScrollView>
        </View>
      )
    }else{
      return null
    }
  }


  registerForPushNotificationsAsync = async () => {

    if (Constants.isDevice) {

      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // alert('Failed to get push token for push notification!');
        return;
      }
      // this.refs.toast.show('BEFORE TOKEN ASSIGN');
      var token = await Notifications.getExpoPushTokenAsync();
      // this.refs.toast.show('Expo notification token : '+ token);
      this.setState({ expoPushToken: token});

      // this.refs.toast.show('Updating expo token')
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      if(csrf!=null &&sessionid!=null&&userToken!=null&&token!=null){

          // this.refs.toast.show('userToken is : '+ userToken)
          var data = {
            userID:userToken,
            expoPushToken:token+'',
          }
          await fetch(SERVER_URL+'/api/HR/updatePushToken/', {
            method:'POST',
            headers: {
              "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Referer': SERVER_URL,
              'X-CSRFToken': csrf
            },
            body: JSON.stringify(data),
          }).then((response) =>
          {
            return response.json()
            // this.refs.toast.show('token set on database!!!!')
          }).then((json)=>{
            if(json!=undefined){
              this.setState({notifyAvailable:json.notifyAvailable})
            }
          })

          .catch((error) => {
            return
          });

      }

    } else {
      return
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
    // this.setState({ expoPushToken: 'testexpotoken' });
    // this.refs.toast.show('Expo notification token : '+this.state.expoPushToken);
  };



  getMyStore = async ()=>{
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    fetch(SERVER_URL + '/api/POS/getMyStore/',{
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
     .then((response) => {return response.json()})
     .then((responseJson) => {
           this.setState({loadingVisible:false});
          if(responseJson.found){
            this.props.setMyStoreFunction(responseJson.store,responseJson.role)
            this.setState({myStore:responseJson.store})
          }else{
            this.props.removeMyStoreFunction()
          }
        })
     .catch((error) => {
       return
     });
  }


  bannerGorup=(target)=>{
    fetch(SERVER_URL + '/api/POS/bannergroupvs/')
     .then((response) => response.json())
     .then((responseJson) => {
       var icons = this.state.icons
       responseJson.forEach((i)=>{
         if(i.name == target){
           this.getofferbanners(i.pk)
         }
       })
     })
     .catch((error) => {
       return
     });
  }
  getofferbanners=(pk)=>{
    fetch(SERVER_URL + '/api/POS/offerBannervs/')
     .then((response) => response.json())
     .then((responseJson) => {
       var icons = this.state.icons
       var banners = this.state.banners
       responseJson.forEach((i)=>{
         if(i.parent == pk){
           // banners.push(i.image)
           icons.push(i)
         }
       })
       this.setState({icons:icons})
     })
     .catch((error) => {
       return
     });
  }

 getInitialList=async()=>{
   await fetch(SERVER_URL + '/api/POS/outletProductsDetailed/?page=0&storeid='+this.state.selectedStore.pk)
  .then((response) =>{
    console.log(response.status,'checkkkkkkk');
    return response.json()
  })
  .then((responseJson) => {
    const arr = this.state.products

    for (var i = 0; i < responseJson.data.length; i++) {
      arr.push(responseJson.data[i])
    }
    this.setState({ products: arr,page:1})
    this.setState({ load:false })

    if(arr.length>0){
      this.setState({ loadMoreProduct:true })
    }
  })
  .catch((error) => {
    return
  });
 }

 getServiceCart=async()=>{
   var login =  await AsyncStorage.getItem('login');
   if(JSON.parse(login)){
     var sessionid =  await AsyncStorage.getItem('sessionid');
     var csrf = await AsyncStorage.getItem('csrf');
     await fetch(SERVER_URL + '/api/POS/cartService/',{
       method:'GET',
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
       }
     })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson!=undefined){
        console.log(responseJson);
        var arr = []
        responseJson.data.forEach((i)=>{
          arr.push({count:i.qty,pk:i.pk})
        })
        this.props.setInitialFunction(arr,responseJson.cartQtyTotal,responseJson.cartPriceTotal)
        this.props.setCounterAmount(responseJson.cartQtyTotal,responseJson.cartPriceTotal,responseJson.saved)
        this.setState({cartItems:arr})
      }else{
        this.props.setInitialFunction([],0,0)
        this.props.setCounterAmount(0,0,0)
      }
    })
    .catch((error) => {
      this.props.setInitialFunction([],0,0)
      this.props.setCounterAmount(0,0,0)
      return
    });
   }

 }

  handleConnectivityChange=(state)=>{

      if(state.isConnected){
        this.setState({connectionStatus:true})

        // this.getInitial()
        this.getServiceCart()
        this.getBanner()
        this.getMyStore()
        if(this.state.initial){
          console.log('initial Load');
           this.getInitialList()
        }
        if(!this.state.initial){
          this.getProduct()
          this.setState({initial:true})
        }
      }else{
        this.showNoInternet()
        this.setState({connectionStatus : false})
      }

  }

  setModalVisible=(bool)=>{
    this.setState({modalVisible:bool})
  }

  getInitial=async()=>{

    var pk =  await AsyncStorage.getItem('userpk');
    var login =  await AsyncStorage.getItem('login');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    if(pk!=null&&JSON.parse(login)){
      this.setState({cartLoaderShow:true})

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
        this.props.setInitialFunction(arr,count)
        this.setState({cartItems:arr})
        this.setState({cartLoaderShow:false})

        //  arr.map((item)=>{
        //    promises.push(this.requestDiscount(item));
        //   })
        //   Promise.all(promises).then(() => {
        //     this.props.setInitialFunction(arr,count)
        //     if(this.mounted){
        //       this.setState({cartItems:arr})
        //     }
        //     // this.setState({cartItems:arr})
        //
        // })

      })
      .catch((error) => {
        this.setCart()
        this.setState({cartLoaderShow:false})

      });
    }else{
      this.setState({cartLoaderShow:false})
      this.setCart()
    }


  }

  requestDiscount=(item)=>{
    return new Promise(resolve => {
     fetch(SERVER_URL + '/api/POS/discountsv/?product='+item.product )
     .then((response) => response.json())
     .then((responseJson) => {
        item.bulkChart = responseJson
        var discount =  this.findDiscount(item.bulkChart,item.count)
        if(discount!=null){
          item.discountedPrice = item.sellingPrice-(item.sellingPrice*(discount/100))
        }else{
          item.discountedPrice = item.sellingPrice
        }
        resolve(responseJson);
      })
     .catch((error) => {
       return
     });
   })
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


  getUserAsync = async () => {
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userPk:userToken,sessionid:sessionid,csrf:csrf})
    if(userToken == null){
      return
    }


    fetch(SERVER_URL + '/api/HR/users/'+ userToken + '/', {
      headers: {
         "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': this.state.csrf
      }
    }).then((response) => response.json())
      .then((responseJson) => {

        this.setState({ userdetails: responseJson})

      })
      .catch((error) => {
        return
      });
  }


  logout=()=>{
    try {
       AsyncStorage.removeItem('userpk')
       AsyncStorage.removeItem('sessionid')
       AsyncStorage.removeItem('csrf')
       AsyncStorage.setItem("login", JSON.stringify(false))
       this.setState({userScreen:'LogInScreen'})
     } catch (error) {
       return
     }
  }

  userAsync = async() => {
    if(this.props.counter <= 0){
      this.props.emptyCartFunction();
    }
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userPk:userToken,sessionid:sessionid,csrf:csrf})
    fetch(SERVER_URL + '/api/HR/userSearch/?mode=mySelf', {
      headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
      }
    }).then((response) => {
      if(response.status == '200'){
        this.setState({userScreen:'ProfileScreen'})
        return
      }else{
        AsyncStorage.removeItem('userpk')
        AsyncStorage.removeItem('sessionid')
        AsyncStorage.removeItem('csrf')
        AsyncStorage.removeItem('cart')
        AsyncStorage.removeItem('counter')
        AsyncStorage.setItem("login", JSON.stringify(false))
        this.setState({userScreen:'LogInScreen'})
        return
      }
  })
      .then((responseJson) => {

      })
      .catch((error) => {
        return
      });
  };


  componentDidUpdate(prevProps){
        if(prevProps.cart !== this.props.cart) {
          this.setState({cartItems: this.props.cart});
        }
        var login = this.props.navigation.getParam('login',null)
     if(prevProps != this.props){
       if(login!=null){
         this.loginOrNot()
       }
     }
  }



 _onRefresh = ()=>{
   this.getServiceCart()
   this.getBanner()
   this.loginOrNot()
   // this.getInitial()
   this.getMyStore()
   this.registerForPushNotificationsAsync()
   return
 }


   setCart =async()=>{

     var cart = await AsyncStorage.getItem('cart');
     var counter = 0;
     cart = JSON.parse(cart)

     if(cart == null){
       cart = [];
       counter = 0;
     }else{
       for(var i =0;i<cart.length;i++){
         counter = counter + cart[i].qty;
       }
     }

     this.props.setInitialFunction(cart,counter)


   }

   getProduct=async()=>{

      // if(this.state.storeType=='MULTI-OUTLET'){
      //   this.setState({pageIndex:0})
      //    if(this.state.selectedStore.pk!=undefined&&this.state.selectedStore.pk!=this.state.store.pk){
      //     await fetch(SERVER_URL +'/api/POS/outletProductsDetailed/?storeid='+this.state.selectedStore.pk+'&page='+this.state.pageIndex)
      //     .then((response) =>{ return response.json()})
      //     .then((responseJson) => {
      //       var arr = this.state.products
      //       responseJson.data.forEach((item,idx)=>{
      //         if(item.variant.length>0){
      //             arr.push(item)
      //           }
      //       })
      //       this.setState({products:arr,loader:false })
      //     })
      //     .catch((error) => {
      //       return
      //     });
      //   }else{
      //     await fetch(SERVER_URL + '/api/POS/productlitesv/?offset=0&limit=24&storeid='+this.state.store.pk)
      //     .then((response) => {return response.json()})
      //     .then((responseJson) => {
      //       var arr = this.state.products
      //       responseJson.results.forEach((item)=>{
      //         if(item.variant.length>0){
      //           arr.push(item)
      //         }
      //       })
      //       this.setState({products:arr,loader:false })
      //     })
      //     .catch((error) => {
      //       return
      //     });
      //   }
      // }else{
        await fetch(SERVER_URL + '/api/POS/outletProductsDetailed/?page=0&storeid='+this.state.selectedStore.pk)
        .then((response) =>{
          return  response.json()
        })
        .then((responseJson) => {
          if(responseJson!=undefined){
            var arr = this.state.products
            responseJson.data.forEach((item)=>{
              if(item.variant.length>0){
                arr.push(item)
              }
            })
            this.setState({products:arr,loader:false,page:this.state.page+1 })
          }
          if(arr.length>0){
            this.setState({ loadMoreProduct:true })
          }
        })
        .catch((error) => {
          return
        });
      // }

   }
   initialLoad=()=>{
    this.getProduct()
   }

   // askUpdate=(url)=>{
   //   Alert.alert('New App Version Found','Do you want to Update?',
   //       [
   //         {text: 'Update', onPress: () => {
   //          AppLink.openInStore({appName:appName,appStoreId:'',appStoreLocale:'',playStoreId:packageName});
   //         }},
   //     ],
   //     { cancelable: false }
   //   )
   //
   //   // {text: 'Later', onPress: () => {
   //   //     return null
   //   //   }},
   // }

   versionCheck=(current,latest)=>{
     if(Number(current[0])<Number(latest[0])||Number(current[1])<Number(latest[1])||Number(current[2])<Number(latest[2])){
       return true
     }else{
       return false
     }
   }

   appupdate=async()=>{
     if(this.state.updateDetails!=null&&this.state.updateDetails!=undefined&&this.state.updateDetails.playstore){
       AppLink.openInStore({appName:appName,appStoreId:'',appStoreLocale:'',playStoreId:packageName});
       return
    }
       try {
         this.setState({updateLoader:true})
         await Updates.fetchUpdateAsync();
         await Updates.reloadAsync();
       } catch (e) {
         // this.setState({appUpdate:false,updateLoader:false})
         return
       }

   }

askUpdate=()=>{
     if(this.state.appUpdate){
       return(
         <Modal isVisible={this.state.appUpdate} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{return}} onBackdropPress={()=>{return}} >
             <View style={[styles.modalViewUpdate,{maxHeight:300,overflow:'hidden',}]}>
             <ScrollView>
             {!this.state.updateLoader&&
               <View>
                 <Text style={{fontSize:16,fontWeight:'700',color:'#000',padding:18,textAlign:'center',paddingBottom:10}}>Update Found</Text>
                 <View >
                     <Text style={{fontSize:16,fontWeight:'700',color:'green',paddingHorizontal:18}}>{"What's New"}</Text>
                     {this.state.updateDetails!=null&&this.state.updateDetails!=undefined&&
                       <FlatList
                             data={this.state.updateDetails.updates}
                             keyExtractor={(item,index) => {
                               return index.toString();
                             }}
                             extraData={this.state.updateDetails}
                             horizontal={false}
                             renderItem={({item, index}) => {
                               return(
                                 <View style={{flexDirection:'row',alignItems:'center',marginTop:5,paddingHorizontal:22,paddingRight:10}}>
                                    <View style={{height:6,width:6,backgroundColor:'#000',borderRadius:3}} />
                                    <MonoText style={{color:'#000',fontSize:16,marginLeft:5}} numberOfLines={1}>{item}</MonoText>
                                 </View>
                               )}}
                       />
                     }
                 </View>
                 <View style={{flexDirection:'row'}}>
                   <View style={{flex:1,alignItems:'flex-end',}}>
                      <TouchableOpacity onPress={()=>this.appupdate()} style={{backgroundColor:this.props.store.themeColor,margin:15,paddingVertical:5,paddingHorizontal:15,borderRadius:10}}>
                         <MonoText style={{fontSize:16,fomtWeight:'600',color:'#fff',}}>Update</MonoText>
                      </TouchableOpacity>
                   </View>
                  </View>
             </View>
           }
             {this.state.updateLoader&&<View>
                 <MonoText style={{fontSize:16,fontWeight:'700',color:'#000',padding:18}}>App is Updating to Latest Version</MonoText>
                 <View style={{alignItems:'center',justifyContent:'center',height:60,paddingVertical:15,}}>
                       <ActivityIndicator size={20} color={this.props.store.themeColor} />
                       <MonoText style={{fontSize:16,fomtWeight:'600',color:'grey',marginTop:5,paddingBottom:20}}>Please wait some time..</MonoText>
                 </View>
             </View>
           }
             </ScrollView>
             </View>
           </Modal>
       )
     }else{
       return null
     }


}
messageShow=()=>{
  if(this.state.updateDetails!=null&&this.state.updateDetails!=undefined){
   return(
     <Modal isVisible={this.state.settingMessage} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{return}} onBackdropPress={()=>{return}} >
         <View style={[styles.modalViewUpdate,{maxHeight:300,overflow:'hidden'}]}>
         <ScrollView>
           <View>
             <Text style={{fontSize:16,fontWeight:'700',color:'#000',padding:18,textAlign:'center',paddingBottom:10}}>{this.state.updateDetails.home_title}</Text>
             <Text style={{fontSize:16,fontWeight:'600',color:'#000',paddingHorizontal:18,}}>{this.state.updateDetails.home_message}</Text>
             <View style={{flexDirection:'row'}}>
             {this.state.updateDetails.home_disabling&&
               <View style={{flex:1,alignItems:'flex-end',}}>
                  <TouchableOpacity onPress={()=>this.setState({settingMessage:false})} style={{backgroundColor:'#f00',margin:15,paddingVertical:5,paddingHorizontal:15,borderRadius:10}}>
                     <MonoText style={{fontSize:16,fomtWeight:'600',color:'#fff',}}>Cancel</MonoText>
                  </TouchableOpacity>
               </View>
             }
              </View>
         </View>
         </ScrollView>
         </View>
       </Modal>
   )
 }else{
   return null
 }

}
//  appupdate=async()=>{
//    try {
//       this.setState({updateLoader:true})
//       await Updates.fetchUpdateAsync();
//       await Updates.reloadAsync();
//     }catch (e) {
//       this.setState({updateLoader:false})
//       AppLink.openInStore({appName:appName,appStoreId:'',appStoreLocale:'',playStoreId:packageName});
//       // this.setState({appUpdate:false,updateLoader:false})
//     }
// }

   checkAppUpdate=async()=>{
      // this.setState({settingMessage:false,appUpdate:true})
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          if(expoManualUpdate){
            this.setState({settingMessage:false,appUpdate:true})
          }else{
            try {
              // this.setState({updateLoader:true})
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            } catch (e) {
              // this.setState({appUpdate:false,updateLoader:false})
              return
            }
          }
        }
      } catch (e) {
      }
  }
   //      // this.askUpdate()
   //      // handle or log error
   //    }

    // var versionNo = Constants.manifest.version
    // currentVerArr = versionNo.split('.')
    // // this.askUpdate(playStoreUrl)
    // if(Platform.OS=='android'){
    //   var data = {
    //     packageName:packageName,
    //   }
    //   fetch(playStoreUrl, data)
    //   .then(res => res.text())
    //   .then(text => {
    //     const match = text.match(/Current Version.+>([\d.]+)<\/span>/);
    //     // console.log(text);
    //     // const match = text.match(/\d.\d.\d/);
    //     // console.log(match,'lllllllll');
    //     if (match) {
    //       const latestVersion = match[1].trim();
    //       latestVerArr = latestVersion.split('.')
    //       var check = this.versionCheck(currentVerArr,latestVerArr)
    //       if(check){
    //         this.askUpdate(playStoreUrl)
    //       }
    //     }
    //   });
    // }else{
    //   var data = {
    //     packageName:packageName,
    //   }
    //   fetch(appStoreUrl, data)
    //   .then(res => res.json())
    //   .then(json => {
    //     if (json.resultCount) {
    //        const version = json.results[0].version;
    //        const appId = json.results[0].trackId;
    //     }
    //   });
    // }
    //  try {
    //     const update = await Updates.checkForUpdateAsync();
    //     if (update.isAvailable) {
    //       await Updates.fetchUpdateAsync();
    //       Updates.reloadFromCache();
    //     }
    //   } catch (e) {
    //   }

   // }

   loginOrNot=()=>{
       AsyncStorage.getItem('login').then(userToken => {
       if(userToken == 'true' || userToken == true){
         this.setState({
           checkLogin:true
         });
         this.getServiceCart()
       }else{
         this.setState({
           checkLogin:false
         });
         this.setState({recentlist:[],recentlistName:''})
       }
     }).done();
   }

  playStoreUpdate=(data)=>{
     var latestVer = data.app_version
      var currentVer = Constants.nativeAppVersion
      console.log(latestVer,currentVer,'kdbgvjsfdbgjsfj');
      var current = currentVer.split('.')
      var latest = latestVer.split('.')

      if(Number(current[0])<Number(latest[0])||Number(current[1])<Number(latest[1])||Number(current[2])<Number(latest[2])){
        this.setState({loadingVisible:false,playStoreUpdate:true})
        return
      }else{
        // this.setState({loadingVisible:false,playStoreUpdate:true})
        // this.checkAppUpdate()
        return
      }
  }

  renderPlayStoreUpdate=()=>{

     return(
       <Modal isVisible={this.state.playStoreUpdate} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{return}} onBackdropPress={()=>{return}} >
           <View style={[styles.modalViewUpdate,{maxHeight:300,overflow:'hidden'}]}>
           <ScrollView>

             <View>
               <Text style={{fontSize:16,fontWeight:'700',color:'#000',padding:18,textAlign:'center',paddingBottom:10}}>Update Found</Text>
               <View >
                   <Text style={{fontSize:16,fontWeight:'700',color:'green',paddingHorizontal:18}}>{"What's New"}</Text>
                   {this.state.updateDetails!=null&&this.state.updateDetails!=undefined&&
                     <FlatList
                           data={this.state.updateDetails.updates}
                           keyExtractor={(item,index) => {
                             return index.toString();
                           }}
                           extraData={this.state.updateDetails}
                           horizontal={false}
                           renderItem={({item, index}) => {
                             return(
                               <View style={{flexDirection:'row',alignItems:'center',marginTop:5,paddingHorizontal:22,paddingRight:10}}>
                                  <View style={{height:6,width:6,backgroundColor:'#000',borderRadius:3}} />
                                  <MonoText style={{color:'#000',fontSize:16,marginLeft:5}} numberOfLines={1}>{item}</MonoText>
                               </View>
                             )}}
                     />
                   }
               </View>
               <View style={{flexDirection:'row'}}>
                 <View style={{flex:1,alignItems:'flex-end',}}>
                    <TouchableOpacity onPress={()=>this.goToPlayStore()} style={{backgroundColor:this.props.store.themeColor,margin:15,paddingVertical:5,paddingHorizontal:15,borderRadius:10}}>
                       <MonoText style={{fontSize:16,fomtWeight:'600',color:'#fff',}}>Update</MonoText>
                    </TouchableOpacity>
                 </View>
                </View>
           </View>


           </ScrollView>
           </View>
         </Modal>
     )

  }
   goToPlayStore=()=>{
    AppLink.openInStore({appName:appName,appStoreId:'',appStoreLocale:'',playStoreId:packageName});
  }

   getAppSettings=()=>{
      fetch(SERVER_URL + '/api/POS/getAppSettings/')
        .then((response) =>{ return response.json()})
        .then((responseJson) => {
          if(responseJson!=undefined){
            console.log(responseJson,'yyyyyyyyy');
            this.setState({updateDetails:responseJson})
            // if(responseJson.home_status&&!this.state.appUpdate){
            //   this.setState({settingMessage:true})
            // }
            this.setState({updateDetails:responseJson})
            if(!responseJson.playstore){
              this.playStoreUpdate(responseJson)
            }else{
              // this.checkAppUpdate()
              if(responseJson.home_status&&!this.state.appUpdate){
                this.setState({settingMessage:true})
              }
            }
          }
        })
        .catch((error) => {
          return
        });
   }

   componentDidMount() {
     this.getAppSettings()
     // this.timer = setTimeout(() => {
     //  this.checkAppUpdate()
     // }, 1000);


     this.mounted = true;
    this.loginOrNot()

    var store = this.state.store
    if(store.quickadd == undefined){
      store.quickadd = false
    }
    this.setState({store:store})
    if(this.props.screen){
      this.setState({userScreen:this.props.screen})
    }
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})



    this.props.navigation.setParams({
      title: this.state.store.company,
      themeColor: this.state.store.themeColor,
      searchoption: this.search,
      gotoNotification:this.gotoNotification,
      loginoption: this.login,
    });
    this.setState({ primaryColor: this.state.store.themeColor })
    this._notificationSubscription = Notifications.addListener(this._handleNotification);

    if (Platform.OS === 'android') {
        Linking.getInitialURL().then(url => {
          // if(url!=null){
          //   ToastAndroid.show(`${url}`)
          //
          // }
          var pkFind =url.split('details/')[1]
          console.log(pkFind,'fadbjgnns');
          if(pkFind!=undefined){
            var pk=Number(pkFind.split('/')[0])
            console.log(pk,url);
            this.props.navigation.navigate('ProductDetails',{product:pk,userScreen:null})
          }
        });
      } else {
          Linking.addEventListener('url', this.handleOpenURL);
        }

        this.setState({unsubscribe:NetInfo.addEventListener(state =>{
          this.handleConnectivityChange(state);
        })})

  }

  handleOpenURL(event) {
    // ToastAndroid.show(event.url)
    var pkFind =url.split('details/')[1]
    if(pkFind!=undefined){
      var pk=Number(pkFind.split('/')[0])
      console.log(pk,url);
      this.props.navigation.navigate('ProductDetails',{product:pk,userScreen:null})
    }
  }


  gotoNotification=()=>{
    if(this.state.checkLogin){
      this.props.navigation.navigate('NotificationScreen')
    }else{
      this.props.navigation.navigate('LogInScreen')
    }
  }



  _handleNotification = notification => {
    Vibration.vibrate();
    this.setState({ notification: notification });
  };




  login = () => {

    this.props.navigation.navigate('LogInScreen', {
      color: this.state.primaryColor
    })
  }

  gotoCategories = ()=>{
    this.props.navigation.navigate('CategoriesScreen', {
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
       // if(this.state.myStore.pk!=undefined){
      this.props.navigation.navigate('ChatListScreen', {
        color: this.state.primaryColor
       })
       // }else{
       //   this.props.navigation.navigate('NewStore')
       // }
     }else{
       this.login()
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

  search = () => {
    this.setState({settingMessage:false,appUpdate:true})
    // this.props.navigation.navigate('SearchBar', {
    //   color: this.state.primaryColor
    // })
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

  componentWillUnmount=()=>{
    Linking.removeEventListener('url', this.handleOpenURL);
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  loadMore=async()=>{
    if(this.state.connectionStatus){
    this.setState({offset:this.state.offset+10,load:true})
    // if(this.state.store.storeType=='MULTI-OUTLET'){
    //   this.setState({pageIndex:this.state.pageIndex+1})
    //   if(this.state.selectedStore.pk!=undefined&&this.state.selectedStore.pk!=this.state.store.pk){
    //    await fetch(SERVER_URL + '/api/POS/outletProductsDetailed/?storeid='+this.state.selectedStore.pk+'&page='+this.state.pageIndex)
    //    .then((response) =>{ return response.json()})
    //    .then((responseJson) => {
    //      var arr = this.state.products
    //      responseJson.data.forEach((item,idx)=>{
    //        if(item.variant.length>0){
    //            arr.push(item)
    //          }
    //      })
    //      this.setState({products:arr,loader:false })
    //    })
    //    .catch((error) => {
    //      return
    //    });
    //  }else{
    //    fetch(SERVER_URL + '/api/POS/productlitesv/?limit=10&offset=' + this.state.offset+'&storeid='+this.state.store.pk)
    //    .then((response) => response.json())
    //    .then((responseJson) => {
    //      const arr = this.state.products
    //      for (var i = 0; i < responseJson.results.length; i++) {
    //        arr.push(responseJson.results[i])
    //      }
    //      this.setState({ products: arr})
    //      this.setState({ load:false })
    //    })
    //    .catch((error) => {
    //      return
    //    });
    //
    //  }
    // }else{
    console.log(this.state.page,'fdjabjgns',this.state.selectedStore.pk);
      fetch(SERVER_URL + '/api/POS/outletProductsDetailed/?page='+this.state.page+'&storeid='+this.state.selectedStore.pk)
      .then((response) => response.json())
      .then((responseJson) => {
        const arr = this.state.products
        responseJson.data.forEach((item)=>{
          if(item.variant.length>0){
            arr.push(item)
          }
        })
        // for (var i = 0; i < responseJson.data.length; i++) {
        //   arr.push(responseJson.data[i])
        // }
        this.setState({ products: arr,page:this.state.page+1})
        this.setState({ load:false })
      })
      .catch((error) => {
        return
      });
    }
    else{
      this.showNoInternet()
    }

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

  checkLogin = async()=>{
    var login = await  AsyncStorage.getItem('login');
    if(login == 'true'){
      this.props.navigation.navigate('GiftSection')
    }else{
      this.props.navigation.navigate('LogInScreen')
    }
  }

  variantSelection =()=>{
    var value2 = []
    if(this.state.selectedProduct!=null){
         console.log(this.state.selectedProduct,'jjjjjjjjjjj',);
         if(this.state.selectedProduct.value2!=null&&this.state.selectedProduct.value2!=undefined){
           value2 = this.state.selectedProduct.value2
         }
    }
  }

  selectVariant =(name,index,id)=>{
      this.setState({selectedProduct:null,variantShow:false})
      if(this.state.selectionType=='product'){
        this.refs[id].dropDownChanged(name,index)
      }else if(this.state.selectionType=='simple'){
        this.refs['simple'+id].dropDownChanged(name,index)
      }else if(this.state.selectionType=='recent'){
        this.refs['recent'+id].dropDownChanged(name,index)
      }else{
        this.refs['best'+id].dropDownChanged(name,index)
      }

      return(
        <Modal isVisible={this.state.variantShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>this.setState({variantShow:false,selectedProduct:null})} onBackdropPress={()=>{this.setState({variantShow:false,selectedProduct:null})}} >
          <View style={[styles.modalView,{maxHeight:width,overflow:'hidden'}]}>
          <ScrollView >
             {this.state.selectedProduct!=null&&
               <View style={{flex:1,paddingVertical:10,paddingHorizontal:15,zIndex:99,alignItems:'center',}}>
                <MonoText style={{color:'grey',fontSize:16,marginTop:10}}>Available quantities for</MonoText>
                <MonoText style={{color:'#000',fontSize:18,fontWeight:'700',marginBottom:20,marginTop:5}}>{this.state.selectedProduct.name}</MonoText>
                  <FlatList style={{}}
                        data={this.state.selectedProduct.variants}
                        keyExtractor={(item,index) => {
                          return index.toString();
                        }}
                        horizontal={false}
                        onEndThreshold={0}
                        extraData={this.state}
                        renderItem={({item, index}) => {
                          console.log(value2[index],'fabni');
                          if(value2[index]!=undefined&&value2[index]!=null){
                            value2[index] = null
                          }
                          var sizeFont = value2[index]!=null?13:16
                          return(
                            <TouchableOpacity key={index} onPress={()=>selectVariant(item,index,this.state.selectedProduct.indexFind)}  style={{flexDirection:'row'}}>
                              <View style={{width:value2[index]==null?width-80:width-120,paddingVertical:5,}}>
                                <View style={{flexDirection:'row',backgroundColor:this.state.selectedProduct.selectedIndex==index?this.state.store.themeColor:'#fff',borderRadius:5,borderWidth:this.state.selectedProduct.selectedIndex==index?0:1,borderColor:'#d2d2d2',paddingVertical:5,paddingHorizontal:10,alignItems:'center',justifyContent:'center',width:'100%'}}>
                                <MonoText style={{color:this.state.selectedProduct.selectedIndex==index?'#fff':'grey',fontSize:sizeFont,fontWeight:'700'}}>{item.name}  -</MonoText>
                                <MonoText style={{color:this.state.selectedProduct.selectedIndex==index?'#fff':'grey',fontSize:sizeFont,fontWeight:'700',textDecorationLine: 'line-through',marginHorizontal:10, textDecorationStyle: 'solid'}}>&#8377;{item.mrp}</MonoText>
                                 <MonoText style={{color:this.state.selectedProduct.selectedIndex==index?'#fff':'grey',fontSize:sizeFont,fontWeight:'700'}}>-  &#8377;{Math.round(item.sellingPrice)}</MonoText>
                                </View>
                              </View>
                              {value2[index]!=null&&value2[index]!=undefined&&
                                <View key={index}  style={{width:30,paddingVertical:5,marginHorizontal:5}}>
                                  <View style={{flexDirection:'row',backgroundColor:'#fff',borderRadius:5,borderWidth:1,borderColor:'#d2d2d2',paddingVertical:5,paddingHorizontal:5,alignItems:'center',justifyContent:'center',}}>
                                    <View  style={{backgroundColor: value2[index],width:18,height:18,borderRadius:9}}>
                                    </View>
                                  </View>
                                </View>
                              }
                            </TouchableOpacity>
                          )}}
                  />
             </View>
           }
           </ScrollView>
          </View>
        </Modal>
      )

  }

  openVariantSelection=(variants,type)=>{
    this.setState({selectionType:type,selectedProduct:variants,variantShow:true})
  }

  renderHeader=()=>{
    if(storeType=="MULTI-OUTLET"){
      return(
        <View style={{height:55,width:width,backgroundColor:this.state.store.themeColor}}>
            <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
               <View style={{ flex: 0.85, flexDirection: 'row',  alignItems: 'center',}}>
                 <TouchableOpacity onPress={()=>{this.props.navigation.openDrawer()}} style={{flex:0.15,paddingLeft: 15,paddingRight:0,paddingVertical:10}}>
                    <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
                 </TouchableOpacity>
                 <View style={{flex:0.85,height:35,width:'100%'}}>
                 {Platform.OS === 'android' &&
                 <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('#b2b2b2')} onPress={()=>this.search()} style={{borderRadius:5}} >
                 <View  style={{flex:1,backgroundColor:'#fff',flexDirection:'row',height:35,borderRadius:5}}>
                    <View style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
                       <FontAwesome name={'search'} size={18} color={'grey'} />
                    </View>
                    <View style={{flex:0.85,alignItems:'flex-start',justifyContent:'center'}}>
                       <MonoText   style={{ color:'grey',fontSize:16,}}>Search for Products</MonoText>
                    </View>
                   </View>
                 </TouchableNativeFeedback>
               }
                 {Platform.OS === 'ios' &&
                 <TouchableOpacity onPress={()=>this.search()} style={{borderRadius:5,zIndex:99,flex:1}} >
                 <View  style={{flex:1,backgroundColor:'#fff',flexDirection:'row',height:35,borderRadius:5}}>
                    <View style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
                       <FontAwesome name={'search'} size={18} color={'grey'} />
                    </View>
                    <View style={{flex:0.85,alignItems:'flex-start',justifyContent:'center'}}>
                       <MonoText   style={{ color:'grey',fontSize:16,}}>Search for Products</MonoText>
                    </View>
                   </View>
                 </TouchableOpacity>
                 }

                 </View>
               </View>
               <View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',}}>
                 <TouchableOpacity onPress={()=>this.gotoNotification()} style={{paddingHorizontal: 15,paddingVertical:10}} >
                   <FontAwesome name="bell-o" size={22} color='#fff' />
                   {this.state.notifyAvailable&&
                     <View style={{position:'absolute',top:7,right:15,height:12,width:12,backgroundColor:'red',borderWidth:1.5,borderColor:'#fff',borderRadius:6}}></View>
                   }
                 </TouchableOpacity>

               </View>
             </View>

         </View>
      )
    }else{
    return(
      <View style={{height:105,width:width,backgroundColor:this.state.store.themeColor}}>
          <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',}}>
               <TouchableOpacity onPress={()=>{this.props.navigation.openDrawer()}} style={{paddingHorizontal: 15,paddingVertical:10}}>
                  <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
               </TouchableOpacity>
               <MonoText   style={{ color:'#fff',fontWeight:'700',fontSize:20}}>{this.state.store.company}</MonoText>
             </View>
             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',}}>
               <TouchableOpacity onPress={()=>this.gotoNotification()} style={{paddingHorizontal: 15,paddingVertical:10}} >
                 <FontAwesome name="bell-o" size={22} color='#fff' />
                 {this.state.notifyAvailable&&
                   <View style={{position:'absolute',top:7,right:15,height:12,width:12,backgroundColor:'red',borderWidth:1.5,borderColor:'#fff',borderRadius:6}}></View>
                 }
               </TouchableOpacity>

             </View>
           </View>
             <View style={{height:40,paddingHorizontal:15}}>
             {Platform.OS === 'android' &&
             <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('#b2b2b2')} onPress={()=>this.search()} style={{borderRadius:5}} >
             <View  style={{backgroundColor:'#fff',flexDirection:'row',height:40,borderRadius:5}}>
                <View style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
                   <FontAwesome name={'search'} size={18} color={'grey'} />
                </View>
                <View style={{flex:0.85,alignItems:'flex-start',justifyContent:'center'}}>
                   <MonoText   style={{ color:'grey',fontSize:16,}}>Search for Products</MonoText>
                </View>
               </View>
             </TouchableNativeFeedback>
           }
             {Platform.OS === 'ios' &&
                 <TouchableOpacity onPress={()=>this.search()} >
                   <View  style={{backgroundColor:'#fff',flexDirection:'row',height:40,borderRadius:5}}>
                      <View style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
                         <FontAwesome name={'search'} size={18} color={'grey'} />
                      </View>
                      <View style={{flex:0.85,alignItems:'flex-start',justifyContent:'center'}}>
                         <MonoText   style={{ color:'grey',fontSize:16,}}>Search for Products</MonoText>
                      </View>
                     </View>
                 </TouchableOpacity>
             }

             </View>
       </View>
     )
    }
  }



  render() {

    var {loadingVisible} = this.state

     var themeColor = this.props.store

    var totalCount = 0;
    totalValue = 0;

    for (var i = 0; i < this.state.cartItems.length; i++) {
      totalValue += Math.round(this.state.cartItems[i].totalPrice);
      totalCount += this.state.cartItems[i].count;
    }

   var {counter} = this.props
   counter = counter.toString()


    cartView = totalCount==0? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',backgroundColor: this.state.primaryColor,height:'100%' }}>


    </View>:<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
    <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:themeColor}} onPress={this.checkout}>
      <View style={[styles.account,{height:'100%'}]}>
        <MonoText style={{color:'#fff' , fontSize : 14, }}> <FontAwesome name="shopping-cart" size={32} color="#fff" /> </MonoText>
        <View style={[styles.cartItemNo]}>
        <View style={[styles.cartItemPosition,{borderColor:this.state.store.themeColor,
        color:this.state.store.themeColor,marginLeft:10}]}><MonoText style={{color:this.state.store.themeColor, alignItems:'center',justifyContent:'center'}}>{totalCount}</MonoText></View>
        </View>
        <MonoText style={{color:'#fff' ,  fontSize : 14,}}> CartItems </MonoText>
      </View>
    </TouchableOpacity>

    </View>

    return (
        <View style={styles.container}>
          <View style={{height:Constants.statusBarHeight,backgroundColor:this.props.store.themeColor,}}></View>
            {this.renderHeader()}
            <Loader
            modalVisible = {loadingVisible}
            animationType="fade"
            />
            <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toastMsg" position = 'center'/>
            <ScrollView style={{ flex: 1, }}
                refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                  colors={[this.state.store.themeColor]}
                  tintColor="#fff"
                  titleColor="#fff"
                />
              }>

              <View style={{ flex: 1, backgroundColor: "#000",zIndex:99 }}>
                <Carousel images={this.state.banners} icons={this.state.icons} themeColor={this.state.store.themeColor}/>
              </View>
              <View style={{flex:1,  justifyContent: 'center', alignItems: 'center',paddingBottom: productListShow?0:80,}}>
              {this.state.showOrder.categoryList<this.state.showOrder.simpleList&&
                  <View style={{flex:1,  backgroundColor: "#fff" }}>
                    <CategoryScroll selectedStore={this.state.selectedStore}  navigation={this.props.navigation} store={this.state.store}/>
                  </View>
              }
              {this.state.simpleList.length>0&&
                <View style={{flex:1,}}>
                  <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width, flexDirection:'row'}}>
                    <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,}}>{this.state.simpleListName}</MonoText>
                    <TouchableNativeFeedback style={{ width:60}} onPress={()=>{this.props.navigation.navigate('ViewAllScreen')}} >
                      <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,borderWidth:1, backgroundColor:'#fff', borderColor:'#000', borderRadius:3, paddingVertical:4, paddingHorizontal:8, marginLeft:'auto'}}>View All</MonoText>                          
                    </TouchableNativeFeedback>
                  </View>                  
                  <FlatList style={{width: "100%"}}
                      data={this.state.simpleList.slice(0,2)}
                      keyExtractor={(item,index) => {
                        return index.toString();
                      }}
                      horizontal={false}
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={false}
                      renderItem={({item, index}) => (
                        <View >
                            <SimpleList ref={(ref) => this.refs['simple'+index] = ref} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)} cartLoaderShow={this.state.cartLoaderShow} callToast={(msg)=>this.callToast(msg)} product={item} key={index} index={index} openVariantSelection={(state)=>{this.openVariantSelection(state,'simple')}}  product={item}  selectedStore={this.state.selectedStore} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
                        </View>
                      )}
                    extraData={this.state.cartItems}
                  />
                </View>
              }

              <FlatList contentContainerStyle={{paddingBottom:55}}
                      data={this.state.categories}
                      initialNumToRender={10}
                      keyExtractor={(item, index) => {
                        return index.toString();
                      }}
                      renderItem={({item, index, separators}) => (
                        <CategoryCardV2 category={item} navigation={this.props.navigation}></CategoryCardV2>
                      )}
                      />

                {this.state.showOrder.categoryList>this.state.showOrder.simpleList&&
                    <View style={{flex:1,  backgroundColor: "#fff" }}>
                      <CategoryScroll selectedStore={this.state.selectedStore}  navigation={this.props.navigation} store={this.state.store}/>
                    </View>
                }
                {this.renderStoresList()}
                {this.renderBestSelling()}
                {this.renderRecentList()}

              {   /*this.state.loader == true&&

                      <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:15}}>
                        <ActivityIndicator size="large" color={this.state.store.themeColor} />
                      </View>

              */}

              {productListShow &&   this.state.loader == false&&
                <View style={{flex: 1,}}>
                {this.state.products.length>0&&
                  <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width, flexDirection:'row'}}>
                    <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20, }}>All Products</MonoText>
                    <TouchableNativeFeedback style={{ width:60}} onPress={()=>{this.props.navigation.navigate('ViewAllScreen')}} >
                      <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,borderWidth:1, backgroundColor:'#fff', borderColor:'#000', borderRadius:3, paddingVertical:4, paddingHorizontal:8, marginLeft:'auto'}}>View All</MonoText>                          
                    </TouchableNativeFeedback>
                  </View>
                }
                <FlatList
                  style={{ paddingBottom: 100, marginLeft: -(width * 0.04), marginBottom: 0, paddingTop: 0 }}
                  data={this.state.products.slice(0,2)}
                  keyExtractor={(item,index) => {
                    return index.toString();
                  }}
                  renderItem={({item, index, separators}) => (
                    <ProductFullCardV2 ref={(ref) => this.refs[index] = ref} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)} product={item} key={index} cartLoaderShow={this.state.cartLoaderShow} index={index} openVariantSelection={(state)=>{this.openVariantSelection(state,'product')}} selectedStore={this.state.selectedStore} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
                  )}
                  extraData={this.state.cartItems}
                />
               </View>
             }
               {/*productListShow&&   this.state.load == false &&this.state.loader == false&&this.state.loadMoreProduct&&
                 <TouchableOpacity onPress={this.loadMore}  style={{padding:7,borderWidth:1,backgroundColor:this.state.primaryColor,borderColor:this.state.primaryColor,borderRadius:10,marginBottom:100,marginTop:-70,}} >
                   <MonoText style={{color:'#fff', fontSize:15}}>Load More</MonoText>
                 </TouchableOpacity>
               */}
               {/* this.state.load == true &&this.state.loader == true&&
                 <View style={{marginTop:15}}>
                  <ActivityIndicator size="large" color={this.state.store.themeColor} />
                </View>
               */}
            </View>
          </ScrollView>
          {storeType=='MULTI-OUTLET' &&
            <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <View style={styles.account}>

              <Image source={require('../assets/images/icon1.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
              <MonoText style={{color:this.state.store.themeColor, }}>Home</MonoText>
              </View>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,paddingHorizontal:10}} onPress={() => this.props.navigation.navigate('ReferEarn')}>
                <View style={styles.account}>
                <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
                <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
                </View>
              </TouchableOpacity>
              <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',}} onPress={this.checkout}>
                <View style={[styles.account,{height:'100%',width:'100%'}]}>

                  <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <View style={[styles.cartItemNo]}>
                  <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
                  color:this.state.store.themeColor,}]}><MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText></View>
                  </View>
                  <MonoText  style={{color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
                </View>
              </TouchableOpacity>
              </View>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
                <View style={[styles.account,{height:'100%'}]}>
                  <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <MonoText style={{color:this.state.store.themeColor , fontSize : 14, }}>Categories</MonoText>
                </View>
              </TouchableOpacity>
            </View>
        }
        {storeType!='MULTI-OUTLET'&&
          <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

          <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoHome()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="home" size={20} color={this.state.store.themeColor} /> </MonoText>
              <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Home</MonoText>
            </View>
          </TouchableOpacity>
            <TouchableOpacity style={{flex:1}} onPress={() => this.props.navigation.navigate('ReferEarn')}>
              <View style={styles.account}>
              <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
              <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
              </View>
            </TouchableOpacity>
            <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity style={{backgroundColor:'#fff',}} onPress={this.checkout}>
              <View style={[styles.account,{height:'100%',width:'100%'}]}>

                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="shopping-cart" size={20} color={this.state.store.themeColor} /> </MonoText>
                <View style={[styles.cartItemNo]}>
                <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
                color:this.state.store.themeColor,}]}>
                <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
                </View>
                </View>
                <MonoText style={{color:this.state.store.themeColor ,fontSize : 13,  }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
              </View>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoDiscoverScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="users" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Discover</MonoText>
              </View>
            </TouchableOpacity>
            {chatView&&
            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoChatScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="wechat" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Chat</MonoText>
              </View>
            </TouchableOpacity>
          }
          </View>
      }
          <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={false}  useNativeDriver={true} propagateSwipe={true} onBackdropPress={() => { this.setState({modalVisible:false}) }} onBackdropPress={() => {this.setState({modalVisible:false}) }} deviceWidth={width} deviceHeight={width*0.05}>
            <View style={[this.modalView,{}]}>
            <MonoText style={{ }}>Hi</MonoText>
            </View>
          </Modal>

          {this.variantSelection()}
          {this.askUpdate()}
          {this.renderPlayStoreUpdate()}
          {this.messageShow()}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'flex-start',
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
  modalView: {
     backgroundColor: '#fff',
     // marginHorizontal: width-30 ,
     borderRadius:5,
     margin: 0,
     position:'absolute',
     top:width*0.5,
     left:0,
     right:0
    },
  scrollContainer: {
    backgroundColor: '#fff',
    flex: 1,
    height: width*0.5,
    paddingBottom: 10,
  },
  modalViewUpdate: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.05 ,
     borderRadius:5,
    },
  image: {
    width: width,
    height: width * 0.5
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  // cartItemPosition:{
  //   padding:5,paddingVertical:2,backgroundColor:'#fff',borderRadius: 15, alignItems:'center',
  //     justifyContent:'center',
  //     fontSize:10,
  //     fontWeight:'700',
  //     position:'absolute',
  //     left:6,
  //     top:0,
  //     borderWidth:1,
  // },
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
  }

});

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    totalAmount: state.cartItems.totalAmount,
    cart : state.cartItems.cartItem,
    user : state.cartItems.user,
    store:state.cartItems.store,
    myStore:state.cartItems.myStore,
    storeType:state.cartItems.storeType,
    selectedStore:state.cartItems.selectedStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
    setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
    removeMyStoreFunction:()=>dispatch(actions.removeMyStore()),
    setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);