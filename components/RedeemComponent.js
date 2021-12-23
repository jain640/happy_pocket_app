import * as React from 'react';
import {Animated, StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView,NativeModules,LayoutAnimation,AsyncStorage} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import settings from '../constants/Settings.js';
import moment from 'moment';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

export default class RedeemComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redeem:[],
      scrollY: new Animated.Value(0),
      store:props.store,
      loadMore:true,
      offset:0,
      themeColor:props.themeColor
    }
  }
  componentDidMount(){
    this.getRedeem()
  }
  //
  // getRedeem=async()=>{
  //   var user = await AsyncStorage.getItem('userpk');
  //   await fetch(SERVER_URL + '/api/POS/wallettransition/?user='+user+'&type=debit')
  //   .then((response) => response.json())
  //   .then((responseJson) => {
  //     responseJson.forEach((item)=>{
  //       item.open=false
  //     })
  //     this.setState({ redeem: responseJson })
  //   })
  //   .catch((error) => {
  //     return
  //   });
  //
  // }

  loadMore =async()=>{


      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      this.setState({ offset : this.state.offset + 10})
      if(userToken!== null ){
        fetch(SERVER_URL + '/api/POS/orderLite/?limit=10&offset=' + this.state.offset +'&orderBy='+userToken , {
          headers: {
             "Cookie" :"sessionid=" + sessionid ,
          },
          method: 'GET'
          })
          .then((response) =>{
            return response.json()
          } )
          .then((responseJson) => {
            const arr = this.state.redeem
            var setArr = []
            responseJson.results.forEach((item)=>{
              item.open = false
              item.data = []
              arr.push(item)
            })

            this.setState({ redeem: arr})
            if(arr.length%10!=0){
              this.setState({loadMore:false})
            }
          })
          .catch((error) => {
            return
          });
     }


  }

  getRedeem=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({user:userToken,csrf:csrf,sessionid:sessionid})
    if(userToken!== null ){
      fetch(SERVER_URL + '/api/POS/orderLite/?limit=10&offset=' + this.state.offset +'&orderBy='+userToken+'&paymentMode=gift' , {
        headers: {
           "Cookie" :"sessionid=" + sessionid ,
        },
        method: 'GET'
        })
        .then((response) =>{
          if(response.status == 200 || response.status == '200'){
            return response.json()
          }else{
            return undefined
          }
        } )
        .then((responseJson) => {
          if(responseJson == undefined){
            return
          }
          for (var i = 0; i < responseJson.results.length; i++) {
            responseJson.results[i].open = false
            responseJson.results[i].data = []
          }
          console.log(responseJson.results,'jkkkkkk');
          this.setState({ redeem: responseJson.results,loader:false})
          if(responseJson.results.length%10!=0){
            this.setState({loadMore:false})
          }
        })
        .catch((error) => {
          return
        });
  }
}


  handleScroll=(event)=>{
    Animated.event(
        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
    )(event)
    this.props.scollUpdate(this.state.scrollY)
  }
  // toggle=(idx)=>{
  //   LayoutAnimation.easeInEaseOut();
  //   var item = this.state.redeem
  //   item[idx].open = !item[idx].open
  //   this.setState({redeem:item})
  // }

  toggle=(idx)=>{
    LayoutAnimation.easeInEaseOut();
    this.state.redeem[idx].open = true;
    this.setState({ redeem: this.state.redeem  })
  }

render(){
  var themeColor = this.props.themeColor
  return(
    <View style={{flex:1,}}>
      <Animated.ScrollView ref={ref => { this.scrollView = ref; }} style={{flex:1,paddingVertical: 15, }}
      onScroll={this.handleScroll} scrollEventThrottle={16}>
        <Animated.View style={{flex:1,marginTop:185}} >
        <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',paddingBottom:15,}}
        data={this.state.redeem}
        onScroll={this.handleScroll}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        nestedScrollEnabled={true}
        renderItem={({item, index}) =>{
          if(item.orderQty.length==0){
            return null
          }else{
          return(
        <TouchableOpacity onPress={() =>{this.toggle(index)}} >
          <Card  containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', marginTop: 10, marginBottom: 10,width:width*1-30,paddingHorizontal: 10,}]}>
            <MonoText   style={{textAlign:'center',fontWeight:'700'}}>Order ID : #{item.pk}</MonoText>
            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
              <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                <MonoText   >Status: {item.status=='newOrder'?'new':(item.status=='workInProgress'?'InProgress':item.status)}</MonoText>
              </View>
              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                <MonoText>Payment Mode: {item.paymentMode}</MonoText>
              </View>
            </View>
            {/*<View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
              <View style={{flex:0.55,justifyContent:'flex-start',alignItems:'flex-start'}}>
                <MonoText   numberOfLines={1}>Product: {item.orderQty[0].productName}</MonoText>
              </View>
              <View style={{flex:0.45,justifyContent:'flex-end',alignItems:'flex-end'}}>
                <MonoText   >Status: {item.status=='newOrder'?'new':(item.status=='workInProgress'?'InProgress':item.status)}</MonoText>
              </View>
              <MonoText>Total Amount: &#8377; {item.orderQty[0].sellingPrice}</MonoText>
            </View>*/}
            <View style={{flex:1,marginTop:10,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
              <View style={{flex:1.3,justifyContent:'flex-start',alignItems:'flex-start'}}>
                <MonoText   >Location: {item.city} {item.state}</MonoText>
              </View>
              <View style={{flex:0.7,justifyContent:'flex-end',alignItems:'flex-end'}}>
                <MonoText> {moment(moment.utc(item.created).toDate()).local().format('MMM-DD-YYYY')}</MonoText>
              </View>
            </View>

            {item.open?(
              <View style={{}}>

                <FlatList style={{marginTop: 10,}}
                  data={item.orderQty}
                  keyExtractor={(item, index) => index}
                  renderItem={({ item }) => (
                    <View style={{borderTopWidth:1,borderColor:'grey',paddingVertical:15}}>
                      <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                        <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <MonoText   style={{fontSize:13}}>Name : {item.productName}</MonoText>
                        </View>
                        <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                          <MonoText   style={{fontSize:13}}>Qty : {item.qty}</MonoText>
                        </View>
                      </View>
                      <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:10}}>
                        <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <MonoText   style={{fontSize:13}}>Coins : {item.sellingPrice}</MonoText>
                        </View>
                      </View>
                    </View>
                  )}
                />

              </View>
            ):<View></View>}

            {/*<TouchableOpacity style={{flex:1}} onPress={()=>this.toggle(index)}>
              <View style={{flexDirection: 'row',}}>
                <View style={{flex:0.5,alignItems: 'flex-start'}}><MonoText   style={{fontSize:16,color:'#000',fontWeight:'700',}}>{item.gift.name}</MonoText> </View>
                <View style={{flex:0.5,alignItems: 'flex-end'}}><MonoText   style={{fontSize:14,color:'#000',fontWeight:'700',}}>{item.value} Coins</MonoText> </View>
              </View>
              {item.open?
                <View style={{}}>
                  <MonoText   style={{color:'grey',fontSize:14,fontWeight:'700',marginTop:5}}>13 jan 2019</MonoText>
                  <View style={{alignItems: 'center',justifyContent: 'center',marginTop:15}}>
                    <Image  style={{width:width*0.25 ,height:width*0.25 }} source={{uri:item.gift.image}} />
                  </View>
                </View>:<View style={{}}>
                  <MonoText   style={{color:'grey',fontSize:14,fontWeight:'700',marginTop:5}}>13 jan 2019</MonoText>
                </View>
              }
              <View style={{borderTopWidth: 1,borderTopColor:'#f2f2f2',alignItems: 'flex-end',marginTop:10}}>
                <MonoText   style={{color:'grey',fontSize:14,fontWeight:'700',marginTop:5}}>{item.open?'Show less':'Show more'}</MonoText>
              </View>
            </TouchableOpacity>*/}
          </Card>
          </TouchableOpacity>
        )}
        }
        }
        />
        </Animated.View>

        </Animated.ScrollView>
        {this.state.loadMore&&
        <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'flex-start',backgroundColor:'#fff', width : width,}}>
          {this.state.redeem.length>0&&<TouchableOpacity onPress={this.loadMore}  style={{padding:7,borderWidth:1,borderColor:themeColor,backgroundColor:themeColor,marginBottom:20,color:'#fffff'}} >
            <MonoText   style={{color:'#fff'}}>Load More</MonoText>
          </TouchableOpacity>}
          {this.state.redeem.length==0&&<MonoText>No Items</MonoText> }
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
    elevation: 5,
  }
})
