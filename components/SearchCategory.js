import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button,ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import * as actionTypes from '../actions/actionTypes';
import { withNavigationFocus } from 'react-navigation';
import { MonoText } from './StyledText';
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
class SearchCategoryCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      product : props.product,
      type:props.product.typ,
      visual:SERVER_URL + '/media/' +  props.product.visual,
      categories:[],
      store:props.store
    }
  }

  componentDidMount() {
    fetch(SERVER_URL + '/api/POS/categorysortlist/')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ categories: responseJson })
      })
      .catch((error) => {
        return
      });
  }

  componentWillReceiveProps({product}){
    this.setState({product:product,type:product.typ,visual:SERVER_URL + '/media/' +  product.visual})
  }

  gotoCategory=()=>{
    for (var i = 0; i < this.state.categories.length; i++) {
      if(this.state.categories[i].pk == this.state.product.pk){
        var child = []
        for (var j = 0; j < this.state.categories[i].child.length; j++) {
          child.push(this.state.categories[i].child[j].pk)
        }
        this.props.navigation.navigate('SubCategoryView', {
            subCategory : this.state.product,title: this.state.product.name,parent:true,child:child
        })
        return
      }
    }
    this.props.navigation.navigate('SubCategoryView', {
        subCategory : this.state.product,title: this.state.product.name
    })
  }


  render() {
    const color = this.props.store.themeColor
    const themeColor = this.props.store.themeColor

    return (
      <View style={{flex:1,width:width,}}>
      <ScrollView style={{flex:1,}}>
         <Card  containerStyle={[styles.shadow, {  marginTop: 10, marginBottom: 10,padding:0, borderWidth:0}]}>
           <View style={{flex:1,flexDirection: 'row',justifyContent: 'center',alignItems: 'flex-start',}}>
             <View style={{flex:1,alignItems:'flex-start',width:width*0.2,}}>
             { this.state.visual == null ||this.state.visual == 'undefined' ||this.state.visual == ''   &&
               <MonoText   style={{fontSize:14,color:"#000"}}>Image Not Found </MonoText>
             }
             { this.state.visual != null &&
               <Image style={{width:'80%',height:width*0.3}} source={{uri: this.state.visual}} />
             }
             </View>

             <View style={{flex:1,alignItems:'flex-start',justifyContent:'flex-start',paddingTop:width*0.03,width:width*0.6,paddingBottom:10}}>
               <MonoText   style={{fontSize:16,color:"#000"}}>{this.state.product.name} </MonoText>
               <TouchableOpacity onPress={()=>this.gotoCategory()} style={{backgroundColor : themeColor,padding:5,paddingVertical:2,marginTop:15}}>
                <MonoText   style={{textAlign: 'center', color:'white',fontSize:18}} >View Products</MonoText>
               </TouchableOpacity>
             </View>
           </View>
         </Card>
          </ScrollView>
      </View>
    );
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


export default withNavigationFocus(SearchCategoryCard)
