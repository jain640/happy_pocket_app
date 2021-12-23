import React,{Component} from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TextInput,Alert,Dimensions,AsyncStorage,Keyboard,
  TouchableOpacity,LayoutAnimation,KeyboardAvoidingView,
  View,Button,ImageBackground,FlatList
} from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
import Constants from 'expo-constants';
import { MonoText } from '../components/StyledText';

import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

const IS_IOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');

export default class CameraScreen extends Component {

    static navigationOptions =  ({ navigation }) => {
    const { params = {} } = navigation.state
         return {header:null
         }
    }

    constructor () {
        super();
        this.state ={
              imageUri:null,
              type:Camera.Constants.Type.back,
          }
      }

    cameraChange = () => {
        this.setState({
        type:
          this.state.type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
        });
    };

   cameraRef = React.createRef();

    handlePhoto = async () => {
      if(this.cameraRef){
        let picture = await this.cameraRef.current.takePictureAsync({quality: 1});
        this.setState({ imageUri: picture.uri });
        this.props.navigation.state.params.onGoBack(picture)
        this.props.navigation.goBack()
     }
    }

    render(){
      return(
        <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }} type={this.state.type} ref={this.cameraRef}>
                <View style={{ flex: 1,backgroundColor: 'transparent',flexDirection: 'row',alignItems: 'flex-end',}}>
                    <View style={{flex:0.6,justifyContent: 'center',alignItems: 'flex-end',}}>
                        <TouchableOpacity
                            style={{width:60, height:60,borderWidth:5,borderColor:'#fff', borderRadius:30, backgroundColor:"transparent",marginBottom:20}}
                            onPress={this.handlePhoto} />
                    </View>
                    <View style={{flex:0.4,justifyContent: 'center',alignItems: 'flex-end',backgroundColor: 'transparent',}}>
                        <TouchableOpacity
                            style={{  backgroundColor:"transparent",marginBottom:30,marginRight:10,borderWidth:0}}
                            onPress={this.cameraChange} >
                            <Ionicons name="md-reverse-camera" size={40} style={{marginRight:5,color:'#fff',textAlign: 'center',marginRight:10}} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Camera>
        </View>
      )
    }
  }
