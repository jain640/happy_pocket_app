import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,Text,ToastAndroid,Keyboard,TouchableWithoutFeedback,Dimensions,Image,AppState,BackHandler,AsyncStorage,Platform,ActivityIndicator,Button,ScrollView} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
// import { SearchBar } from 'react-native-elements';
import { FontAwesome,MaterialIcons,Entypo,Feather } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import SearchCategoryCard from '../components/SearchCategory.js';
import ImageOverlay from "react-native-image-overlay";
import settings from '../constants/Settings.js';
import { withNavigationFocus } from 'react-navigation';
import { MonoText } from '../components/StyledText';
const SERVER_URL = settings.url
const storeType = settings.storeType
const themeColor = settings.themeColor
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const chatView = settings.chat

class StoreSearch extends React.Component {
  static navigationOptions = {
    header:null,
  }

  constructor(props) {
  super(props);
  this.state = {
    firstQuery: '',
    loading:false,
    loader:false,
    cartItems : props.cart,
    limit:20,
    offset:0,
    count:0,
    search:false,
    store:props.store,
    selectedStore:props.selectedStore,
    myStore:props.myStore,
    storeList:[],
    keyboardOffset: 0,
    keyboardOpen : false,
  };
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




  searchStore(query){
    console.log(query.length,'ttttttttt')

    this.setState({loader:true})
    if(query.length <=0){
      this.setState({ search: false,loader:false })
      return
    }

     fetch(SERVER_URL + '/api/POS/searchStore/?search='+query)
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
        console.log(responseJson,'resulttttttt');
        this.setState({ storeList: responseJson.stores,loader:false,search:true})
      })
      .catch(() => {
        this.setState({ loading: false,loader:false });
      });
  }



  componentDidMount() {
    this.userAsync()
  }
  userAsync = () => {

    AsyncStorage.getItem('login').then(userToken => {
      if(userToken == 'true' || userToken == true){
        console.log('useracc')
        this.setState({userScreen:'ProfileScreen'})
      }else{
        console.log('login')
        this.setState({userScreen:'LogInScreen'})
      }
    }).done();

  };

  gotoCategories = ()=>{
    this.props.navigation.navigate('CategoriesScreen', {
      color: themeColor
    })
  }

  gotoCategory=(item)=>{
    console.log(item.parent,'categories child');
    if(item.parent == null){
      var child = []
      for (var i = 0; i < this.state.genericProductList.length; i++){
        if(this.state.genericProductList[i].parent != null){
          if(this.state.genericProductList[i].parent.pk == item.pk){
            child.push(this.state.genericProductList[i].pk)
          }
        }
      }
      console.log(child,'categories child');
      this.props.navigation.navigate('SubCategoryView', {
          subCategory : item,title: item.name,parent:true,child:child
      })
      return
    }else{
      this.props.navigation.navigate('SubCategoryView', {
          subCategory : item,title: item.name,
      })
    }

  }



  login = () => {

    this.props.navigation.navigate(this.state.userScreen, {
      color: themeColor
    })
  }

  checkout=()=>{
    if(this.state.userScreen == 'ProfileScreen'){
      if(this.props.counter > 0){
        this.props.navigation.navigate('CheckoutProducts', {
          color: this.state.primaryColor
      })
    }else{
        ToastAndroid.show('No Items Added in the Cart ', ToastAndroid.SHORT);
      }
    }else{
      this.login()
    }
  }

   details=(pk)=>{
     this.props.navigation.navigate('ProductDetails',{product:pk,userScreen:this.state.userScreen})
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

  render() {

    const { firstQuery } = this.state;
    const icon = firstQuery.length>0?'search':'arrow-back'
     const { navigation } = this.props;
     const search = this.state.search?this.state.searchProducts:this.state.products
     const color = navigation.getParam('color','#000')
     var themeColor = this.props.store.themeColor

     var totalCount = 0

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
         <MonoText   style={{color:'#fff' , fontSize : 14,}}> <FontAwesome name="shopping-cart" size={32} color="#fff" /> </MonoText>
         <MonoText   style={[styles.cartItemNo,{borderColor:themeColor,color:themeColor,}]}>{totalCount}</MonoText>
         <MonoText   style={{color:'#fff' , fontSize : 14,}}> CartItems </MonoText>
       </View>
     </TouchableOpacity>
     </View>


    return (
      <View style={{flex:1}}>
      <View style={{backgroundColor:themeColor,paddingTop:Constants.statusBarHeight,paddingBottom:0, height:3*Constants.statusBarHeight}}>
      <Searchbar
        ref={input => { this.textInput = input }}
        showLoading
        style= {{height:2*Constants.statusBarHeight,borderRadius:0}}
        icon='arrow-back'
        placeholder='Search'
        onIconPress ={()=>{
          this.props.navigation.goBack()}}
        onChangeText={query =>{
          this.setState({firstQuery:query})
      } }
      onSubmitEditing={()=>{this.searchStore(this.state.firstQuery)}}
        onCancel={() => {this.setState({search:false});}}
        value={firstQuery}
      />
      </View>

      <ScrollView style={{flex:1,marginTop:0}}>
      <View>
      {this.state.loader == true&&
          <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:3*Constants.statusBarHeight}}>
            <ActivityIndicator size="large" color={themeColor} />
          </View>
      }
      {!this.state.search&&!this.state.loader&&
          <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:3*Constants.statusBarHeight }}>
            <MonoText   style={{fontSize:16,textAlign:'center',marginTop:20,fontWeight:'700',paddingHorizontal:20}}>Search Seller by BuisnessName/BuisnessType/City</MonoText>
          </View>
      }


      {  this.state.storeList.length > 0 &&this.state.search&&!this.state.loader&&
      <View>
        <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:20,backgroundColor:'#fff',marginBottom:60,}}
          data={this.state.storeList}
          keyExtractor={(item,index) => {
            return index.toString();
          }}
          extraData={this.state}
          renderItem={({item, index, separators}) => {
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

          )}}
        />
      </View>
      }
      { this.state.storeList.length == 0 && !this.state.loader &&this.state.search&&
        <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:3*Constants.statusBarHeight }}>
          <MonoText   style={{fontSize:16,alignSelf:'center',marginTop:20,fontWeight:'700'}}>Seller does not Exist</MonoText>
        </View>
      }

       </View>
      </ScrollView>
      {!this.state.keyboardOpen&&
      <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

      {storeType=='MULTI-OUTLET' &&
        <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

        <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.props.navigation.navigate('HomeScreen')}>
        <View style={styles.account}>

        <Image source={require('../assets/images/icon1.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
        <MonoText   style={{color:this.state.store.themeColor}}>Home</MonoText>
        </View>
        <TouchableOpacity style={{flex:1,paddingHorizontal:10}} onPress={() => this.props.navigation.navigate('ReferEarn')}>
          <View style={styles.account}>
          <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
          <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
          </View>
        </TouchableOpacity> 
        </TouchableOpacity>
          <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',}} onPress={this.checkout}>
            <View style={[styles.account,{height:'100%',width:'100%'}]}>

              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
              <View style={[styles.cartItemNo]}>
              <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
              color:this.state.store.themeColor,}]}>
              <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:14),fontWeight:'700',}}>{counter}</MonoText>
              </View>
              </View>
              <MonoText   style={{color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
            </View>
          </TouchableOpacity>
          </View>

          <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
              <MonoText   style={{color:this.state.store.themeColor , fontSize : 14,}}>Categories</MonoText>
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
            <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:14),fontWeight:'700',}}>{counter}</MonoText>
            </View>
            </View>
            <MonoText   style={{color:this.state.store.themeColor ,fontSize : 13, }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
          </View>
        </TouchableOpacity>
        </View>

        <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoCategories()}>
          <View style={[styles.account,{height:'100%'}]}>
            <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={20} color={this.state.store.themeColor} /> </MonoText>
            <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
          </View>
        </TouchableOpacity>
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
        </TouchableOpacity>}
      </View>
     }

      </View>
    }

      </View>

    );

  }
}
const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    totalAmount: state.cartItems.totalAmount,
    cart : state.cartItems.cartItem,
    store : state.cartItems.store,
    myStore:state.cartItems.myStore,
    selectedStore:state.cartItems.selectedStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args))

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreSearch);

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

})
