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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator,KeyboardAvoidingView
} from 'react-native';
import { FontAwesome,SimpleLineIcons ,Feather,MaterialIcons} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import FloatingInput from '../components/FloatingInput';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo';
import settings from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { Fumi } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import ModalBox from 'react-native-modalbox';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

class Charges extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title:  'Platform Charges',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerLeft: (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.goBack()}}><MaterialIcons name={'arrow-back'} size={25} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerTintColor: '#fff',

  };
}

constructor(props){
  super(props);
  this.state = {
    user:{},
    firstName:'',
    lastName:'',
    mobile:'',
    email:'',
    confirm :'',
    password:'',
    csrf:'',
    sessionid:'',
    store:this.props.store,
    myStore:this.props.myStore,
    displayPicture:null,
    attachOpen:false,
    loader:false,
    imageAdd:false,
    selected:null,
    categories:{}
  }


}




getCategory=()=>{
  this.setState({loader:true})
  console.log(SERVER_URL + '/api/POS/categoryListApp/?store='+this.state.myStore.pk,'kkkkkkkk');
  fetch(SERVER_URL + '/api/POS/categoryListApp/?store='+this.state.myStore.pk)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson,'llllllllll');
      this.setState({loader:false})
      this.setState({ categories: responseJson })
      if(responseJson.length>0){
        this.setState({ selected:responseJson[0] })
      }
    })
    .catch((error) => {
      this.setState({loader:false})
      return
    });
}



   componentDidMount(){
     this.props.navigation.setParams({
       themeColor:this.state.store.themeColor
     });
     this.getCategory()
   }



    render() {


      return (
        <View style={{flex:1,}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={{flex:1}}>
          {this.state.loader&&
            <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:15}}>
              <ActivityIndicator size="large" color={this.state.store.themeColor} />
            </View>
          }
          {!this.state.loader&&
            <View style={{flex:1,}}>
            <ScrollView style={{}}>
                {this.state.selected!=null&&
                  <View style={{paddingHorizontal:15}}>
                    <View  style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',paddingVertical:12,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                      <View style={{flex:0.8}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700',color:'#000'}}>Industry Type</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems:'flex-end'}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700',color:'#000'}}>%</MonoText>
                      </View>
                    </View>
                    <View  style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',paddingVertical:12,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                      <View style={{flex:0.75}}>
                        <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{entities.decode(this.state.selected.name)}</MonoText>
                      </View>
                      <View style={{flex:0.25,alignItems:'flex-end'}}>
                        <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{this.state.selected.commission}</MonoText>
                      </View>
                    </View>
                  <FlatList
                      style={{backgroundColor:'#fff',marginBottom:0,paddingBottom:30}}
                      data={this.state.categories[0].child}
                      keyExtractor={(item,index) => {
                          return item.pk.toString();
                      }}
                      renderItem={({item, index, separators}) => (
                        <View>
                        <View  style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',paddingVertical:12,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                          <View style={{flex:0.8}}>
                            <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{entities.decode(item.name)}</MonoText>
                          </View>
                          <View style={{flex:0.2,alignItems:'flex-end'}}>
                            <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{item.commission}</MonoText>
                          </View>
                        </View>
                        <FlatList
                            style={{backgroundColor:'#fff',marginBottom:0,}}
                            data={item.subChild}
                            keyExtractor={(item,index) => {
                                return item.pk.toString();
                            }}
                            renderItem={({item, index, separators}) => (
                              <View  style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',paddingVertical:12,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                                <View style={{flex:0.8}}>
                                  <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{entities.decode(item.name)}</MonoText>
                                </View>
                                <View style={{flex:0.2,alignItems:'flex-end'}}>
                                  <MonoText   style={{fontSize:16,fontWeight:'600',color:'#000'}}>{item.commission}</MonoText>
                                </View>
                              </View>
                            )}
                          />
                        </View>
                      )}
                    />
                </View>
                }

             </ScrollView>
             </View>
           }
         </View>
        </View>



        );
      }
    }

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
        reOrderFunction:  (args) => dispatch(actions.reOrderAction(args)),
        addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
        decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
        increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
        setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
        removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
        emptyCartFunction:()=>dispatch(actions.emptyCart()),


      };
    }

    export default connect(mapStateToProps, mapDispatchToProps)(Charges);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
   image: {
     width: width,
     height: width * 0.5
   },
   inputStyle:{
      height: 50,
      width:'100%',
      borderRadius:5,
      fontSize: 16,
      flexDirection: 'row',
      borderWidth:1,
      borderColor:'#f2f2f2'
    },
   textInput:{
    borderBottomWidth: 2,
    borderColor: '#f2f2f2',
    color: '#000',
    fontSize: 18,
    width:'100%',
    marginTop:10
   }


  });
