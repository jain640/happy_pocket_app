import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Slider,
  Dimensions, Alert, FlatList, AsyncStorage,ToastAndroid,TouchableWithoutFeedback,ActivityIndicator
} from 'react-native';
import { FontAwesome,Entypo,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import Productcard from '../components/Productcard.js';
import ProductFullCardV2 from '../components/ProductFullCardV2.js';
import ProductView from '../components/ProductView.js';
import  Constants  from 'expo-constants';
import Modal from "react-native-modal";
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
import { Card } from 'react-native-elements';

import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
import NetInfo from '@react-native-community/netinfo';

const SERVER_URL = settings.url
const storeType = settings.storeType
const chatView = settings.chat
const themeColor = settings.themeColor

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

class SubCategoryList extends React.Component {





  static navigationOptions = ({ navigation,props }) => {
    const { params = {} } = navigation.state
    return {
      title: `${navigation.state.params.title}`,

      headerRight: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }}>
          <TouchableOpacity style={{ paddingHorizontal: 15 ,paddingVertical:6}} onPress={() => params.searchoption()}  >
          <MonoText><FontAwesome name="search" size={22} color="#fff" /> </MonoText>
         </TouchableOpacity  >
        </View>
      ),
      headerStyle: {
        backgroundColor: navigation.state.params.color,
        marginTop:Constants.statusBarHeight
      },
      headerTintColor: '#fff',
    }
  };

  constructor(props) {
    super(props);
    var subCategory = props.navigation.getParam('subCategory',[])
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
      categoryList:subCategory,
      loader:true
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
         // this.getCategoryDetails()
         // this.setState({initial:true})
       }
    }else{
      this.setState({connectionStatus : false})
      this.showNoInternet()
    }
  }

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }



  getCategoryDetails=()=>{

    this.props.navigation.setParams({
      searchoption: this.search,
    });
    this.setState({products:[]})

    var url = SERVER_URL + '/api/POS/categoryLite/?parent=' + true

    fetch(url)
    .then((response) =>{return response.json()})
    .then((responseJson) => {
      this.setState({ products: responseJson })
    })
    .catch((error) => {
      return
    });

  // }
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



  // updateCart = (args) =>{
  //   if (args.type == actionTypes.ADD_TO_CART){
  //       this.props.addTocartFunction(args);
  //   }
  //   if (args.type == actionTypes.INCREASE_CART){
  //       this.props.increaseCartFunction(args);
  //   }
  //   if (args.type == actionTypes.DECREASE_CART){
  //       this.props.decreaseFromCartFunction(args);
  //   }
  //
  // }
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
      searchoption: this.search,
    });
    this.setState({loader:false})
    console.log(this.state.categoryList,'sdgbvdsnhdfgmnjfg');
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

  // checkout=async()=>{
  //
  //   var login = await AsyncStorage.getItem("login")
  //   if(login){
  //     if(this.props.counter>0){
  //       this.props.navigation.navigate('CheckoutProducts', {
  //         color: this.state.primaryColor
  //       })
  //     }else{
  //       this.refs.toast.show('No Items Added in the Cart ');
  //       }
  //   }else{
  //     this.login()
  //   }
  // }

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

  openSubCategory = (item)=>{
    console.log(item,'hhhhhhhhhhh');
      this.props.navigation.navigate('CategoryFilterScreen', {
          subCategory : item,title: entities.decode(item.name),color:this.state.store.themeColor
      })
  }

  gotoViewAll=(item)=>{
    this.props.navigation.navigate('CategoryFilterScreen',{subCategory:item,title: entities.decode(item.name),color:this.state.store.themeColor})
  }


  render() {

    var totalCount = 0;
    totalValue = 0;
    for (var i = 0; i < this.state.cartItems.length; i++) {
      totalValue += Math.round(this.state.cartItems[i].discountedPrice*this.state.cartItems[i].count);
      totalCount += this.state.cartItems[i].count;
    }
    var themeColor = this.props.store.themeColor

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
      <View style={styles.container}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={{flex:1}}>
        {this.state.loader&&
           <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <ActivityIndicator size={'large'} color={themeColor} />
           </View>
        }
        {!this.state.loader&&
          <ScrollView contentContainerStyle={{paddingBottom:60}}>

            <FlatList
              style={{marginBottom: 0, paddingTop: 0 }}
              data={this.state.categoryList.child}
              keyExtractor={(item) => {
                return item.pk.toString();
              }}
              renderItem={({item, index}) =>{
                var subChild = item.subChild
                if(subChild==undefined){
                  subChild = []
                }
                return(
                  (
                  <View style={{width:width}}>
                      <View style={{flex:1,flexDirection:'row',backgroundColor:'#fff',height:40,paddingHorizontal:15,borderTopWidth:index==0?0:1,borderBottomWidth:1,borderColor:'#f2f2f2',backgroundColor:'#f2f2f2'}}>
                        <View style={{flex:0.8,justifyContent:'center',alignItems:'flex-start'}}>
                          <MonoText style={{color:'#000',fontSize:16,fontWeight:'700',}} numberOfLines={1}>{entities.decode(item.name)}</MonoText>
                        </View>
                        <TouchableOpacity style={{flex:0.2,justifyContent:'center',alignItems:'flex-end'}} onPress={()=>{this.gotoViewAll(item)}}>
                          <MonoText style={{color:themeColor,fontSize:14,}}>See All</MonoText>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        style={{marginBottom: 0, paddingTop: 0 }}
                        data={subChild}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => {
                          return item.pk.toString();
                        }}
                        renderItem={({item, index}) => (
                          <View style={{flex:1,backgroundColor:'#fff',height:'100%',paddingRight:index==(subChild.length-1)?15:0,paddingVertical: 15,paddingLeft:index==0?15:0}}>
                          <TouchableWithoutFeedback onPress={() => this.openSubCategory(item)}>
                            <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff',borderRadius:5,width:width*0.35,height:width*0.36,margin:0,padding: 0,marginRight:15,marginLeft:5}]}>
                               <View style={{height:'100%'}}>
                                 <View style={{flex:1,}}>
                                   <View style={{height:width*0.23,alignItems: 'center',justifyContent: 'flex-end',marginHorizontal:5,}}>
                                       <Image
                                       source={{uri:SERVER_URL+item.img}}
                                       style={{ width: 80, height:60,resizeMode:'contain',backgroundColor:'#fff'}}
                                       />
                                   </View>
                                   <View style={{height:width*0.13,alignItems: 'center',justifyContent: 'flex-start',marginHorizontal:5,marginTop:5}}>
                                    <MonoText   style={{  color: '#000',fontSize: 14,fontWeight:'400',textAlign:'center', }} numberOfLines={2}>{entities.decode(item.name)}</MonoText>
                                   </View>
                                 </View>
                               </View>
                            </Card>
                            </TouchableWithoutFeedback>
                          </View>
                        )}
                       />

                  </View>
                  )
                )
              } }
             />

        </ScrollView>
      }
        </View>

        <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  themeColor,paddingHorizontal: 15}]}>
        {storeType=='MULTI-OUTLET' &&
          <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

          <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.props.navigation.navigate('HomeScreen')}>
          <View style={styles.account}>

          <Image source={require('../assets/images/icon1.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
          <MonoText   style={{color:this.state.store.themeColor}}>Home</MonoText>
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

                <MonoText   style={{color:'#fff' , }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
                <View style={[styles.cartItemNo]}>
                <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
                color:this.state.store.themeColor,}]}>
                <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
                </View>
                </View>
                <MonoText   style={{color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
              </View>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
                <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
              </View>
            </TouchableOpacity>
          </View>
      }
      {storeType!='MULTI-OUTLET'&&
        <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

        <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoHome()}>
          <View style={[styles.account,{height:'100%'}]}>
            <MonoText   style={{color:'#fff' , }}> <FontAwesome name="home" size={20} color={this.state.store.themeColor} /> </MonoText>
            <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Home</MonoText>
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

              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="shopping-cart" size={20} color={this.state.store.themeColor} /> </MonoText>
              <View style={[styles.cartItemNo]}>
              <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
              color:this.state.store.themeColor,}]}>
              <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
              </View>
              </View>
              <MonoText   style={{color:this.state.store.themeColor ,fontSize : 13, }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
            </View>
          </TouchableOpacity>
          </View>
        {/*  <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
              <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
            </View>
          </TouchableOpacity>*/}

          <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoDiscoverScreen()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="users" size={20} color={this.state.store.themeColor} /> </MonoText>
              <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Discover</MonoText>
            </View>
          </TouchableOpacity>
          {chatView&&<TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoChatScreen()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="wechat" size={20} color={this.state.store.themeColor} /> </MonoText>
              <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Chat</MonoText>
            </View>
          </TouchableOpacity>
        }
        </View>
    }

        </View>

      </View>
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
export default connect(mapStateToProps, mapDispatchToProps)(SubCategoryList);




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  }

});
