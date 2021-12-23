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
import settings from '../constants/Settings.js';
import StoreDisplayCard from '../components/StoreDisplayCard';
import  Constants  from 'expo-constants';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { StackActions, NavigationActions } from 'react-navigation';
import {FontAwesome,Ionicons,MaterialIcons}from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Card ,SearchBar , Icon} from 'react-native-elements';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
import Loader from '../components/Loader';
const SERVER_URL = settings.url
const storeType = settings.storeType

const {width} = Dimensions.get('window');

class RequestForm extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Apartment Request',
      headerStyle: {
        backgroundColor: '#EFA834',
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

  constructor(props) {
    super(props);
    store = this;
    this.state = {
       personName:'',
       personMobile:'',
       appartmentName:'',
       flats:0,
       keyboardOffset:0,
       keyboardOpen:false
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
   )
  }


 checkString=(str)=>{
   if(str.length>0){
     return true
   }else{
     return false
   }
 }



  request=()=>{

     if(!this.checkString(this.state.personName)){
       this.refs.toast.show('Please Fill Name. ')
       return
     }
     if(this.state.personMobile.length!=10){
       this.refs.toast.show('Enter 10 digit Mobile Number. ')
       return
     }
     if(!this.checkString(this.state.appartmentName)){
       this.refs.toast.show('Please Fill Appartment Name. ')
       return
     }
     if(!this.checkString(this.state.flats)){
       this.refs.toast.show('Enter No of Flats. ')
       return
     }
     this.setState({loader:true})
     var data = {
       personName:this.state.personName,
       personMobile:this.state.personMobile,
       appartmentName:this.state.appartmentName,
       flats:this.state.flats
     }
      fetch(SERVER_URL +'/api/POS/sendEmailApartment/',{
        method:'POST',
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
        },
        body:JSON.stringify(data)
      })
       .then((response) =>{console.log(response.status,'ppp');return response.json()})
       .then((responseJson) => {
         // this.refs.toast.show('We will GIVE you A MESSAGE')
         this.setState({loader:false})
         this.props.navigation.state.params.onGoBack()
         this.props.navigation.goBack()
       })
       .catch((error) => {
         this.setState({loader:false})
         this.refs.toast.show('Something went wrong.. ')
      });
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOpen:true,keyboardOffset: event.endCoordinates.height+27,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOpen:false,keyboardOffset: 27,
        })
}


  render() {



      return(
        <View style={{flex:1,backgroundColor: "#fff"}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <ScrollView   contentContainerStyle={{paddingBottom:40,backgroundColor: "#fff"}}>

           <MonoText style={{fontSize:16,margin:15}}>We are happy that you are considering Happy Pockets for your daily needs. Please fill the form below and we will contact you.</MonoText>

            <View style={{marginHorizontal:15,marginVertical:15}}>
                <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Name</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(personName) => this.setState({personName})}  placeholder={'Enter Name'}
                     value={this.state.personName}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Mobile Number</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(personMobile) => this.setState({personMobile})} keyboardType={'numeric'} placeholder={'Enter Mobile No'}
                     value={this.state.personMobile}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Appartment Name</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(appartmentName) => this.setState({appartmentName})} placeholder={'Enter Appartment Name'}
                     value={this.state.appartmentName}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>No of Flats</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(flats) => this.setState({flats})} keyboardType={'numeric'}  placeholder={'No Of Flats'}
                     value={this.state.flats}>
                 </TextInput>
            </View>

          </ScrollView>

          {!this.state.keyboardOpen&&<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#EFA834',height:40}}>
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.request()}} disabled={this.state.saveButtonDisable}>
              <MonoText   style={{fontSize:18,fontWeight:'400',color:'#fff'}}>Send Request</MonoText>
            </TouchableOpacity>
          </View>
        }

          {this.state.loader&&
            <View >
            <Loader
            modalVisible = {this.state.loader}
            animationType="fade"
            />
            </View>
          }

        </View>
      )

    }

}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  }

});

const mapStateToProps =(state) => {
  return {
    store:state.cartItems.store,
    landmark:state.cartItems.landmark,
    selectedLandmark:state.cartItems.selectedLandmark,
    setSelectedStore:state.cartItems.setSelectedStore
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    setStoreFunction:  (args) => dispatch(actions.setStore(args)),
    setSelectedStoreFunction:  (args) => dispatch(actions.setSelectedStore(args)),
    setStoreTypeFunction:  (args) => dispatch(actions.setStoreType(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    setSelectedLandmark:  (landmark) => dispatch(actions.selectedLandmark(landmark)),
    setServerParamsFunction:  (masterStore,unitTypes,bankList) => dispatch(actions.setServerParams(masterStore,unitTypes,bankList)),
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address)),
    removeSelectedAddressFunction:()=>dispatch(actions.removeSelectedAddress()),

  };
}


export default connect(mapStateToProps, mapDispatchToProps)(RequestForm);
