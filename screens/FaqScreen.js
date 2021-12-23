import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid ,Animated,NativeModules,LayoutAnimation} from 'react-native';
import { Card } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import SearchCard from '../components/SearchCard.js';
import ImageOverlay from "react-native-image-overlay";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import settings from '../constants/Settings.js';
import HTML from 'react-native-render-html';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from '../components/StyledText';



const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

class FaqScreen extends React.Component {


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'FAQ',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
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
      questions:[],
      loader:true,
      userpk:'',
      sessionid:'',
      email:'',
      mobile:'',
     animation: new Animated.Value(),
     store:this.props.store


    }


  }


  getFaq =() => {

       fetch( SERVER_URL + '/api/POS/frequentlyquestionvs/?store='+this.state.store.pk).then((response) => response.json())
        .then((responseJson) => {
          var parentPk = []
          var list = []
          responseJson.forEach((item)=>{
            if(!parentPk.includes(item.parent.pk)){
              parentPk.push(item.parent.pk)
            }
            if(parentPk.includes(item.parent.pk)){
              var idx = parentPk.indexOf(item.parent.pk)

              if(list[idx] == undefined){
                list[idx] = {
                  pk:item.parent.pk,
                  name:item.parent.name,
                  created:item.parent.created,
                  list:[]
                }
                list[idx].list.push(item)
             }else{
               list[idx].list.push(item)
             }
            }
          })
          list.forEach((item)=>{
            item.open = false
            item.list.forEach((i)=>{
              i.open = false
            })
          })
          this.setState({questions:list,loader:false})
        })
        .catch((error) => {
          this.setState({loader:false})
        });

  };

  getQuestionAsync =() => {

    try {
       fetch( SERVER_URL + '/api/POS/faqCategoryvs/?store='+this.state.store.pk ).then((response) => response.json())
        .then((responseJson) => {
          responseJson.data.forEach((item)=>{
            responseJson.data[i].open = false
          })
        this.setState({questions:responseJson.data,loader:false})
        this.getFaq()

        })
        .catch((error) => {
          this.setState({loader:false})
        });




    } catch (error) {
      return
    }
  };

  onPress=(item,idx)=>{
    var data = this.state.questions
    LayoutAnimation.easeInEaseOut();
    data.forEach((item,count)=>{
      if(count == idx && item.open == false){
        item.open = true
      }else{
        item.open = false
      }
    })
    this.setState({questions:data})
  }


  onChildPress=(parent,item,idx)=>{
    LayoutAnimation.easeInEaseOut();
    var data = this.state.questions
    data[parent].list.forEach((item,count)=>{
      if(count == idx && item.open == false){
        item.open = true
      }else{
        item.open = false
      }
    })
    this.setState({questions:data})
  }

  _setMaxHeight(event){
    this.setState({
        maxHeight   : event.nativeEvent.layout.height
    });
}

_setMinHeight(event){
    this.setState({
        minHeight   : event.nativeEvent.layout.height
    });
}


  componentDidMount() {
    this.props.navigation.setParams({
      themeColor: this.state.store.themeColor,
    });
    this.getFaq()
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

      <View style={{flex:1,backgroundColor:'#fff',}}>
      <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:0,backgroundColor:'#fff',marginBottom:15,flex:1}}
        data={this.state.questions}
        keyExtractor={(item) => {
          return item.pk.toString();
        }}
        extraData={this.state.questions}
        renderItem={({item, index}) =>{
         let parent = index
        return (
        <View style={{margin:15}} >
        <View >
          <TouchableOpacity  activeOpacity={0.5} onPress={()=>this.onPress(item,index)} style={[{paddingHorizontal:15,paddingVertical:15,},item.open?styles.open:styles.close]}>
            <View style={{flex:1,flexDirection: 'row',alignItems: 'flex-start',justifyContent: 'flex-start'}}>
              <View style={{flex:0.8,justifyContent: 'flex-start',alignItems: 'flex-start'}}>
                <MonoText   style={{color:'grey',fontSize:16,fontWeight: '600', }}>{item.name}</MonoText>
              </View>
              <View style={{flex:0.2,justifyContent: 'flex-end',alignItems: 'flex-end'}}>
                {item.open &&
                  <FontAwesome name="caret-up" size={22} color={themeColor} />
                }
                {!item.open &&
                 <FontAwesome name="caret-down" size={22} color={themeColor} />
                }
              </View>
            </View>
          </TouchableOpacity>
          </View>
          { item.open == true && item.list.length>0 &&
            <FlatList style={{borderColor : '#fff' , borderWidth:2,marginRight:0,marginTop:10,backgroundColor:'#fff',marginBottom:15,}}
              data={item.list}
              keyExtractor={(i,index) => {
                return i.pk.toString();
              }}
              renderItem={({item, index}) => (
                <View style={{margin:15}} >
                <TouchableOpacity  activeOpacity={0.5} onPress={()=>this.onChildPress(parent,item,index)} style={[{paddingHorizontal:15,paddingVertical:15,},item.open?styles.open:styles.close]}>
                  <View style={{flex:1,flexDirection: 'row',alignItems: 'flex-start',justifyContent: 'flex-start'}}>
                    <View style={{flex:0.8,justifyContent: 'flex-start',alignItems: 'flex-start'}}>
                      <MonoText   style={{ color:'grey',fontSize:16,}}>{item.ques}</MonoText>
                    </View>
                    <View style={{flex:0.2,justifyContent: 'flex-end',alignItems: 'flex-end'}}>
                      {item.open &&
                        <FontAwesome name="caret-up" size={22} color={themeColor} />
                      }
                      {!item.open &&
                       <FontAwesome name="caret-down" size={22} color={themeColor} />
                      }
                    </View>
                  </View>
                </TouchableOpacity>
                  { item.open == true &&
                    <View style={{marginHorizontal:20,color:"grey"}} >
                      <HTML html={item.ans} style={{paddingHorizontal:10,color:"grey"}} />
                    </View>
                  }
                </View>
              )}
            />
          }
          { item.open == true && item.list.length == 0 &&
            <MonoText   style={{ alignSelf:'center',marginTop:20}}>No items</MonoText>
          }
        </View>
      )}}
      />
      </View>


    )}

  }
  }
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
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(FaqScreen);

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
   close:{
     borderWidth: 1,
     borderColor:'#e7e7e7',
     backgroundColor:'#e7e7e7',
   },
   open:{
     borderWidth: 1,
     borderColor:'#fff',
     backgroundColor:'#fff',
   }

})
