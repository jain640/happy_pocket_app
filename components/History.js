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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator
} from 'react-native';
import  { FontAwesome }  from '@expo/vector-icons';
import { MonoText } from './StyledText';
import OrderDetails from '../components/OrderDetails';
import * as WebBrowser  from 'expo-web-browser';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo-linear-gradient';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import moment from 'moment'
import { FloatingAction } from "react-native-floating-action";

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor
export default class Cancelled extends React.Component{

  constructor(props){
      super(props);
      this.state = {
          orders:[],
          open : false,
          offset:0,
          cancellationReview:'',
          loader:true,
      }
  }

  userAsync = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        if(userToken!== null ){
          fetch(SERVER_URL + '/api/POS/order/', {
              headers: {
                 "Cookie" :"sessionid=" + sessionid ,
              },
              method: 'GET'
            }).then((response) =>{
                  return response.json()
            }).then((responseJson) => {
                  this.setState({ orders: responseJson,loader:false})
            }).catch((error) => {
                  return
            });
        }
      }catch (error) {
          return
      }
   };

   componentDidMount() {
      this.userAsync()
   }
   componentWillReceiveProps= async({navigation})=> {
       var update = navigation.getParam('changestatus',null)
       if(update == true){
         this.userAsync()
       }
   }

  render() {
      return (
        <View>
        <FlatList
            style={{backgroundColor:'#fff',width:width,flexWrap:'nowrap',marginBottom:0,paddingBottom:30}}
            data={this.state.orders}
            inverted
            keyExtractor={(item,index) => {
                return item.pk.toString();
            }}
            renderItem={({item, index, separators}) => (
            <View style={[styles.item,{backgroundColor:'#ffffff'}]}>
                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('SellerOrderDetails',{item:item})}} >
                    <Card  containerStyle={[styles.shadow,{borderWidth:1,borderColor:'#fff',borderRadius:7,
                                              marginTop: 15,marginBottom:3}]}>
                        <MonoText   style={{textAlign:'center',fontWeight:'700'}}>Order No : #{item.pk}</MonoText>
                        <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                              <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                  <MonoText>Total Amount: &#8377; {item.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                              </View>
                              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                  <MonoText>Payment Mode: {item.paymentMode}</MonoText>
                              </View>
                        </View>
                        <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                              <View style={{flex:1.3,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                  {item.paymentStatus == false &&<MonoText>Payment Status: Not Received</MonoText> }
                                  {item.paymentStatus == true&&<MonoText>Payment Status: Received</MonoText> }
                              </View>
                              <View style={{flex:0.7,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                  <MonoText   >Status: {item.status}</MonoText>
                              </View>
                        </View>
                        <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                              <View style={{flex:0.8,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                  {item.approved == null && item.approved == undefined&&<MonoText>Approved: No</MonoText> }
                                  {item.approved != null && item.approved != undefined&&<MonoText>Approved: {item.approved}</MonoText> }
                              </View>
                              <View style={{flex:1.2,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                  <MonoText> {moment(moment.utc(item.created).toDate()).local().format('YYYY-MM-DD HH:mm')}</MonoText>
                              </View>
                       </View>

                 </Card>
              </TouchableOpacity>
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
