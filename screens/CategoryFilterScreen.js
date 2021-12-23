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
  Dimensions, Alert, FlatList, AsyncStorage,ToastAndroid,TouchableWithoutFeedback,Picker
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

const filters =  [{label:'Price(Low to high)',value:'lh'},{label:'Price(High to Low)',value:'hl'},{label:'Discount(High to Low)',value:'dhl'},{label:'Newest First',value:'new'},]

class CategoryFilterScreen extends React.Component {





  static navigationOptions = ({ navigation }) => {
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
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
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
      selectedFilter:filters[3].value,
      page:0
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
       // if(!this.state.initial){
         this.getCategoryDetails(0,this.state.selectedFilter)
       //   this.setState({initial:true})
       // }
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



  getCategoryDetails=(page,selectedFilter)=>{

    this.props.navigation.setParams({
      searchoption: this.search,
    });
    if(page==0){
      this.setState({products:[]})
    }

    var url = SERVER_URL + '/api/POS/getVariantList/?page='+page+'&filter='+selectedFilter+'&catpk='+this.state.categoryList.pk

    fetch(url)
    .then((response) =>{return response.json()})
    .then((responseJson) => {
      if(responseJson!=undefined){
        if(responseJson.data!=undefined){
          var arr = this.state.products
          responseJson.data.forEach((i)=>{
            arr.push(i)
          })
          this.setState({ products: arr,page:page+1 })
        }
      }
    })
    .catch((error) => {
      return
    });

}


setFilter=(itemValue)=>{
  this.setState({selectedFilter:itemValue})
  this.getCategoryDetails(0,itemValue)
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
      this.props.navigation.navigate('SubCategoryView', {
          subCategory : item,title: entities.decode(item.name)
      })
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


    let availableFilters= filters.map( (s, i) => {
      return <Picker.Item key={i} value={s.value} label={s.label} style={{fontSize:12,paddingLeft:50}}  ></Picker.Item>
    });

    return (
      <View style={styles.container}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={[{height:45,width:width,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}]}>
            <View style={{flex:0.7,justifyContent:'center',}}>
              <View style={{position:'absolute',left:0,top:0,height:45,justifyContent:'center',width:30,alignItems:'center'}}>
                <FontAwesome name="filter" size={20} color={themeColor} />
              </View>
              <Picker
                selectedValue={this.state.selectedFilter}
                mode="dropdown"
                style={{ width: "100%",height:45 ,position:'absolute',left:'15%',top:0,}}
                itemStyle={{marginVertical:0,paddingVertical:0,fontSize:12,}}
                onValueChange={(itemValue, itemIndex)=>this.setFilter(itemValue)}>
                {availableFilters}
              </Picker>
            </View>
        </View>
        <View style={{flex:1}}>
        <ScrollView contentContainerStyle={{paddingBottom:60}}>

        <FlatList
          style={{marginBottom: 0, paddingTop: 0 }}
          data={this.state.products}
          keyExtractor={(item) => {
            return item.pk.toString();
          }}
          renderItem={({item, index}) =>{
            if(item.images!=undefined&&item.images.length>0){
              var img = SERVER_URL+item.images[0].attachment
            }else{
              var img = null
            }
            return(
                <View style={{flex:1,backgroundColor:'#fff',height:'100%',}}>
                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ProductDetails',{product:item.parent,userScreen:null})}>
                  <View containerStyle={[{borderWidth: 0, borderColor: '#fff',width:'100%',margin:0,padding: 0,}]}>
                     <View style={{height:'100%',paddingHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2',paddingVertical:10}}>
                       <View style={{flex:1,flexDirection:'row'}}>
                         <View style={{flex:0.3,}}>
                             <Image source={{ uri: img }} style={{ width: '100%', height: width * 0.3, alignSelf: 'center' }} />
                         </View>
                         <View style={{flex:0.7,marginHorizontal:10,marginTop:5}}>
                          <MonoText style={{ color: '#000', fontWeight: '700',  marginTop: 5, textAlign: 'left', fontSize: 15,alignSelf: "stretch" }} > {item.displayName}</MonoText>
                          <MonoText style={{ color: '#000', fontWeight: '700',  marginTop: 5, textAlign: 'left', fontSize: 15,alignSelf: "stretch" }} >MOQ : {item.minQtyOrder} {item.unitType}</MonoText>
                          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 5 }}>
                             <MonoText style={{ color: '#000',  marginTop: 1, fontSize: 16 ,paddingRight:10,borderRightWidth:1,borderRightColor:'#000'}}>&#8377;{Math.round(item.sellingPrice)}</MonoText>
                             <MonoText style={{ color: 'grey', marginTop: 1, fontSize: 16 , paddingRight:10,borderRightWidth:1,marginLeft:10,borderRightColor:'#000'}}>&#8377;{Math.round(item.price)}</MonoText>
                             <MonoText style={{ color: 'red', marginTop: 1, fontSize: 16 , paddingRight:10,marginLeft:10}}><MonoText style={{color:'red'}}>Save</MonoText> &#8377;{Math.round(item.discount)}</MonoText>
                          </View>
                         </View>
                       </View>
                     </View>
                  </View>
                  </TouchableWithoutFeedback>
                </View>
            )
          } }
         />
         <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
           { this.state.products.length>0&&
             <TouchableOpacity onPress={()=>this.getCategoryDetails(this.state.page,this.state.selectedFilter)}  style={{padding:7,borderWidth:0,backgroundColor:themeColor,}} >
               <MonoText   style={{ color:'#fff',fontSize:15}}>Load More</MonoText>
             </TouchableOpacity>
           }
           { this.state.products.length==0&&
             <View   style={{}} >
               <MonoText   style={{ color:'#000',fontSize:15}}>No Products</MonoText>
             </View>
           }
         </View>


        </ScrollView>
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
          {/*<TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
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
export default connect(mapStateToProps, mapDispatchToProps)(CategoryFilterScreen);




const styles = StyleSheet.create({
  container: {
    flex: 1,
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
