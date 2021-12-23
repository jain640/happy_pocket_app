
import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , } from 'react-native';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
import WebView from 'react-native-webview';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
const SERVER_URL = settings.url


import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'



class PaymentScreen extends React.Component {
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
      store:props.store
    }

  }
  handleBackButtonClick() {
    Alert.alert(
      'Payment Page Alert',
      'Do you want to cancel the order?',
      [
        {
          text: 'Yes',
          onPress: () => console.log('Yes Pressed'),
          style: 'cancel',
        },
        {text: 'No', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  };

  // componentWillMount() {
  //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  // }
  //
  // componentWillUnmount() {
  //     BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  // }


  onNavigationStateChange = navState => {
    console.log(navState.url,'kkkkkkkkkk');
  let odnumber = this.props.navigation.getParam('odnumber',null)
  // if(odnumber!=null){
  //   // this.props.emptyCartFunction()
  // }
  this.setState({params:this.props.navigation});
  let url = SERVER_URL+'/orderSuccessful/?orderid='+odnumber

   if (navState.url.includes('/orderFailure')){
    this.props.navigation.state.params.paymentBack({
      orderId:odnumber,
      type:'Payment Failed!',
      errorname:'Payment was not successful..'
    })
    this.props.navigation.goBack()
   }
   if (navState.url.includes('orderSuccessful')) {
    this.props.navigation.navigate('OrderSuceesScreen',{
      orderId:odnumber
    })
   }
 };

  render(){
    let url = this.props.navigation.getParam('url','')
    return (
     <View style={{flex:1}}>
      <View style={{height:Constants.statusBarHeight,backgroundColor:this.props.store.themeColor}}></View>
      <View style={{flex:1,}}>

      <WebView
      source={{uri: url}}
      onNavigationStateChange={this.onNavigationStateChange}
      startInLoadingState

      javaScriptEnabled
      style={{ flex: 1,width:width*1, }}
      useWebKit={true}
      />
      </View>
      </View>
    )
  }


}


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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
