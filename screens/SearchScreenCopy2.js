import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,Text,Keyboard,ToastAndroid,Dimensions,Image,AppState,BackHandler,AsyncStorage,Platform,ActivityIndicator,Button,ScrollView} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
// import { SearchBar } from 'react-native-elements';
import { FontAwesome,MaterialIcons,Entypo } from '@expo/vector-icons';
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

class SearchScreenCopy2 extends React.Component {
  static navigationOptions = {
    header:null,
  }

  constructor(props) {
  super(props);
  this.state = {
    firstQuery:'',
    products:[],
    cartItems : props.cart,
    loading:false,
    totalProducts:[],
    loader:true,
    limit:20,
    offset:0,
    count:0,
    genericProductList:[],
    search:false,
    searchProducts:[],
    store:props.store,
    selectedStore:props.selectedStore,
    myStore:props.myStore,
    keyboardOffset: 0,
    keyboardOpen : false,
    initial:true,
    promises:[]
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
        this.setCartItems()
       }
  );
}

keyboardDidShow=(event)=> {
      this.setState({
          keyboardOffset: event.endCoordinates.height+27,keyboardOpen:true
      })
  }

  keyboardDidHide=()=> {
      this.setState({
          keyboardOffset: 27,keyboardOpen:false
      })
 }
setCartItems=()=>{
  this.setState({cartItems: this.props.cart});
}

  getProductList = async ()=>{
   this.textInput.focus()
    var offset = Number(this.state.offset)+1
    await fetch(SERVER_URL + '/api/POS/searchProduct/?search=&limit=100&store='+this.state.selectedStore.pk)
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
        var products = responseJson.filter((item)=>{
          if(item.typ == 'product' ){
            return item
          }
        })
        var items = this.state.products
        products.forEach((item)=>{
          items.push(item)
        })
        this.setState({ products: items,totalProducts:items,loader:false,offset:this.state.offset+20,limit:this.state.limit+20 })

      })
      .catch(() => {
        this.setState({ loader:false})
        this.textInput.focus()
        return
      });
  }

  getGenericProductList = async ()=>{

    fetch(SERVER_URL + '/api/POS/categorysortlist/?store='+this.state.store.pk)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ loader:false})
          this.textInput.focus()
        var subChildArr = []
        responseJson.forEach((i,idx)=>{
          if(i.child.length>0){
           i.child.forEach((child)=>{
             subChildArr.push(child)
            if(child.subChild.length>0){
              child.subChild.forEach((subchild)=>{
              subChildArr.push(subchild)
              })
            }
            })
          }
        })
        this.setState({ genericProductList: subChildArr })
      })
      .catch(() => {
        this.setState({ loader:false})
        this.textInput.focus()
        return
      });
  }

  requestAsync=(query)=>{


    return new Promise(resolve => {
      fetch(SERVER_URL + '/api/POS/searchProduct/?store='+this.state.selectedStore.pk+'&search='+query+'&limit=10')
       .then((response) => {
         resolve(response);
         return response.json()})
       .then((responseJson) => {
         if(responseJson!=undefined){
         // this.setState({ searchProducts: responseJson,loading: false ,loader:false,search:true,initial:false})
         this.setState({ searchProducts: responseJson})
       }
       })
       .catch(() => {
         reject(response);
         // this.setState({ loading: false,loader:false,searchProducts: [] });
       });
    });
   }

  serchProduct(query){
     // var promises = []
     // this.setState({promises:promises})
    // onSubmitEditing={()=>{this.serchProduct(this.state.firstQuery)}}
    // this.setState({firstQuery:query})

    if(query.length <=0){
      this.setState({ search: false, })
      return
    }
    // promises.push(query)
    this.setState({loader:true})
    // promises.map((i)=>{
      // promises.push(this.requestAsync(query));
      // this.setState({promises:promises})
    // })

    //
    // Promise.all(promises).then(() => {
    //     this.setState({loading: false ,loader:false,search:true,initial:false})
    //    })

     fetch(SERVER_URL + '/api/POS/searchProduct/?store='+this.state.selectedStore.pk+'&search='+query+'&limit=10')
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
        if(responseJson!=undefined){
        this.setState({ searchProducts: responseJson,loading: false ,loader:false,search:true,initial:false})
      }
      })
      .catch(() => {
        this.setState({ loading: false,loader:false,searchProducts: [] });
      });
  }

  reloadCart = async () => {
    try {
      const value = await AsyncStorage.getItem('cart');
      if (value !== null) {
        this.setState({cartItems : JSON.parse(value)})
      }
      this.textInput.focus()
    }catch{
       return
    }
  };

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


 // componentWillReceiveProps(nextProps){
 //      this.setState({cartItems: nextProps.cart});
 //  }

  componentDidUpdate(prevProps){
        // AsyncStorage.setItem('cart', JSON.stringify(this.state.cartItems));
        if(prevProps.cart !== this.props.cart) {
          this.setState({cartItems: this.props.cart});
        }
  }

  componentDidMount() {
    // this.getProductList()
    this.getGenericProductList()
    this.userAsync()

    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
        }
       if(state === 'background'){
       }
     })


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

  gotoCategories = ()=>{
    this.props.navigation.navigate('CategoriesScreen', {
      color: themeColor
    })
  }

  gotoCategory=(item)=>{
    if(item.parent == null){
      var child = []
      for (var i = 0; i < this.state.genericProductList.length; i++){
        if(this.state.genericProductList[i].parent != null){
          if(this.state.genericProductList[i].parent.pk == item.pk){
            child.push(this.state.genericProductList[i].pk)
          }
        }
      }
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

     var {counter} = this.props
    counter = counter.toString()

     var totalCount = 0;
     // totalValue = 0;
     //
     // for (var i = 0; i < this.state.cartItems.length; i++) {
     //   totalValue += Math.round(this.state.cartItems[i].discountedPrice*this.state.cartItems[i].count);
     //   totalCount += this.state.cartItems[i].count;
     // }
     totalValue = 0;

       for (var i = 0; i < this.state.cartItems.length; i++) {
         totalValue += Math.round(this.state.cartItems[i].totalPrice);
         totalCount += this.state.cartItems[i].count;
       }

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
      <View style={{backgroundColor:themeColor,paddingTop:Constants.statusBarHeight,paddingBottom:0, height:Platform.OS=='android'?3*Constants.statusBarHeight:2.5*Constants.statusBarHeight}}>
      <Searchbar
        ref={input => { this.textInput = input }}
        showLoading
        style= {{height:Platform.OS=='android'?2*Constants.statusBarHeight:1.5*Constants.statusBarHeight,borderRadius:0}}
        icon={()=><MaterialIcons name="arrow-back" size={30}/>}
        placeholder='Search'
        onIconPress ={()=>{
          this.props.navigation.goBack()}}
        onChangeText={query =>{this.setState({firstQuery:query})}}
        onSubmitEditing={()=>{this.serchProduct(this.state.firstQuery)}}
        onCancel={() => {this.setState({search:false});}}
        value={firstQuery}
      />
      </View>
      {this.state.genericProductList.length>0&&
      <View style={{borderColor:'#f2f2f2',borderBottomWidth:1,}}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
      <View style={{flexDirection:'row',marginVertical:13}}>
      {<FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginVertical: 0, paddingLeft: 10,marginBottom:0,paddingBottom:0}}
      data={this.state.genericProductList}
      keyExtractor={(item,index) => {
        return index.toString();
      }}
      extraData={this.state.genericProductList}
      horizontal={true}
      nestedScrollEnabled={true}
      renderItem={({item, index}) => (
        <TouchableOpacity onPress={()=>this.gotoCategory(item)} style={{padding: 5}}>
        <MonoText   style={{borderColor:'#d2d2d2',borderWidth:1, padding:10,borderRadius:10}}>{entities.decode(item.name)}</MonoText>
        </TouchableOpacity>
      )}
      />}
      </View>
      </ScrollView>
      </View>
    }
      <ScrollView style={{marginTop:0}}>
      <View>
      {this.state.loader == true&&
          <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:3*Constants.statusBarHeight }}>
          <ActivityIndicator size="large" color={themeColor} />
          </View>
      }


      { this.state.loader == false  &&
      <View>
      {this.state.search == true  &&
        <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:0,backgroundColor:'#fff',marginBottom:60,}}
          data={this.state.searchProducts}
          keyExtractor={(item,index) => {
            return index.toString();
          }}
          extraData={this.state}
          renderItem={({item, index, separators}) => (
            <View>
            {item.typ == 'product'&&
            <SearchCard product={item} color={color} navigation={this.props.navigation} cartItems={this.state.cartItems} store={this.state.store} selectedStore={this.state.selectedStore} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)}  onChange={ (args)=> this.updateCart(args)} gotoDetails={(pk)=>this.details(pk)}  />
            }
            {item.typ == 'generic'&&
            <SearchCategoryCard product={item} color={color} store={this.state.store}  />
            }
            </View>
          )}
        />
      }
      {this.state.search == false  &&
      <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:0,backgroundColor:'#fff',marginBottom:60,}}
        data={this.state.products}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        extraData={this.state}
        renderItem={({item, index, separators}) => (
          <View>
          {item.typ == 'product'&&
          <SearchCard product={item} navigation={this.props.navigation} color={color} cartItems={this.state.cartItems} store={this.state.store} selectedStore={this.state.selectedStore} setCounterAmount={(counter,totalAmount,saved)=>this.props.setCounterAmount(counter,totalAmount,saved)}  onChange={ (args)=> this.updateCart(args)} gotoDetails={(pk)=>this.details(pk)} />
          }
          {item.typ == 'generic'&&
          <SearchCategoryCard product={item} color={color}  store={this.state.store} />
          }
          </View>
        )}
      />
    }

      </View>

      }
      { this.state.searchProducts.length == 0 && !this.state.loader &&!this.state.initial&&
        <View>
        <MonoText   style={{fontSize:16,alignSelf:'center',marginTop:20,fontWeight:'700'}}>Product does not Exist</MonoText>
        </View>
      }
      { this.state.searchProducts.length == 0 && !this.state.loader &&this.state.initial&&
        <View>
        <MonoText   style={{fontSize:16,alignSelf:'center',marginTop:20,fontWeight:'700'}}>Search Products</MonoText>
        </View>
      }
      {/* this.state.firstQuery.length == 0 && !this.state.loader &&!this.state.initial&&
        <View>
        <MonoText   style={{fontSize:16,alignSelf:'center',marginTop:20,fontWeight:'700'}}>Search Products</MonoText>
        </View>
      */}

       </View>
      </ScrollView>
      {!this.state.keyboardOpen&&

        <View >

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
            <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
            </View>
            </View>
            <MonoText   style={{color:this.state.store.themeColor ,fontSize : 13, }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
          </View>
        </TouchableOpacity>
        </View>


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
    cart : state.cartItems.cartItem,
    store : state.cartItems.store,
    myStore:state.cartItems.myStore,
    selectedStore:state.cartItems.selectedStore,
    totalAmount: state.cartItems.totalAmount,
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreenCopy2);

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
  position:'absolute',
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

// <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoCategories()}>
//   <View style={[styles.account,{height:'100%'}]}>
//     <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={20} color={this.state.store.themeColor} /> </MonoText>
//     <MonoText   style={{color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
//   </View>
// </TouchableOpacity>
