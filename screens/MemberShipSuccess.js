
import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';
import { FontAwesome ,MaterialIcons} from '@expo/vector-icons';
const { width } = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast';
const SERVER_URL = settings.url
import { Card } from 'react-native-elements';
import { StackActions, NavigationActions } from 'react-navigation';
import { MonoText } from '../components/StyledText';

import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'


class MemberShipSuccess extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      header:null
    }
  };
  constructor(props){
    super(props);
    this.state = {
      params:null,
      store:props.store,
      data:null
    }
  }

  handleBackButtonClick=()=> {
    this.props.navigation.navigate('MemberShip')
    return true
  };

  componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  getDetails=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');


    if(csrf!=null){
    fetch(SERVER_URL + '/api/POS/getMembershipDetails/?id='+1,{
      method:'GET',
      headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL + '/api/POS/getMembershipDetails/?id='+1,
      'X-CSRFToken': csrf
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson!=undefined){
          console.log(responseJson);
          this.setState({data:responseJson})
        }
        return
      })
      .catch((error) => {
        return
      });
  }
}

  componentDidMount(){
    this.getDetails()
  }

  render(){
    var themeColor = this.props.store.themeColor
    return (
     <View style={{flex:1}}>
      <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}></View>
      <View style={{height:55,marginLeft:15,justifyContent:'center'}}>
        <TouchableOpacity onPress={()=>{this.handleBackButtonClick()}} style={[{height:40,width:40,borderRadius:20,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}]} >
          <MaterialIcons name={"arrow-back"} size={30} color={themeColor} />
        </TouchableOpacity>
      </View>
      {this.state.data!=null&&
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Card containerStyle={[styles.shadow,{ width: width*0.8,margin:0,padding:0,height:width*1.1,borderRadius:20,}]}>
            <View style={[styles.shadow,{position: 'absolute',top:-(width*0.1),left:width*0.3,width:width*0.2,height:width*0.2,borderRadius:width*0.1,backgroundColor:'#fff'}]}>
               <View style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                 <FontAwesome name={'star'} size={20} color={themeColor}/>
                 <FontAwesome name={'star'} size={20} color={themeColor}/>
                 <FontAwesome name={'star'} size={20} color={themeColor}/>
               </View>
            </View>
            <View style={{height:'100%',}}>
              <View style={{position: 'absolute',top:0,left:0,right:0,bottom:0,}}>
                  <Image source={require('../assets/images/homepage_membership.png')} style={{ width: '100%', height:'100%',borderRadius: 15,opacity:0.8,zIndex: 1}} />
              </View>
              <View style={{flex:0.3,alignItems:'center',justifyContent:'center',marginHorizontal:10,zIndex:999}}>
                <MonoText   style={{color:themeColor,fontSize:22,fontWeight:'700'}}>Welcome To Our Family!</MonoText> 
              </View>
              <View style={{flex:0.6,alignItems:'center',justifyContent:'center',marginHorizontal:10}}>
                <MonoText   style={{color:themeColor,fontSize:18,fontWeight:'700'}}>Membership Details</MonoText> 
                <MonoText   style={{color:'#000',fontSize:18,}}>{this.state.data.title}</MonoText> 
                <MonoText   style={{color:'#000',fontSize:22,fontWeight:'700'}}>&#8377;{this.state.data.planFee}</MonoText> 
                <MonoText   style={{color:themeColor,fontSize:16,}}>{this.state.data.validity} Days</MonoText> 
                <MonoText   style={{color:themeColor,fontSize:16,marginTop:5}}>{this.state.data.deliveryCharge} Delivery Charge</MonoText> 
                <MonoText   style={{color:themeColor,fontSize:16,marginTop:5}}>{this.state.data.noofDeliveryinamonth} Deliveries/month</MonoText> 
                <MonoText   style={{color:themeColor,fontSize:16,marginTop:5}}>From <MonoText   style={{fontWeight:'700'}}>{this.state.data.fromDate}</MonoText> </MonoText> 
                <MonoText   style={{color:themeColor,fontSize:16,marginTop:5}}>To <MonoText   style={{fontWeight:'700'}}>{this.state.data.toDate}</MonoText> </MonoText> 
              </View>
              <View style={{flex:0.1,}}>
                <TouchableOpacity onPress={()=>{this.handleBackButtonClick()}} style={{flex:1,zIndex:999,height:'100%',width:'100%',alignItems:'center',justifyContent:'center',backgroundColor:themeColor,borderBottomLeftRadius:20,borderBottomRightRadius:20,borderWidth:1,borderColor:themeColor}}>
                  <MonoText   style={{color:'#fff',fontSize:18,}}>Go Back</MonoText> 
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

      }
      </View>
    )
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },

});


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    selectedAddress : state.cartItems.selectedAddress,
    store:state.cartItems.store,
    selectedLandmark:state.cartItems.selectedLandmark,
    selectedStore:state.cartItems.selectedStore,
    masterStore:state.cartItems.masterStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address))

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberShipSuccess);
