import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  Slider,
  Animated,Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ProgressBarAndroid,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,Picker,Keyboard,
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons ,Ionicons} from '@expo/vector-icons';
import {ColorPicker, StatusColorPicker } from 'react-native-status-color-picker';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ModalBox from 'react-native-modalbox';
import { Card } from 'react-native-elements';
import { MonoText } from '../components/StyledText';
import { Switch } from 'react-native-paper';
import moment from 'moment';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url



class TargetDetails extends React.Component {

  // static navigationOptions = ({ navigation }) => {
  //   const { params = {} } = navigation.state
  //   return {
  //     headerLeft: (
  //       <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginLeft:15,height:'100%' }}>
  //        <MaterialIcons name="arrow-back" size={30} color='#fff'  />
  //       </TouchableOpacity>
  //    ),
  //
  //     headerStyle: {
  //       backgroundColor: params.themeColor,
  //     },
  //     headerTitleStyle: {
  //       flex:1,
  //       marginRight:80,
  //       fontSize:18,
  //       alignSelf:'center',
  //       textAlign:'center'
  //     },
  //     title: 'Target Details',
  //     headerTintColor: '#fff',
  //   }
  // };

  static navigationOptions = ({ navigation }) => {
    return{
      header:null
    }
  }




  constructor(props) {
    super(props);
    var params = props.navigation.state.params

    this.state = {
      store:props.store,
      target:params.target,
      images:[{attachment:null}],
      order:'',
      validity: moment(params.target.created).add((params.target.validity), 'days').format('YYYY/MM/DD')
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
  )
  }

  getUser=async()=>{
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    this.setState({csrf:csrf,sessionid:sessionid})
  }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    })
    this.getUser()
    console.log(this.state.target,'target');
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
        })
   }

attachShow=async(bool)=>{
  const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({attachOpen:bool})
        }else{
          this.getCameraRollAsync()
        }
      }else{
        this.getCameraAsync()
  }

}
getCameraAsync=async(obj)=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Camera permission not granted');
 }
}

getCameraRollAsync=async(obj)=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Gallery permission not granted');
 }
}

modalAttach =async (event) => {
  if(event == 'gallery') return this._pickImage();
  if(event == 'camera') {
    this.handlePhoto()
  }
};

_pickImage = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsMultipleSelection: true
   });
    let img = new FormData();
    let filename = result.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);

    var type = match ? `image/${match[1]}` : `image`;


    const photo = {
      uri: result.uri,
      type: type,
      name:filename,
    };

    var images =this.state.images;
    images.push(photo)
    this.setState({images:images});
    this.attachShow(false)

};
  handlePhoto = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});

    if(picture.cancelled == true){
     return
    }


    let img = new FormData();
    let filename = picture.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    const photo = {
     uri: picture.uri,
     type: type,
     name:filename,
    };
    var images =this.state.images;
    images.push(photo)
    this.setState({images:images});
    this.attachShow(false)

  }

    removeImage=(index)=>{

     var imgs = this.state.images
     imgs.splice(index,1)
     this.setState({images:imgs})
  }





  render() {
    var themeColor = this.state.store.themeColor
    var {target} = this.state
    var achieve = target.userPoint<target.targetAmount?false:true
    var userPercentage = achieve?100:Math.ceil(((target.userPoint/target.targetAmount)*100))
    var left = userPercentage+'%'

    return (
      <View style={{flex:1}}>
      <View style={{height: Constants.statusBarHeight,backgroundColor: "#f3f3f3"}} />
        <View style={[styles.shadow,{backgroundColor: "#f3f3f3",height:width*0.45,paddingHorizontal:15,paddingVertical:15}]}>
           <View style={{flexDirection:'row'}}>
             <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{alignItems: 'flex-start'}}>
               <MaterialIcons name='arrow-back' size={25} color={themeColor} />
             </TouchableOpacity>
             <View style={{flex:0.9,justifyContent: 'center',alignItems: 'center',marginLeft:15}}>
               <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor}}>{target.title}</MonoText>
             </View>
          </View>
          <View >
          <Animated.View style={{flex:1,paddingHorizontal:25,}} >
            <View style={{width:'100%',marginVertical:30}}>
              <View style={{flexDirection: 'row',marginTop:20}}>

                {userPercentage>10&&
                  <View style={{position:'absolute',top:0,height:15,left:0}}>
                  <FontAwesome name='flag-o' size={20} color={achieve?'green':themeColor} />
                  </View>
                }
                {userPercentage<90&&
                  <View style={{position:'absolute',top:0,height:15,right:0}}>
                    <FontAwesome name='flag-o' size={20} color={achieve?'green':themeColor} />
                  </View>
                }
                {userPercentage==100&&
                  <View style={{position:'absolute',top:0,height:15,right:0}}>
                    <FontAwesome name='flag-o' size={20} color={achieve?'green':themeColor} />
                  </View>
                }
                {!achieve&&
                  <View style={{position:'absolute',left:left,top:0,height:15}}>
                    <View style={{position:'absolute',top:0,flexDirection: 'row'}}>
                      <MaterialIcons name='directions-run'  size={25} color={themeColor} />
                      <MonoText   style={{paddingHorizontal: 10,height:17,justifyContent: 'center',backgroundColor:themeColor,color:'#fff',fontSize:12,fontWeight: '600',borderRadius: 5,position:'absolute',top:-20,}}>&#8377; {target.userPoint}</MonoText>
                    </View>
                  </View>
                }
                {achieve&&
                  <View style={{position:'absolute',left:'46%',top:0,height:15}}>
                    <View style={{position:'absolute',top:0,flexDirection: 'row'}}>
                      <FontAwesome name='gift'  size={25} color={'green'} />
                    </View>
                  </View>
                }
                <View style={{marginTop:15,width:'100%'}}>
                   <ProgressBarAndroid
                       styleAttr="Horizontal"
                       indeterminate={false}
                       progress={userPercentage==0?3/100:userPercentage/100}
                       color={achieve?'green':themeColor}
                   />
                </View>
                <View style={{position:'absolute',top:30,height:15,left:0}}>
                  <MonoText   style={{color:achieve?'green':themeColor,fontSize:16,fontWeight:'700'}}>&#8377; 0</MonoText>
                </View>
                <View style={{position:'absolute',top:30,height:15,right:0}}>
                  <MonoText   style={{color:achieve?'green':themeColor,fontSize:16,fontWeight:'700'}}>&#8377; {target.targetAmount}</MonoText>
                </View>

              </View>
          </View>

        </Animated.View>
          </View>
        </View>


        <ScrollView style={{marginTop:10,paddingHorizontal:15,paddingVertical:5}}>
          <View>
          <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',paddingVertical:15}}>
            <View >
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'700',}}>Description</MonoText>
            </View>
            <View style={{marginTop:10}}>
              <MonoText   style={{fontSize:14,color:'#000',fontWeight:'400',}} >{target.description}</MonoText>
            </View>
          </View>
          <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingVertical:15}}>
            <View style={{flex:0.5}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'700',}}>Target Amount</MonoText>
            </View>
            <View style={{flex:0.5,alignItems:'flex-end'}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400',}}>&#8377; {target.targetAmount}</MonoText>
            </View>
          </View>
          <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingVertical:15}}>
            <View style={{flex:0.5}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'700',}}>Reward</MonoText>
            </View>
            <View style={{flex:0.5,alignItems:'flex-end'}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400',}}>{target.achievedCoin} Coins</MonoText>
            </View>
          </View>
          <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row',paddingVertical:15}}>
            <View style={{flex:0.5,}}>
              <MonoText   style={{fontSize:14,color:'#000',fontWeight:'700',}}>Validity</MonoText>
            </View>
            <View style={{flex:0.5,alignItems:'flex-end'}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400',}}>{this.state.validity}</MonoText>
            </View>
          </View>
          <View style={{paddingVertical:15}}>
            <View >
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'700',}}>Applied On:</MonoText>
            </View>
            <View >
               {target.product.map((i,idx)=>{
                 return(
                   <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',paddingVertical:10,paddingLeft:10}}>
                    <MonoText   style={{fontSize:16,fontColor:'#000',fontWeight:'400',}}>{i.displayName}</MonoText>
                   </View>
                 )
               })}
               {target.category.map((i,idx)=>{
                 return(
                   <View style={{borderBottomWidth:1,borderColor:'#f2f2f2',paddingVertical:10,paddingLeft:10}}>
                    <MonoText   style={{fontSize:16,fontColor:'#000',fontWeight:'400',marginTop:10}}>{i.name}</MonoText>
                   </View>
                 )
               })}
            </View>
          </View>

         </View>
        </ScrollView>
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
   shadowOpacity: 0,
   shadowRadius: 3.84,
   elevation: 5,
},

});

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

export default connect(mapStateToProps, mapDispatchToProps)(TargetDetails);
