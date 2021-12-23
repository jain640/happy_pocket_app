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
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,Picker,Keyboard,
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
import { MonoText } from '../components/StyledText';
import ModalBox from 'react-native-modalbox';
import { Card } from 'react-native-elements';
import { Switch } from 'react-native-paper';
import Loader from '../components/Loader';
import { Dropdown } from 'react-native-material-dropdown-v2';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url

const CategoryChoices = ['order_related','product_related','membership_related','offer_related','rto_request']

class RaiseDispute extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginLeft:15,height:'100%' }}>
         <MaterialIcons name="arrow-back" size={30} color='#fff'  />
        </TouchableOpacity>
     ),

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTitleStyle: {
        flex:0.8,
        alignSelf:'center',
        textAlign:'center',
      },
      title: 'Raise Concern',
      headerTintColor: '#fff',
    }
  };




  constructor(props) {
    super(props);
    var params = props.navigation.state.params
    var userScreen = props.navigation.getParam('user',null)
    this.state = {
      store:props.store,
      images:[{uri:null}],
      order:'',
      attachOpen:false,
      tag:'',
      title:'',
      tags:[],
      description:'',
      keyboardOffset: 0,
      keyboardOpen : false,
      keyboardHeight:0,
      scrollHeight:Dimensions.get('window').height-100,
      footerHeight:55,
      filesPk:[],
      login:false,
      category:CategoryChoices[0],
      loader:false,
      order:'',
      searchText:'',
      searching:false,
      orderList:[],
      show:false,
      userScreen:userScreen,
      myStore:props.myStore,
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
  )
  willFocus = props.navigation.addListener(
   'willFocus',
     payload => {
       this.loginOrNot()
       }
    );
  }

  getUser=async()=>{
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    this.setState({csrf:csrf,sessionid:sessionid})
  }

  loginOrNot=()=>{
   AsyncStorage.getItem('login').then(userToken => {
     if(userToken == 'true' || userToken == true){
       this.setState({login:true})
     }else{
       this.setState({login:false})
     }
   }).done();
 }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    })
    this.getUser()
  }

  search=(text)=>{
    if(text==null){
      return
    }
  this.setState({order:text,})
  var orderList = []
  if(text.length>0){
  if(this.state.userScreen!=null&&this.state.userScreen){
    var url = SERVER_URL+'/api/POS/getUserOrders/'
  }else{
    var url = SERVER_URL+'/api/POS/getUserOrders/?search='+text+'&store='+this.state.myStore.pk
  }
  fetch(url ,{
    headers: {
      "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken':this.state.csrf,
      'Referer': SERVER_URL,
    },
  })
     .then((response) => {
       return response.json()})
     .then((responseJson) => {
       console.log(responseJson,'kkkkkkkkkkkkkk');
         responseJson.orderids.forEach((i)=>{
             orderList.push(i)
         })
       if(orderList.length>0){
         // LayoutAnimation.easeInEaseOut();
         LayoutAnimation.configureNext(
           LayoutAnimation.create(
             400,
             LayoutAnimation.Types.linear,
             LayoutAnimation.Properties.scaleXY,
           ),
         );
         this.setState({orderList:orderList,show:true})
       }else{
         this.setState({orderList:orderList,show:false})
       }
     })
     .catch((error) => {
       return
     });
   }else if(text.length==0){
     if(orderList.length>0){
       LayoutAnimation.configureNext(
         LayoutAnimation.create(
           400,
           LayoutAnimation.Types.linear,
           LayoutAnimation.Properties.scaleXY,
         ),
       );
       this.setState({orderList:[],show:false,})
     }else{
       this.setState({orderList:[],show:false})
     }
   }



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


  requestAsync=(parameter,csrf,sessionid)=>{
    var formData  = new FormData();
    formData.append('typ', 'image');
    formData.append('attachment', parameter);

    return new Promise(resolve => {
       fetch(SERVER_URL+'/api/POS/forumfies/',{
        method: 'POST',
        headers: new Headers({
          "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Referer': SERVER_URL+'/api/POS/forumfies/',
          'X-CSRFToken': csrf
        }),
        body: formData
       }).then(function(response) {
           return response.json()
       }).then((json)=>{
         console.log(json,'lllllllll');
         if(json!=undefined){
           var pk = json.pk
           var filesPk = this.state.filesPk
           filesPk.push(pk)
           this.setState({filesPk:filesPk})
           resolve();

         }

       }).catch((error) => {
           return
       });
    });
   }

   postImages=async()=>{

     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');

     if(this.state.login){
       if(this.state.title.length==0){
         this.refs.toast.show('Please fill the title.');
         return;
       }
       if(this.state.description.length==0){
         this.refs.toast.show('Please fill the description.');
         return;
       }
       var promises = [];

       this.state.images.map((data,i) => {
         if(data.uri!=null){
           promises.push(this.requestAsync(data,csrf,sessionid));
         }
       });
       this.setState({loader:true})
       Promise.all(promises).then(() => {
         this.setState({images:[]})
         this.postForumComment()
       })
     }else{
       this.props.navigation.navigate('Login')
     }
   }

   postForumComment=async()=>{
     this.setState({loader:true})
     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');

     var dataSend = {
       description:this.state.description,
       files:this.state.filesPk,
       title:this.state.title,
       category:this.state.category,

     }
     if(this.state.order.length==0){
       dataSend.order = null
     }else{
       dataSend.order = this.state.order
     }
     console.log(dataSend,'gggggggggggggggggg');
     // return
     fetch(SERVER_URL+'/api/POS/forum/',{
       method:"POST",
       headers: {
         "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL+'/api/homepage/forum/',
         'X-CSRFToken': csrf
       },
       body: JSON.stringify(dataSend)
     }).then(function(response) {
       console.log(response.status,'jjjjjjjjjjj');
       if(response.status==200||response.status==201){
         return response.json()
       }else{
         return undefined
       }
     }).then((json)=>{
       console.log(json,'tttttttttttttt');
       if(json!=undefined){
         this.refs.toast.show('Your Dispute was successfully Raised. ')
        this.setState({images:[{uri:null}],filesPk:[],title:'',description:''})
        this.setState({loader:false})
        this.props.navigation.goBack()
      }else{
        this.setState({loader:false})
        this.props.navigation.goBack()
        // this.refs.toast.show('Invalid Order Id. ')
      }

     }).catch((error) => {
        this.setState({loader:false})
        this.setState({images:[{uri:null}],filesPk:[],title:'',description:''})
        this.refs.toast.show('Something went wrong... ')
     });
   }




  render() {
    var themeColor = this.state.store.themeColor
    let choices = CategoryChoices.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let choicesDropdown = CategoryChoices.map( (s, i) => {
      return {value:s}
    });
    console.log(choicesDropdown,'jdsnfi');

    return (
      <View style={{flex:1}}>
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <ScrollView contentContainerStyle={{paddingBottom:45}}>
        <TouchableWithoutFeedback onPress={()=>{this.setState({show:false})}} >
        <View style={{flex:1,}}>

          <View style={{paddingVertical:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Title</MonoText>
            <TextInput style={{height:40,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',borderRadius:5,marginTop:5}}
                onChangeText={(title)=>this.setState({title:title})}
                value={this.state.title}  placeholder='Title'>
            </TextInput>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Order Id</MonoText>
            <TextInput style={{height:40,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',borderRadius:5,marginTop:5}}
                onChangeText={(order)=>this.search(order)} keyboardType={'numeric'}
                value={this.state.order.toString()}  placeholder='Eg 123'>
            </TextInput>
              <View style={{position:'absolute',top:70,left:15,right:15,marginVertical:10,zIndex:99}}>
                 {this.state.show&&
                 <View style={[styles.shadow,{zIndex:999,flex:1,flexDirection:'row',borderRadius:20,maxHeight:220,backgroundColor:'#fff',borderRadius:5,borderWidth:1,borderColor:'#fff'}]}>
                 <FlatList
                     data={this.state.orderList}
                     extraData={this.state}
                     inverted={false}
                     scrollToEnd={true}
                     horizontal={false}
                     nestedScrollEnabled={true}
                     keyExtractor={(item, index) => index.toString()}
                     renderItem={({item, index})=>(
                       <View  style={{minHeight:40}}>
                         <TouchableOpacity onPress={()=>{this.setState({show:false,order:item,searchText:item,orderList:[]})}} style={{flexDirection:'row',zIndex:999,flex:1,borderBottomWidth:(index==this.state.orderList.length-1?0:1),borderColor: '#f2f2f2',}}>
                           <View style={{zIndex:999,flex:1,flexDirection: 'row',justifyContent:'flex-start',alignItems:'center',marginRight:10}}>
                               <MonoText   style={{color:'grey',fontSize:16,marginLeft:10}}>{item}</MonoText>
                           </View>
                         </TouchableOpacity>
                         </View>
                     )}
                     />
                 </View>
               }
              </View>
          </View>

          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Select Concern Type</MonoText>

            {Platform.OS === 'android'&&
            <View style={{backgroundColor:'#fff',marginTop:10,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,height:40}}>
              <Picker
                selectedValue={this.state.category}
                mode="dropdown"
                style={{ flex:1,height:40, width:'100%'}}
                onValueChange={(itemValue, itemIndex)=>this.setState({category:itemValue})}>
                {choices}
              </Picker>
              </View>
          }
          {Platform.OS === 'ios' &&
          <View style={{backgroundColor:'#fff',marginTop:10,paddingBottom:2,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5,}}>
            <Dropdown
                      data={choicesDropdown}
                      onChangeText={(itemValue, itemIndex)=>this.setState({category:itemValue})}
                      containerStyle={{
                        height:40,
                        width: '100%',backgroundColor:'#ffffff',borderRadius:5,borderWidth: 0,borderColor:'#ffffff'
                      }}
                      inputContainerStyle={{
                        height:40, width: '100%',fontSize:16,backgroundColor:'#ffffff',paddingTop:8,paddingHorizontal: 10,borderRadius:5,borderWidth: 0,borderColor:'#ffffff',borderBottomColor:'transparent'
                      }}
                      value={this.state.category}
                     pickerStyle={{borderWidth:0,  borderRadius:10,width:width-40,marginTop:width * 0.03,marginHorizontal: 10}}
                    />
            </View>
          }



          </View>
          <View style={{flex:1}}>

           </View>

          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Add Supporting Photos(Optional)</MonoText>
            <View style={{flex:1,}}>
              <FlatList style={{margin:0,backgroundColor:'#fff',marginBottom: 10 , borderRadius:10}}
              data={this.state.images}
              showsVerticalScrollIndicator={false}
              numColumns={5}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item,index) => {
                return index.toString();
              }}
              nestedScrollEnabled={true}
              renderItem={({item, index}) => (
                <View style={{height:'100%'}}>
                {item.uri!=null&&
                  <TouchableOpacity style={{borderRadius:10,}} onPress={()=>this.removeImage(index)}>
                    <Image
                    source={{uri:item.uri}}
                    style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02 }}
                    />
                    <View style={{position: 'absolute',top:0,right:-10,width:20,height:20,backgroundColor: '#fa4616',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                      <FontAwesome  name="close" size={15} color="#fff" />
                    </View>
                  </TouchableOpacity>
                }
                {item.uri==null&&
                <TouchableOpacity style={{borderRadius:10,}} onPress={()=>{this.attachShow(true)}}>
                  <View style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02,backgroundColor: '#f2f2f2',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                    <FontAwesome  name="plus" size={15} color="#000" />
                  </View>
                </TouchableOpacity>
              }
               </View>
              )}
              />
              <MonoText   style={{fontSize:14,color:'red'}}>Photos help us resolve issues faster and easily</MonoText>
            </View>
           </View>
           <View style={{paddingBottom:15,paddingHorizontal:15,}}>
             <MonoText   style={{fontSize:16,fontWeight:'700'}}>Comments/Feedback</MonoText>
             <TextInput style={{height:200,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',borderRadius:5,marginTop:5,textAlignVertical:'top',padding:10}}
                 onChangeText={(description)=>this.setState({description:description})}
                 value={this.state.description}  numberOfLines={5}  multiline={true}  placeholder='Write Comments'>
             </TextInput>
           </View>

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>


      {!this.state.keyboardOpen&&<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:themeColor,height:45}}>
        <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}}  onPress={()=>{this.postImages()}}>
          <MonoText   style={{fontSize:18,color:'#fff'}}> Submit </MonoText>
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

      <ModalBox
        style={{height:150}}
        position={'bottom'}
        ref={'attachModal'}
        isOpen={this.state.attachOpen}
        onClosed={()=>{this.setState({attachOpen:false})}}>
          <View style={{flex:1,flexDirection: 'row'}}>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="photo" size={35} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="camera" size={25} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText>
            </TouchableOpacity>
          </View>
        </ModalBox>

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
    store:state.cartItems.store,
    myStore:state.cartItems.myStore
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

export default connect(mapStateToProps, mapDispatchToProps)(RaiseDispute);
