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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,ImageBackground,Keyboard
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
  import DatePicker from 'react-native-datepicker';
import { createBottomTabNavigator,createAppContainer,createSwitchNavigator,NavigationActions } from 'react-navigation';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import GridLayout from 'react-native-layout-grid';
import { RadioButton } from 'react-native-paper';
import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import Loader from '../components/Loader';
import moment from 'moment'




class CreateCoupon extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Create Coupon',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
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
     var product = props.navigation.state.params.product
    this.state = {
      store:props.store,
      myStore:props.myStore,
      keyboardOffset:0,
      keyboardOpen:false,
      inPercentage:false,
      discount:0,
      moq:5,
      name:'',
      validTimes:0,
      endDate:new Date(),
      product:product,
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
  componentWillReceiveProps(nextProps){
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

  createCoupon=async()=>{

    if(this.state.name.length==0){
      this.refs.toast.show('Enter Coupon Code.');
      return
    }

    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    // var time = moment(new Date()).format('HH:mm:ss')
    // var dateTime = moment(this.state.endDate + time,'YYYY-MM-DD HH:mm:ss').format();
    // console.log(this.state.endDate,time,dateTime,'kk');
    // // return

    var dateTime = moment(this.state.endDate).format('YYYY-MM-DDThh:mm:ssZ');
    var data = {
      name :this.state.name,
      endDate :dateTime,
      discount :this.state.discount,
      validTimes :this.state.validTimes,
      store :this.state.myStore.pk,
      discountInPercentage:this.state.inPercentage,
      product:this.state.product.pk
    }
    console.log(data,'jjjjjjj');

    this.setState({loader:true})
    await fetch(SERVER_URL +'/api/POS/promocodevs/',{
       method:'POST',
       headers:{
         "Cookies":"csrftoken="+csrf+";sessionid="+sessionid+";",
         "Accept":'application/json',
         "Content-Type":'application/json',
         "X-CSRFToken":csrf,
         "Referer":SERVER_URL,
       },
       body:JSON.stringify(data),
     }).then((response)=>{
         console.log(response.status,'kkk');
         if(response.status==200||response.status==201){
           return response.json()
         }
       }).then((jsonResponse)=>{
         console.log(jsonResponse,'jjj');
         this.setState({loader:false})
         if(jsonResponse==undefined){
           return
         }else{
           this.props.navigation.navigate('CouponScreen')
         }
       }).catch((err)=>{
         this.setState({loader:false})
         return
       })
  }


  render() {

    var themeColor = this.props.store.themeColor


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: themeColor}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>


        <ScrollView contentContainerStyle={{paddingBottom: 50}}>


          <View style={{paddingTop:15,marginHorizontal:15,}}>
             <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Product Name</MonoText>
             </View>
             <MonoText   style={{fontSize:16,marginTop:5,}}>{this.state.product.name}</MonoText>
          </View>

          <View style={{paddingTop:15,marginHorizontal:15,}}>
             <View style={{flexDirection:'row'}}>
             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Enter Coupon Code</MonoText>
             </View>
            <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                onChangeText={(name)=>this.setState({name:name})}
                placeholder={'Code'}
                value={this.state.name} >
            </TextInput>
          </View>

          {/*<View style={{paddingTop:15,marginHorizontal:15,}}>
             <View style={{flexDirection:'row'}}><MonoText   style={{fontSize:16,fontWeight:'700'}}>Enter MOQ</MonoText> </View>
            <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                onChangeText={(moq)=>this.setState({moq:moq})}
                placeholder={'E.g. 50'}
                value={this.state.moq.toString()}
                keyboardType={'numeric'} >
            </TextInput>
          </View>*/}

          <View style={{marginHorizontal:15,marginVertical:15}} >
             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Select Discount Type</MonoText>
             <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                <View style={{flex:0.3,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                  <RadioButton
                    value={false}
                    color={themeColor}
                    disabled={false}
                    status={!this.state.inPercentage ? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ inPercentage: false }); }}
                  />
                  <MonoText   style={{ color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>&#8377;</MonoText>
                </View>
                <View style={{flex:0.7,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                  <RadioButton
                    value={true}
                    color={themeColor}
                    disabled={false}
                    status={this.state.inPercentage ? 'checked' : 'unchecked'}
                    onPress={() => { this.setState({ inPercentage: true }); }}
                  />
                  <MonoText   style={{ color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>%</MonoText>
                </View>
              </View>
          </View>

          <View style={{marginHorizontal:15,}} >
             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Discount Value</MonoText>
             <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                 <View style={{flex:0.2,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderLeftWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                   {this.state.inPercentage&&
                     <MonoText   style={{fontSize:18,color:'#000'}}>%</MonoText>
                    }
                   {!this.state.inPercentage&&
                     <MonoText   style={{fontSize:18,color:'#000'}}>&#8377;</MonoText>
                    }
                 </View>
                 <View style={{flex:0.8}}>
                   <TextInput style={{height:40,paddingHorizontal:10,marginTop:5,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000'}}
                       onChangeText={(discount)=>{this.setState({discount:discount});}}
                       value={this.state.discount.toString()}  keyboardType={'numeric'}>
                   </TextInput>
                 </View>
              </View>
          </View>

          <View style={{paddingTop:15,marginHorizontal:15,}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>End Date</MonoText>
              <View style={{flex:1,flexDirection:'row',}}>
                <View style={{flex:0.2,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:1,borderRightWidth:0,borderColor:'#f2f2f2',borderRadius:0}}>
                   <FontAwesome name="calendar" size={17} />
                </View>
                <View style={{flex:0.8,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:0,borderColor:'#f2f2f2',borderRadius:0,}}>
                <DatePicker
                            style={{padding:0,margin:0,alignItems:'center',justifyContent:'center',width:'100%',}}
                            date={this.state.endDate}
                            mode="date"
                            placeholder='DD-MM-YYYY'
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            format={'YYYY-MM-DD'}
                            iconComponent={
                              <FontAwesome
                                  size={20}
                                  color='#1a689a'
                                  name='calendar'
                              />
                            }
                            customStyles={{

                                dateInput: {padding:0,margin:0,
                                 backgroundColor:'#fff',borderWidth:1,height:40,fontSize:18,paddingLeft:10,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,alignItems: "flex-start"
                               },
                               placeholderText: {
                                 fontSize: 18,
                                 color: "#000"
                               },
                               dateText: {
                                 fontSize: 18,
                                 color: "#000",
                               }
                            }}
                            onDateChange={(endDate) => {this.setState({endDate})}}/>
                   </View>
              </View>
          </View>


          <View style={{paddingTop:15,marginHorizontal:15,}}>
             <View style={{flexDirection:'row'}}>
             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Valid Times</MonoText>
              </View>
             <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                 onChangeText={(validTimes)=>this.setState({validTimes:validTimes})}
                 placeholder={'E.g. 5'}
                 value={this.state.validTimes.toString()}
                 keyboardType={'numeric'} >
             </TextInput>
          </View>


        </ScrollView>

        {!this.state.keyboardOpen&&<View style={{position:'absolute',right:0,bottom:0,left:0,height:45}}>
            <TouchableOpacity onPress={()=>{this.createCoupon()}} style={{alignItems:'center',justifyContent:'center',height:'100%',backgroundColor:themeColor}}>
              <MonoText   style={{color:'#fff',fontSize:18,fontWeight:'700'}}>Create</MonoText>
            </TouchableOpacity>
        </View>
      }
        <Loader
        modalVisible = {this.state.loader}
        animationType="fade"
        />

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
    },backgroundImage: {
        flex: 1,
        borderRadius: 0,
        overflow: 'hidden',
        borderWidth:0,
        marginTop:0,
        resizeMode:'contain',
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

  export default connect(mapStateToProps, mapDispatchToProps)(CreateCoupon);

  // <View style={{paddingTop:15,marginHorizontal:15,}}>
  //   {this.state.product.variant.map((item)=>{
  //     return(
  //       <View>
  //         <MonoText   style={{fontSize:16,fontWeight:'700'}}>{item.displayName}</MonoText>
  //         <View style={{flexDirection:'row'}}>
  //           <View style={{flex:1}}>
  //             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Actual price</MonoText>
  //           </View>
  //           <View style={{flex:1,alignItemsL'flex-end'}}>
  //             <MonoText   style={{fontSize:16,fontWeight:'700'}}>&#8377;{item.sellingPrice}</MonoText>
  //           </View>
  //         </View>
  //         <View style={{flexDirection:'row'}}>
  //           <View style={{flex:1}}>
  //             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Discounted Price</MonoText>
  //           </View>
  //           <View style={{flex:1,alignItemsL'flex-end'}}>
  //             <MonoText   style={{fontSize:16,fontWeight:'700'}}>&#8377;{item.sellingPrice}</MonoText>
  //           </View>
  //         </View>
  //       </View>
  //     )
  //   })}
  // </View>
