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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,Button,ToastAndroid,ActivityIndicator,TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import  Constants  from 'expo-constants';
import { Card,CheckBox } from 'react-native-elements';
import Modal from "react-native-modal";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { RadioButton } from 'react-native-paper';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const storeType = settings.storeType
const apartment =[
  {
  country:"India",
  city:"Bengaluru",
  landmark:'Mantri Alpyne',
  state:'Karnataka',
  pincode:'560061',
  },
  {
  country:"India",
  city:"Bengaluru",
  landmark:'Apartment 1',
  state:'Karnataka',
  pincode:'560063',
  },
  {
  country:"India",
  city:"Bengaluru",
  landmark:'Apartment 2',
  state:'Karnataka',
  pincode:'560064',
  },
  {
  country:"India",
  city:"Bengaluru",
  landmark:'Apartment 3',
  state:'Karnataka',
  pincode:'560065',
  },
]

const timeSlot = ['8am-9am','9am-10am','10am-11am','11am-12am','12am-1pm','1pm-2pm','2pm-3pm','3pm-4pm','4pm-5pm','5pm-6pm','6pm-7pm','7pm-8pm','8pm-9pm','9pm-10pm',]

class AddressScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'My Address',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
      },
      headerTintColor: '#fff',
      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerRight: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end',alignItems:'center' }}>
          <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => params.searchoption()}  >
          <MonoText   style={{ fontSize:20,color:"#fff",fontWeight:'700'}}><FontAwesome name="plus" size={16} color="#fff" /> Add </MonoText>
         </TouchableOpacity>
        </View>
      ),

  };
}




  constructor(props){
    super(props);
    this.state = {
      address:[],
      open : false,
      offset:0,
      modalVisible: false,
      houseNumber : "",
      Society : '',
      label : apartment.name,
      pincode : '',
      city : '',
      state : '',
      sessionid:'',
      userpk:null,
      editPk:null,
      deleteModal:false,
      checked:true,
      csrf:'',
      loader:true,
      addressSelected:this.props.selectedAddress,
      isNewAddress:false,
      isAddressEditing: false,
      created:{},
      store:this.props.store,
      landmarkList:[],
      selectedLandmark:null,
      selectedLandmarkIndex:null,
      selectedLandmarkValue:null,
      selectedLandmarkPincode:null,
      selectedStore:this.props.selectedStore,
      landmarkFullList:[],
      storeType:settings.storeType,
      selectedLand:props.selectedLandmark,
      timeSlot:null,
      timeSlots:null,
    }
    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
         this.setConnection()
         }
    );

  }

  setConnection=()=>{
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
  }

  setModalVisible(visible) {
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }
    this.setState({modalVisible: visible});
  }

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  addressAsync =async () => {
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf})
      if(storeType=='MULTI-OUTLET'){
        var url = SERVER_URL + '/api/POS/address/?user='+ userToken+'&landMarkAddress='+this.state.selectedLand.pk
      }else{
        var url = SERVER_URL + '/api/POS/address/?user='+ userToken+'&store='+this.state.selectedStore.pk
      }
      if(userToken !== null ){
        fetch(url , {
          headers: {
            "Cookie" :"csrftoken="+this.state.csrf+"sessionid=" + this.state.sessionid +";",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Referer': SERVER_URL,
            'X-CSRFToken': this.state.csrf
          },
          method: 'GET'
          })
          .then((response) =>{
            return response.json()
          } )
          .then((responseJson) => {
            responseJson.forEach((i)=>{
              if(this.state.addressSelected.pk==i.pk){
                i.show=true;
              }else{
                i.show=false;
              }
            })
            this.setState({ address: responseJson,loader:false})

          })
          .catch((error) => {
            return
          });
      }
    }catch(error){
      return
    }

  };

  getLandMark= async()=>{
    if(this.state.selectedLand!=null){
    fetch(SERVER_URL + '/api/POS/landmark/'+this.state.selectedLand.pk+'/' , {
      headers: {
        "Cookie" :"csrftoken="+this.state.csrf+"sessionid=" + this.state.sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': this.state.csrf
      },
      method: 'GET'
      })
      .then((response) =>{
        return response.json()
      } )
      .then((responseJson) => {
        console.log(responseJson,'llll');
        if(responseJson==undefined){
          return
        }
        // var timeSlots = responseJson.timeSlots.split('||')
        // this.setState({timeSlots:timeSlots,timeSlot:timeSlots[0]})
        var apartMentList = []
        apartMentList.push({label:responseJson.landmark,value:responseJson.landmark,pincode:responseJson.pincode,city:responseJson.city,country:responseJson.country,state:responseJson.state,pk:responseJson.pk})
        this.setState({landmarkFullList:apartMentList})
        // var apartMentList = responseJson.map((i)=>{
        //   return {label:i.landmark,value:i.landmark,pincode:i.pincode,city:i.city,country:i.country,state:i.state,pk:i.pk}
        // })
        if(apartMentList.length>0){
          this.setState({landmarkList:apartMentList,selectedLandmark:responseJson,selectedLandmarkIndex:0,selectedLandmarkValue:apartMentList[0].value,selectedLandmarkPincode:responseJson.pincode.toString()})
        }else{
          this.setState({landmarkList:[]})
        }
      })
      .catch((error) => {
        return
      });
    }
  }
  handleConnectivityChange=(state)=>{
    if(state.isConnected){
       this.setState({connectionStatus : true})
       this.addressAsync();
       this.getLandMark()
    }else{
      this.setState({connectionStatus : false})
    }
  }

  componentWillUnmount=()=>{
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  componentDidMount() {



    // var apartMentList = apartment.map((i)=>{
    //   return {label:i.landmark,value:i.landmark,pincode:i.pincode,city:i.city,country:i.country,state:i.state}
    // })
    // this.setState({landmarkList:apartMentList,selectedLandmark:apartment[0],selectedLandmarkIndex:0,selectedLandmarkValue:apartMentList[0].value,selectedLandmarkPincode:apartment[0].pincode.toString()})

    this.props.navigation.setParams({
      searchoption: this.search,
      goBack:this.checkout,
      themeColor:this.state.store.themeColor
    });
    var profileScreen = this.props.navigation.getParam('from',null)
    if(profileScreen != null){
      this.setState({profile:true})
    }
  }

  componentDidUpdate(prevProps){
      if(prevProps.selectedAddress !== this.props.selectedAddress) {
        this.setState({addressSelected: this.props.selectedAddress});
      }
  }

  checkout = () => {
     this.props.navigation.goBack()
  }
  search = () => {
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }
     this.setState({modalVisible: true,editPk:null,houseNumber:'',Society:'',pincode:'',isNewAddress:true,city:'',state:''})
  }




  pincodeChanged = (pincode)=>{
    if(!this.state.connectionStatus){
      this.showNoInternet()
      return
    }
      if(pincode.length ==6){
        this.setState({state:'',city:''})
      fetch(SERVER_URL + '/api/POS/genericPincode/?pincode=' + pincode)
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ state: responseJson[0].state , city : responseJson[0].city})
        })
        .catch((error) => {
          return
        });
      }
      this.setState({pincode:pincode})
  }

  logout=()=>{
    try {
       AsyncStorage.removeItem('userpk')
       AsyncStorage.setItem("login", JSON.stringify(false))
       this.setState({userScreen:'LogInScreen'})
     } catch (error) {
       return
     }
  }

  order =async() =>{

    var user = await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');

    console.log(csrf,sessionid,'jfidnnd');
    // if (this.state.houseNumber.length == 0  || this.state.pincode.length == 0 || this.state.Society.length == 0 ) {
    //   this.refs.toast.show('Please provide delivery address ');
    //   ToastAndroid.show('Please provide delivery address ', ToastAndroid.SHORT);
    //   return;
    // }
    console.log(csrf,sessionid,'pcdwbvjdvkfnnkfv');
    if (this.state.houseNumber.length == 0  ) {
      this.refs.toast.show('Please provide delivery address ');
      return;
    }

      var method,url,editAddress;
      if(this.state.editPk == null){
        method = "POST"
        url = SERVER_URL + '/api/POS/address/'
        editAddress = true
      }else{
        method = "PATCH"
        url = SERVER_URL + '/api/POS/address/'+ this.state.editPk +'/'
        editAddress = this.state.editAddress.primary
      }


      if(this.state.storeType=='MULTI-OUTLET'){
        var city = this.state.landmarkList[this.state.selectedLandmarkIndex].city
        var state = this.state.landmarkList[this.state.selectedLandmarkIndex].state
        var pincode = this.state.landmarkList[this.state.selectedLandmarkIndex].pincode
        var country = this.state.landmarkList[this.state.selectedLandmarkIndex].country
        var landmark = this.state.landmarkList[this.state.selectedLandmarkIndex].value
        var landMarkAddress = this.state.landmarkList[this.state.selectedLandmarkIndex].pk

      }else{
        var city = this.state.city
        var state = this.state.state
        var pincode = this.state.pincode
        var country = 'India'
        var landmark = this.state.Society
        var landMarkAddress = null
        if(pincode.length!=6){
          this.refs.toast.show('Pincode should contain 6 numbers.');
          return
        }
        if(state.length==0){
          this.refs.toast.show('Enter Correct Pincode');
          return
        }
        if(city.length==0){
          this.refs.toast.show('Enter Correct Pincode');
          return
        }
      }

      var content = {
        billingCity	:'',
        billingCountry:'',
        billingLandMark	:'',
        billingPincode:0,
        billingState:'',
        billingStreet	:'',
        sameAsShipping:true,
        street:this.state.houseNumber ,
        city:city,
        state:state,
        pincode:pincode,
        country:country,
        mobileNo:null,
        landMark:landmark,
        title:"Address",
        primary:editAddress,
        store:this.state.selectedStore.pk,
        landMarkAddress:landMarkAddress
      }


      fetch(url, {
        headers: {
          "Cookie" :"csrftoken="+ csrf +";sessionid=" + sessionid + ";" ,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': csrf
        },
        method: method,
        body: JSON.stringify(content)
      })
      .then((response) =>{
        return response.json()
      })
      .then((responseJson) => {
        console.log(responseJson,'rrrrrrrrrrrrrrrrrrrrrrrr');
        this.addressAsync()
        this.setModalVisible(!this.state.modalVisible)
        this.setState({created:responseJson})
        this.selectAddress(responseJson.pk,true)

      })
      .catch((error) => {
        return
      });
  }



    edit =(item)=>{

      // fetch(SERVER_URL + '/api/POS/genericPincode/?pincode__iexact=' + item.pincode)
      //   .then((response) => {
      //     return response.json()
      //   })
      //   .then((responseJson) => {
      //     this.setState({ state: responseJson[0].state , city : responseJson[0].city})
      //     this.setState({modalVisible: true,editPk:item.pk,houseNumber:item.street,Society:item.landMark, pincode: item.pincode +'' ,editAddress:item})
      //   })
      //   .catch((error) => {
      //     this.setState({modalVisible: true,editPk:item.pk,houseNumber:item.street,Society:item.landMark, pincode: item.pincode +'' ,editAddress:item})
      //   });
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }
      this.setState({modalVisible: true,editPk:item.pk,houseNumber:item.street,Society:item.landMark, pincode: item.pincode +'' ,editAddress:item,state: item.state , city : item.city})


    }
    Submit(){

    }
    delete =(pk)=>{
      console.log(pk,'ocidsbvfb');
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }
      var primary = false
      for (var i = 0; i < this.state.address.length; i++) {
        if(pk == this.state.address[i].pk && this.state.address[i].primary == true){
          primary = true
        }
      }
      var url = SERVER_URL + '/api/POS/address/'+ pk +'/'
      new Promise((resolve, reject) => {
          Alert.alert(
              'Confirm',
              'Are you sure?',
              [
                  {text: "Yes", onPress: () => {
                    fetch(url, {
                      headers: {
                        "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid + ";" ,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Referer': SERVER_URL,
                        'X-CSRFToken': this.state.csrf
                      },
                      method: 'DELETE',
                    })
                    .then((response) =>{
                      console.log(response.status,'ocidsbvfb');
                      return response.text()
                    })
                    .then((responseJson) => {
                      if(primary == true){
                        this.props.selectedAddressFunction({})
                      }
                      this.addressAsync()
                    })
                    .catch((error) => {
                      return
                    });

                   } },
                   {
                     text: 'No',
                     onPress: () => {return},
                     style: 'cancel',
                   },
              ],
              { cancelable: false }
          )
      })
    }

    changeSelected(pk,index){
      // this.selectAddress(pk,false)
      this.changePrimary(pk,index)
    }

    changePrimary(pk,index){
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }

      for (var i = 0; i < this.state.address.length; i++) {
        if(pk == this.state.address[i].pk){
          var primary = !this.state.address[i].primary
          this.state.address[i].primary = !this.state.address[i].primary
        }else{
          this.state.address[i].primary = false
        }

      }
      var url = SERVER_URL + '/api/POS/address/'+ pk +'/'
      var sendData = JSON.stringify({
        primary:true,
        billingCity:'',
        billingLandMark:'',
        billingCountry:'',
        billingPincode:0,
        billingState:'',
        billingStreet:'',
        country:this.state.address[index].country,
        landMark:this.state.address[index].landMark,
        city:this.state.address[index].city,
        pincode:this.state.address[index].pincode,
        mobileNo:this.state.address[index].mobileNo,
        street:this.state.address[index].street ,
        state:this.state.address[index].state,
        title:'Address',
        sameAsShipping:true,
        pk:pk,


       })
      this.setState({address:this.state.address})
      fetch(url, {
        headers: {
          "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': this.state.csrf
        },
        body: sendData,
        method: 'PATCH',
      })
      .then((response) =>{
        return response.json()
      })
      .then((responseJson) => {
        if(responseJson == undefined){
          this.refs.toast.show('Some thing went wrong! ');
          // ToastAndroid.show('Some thing went wrong! ', ToastAndroid.SHORT);
          return;
        }
        this.addressAsync()
        this.selectAddress(responseJson.pk,false)
      })
      .catch((error) => {
        this.refs.toast.show('Some thing went wrong! ');
        // ToastAndroid.show('Some thing went wrong! ', ToastAndroid.SHORT);
        return;
      });
    }

    selectAddress(pk,value){
      var profileScreen = this.props.navigation.getParam('from',null)
      var checkout = this.props.navigation.getParam('checkout',null)
      // return
      // if(profileScreen != null){
      //   return
      // }
      if(value == true){
        this.props.selectedAddressFunction(this.state.created)
        var landmark = null
        this.state.landmarkFullList.forEach((i)=>{
          if(this.state.created.landMarkAddress == i.pk){
            // this.props.selectedLandmarkFunction(i)
          }
        })

        var address = this.state.address
        address.forEach((i)=>{
          if(i.pk == this.state.created.pk){
            i.show = true
          }else{
            i.show = false
          }
        })
        if(checkout==true){
          this.props.navigation.navigate('Home')
          return
        }
        this.setState({address:arr})
      }
      var selected;
      var arr = this.state.address
      for (var i = 0; i < arr.length; i++) {
        arr[i].show = false
        if(arr[i].pk == pk){
          selected = arr[i]
          this.props.selectedAddressFunction(selected)
          var landmark = null
          this.state.landmarkFullList.forEach((i)=>{
            if(selected.landMarkAddress == i.pk){
              // this.props.selectedLandmarkFunction(i)
            }
          })
          arr[i].show = true
          if(checkout==true){
            this.props.navigation.navigate('Home')
            return
          }
        }
      }
      this.setState({address:arr})
      // this.props.selectedAddressFunction({})
      // if(checkout==true){
      //   this.props.navigation.navigate('Home')
      //   return
      // }


    }

    changeTimeSlot=(value,idx)=>{
      this.setState({timeSlot:value})
    }

    change=(value,idx)=>{
      this.setState({selectedLandmark:this.state.landmarkList[idx],selectedLandmarkIndex:idx,selectedLandmarkValue:value,selectedLandmarkPincode:this.state.landmarkList[idx].pincode.toString()})
      // this.props.selectedLandmarkFunction(this.state.landmarkFullList[idx])
    }


    render() {
      const { navigation } = this.props;
      var themeColor = this.props.store.themeColor
      if(this.state.timeSlots!=null){
        var timeSlots = this.state.timeSlots.map((i)=>{
          return {label:i,value:i}
        })
      }else{
        var timeSlots = null
      }

      const color = navigation.getParam('color','#000')
      if(this.state.loader == true){
        return (
          <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          {this.state.connectionStatus==undefined?
          (<ActivityIndicator size="large" color={themeColor} />):(!this.state.connectionStatus?<MonoText   style={{ fontSize:16,color:'#000',fontWeight:'700'}}>No Internet Connection</MonoText> :<MonoText></MonoText> )}

          </View>
        )
      }

      else{

        if(this.state.isNewAddress && !this.state.isAddressEditing&&this.state.quickadd){
          this.state.Society = "Mantri Alpyne";
          this.state.pincode = "560061";
        }
      return (
        <View style={[styles.container,{backgroundColor:color}]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>this.setState({modalVisible:false})} >
          <View style={styles.modalView}>
          {this.state.store.quickadd &&
          <Fumi
              label={'Block & Door No'}
              iconClass={FontAwesomeIcon}
              iconName={'home'}
              iconColor={themeColor}
              iconSize={20}
              iconWidth={40}
              inputPadding={16}
              value = {this.state.houseNumber}
              onChangeText={(text) => { this.setState({houseNumber: text}) }}


            />
          }

            {this.state.store.quickadd&&this.state.landmarkList.length>1&&
              <View style={{flexDirection:'row'}}>
                <View style={{flex:0.17,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2'}}>
                  <FontAwesome name="building" size={20} color={themeColor} />
                </View>
                <View style={{flex:0.83}}>
                  <MonoText   style={{ color:'#c2c2c2',fontSize:12,fontWeight:'700',paddingLeft:6,}}>Apartment Name</MonoText>
                  <Dropdown
                   data={this.state.landmarkList}
                   onChangeText={(itemValue, itemIndex)=>{this.change(itemValue,itemIndex)}}
                   containerStyle={{
                     height:30,
                     borderWidth:0
                   }}
                   textColor={themeColor}
                   inputContainerStyle={{
                     height:30,paddingLeft:6, width: '100%',  paddingTop:-10, borderWidth: 0,backgroundColor:'#ffffff',borderBottomColor: 'transparent',paddingRight:5
                   }}
                   value={this.state.selectedLandmarkValue}
                  pickerStyle={{borderWidth:0,width:width-((2*(width*0.05))+40) ,}}
                 />
                </View>
               </View>
             }
            {this.state.store.quickadd&&this.state.landmarkList.length==1&&
              <Fumi
                  label={'Apartment Name'}
                  iconClass={FontAwesomeIcon}
                  iconName={'building'}
                  iconColor={themeColor}
                  iconSize={20}
                  iconWidth={40}
                  value = {this.state.selectedLandmarkValue}
                  inputPadding={16}
                  editable={false}
                />
             }

               <View>
               {this.state.store.quickadd&&this.state.landmarkList.length==0&&
                 <Fumi
                     label={'Apartment Name'}
                     iconClass={FontAwesomeIcon}
                     iconName={'building'}
                     iconColor={themeColor}
                     iconSize={20}
                     iconWidth={40}
                     value = {(this.state.isNewAddress && !this.state.isAddressEditing)? "Mantri Alpyne" :this.state.Society}
                     inputPadding={16}
                     onChangeText={(text) => {
                       this.setState({isAddressEditing:true})
                       this.setState({Society:text})
                     }
                      }


                   />
               }
               </View>
            {this.state.store.quickadd&&
              <Fumi
                label={'Pincode'}
                iconClass={FontAwesomeIcon}
                iconName={'map-marker'}
                iconColor={themeColor}
                iconSize={20}
                iconWidth={40}
                inputPadding={16}
                value = { this.state.selectedLandmarkPincode }
                editable={this.state.landmarkList.length>0?false:true}
                onChangeText={(text) => {
                  // this.setState({isAddressEditing:true})
                  // this.pincodeChanged(text)
                }}
                keyboardType='numeric'
              />
            }

            {!this.state.store.quickadd&&
              <View>
              <Fumi
                  label={'Street'}
                  iconClass={FontAwesomeIcon}
                  iconName={'home'}
                  iconColor={themeColor}
                  iconSize={20}
                  iconWidth={40}
                  value = {this.state.houseNumber}
                  inputPadding={16}
                  onChangeText={(text) => {
                    this.setState({isAddressEditing:true})
                    this.setState({houseNumber:text})
                  }
                   }
                />
              <Fumi
                  label={'LandMark'}
                  iconClass={FontAwesomeIcon}
                  iconName={'building'}
                  iconColor={themeColor}
                  iconSize={20}
                  iconWidth={40}
                  value = {this.state.Society}
                  inputPadding={16}
                  onChangeText={(text) => {
                    this.setState({isAddressEditing:true})
                    this.setState({Society:text})
                  }
                   }
                />

                <Fumi
                  label={'Pincode'}
                  iconClass={FontAwesomeIcon}
                  iconName={'map-marker'}
                  iconColor={themeColor}
                  iconSize={20}
                  iconWidth={40}
                  inputPadding={16}
                  value = {this.state.pincode }
                  onChangeText={(text) => {
                    this.setState({isAddressEditing:true})
                    this.pincodeChanged(text)
                    // this.setState({pincode:text})
                  }}
                  keyboardType='numeric'
                />
              </View>
            }

          <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding:0,margin:0,marginTop: 20,}}>
            <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => {
              this.setModalVisible(!this.state.modalVisible);}}>
               <View  style={{alignSelf:'center',}}>
                 <MonoText   style={{ color:"#000",fontSize:17,paddingVertical:8}}>Back</MonoText>
               </View>
            </TouchableOpacity>
             <TouchableOpacity  style={{flex: 1,backgroundColor:themeColor,borderWidth:1,borderColor:themeColor}}  onPress={this.order}>
               <View style={{alignSelf:'center',}}>
                 <MonoText   style={{ color:"#fff",fontSize:17,paddingVertical:8}}>Submit</MonoText>
               </View>
             </TouchableOpacity>
            </View>
          </View>
        </Modal>

          <ScrollView style={{backgroundColor:'#fff',}}>
          <FlatList style={{backgroundColor:'#fff',width:width,flexWrap:'nowrap',marginBottom:0,paddingBottom:30}} contentContainerStyle={{paddingBottom:30}}
            data={this.state.address}
            extraData={this.state.primaryPk}
            keyExtractor={(item,index) => {
              return item.pk.toString();
            }}
            renderItem={({item, index, separators}) => (
              <TouchableWithoutFeedback style={{flex:1,}} onPress={()=>{this.changeSelected(item.pk,index)}}>
              <View style={styles.item} >

              <Card  containerStyle={[styles.shadow, {  borderWidth: 1,borderColor: '#fff',borderRadius: 7, marginTop: 15,marginBottom: 3  }]}>

                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                    <MonoText   style={{ }}>Block & Door No: {item.street}</MonoText>
                  </View>
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <MonoText   style={{textAlign:'right' }}>City: {item.city}</MonoText>
                  </View>
                </View>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                    <MonoText   style={{ }}>{storeType=='MULTI-OUTLET'?'Apartment':'LandMark'} : {item.landMark}</MonoText>
                  </View>
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <MonoText   style={{ textAlign:'right' }}>State: {item.state}</MonoText>
                  </View>
                </View>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                    <MonoText   style={{ }}>PinCode: {item.pincode}</MonoText>
                  </View>
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <MonoText   style={{textAlign:'right'  }}>Country: {item.country}</MonoText>
                  </View>
                </View>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginTop:5}}>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:5}}>
                  { Platform.OS === 'ios' &&
                  <CheckBox

                           checkedIcon={<Image source={ require('../assets/images/checkedB.png') } style={{height:20,width:20}} />}
                           uncheckedIcon={<Image source={require('../assets/images/uncheckedB.png')} style={{height:20,width:20}} />}
                          checked={this.state.checked== item.primary ? true:false}
                          onPress={() => this.setState({checked: !this.state.checked})}
                          checkedColor='green'
                          containerStyle={{backgroundColor:'transparent',borderWidth:0}}
                          />
                }{ Platform.OS === 'android' &&
                  <RadioButton
                    value={item.primary}
                    status={this.state.checked == item.primary ? 'checked' : 'unchecked'}
                    onPress={() =>this.changeSelected(item.pk,index) }
                  />}

                  { this.state.profile && item.primary && <MonoText   style={{ color:'grey',fontSize:14,}}>Default</MonoText> }
                  { !this.state.profile &&  <MonoText   style={{ color:'grey',fontSize:14,}}>Select</MonoText> }

                </View>

                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginTop:5}}></View>
                  <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}} onPress={()=>{this.edit(item)}}>
                  <FontAwesome name="pencil" size={14} color="#868686"  />
                  <MonoText   style={{color:'#868686',fontSize:16,marginLeft:5}}>Edit</MonoText>
                   </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.delete(item.pk)}} style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
                  <FontAwesome name="remove" size={14} color="#f95a25"  />
                  <MonoText   style={{ fontSize:16,marginLeft:5,color:"#f95a25"}}>Delete</MonoText>
                  </TouchableOpacity>
                </View>
              </Card>

            </View>
            </TouchableWithoutFeedback >

            )}
          />



          </ScrollView>
        </View>

        );
      }
    }
}

const mapStateToProps =(state) => {
    return {
      selectedAddress : state.cartItems.selectedAddress,
      store:state.cartItems.store,
      selectedStore:state.cartItems.selectedStore,
      selectedLandmark:state.cartItems.selectedLandmark,
    }
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address)),
    selectedLandmarkFunction:(landmark)=>dispatch(actions.selectedLandmark(landmark)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressScreen);

  // /home/cioc/react-native-monomerce/img/g5829.png
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
      shadowRadius: 0.84,
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

 },

 modalView: {
    backgroundColor: '#fff',
    marginHorizontal: width*0.05 ,
    borderRadius:5,
   },




  });


  // {storeType=="MULTI-OUTLET"&&timeSlots!=null&&
  // <View style={{flexDirection:'row',marginTop:10}}>
  //   <View style={{flex:0.17,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2'}}>
  //     <FontAwesome name="clock-o" size={20} color={themeColor} />
  //   </View>
  //   <View style={{flex:0.83}}>
  //     <MonoText   style={{ color:'#c2c2c2',fontSize:12,fontWeight:'700',paddingLeft:6,}}>Time Slot</MonoText>
  //     <Dropdown
  //      data={timeSlots}
  //      onChangeText={(itemValue, itemIndex)=>{this.changeTimeSlot(itemValue,itemIndex)}}
  //      containerStyle={{
  //        height:30,
  //        borderWidth:0
  //      }}
  //      textColor={themeColor}
  //      inputContainerStyle={{
  //        height:30,paddingLeft:6, width: '100%',  paddingTop:-10, borderWidth: 0,backgroundColor:'#ffffff',borderBottomColor: 'transparent',paddingRight:5
  //      }}
  //      value={this.state.timeSlot}
  //     pickerStyle={{borderWidth:0,width:width-((2*(width*0.05))+40) ,}}
  //    />
  //   </View>
  //  </View>
  //
  // }
