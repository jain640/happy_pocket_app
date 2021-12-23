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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,Picker,Keyboard
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
import Loader from '../components/Loader'

const bankType = [ 'saving','current']



class EditBank extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Edit Bank Details',
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

    var bankTyp = props.myStore.bankType
    var bankName = props.myStore.bankName
    var bankaccountNumber = props.myStore.bankaccountNumber
    var accountHolderName = props.myStore.accountHolderName

    if(bankTyp==null) bankTyp = bankType[0];
    if(bankName==null) bankName = props.bankList[0];
    if(bankaccountNumber==null) bankaccountNumber = '';
    if(bankaccountNumber!=null) bankaccountNumber = bankaccountNumber.toString();
    if(accountHolderName!=null) accountHolderName = accountHolderName.toString();

    this.state = {
      store:props.store,
      myStore:props.myStore,
      ifsc:props.myStore.ifsc,
      keyboardOffset:0,
      bankName:bankName,
      bankList:props.bankList,
      bankType:bankTyp,
      bankaccountNumber:bankaccountNumber,
      accountHolderName:accountHolderName,
      keyboardOpen:false,
      saveButtonDisable:false,
      loadingVisible:false,
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

  save=async()=>{
      this.setState({saveButtonDisable:true,loadingVisible:true});
      var csrf = await AsyncStorage.getItem('csrf');
      var pk =  await AsyncStorage.getItem('userpk');
      var sessionid = await AsyncStorage.getItem('sessionid');

      if(this.state.accountHolderName.length==0){
        this.setState({saveButtonDisable:false,loadingVisible:false});
        this.refs.toast.show('Please enter account holder name.');
        return;
      }
      if(this.state.ifsc.length==0){
        this.setState({saveButtonDisable:false,loadingVisible:false});
        this.refs.toast.show('Please enter ifsc number');
        return;
      }



      if(csrf!=null&&sessionid!=null){
      var formdata = new FormData();
      formdata.append("bankaccountNumber",this.state.bankaccountNumber);
      formdata.append("ifsc",this.state.ifsc);
      formdata.append("bankName",this.state.bankName);
      formdata.append("bankType",this.state.bankType);
      formdata.append("accountHolderName",this.state.accountHolderName);

          fetch(SERVER_URL+'/api/POS/store/'+this.state.myStore.pk+'/',{
            method: 'PATCH',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
              "Cookie" :"csrftoken=" +csrf+";sessionid=" + sessionid+";",
              'X-CSRFToken':csrf,
              'Referer': SERVER_URL,
            },
            body: formdata,
          }).then((response)=>{
              return response.json()
          }).then((responseJson)=>{
            this.setState({saveButtonDisable:false,loadingVisible:false});
            console.log(responseJson,'hjkkkkk');
            if(responseJson==undefined){
              return
            }
            this.props.setMyStoreFunction(responseJson,'owner')
            this.props.navigation.goBack()
          }).catch((error) => {
            this.setState({saveButtonDisable:false,loadingVisible:false});
            return
          })
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

  bankNameChanged = (itemValue, itemIndex) => {
     this.setState({bankName:itemValue})
  }
  bankTypeChanged = (itemValue, itemIndex) => {
     this.setState({bankType:itemValue})
  }


  render() {

    var themeColor = this.props.store.themeColor
    var {loadingVisible} = this.state

    let bankListPicker = this.state.bankList.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let bankTypePicker = bankType.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <Loader
          modalVisible = {loadingVisible}
          animationType="fade"
        />
        <ScrollView contentContainerStyle={{paddingBottom: 60}}>
          <View style={{marginBottom:50}}>
            <View style={{marginHorizontal:15,marginVertical:15}}>
                <View style={{flexDirection:'row',marginBottom:5}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Account Holder Name</MonoText>
                    <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                     onChangeText={(accountHolderName) => this.setState({accountHolderName})}
                     value={this.state.accountHolderName}>
                 </TextInput>
            </View>
            <View style={{marginHorizontal:15,marginBottom:15}}>
                <View style={{flexDirection:'row',marginBottom:5}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Account Number</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                     keyboardType='numeric'
                     onChangeText={(bankaccountNumber) => this.setState({bankaccountNumber})}
                     value={this.state.bankaccountNumber}>
                 </TextInput>
            </View>
            <View style={{marginHorizontal:15,marginBottom:15}}>
              <View style={{flexDirection:'row',marginBottom:5}}>
                 <MonoText   style={{fontSize:16,fontWeight:'700'}}>IFSC</MonoText>
                  <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
               </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                     onChangeText={(ifsc) => this.setState({ifsc})}
                     value={this.state.ifsc}>
                 </TextInput>
            </View>
            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Name</MonoText>
                 <View style={{backgroundColor:'#fff',marginTop:10,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}>
                   <Picker
                     selectedValue={this.state.bankName}
                     mode="dropdown"
                     style={{ flex:1,height:40, width:'100%'}}
                     onValueChange={(itemValue, itemIndex)=>this.bankNameChanged(itemValue, itemIndex)}>
                     {bankListPicker}
                   </Picker>
                 </View>
            </View>
            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Type</MonoText>
                 <View style={{backgroundColor:'#fff',marginTop:10,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}>
                   <Picker
                     selectedValue={this.state.bankType}
                     mode="dropdown"
                     style={{ flex:1,height:40, width:'100%',}}
                     onValueChange={(itemValue, itemIndex)=>this.bankTypeChanged(itemValue, itemIndex)}>
                     {bankTypePicker}
                   </Picker>
                </View>
            </View>
          </View>

        </ScrollView>

        {!this.state.keyboardOpen&&
          <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:themeColor,height:40}}>
          <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.save()}} disabled={this.state.saveButtonDisable}>
            <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Update</MonoText>
          </TouchableOpacity>
        </View>
      }

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
      bankList:state.cartItems.bankList,
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

  export default connect(mapStateToProps, mapDispatchToProps)(EditBank);
