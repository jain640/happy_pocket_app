import React from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,TouchableNativeFeedback,
  View,
  Slider,
  Dimensions, Alert, FlatList, AsyncStorage,ToastAndroid,StatusBar,ActivityIndicator
} from 'react-native';
import { FontAwesome,Entypo,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import SimpleList from '../components/SimpleList.js';
import Productcard from '../components/Productcard.js';
import ProductFullCardV2 from '../components/ProductFullCardV2.js';
import ProductView from '../components/ProductView.js';
import  Constants  from 'expo-constants';
import Modal from "react-native-modal";
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';

import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-navigation';
import TabBarStyle from '../components/TabBarStyle';
import { ScrollableTabView, DefaultTabBar, ScrollableTabBar, } from '@valdio/react-native-scrollable-tabview';

const SERVER_URL = settings.url
const storeType = settings.storeType
const chatView = settings.chat
const themeColor = settings.themeColor

const tabMultivendor = [
    {
      name:'Top Deal',
    },
    {
      name:'Smartlist',
    },
    /*{
      name:'Newly added',
    },*/
    {
      name:'All Products',
    },
  
]
const tabs = tabMultivendor

class ViewAllScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: `View All`,

            headerRight: (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }}>
                <TouchableOpacity style={{ paddingHorizontal: 15 ,paddingVertical:6}} onPress={() => params.searchoption()}  >
                <MonoText><FontAwesome name="search" size={22} color="#fff" /> </MonoText>
                </TouchableOpacity  >
                </View>
            ),
            headerStyle: {
                backgroundColor: params.themeColor,
                marginTop:Platform.OS=='android'?Constants.statusBarHeight:0
            },
            headerTintColor: '#fff',
        }
    };

    constructor(props) {
        super(props);
        this.state = {
        primaryColor: '',
        products: [],
        cartItems : this.props.cart,
        store:this.props.store,
        initial:false,
        selectedStore:this.props.selectedStore,
        pageIndex:0,
        myStore:this.props.myStore,
        selectedProduct:null,
        variantShow:false,
        loader:false,
        page:0,
        loaderMore:false,
        simpleList:[],
        simpleListName:'',
        recentlist:[],
        recentlistName:'',
        noMore:false,
        scrollX : new Animated.Value(0),
        scrollY: new Animated.Value(0),
        }

        willFocus = props.navigation.addListener(
            'willFocus',
            payload => {
                this.setConnection()
            }
        );

    }
    setConnection=()=>{
        this.setState({unsubscribe:NetInfo.addEventListener(state =>{
        this.handleConnectivityChange(state);
        })})
    }

    handleConnectivityChange=(state)=>{
        if(state.isConnected){
        this.setState({connectionStatus : true})
        if(!this.state.initial){
            //this.getCategoryDetails()
            this.setState({initial:true})
        }
        this.getBanner();
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

    userAsync = () => {
        AsyncStorage.getItem('login').then(userToken => {
        if(userToken == 'true' || userToken == true){
            this.setState({userScreen:'ProfileScreen'})
        }else{
            this.setState({userScreen:'LogInScreen'})
        }
        }).done();

    };



    componentDidUpdate(prevProps){
        if(prevProps.cart !== this.props.cart) {
            this.setState({cartItems: this.props.cart});
        }
    }

    getBanner=async()=>{
        fetch(SERVER_URL + '/api/POS/uielements/')
            .then((response) => response.json())
            .then((responseJson) => {
            var simplelist = []
            var recentlyviewedlist = []
            var appendSimple = false
            var appendRecentlyviewed = false
            var showOrder = this.state.showOrder
            console.log(responseJson,'lllllllllll');
            responseJson.forEach((i)=>{
                if(i.type=='simple_list'&&i.isAvailableInApp&&!appendSimple){
                    simplelist.push(i)
                    appendSimple = true
                }
                if(i.type=='recentlyviewed'&&i.isAvailableInApp&&!appendRecentlyviewed){
                    recentlyviewedlist.push(i)
                    appendRecentlyviewed = true
                }
                
            })
            if(simplelist.length>0){
                this.getAllProducts(simplelist[0])
            }
            if(recentlyviewedlist.length>0){
                this.recentlyViewedList(recentlyviewedlist[0])
            }

            })
            .catch((error) => {
            return
            });
    }

    recentlyViewedList=async(recentlist)=>{
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        const csrf = await AsyncStorage.getItem('csrf');
        const login = await AsyncStorage.getItem('login');
        console.log('recentlyViewedList')
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
            console.log(responseJson,'REcent')
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

    getAllProducts=(simplelist)=>{
        fetch(SERVER_URL + '/api/POS/getallgroup/?name='+simplelist.target+'&store='+this.state.selectedStore.pk)
            .then((response) =>{return response.json()})
            .then((responseJson) => {
            if(responseJson==undefined){
                return
            }
            if(responseJson!=undefined&&responseJson.products!=undefined){
                console.log(responseJson,'Top Deal')
                this.setState({simpleList: responseJson.products,simpleListName:responseJson.displayName})
            }
            })
            .catch((error) => {
            return
            });
    }

        
    getProduct=async()=>{
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

    componentDidMount() {
        this.props.navigation.setParams({
            themeColor: this.state.store.themeColor,
        });
    }
    variantSelection =()=>{
        selectVariant =(name,index,id)=>{
            this.setState({selectedProduct:null,variantShow:false})
            this.refs[id].dropDownChanged(name,index)
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
                            return(
                            <TouchableOpacity key={index} onPress={()=>selectVariant(item,index,this.state.selectedProduct.indexFind)} style={{flex:1,paddingVertical:5,width:'100%'}}>
                                <View style={{backgroundColor:this.state.selectedProduct.selectedIndex==index?this.state.store.themeColor:'#fff',borderRadius:5,borderWidth:this.state.selectedProduct.selectedIndex==index?0:1,borderColor:'#d2d2d2',paddingVertical:5,paddingHorizontal:10,alignItems:'center',justifyContent:'center',width:width-80}}>
                                <MonoText style={{color:this.state.selectedProduct.selectedIndex==index?'#fff':'grey',fontSize:16,fontWeight:'700'}}>{item.name}  -  <MonoText style={{textDecorationLine: 'line-through',marginHorizontal:5, textDecorationStyle: 'solid'}}>&#8377;{item.mrp} </MonoText>  -  &#8377;{item.sellingPrice}</MonoText>
                                </View>
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

    openVariantSelection=(variants)=>{
        console.log(variants,'jjjjjjjj');
        this.setState({selectedProduct:variants,variantShow:true})
    }

    login = () => {
        this.props.navigation.navigate('LogInScreen', {
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

    search = () => {
        this.props.navigation.navigate('SearchBar', {
            color: this.state.primaryColor
        })
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

    gotoCategories = ()=>{
        this.props.navigation.navigate('CategoriesScreen')
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

    gotoNotification=async()=>{
        var login = await  AsyncStorage.getItem('login');
        if(login == 'true'){
          this.props.navigation.navigate('NotificationScreen')
        }else{
          this.props.navigation.navigate('LogInScreen')
        }
    }

    handlePageChange=(e)=>{
        var offset = e.nativeEvent.contentOffset;
        if(offset) {
          var page = Math.round(offset.x / width) ;
          this.setState({selectedTab:page})
        }
        this.setState({scrollY:new Animated.Value(0)})
      }

      
    loadMore=async()=>{
        console.log(this.state.page,'hhhhhhhh');
        var url = SERVER_URL + '/api/POS/outletProductsDetailed/?page='+this.state.page+'&recurcategory=' + this.props.navigation.state.params.subCategory.pk+'&storeid='+this.state.selectedStore.pk
        this.setState({loaderMore:true})
        fetch(url)
        .then((response) =>{return response.json()})
        .then((responseJson) => {
        console.log(responseJson,'dngjsnng');
        this.setState({loaderMore:false})
        if(responseJson!=undefined){
            const arr = this.state.products
            if(responseJson.data.length==0){
            this.setState({noMore:true})
            }
            responseJson.data.forEach((item)=>{
            if(item.variant.length>0){
                arr.push(item)
            }
            })
            this.setState({ products: arr,page:this.state.page+1})
        }

        })
        .catch((error) => {
        this.setState({loaderMore:false})
        return
        });

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

        var totalCount = 0;
        totalValue = 0;
        for (var i = 0; i < this.state.cartItems.length; i++) {
            totalValue += Math.round(this.state.cartItems[i].discountedPrice*this.state.cartItems[i].count);
            totalCount += this.state.cartItems[i].count;
        }

        var themeColor = this.props.store.themeColor
        if(storeType=='MULTI-OUTLET'){
            var left = this.state.scrollX.interpolate({
                inputRange: [0,1*width,2*width ],
                outputRange: [0, width*0.33,width*0.67],
                extrapolate: 'clamp'
            });
        }else{
            var left = this.state.scrollX.interpolate({
                inputRange: [0,1*width,2*width ],
                outputRange: [0, width*0.33,width*0.66],
                extrapolate: 'clamp'
            });
        }
        var {counter} = this.props
        counter = counter.toString()

        cartView = totalCount==0? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
        </View>:<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
            <View style={styles.account}>
                <MonoText   style={{color:'#fff',fontSize:18}}>&#8377;{totalValue}</MonoText>
                <TouchableOpacity style={{ marginHorizontal: 8, }} onPress={this.checkout}><MonoText   style={{color:'#fff',fontSize:18}}>Proceed To Checkout </MonoText> </TouchableOpacity  >
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end',marginRight:10}}>
                <MonoText   style={[styles.cartItemNo,{borderColor:themeColor,color:themeColor,}]}>{totalCount}</MonoText>
            </View>

        </View>

        return (
        <SafeAreaView style={styles.container}>
            {this.renderHeader()}
            <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toastMsg" position = 'center'/>
            {this.state.loader&&
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <ActivityIndicator size="large" color={this.state.store.themeColor} />
            </View>
            }
            {!this.state.loader&&
                <View style={{}}>
                    <Animated.View style={{flexDirection: 'row',}}>
                        {tabs.map((item, i) => {
                            return (
                            <TouchableOpacity key={i} onPress={()=>{this.setState({selectedTab:i});this.scroll.scrollTo({ x: (i)*width });this.setState({scrollY:new Animated.Value(0)})}} style={{flex:1,borderBottomWidth: 1,borderColor:'#fff',backgroundColor:'#f2f2f2',alignItems: 'center',justifyContent: 'center',height:45}} >
                            <MonoText   style={{fontSize:12,fontWeight:'700',color:this.state.selectedTab==i?themeColor:'grey'}}>{item.name}</MonoText>
                            </TouchableOpacity>
                            );
                        })}
                        <Animated.View
                        style={{ height: 2, width: storeType=='MULTI-OUTLET'?'33%':this.state.selectedTab==0?'33%':'33%', backgroundColor: themeColor,position: 'absolute',bottom: 0,left:0,
                        transform: [{translateX:left}]}}
                        />
                    </Animated.View>
                    <ScrollView
                        horizontal={true}
                        pagingEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: this.state.scrollX } } }]  )}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={this.handlePageChange}
                        ref={(node) => {this.scroll = node}}
                        style={{flex:1}}
                        onContentSizeChange={() =>this.scroll.scrollTo({ x: (this.state.selectedTab)*width })}
                        >
                            <MonoText>2222222TEE{this.state.simpleList.length}</MonoText>
                        {tabs.map((item, i) => {
                            if(storeType=='MULTI-OUTLET'){
                                i = i+1
                            }
                            return (

                                <View key={i} style={{flex:1,backgroundColor: '#f2f2f2',width:width*1,}} >
                                    <MonoText>TEE{this.state.simpleList.length}</MonoText>
                                {i==0&&
                                <View style={{flex:1,}}>
                                    <ScrollView>
                                        <MonoText>TEE{this.state.simpleList.length}</MonoText>
                                        <FlatList style={{width: "100%"}}
                                            data={this.state.simpleList}
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
                                    </ScrollView>
                                </View>
                                }
                                {i==1&&
                                <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
                                    <ScrollView>
                                    <View style={{marginHorizontal:10,backgroundColor:'#f2f2f2'}}>

                                    <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
                                        data={this.state.data}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item,index) => {
                                            return index.toString();
                                        }}
                                        nestedScrollEnabled={true}
                                        renderItem={({item, index}) =>{
                                            if(item.status=='open'){
                                            return (
                                            <View style={{paddingTop:index==0?15:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
                                            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('UserForumDetailedScreen',{data:item})}}>
                                                <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                                                <View style={{}}>
                                                    <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
                                                    <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-start',marginLeft:15}}>
                                                        <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
                                                    </View>
                                                    <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-end',marginRight:15}}>
                                                        <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                                        <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.category}</MonoText>
                                                        </View>
                                                    </View>
                                                    </View>
                                                    <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
                                                    <View style={{marginHorizontal: 15}}>

                                                        <HTMLView value = {"<div>"+item.description+"</div>"} stylesheet={styles} />
                                                    </View>
                                                    </View>
                                                    <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                                        <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.commentCount} New Message</MonoText>
                                                    </View>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
                                                        <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                                    </View>
                                                    </View>
                                                </View>
                                                </Card>
                                            </TouchableOpacity>
                                            </View>
                                        )}else{
                                            <View></View>
                                        }}}

                                        />
                                    </View>
                                    </ScrollView>

                                </View>
                                }
                                {i==2&&
                                <View style={{flex:1,}}>
                                <ScrollView>
                                <View style={{marginHorizontal:10,backgroundColor:'#f2f2f2'}}>

                                    <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
                                        data={this.state.data}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item,index) => {
                                        return index.toString();
                                        }}
                                        nestedScrollEnabled={true}
                                        renderItem={({item, index}) =>{
                                        if(item.status=='resolved'||item.status=="closed"){
                                            return (
                                        <View style={{paddingTop:index==0?15:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
                                            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('UserForumDetailedScreen',{data:item,comment:false})}}>
                                            <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                                                <View style={{}}>
                                                <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
                                                    <View style={{flex:0.7,justifyContent: 'center',alignItems: 'flex-start',marginLeft:15}}>
                                                    <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
                                                    </View>
                                                    <View style={{flex:0.3,justifyContent: 'center',alignItems: 'flex-end',marginRight:15}}>
                                                    <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                                        <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.category}</MonoText>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
                                                    <View style={{marginHorizontal: 15}}>

                                                    <HTMLView value = {"<div>"+item.description+"</div>"} stylesheet={styles} />
                                                    </View>
                                                </View>
                                                <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                                    <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.commentCount} New Message</MonoText>
                                                    </View>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
                                                    <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                                    </View>
                                                </View>
                                                </View>
                                            </Card>
                                            </TouchableOpacity>
                                        </View>
                                        )}else{
                                        <View></View>
                                        }}}

                                        />
                                </View>

                                </ScrollView>

                                </View>
                                }
                                {i==3&&
                                <View style={{flex:1,}}>
                                <ScrollView>
                                <View style={{marginHorizontal:10,backgroundColor:'#f2f2f2'}}>

                                    <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
                                        data={this.state.data}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item,index) => {
                                        return index.toString();
                                        }}
                                        nestedScrollEnabled={true}
                                        renderItem={({item, index}) =>{
                                        if(item.status=='resolved'||item.status=="closed"){
                                            return (
                                        <View style={{paddingTop:index==0?15:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
                                            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('UserForumDetailedScreen',{data:item,comment:false})}}>
                                            <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                                                <View style={{}}>
                                                <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
                                                    <View style={{flex:0.7,justifyContent: 'center',alignItems: 'flex-start',marginLeft:15}}>
                                                    <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
                                                    </View>
                                                    <View style={{flex:0.3,justifyContent: 'center',alignItems: 'flex-end',marginRight:15}}>
                                                    <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                                        <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.category}</MonoText>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
                                                    <View style={{marginHorizontal: 15}}>

                                                    <HTMLView value = {"<div>"+item.description+"</div>"} stylesheet={styles} />
                                                    </View>
                                                </View>
                                                <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                                    <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.commentCount} New Message</MonoText>
                                                    </View>
                                                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
                                                    <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                                    </View>
                                                </View>
                                                </View>
                                            </Card>
                                            </TouchableOpacity>
                                        </View>
                                        )}else{
                                        <View></View>
                                        }}}

                                        />
                                </View>

                                </ScrollView>

                                </View>
                                }

                                </View>
                            );
                            })}

                        </ScrollView>
                </View>
            }
        </SafeAreaView>
        );
    }
}

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
    totalAmount:state.cartItems.totalAmount,
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
export default connect(mapStateToProps, mapDispatchToProps)(ViewAllScreen);




const styles = StyleSheet.create({
  container: {
    top:20,
    flex:1,
    paddingBottom:35,
  },
  scrollContainer: {
    flex: 1,
    height: '35%',
  },
  image: {
    width: width,
    height: width * 0.5
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

});
