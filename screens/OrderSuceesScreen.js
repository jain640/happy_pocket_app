import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import ImageOverlay from "react-native-image-overlay";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const storeType = settings.storeType
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
import moment from 'moment';
const { width } = Dimensions.get('window');
class OrderSuceesScreen extends React.Component {


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Thank You!',

      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start',marginLeft:10 }}>
          <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => params.searchoption()}  >
          <MonoText><Ionicons name="md-arrow-back" size={22} color="#fff" /> </MonoText>
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
      orderList:[],
      orderQtyList:[],
      loader:true,
      store:this.props.store,
      saved:0
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);


  }

  handleBackButtonClick() {
    this.props.navigation.popToTop();
    return true;
 };

 getUnit=(type,value)=>{
  if(value!=null){
    var newValue = value
    if (type == 'Litre') {
      unit = 'L'
      return newValue+' '+unit
    }else if (type == 'Millilitre') {
      if(newValue>=1000){
        unit = 'L'
        newValue = newValue/1000
        if(newValue % 1 != 0){
          newValue = (newValue/1000).toFixed(1)
        }
      }else{
        unit = 'ml'
      }
       return newValue+' '+unit
    }else if (type == 'Gram') {
      if(newValue>=1000){
        unit = 'kg'
        newValue = newValue/1000
        if(newValue % 1 != 0){
          newValue = (newValue/1000).toFixed(1)
        }
      }else{
        unit = 'gm'
      }
       return newValue+' '+unit
    }else if (type == 'Kilogram') {
      unit = 'kg'
       return newValue+' '+unit
    }else if (type == 'Quantity') {
      unit = 'Qty'
       return newValue+' '+unit
    }else{
      unit = type
       return unit+' '+newValue
    }
    return unit+' '+newValue
  }else{
    if (type == 'Litre') {
      unit = 'L'
    }else if (type == 'Millilitre') {
        unit = 'ml'
    }else if (type == 'Gram') {
      unit = 'gm'
    }else if (type == 'Kilogram') {
      unit = 'kg'
    }else if (type == 'Quantity') {
      unit = 'Qty'
    }else{
      unit = type
    }
    return unit
  }

 }


  getOrderAsync = async () => {
    var orderId = this.props.navigation.getParam('orderId',null)
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userpk:userToken,sessionid:sessionid,orderId:orderId})
// orderId
      fetch(SERVER_URL + '/api/POS/getAllOrderQty/?order='+orderId  , {
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken':csrf
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          if(responseJson!=undefined){
            responseJson.data.forEach((i)=>{
              var unit = this.getUnit(i.productVariant.unitType,i.productVariant.value )
              var nameDisplay = i.productVariant.parent.name+' '+ unit
              i.nameDisplay = nameDisplay
            })
            this.setState({ orderList: responseJson,orderQtyList:responseJson.orderQty})
          }
          this.setState({ loader:false})
        })
        .catch((error) => {
          return
        });




    } catch (error) {
      return
    }
  };
  getOrderQtyAsync = async () => {
    var orderId = this.props.navigation.getParam('orderId',null)
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      this.setState({userpk:userToken,sessionid:sessionid})

      fetch(SERVER_URL + '/api/POS/orderQty/?order='+ orderId  , {
        headers: {
           "Cookie" :"sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          this.setState({ orderQtyList: responseJson})
          var saved = 0
          responseJson.forEach((i)=>{
            if(i.productVariant!=null){
              saved += i.productVariant.price-i.productVariant.sellingPrice
            }
          })
          this.setState({saved:saved})
        })
        .catch((error) => {
          return
        });




    } catch (error) {
      return
    }
  };



  componentDidMount() {
    this.props.emptyCartFunction()
    this.props.setInitialFunction([],0,0)
    this.props.setCounterAmount(0,0,0)
    this.props.navigation.setParams({
      searchoption: this.search,
      themeColor:this.state.store.themeColor
    });
    this.getOrderAsync()
    // this.getOrderQtyAsync()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  search = () => {
    this.props.navigation.popToTop()
  }

  render() {
    var themeColor = this.props.store.themeColor
    if(this.state.loader == true){
      return (
        <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
        <ActivityIndicator size="large" color={themeColor} />
        </View>
      )
    }

    else{

    return (

      <View style={[{flex:1,backgroundColor:'#fff',}]}>

        <ScrollView style={{flex:1,marginBottom:45,padding:10}}>
        <View style={[styles.oval,styles.shadow,{flex:1,marginHorizontal:10,borderWidth:1,borderColor:"#fff",borderRadius:10,borderBottomWidth:0,marginBottom:0,marginTop:0,}]}>
          <FontAwesome name="check-circle" size={32} color="#00ff00" style={{alignSelf:'center',marginTop:10}} />
          <MonoText   style={{fontWeight:'700',color:'#000',fontSize:22,alignSelf:'center',marginTop:5}}>Hurray ! Your order is placed.</MonoText>
          {storeType=='MULTI-OUTLET'&&this.state.orderList.order.timeSlot=='Now'&&
            <MonoText   style={{fontWeight:'700',color:'#000',fontSize:16,textAlign:'center',marginTop:0}}>See you under 90 minutes.</MonoText>
          }
          <View style={{flex:1,flexDirection:'row',}}>
            <View style={{flex:1,flexDirection:'row',paddingHorizontal:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,marginLeft:5}}>Order Id:</MonoText>
              <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>#{this.state.orderList.order.pk}</MonoText>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',paddingHorizontal:5}}>
              <MonoText   style={{color:'#000',fontSize:15,marginHorizontal:width*0.01,marginTop:10,fontWeight:'700'}}>{moment(moment.utc(this.state.orderList.order.created).toDate()).local().format('HH:mm')}</MonoText>
            </View>
          </View>
          <View style={{flex:1,flexDirection:'row',}}>
          {storeType=='MULTI-OUTLET'&&
            <View style={{flex:0.7,flexDirection:'row',paddingHorizontal:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Time Slot:</MonoText>
                <MonoText   style={{color:'#000',fontSize:14,marginHorizontal:width*0.005,marginTop:11,}}>{this.state.orderList.order.timeSlot}</MonoText>
            </View>
          }
              <View style={{flex:0.3,flexDirection:'row',justifyContent:'flex-end',paddingHorizontal:5}}>
                <MonoText   style={{color:'#000',fontSize:15,marginRight:width*0.01,marginTop:10,}}>{moment(moment.utc(this.state.orderList.order.created).toDate()).local().format('DD/MM/YYYY')}</MonoText>
              </View>
          </View>
        </View>
        <View style={[styles.shadow,{flex:1,margin:10,borderBottomWidth:0,marginBottom:0,padding:10,paddingTop:0,marginTop:2,backgroundColor:'#fff'}]}>
          <View style={{flex:1,}}>
          <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Deliver To</MonoText>
          <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,}}>{this.state.orderList.order.street} {this.state.orderList.order.landMark} {this.state.orderList.order.city}  </MonoText>
          </View >
        </View >
        <View style={[styles.ovalTop,styles.shadow,{flex:1,margin:10,borderWidth:1,borderColor:"#fff",borderRadius:10,borderBottomWidth:0,marginBottom:20,padding:10,paddingRight:0,marginTop:2}]}>

          <View style={[{margin:width*0.01,marginTop:0,}]}>
            <View style={{flex:1,flexDirection:'row',padding:10,paddingTop:0,borderBottomWidth:1,borderBottomColor:'#e7e7e7'}}>
              <View style={{flex:0.6}}>
                <MonoText   style={{color:'grey',fontSize:13,}}>Item</MonoText>
              </View>
              <View style={{flex:0.15,alignItems:'center'}}>
                <MonoText   style={{color:'grey',fontSize:13,}}>Qty</MonoText>
              </View>
              <View style={{flex:0.25,alignItems:'flex-end'}}>
                <MonoText   style={{color:'grey',fontSize:13,textAlign:'right'}}>Price/Unit</MonoText>
              </View>
            </View>
            <FlatList style={{}}
            data={this.state.orderList.data}
            keyExtractor={(item,index) => {
              return item.pk.toString();
            }}
            renderItem={({item, index, separators}) => (
              <View style={{flex:1,flexDirection:'row',padding:10,paddingRight:10,borderBottomWidth:1,borderBottomColor:'#e7e7e7'}}>
              <View style={{flex:0.6}}>
                <MonoText   style={{color:'#000',fontSize:13}}>{item.nameDisplay} </MonoText>
              </View>
              <View style={{flex:0.15,alignItems:'center'}}>
                <MonoText   style={{color:'#000',fontSize:13,}}>{item.qty}</MonoText>
              </View>
              <View style={{flex:0.25,alignItems:'flex-end'}}>
                  <MonoText   style={{color:'#000',fontSize:13,textAlign:'right'}}>&#8377; {item.sellingPrice}</MonoText>
              </View>
              </View>
            )}
            />
            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',marginRight:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Subtotal:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.total}</MonoText>
              </View>
            </View>

            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',marginRight:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Tax:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.gstVal}</MonoText>
              </View>
            </View>

            {storeType!='MULTI-OUTLET'&&
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
                <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Discount:</MonoText>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                  <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.bulk}</MonoText>
                </View>
              </View>
            }
            {storeType!='MULTI-OUTLET'&&
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
                <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Coupon Discount:</MonoText>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                  <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.discount}</MonoText>
                </View>
              </View>
           }

            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Delivery:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.shippingPrice}</MonoText>
              </View>
            </View>

            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
              <MonoText   style={{color:'#f00',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Saved Amount:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#f00',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.orderList.order.savedAmount}</MonoText>
              </View>
            </View>

            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
              <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Mode Of Payment:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>{this.state.orderList.order.paymentMode}</MonoText>
              </View>
            </View>

            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:5}}>
              <MonoText   style={{color:'#000',fontSize:15,marginHorizontal:width*0.01,marginTop:10,fontWeight:'700'}}>Grand Total:</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,fontWeight:'700'}}>&#8377; {this.state.orderList.grandTotal}</MonoText>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
        <View style={{position:'absolute',bottom:0,left:0,right:0,zIndex:99,backgroundColor:themeColor,height:45,}}>
            <TouchableOpacity style={[{backgroundColor:themeColor,alignItems:'center',justifyContent:'center',flex:1,}]} onPress={()=>this.props.navigation.navigate('OrderDetailsScreen')}>
              <MonoText   style={{color:'#fff',fontSize:18,fontWeight:'700'}}>View Orders</MonoText>
            </TouchableOpacity>
        </View>
      </View>

    )
  }

  }
  }
  const mapStateToProps =(state) => {
      return {
        store:state.cartItems.store
      }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      emptyCartFunction:()=>dispatch(actions.emptyCart()),
      setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
      setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(OrderSuceesScreen);

const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10
  },
  shadow: {
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  searchcontainer: {
    backgroundColor: 'red',
  },
  oval: {
    // paddingBottom:30,
    // borderBottomLeftRadius: 0,
    // borderTopLeftRadius: 0,
    // borderBottomRightRadius: 0,
    // borderTopRightRadius: 0,
    // backgroundColor: '#fff',
   },
  ovalTop: {
    // padding:10,
    // paddingTop:30,
    // borderTopLeftRadius: 0,
    // borderTopRightRadius: 0,
    // backgroundColor: '#fff',
    // borderBottomRightRadius: 0,
    // borderBottomLeftRadius: 0,
   },

})
