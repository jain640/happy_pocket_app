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
import {FontAwesome,Ionicons,MaterialIcons,SimpleLineIcons}from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Card ,SearchBar , Icon} from 'react-native-elements';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
import Loader from '../components/Loader';
import DatePicker from 'react-native-datepicker';
const SERVER_URL = settings.url
const storeType = settings.storeType
import moment from 'moment'

const {width} = Dimensions.get('window');

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

class RequestPost extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Request',
      headerStyle: {
        backgroundColor:params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
           <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
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

  constructor(props) {
    super(props);
    store = this;
    this.state = {
       name:'',
       mobile:'',
       date:moment(new Date()).format('YYYY-MM-DD'),
       unit:props.unitTypes[0],
       qty:0,
       description:'',
       category:'',
       product:'',
       keyboardOffset:0,
       keyboardOpen:false,
       store:props.store,
       unitTypes:props.unitTypes,
       dropDownCategory:[],
       targetAmount:0,
       location:''
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

 setFirst=()=>{
   this.setState({
    name:'',
   mobile:'',
   date:new Date(),
   qty:0,
   description:'',
   category:'',
   product:'',
   location:'',
   targetAmount:0
 })
 }

 getDropDownCategory=()=>{
   fetch(SERVER_URL + '/api/POS/categorysortlist/?store='+this.state.store.pk)
     .then((response) => response.json())
     .then((responseJson) => {
       this.setState({ dropDownCategory: responseJson })
     })
     .catch((error) => {
       return
     });
 }

 componentDidMount=()=>{
   this.props.navigation.setParams({
     themeColor: this.state.store.themeColor,
   });
   this.getDropDownCategory()
 }


  request=()=>{



     if(!this.checkString(this.state.product)){
       this.refs.toast.show('Please Fill Product Name. ')
       return
     }
     if(!this.checkString(this.state.description)){
       this.refs.toast.show('Enter Description ')
       return
     }
     if(!this.checkString(this.state.targetAmount)){
       this.refs.toast.show('Enter Target Amount ')
       return
     }
     if(!this.checkString(this.state.qty)){
       this.refs.toast.show('Enter qty ')
       return
     }
     if(!this.checkString(this.state.name)){
       this.refs.toast.show('Please Fill Name. ')
       return
     }

     if(this.state.mobile.length!=10){
       this.refs.toast.show('Enter 10 digit Mobile Number. ')
       return
     }
     if(!this.checkString(this.state.location)){
       this.refs.toast.show('Please Fill Location. ')
       return
     }
     this.setState({loader:true})
     var date = this.state.date
     var data = {
       Name:this.state.name,
       mobile:this.state.mobile,
       product:this.state.product,
       description:this.state.description,
       qty:this.state.qty,
       unit:this.state.unit,
       date:date,
       category:this.state.category,
       location:this.state.location,
       targetAmount:this.state.targetAmount,
     }
     console.log(data,'hhhhhhhhh');
     // return
      fetch(SERVER_URL +'/api/POS/sendProductRequestEmail/',{
        method:'POST',
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
        },
        body:JSON.stringify(data)
      })
       .then((response) =>{
         console.log(response.status,'ppp');
         if(response.status=='200'||response.status==200){
           this.refs.toast.show('Request Sucessfully Posted.')
           this.setState({loader:false,})
           this.setFirst()
         }
       })
       .then((responseJson) => {
          return
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

dropDownChanged = (itemValue, itemIndex) => {
  this.setState({ unit:itemValue})
}

dropDownCategory = (itemValue, itemIndex) => {
  this.setState({ category:itemValue})
}


  render() {

     var themeColor = this.state.store.themeColor

     let varientChoicesText = this.state.unitTypes.map( (s, i) => {
       return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
     });

     let dropDownCategory = this.state.dropDownCategory.map( (s, i) => {
       var name = entities.decode(s.name)
       return <Picker.Item key={i} value={name} label={name}  ></Picker.Item>
     });

      return(
        <View style={{flex:1,backgroundColor: "#fff"}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <ScrollView   contentContainerStyle={{paddingBottom:45,backgroundColor: "#fff"}}>

           {/*<MonoText style={{fontSize:18,fontWeight:'700',marginTop:15,marginHorizontal:15}}>Tell suppliers what you need</MonoText>
           <MonoText style={{fontSize:16,marginTop:15,marginHorizontal:15}}>The more specific your information, the faster response you will get.</MonoText>*/}

            <View style={{marginHorizontal:15,marginVertical:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Product Name</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(product) => this.setState({product})}  placeholder={'Name of the Product '}
                     value={this.state.product}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
              <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Category Name</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
              </View>
              <View style={{width: "100%",height:40,marginTop:5 ,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:'#fff' }}>
                <Picker
                  selectedValue={this.state.category}
                  mode="dropdown"
                  style={{ width: "100%",height:26 ,}}
                  itemStyle={{marginVertical:0,paddingVertical:0}}
                  onValueChange={(itemValue, itemIndex)=>this.dropDownCategory(itemValue, itemIndex)}>
                  {dropDownCategory}
                </Picker>
              </View>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Product Description</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5,textAlignVertical:'top'}}
                     onChangeText={(description) => this.setState({description})}  placeholder={'Write Description'} multiline={true} numberOfLines={3}
                     value={this.state.description}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Target Amount</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(targetAmount) => this.setState({targetAmount})} keyboardType={'numeric'} placeholder={'Target Amount'}
                     value={this.state.targetAmount}>
                 </TextInput>
            </View>
            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Purchase Quantity</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(qty) => this.setState({qty})} keyboardType={'numeric'} placeholder={'Purchase Quantity'}
                     value={this.state.qty}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
              <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Unit Type</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
              </View>
              <View style={{width: "100%",height:40,marginTop:5 ,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:'#fff' }}>
                <Picker
                  selectedValue={this.state.unit}
                  mode="dropdown"
                  style={{ width: "100%",height:26 ,}}
                  itemStyle={{marginVertical:0,paddingVertical:0}}
                  onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                  {varientChoicesText}
                </Picker>
              </View>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
              <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Valid To</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
              </View>
              <View style={{width: "100%",height:40,backgroundColor:'#fff' }}>
                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={{flex:0.2,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:1,borderRightWidth:0,borderColor:'#f2f2f2',borderRadius:0}}>
                      <FontAwesome name="calendar" size={17} />
                   </View>
                  <View style={{flex:0.8,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:0,borderColor:'#f2f2f2',borderRadius:0,marginRight:5}}>
                    <DatePicker
                      style={{padding:0,margin:0,alignItems:'center',justifyContent:'center',width:'100%' }}
                      date={this.state.date}
                      mode="date"
                      placeholder="select date"
                      format="YYYY-MM-DD"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      showIcon={false}
                      iconComponent={
                         <FontAwesome
                             size={20}
                             color='#1a689a'
                             name='calendar'
                         />
                       }
                      customStyles={{
                        dateInput: {padding:0,margin:0,backgroundColor:'#fff',borderWidth:1,height:40,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,  }
                      }}
                      onDateChange={date => {
                        this.setState({ date: date });
                      }}
                    />
                  </View>
               </View>
              </View>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Requestor Name</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(name) => this.setState({name})} placeholder={'Requestor Name'}
                     value={this.state.name}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Mobile No</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(mobile) => this.setState({mobile})} keyboardType={'numeric'}  placeholder={'Mobile No'}
                     value={this.state.mobile}>
                 </TextInput>
            </View>

            <View style={{marginHorizontal:15,marginBottom:15}}>
                 <View style={{flexDirection:'row'}}>
                   <MonoText   style={{fontSize:16,fontWeight:'700'}}>Location</MonoText>
                   <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                 <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                     onChangeText={(location) => this.setState({location})} placeholder={'Requestor Name'}
                     value={this.state.location}>
                 </TextInput>
            </View>

          </ScrollView>

          {!this.state.keyboardOpen&&<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:themeColor,height:40}}>
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.request()}} >
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
    setSelectedStore:state.cartItems.setSelectedStore,
    unitTypes:state.cartItems.unitTypes
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


export default connect(mapStateToProps, mapDispatchToProps)(RequestPost);
