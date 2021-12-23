import React, {Component}from 'react';
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  AsyncStorage,
  Image,ScrollView,
  ImageBackground,ToastAndroid,CameraRoll,ActivityIndicator}from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons,SimpleLineIcons } from '@expo/vector-icons';
import settings from '../constants/Settings';
const {width}=Dimensions.get("window");
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import * as FileSystem from 'expo-file-system';
import {Notifications,Linking } from 'expo';
import * as Permissions from 'expo-permissions';
import * as IntentLauncher from 'expo-intent-launcher';
import { MonoText } from '../components/StyledText';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import * as WebBrowser from 'expo-web-browser';

class SellerZone extends Component{
    constructor(props){
        super(props);
        this.state={
            store:this.props.store,
            last_name:'',
            first_name:'',
            login:false,
            dp:'',
            csrf:null,
            sessionid:null,
            myStore:props.myStore,
            user:null,
            loader:false,
            storeName:null
        }
        this.listenForNotifications = this.listenForNotifications.bind(this);
    }

    static navigationOptions=({navigation})=>{
        const { params ={} }=navigation.state
        return{
            title:'Seller Zone',
            headerLeft:(
              <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
                  <TouchableOpacity onPress={()=>{navigation.openDrawer();}}>
                    <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
                  </TouchableOpacity>
              </View>
            ),
            headerStyle:{
                backgroundColor:params.themeColor,
                marginTop:Constants.statusBarHeight
            },
            headerTintColor: '#fff',
        }
    }

    componentDidMount=async()=>{
      console.log(this.state.myStore,'jjjjjjjjjjjjjj');
      // this.getUserAsync();
        var store = this.state.myStore
        this.setState({storeName:store.name,dp:SERVER_URL+store.logo,user:store.owner})
        this.props.navigation.setParams({
          themeColor:this.state.store.themeColor
        })
    }


    getUserAsync = async () => {
      this.setState({loader:true})
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        const csrf = await AsyncStorage.getItem('csrf');
        this.setState({csrf:csrf,sessionid:sessionid})
        if(userToken == null){
          this.setState({loader:false})
          return
        }
        fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
          headers: {
             "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
          }
        }).then((response) => response.json())
          .then((responseJson) => {
             this.setState({first_name:responseJson.first_name,last_name:responseJson.last_name,dp:responseJson.profile.displayPicture,user:responseJson})
             this.setState({loader:false})
          })
       .catch((error) => {
         this.setState({loader:false})
           return
       });
    }

    handlePressButtonAsync = async () => {
    var  url = SERVER_URL+'/api/POS/downloadbrochure/?store='+this.state.myStore.pk
    // Linking.openURL(url)
    let result = await WebBrowser.openBrowserAsync( url)
    // this.setState({ result });
  };


      downloadpdf = async () => {
          let url = SERVER_URL+'/api/POS/downloadbrochure/?store='+this.state.store.pk
          let fileUri = FileSystem.cacheDirectory + '/Catalog/Catalog.pdf' ;
           FileSystem.makeDirectoryAsync(fileUri,{intermediates:true}).catch(e => {
          })
           FileSystem.downloadAsync(
           SERVER_URL+'/api/POS/downloadbrochure/?store='+this.state.store.pk,
           FileSystem.cacheDirectory + '/Catalog/Catalog.pdf',
           {
             headers: {
               "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
                 'Accept-encoding': 'application/pdf',
                 'X-CSRFToken':this.state.csrf,
                 'Referer': SERVER_URL,
            },
           }
         ).then(({ uri }) => {
             this.saveFile(uri);
             ToastAndroid.show('file downloaded...', ToastAndroid.SHORT);
           })
           .catch(error => {
             return
             ToastAndroid.show('try again...', ToastAndroid.SHORT);
           });
   }

   saveFile = async (fileUri: string) => {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

          CameraRoll.saveToCameraRoll( fileUri, 'photo');
          const localnotification = {
            title: 'Download has finished',
            body:  "Catalog has been downloaded successfully..",
            android: {
              sound: true,
            },
            ios: {
              sound: true,
            },

            data: {
              fileUri: fileUri
            },
          };
          localnotification.data.title = localnotification.title;
          localnotification.data.body = localnotification.body;
          let sendAfterFiveSeconds = Date.now();
          sendAfterFiveSeconds += 1000;
          const schedulingOptions = { time: sendAfterFiveSeconds };
          Notifications.scheduleLocalNotificationAsync(
            localnotification,
            schedulingOptions
          );
     }

     listenForNotifications = () => {
        const _this = this;
        Notifications.addListener(notification => {
          if (notification.origin === 'selected') {
            this.openFile(notification.data.fileUri)
            return
        }
     });
   };

   openFile = (fileUri) => {
        this.toast.close(40);
        IntentLauncherAndroid.startActivityAsync(
        'android.intent.action.VIEW',
        null,
        fileUri
    );
  }

    render(){
        const changecase="/\b[a-z]|['_][a-z]|\B[A-Z]/g"
        var themeColor=this.state.store.themeColor
        const fname =this.state.first_name.toUpperCase();

   if(!this.state.loader){
    return(
        <ScrollView style={styles.container}>
          <View style={{flexDirection:'row',margin:15,borderWidth:0,}}>
            <View style={{width:width*0.12,height:width*0.12,margin:10,marginRight:0,
                          borderWidth:0,justifyContent:'center',alignItems:'center',borderRadius:width*0.06,backgroundColor:themeColor}}>
                {/*<View style={{width:width*0.1,height:width*0.1,borderWidth:0,alignSelf:'center',borderRadius:50,alignItems:'center'}}>*/}
                  {this.state.dp==null&&
                    <MonoText   style={{textAlign:'center',color:'#fff',fontSize:22}}>{this.state.storeName!=null?this.state.storeName.charAt(0):''}</MonoText>
                  }
                  {this.state.dp!=null&&
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover',borderRadius:width*0.06}} source={{uri:this.state.dp}} />
                  }
                {/*</View>*/}
            </View>
            <MonoText   style={{color:'#000',fontSize:20,paddingHorizontal:10,paddingTop:20}} noOfLines={1}>{this.state.storeName!=null?this.state.storeName:''}</MonoText>
            <TouchableOpacity style={{paddingTop:25}} onPress={()=>this.props.navigation.navigate('EditProfile')}>
                <FontAwesome name={'edit'} size={25} color={themeColor} />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row',borderWidth:0,justifyContent:'space-between',marginHorizontal:10,}}>
              <TouchableOpacity
                   style={{borderWidth:0,flex:1,alignItems:'center',}} onPress={()=>{this.props.navigation.navigate('DashBoard')}}>
                   <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>

                       <Image source={require('../assets/images/web-design.png')} style={{height:45,width:45}}/>
                  </View>
                  <MonoText   style={{fontSize:18}}> Dashboard </MonoText>
              </TouchableOpacity>
              <TouchableOpacity
                    style={{borderWidth:0,flex:1,alignItems:'center',}}
                    onPress={()=>{this.props.navigation.navigate('AddProductInitialScreen')}}>
                    <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>

                        <Image source={require('../assets/images/plus.png')} style={{height:45,width:45}}/>
                    </View>
                    <MonoText   style={{fontSize:18}}> Add Products </MonoText>
               </TouchableOpacity>

           </View>
          <View style={{flexDirection:'row',borderWidth:0,justifyContent:'space-between',margin:10,}}>
              <TouchableOpacity
                   style={{borderWidth:0,flex:1,alignItems:'center',}} onPress={()=>{this.props.navigation.navigate('ProductList',{initial:false})}}>
                   <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>

                       <Image source={require('../assets/images/productlist.png')} style={{height:45,width:45}}/>
                  </View>
                  <MonoText   style={{fontSize:18}}> Products list </MonoText>
              </TouchableOpacity>
               <TouchableOpacity
                    style={{borderWidth:0,flex:1,alignItems:'center',}} onPress={()=>{this.props.navigation.navigate('SellerOrdersScreen')}}>
                    <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>

                        <Image source={require('../assets/images/box.png')} style={{height:45,width:45}}/>
                    </View>
                    <MonoText   style={{fontSize:18}}> Orders </MonoText>
              </TouchableOpacity>
           </View>
           <View style={{flexDirection:'row',borderWidth:0,justifyContent:'space-between',margin:10,}}>
              <TouchableOpacity onPress={()=>{this.props.navigation.navigate('LedgerScreen')}}  style={{borderWidth:0,flex:1,alignItems:'center',}} >
                  <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>

                      <Image source={require('../assets/images/ledger.png')} style={{height:45,width:45}}/>
                  </View>
                <MonoText   style={{fontSize:18}}> Ledger </MonoText>
              </TouchableOpacity>
              <TouchableOpacity
                  style={{borderWidth:0,flex:1,alignItems:'center',}}
                  onPress={()=>{this.handlePressButtonAsync();return;this.props.navigation.navigate('CatalogScreen',{csrf:this.state.csrf,sessionid:this.state.sessionid})}}>
                  <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>
                      <View >
                          <Image source={require('../assets/images/catalog.png')} style={{height:45,width:45}}/>
                      </View>
                  </View>
                  <MonoText   style={{fontSize:18}}> Catalog </MonoText>
              </TouchableOpacity>
           </View>

           <View style={{flexDirection:'row',borderWidth:0,justifyContent:'space-between',margin:10,}}>

              <TouchableOpacity
                  style={{borderWidth:0,flex:1,alignItems:'center',}}
                  onPress={()=>{this.props.navigation.navigate('DisputeScreen')}}>
                  <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>
                      <View >
                          <Image source={require('../assets/images/dispute.png')} style={{height:45,width:45}}/>
                      </View>
                  </View>
                  <MonoText   style={{fontSize:18}}> Dispute </MonoText>
              </TouchableOpacity>
              <TouchableOpacity
                  style={{borderWidth:0,flex:1,alignItems:'center',}}
                  onPress={()=>{this.props.navigation.navigate('CouponScreen')}}>
                  <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>
                      <View >
                          <Image source={require('../assets/images/coupon.png')} style={{height:45,width:45}}/>
                      </View>
                  </View>
                  <MonoText   style={{fontSize:18}}> Coupons </MonoText>
              </TouchableOpacity>

          </View>

           <View style={{flexDirection:'row',borderWidth:0,justifyContent:'space-between',margin:10,}}>
              <TouchableOpacity
                  style={{borderWidth:0,flex:1,alignItems:'center',}}
                  onPress={()=>{this.props.navigation.navigate('Charges')}}>
                  <View style={{borderWidth:0,borderRadius:7,paddingVertical:15,paddingBottom:10}}>
                      <View >
                          <Image source={require('../assets/images/weighing-scale.png')} style={{height:45,width:45}}/>
                      </View>
                  </View>
                  <MonoText   style={{fontSize:18}}> Platform Charges </MonoText>
              </TouchableOpacity>
              <View style={{borderWidth:0,flex:1,alignItems:'center',}}>
              </View>
          </View>





      </ScrollView>
    )
  }else{
    return(
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={themeColor} />
    </View>
  )
  }
  }
}
const styles=StyleSheet.create({
  container:{
    flex:1
  }
})
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
    emptyCartFunction:()=>dispatch(actions.emptyCart()),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SellerZone)
