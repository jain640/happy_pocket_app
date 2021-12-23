import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage,Platform,ActivityIndicator,Button,ScrollView} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';

import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import SearchCategoryCard from '../components/SearchCategory.js';
import ImageOverlay from "react-native-image-overlay";
import settings from '../constants/Settings.js';
import { withNavigationFocus } from 'react-navigation';
import { MonoText } from '../components/StyledText';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast';

class MyComponent extends React.Component {
  static navigationOptions = {
    header:null,
  }
  state = {
    firstQuery: '',
    products:[],
    cartItems : this.props.cart,
    loading:false,
    totalProducts:[],
    loader:true,
    limit:20,
    offset:0,
    count:0,
    genericProductList:[],
    store:this.props.store,
    selectedStore:this.props.selectedStore,

  };

  getProductList = async ()=>{

    var offset = Number(this.state.offset)+1
    await fetch(SERVER_URL + '/api/POS/searchProduct/?store='+this.state.selectedStore+'&search=&limit=100')
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
        var products = responseJson.filter((item)=>{
          if(item.typ == 'list' ){
            return item
          }
        })
        var items = this.state.products
        products.forEach((item)=>{
          items.push(item)
        })

        this.setState({ products: items,totalProducts:items,loader:false,offset:this.state.offset+20,limit:this.state.limit+20 })
        this.textInput.focus()

      })
      .catch((error) => {
        this.setState({ loader:false})
        this.textInput.focus()
        return
      });
  }

  getGenericProductList = async ()=>{

    // var offset = Number(this.state.offset)+1
    await fetch(SERVER_URL + '/api/ecommerce/genericProduct/')
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
          this.setState({genericProductList:responseJson})
        })
      .catch((error) => {
        this.setState({ loader:false})
        this.textInput.focus()
        return
      });
  }


  serchProduct(query){
    this.setState({firstQuery:query})
    if(query.length <1){
      this.setState({ products: this.state.totalProducts })
      return
    }
    fetch(SERVER_URL + '/api/POS/searchProduct/?search='+query+'&limit=10')
      .then((response) => {
        return response.json()})
      .then((responseJson) => {
        this.setState({ products: responseJson,loading: false ,loader:false})
      })
      .catch((error) => {
        this.setState({ loading: false });
      });
  }

  reloadCart = async () => {
    try {
      const value = await AsyncStorage.getItem('cart');
      if (value !== null) {
        this.setState({cartItems : JSON.parse(value)})
      }
      this.textInput.focus()
    } catch (error) {
       return
    }
  };

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
        AsyncStorage.setItem('cart', JSON.stringify(this.state.cartItems));
        if(prevProps.cart !== this.props.cart) {
          this.setState({cartItems: this.props.cart});

          // AsyncStorage.setItem('counter', this.props.counter);
        }
  }

  componentDidMount() {
    // this.reloadCart()
    this.getProductList()
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
    if (args.type == actionTypes.ADD_TO_CART){
        this.props.addTocartFunction(args);
    }
    if (args.type == actionTypes.INCREASE_CART){
        this.props.increaseCartFunction(args);
    }
    if (args.type == actionTypes.DECREASE_CART){
        this.props.decreaseFromCartFunction(args);
    }

  }

  gotoCategories = ()=>{
    this.props.navigation.navigate('CategoriesScreen', {
      color: themeColor
    })
  }
  gotoProfile = ()=>{
    this.props.navigation.navigate('ProfileScreen', {
      color: this.state.store.themeColor
    })
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



  render() {

    const { firstQuery } = this.state;
     const { navigation } = this.props;
     const color = navigation.getParam('color','#000')
     var themeColor = this.props.store.themeColor


     var totalCount = 0;
     totalValue = 0;

     for (var i = 0; i < this.state.cartItems.length; i++) {
       totalValue += this.state.cartItems[i].salePrice*this.state.cartItems[i].count;
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
      <View style={{backgroundColor:themeColor,paddingTop:Constants.statusBarHeight,paddingBottom:0, height:3*Constants.statusBarHeight}}>
      <Searchbar
        ref={input => { this.textInput = input }}
        showLoading
        data={this.state.products}
        style= {{height:2*Constants.statusBarHeight,borderRadius:0}}
        icon='arrow-back'
        placeholder='Search'
        onIconPress ={()=>{
          this.props.navigation.goBack()}}
        onChangeText={query =>{if(this.state.loading == false){
          this.serchProduct(query);
        }} }
        onCancel={() => {this.serchProduct("");}}
        value={firstQuery}
      />
      </View>

      <ScrollView style={{flex:0.8,marginTop:2}}>

      {this.state.loader == true&&
          <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:3*Constants.statusBarHeight }}>
          <ActivityIndicator size="large" color={themeColor} />
          </View>
      }


      { this.state.loader == false  &&
      <View>
      <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:0,backgroundColor:'#fff',marginBottom:60,}}
        data={this.state.products}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        extraData={this.state.products}
        renderItem={({item, index, separators}) => (
          <View>
          {item.typ == 'list'&&
          <SearchCard product={item} color={color} cartItems={this.state.cartItems}  onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} />
          }
          {item.typ == 'generic'&&
          <SearchCategoryCard product={item} color={color}   />
          }
          </View>
        )}
      />

      </View>

      }

      { this.state.products.length == 0 && this.state.firstQuery.length>2 &&
        <MonoText   style={{fontSize:16,alignSelf:'center',marginTop:20,fontWeight:'700'}}>Product does not Exist</MonoText> 
      }
      </ScrollView>
      <View style={[styles.footer, { flex:0.2, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  themeColor}]}>
      <TouchableOpacity style={{paddingHorizontal:10,marginLeft:20}} onPress={() => this.login()}>
      <View style={styles.account}>

      <MonoText   style={{color:'#fff' , }}> <FontAwesome name="user" size={25} color={themeColor} /> </MonoText> 
      <MonoText   style={{color:themeColor}}>Account</MonoText> 
      </View>
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
      <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',}} onPress={this.checkout}>
      <View style={[styles.account,{height:'100%'}]}>

      <MonoText   style={{color:'#fff' , }}> <FontAwesome name="shopping-cart" size={25} color={themeColor} /> </MonoText> 
      <MonoText   style={[styles.cartItemNo,{borderColor:themeColor,color:themeColor,}]}>{this.props.counter}</MonoText> 
      <MonoText   style={{color:themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {totalValue} </MonoText> 
      </View>
      </TouchableOpacity>
      </View>
      <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',marginRight:20}} onPress={() => this.gotoCategories()}>
      <View style={[styles.account,{height:'100%'}]}>
      <MonoText   style={{color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={themeColor} /> </MonoText> 
      <MonoText   style={{color:themeColor , fontSize : 14,}}> Categories </MonoText> 
      </View>
      </TouchableOpacity>
      </View>

      </View>

    );

  }
}
const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedStore:state.cartItems.selectedStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args))

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);

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
  width:20,
  height:20,
  backgroundColor:'#fff',
  borderWidth:1,
  borderRadius:10,
  // borderColor:themeColor,
  // color:themeColor,
  textAlign:'center',
  fontSize:14,
  fontWeight:'700',
  position:'absolute',
  right:-5,
  top:3
},

})
