import * as React from 'react';
import { Animated,StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView,ProgressBarAndroid,NativeModules,LayoutAnimation,AsyncStorage} from 'react-native';
import { FontAwesome,MaterialIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import settings from '../constants/Settings.js';
import Svg,{ Line }from 'react-native-svg';
const themeColor = settings.themeColor
import Moment from 'moment';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MonoText } from './StyledText';

const SERVER_URL = settings.url

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);


const { width } = Dimensions.get('window');
const height = width * 0.8

const MyComponent = () => (
  <ConfettiCannon count={200} origin={{x: -10, y: 0}} />
);

export default class TargetComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollY: new Animated.Value(0),
      values:[10,100,250,500],
      progressValues:[],
      selectedValue:0,
      selectedProgressValue:0,
      total:0,
      max:0,
      min:0,
      offset:{},
      store:props.store,
      user:props.user,
      target:[],
      achieve:false,
      fadeOut:false
    }

  }
  componentDidMount=()=>{
    // var max = Math.max(...this.state.values)
    // var min = Math.min(...this.state.values)
    // var count = this.state.values.length
    // var selectedProgressValue = ((this.state.selectedValue*100)/max)/100
    // var arr= [selectedProgressValue]
    // this.state.values.forEach((item,idx)=>{
    //   var value = ((item*100)/max)/100
    //     arr.push(value)
    // })
    // arr.sort((a,b)=>(a-b))
    // arr.indexOf(selectedProgressValue)
    // this.setState({selectedProgressValue:selectedProgressValue,progressValues:arr,max:max,min:min})
    // this.props.coinCount(this.state.selectedValue)
    // this.getUserAsync()
    this.targetList()
  }

  // componentWillReceiveProps(nextProps) {
  //     this.props.getUser()
  // }



  fetchtarget=async()=>{
    var user = await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    await fetch(SERVER_URL + '/api/POS/fetchtarget/?store='+this.state.store.pk,{
      method:'GET',
      headers:{
        "Cookie" :"csrftoken="+ csrf +";sessionid=" + sessionid + ";" ,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
    .then((response) =>{return response.json()})
    .then((responseJson) => {
      var target  = this.state.target
      var tagetTracker = []
      var userPoint = []
      if(responseJson.toReturn == undefined){
        return
      }
      responseJson.toReturn.forEach((i)=>{
        tagetTracker.push(i.target)
        userPoint.push(i.point)
      })
      var show = false
      target.forEach((i)=>{
        if(tagetTracker.includes(i.pk)){
          var index = tagetTracker.indexOf(i.pk)
          i.userPoint = userPoint[index]
        }else{
          i.userPoint = 0
        }
      })
      this.setState({target:target})
      if(responseJson.showGift){
        this.props.gift()
      }
      this.props.getUser()
    })
    .catch((error) => {
      return
    });
  }

  targetTracker=async()=>{
    var user = await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    await fetch(SERVER_URL + '/api/POS/targettracker/?user='+user,{
      method:'GET',
      headers:{
        "Cookie" :"csrftoken="+ csrf +";sessionid=" + sessionid + ";" ,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
    .then((response) =>{return response.json()})
    .then((responseJson) => {
      var target  = this.state.target
      var tagetTracker = []
      var userPoint = []
      responseJson.forEach((i)=>{
        tagetTracker.push(i.target.pk)
        userPoint.push(i.point)
      })
      var show = false
      target.forEach((i)=>{
        if(tagetTracker.includes(i.pk)){
          var index = tagetTracker.indexOf(i.pk)
          i.userPoint = userPoint[index]
          if(userPoint[index]>=i.targetAmount&&show==false){
            this.props.gift()
            show=true
          }
        }else{
          i.userPoint = 0
        }
      })
      this.setState({target:target})

    })
  }

  targetList=async()=>{
    var user = await AsyncStorage.getItem('userpk');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');
    await fetch(SERVER_URL + '/api/POS/target/?store='+this.state.store.pk+'&getorder=true',{
      method:'GET',
      headers:{
        "Cookie" :"csrftoken="+ csrf +";sessionid=" + sessionid + ";" ,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
    .then((response) =>{return response.json()})
    .then((responseJson) => {
      this.setState({target:responseJson})
      // this.targetTracker()
      this.fetchtarget()
      // responseJson.results.forEach((item)=>{
      //   item.open=false
      // })
      // var values = responseJson.results.map((i)=>{
      //   return i.targetAmount
      // })
      // this.setState({values:values, target: responseJson.results })
      // var max = Math.max(...this.state.values)
      // var min = Math.min(...this.state.values)
      // var count = this.state.values.length
      // var selectedProgressValue = ((this.state.selectedValue*100)/max)/100
      // var arr= [0,4000,]
      // // this.state.values.forEach((item,idx)=>{
      // //   var value = ((item*100)/max)/100
      // //     arr.push(value)
      // // })
      // arr.push(max)
      // arr.sort((a,b)=>(a-b))
      // arr.indexOf(selectedProgressValue)
      // this.setState({selectedProgressValue:selectedProgressValue,progressValues:arr,max:max,min:0})
      // this.props.coinCount(this.state.selectedValue)
    })
    .catch((error) => {
      return
    });
  }

  handleScroll=(event)=>{
    var currentOffset = event.nativeEvent.contentOffset.y;
    var direction = currentOffset > this.state.offset ? 1 : 0;

    Animated.event(
        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
    )(event);
    this.props.scollUpdate(this.state.scrollY,direction)
    this.setState({offset : currentOffset})
  }

  toggle=(idx)=>{
    LayoutAnimation.easeInEaseOut();
    var item = this.state.target
    item[idx].open = !item[idx].open
    this.setState({target:item})
  }

  navigate=(item)=>{
    this.props.navigation.navigate('TargetDetails',{target:item})
  }

render(){
  Moment.locale('en');
  var themeColor = this.props.store.themeColor
  return(
    <View style={{flex:1,}}>
      <Animated.ScrollView ref={ref => { this._scrollView = ref; }} overScrollMode={'never'}  style={{flex:1,paddingVertical: 15, }} onScroll={this.handleScroll}  scrollEventThrottle={1}>

        <View style={{marginTop:185,}}>
          <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',paddingBottom:15,}}
          data={this.state.target}
          onScroll={this.handleScroll}
          keyExtractor={(item,index) => {
            return index.toString();
          }}
          nestedScrollEnabled={true}
          renderItem={({item, index}) => {
            var achieve = item.userPoint<item.targetAmount?false:true
            var userPercentage = achieve?100:Math.ceil(((item.userPoint/item.targetAmount)*100))
            var left = userPercentage+'%'
            return(
            <Animated.View style={{flex:1,paddingHorizontal:25,}} >
            <TouchableOpacity onPress={()=>{this.navigate(item)}}>
              <View style={{width:'100%',marginVertical:30}}>
                <View>
                  <MonoText   style={{fontSize:14,color:"#000",fontWeight:'700',paddingVertical:5}}>{item.title}</MonoText>
                </View>
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
                        <MonoText   style={{paddingHorizontal: 10,height:17,justifyContent: 'center',backgroundColor:themeColor,color:'#fff',fontSize:12,fontWeight: '600',borderRadius: 5,position:'absolute',top:-20,}}>&#8377; {item.userPoint}</MonoText>
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
                    <MonoText   style={{color:achieve?'green':themeColor,fontSize:16,fontWeight:'700'}}>&#8377; {item.targetAmount}</MonoText>
                  </View>

                </View>
            </View>
            </TouchableOpacity>
          </Animated.View>
        )}}
          />
        </View>

      </Animated.ScrollView>

    </View>
  )
}

}
