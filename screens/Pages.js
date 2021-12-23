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
  TextInput, FlatList,ActivityIndicator,AsyncStorage
} from 'react-native';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import GridLayout from 'react-native-layout-grid';
import HTMLView from 'react-native-htmlview';
import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import ChatCard from '../components/ChatCard.js';
import ChatUserCard from '../components/ChatUserCard.js';

class Pages extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title:params.title,

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);
     var url = props.navigation.getParam('url',null)
     var data = props.navigation.getParam('data',null)
     var title = null
     var body = null
     if(data!=null){
        title = data.title
        body = data.body
     }
    this.state = {
      store:this.props.store,
      myStore:props.myStore,
      title:title,
      body:body,
      data:data,
      url:url,
    }

    // willFocus = props.navigation.addListener(
    //  'didFocus',
    //    payload => {
    //       this.getChatList()
    //      }
    // );

  }

  getPage=()=>{
    fetch(SERVER_URL + '/api/POS/pagesvs/?pageurl__iexact='+this.state.url)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson,'pppp');
        if(responseJson.length>0){
          this.setState({ data: responseJson[0],title:responseJson[0].title,body:responseJson[0].body })
          this.props.navigation.setParams({
            themeColor:this.state.store.themeColor,
            title:responseJson[0].title
          });
        }
      })
      .catch((error) => {
        return
      });
  }

  componentDidMount() {
    console.log(this.state.title,this.state.url);
    if(this.state.url!=null){
      this.getPage()
    }else{
      console.log('fghh');
      this.props.navigation.setParams({
        themeColor:this.state.store.themeColor,
        title:this.state.title
      });
   }

    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

  }


  handleConnectivityChange=(state)=>{
    if(state.isConnected){
       this.setState({connectionStatus : true})
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



  render() {

     return (
       <View style={[styles.container]}>
         <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
         <View style={{flex:1}}>
           <ScrollView contentContainerStyle={{paddingBottom:30}}>
           {this.state.body!=null&&
             <View style={{marginHorizontal: 15,paddingVertical: 25,paddingTop:15}}>
              <HTMLView value = {"<div>"+this.state.body+"</div>"} stylesheet={styles} />
             </View>
           }
           </ScrollView>
        </View>
       </View>
     );
   }
  }


if(Platform.os==='android'){
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    p:{
    fontSize:18,
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
    span:{
    fontSize:16,
    fontFamily: 'OpenSans-Regular'

  },
  h1:{
    fontSize: 32,
    fontWeight: '600',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  h2:{
    fontSize: 24,
    fontWeight: '600',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  h3:{
    fontSize: 18,
    fontWeight: '500',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  h4:{
    fontSize: 16,
    fontWeight: '400',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  h5:{
    fontSize: 15,
    fontWeight: '300',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  h6:{
    fontSize: 14,
    fontWeight: '200',
    paddingVertical:10,
    fontFamily: 'OpenSans-Regular'

  },
  });
}

if(Platform.os==='ios'){
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    p:{
    fontSize:18,
    paddingVertical:10,


  },
    span:{
    fontSize:16,


  },
  h1:{
    fontSize: 32,
    fontWeight: '600',
    paddingVertical:10,


  },
  h2:{
    fontSize: 24,
    fontWeight: '600',
    paddingVertical:10,


  },
  h3:{
    fontSize: 18,
    fontWeight: '500',
    paddingVertical:10,


  },
  h4:{
    fontSize: 16,
    fontWeight: '400',
    paddingVertical:10,


  },
  h5:{
    fontSize: 15,
    fontWeight: '300',
    paddingVertical:10,


  },
  h6:{
    fontSize: 14,
    fontWeight: '200',
    paddingVertical:10,


  },
  });
}



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
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(Pages);
