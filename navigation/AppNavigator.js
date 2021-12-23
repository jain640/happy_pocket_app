import React from 'react';
import {createAppContainer, createSwitchNavigator } from 'react-navigation';
import initialNavigator from './MainTabNavigator';
import StoreScreen from '../screens/StoreScreen';
import RequestForm from '../screens/RequestForm';
import { createStackNavigator } from 'react-navigation-stack'


const StoreStack = createStackNavigator(
  {
    StoreScreen:StoreScreen,
    RequestForm:RequestForm,
  },
  {
    initialRouteName:'StoreScreen'
  }
)

export default createAppContainer(createSwitchNavigator({
  Store:StoreStack,
  Main:initialNavigator,
 },{
  initialRouteName:'Store'
}
));
