import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import ImageOverlay from "react-native-image-overlay";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi,Hoshi } from 'react-native-textinput-effects';
import { RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor =  settings.themeColor
import Toast, {DURATION} from 'react-native-easy-toast';
import Modal from "react-native-modal";
const { width } = Dimensions.get('window');
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from '../components/StyledText';

class SupportScreen extends React.Component {


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Support',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerTintColor: '#fff',
    }
  };
  constructor(props){
    super(props);
    this.state = {
      orderList:[],
      loader:true,
      userpk:'',
      sessionid:'',
      email:'',
      mobile:'9769484219',
      callNumber:'9769484219',
      csrf:'',
      modalVisible:false,
      feedbackEmail:'',
      feedbackSubject:'',
      feedback:'',
      isFeedbackEmail:true,
      isFeedbackSubject:false,
      isFeedback:false,
      store:props.store
    }


  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  getOrderAsync = async () => {

    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userpk:userToken,sessionid:sessionid,csrf:csrf})

      await fetch(SERVER_URL + '/api/POS/getMasterStore/' , {
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': csrf
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          this.setState({email:responseJson.masterStore.email,mobile:responseJson.masterStore.mobile,loader:false})
        })
        .catch((error) => {

        });




    } catch (error) {
      return
    }
  };



  componentDidMount() {
    this.props.navigation.setParams({
      themeColor: this.state.store.themeColor,
    });
    this.getOrderAsync()
  }

  call(){
    this.refs.toast.show('Call back request sent!');
    fetch(SERVER_URL + '/api/ecommerce/sendmessage/' , {
      headers: {
        "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': this.state.csrf
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        return
      })
      .catch((error) => {
        return
      });
  }


submitFeedback=()=>{

  var sendData = {
    email:this.state.feedbackEmail,
    mobile:this.state.mobile,
    message:this.state.feedback,
    subject:this.state.feedbackSubject,
  }

  fetch(SERVER_URL + '/api/ecommerce/supportFeed/', {
    headers: {
      "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL,
      'X-CSRFToken': this.state.csrf
    },
    method: 'POST',
    body: JSON.stringify(sendData),
  }).then((response) =>{
    return response.json()
  })
    .then((responseJson) => {
      this.setModalVisible(!this.state.modalVisible);
      return
    })
    .catch((error) => {
      this.setModalVisible(!this.state.modalVisible);
      return
    });
}


varifyFeedbackForm = () =>{
  if(this.state.feedbackEmail.length>0){
    this.setState({isFeedbackEmail:false});
    if(this.state.feedbackSubject.length>0){
      this.setState({isFeedbackSubject:false});
      if(this.state.feedback.length>0){
        this.setState({isFeedback:false});
        this.setState({isFeedbackEmail:true});

        this.submitFeedback();
        return
      }else{
        this.setState({isFeedback:true});
        this.refs.toast1.show('Please provide Feedback/Suggestion.');
      }
    }else{
      this.setState({isFeedbackSubject:true});
      this.refs.toast1.show('Please provide feedback subject.');
    }
  }else{
    this.setState({isFeedbackEmail:true});
    this.refs.toast1.show('Please provide email address.');

  }




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
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} >
            <View style={[styles.modalView,styles.shadow]}>
                <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast1" position = 'top'/>
                <MonoText   style={{fontSize:18,margin:10,color:'#a2a2a2',textAlign: 'center'}}>Feedback/Suggestion Form</MonoText>
                <Hoshi
                  label={'Email'}
                  borderColor={themeColor}
                  borderHeight={2}
                  inputPadding={16}
                  autoFocus = {this.state.isFeedbackEmail}
                  value = {this.state.feedbackEmail}
                  onChangeText={query => this.setState({feedbackEmail:query})}
                  keyboardType = 'email-address'
                  inputStyle={{color: '#a2a2a2',fontSize: 15,fontWeight:'100'}}
                />
                <Hoshi
                  label={'Subject'}
                  borderColor={themeColor}
                  borderHeight={2}
                  inputPadding={16}
                  multiline={true}
                  autoFocus = {this.state.isFeedbackSubject}
                  value = {this.state.feedbackSubject}
                  onChangeText={query => this.setState({feedbackSubject:query})}
                  inputStyle={{color: '#a2a2a2',fontSize: 15,fontWeight:'100'}}

                />
                <Hoshi
                  label={'Feedback/Suggestion'}
                  borderColor={themeColor}
                  borderHeight={2}
                  inputPadding={16}
                  autoFocus = {this.state.isFeedback}
                  value = {this.state.feedback}
                  multiline={true}
                  onChangeText={query => this.setState({feedback:query})}
                  height={150}
                  inputStyle={{color: '#a2a2a2',fontSize: 15,fontWeight:'100'}}
                />

              <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',}}>
                <TouchableOpacity
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }} style={{flex:1,backgroundColor:'#fff',justifyContent: 'center',alignItems:'center'}}>
                <MonoText   style={{color:'#a2a2a2',marginVertical:10,fontSize:18}}>CLOSE</MonoText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.varifyFeedbackForm();
                  }} style={{flex:1,backgroundColor:themeColor,justifyContent: 'center',alignItems:'center',}}>
                  <MonoText   style={{color:'#fff',marginVertical:10,fontSize:18}}>SUBMIT</MonoText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>



          <View  style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:40,paddingHorizontal:5,paddingVertical:5,}]}>
            <View style={{flex:0.2,marginLeft:20}}>
              <MonoText   style={{color:'grey',fontSize:18,marginLeft:10}}><FontAwesome name="envelope" size={35} color={themeColor} /></MonoText>
            </View>
            <View style={{flex:0.8,flexDirection:'row',justifyContent:'flex-start',paddingHorizontal:10}}>
              <MonoText   selectable={true} style={{color:'grey',fontSize:16,marginLeft:10}}>{this.state.email}</MonoText>
            </View>
          </View>
          <View  style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:20,paddingHorizontal:5,paddingVertical:5,}]}>
            <View style={{flex:0.2,marginLeft:20}}>
              <MonoText   style={{color:'grey',fontSize:18,marginLeft:10}}><FontAwesome name="phone" size={35} color={themeColor} /></MonoText>
            </View>
            <View style={{flex:0.8,flexDirection:'row',justifyContent:'flex-start',paddingHorizontal:10}}>
              <TouchableOpacity onPress={()=>this.call()}  style={{padding:7,borderWidth:1,borderColor:'#e7e7e7',backgroundColor:'#e7e7e7',marginBottom:20,color:'grey',marginLeft:10}} >
                <MonoText   style={{color:'grey',fontSize:16,}}>Call Back</MonoText>
              </TouchableOpacity>
            </View>
          </View>
          <View  style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:20,paddingHorizontal:5,paddingVertical:5,}]}>
            <View style={{flex:0.2,marginLeft:20}}>
              <MonoText   style={{color:'grey',fontSize:18,marginLeft:10}}><FontAwesome name="lightbulb-o" size={35} color={themeColor} /></MonoText>
            </View>
            <View style={{flex:0.8,flexDirection:'row',justifyContent:'flex-start',paddingHorizontal:10}}>
              <TouchableOpacity onPress={() => {this.setModalVisible(true);}}  style={{padding:7,borderWidth:1,borderColor:'#e7e7e7',backgroundColor:'#e7e7e7',marginBottom:20,color:'grey',marginLeft:10}} >
                <MonoText   style={{color:'grey',fontSize:16,}}>Write a suggestion/feedback</MonoText>
              </TouchableOpacity>
            </View>
          </View>

      </View>

    )
  }

  }
  }


const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10
  },
  shadow: {
    shadowColor: "#a2a2a2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchcontainer: {
    backgroundColor: 'red',
  },
  oval: {
    paddingBottom:30,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#fff',
   },
  ovalTop: {
    padding:10,
    paddingTop:30,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#fff',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
   },
   modalView: {
      backgroundColor: '#fff',
      marginHorizontal: width*0.05 ,
      borderRadius:5,
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
     }
})

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SupportScreen);
