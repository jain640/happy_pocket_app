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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator,TouchableWithoutFeedback
} from 'react-native';
import  { FontAwesome }  from '@expo/vector-icons';
import { MonoText } from './StyledText';
import OrderDetails from '../components/OrderDetails';
import * as WebBrowser  from 'expo-web-browser';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons,MaterialIcons } from '@expo/vector-icons';
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
export default class SellerOrderCompo extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            orders:[],
            open : false,
            offset:0,
            cancellationReview:'',
            loader:true,
            is_superuser:false,
            userStore:null,
            status:props.status,
            store:props.store,
            offset:0,
            limit:10,
            count:0
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
           this.orderAsync(responseJson.is_superuser,responseJson.store)
        })
        .catch((error) => {
          return
        });
    }

    orderAsync =  (superUser,userStore) => {
        if(this.state.status!='history'){
          var url = SERVER_URL + '/api/POS/order/?status='+this.state.status+'&storeid='+this.props.store.pk
          fetch(url)
          .then((response) =>{
            return response.json()
          })
          .then((responseJson) => {
            this.setState({ orders: responseJson,loader:false})
          })
          .catch((error) => {
            return
          });
        }else{
          var url = SERVER_URL + '/api/POS/order/?offset=0&limit=10&storeid='+this.props.store.pk
          fetch(url)
          .then((response) =>{
            return response.json()
          })
          .then((responseJson) => {
            this.setState({ orders: responseJson.results,loader:false,count:responseJson.count})
          })
          .catch((error) => {
            return
          });
        }


    };

    loadMore=()=>{
      var offset = this.state.offset+10
      var limit = this.state.limit
      console.log(offset,limit,'dgsngbbnf');

      var url = SERVER_URL + '/api/POS/order/?offset='+offset+'&limit='+limit+'&storeid='+this.props.store.pk
      fetch(url)
      .then((response) =>{
        return response.json()
      })
      .then((responseJson) => {
        var arr = this.state.orders
        responseJson.results.forEach((i)=>{
          arr.push(i)
        })
        this.setState({ orders: arr,loader:false,offset:offset,limit:limit})
      })
      .catch((error) => {
        return
      });
    }

    componentDidMount() {
        this.getUserAsync()
    }
    componentWillReceiveProps= async({navigation})=> {
        var update = navigation.getParam('changestatus',null)
        if(update == true){
          this.orderAsync(this.state.is_superuser,this.state.userStore)
        }
    }

  render() {
    var themeColor = this.props.store.themeColor
      return (
        <View>
            <FlatList
                style={{backgroundColor:'#fff',width:width,flexWrap:'nowrap',marginBottom:0,paddingBottom:10,marginBottom:10}}
                data={this.state.orders}

                keyExtractor={(item,index) => {
                    return item.pk.toString();
                }}
                renderItem={({item, index, separators}) => (
                <View style={[styles.item,{backgroundColor:'#ffffff'}]}>
                    <TouchableWithoutFeedback onPress={()=>{this.props.navigation.navigate('SellerOrderDetails',{item:item,history:this.state.status})}} >
                        <Card  containerStyle={[styles.shadow,{borderWidth:1,borderColor:'#fff',borderRadius:7,
                                                  marginTop: 15,marginBottom:3}]}>
                            <MonoText   style={{textAlign:'center',fontWeight:'700'}}>Order No : #{item.pk}</MonoText>
                            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:5}}>
                                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                      <MonoText>Total Amount: &#8377; {item.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                                  </View>
                                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                      <MonoText   >Status: {item.status}</MonoText>
                                  </View>
                            </View>
                            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:5}}>
                                  <View style={{flex:0.8,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                      {item.approved == null && item.approved == undefined&&<MonoText>Approved: No</MonoText> }
                                      {item.approved != null && item.approved != undefined&&<MonoText>Approved: {item.approved}</MonoText> }
                                  </View>
                                  <View style={{flex:1.2,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                      <MonoText> {moment(moment.utc(item.created).toDate()).local().format('YYYY-MM-DD HH:mm')}</MonoText>
                                  </View>
                           </View>
                            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:5}}>
                                  <View style={{flex:1.3,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                    <MonoText>Payment Mode: {item.paymentMode}</MonoText>
                                  </View>
                                  <View style={{flex:0.7,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                    {item.paymentStatus == false &&<MonoText>Payment Status: Not Received</MonoText> }
                                    {item.paymentStatus == true&&<MonoText>Payment Status: Received</MonoText> }
                                  </View>
                            </View>
                           <View style={{flex:1,flexDirection:'row'}}>
                            {item.approved &&
                                <TouchableOpacity
                                      style={{flex:1,flexDirection:'row',justifyContent:'flex-end',
                                              alignItems:'center',marginTop:15}} >
                                     <FontAwesome name="download" size={22} color="blue"  />
                                     <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                              </TouchableOpacity>
                            }
                        </View>
                      {item.open?(
                        <View style={{marginTop:15}}>
                            <MonoText   style={{fontSize:13}}>{'Address : '+ item.billingStreet+'  '+item.billingCity+'  '+item.billingState+'  '+item.billingPincode+'.'}</MonoText>
                            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                                <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                      <MonoText   style={{fontSize:13}}>LandMark : {item.billingLandMark}</MonoText>
                                </View>
                                <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                      <MonoText   style={{fontSize:13}}>Mobile : {item.mobileNo}</MonoText>
                                </View>
                           </View>
                           <FlatList
                                style={{marginTop: 15,}}
                                data={item.orderQtyMap}
                                keyExtractor={(item, index) => index}
                                renderItem={({ item }) => (
                                <View style={{borderTopWidth:1,borderColor:'grey',paddingVertical:15}}>
                                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                                          <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                                <MonoText   style={{fontSize:13}}>Name :{item.productName}</MonoText>
                                          </View>
                                          <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                                <MonoText   style={{fontSize:13}}>Qty :{item.qty}</MonoText>
                                          </View>
                                    </View>
                                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:15}}>
                                          <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                                                <MonoText   style={{fontSize:13}}>Price(+ GST) : &#8377; {item.priceDuringOrder}</MonoText>
                                          </View>
                                          <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                                                <MonoText   style={{fontSize:13}}>Total Amount : &#8377; {item.totalAmount}</MonoText>
                                          </View>
                                    </View>
                               </View>
                             )}
                           />
                         </View>
                       ):<View></View>}
                     </Card>
                  </TouchableWithoutFeedback>
             </View>
            )}
          />
          <View style={{alignItems:'center',justifyContent:'center',paddingBottom:20}}>
            { this.state.status=='history'&&this.state.orders.length>0&&this.state.count>this.state.orders.length&&
              <TouchableOpacity onPress={()=>this.loadMore()}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                <MonoText   style={{ color:'#fff',fontSize:15}}>Load More</MonoText>
              </TouchableOpacity>
            }
          </View>
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
