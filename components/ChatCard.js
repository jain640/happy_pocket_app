import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert} from 'react-native';
import { FontAwesome,EvilIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import ImageOverlay from "react-native-image-overlay";
import { MonoText } from './StyledText';
import settings from '../constants/Settings.js';
import moment from 'moment';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

export default class ChatCard extends React.Component {

  constructor(props) {
    super(props);
    var today = moment();
    var yesterday = moment().subtract(1, 'day');
    var lastDate = props.chat.lastMessageDate
    var date1 = moment(today).format('YYYY-MM-DD');
    var date2 = moment(lastDate).format('YYYY-MM-DD');
    if(date2 < date1){
      if(moment(date2).isSame(yesterday, 'day')){
        var format = 'Yesterday'
      }else{
        var format = moment(moment.utc(date2).toDate()).local().format('DD/MM/YY')
      }
    }else if(date1 == date2){
    	var format = moment(moment.utc(lastDate).toDate()).local().format('HH:mm')
    }
    this.state = {
      open : false,
      chat :  props.chat,
      lastMessageDate:format,
      myStore:props.myStore
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

  componentWillReceiveProps({chat}){
    this.setState({chat:chat})
  }

  goToChat=()=>{
    this.props.navigation.navigate('ChatUserScreen',{chatWith:this.state.chat.pk,store:this.state.myStore})
  }

  render() {

   var themeColor = this.props.store.themeColor


    return (
    <Card containerStyle={[{ width: width,margin:0,padding:5}]}>
        <TouchableOpacity style={{flex:1,flexDirection:'row',marginVertical:3}} onPress={()=>this.goToChat()}>
            <View style={{flex:0.2,justifyContent:'center',alignItems:'center'}}>
            {this.state.chat!=undefined&&this.state.chat.profile.displayPicture!=null&&
              <Image source={{uri:this.state.chat.profile.displayPicture}} style={{ width:54,height:54,borderRadius:27,backgroundColor:'#f2f2f2',borderWidth:2,borderColor: "#f2f2f2"}}/>
            }
            {this.state.chat!=undefined&&this.state.chat.profile.displayPicture==null&&
              <View style={{width:54,height:54,borderRadius:27,backgroundColor:'#f2f2f2',borderWidth:2,borderColor: "#f2f2f2",justifyContent:'center',alignItems:'center'}}>
                <FontAwesome name={'user'} size={40} color={'#fff'} />
              </View>
            }
            </View>
            <View style={{flex:0.8,}}>
              <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <View style={{flexDirection:'row',}}>
                  <View style={{flex:0.8,alignItems:'flex-start',justifyContent:'center'}}>
                    <MonoText   style={{ color:'#000',fontSize:18,fontWeight:'700'}} numberOfLines={1}>{this.state.chat.first_name} {this.state.chat.last_name}</MonoText> 
                  </View>
                  <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                    <MonoText   style={{ color:'#000',fontSize:10,fontWeight:'700'}}>{this.state.lastMessageDate}</MonoText> 
                  </View>
                </View>
                <View style={{flexDirection:'row',}}>
                  <View style={{flex:0.8,alignItems:'flex-start',justifyContent:'center'}}>
                  {this.state.chat.lastMessage!=null&&this.state.chat.lastMessage.length>0&&
                    <MonoText   style={{ color:'grey',fontSize:14,}} numberOfLines={1}>{this.state.chat.lastMessage}</MonoText> 
                  }
                  {this.state.chat.lastMessage!=null&&this.state.chat.lastMessage.length==0&&
                    <MonoText   style={{ color:'grey',fontSize:14,}} numberOfLines={1}>.....</MonoText> 
                  }
                  </View>
                  <View style={{flex:0.2,alignItems:'center',justifyContent:'center'}}>
                      {this.state.unreadMessages!=0&&
                        <View style={{padding:5,paddingVertical:2,backgroundColor:themeColor,borderRadius: 10,}}>
                          <MonoText   style={{ color:'#fff',fontSize:10,fontWeight:'700'}}>{this.state.chat.unreadMessages}</MonoText> 
                        </View>
                      }
                  </View>
                </View>
              </View>
            </View>
        </TouchableOpacity>
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
