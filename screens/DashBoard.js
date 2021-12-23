import React, {Component}from 'react';
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  AsyncStorage,
  Image,ScrollView,
  ImageBackground,ToastAndroid,CameraRoll,ActivityIndicator,FlatList,Picker}from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons,SimpleLineIcons,FontAwesome5 } from '@expo/vector-icons';
import settings from '../constants/Settings';
const {width}=Dimensions.get("window");
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import {Notifications,Linking } from 'expo';
import * as Permissions from 'expo-permissions';
import * as IntentLauncher from 'expo-intent-launcher';
import { MonoText } from '../components/StyledText';
import { Card } from 'react-native-elements';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import * as WebBrowser from 'expo-web-browser';

const days = [{label:'7 days',value:7},{label:'1 Month',value:30},{label:'3 Months',value:90}]

class DashBoard extends Component{
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
            storeName:null,
            dashboard:null,
            days:days,
            selectedDays:days[0]
        }
    }

    static navigationOptions=({navigation})=>{
        const { params ={} }=navigation.state
        return{
            title:params.storeName,
            // headerLeft:(
            //   <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
            //       <TouchableOpacity onPress={()=>{navigation.openDrawer();}}>
            //         <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
            //       </TouchableOpacity>
            //   </View>
            // ),
            headerStyle:{
                backgroundColor:params.themeColor,
                marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
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
          themeColor:this.state.store.themeColor,
          storeName:this.state.myStore.name
        })
        this.getDashboard(this.state.selectedDays.value);
    }


    getDashboard = async (days) => {
      console.log(days,'kij');
      this.setState({loader:true})
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        const csrf = await AsyncStorage.getItem('csrf');
        this.setState({csrf:csrf,sessionid:sessionid})
        if(userToken == null){
          this.setState({loader:false})
          return
        }
        fetch(SERVER_URL+'/api/POS/dashboard/?store='+this.state.myStore.pk + '&days='+days, {
          headers: {
             "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
          }
        }).then((response) => response.json())
          .then((responseJson) => {
             this.setState({dashboard:responseJson})
             console.log(responseJson,'kkkkkkkkkk');
             this.setState({loader:false})
          })
       .catch((error) => {
         this.setState({loader:false})
           return
       });
    }



  render(){
        const changecase="/\b[a-z]|['_][a-z]|\B[A-Z]/g"
        var themeColor=this.state.store.themeColor
        const fname =this.state.first_name.toUpperCase();

        let daysList = this.state.days.map( (s, i) => {
          return <Picker.Item key={i} value={s.value} label={s.label}  ></Picker.Item>
        });

   if(!this.state.loader){
    return(
        <View style={styles.container}>
          <View style={{flex:1}}>
          {this.state.loader&&
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <ActivityIndicator size="large" color={themeColor} />
            </View>
          }

          {!this.state.loader&&this.state.dashboard!=null&&
            <View>
            <View style={[{height:45,width:width,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}]}>
                <View style={{flex:0.7,justifyContent:'center',}}>
                  <View style={{position:'absolute',left:0,top:0,height:45,justifyContent:'center',width:30,alignItems:'center'}}>
                    <FontAwesome name="filter" size={20} color={themeColor} />
                  </View>
                  <Picker
                    selectedValue={this.state.selectedDays}
                    mode="dropdown"
                    style={{ width: "100%",height:45 ,position:'absolute',left:'15%',top:0,}}
                    itemStyle={{marginVertical:0,paddingVertical:0,fontSize:12,}}
                    onValueChange={(itemValue, itemIndex)=>{this.setState({selectedDays:itemValue});this.getDashboard(itemValue)}}>
                    {daysList}
                  </Picker>
                </View>
            </View>
            <ScrollView style={{}} contentContainerStyle={{paddingBottom:45}}>
            <FlatList style={{paddingTop:10}}
            data={this.state.dashboard.dashboarddata}
            keyExtractor={(item,index) => {
              return index.toString();
            }}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            renderItem={({item, index}) => {
              var colors  = [{color1:'#f6d365',color2:'#fda085'},{color1:'#07EBFE',color2:'#4CAEFE'},{color1:'#38F9D6',color2:'#43EA7F'},{color1:'#FFAA95',color2:'#FF0E47'}]
              if(colors[index]==undefined){
                var color = colors[index%4]
              }else{
                var color = colors[index]
              }
              return (
              <View style={{flex:1,backgroundColor:'#fff',height:'100%',paddingHorizontal:20,paddingTop:5,paddingBottom:10,width:'100%'}}>
              <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff',borderRadius:5,width:width-40,height:(width*0.5)-40,margin:0,padding:0,marginRight:0,marginLeft:0}]}>
              <LinearGradient colors={[color.color1,color.color2]} start={[0, 1]} end={[0.5, 0]}  style={{borderRadius:5,position: 'absolute',left: 0,right: 0,top: 0,height: '100%',}}>
              </LinearGradient>
                 <View style={{height:'100%'}}>
                   <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,}}>

                   </View>
                   <View style={{flex:1,padding:10,paddingHorizontal:15}}>
                       <View style={{flex:1,flexDirection:'row',}}>
                         <View style={{flex:1,justifyContent:'center'}}>
                             <View style={{height:50,width:50,justifyContent:'center',alignItems:'center',backgroundColor:color.color2,borderRadius:25}}>
                                <FontAwesome name={item.icon.trim().substring(3,item.icon.length)} size={30} color={'#fff'} />
                             </View>
                         </View>
                         <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                            <MonoText style={{fontWeight:'700',fontSize:22,color:'#fff'}}>{Math.round(item.growth)}</MonoText>
                         </View>
                       </View>
                   </View>
                   <View style={{flex:1,padding:10,paddingHorizontal:15}}>
                       <View style={{flex:1,flexDirection:'row',}}>
                         <View style={{flex:1,justifyContent:'center'}}>
                            <MonoText style={{fontWeight:'700',fontSize:18,color:'#fff'}}>{item.name}</MonoText>
                         </View>
                         <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                            <MonoText style={{fontWeight:'700',fontSize:20,color:'#fff'}}>{Math.round(item.count)}</MonoText>
                         </View>
                       </View>
                   </View>
                 </View>
              </Card>
              </View>
            )
            }}
          extraData={this.state}
          />

            </ScrollView>
            </View>
          }

          </View>
       </View>
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
  },
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

export default connect(mapStateToProps, mapDispatchToProps)(DashBoard)
