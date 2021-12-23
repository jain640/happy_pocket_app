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
import { FontAwesome ,SimpleLineIcons} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import GridLayout from 'react-native-layout-grid';

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

class ChatListScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Chats',

      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
         <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);
    this.state = {
      chatList : [],
      store:this.props.store,
      myStore:props.myStore,
      moderator:false
    }

    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
          this.getChatList()
         }
    );

  }
  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

  }

  getChatList=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    if(csrf!=null&&this.state.myStore.pk!=undefined){
    fetch(SERVER_URL + '/api/HR/mychatuser/?store='+this.state.myStore.pk,{
      headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL+'/api/HR/mychatuser/?store='+this.state.myStore.pk,
      'X-CSRFToken': csrf
    }
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ chatList: responseJson,moderator:true })
      })
      .catch((error) => {
        return
      });
    }else{
      fetch(SERVER_URL + '/api/HR/myChatStores/',{
        headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/HR/myChatStores/',
        'X-CSRFToken': csrf
      }
      })
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ chatList: responseJson,moderator:false })
        })
        .catch((error) => {
          return
        });
    }
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

  search = () => {
    this.props.navigation.navigate('SearchBar', {
      color: this.props.navigation.getParam('color','#000')
    })
  }

  render() {




     return (
       <View style={[styles.container]}>
       <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
       <FlatList
       data={this.state.chatList}
       extraData={this.state}
       keyExtractor={(item, index) => {
         return index.toString();
       }}
       renderItem={({item, index}) => (
         <View>
         {this.state.moderator&&
           <ChatCard chat ={item}  store={this.state.store} myStore={this.state.myStore} navigation={this.props.navigation}></ChatCard>
         }
         {!this.state.moderator&&
           <ChatUserCard chat ={item}  store={this.state.store}  navigation={this.props.navigation}></ChatUserCard>
         }
          </View>
       )}
       />
       </View>
     );
   }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },




  });


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

  export default connect(mapStateToProps, mapDispatchToProps)(ChatListScreen);
