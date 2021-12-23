import * as React from 'react';
import {Animated, StatusBar, View, Text, Image, Dimensions,TouchableWithoutFeedback, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView,AsyncStorage,ActivityIndicator, TouchableNativeFeedback} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import Toast, {DURATION} from 'react-native-easy-toast';
import settings from '../constants/Settings.js';
import { NavigationActions } from 'react-navigation';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const storeType = settings.storeType

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

export default class CategoryScroll extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      categories:[],
      store: props.store,
      selectedStore: props.selectedStore,
    }
  }
  componentDidMount(){
     this.getCategory()
  }

  getCategories=(categoryList)=>{
    fetch(SERVER_URL + '/api/POS/categorysortlist/?store='+this.state.store.pk)
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson==undefined){
          return
        }
        this.setState({ categories: responseJson })
      })
      .catch((error) => {
        return
      });
  }

  getCategory=()=>{
    fetch(SERVER_URL + '/api/POS/uielements/')
     .then((response) => response.json())
     .then((responseJson) => {
       var categoriesList = []
       responseJson.forEach((i)=>{
         if(i.type=='categories_list'&&i.isAvailableInApp){
           categoriesList.push(i)
         }
       })
       if(categoriesList.length>0){
         this.getCategories(categoriesList[0])
       }
     })
     .catch((error) => {
       return
     });
  }

  openSubCategory = (item)=>{
    console.log(item,'hhhhhhhhhhh');
    if(storeType=='MULTI-VENDOR'){
      this.props.navigation.navigate('SubCategoryList', {
          subCategory : item,title: entities.decode(item.name),color:this.state.store.themeColor
      })
    }else{
      this.props.navigation.navigate('SubCategoryView', {
          subCategory : item,title: entities.decode(item.name)
      })
    }

  }

render(){
  var themeColor = this.state.store.themeColor

  return(
    <View style={{flex:1,borderColor : '#f2f2f2' , borderWidth:0,}}>
      {this.state.categories.length>0 && <View style={{height:40,justifyContent:'center',borderBottomWidth:0,borderColor:'#f2f2f2',width:width, flexDirection:'row'}}>
        <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,}}>Categories</MonoText>
        <TouchableNativeFeedback style={{ width:60}} onPress={()=>{this.props.navigation.navigate('CategoriesScreen')}} >
          <MonoText style={{ fontSize: 16, color: '#808080', alignSelf: 'flex-start', fontWeight: '700', marginHorizontal: 20,borderWidth:1, backgroundColor:'#fff', borderColor:'#000', borderRadius:3, paddingVertical:4, paddingHorizontal:8, marginLeft:'auto'}}>View All</MonoText>                          
        </TouchableNativeFeedback>
      </View>
      }
      <FlatList style={{flex:1,margin:0,backgroundColor:'#fff', paddingLeft: 10,}}
        data={this.state.categories.slice(6)}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        numColumns={3}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        renderItem={({item, index}) => (
          <View style={{flex:1,backgroundColor:'#fff',paddingRight:index==(this.state.categories.length-1)?15:0,paddingVertical: 15,}}>
            <TouchableWithoutFeedback onPress={() => this.openSubCategory(item)}>
              <View style={{}}>
                <View style={{flex:1,}}>
                  <View style={{height:width*0.25,alignItems: 'center',justifyContent: 'flex-end',marginHorizontal:5, borderWidth:1, borderColor:'#ccc'}}>
                      <Image
                      source={{uri:SERVER_URL+item.img}}
                      style={{ resizeMode: 'contain', flex: 1, aspectRatio: 1}}
                      />
                  </View>
                  <View style={{height:width*0.13,alignItems: 'center',justifyContent: 'flex-start',marginHorizontal:5,marginTop:5}}>
                  <MonoText   style={{  color: '#000',fontSize: 14,fontWeight:'400',textAlign:'center', }} numberOfLines={2}>{entities.decode(item.name)}</MonoText>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
      />
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
    elevation: 3,
  }
})
