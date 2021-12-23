import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import ImageOverlay from "react-native-image-overlay";
import { MonoText } from './StyledText';
import settings from '../constants/Settings.js';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

export default class CategoryCardV2 extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      category :  props.category
    }
  }
  openSubCategory = (item)=>{
    this.props.navigation.navigate('SubCategoryView', {
        subCategory : item,title: entities.decode(item.name)
    })
  }


  render() {
    const { category } = this.props
    if(this.state.category.mobileBanner != null){
      var img = {uri:SERVER_URL+this.state.category.mobileBanner}
    }else{
      var img = require('../assets/images/background_curosel.png')
    }

    return (

      <View style={{}}>
        <View style={{}}>
           <View style={{backgroundColor:'#f2f2f2',paddingHorizontal:2,paddingVertical:2}}>
             <MonoText   style={{ color:'#000',fontSize:16,fontWeight:'700',marginHorizontal:15}}>
               {entities.decode(this.state.category.name)}
             </MonoText>
           </View>
           <View style={{backgroundColor:'#fff',paddingHorizontal:2,paddingVertical:2}}>
           <FlatList style={{}}
             data={this.state.category.child}
             initialNumToRender={10}
             renderItem={({ item }) => (
               <TouchableOpacity style={{flex:0.33,alignItems:'center',marginVertical:7}} onPress={() => this.openSubCategory(item)}>
                 <Image source={{uri:SERVER_URL+item.img}} style={{ width:80,height:60,backgroundColor:'#fff',overflow: "hidden",borderWidth:2,
                  borderColor: "#f2f2f2"}}/>
                 <MonoText   numberOfLines={2} style={{fontSize:12, textAlign:'center',marginTop:4}}>{entities.decode(item.name)}</MonoText>
               </TouchableOpacity>
             )}
             numColumns={3}
             keyExtractor={(item, index) => index}
           />
           </View>
        </View>
      </View>
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
