import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8

export default class CoinFaq extends React.Component {

render(){
  return(
    <ScrollView style={{flex:1,paddingHorizontal:25,paddingVertical: 15}}>
      <MonoText   style={{ }}>CoinFaq</MonoText>
    </ScrollView>
  )
}

}
