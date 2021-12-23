import * as React from 'react';
import { StatusBar, View, Text,AsyncStorage, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import ImageOverlay from "react-native-image-overlay";
import { MonoText } from './StyledText';
import settings from '../constants/Settings.js';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const chatView = settings.chat

export default class DiscoverSellerCard extends React.Component {

  constructor(props) {
    super(props);
    var image = props.sellerStore.logo
    if(props.sellerStore.owner!=null){
      var pk = props.sellerStore.owner.pk
    }else{
      // var image = null
      var pk = null
    }
    this.state = {
      open : false,
      sellerStore :  props.sellerStore,
      userImage :image,
      owner:pk,
      storeChat:props.sellerStore
    }
  }
  openSubCategory = (item)=>{
    this.props.navigation.navigate('SubCategoryView', {
        subCategory : item,title: item.name
    })
  }

  toggle=()=>{

    this.setState({open : !this.state.open})

  }

  goToChat=async()=>{

    var userName = await AsyncStorage.getItem('user_name');
    var login = await AsyncStorage.getItem('userpk');
    if(JSON.parse(login)){
      this.props.navigation.navigate('TalkToSeller',{chatWith:this.state.owner,store:this.state.storeChat,userName:JSON.parse(userName)})
    }else{
      this.props.navigation.navigate('LogInScreen')

    }
  }

  render() {

    return (
    <Card containerStyle={[{ width: width,margin:0,padding:5}]}>
       <View style={{flexDirection:'row'}}>
         <View style={{flex:0.2,height:70,paddingHorizontal:10,justifyContent:'center'}}>
            {this.state.userImage!=null&&
              <View style={{width:60,height:60,borderRadius:30,}}>
              <Image source={{uri:this.state.userImage}} style={{width:'100%',height:'100%', borderRadius:30,backgroundColor:'#f2f2f2',borderWidth:2,borderColor: "#f2f2f2",resizeMode:'cover',overflow: 'hidden'}}/>
              </View>
            }
            {this.state.userImage==null&&
              <View  style={{ width:60,height:60,borderRadius:30,backgroundColor:this.props.themeColor,borderWidth:2,borderColor: "#f2f2f2",justifyContent:'center',alignItems:'center'}}>
                  <MonoText   style={{textAlign:'center',color:'#fff',fontSize:22}}>{this.state.sellerStore!=null?this.state.sellerStore.name.charAt(0):''}</MonoText>
              </View>
            }
         </View>
         <View style={{flex:0.45,justifyContent:'center'}}>
            {/*this.state.sellerStore.owner!=null&&<MonoText   style={{ color:'#000',fontSize:16,fontWeight:'700',paddingHorizontal:10,}}>{this.state.sellerStore.owner.first_name} {this.state.sellerStore.owner.last_name}</MonoText> */}
            <MonoText   style={{ color:'#000',fontSize:16,fontWeight:'700',paddingHorizontal:10,}} numberOfLines={2}>{this.state.sellerStore.name}</MonoText>
         </View>
         <View style={{flex:0.35,justifyContent:'center',alignItems:'center'}}>
            {chatView&&<TouchableOpacity onPress={()=>{this.props.navigation.navigate('SellerDetails',{sellerPk:this.state.sellerStore.pk})}} style={{borderRadius:5,paddingHorizontal:10,paddingVertical:3,borderColor:'grey',borderWidth:1}}>
              <MonoText   style={{ color:'#000'}}>View</MonoText>
            </TouchableOpacity>}
         </View>
      </View>
       <View style={{flexDirection:'row',}}>
        <View style={{flex:0.2,paddingHorizontal:10,}}>
          <MonoText   style={{ color:'grey',fontSize:14}}>Business</MonoText>
        </View>
        <View style={{flex:0.8,paddingHorizontal:10}}>
          <MonoText   style={{ color:'#000',fontSize:14}}>{this.state.sellerStore.vendor_typ}</MonoText>
        </View>
       </View>
       <View style={{flexDirection:'row',paddingBottom:20}}>
        <View style={{flex:0.2,paddingHorizontal:10,}}>
          <MonoText   style={{ color:'grey',fontSize:14}}>Location</MonoText>
        </View>
        <View style={{flex:0.8,paddingHorizontal:10}}>
          <MonoText   style={{ color:'#000',fontSize:14}}>{this.state.sellerStore.city}</MonoText>
        </View>
       </View>
    </Card>
    );
  }

}

const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10,


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
  }
})
