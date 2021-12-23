import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform} from 'react-native';
import { FontAwesome,Ionicons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
import { MonoText } from './StyledText';
const height = width * 0.8
const SERVER_URL = 'https://happypockets.in'
import { Dropdown } from 'react-native-material-dropdown-v2';


export default class IconWithBadge extends React.Component {
  render() {
    const { name, color, size } = this.props;
    badgeCount = 200
    return (
      <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {badgeCount > 0 && (
          <View
            style={
            {
              position: 'absolute',
              right:-12,
              top:-6,
              fontSize:14,
              fontWeight:'700',
              backgroundColor: '#fff',
              borderWidth: 1,
              color:'#efa834',
              borderColor: '#efa834',
              borderRadius: 12,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
              textAlign:'center',
            }}
          >
            <MonoText   style={{ color: color, fontSize: 10, fontWeight: 'bold' }}>
              {badgeCount}
            </MonoText>
          </View>
        )}
      </View>
    );
  }
}
