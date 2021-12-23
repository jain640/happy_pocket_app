import * as React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform, Image,AsyncStorage,Alert,ScrollView ,Clipboard,ToastAndroid,Dimensions,FlatList,BackHandler,TextInput,KeyboardAvoidingView,Keyboard,WebView} from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Icon } from "react-native-elements";
import { withNavigation } from 'react-navigation';
import { Card } from 'react-native-elements';
import { Octicons ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import settings  from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from '../components/StyledText';


const serverURL = settings.url;

const deviceId = Constants.deviceId ;
const { width } = Dimensions.get('window');





class CatalogScreen extends React.Component {

  static navigationOptions =  {
        header:null
    }


    constructor(props) {
      super(props);

      this.state = {
        email:'',
        store:props.store,
        myStore:props.myStore,
      };
    }

    handleBackButtonClick=()=> {
      this.props.navigation.goBack();
      return true;
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }







start=(navState)=>{
  console.log(navState,'lll');
  this.setState({url: navState.nativeEvent.url})
}



  render(){
    var themeColor = this.props.store.themeColor
    var csrf = this.props.navigation.getParam('csrf',null)
    var sessionid = this.props.navigation.getParam('sessionid',null)
    var headers = {
      "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': serverURL,
      'X-CSRFToken': csrf
    }
    return(
      <View style={{flex:1,backgroundColor: '#f8fafb',marginBottom:this.state.keyboardOpen?this.state.keyboardHeight:0,}}>
      <View style={[styles.statusBar,{backgroundColor: themeColor,}]} />
      <WebView
      onLoadStart={(navState) =>{this.start(navState)}}
      useWebKit={true}
      thirdPartyCookiesEnabled={true}
      source={{uri:serverURL+'/api/POS/downloadbrochure/?store='+this.state.myStore.pk,headers:headers}}
      startInLoadingState
      scalesPageToFit
      originWhitelist={['*']}
      allowFileAccess={true}
      javaScriptEnabled
      style={{ flex: 1,width:width*1, }}
      />
      </View>
     )
  }




}


const styles = StyleSheet.create({
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
  statusBar: {

   height: Constants.statusBarHeight,
 },



})

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    myStore:state.cartItems.myStore,
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


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CatalogScreen);
