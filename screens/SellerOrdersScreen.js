import React from 'react';
import {
  Image,Platform,
  ScrollView,StyleSheet,
  Text,TouchableOpacity,
  View,Slider,
  Dimensions,
  TextInput,FlatList,AsyncStorage,
  TouchableHighlight, Alert,
  ActivityIndicator
} from 'react-native';
import  { FontAwesome }  from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import * as WebBrowser  from 'expo-web-browser';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons ,MaterialCommunityIcons,MaterialIcons} from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo-linear-gradient';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import moment from 'moment'
import { FloatingAction } from "react-native-floating-action";
import SellerOrderCompo from '../components/SellerOrderCompo';
import Accepted from '../components/Accepted';
import Packed from '../components/Packed';
import Shipped from '../components/Shipped';
import Delivered from '../components/Delivered';
import Return from '../components/Return';
import Replacement from '../components/Replacement';
import Cancelled from '../components/Cancelled';
import History from '../components/History';
import RTO from '../components/RTO';
import { ScrollableTabView, DefaultTabBar, ScrollableTabBar, } from '@valdio/react-native-scrollable-tabview';
import TabBar from '../components/TabBar';
import CreateQuote from '../components/CreateQuote';
import SellerZone from '../screens/SellerZone';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const STORE_TYPE = settings.storeType
class SellerOrdersScreen extends React.Component{

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
            title: 'Seller Orders',
            headerLeft: (
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>

                   <TouchableOpacity onPress={()=>{navigation.navigate('SellerZone');}}>
                          <MaterialIcons name="arrow-back" size={30} color={'#fff'}/>
                   </TouchableOpacity>
              </View>
           ),
            headerStyle: {
                backgroundColor: params.themeColor,
                marginTop:Constants.statusBarHeight
            },
            headerTintColor: '#fff',
      };
   }

    constructor(props){
        super(props);
        this.state = {
            open : false,
            cancellationReview:'',
            store:this.props.store,
            configuration:null,
            userStore:null,
        }
    }

getUserAsync = async () => {
  const userToken = await AsyncStorage.getItem('userpk');
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrf = await AsyncStorage.getItem('csrf');
  if(userToken == null){
    return
  }
  fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
    headers: {
       "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL,
       'X-CSRFToken': csrf
    }
  }).then((response) => response.json())
    .then((responseJson) => {
        AsyncStorage.setItem('first_name',JSON.stringify(responseJson.first_name))
        AsyncStorage.setItem('last_name',JSON.stringify(responseJson.last_name))
        this.setState({userStore:responseJson.store,is_superuser:responseJson.is_superuser})
    })
    .catch((error) => {
      return
    });
}

  getConfiguration =(store)=>{
    if(STORE_TYPE == 'MULTI-VENDOR' || STORE_TYPE == 'MULTI-OUTLET'){
      this.setState({configuration:this.state.store})
    }else{
      fetch(SERVER_URL + '/api/POS/store/'+store+'/')
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({configuration:responseJson})
        })
    }
  }

  getMyStore = async ()=>{
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    fetch(SERVER_URL + '/api/POS/getMyStore/',{
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
     .then((response) => {return response.json()})
     .then((responseJson) => {
          if(responseJson.found){
            this.props.setMyStoreFunction(responseJson.store,responseJson.role)
          }else{
          }
        })
     .catch((error) => {
       return
     });
  }

    componentDidMount() {
        this.props.navigation.setParams({
            themeColor:this.state.store.themeColor
        });
        this.getUserAsync()
        this.getMyStore()
    }
    componentWillReceiveProps= async({navigation})=> {
        var update = navigation.getParam('changestatus',null)
    }

    clickHandler = (name)=>{
        if(name == 'createorder'){
        }
        else{
          this.props.navigation.navigate('CreateQuote')
        }
    }

    render() {
        const { navigation } = this.props;
        const themeColor = this.props.store.themeColor
        console.log(this.props.myStore,'lllllll');
        const actions = [{text: "Create Quote",
                          icon: <FontAwesome name={"file-text"} size={20} color={'#fff'} />,
                          name: "createquote",
                          position: 2,
                          color:themeColor,},
                         {text: "Create Order",
                          icon: <FontAwesome name={"dollar"} size={20} color={'#fff'} />,
                          name: "createorder",
                          position:1,
                          color:themeColor},];
      return (

        <LinearGradient
            colors={[ 'transparent','transparent', 'transparent', 'transparent']}
            style={[styles.container]}>
           <ScrollableTabView
                refreshControlStyle={{backgroundColor: 'red'}}
                tabBarBackgroundColor={themeColor}
                tabBarActiveTextColor={'white'}
                tabBarInactiveTextColor={'white'}
                tabBarTextStyle={{fontSize: 16}}
                style={{flex:1,}}
                tabBarUnderlineStyle={{ backgroundColor: 'red', height: 3,}}
                goToPage={(tabView) => { this.tabView = tabView; }}
                renderTabBar={() => <ScrollableTabBar />}
                ovescroll={true}
                initialPage={0}>

                <ScrollView  tabLabel="New " style={{backgroundColor:'#fff',marginTop:-20}} >
                    <SellerOrderCompo navigation={this.props.navigation} status={'newOrder'} store={this.props.myStore}/>
                </ScrollView>

                <ScrollView tabLabel="Accepted" style={{backgroundColor:'#fff',marginTop:-20}}>
                    <SellerOrderCompo navigation={this.props.navigation} status={'accepted'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="Packed" style={{backgroundColor:'#fff',marginTop:-20}}>
                    <SellerOrderCompo navigation={this.props.navigation} status={'packed'} store={this.props.myStore} />
                </ScrollView>

                  <ScrollView tabLabel="Shipped" style={{backgroundColor:'#fff',marginTop:-20}} >
                  <SellerOrderCompo navigation={this.props.navigation} status={'shipped'} store={this.props.myStore} />
                  </ScrollView>

                <ScrollView  tabLabel="Delivered " style={{backgroundColor:'#fff',marginTop:-20}} >
                    <SellerOrderCompo navigation={this.props.navigation} status={'delivered'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="Return" style={{backgroundColor:'#fff',marginTop:-20}}>
                    <SellerOrderCompo navigation={this.props.navigation} status={'return'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="Replacement" style={{backgroundColor:'#fff',marginTop:-20}}>
                    <SellerOrderCompo navigation={this.props.navigation} status={'replacement'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="Cancelled" style={{backgroundColor:'#fff',marginTop:-20}} >
                    <SellerOrderCompo navigation={this.props.navigation} status={'cancelled'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="History" style={{backgroundColor:'#fff',marginTop:-20}}>
                    <SellerOrderCompo navigation={this.props.navigation} status={'history'} store={this.props.myStore} />
                </ScrollView>

                <ScrollView tabLabel="RTO" style={{backgroundColor:'#fff',marginTop:-20}} >
                    <SellerOrderCompo navigation={this.props.navigation} status={'RTO'} store={this.props.myStore} />
                </ScrollView>



            </ScrollableTabView>

            <FloatingAction
                  actions={actions}
                  position='right'
                  onPressItem={name => this.clickHandler(name)}
                  color={themeColor}
                  buttonSize={45}
                  style={{position:'absolute',bottom:25}}
              />
         </LinearGradient>
        );
      }
  }

  const mapStateToProps =(state) => {
      return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      myStore: state.cartItems.myStore
    }
  }

  const mapDispatchToProps = (dispatch) => {
      return {
        setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
      };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(SellerOrdersScreen);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    contentImage:{
      flexWrap: 'nowrap',
      flexDirection:'row',
      alignItems: 'flex-start',
      marginTop:Constants.statusBarHeight,
      justifyContent: 'flex-start',
    },
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
    TouchableOpacityStyle: {
       position: 'absolute',
       width: 50,
       height: 50,
       alignItems: 'center',
       justifyContent: 'center',
       right: 30,
       bottom: 30,
       backgroundColor: themeColor,
       zIndex: 1,
       borderRadius:25,
     },
     modalcontainer:{
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
     },
     modalView: {
       backgroundColor: '#fff',
       marginHorizontal: width*0.05 ,
       borderRadius:5,
    },
    FloatingButtonStyle: {
       resizeMode: 'contain',
       width: 50,
       height: 50,
     }
  });

//   {this.props.myStore.shippedOrder&&
//     <ScrollView tabLabel="Shipped" style={{backgroundColor:'#fff',marginTop:-20}} >
//     <SellerOrderCompo navigation={this.props.navigation} status={'shipped'} store={this.props.myStore} />
//     </ScrollView>
//   }
//
//   {this.props.myStore.returnOrder&&
//   <ScrollView tabLabel="Return" style={{backgroundColor:'#fff',marginTop:-20}}>
//       <SellerOrderCompo navigation={this.props.navigation} status={'return'} store={this.props.myStore} />
//   </ScrollView>
//   }
//   {this.props.myStore.replacementOrder &&
//   <ScrollView tabLabel="Replacement" style={{backgroundColor:'#fff',marginTop:-20}}>
//       <SellerOrderCompo navigation={this.props.navigation} status={'replacement'} store={this.props.myStore} />
//   </ScrollView>
//   }
//   {this.props.myStore.cancelledOrder&&
//   <ScrollView tabLabel="Cancelled" style={{backgroundColor:'#fff',marginTop:-20}} >
//       <SellerOrderCompo navigation={this.props.navigation} status={'cancelled'} store={this.props.myStore} />
//   </ScrollView>
//  }
//  {this.props.myStore.rtodOrder&&
//   <ScrollView tabLabel="RTO" style={{backgroundColor:'#fff',marginTop:-20}} >
//       <SellerOrderCompo navigation={this.props.navigation} status={'RTO'} store={this.props.myStore} />
//   </ScrollView>
// }
