import React from 'react';
import { Platform, StatusBar, StyleSheet, View,AsyncStorage ,AppState,Vibration,Image} from 'react-native';
import { AppLoading } from 'expo';
import   * as Font  from 'expo-font';
import * as Icon   from '@expo/vector-icons';
import {  Asset } from 'expo-asset';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import store from './store';
import { useFonts } from '@use-expo/font';
import * as SplashScreen from 'expo-splash-screen';
import settings from './constants/Settings.js';
const themeColor = settings.themeColor
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
// BackgroundFetch.setMinimumIntervalAsync(60);
// const taskName = 'test-background-fetch';
// TaskManager.defineTask(taskName, async () => {
//   console.log('background fetch running');
//   return BackgroundFetch.Result.NewData;
// });
// console.log('task defined');



//  export default class App extends React.Component {
//   state = {
//     isLoadingComplete: false,
//   };
//   //
//   // registerTaskAsync = async () => {
//   //   await BackgroundFetch.registerTaskAsync(taskName);
//   //   console.log('task registered');
//   // };
//
//
//   componentDidMount() {
//
//     // this.registerTaskAsync();
//   }
//
//
//
//
//
//
//   render() {
//     if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen&&!fontsLoaded) {
//       return (
//         <AppLoading
//           startAsync={this._loadResourcesAsync}
//           onError={this._handleLoadingError}
//           onFinish={this._handleFinishLoading}
//         />
//       );
//     } else {
//       return (
//         <Provider store = {store}>
//         <View style={styles.container}>
//           {Platform.OS === 'ios' && <StatusBar backgroundColor="black" barStyle="light-content" />}
//           <AppNavigator />
//         </View>
//         </Provider>
//       );
//     }
//   }
//
//   _loadResourcesAsync = async () => {
//     return Promise.all([
//       Asset.loadAsync([
//         require('./assets/images/robot-dev.png'),
//         require('./assets/images/robot-prod.png'),
//       ]),
//       Font.loadAsync({
//         ...Icon.Ionicons.font,
//         'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
//       }),
//     ]);
//   };
//
//   _handleLoadingError = error => {
//     console.warn(error);
//   };
//
//   _handleFinishLoading = () => {
//     this.setState({ isLoadingComplete: true });
//   };
// }


// export default (props) => {
//   let [fontsLoaded] = useFonts({
//      'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
//      'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
//      'OpenSans-Light': require('./assets/fonts/OpenSans-Light.ttf'),
//      'OpenSans-Italic': require('./assets/fonts/OpenSans-Italic.ttf'),
//      'OpenSans-LightItalic': require('./assets/fonts/OpenSans-LightItalic.ttf'),
//    });
//   if (!fontsLoaded) {
//     return <AppLoading />;
//   } else {
//     return (
//       <Provider store = {store}>
//       <View style={styles.container}>
//         {Platform.OS === 'ios' && <StatusBar backgroundColor="black" barStyle="light-content" />}
//         <AppNavigator />
//       </View>
//       </Provider>
//     );
//   }
// };

export default class App extends React.Component {
  state = {
    appIsReady: false,
  };

  async componentDidMount() {
    // Prevent native splash screen from autohiding
    try {
      await SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.warn(e);
    }
    this.prepareResources();
  }

  /**
   * Method that serves to load resources and make API calls
   */
  prepareResources = async () => {

    this.setState({ appIsReady: true }, async () => {
      await SplashScreen.hideAsync();
    });
  }

  render() {
    if (!this.state.appIsReady) {
      return null
    }

     return (
       <Provider store = {store}>
       <View style={styles.container}>
         {Platform.OS === 'ios' && <StatusBar backgroundColor="black" barStyle="light-content" />}
         <AppNavigator />
       </View>
       </Provider>
     );


  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
