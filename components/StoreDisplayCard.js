import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert,ImageBackground,AsyncStorage} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { MonoText } from './StyledText';
import settings from '../constants/Settings.js';

const { width } = Dimensions.get('window');
const height = width * 0.8;
const SERVER_URL = settings.url;
const storeType = settings.storeType;

export default class StoreDisplayCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open : false,
      store : props.multiOutletStore,
    }
  }

componentDidMount(){

}




  render() {

    return (
      <ImageBackground source={{uri: 'http://i.imgur.com/IGlBYaC.jpg'}} style={[styles.backgroundImage,{width:width,height:150}]}>
        <View style={styles.overlay}/>
        <View style={{flexDirection:'row'}}>
          <View style={{flex:0.6}}>
            <View style={{marginTop:5,marginLeft:5}}>
              <MonoText   style={{ color:'#fff',fontSize:22,fontWeight:'400'}}>{this.state.store.name}</MonoText> 
            </View>
            <View style={{marginTop:5,marginLeft:5}}>
              <MonoText   style={{ color:'#fff',fontSize:22,fontWeight:'400'}}>{this.state.store.pincode}</MonoText> 
            </View>
          </View>
          <View style={{flex:0.4,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>{this.props.onChange(this.state.store.pk)}} style={{borderWidth:1,borderRadius:10,borderColor:'#fff',paddingVertical:5,paddingHorizontal:10}}>
                <MonoText   style={{ fontSize:18,color:'#fff'}}>SELECT</MonoText> 
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
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
  },  backgroundImage: {
      flex: 1,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth:1,
      marginTop:5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'red',
    opacity: 0.3
  }

})
