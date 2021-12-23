import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { Icon } from "react-native-elements";
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8

export default class StarRating extends React.Component {
  constructor(props) {
    super(props);
    if(props.halfRated==undefined){
      var halfRated = false
    }else{
      var halfRated = props.halfRated
    }
    this.state = {
      starIcon : ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'],
      rateColor : ['#000','#000','#000','#000','#000'],
      starRating : props.rating ,
      size:props.size,
      color:props.color,
      halfRated:halfRated
    }

}

componentWillReceiveProps(nextProps){

  if(nextProps.halfRated==undefined){
    var halfRated = false
  }else{
    var halfRated = nextProps.halfRated
  }
  this.setState({halfRated:halfRated,starRating:nextProps.rating})
  this.setRating(nextProps.rating,halfRated)
}

setRating=(starRating,halfRated)=>{
  let count = starRating
  let arr = ['#000','#000','#000','#000','#000'];
  let staricon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'];
  if(starRating!=0&&isNaN(starRating)==false){
  arr.forEach((val,index)=>{
    if(!halfRated){
      if(index>count-1)return;
    }
    if(halfRated){
      if(index>count)return;
    }
    arr[index] = this.state.color
  })
  staricon.forEach((val,index)=>{
    if(!halfRated){
      if(index>count-1)return;
    }
    if(halfRated){
      if(index>count)return;
    }
    staricon[index] = 'ios-star'
    if(halfRated&&count==index){
      staricon[index] = 'ios-star-half'
    }
  })
}
  this.setState({starIcon:staricon, rateColor:arr, starRating:count});
}


componentDidMount(){
  // this.setRating()
}
render(){
  return(
    <View style={{flex:1,justifyContent: 'space-between',
    paddingHorizontal: 0,flexDirection:'row'}}>
    <View>
       <Icon type="ionicon" name={this.state.starIcon[0]} color={this.state.rateColor[0]} size={this.state.size} style={{textAlignVertical: 'center'}}/>
     </View  >
    <View>
       <Icon type="ionicon" name={this.state.starIcon[1]} color={this.state.rateColor[1]} size={this.state.size} style={{textAlignVertical: 'center'}}/>
     </View  >
    <View>
       <Icon type="ionicon" name={this.state.starIcon[2]} color={this.state.rateColor[2]} size={this.state.size} style={{textAlignVertical: 'center'}}/>
     </View  >
    <View>
       <Icon type="ionicon" name={this.state.starIcon[3]} color={this.state.rateColor[3]} size={this.state.size} style={{textAlignVertical: 'center'}}/>
     </View  >
    <View>
       <Icon type="ionicon" name={this.state.starIcon[4]} color={this.state.rateColor[4]} size={this.state.size} style={{textAlignVertical: 'center'}}/>
     </View  >
    </View>
  )
}

}
