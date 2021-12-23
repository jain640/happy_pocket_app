import React,{Component} from 'react';
import {View,Text,Dimensions,TextInput,TouchableOpacity,StyleSheet,FlatList,AsyncStorage,ScrollView} from 'react-native';
import Constants from 'expo-constants';
import {FontAwesome,Ionicons}from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown-v2';
const { width } = Dimensions.get('window');
import { withNavigationFocus,DrawerActions } from 'react-navigation';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import settings from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { Card ,SearchBar , Icon} from 'react-native-elements';
import { Switch } from 'react-native-switch';
import { MonoText } from './StyledText';

const SERVER_URL = settings.url;


class Varients extends React.Component{

    constructor(props){
        super(props);
        this.state = {
          Storepk:'',
          store:this.props.store,
          enabled:false,
          PVariant:this.props.variant,
        }
    }


   ShowAlert= async(item,pk,enabled,index,value)=>{
      var PVariant=this.state.PVariant
      PVariant[index].enabled=!PVariant[index].enabled
      this.setState({PVariant:this.state.PVariant})
      this.setState({enabled:value})
      var dataToSend = {
        enabled:this.state.enabled,
      }
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf})
      fetch(SERVER_URL+'/api/POS/productVariantsv/'+pk+'/',{
        method: 'PATCH',
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json, text/plain,',
           'Content-Type': 'application/json;charset=utf-8',
           'X-CSRFToken':csrf,
           'Referer': SERVER_URL
         },
        body:JSON.stringify(dataToSend)
        }).then((response) =>{
        if(response.status === '200' ){
          return response.json()
        }
        }).then((json) => {
        }).catch((error) => {
            Alert.alert('Something went wrong in Server side');
      });
    }

  render(){
    const data1=[{value: 'Ton',}, {value: 'Kilogram',}, {value: 'Gram',},
                 {value: 'Litre',} ,{value: 'MilliLitre',},{value: 'Quantity',},{value: 'Size',},{value: 'Size & Color',}]
    var themeColor = this.props.store.themeColor
    return(
      <View style={{flex:1,backgroundColor:'#f1f1f1'}}>
                                    <FlatList
                                        data={this.state.PVariant}
                                        keyExtractor={(item,index) => {return index.toString();}}
                                        horizontal={false}
                                        numColumns={1}
                                        nestedScrollEnabled={true}
                                        renderItem={({item, index}) => (
                                        <View style={{paddingTop: 20,paddingHorizontal:0,flex:1,backgroundColor:this.state.themeColor-10,borderRadius:0,}}>
                                            <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,
                                                                    padding: 0,}}>
                                                <View style={{flexDirection:'row'}}>
                                                  {this.state.enabled==item.enabled &&
                                                    <Switch
                                                          value={item.enabled}
                                                          onValueChange={(value) => this.ShowAlert(item,item.pk,item.enabled,index,value)}
                                                          height={24}
                                                          width={40}
                                                          containerStyle={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',paddingLeft:width*0.12,paddingVertical:2,width:40,height:24,borderWidth:1,borderColor:'#b4b4b4'}}
                                                          backgroundActive={themeColor}
                                                          backgroundInactive={'#f7f7f7'}
                                                          circleActiveColor={'#ffffff'}
                                                          circleInActiveColor={'#ffffff'}
                                                          circleBorderWidth={1}
                                                          outerCircleStyle={{borderColor:themeColor}}
                                                          changeValueImmediately={true}
                                                        />}
                                                      {this.state.enabled!=item.enabled &&
                                                        <Switch
                                                            value={item.enabled}
                                                            onValueChange={(value) => this.ShowAlert(item,item.pk,item.enabled,index,value)}
                                                            height={24}
                                                            width={40}
                                                            containerStyle={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',paddingLeft:width*0.12,paddingVertical:2,width:40,height:24,borderWidth:1,borderColor:'#b4b4b4'}}
                                                            backgroundActive={themeColor}
                                                            backgroundInactive={'#f7f7f7'}
                                                            circleActiveColor={'#ffffff'}
                                                            circleInActiveColor={'#ffffff'}
                                                            circleBorderWidth={1}
                                                            outerCircleStyle={{borderColor:themeColor}}
                                                            changeValueImmediately={true}
                                                          />}
                                                    <MonoText   style={{paddingTop:2,paddingHorizontal:4}}>sellingPrice: {item.sellingPrice}</MonoText>
                                                </View>
                                            </Card>
                                        </View>
                                      )}
                                    />
      </View>
    )
  }
}
const styles=StyleSheet.create({
  modalView: {
      backgroundColor: '#fff',
      marginHorizontal: width*0.05 ,
      borderRadius:5,
   },
})

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

export default connect(mapStateToProps, mapDispatchToProps)(Varients);
