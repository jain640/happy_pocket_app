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

export default class Categorycard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open : false,
      category :  props.category
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

  render() {


    const { category } = this.props

    if(this.state.category.mobileBanner != null){
      var img = {uri:SERVER_URL+this.state.category.mobileBanner}
    }else{
    var img = require('../assets/images/background_curosel.png')
  }




    return (

      <View style={styles.item}>
        <TouchableOpacity onPress={() => this.toggle()}>
         <ImageOverlay
           source={ img }
           overlayColor="black"
           overlayAlpha={0.5}
           title={this.state.category.name}
           contentPosition="bottom"
           titleStyle={{ fontWeight: 'bold' }}
           height={this.state.open ? 60 :130}
            />
        </TouchableOpacity>
        {this.state.open?<FlatList style={{borderWidth:2,borderColor : '#eeeeee' ,}}
          data={this.state.category.child}
          renderItem={({ item }) => (
            <TouchableOpacity style={{flex:0.5}} onPress={() => this.openSubCategory(item)}>
              <Card  containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, marginTop: 10, marginBottom: 10, }]}>
                <MonoText style={{fontSize:11}}>{item.name}</MonoText>
              </Card>
            </TouchableOpacity>
          )}
          numColumns={2}
          keyExtractor={(item, index) => index}
        />:<View></View>}


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
