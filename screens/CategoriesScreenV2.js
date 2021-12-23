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
  Dimensions,
  TextInput, FlatList,ActivityIndicator,AsyncStorage,TouchableNativeFeedback
} from 'react-native';
import { FontAwesome,SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import GridLayout from 'react-native-layout-grid';
import { Card } from 'react-native-elements';
import CategoryCardV2 from '../components/CategoryCardV2.js';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const storeType = settings.storeType
const chatView = settings.chat

class CategoriesScreenV2 extends React.Component {

  // static navigationOptions = ({ navigation }) => {
  //   const { params = {} } = navigation.state
  //   return {
  //     title: params.title,
  //     headerLeft: (
  //         <TouchableOpacity style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:0,paddingHorizontal:15,paddingVertical:6}} onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
  //       ),
  //     headerRight: (
  //       <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }}>
  //         <TouchableOpacity style={{ paddingHorizontal: 15,paddingVertical:6 }} onPress={() => params.searchoption()}  ><Text><FontAwesome name="search" size={22} color="#fff" /> </MonoText> </TouchableOpacity  >
  //       </View>
  //     ),
  //     headerStyle: {
  //       backgroundColor: params.themeColor,
  //     },
  //     headerTitleStyle: {
  //       flex: 1,
  //       marginRight:40,
  //       fontSize:18,
  //       textAlign:'center',
  //       alignSelf: 'center',
  //     },
  //     headerTintColor: '#fff',
  //   }
  // };
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title:  'Category',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerLeft: (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.navigate('HomeScreen')}}><MaterialIcons name={'arrow-back'} size={25} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerTintColor: '#fff',

  };
}

  constructor(props){
    super(props);
    this.state = {
      categories : false,
      store:this.props.store,
      cartItems:props.cart,
      loader:false
    }







  }
  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
      searchoption: this.search,
      title:this.state.store.company,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

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

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  componentWillUnmount=()=>{
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  openSubCategory = (item)=>{
    this.props.navigation.navigate('SubCategoryView', {
        subCategory : item,title: item.name
    })
  }

  search = () => {
    this.props.navigation.navigate('SearchBar', {
      color: this.props.navigation.getParam('color','#000')
    })
  }
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


    checkLogin = async()=>{
      var login = await  AsyncStorage.getItem('login');
      if(login == 'true'){
        this.props.navigation.navigate('GiftSection')
      }else{
        this.props.navigation.navigate('LogInScreen')
      }
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

    gotoNotification=async()=>{
      var login = await  AsyncStorage.getItem('login');
      if(login == 'true'){
        this.props.navigation.navigate('NotificationScreen')
      }else{
        this.props.navigation.navigate('LogInScreen')
      }
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
   var totalCount = 0

    totalValue = 0;

      for (var i = 0; i < this.state.cartItems.length; i++) {
        totalValue += Math.round(this.state.cartItems[i].totalPrice);
        totalCount += this.state.cartItems[i].count;
      }

      var {counter} = this.props
     counter = counter.toString()

     return (
       <View style={[styles.container,{width: width}]}>
       <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
       <View style={{height:Constants.statusBarHeight,backgroundColor:this.state.store.themeColor,}}></View>

       {this.renderHeader()}
       {this.state.loader&&
         <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <ActivityIndicator size="large" color={this.state.store.themeColor} />
         </View>
       }
       {!this.state.loader&&
         <View style={{flex:1}}>
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
       </View>
     }
       {storeType=='MULTI-OUTLET' &&
         <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

           <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.props.navigation.navigate('HomeScreen')}>
           <View style={styles.account}>

           <Image source={require('../assets/images/icon1.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
           <MonoText   style={{ color:this.state.store.themeColor}}>Home</MonoText>
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

               <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
               <View style={[styles.cartItemNo]}>
               <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
               color:this.state.store.themeColor,}]}>
               <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
               </View>
               </View>
               <MonoText   style={{ color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
             </View>
           </TouchableOpacity>
           </View>

           <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
             <View style={[styles.account,{height:'100%'}]}>
               <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
               <MonoText   style={{ color:this.state.store.themeColor , fontSize : 14,}}>Categories</MonoText>
             </View>
           </TouchableOpacity>
         </View>
     }
       {storeType!='MULTI-OUTLET'&&
         <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

         <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoHome()}>
           <View style={[styles.account,{height:'100%'}]}>
             <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="home" size={20} color={this.state.store.themeColor} /> </MonoText>
             <MonoText   style={{ color:this.state.store.themeColor , fontSize : 13,}}>Home</MonoText>
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

               <Text   style={{ color:'#fff' , }}> <FontAwesome name="shopping-cart" size={20} color={this.state.store.themeColor} /> </Text>
               <View style={[styles.cartItemNo]}>
               <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
               color:this.state.store.themeColor,}]}>
               <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
               </View>
               </View>
               <MonoText style={{ color:this.state.store.themeColor ,fontSize : 13, }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
             </View>
           </TouchableOpacity>
           </View>

           <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoCategories()}>
             <View style={[styles.account,{height:'100%'}]}>
               <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="th-large" size={20} color={this.state.store.themeColor} /> </MonoText>
               <MonoText   style={{ color:this.state.store.themeColor , fontSize : 13,}}>Categories</MonoText>
             </View>
           </TouchableOpacity>
           <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoDiscoverScreen()}>
             <View style={[styles.account,{height:'100%'}]}>
               <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="users" size={20} color={this.state.store.themeColor} /> </MonoText>
               <MonoText   style={{ color:this.state.store.themeColor , fontSize : 13,}}>Discover</MonoText>
             </View>
           </TouchableOpacity>
           {chatView&&<TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoChatScreen()}>
             <View style={[styles.account,{height:'100%'}]}>
               <MonoText   style={{ color:'#fff' , }}> <FontAwesome name="wechat" size={20} color={this.state.store.themeColor} /> </MonoText>
               <MonoText   style={{ color:this.state.store.themeColor , fontSize : 13,}}>Chat</MonoText>
             </View>
           </TouchableOpacity>}
         </View>
     }
       </View>
     );
   }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    modalView: {
       backgroundColor: '#fff',
       marginHorizontal: width-30 ,
       borderRadius:5,
       margin: 0
      },
    scrollContainer: {
      flex: 1,
      height: '35%',
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
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      totalAmount: state.cartItems.totalAmount,
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
      decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
      increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
      setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(CategoriesScreenV2);
