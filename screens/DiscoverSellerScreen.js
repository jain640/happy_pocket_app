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
  TextInput, FlatList,ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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

const chatView = settings.chat

class DiscoverSellerScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Discover Business',

      headerRight: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }}>
          <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => params.searchoption()}  >
          <MonoText><FontAwesome name="search" size={22} color="#fff" /> </MonoText>
           </TouchableOpacity  >

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
      storeList : [],
      store:this.props.store
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
       this.setState({connectionStatus : true})
       fetch(SERVER_URL + '/api/POS/store/?discover=true')
         .then((response) => response.json())
         .then((responseJson) => {
           if(responseJson!=undefined){
             this.setState({ storeList: responseJson })
           }
         })
         .catch((error) => {
           return
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

  search = () => {
    this.props.navigation.navigate('StoreSearch', {
      color: this.props.navigation.getParam('color','#000')
    })
  }

  render() {




     return (
       <View style={[styles.container,{width: width}]}>
       <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
       <FlatList
       data={this.state.storeList}
       keyExtractor={(item, index) => {
         return index.toString();
       }}
       renderItem={({item, index, separators}) => (
         <DiscoverSellerCard sellerStore ={item} navigation={this.props.navigation}></DiscoverSellerCard>
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
      store:state.cartItems.store
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

  export default connect(mapStateToProps, mapDispatchToProps)(DiscoverSellerScreen);
