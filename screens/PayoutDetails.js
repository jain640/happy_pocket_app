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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,Picker,Keyboard,TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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
import Loader from '../components/Loader';
import moment from 'moment'


const orderProcess = [{id:'16',amount:'5999',date:new Date()},{id:'12',amount:'3000',date:new Date()},{id:'18',amount:'5999',date:new Date()},{id:'15',amount:'3500',date:new Date()}]

class PayoutDetails extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    var title = 'Payout # '+params.item.pk
    return {
      title: title,

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
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
    var payout = this.props.navigation.state.params.item

    this.state = {
      store:props.store,
      myStore:props.myStore,
      keyboardOffset:0,
      keyboardOpen:false,
      loadingVisible:false,
      payout:payout,
      orderProcess:payout.invoice_included
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
    var {loadingVisible} = this.state



     return (
       <View style={[styles.container,{backgroundColor:'#fff'}]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <Loader
          modalVisible = {loadingVisible}
          animationType="fade"
        />
        <View style={{flex:1,}}>
          <ScrollView >


            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Dated</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{moment(this.state.payout.created).format('DD MMM YYYY')}</MonoText>
                    </View>
               </View>
             </View>
             <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                <View style={{flexDirection:'row',marginHorizontal:15,}}>
                    <View style={{flex:0.5}}>
                    <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Status</MonoText>
                    </View>
                    <View style={{flex:0.5,alignItems:'flex-end'}}>
                    <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{this.state.payout.status}</MonoText>
                     </View>
                </View>
              </View>
             <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                <View style={{flexDirection:'row',marginHorizontal:15,}}>
                    <View style={{flex:0.5}}>
                    <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Store</MonoText>
                    </View>
                    <View style={{flex:0.5,alignItems:'flex-end'}}>
                    <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{this.state.store.name}</MonoText>
                     </View>
                </View>
              </View>
            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Total Sales</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {this.state.payout.totalSales}</MonoText>
                    </View>
               </View>
             </View>
            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Commission</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {this.state.payout.commission}</MonoText>
                    </View>
               </View>
             </View>
            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Total Collection</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {this.state.payout.totalCollection}</MonoText>
                    </View>
               </View>
             </View>
            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Payment Mode</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{this.state.payout.paymentMode}</MonoText>
                    </View>
               </View>
             </View>
            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>UTR Number</MonoText>
                   </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{this.state.payout.utrNo}</MonoText>
                    </View>
               </View>
             </View>



            <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
               <View style={{flexDirection:'row',marginHorizontal:15,}}>
                   <View style={{flex:0.5}}>
                   <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Date of Payment</MonoText>
                    </View>
                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{this.state.payout.dateofpayment}</MonoText>
                    </View>
               </View>
             </View>

             {this.state.orderProcess.length>0&&<View style={{height:45,backgroundColor:'#f2f2f2',justifyContent:'center',paddingHorizontal:15}}>
                <MonoText   style={{color:'#000',fontSize:18,fontWeight:'700'}}>Order details</MonoText>
             </View>
            }


             <FlatList
                 data={this.state.orderProcess}
                 keyExtractor={(item,index) => {
                   return index.toString();
                 }}
                 extraData={this.state}
                 showsVerticalScrollIndicator={false}
                 nestedScrollEnabled={true}
                 renderItem={({item, index}) =>{
                    return (
                        <View style={{flex:1,backgroundColor:'#f2f2f2',borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                           <View style={[{borderWidth: 0, borderColor: '#fff', width:width,margin:0,padding:0,backgroundColor:'#fff'}]}>
                              <TouchableWithoutFeedback onPress={()=>{this.props.navigation.push('PayoutOrderDetail',{order:item.pk})}} style={{height:'100%'}}>
                                <View style={{paddingVertical:10}}>
                                   <View style={{flexDirection:'row',marginHorizontal:15,}}>
                                       <View style={{flex:0.5}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}># {item.pk}</MonoText>
                                       </View>
                                       <View style={{flex:0.5,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>{moment(item.created).format('DD MMM YYYY')}</MonoText>
                                       </View>
                                   </View>
                                   <View style={{flexDirection:'row',marginHorizontal:15,marginTop:10}}>
                                       <View style={{flex:1}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}>Total Amount</MonoText>
                                       </View>
                                       <View style={{flex:1,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {item.totalAmount}</MonoText>
                                       </View>
                                   </View>
                                   <View style={{flexDirection:'row',marginHorizontal:15,marginTop:10}}>
                                       <View style={{flex:1}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}>Seller Amount</MonoText>
                                       </View>
                                       <View style={{flex:1,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {item.sellerAmount}</MonoText>
                                       </View>
                                   </View>
                                   <View style={{flexDirection:'row',marginHorizontal:15,marginTop:10}}>
                                       <View style={{flex:1}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}>Commission</MonoText>
                                       </View>
                                       <View style={{flex:1,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {item.shippingPrice}</MonoText>
                                       </View>
                                   </View>
                                   <View style={{flexDirection:'row',marginHorizontal:15,marginTop:10}}>
                                       <View style={{flex:0.7}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}>Platform Commission</MonoText>
                                       </View>
                                       <View style={{flex:0.3,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {item.platformCommission}</MonoText>
                                        </View>
                                   </View>
                                   <View style={{flexDirection:'row',marginHorizontal:15,marginTop:10}}>
                                       <View style={{flex:0.7}}>
                                       <MonoText   style={{color:'#000',fontSize:16,}}>Payment Gateway Charge</MonoText>
                                       </View>
                                       <View style={{flex:0.3,alignItems:'flex-end'}}>
                                       <MonoText   style={{color:'#000',fontSize:16,marginTop:5,}}>&#8377; {item.paymentGatewayCharge}</MonoText>
                                        </View>
                                   </View>
                                 </View>
                              </TouchableWithoutFeedback>
                           </View>
                      </View>
                 )}}
               />


          </ScrollView>
       </View>

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
      elevation: 0,
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

  export default connect(mapStateToProps, mapDispatchToProps)(PayoutDetails);

  // headerRight:(
  //   <View style={{marginRight:15}}>
  //       <FontAwesome name={'download'} color={'#fff'} size={25} />
  //   </View>
  // ),
