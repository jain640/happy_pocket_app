import React from 'react';
import {
  Animated,
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
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import ActiveDispute from '../components/ActiveDispute';
import ResolveDispute from '../components/ResolveDispute';
import HTMLView from 'react-native-htmlview';
import { Card } from 'react-native-elements';
import TabBarStyle from '../components/TabBarStyle';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons,MaterialCommunityIcons,AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollableTabView, DefaultTabBar, ScrollableTabBar, } from '@valdio/react-native-scrollable-tabview';
import { FloatingAction } from "react-native-floating-action";
import { MonoText } from '../components/StyledText';
import moment from 'moment';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url

const data = [
  {
    title:'How to be RPA Developer?',
    user:'Dixit Rai',
    content:'If you’re researching RPA, one of the last things you probably want to hear about is software testing. RPA is undeniably the hottest enterprise technology of the year—something that adds distinct business value and achieves a rapid ROI. On the other hand, software testing is commonly seen as a necessary evil—a cost center that delays application delivery and often brings bad news.',
    replies:20,
    views:150,
    votes:15,
    status:'Order'
  },
  {
    title:'How to be RPA Developer?',
    user:'Dixit Rai',
    content:'If you’re researching RPA, one of the last things you probably want to hear about is software testing. RPA is undeniably the hottest enterprise technology of the year—something that adds distinct business value and achieves a rapid ROI. On the other hand, software testing is commonly seen as a necessary evil—a cost center that delays application delivery and often brings bad news.',
    replies:20,
    views:150,
    votes:15,
    status:'Payment'
  },
  {
    title:'How to be RPA Developer?',
    user:'Dixit Rai',
    content:'If you’re researching RPA, one of the last things you probably want to hear about is software testing. RPA is undeniably the hottest enterprise technology of the year—something that adds distinct business value and achieves a rapid ROI. On the other hand, software testing is commonly seen as a necessary evil—a cost center that delays application delivery and often brings bad news.',
    replies:20,
    views:150,
    votes:15,
    status:'General'
  },
  {
    title:'How to be RPA Developer?',
    user:'Dixit Rai',
    content:'If you’re researching RPA, one of the last things you probably want to hear about is software testing. RPA is undeniably the hottest enterprise technology of the year—something that adds distinct business value and achieves a rapid ROI. On the other hand, software testing is commonly seen as a necessary evil—a cost center that delays application delivery and often brings bad news.',
    replies:20,
    views:150,
    votes:15,
    status:'Order'
  },
  {
    title:'How to be RPA Developer?',
    user:'Dixit Rai',
    content:'If you’re researching RPA, one of the last things you probably want to hear about is software testing. RPA is undeniably the hottest enterprise technology of the year—something that adds distinct business value and achieves a rapid ROI. On the other hand, software testing is commonly seen as a necessary evil—a cost center that delays application delivery and often brings bad news.',
    replies:20,
    views:150,
    votes:15,
    status:'Order'
  },
]


const tabs = [
  {
    name:'Active',
  },
  {
    name:'Resolved',
  },

]

class DisputeScreen extends React.Component {

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
      title: 'Disputes',
      headerTintColor: '#fff',
    }
  };


  constructor(props) {
    super(props);
    var params = props.navigation.state.params
    this.state = {
      store:props.store,
      scrollX : new Animated.Value(0),
      scrollY: new Animated.Value(0),
      selectedTab:0,
      data:[],
      resolved:[]
    }
    willFocus = props.navigation.addListener(
  'willFocus',
    payload => {
      this.getForumContent()
      // this.getForumResolved()
      }
   );
  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({selectedTab:page})
    }
    this.setState({scrollY:new Animated.Value(0)})
  }


  onLayout = event => {
    if (this.state.dimensions) return
    let {width, height} = event.nativeEvent.layout
    this.setState({dimensions: {width, height}})
  }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    })
    this.getForumContent()
    // this.getForumResolved()
  }

  getForumContent =async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const user = await AsyncStorage.getItem('userpk');
    console.log(user,'kkkkkkkkkk');
    console.log('came');
    await fetch(SERVER_URL+'/api/POS/forum/?userpk='+user+'&storeid='+this.state.store.pk,{
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/POS/forum/',
        'X-CSRFToken': csrf
      },
    })
    .then((response)=>{
      console.log(response.status,'ggfhfhghg');
      return response.json()
    }).then((json)=>{
      if(json==undefined){
        return
      }
      console.log(json,'lllllll');
      this.setState({data:json})
      // for (var i = 0; i < json.length; i++) {
      //   var date = new Date(json[i].created).toString()
      //   var d = date.split(' ').slice(1, 4).join(' ');
      //   json[i].created = d
      // }
   })
  }
  getForumResolved =async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const user = await AsyncStorage.getItem('userpk');
    console.log(user,'kkkkkkkkkk');
    console.log('came');
    await fetch(SERVER_URL+'/api/POS/forum/?userpk='+user+'&storeid='+this.state.store.pk,{
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/POS/forum/',
        'X-CSRFToken': csrf
      },
    })
    .then((response)=>{
      console.log(response.status,'ggfhfhghg');
      return response.json()
    }).then((json)=>{
      if(json==undefined){
        return
      }
      console.log(json,'lllllll');
      this.setState({resolved:json})
      // for (var i = 0; i < json.length; i++) {
      //   var date = new Date(json[i].created).toString()
      //   var d = date.split(' ').slice(1, 4).join(' ');
      //   json[i].created = d
      // }
   })
  }



  render() {
    var {themeColor} = this.props.store
    let left = this.state.scrollX.interpolate({
       inputRange: [0,1*width, ],
       outputRange: [0, width*0.5,],
       extrapolate: 'clamp'
     });
     const actions = [
     {
      text: "Raise Dispute",
      icon: <FontAwesome name={"file-text"} size={20} color={'#fff'} />,
      name: "create",
      position: 1,
      color:themeColor
    },
  ];
    return(
      <View style={{flex:1,backgroundColor:'#fff'}}>
        <Animated.View style={{flexDirection: 'row',}}>
        {tabs.map((item, i) => {
            return (
              <TouchableOpacity key={i} onPress={()=>{this.setState({selectedTab:i});this.scroll.scrollTo({ x: (i)*width });this.setState({scrollY:new Animated.Value(0)})}} style={{flex:1,borderBottomWidth: 1,borderColor:'#fff',backgroundColor:'#f2f2f2',alignItems: 'center',justifyContent: 'center',height:45}} >
               <MonoText   style={{fontSize:16,fontWeight:'700',color:this.state.selectedTab==i?'#000':'grey'}}>{item.name}</MonoText>
              </TouchableOpacity>
            );
          })}
          <Animated.View
          style={{ height: 2, width: '50%', backgroundColor: themeColor,position: 'absolute',bottom: 0,left:0,
          transform: [{translateX:left}]}}
          />
        </Animated.View>
        <ScrollView
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: this.state.scrollX } } }]  )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={this.handlePageChange}
          ref={(node) => {this.scroll = node}}
          style={{flex:1}}
          onContentSizeChange={() =>this.scroll.scrollTo({ x: (this.state.selectedTab)*width })}
          >

          {tabs.map((item, i) => {
              return (
                <View key={i} style={{flex:1,backgroundColor: '#f2f2f2',width:width*1,}} >
                {i==0&&
                   <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
                    <ScrollView>
                    <View style={{marginHorizontal:10,backgroundColor:'#f2f2f2'}}>

                     <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
                          data={this.state.data}
                          showsVerticalScrollIndicator={false}
                          keyExtractor={(item,index) => {
                            return index.toString();
                          }}
                          nestedScrollEnabled={true}
                          renderItem={({item, index}) =>{
                            if(item.status=='open'){
                             return (
                            <View style={{paddingTop:index==0?15:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
                              <TouchableOpacity onPress={()=>{this.props.navigation.navigate('ForumDetailedScreen',{data:item})}}>
                                <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                                  <View style={{}}>
                                    <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
                                      <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-start',marginLeft:15}}>
                                        <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
                                      </View>
                                      <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-end',marginRight:15}}>
                                        <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                           <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.category}</MonoText>
                                         </View>
                                      </View>
                                    </View>
                                    <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
                                      <View style={{marginHorizontal: 15}}>

                                        <HTMLView value = {"<div>"+item.description+"</div>"} stylesheet={styles} />
                                      </View>
                                    </View>
                                    <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
                                      <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                        <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.commentCount} New Message</MonoText>
                                      </View>
                                      <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
                                        <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                      </View>
                                    </View>
                                  </View>
                                </Card>
                              </TouchableOpacity>
                            </View>
                          )}else{
                            <View></View>
                          }}}

                          />
                    </View>
                    </ScrollView>

                   </View>
                }
                {i==1&&
                  <View style={{flex:1,}}>
                   <ScrollView>
                   <View style={{marginHorizontal:10,backgroundColor:'#f2f2f2'}}>

                    <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
                         data={this.state.data}
                         showsVerticalScrollIndicator={false}
                         keyExtractor={(item,index) => {
                           return index.toString();
                         }}
                         nestedScrollEnabled={true}
                         renderItem={({item, index}) =>{
                           if(item.status=='resolved'||item.status=="closed"){
                            return (
                           <View style={{paddingTop:index==0?15:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
                             <TouchableOpacity onPress={()=>{this.props.navigation.navigate('ForumDetailedScreen',{data:item,comment:false})}}>
                               <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                                 <View style={{}}>
                                   <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
                                     <View style={{flex:0.7,justifyContent: 'center',alignItems: 'flex-start',marginLeft:15}}>
                                       <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
                                     </View>
                                     <View style={{flex:0.3,justifyContent: 'center',alignItems: 'flex-end',marginRight:15}}>
                                       <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                          <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.category}</MonoText>
                                        </View>
                                     </View>
                                   </View>
                                   <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
                                     <View style={{marginHorizontal: 15}}>

                                       <HTMLView value = {"<div>"+item.description+"</div>"} stylesheet={styles} />
                                     </View>
                                   </View>
                                   <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
                                     <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                       <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.commentCount} New Message</MonoText>
                                     </View>
                                     <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
                                       <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                     </View>
                                   </View>
                                 </View>
                               </Card>
                             </TouchableOpacity>
                           </View>
                         )}else{
                           <View></View>
                         }}}

                         />
                   </View>

                   </ScrollView>

                  </View>
                }

                </View>
              );
            })}

        </ScrollView>


              <TouchableOpacity onPress={()=>{this.props.navigation.navigate('RaiseDispute')}}  style={[styles.boxshadow,{position:'absolute',right:20,bottom:20,width:50,height:50,borderRadius:25,backgroundColor:themeColor,alignItems:'center',justifyContent:'center'}]}>
                  <AntDesign name={'plus'} size={20} color={'#fff'}/>
             </TouchableOpacity>
      </View>
    )
  }
}


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
  boxshadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 0,
  },
  TouchableOpacityStyle: {
     position: 'absolute',
     width: 50,
     height: 50,
     alignItems: 'center',
     justifyContent: 'center',
     right: 30,
     bottom: 30,
     zIndex: 1,
     borderRadius:25,
   },
   modalcontainer:{
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.05 ,
     borderRadius:5,
  },
  FloatingButtonStyle: {
     resizeMode: 'contain',
     width: 50,
     height: 50,
   },
   tabStyle: {},
  scrollStyle: {

    justifyContent: 'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(DisputeScreen);



// <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
//        data={this.state.data}
//        showsVerticalScrollIndicator={false}
//        keyExtractor={(item,index) => {
//          return index.toString();
//        }}
//        nestedScrollEnabled={true}
//        renderItem={({item, index}) => (
//          <View style={{paddingTop:15,paddingBottom: 10,flex:1,backgroundColor:'#f2f2f2'}}>
//            <TouchableWithoutFeedback onPress={()=>{}}>
//              <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
//                <View style={{}}>
//                  <View style={{flex:0.4,flexDirection: 'row',marginTop:15}}>
//                    <View style={{flex:0.7,justifyContent: 'center',alignItems: 'flex-start',marginHorizontal:15}}>
//                      <MonoText   style={{fontSize:16,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.title}</MonoText>
//                    </View>
//                    <View style={{flex:0.3,justifyContent: 'center',alignItems: 'flex-end',marginHorizontal:15}}>
//                       <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
//                          <MonoText   style={{fontSize:14,fontWeight:'700',color:'#000',}} numberOfLines={1}>{item.status}</MonoText>
//                        </View>
//                    </View>
//                  </View>
//                  <View style={{flex:0.45,flexDirection: 'row',marginVertical:10}}>
//                    <View style={{marginHorizontal: 15}}>
//                      <HTMLView value = {"<div>"+item.content+"</div>"} stylesheet={styles} />
//                    </View>
//                  </View>
//                  <View style={{flex:0.15,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',marginHorizontal: 15,marginBottom:15}}>
//                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
//                      <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}> {item.replies} New Message</MonoText>
//                    </View>
//                    <View style={{flex:1,flexDirection: 'row',justifyContent: 'flex-end',alignItems: 'center'}}>
//                      <MonoText   style={{fontSize:12,color:'grey',}} numberOfLines={1}>3 Days ago</MonoText>
//                    </View>
//                  </View>
//                </View>
//              </Card>
//            </TouchableWithoutFeedback>
//          </View>
//        )}
//
//  />
