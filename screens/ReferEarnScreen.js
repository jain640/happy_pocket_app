import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,TouchableNativeFeedback, 
  View,
  Slider,
  Dimensions,
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator,KeyboardAvoidingView, Share
} from 'react-native';
import { FontAwesome,SimpleLineIcons ,Feather,MaterialIcons} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import FloatingInput from '../components/FloatingInput';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo';
import settings from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { Fumi } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import ModalBox from 'react-native-modalbox';


const storeType = settings.storeType
const shareMessage = settings.shareMessage

const playStoreUrl = settings.playStoreUrl
const appStoreUrl = settings.appStoreUrl

class ReferEarnScreen extends React.Component {
  _isMounted = false;

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title:  'Refer & Earn',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
        justifyContent:'center'
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
      user:{},
      firstName:'',
      lastName:'',
      mobile:'',
      email:'',
      confirm :'',
      password:'',
      csrf:'',
      sessionid:'',
      store:this.props.store,
      displayPicture:null,
      attachOpen:false,
      cartItems : this.props.cart,
      userScreen:this.props.navigation.getParam('screen', 'LogInScreen'),
      offset:24,
      loader:false,
      imageAdd:false,
      selectedStore:props.selectedStore,
      selectedLandmark:props.selectedLandmark,
      storeType:this.props.storeType,
    }
    willFocus = props.navigation.addListener(
      'willFocus',
      payload => {
            this.getUserAsync()
      }
    );

  }

  onShare = async () => {
    // const playStoreUrl = 'https://play.google.com/store/apps/details?id='+'in.cioc.happypockets'+'&hl=en';
    // const appStoreUrl = 'https://itunes.apple.com/91lookup?bundleId=in.cioc.happypockets';
    try {
      const result = await Share.share({
        message: shareMessage+'\n\nFor Android device: '+playStoreUrl+'\n\nFor IOS device: '+appStoreUrl,
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

  getUserAsync = async () => {
    this.setState({loader:true})

    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userToken:userToken,sessionid:sessionid,csrf:csrf})
    if(userToken == null){
    this.setState({loader:false})
    return
    }
    fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
    headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
    }
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      AsyncStorage.setItem('first_name',JSON.stringify(responseJson.first_name))
      AsyncStorage.setItem('last_name',JSON.stringify(responseJson.last_name))
      AsyncStorage.setItem('user_name',JSON.stringify(responseJson.username))
      this.setState({firstName:responseJson.first_name,lastName:responseJson.last_name,displayPicture:{uri:responseJson.profile.displayPicture},email:responseJson.email})
      this.setState({loader:false})
    })
    .catch((error) => {
      this.setState({loader:false})
      return
    });
  }

  componentDidMount(){
    this._isMounted = true;
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor
    });
    this.getUserAsync()
  }
  
  componentWillUnmount() {
    this._isMounted = false;
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


    
  return (
    <View style={{flex:1,height:'100%'}}>
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <ScrollView style={{flex:1, height:'100%'}}>
      {this.state.loader&&
        <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:15}}>
          <ActivityIndicator size="large" color={this.state.store.themeColor} />
        </View>
      }
      {!this.state.loader&&
        <View >
          <ScrollView style={{height:'100%', paddingBottom:35, backgroundColor:'#f8f8f8'}}>
            <View style={{justifyContent:'center', alignItems:'center'}}>
              {/*<MonoText style={{fontSize:17, fontWeight:'700', paddingBottom:2, paddingHorizontal:5, paddingVertical:7}}>
                  Refer and Earn up to ₹ 300*
              </MonoText>
              <MonoText style={{fontSize:15, fontWeight:'400', marginBottom:15}}>
                Your friends are our frieds too
              </MonoText>*/}

              <Image source={require('../assets/images/img.jpg')} style={{width:291, height:170}}>                  
              </Image>

              <MonoText style={{color:'#989898', fontSize:14, marginTop:22}}>Referral Coupon Code</MonoText>
              <View style={{width:226, borderStyle:'dashed', borderWidth:1, borderRadius:4, borderColor:'#8d8e83', padding: 5, backgroundColor:'#fff', marginTop:8, alignItems:'center', justifyContent:'center'}}>
                <MonoText style={{fontWeight: '700', fontSize:17,}}>REF8843809374A85</MonoText>
              </View>
              <MonoText style={{color:'#989898', fontSize:14, marginTop:22}}>Share the link with your friends</MonoText>
              
              <View style={{width:'100%', padding: 5, marginTop:8, alignItems:'center', justifyContent:'center', flex:1, flexDirection:'row', flexWrap:'wrap'}}>
                {Platform.OS === 'android' &&
                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.onShare()}}>
                      <View style={{flexDirection: 'row', paddingVertical:5, paddingHorizontal: 15, backgroundColor:'#53b725', borderStyle:'solid', borderWidth:1, borderRadius:4, borderColor:'#53b725', width: 150}}>
                          <View style={{flex:0.30,justifyContent: 'center',alignItems: 'center',}}>
                              <Image source={require('../assets/images/whatsapp.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
                          </View>
                          <View style={{flex:0.60,justifyContent: 'center',alignItems: 'flex-start'}}>
                              <MonoText   style={{color:'#fff',
                                            fontWeight:'500', }} >Whatsapp</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&
                  <TouchableOpacity   onPress={()=>{this.onShare()}}>
                      <View style={{flexDirection: 'row', paddingVertical:5, paddingHorizontal: 15, backgroundColor:'#53b725', borderStyle:'solid', borderWidth:1, borderRadius:4, borderColor:'#53b725', width: 150}}>
                          <View style={{flex:0.30,justifyContent: 'center',alignItems: 'center',}}>
                            <Image source={require('../assets/images/whatsapp.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
                          </View>
                          <View style={{flex:0.60,justifyContent: 'center',alignItems: 'flex-start'}}>
                              <MonoText   style={{color:'#fff',
                                            fontWeight:'500'}} >Whatsapp</MonoText>
                          </View>
                      </View>
                  </TouchableOpacity>
                }
                

                {Platform.OS === 'android' &&
                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.onShare()}}>
                      <View style={{flexDirection: 'row', marginLeft:10, paddingVertical:5, paddingHorizontal: 15, backgroundColor:'#f8f8f8', borderStyle:'solid', borderWidth:1, borderRadius:4, borderColor:'#8d8e83', width: 100}}>
                          <View style={{flex:0.40,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome color={themeColor}
                                          name="share-alt"
                                          size={23}/>
                          </View>
                          <View style={{flex:0.60,justifyContent: 'center',alignItems: 'flex-start'}}>
                              <MonoText   style={{color:themeColor,
                                            fontWeight:'500'}} >More</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&
                  <TouchableOpacity   onPress={()=>{this.onShare()}}>
                      <View style={{flexDirection: 'row', paddingVertical:5, paddingHorizontal: 15, backgroundColor:'#f8f8f8', borderStyle:'solid', borderWidth:1, borderRadius:4, borderColor:'#8d8e83', width: 100}}>
                          <View style={{flex:0.40,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome color={themeColor}
                                          name="share-alt"
                                          size={23}/>
                          </View>
                          <View style={{flex:0.60,justifyContent: 'center',alignItems: 'flex-start'}}>
                              <MonoText   style={{color:themeColor,
                                            fontWeight:'500'}} >More</MonoText>
                          </View>
                      </View>
                  </TouchableOpacity>
                }
              </View>

              <View style={[styles.referbottomcontainer]}>
                <MonoText style={[styles.referbottomheader]}>How it Works</MonoText>
                <View style={{flex:1, width:'100%', marginTop:20, marginBottom:10, paddingBottom:10, borderBottomWidth:1, borderStyle:'solid', borderColor:'#e7e7e7', justifyContent:'center', alignItems:'center', flexDirection:'row', flexWrap:'wrap'}}>
                  <View style={{width:'49%', alignItems:'center'}}>
                    <MonoText style={{color: '#989898', fontSize: 14, fontWeight:'700'}}>Your friend gets</MonoText>
                    <MonoText style={{color: '#2c3ad2', fontSize: 17, fontWeight:'700'}}>₹ 50</MonoText>
                    <MonoText style={{color: '#989898', fontSize: 14, fontWeight:'700'}}>off on 1st order</MonoText>
                  </View>
                  <View style={{width:'49%', alignItems:'center', borderLeftWidth:1, borderStyle:'dashed'}}>
                    <MonoText style={{color: '#989898', fontSize: 14, fontWeight:'700'}}>Your friend gets</MonoText>
                    <MonoText style={{color: '#2c3ad2', fontSize: 17, fontWeight:'700'}}>₹ 50</MonoText>
                    <MonoText style={{color: '#989898', fontSize: 14, fontWeight:'700'}}>worth MK Cash</MonoText>
                  </View>
                </View>
                <View style={{color: '#989898', fontSize:14, paddingHorizontal:20 }}>
                  <MonoText style={{color: '#989898', fontSize:14, paddingBottom:10}}>
                    • Use referral code as a coupon. Applicable only on 1st order (min value ₹ 300)
                  </MonoText>
                  <MonoText style={{color: '#989898', fontSize:14}}>
                    • You will get back ₹ 50 worth MK Cash within 2 days after your friend's order is delivered.
                  </MonoText>
                </View>
              </View>

            </View>
            <View style={[styles.container,{paddingHorizontal:15,paddingVertical:15}]} >
                
            </View>
          </ScrollView>
        </View>
      }
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
    selectedLandmark:state.cartItems.selectedLandmark,
    myStore:state.cartItems.myStore,
    storeType:state.cartItems.storeType,
    selectedStore:state.cartItems.selectedStore,

  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reOrderFunction:  (args) => dispatch(actions.reOrderAction(args)),
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReferEarnScreen);

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
    flex: 1,
    height: width*0.5,
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
  },
  referbottomcontainer:{
    width:'95%',
    borderWidth: 1,
    borderStyle:'solid',
    borderColor:'#818181',
    borderRadius:7,
    margin:'auto',
    marginTop:20,
    marginBottom:10,
  },
  referbottomheader:{
    position:'absolute',
    fontSize:15,
    fontWeight:'600',
    backgroundColor:'#f8f8f8',
    top: -16,
    left: '50%',
    marginLeft: -78,
    paddingVertical:5,
    paddingHorizontal:30,
    color:'#505050', 
    fontWeight:'700',
  }

});

