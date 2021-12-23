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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,Picker,Keyboard,
} from 'react-native';
import { FontAwesome ,SimpleLineIcons} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import GridLayout from 'react-native-layout-grid';

import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import ChatCard from '../components/ChatCard.js';
import ChatUserCard from '../components/ChatUserCard.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import Loader from '../components/Loader'


const Entities = require('html-entities').XmlEntities;
const entities = new Entities();


class Policies extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Polices',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerLeft:(
        <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
            <TouchableOpacity onPress={()=>{navigation.openDrawer();}}>
              <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
            </TouchableOpacity>
        </View>
      ),
      headerTitleStyle: {
        flex:0.8,
        alignSelf:'center',
        textAlign:'center',
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);


    this.state = {
      store:props.store,
      myStore:props.myStore,
      data:[],
      loader:false
    }
    Keyboard.addListener('keyboardDidHide',this.keyboardDidHide)
    Keyboard.addListener( 'keyboardDidShow', this.keyboardDidShow)
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
            keyboardOpen:true,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
            keyboardOpen:false,
        })
  }

  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
     this.getPages()
  }

  getPages=()=>{
    this.setState({loader:true })
    fetch(SERVER_URL + '/api/POS/pagesvs/?store='+this.state.store.pk)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({data:responseJson,loader:false })
    })
    .catch((error) => {
      this.setState({loader:false })
    });
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

    var themeColor = this.props.store.themeColor


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <Loader
          modalVisible = {this.state.loader}
          animationType="fade"
        />
        <ScrollView contentContainerStyle={{paddingBottom: this.state.keyboardOffset}}>
          <View style={{}}>
          <FlatList
            data={this.state.data}
            extraData={this.state}
            keyExtractor={(item, index) => {
              return index.toString();
            }}
            renderItem={({item, index}) => (
              <View>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('PolicyPage',{data:item})}} style={{paddingHorizontal:15,flexDirection:'row',borderTopWidth:1,borderColor:'#f2f2f2',borderBottomWidth:this.state.data.length==index+1?1:0,height:60,alignItems:'center',justifyContent:'center'}}>
                <MonoText   style={{ fontSize:16,color:'#000',fontWeight:'700'}}>{entities.decode(item.title)}</MonoText>
                <View style={{flex:1,alignItems:'flex-end'}}>
                  <FontAwesome name="angle-right" size={30} color={themeColor}  />
                </View>
                </TouchableOpacity>
              </View>
            )}
           />
          </View>

        </ScrollView>
       </View>
     );
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
      setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(Policies);
