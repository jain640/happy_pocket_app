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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,PanResponder
} from 'react-native';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import { StackActions, NavigationActions } from 'react-navigation';
import  Constants  from 'expo-constants';
import GridLayout from 'react-native-layout-grid';
import { Card } from 'react-native-elements';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';


class Test extends React.Component {

  static navigationOptions=({navigation})=>{
    const { params ={} }=navigation.state
    return{
      title:'Create New Store',
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



  constructor(props){
    super(props);
    this.state = {
      chatList : [],
      store:this.props.store,
      data:[1,2,3],
      selectdCard:0,
      scrollX : new Animated.Value(0),
      currentIndex: 0
    }
     this.position = new Animated.ValueXY();
     this.rotate = this.position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
      })
      this.rotateAndTranslate = {
        transform: [{
          rotate: this.rotate
        },
        ...this.position.getTranslateTransform()
        ]
       }
       this.nextCardOpacity = this.position.x.interpolate({
           inputRange: [-width / 2, 0, width / 2],
           outputRange: [1, 0, 1],
           extrapolate: 'clamp'
        })
        this.nextCardScale = this.position.x.interpolate({
           inputRange: [-width / 2, 0, width / 2],
           outputRange: [1, 0.8, 1],
           extrapolate: 'clamp'
        })
        this.lastCardScale = this.position.x.interpolate({
           inputRange: [-width / 2, 0, width / 2],
           outputRange: [1, 0.8, 1],
           extrapolate: 'clamp'
        })

        willFocus = props.navigation.addListener(
         'didFocus',
           payload => {
              this.getInitial()
             }
        );
  }

  getInitial=()=>{
    this.setState({currentIndex:0})
  }

  componentWillMount() {
      this.PanResponder = PanResponder.create({
       onStartShouldSetPanResponder: (evt, gestureState) => true,
       onPanResponderMove: (evt, gestureState) => {
          this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
       onPanResponderRelease: (evt, gestureState) => {
         if (gestureState.dx > 120) {
             Animated.spring(this.position, {
               toValue: { x: width + 50, y: gestureState.dy }
             }).start(() => {
               this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                 this.position.setValue({ x: 0, y: 0 })
               })
             })
            } else if (gestureState.dx < -120) {
             Animated.spring(this.position, {
               toValue: { x: -width - 50, y: gestureState.dy }
             }).start(() => {
               this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                 this.position.setValue({ x: 0, y: 0 })
               })
             })
           }else{
             Animated.spring(this.position, {
               toValue: { x: 0, y: 0 },
               friction: 2
               }).start()

           }
       }
      })
 }


  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor
    })

  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({selectdCard:page})
    }
  }

  navigate=()=>{
    // var resetAction = StackActions.reset({
    //  index: 0,
    //  actions: [NavigationActions.navigate({ routeName: 'NewStore' })],
    // });
    // this.props.navigation.dispatch(resetAction);
    this.props.navigation.navigate('NewStore')
  }


  render() {

    var themeColor = this.props.store.themeColor
    let position = Animated.divide(this.state.scrollX, width);
    var rangeOfInput = []
    var rangeOfOutput= []
    if(this.state.data!=undefined){
      this.state.data.forEach((item,idx)=>{
        rangeOfInput.push(idx*width)
        rangeOfOutput.push(idx*12)
      })
    }
    if(rangeOfInput.length<2){
      var rangeOfInput = [0,1*width]
      var rangeOfOutput= [0,0]
    }
    let left = this.state.scrollX.interpolate({
      inputRange:rangeOfInput,
      outputRange: rangeOfOutput,
      extrapolate: 'clamp',
      useNativeDriver:true
    });



     return (
       <View style={{flex:1,}}>
         <View style={{flex:1,}}>
          {this.state.data.map((item,index)=>{
                if (index < this.state.currentIndex) {
                    return null;
                }
            else if (index == this.state.currentIndex&&index!=this.state.data.length-1) {
              return(
                <Animated.View key={index} {...this.PanResponder.panHandlers}  style={[this.rotateAndTranslate,{width: width,alignItems:'center',justifyContent:'center',bottom:height*0.1,top:height*0.1,position: "absolute",}]}>
                  <Card containerStyle={[styles.shadow,{ width: width*0.7,margin:0,padding:5,height:height*0.7,marginHorizontal:15,borderRadius:20}]}>
                    <View style={{height:'100%',width:'100%'}}>
                      <View style={{flex:0.4,alignItems:'center',justifyContent:'center'}}>
                        <Image source={require('../assets/images/preview1.png')} style={{width:width*0.5,height:width*0.5}} />
                      </View>
                      <View style={{flex:0.40,alignItems:'center',justifyContent:'center'}}>
                        <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:20,fontWeight:'700'}}>Create the New Own Store and Sell Products</MonoText>
                        <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:16,marginVertical:10}}>There are already have store Selling more and Earning more..{index}</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                        <TouchableOpacity onPress={()=>{this.navigate()}} style={{width:(width*0.7)-60,height:35,marginHorizontal:30,borderRadius:10,borderWidth:1,borderColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                          <MonoText   style={{color:themeColor,fontSize:16,}} >{index==2?'GET STARTED':'SKIP'}</MonoText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              )
            }else if(index != this.state.currentIndex&&index!=this.state.data.length-1){
              return(
              <Animated.View key={index}  style={{width: width,transform: [{ scale: this.nextCardScale }],alignItems:'center',justifyContent:'center',bottom:height*0.1,top:height*0.1, position: "absolute",}}>
                <Card containerStyle={[styles.shadow,{ width: width*0.7,margin:0,padding:5,height:height*0.7,marginHorizontal:15,borderRadius:20}]}>
                  <View style={{height:'100%',width:'100%'}}>
                    <View style={{flex:0.4,alignItems:'center',justifyContent:'center'}}>
                      <Image source={require('../assets/images/preview1.png')} style={{width:width*0.5,height:width*0.5}} />
                    </View>
                    <View style={{flex:0.40,alignItems:'center',justifyContent:'center'}}>
                      <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:20,fontWeight:'700'}}>Create the New Own Store and Sell Products</MonoText>
                      <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:16,marginVertical:10}}>There are already have store Selling more and Earning more..{index}</MonoText>
                    </View>
                    <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                      <TouchableOpacity onPress={()=>{this.navigate()}} style={{width:(width*0.7)-60,height:35,marginHorizontal:30,borderRadius:10,borderWidth:1,borderColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                        <MonoText   style={{color:themeColor,fontSize:16,}} >{index==2?'GET STARTED':'SKIP'}</MonoText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            )
          }else if(index == this.state.data.length-1){
            return(
            <Animated.View key={index}  style={{width: width,transform: [{ scale: this.lastCardScale }],alignItems:'center',justifyContent:'center',bottom:height*0.1,top:height*0.1, position: "absolute",}}>
              <Card containerStyle={[styles.shadow,{ width: width*0.7,margin:0,padding:5,height:height*0.7,marginHorizontal:15,borderRadius:20}]}>
                <View style={{height:'100%',width:'100%'}}>
                  <View style={{flex:0.4,alignItems:'center',justifyContent:'center'}}>
                    <Image source={require('../assets/images/preview1.png')} style={{width:width*0.5,height:width*0.5}} />
                  </View>
                  <View style={{flex:0.40,alignItems:'center',justifyContent:'center'}}>
                    <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:20,fontWeight:'700'}}>Create the New Own Store and Sell Products</MonoText>
                    <MonoText   style={{color:themeColor,textAlign:'center',marginHorizontal:10,fontSize:16,marginVertical:10}}>There are already have store Selling more and Earning more..{index}</MonoText>
                  </View>
                  <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity onPress={()=>{this.navigate()}} style={{width:(width*0.7)-60,height:35,marginHorizontal:30,borderRadius:10,borderWidth:1,borderColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                      <MonoText   style={{color:themeColor,fontSize:16,}} >{index==2?'GET STARTED':'SKIP'}</MonoText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )
          }
            }
          ).reverse()
        }




         </View>
       </View>
     );
   }
  }



  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },



  });


  const mapStateToProps =(state) => {
      return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      myStore:state.cartItems.myStore,
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

  export default connect(mapStateToProps, mapDispatchToProps)(Test);


  // <View style={{  justifyContent: 'center', alignItems: 'center' }}>
  //   <View style={{ flexDirection: 'row' }}>
  //   {this.state.data.map((_, i) => {
  //     let opacity = position.interpolate({
  //        inputRange: [i - 1, i, i + 1],
  //        outputRange: [0.3, 1, 0.3],
  //        extrapolate: 'clamp'
  //      });
  //     return (
  //       <Animated.View
  //         key={i}
  //         style={{ height: 6, width: 6, backgroundColor: '#595959', margin: 3, borderRadius: 5,opacity:0.3 }}
  //       />
  //     );
  //   })}
  //   {this.state.data.length>0&&
  //     <Animated.View style={{position:'absolute',left:0,top:0, height: 6, width: 6, backgroundColor: themeColor, margin: 3, borderRadius: 5 ,  transform: [{translateX:left}]}}
  //     />
  //
  //   }
  // </View>
  // </View>
