import React, { Component } from 'react';
import { View, StyleSheet, Keyboard,AsyncStorage
, TouchableWithoutFeedback, Text, Dimensions
, KeyboardAvoidingView, Platform, TouchableOpacity ,Button} from 'react-native';
import { Permissions, ImagePicker } from 'expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  CNRichTextEditor , { CNToolbar , getDefaultStyles, convertToObject ,getInitialObject,convertToHtmlString} from "react-native-cn-richtext-editor";

import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    MenuContext,
    MenuProvider,
  } from 'react-native-popup-menu';


const IS_IOS = Platform.OS === 'ios';
const { width, height } = Dimensions.get('window');
const defaultStyles = getDefaultStyles();
class RichTextScreen extends Component {

    constructor(props) {
        super(props);
        this.customStyles = {...defaultStyles, body: {fontSize:16}, heading : {fontSize:18}
        , title : {fontSize:20}, ol : {fontSize:16 }, ul: {fontSize:16}, bold: {fontSize:18, fontWeight:'bold', color:''}
        };
        this.state = {
            selectedTag : 'body',
            selectedColor : 'default',
            selectedHighlight: 'default',
            colors : ['red', 'green', 'blue', 'red', 'green', 'blue',],
            highlights:['yellow_hl','pink_hl', 'orange_hl', 'green_hl','purple_hl','blue_hl'],
            selectedStyles : [],
            value: [getInitialObject()]
        };
        this.editor = null;
    }

    onStyleKeyPress = (toolType) => {
         if (toolType == 'image') {
            return;
          }else {
            this.editor.applyToolbar(toolType);
          }
        }

    onSelectedTagChanged = (tag) => {
        this.setState({
            selectedTag: tag
        })
    }

    onSelectedStyleChanged = (styles) => {
        const colors = this.state.colors;
        const highlights = this.state.highlights;
        let sel = styles.filter(x=> colors.indexOf(x) >= 0);
        let hl = styles.filter(x=> highlights.indexOf(x) >= 0);
        this.setState({
            selectedStyles: styles,
            selectedColor : (sel.length > 0) ? sel[sel.length - 1] : 'default',
            selectedHighlight : (hl.length > 0) ? hl[hl.length - 1] : 'default',
        })
      }

    onValueChanged = (value) => {
        this.setState({
            value: value
        });
        AsyncStorage.setItem("richtext", (this.setState({
            value: value
        })))
      }

    insertImage(url) {
      this.editor.insertImage(url);
    }

    askPermissionsAsync = async () => {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const cameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        this.setState({
        hasCameraPermission: camera.status === 'granted',
        hasCameraRollPermission: cameraRoll.status === 'granted'
        });
    };

    useLibraryHandler = async () => {
        await this.askPermissionsAsync();
        let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 4],
        base64: false,
        });
        this.insertImage(result.uri);
    };

    useCameraHandler = async () => {
        await this.askPermissionsAsync();
        let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        base64: false,
        });
        console.log(result);
        this.insertImage(result.uri);
    };

    onImageSelectorClicked = (value) => {
        if(value == 1) {
            this.useCameraHandler();
          }else if(value == 2){
            this.useLibraryHandler();
            }
      }

    onColorSelectorClicked = (value) => {
      if(value === 'default') {
            this.editor.applyToolbar(this.state.selectedColor);
        }else {
            this.editor.applyToolbar(value);
          }
          this.setState({
            selectedColor: value
        });
    }

    onHighlightSelectorClicked = (value) => {
        if(value === 'default') {
            this.editor.applyToolbar(this.state.selectedHighlight);
        }else {
            this.editor.applyToolbar(value);
          }
          this.setState({
            selectedHighlight: value
        });
    }

    onRemoveImage = ({url, id}) => {
        console.log(`image removed (url : ${url})`);
      }

    renderImageSelector() {
        return (
            <Menu  onSelect={this.onImageSelectorClicked}>
            <MenuTrigger>
                <MaterialCommunityIcons name="image" size={20} color="#737373" />
            </MenuTrigger>
            <MenuOptions  optionsContainerStyle={{marginTop:-60,}}>
                <MenuOption value={1}>
                    <MonoText   style={styles.menuOptionText}>
                        Take Photo
                    </MonoText> 
                </MenuOption>
                <View style={styles.divider}/>
                <MenuOption value={2} >
                    <MonoText   style={styles.menuOptionText}>
                        Photo Library
                    </MonoText> 
                </MenuOption>
                <View style={styles.divider}/>
                <MenuOption value={3}>
                    <MonoText   style={styles.menuOptionText}>
                        Cancel
                    </MonoText> 
                </MenuOption>
            </MenuOptions>
            </Menu>
        );

    }

    renderColorMenuOptions = () => {
      let lst = [];
      if(defaultStyles[this.state.selectedColor]) {
             lst = this.state.colors.filter(x => x !== this.state.selectedColor);
             lst.push('default');
            lst.push(this.state.selectedColor);
        }else {
            lst = this.state.colors.filter(x=> true);
            lst.push('default');
        }return (
          lst.map( (item) => {
                let color = defaultStyles[item] ? defaultStyles[item].color : 'black';
                return (
                    <MenuOption value={item} key={item} >
                        <MaterialCommunityIcons name="format-color-text" color={color}
                        size={20} />
                    </MenuOption>
                );
            })
          );
        }

    renderHighlightMenuOptions = () => {
        let lst = [];
        if(defaultStyles[this.state.selectedHighlight]) {
             lst = this.state.highlights.filter(x => x !== this.state.selectedHighlight);
             lst.push('default');
            lst.push(this.state.selectedHighlight);
        }else {
            lst = this.state.highlights.filter(x=> true);
            lst.push('default');
        }return (
          lst.map( (item) => {
                let bgColor = defaultStyles[item] ? defaultStyles[item].backgroundColor : 'black';
                return (
                    <MenuOption value={item} key={item}>
                        <MaterialCommunityIcons name="marker" color={bgColor}
                        size={20} />
                    </MenuOption>
                  );
            })
          );
        }

    renderColorSelector() {
        let selectedColor = '#737373';
        if(defaultStyles[this.state.selectedColor])
        {
            selectedColor = defaultStyles[this.state.selectedColor].colors;
        }
        return (
            <Menu  onSelect={this.onColorSelectorClicked}>
            <MenuTrigger>
                <MaterialCommunityIcons name="format-color-text" color={selectedColor}
                        size={20} style={{
                            }} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={optionsStyles.optionsContainer}>
                {this.renderColorMenuOptions()}
            </MenuOptions>
            </Menu>
        );
    }

    renderHighlight() {
        let selectedColor = '#737373';
        if(defaultStyles[this.state.selectedHighlight])
        {
            selectedColor = defaultStyles[this.state.selectedHighlight].backgroundColor;
        }
        return (
            <Menu  onSelect={this.onHighlightSelectorClicked}>
            <MenuTrigger>
                <MaterialCommunityIcons name="marker" color={selectedColor}
                        size={18} style={{
                        }} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={highlightOptionsStyles.optionsContainer}>
                {this.renderHighlightMenuOptions()}
            </MenuOptions>
            </Menu>
        );
    }

    render() {

      return (
            <KeyboardAvoidingView
            behavior="padding"
            enabled
            keyboardVerticalOffset={IS_IOS ? 0 : 0}
            style={[styles.root,{borderWidth:0,
            borderColor:'#1a396f',
            margin:0,
            marginTop:0,
            borderRadius:0
            }]}>
            <MenuProvider style={{flex: 1}}>
              <View style={[styles.toolbarContainer,{borderWidth:0,
                  borderColor:'#1a396f',borderRadius:7}]}>
                  <CNToolbar


                        style={{
                            height: 30,borderRadius:0
                        }}
                        iconSetContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                        }}
                        size={20}
                        iconSet={[
                            {
                                type: 'tool',
                                iconArray: [{
                                    toolTypeText: 'bold',
                                    buttonTypes: 'style',
                                    iconComponent: <MaterialCommunityIcons name="format-bold" />
                                },
                                {
                                    toolTypeText: 'italic',
                                    buttonTypes: 'style',
                                    iconComponent: <MaterialCommunityIcons name="format-italic" />
                                },
                                {
                                    toolTypeText: 'body',
                                    buttonTypes: 'tag',
                                    iconComponent:
                                    <MaterialCommunityIcons name="format-text" />
                                },
                                {
                                    toolTypeText: 'heading',
                                    buttonTypes: 'tag',
                                    iconComponent:
                                    <MaterialCommunityIcons name="format-header-3" />
                                },
                                {
                                    toolTypeText: 'ul',
                                    buttonTypes: 'tag',
                                    iconComponent:
                                    <MaterialCommunityIcons name="format-list-bulleted" />
                                },
                                {toolTypeText: 'color',
                                 iconComponent: this.renderColorSelector()
                                }
                            ]
                            },


                        ]}
                    selectedTag={this.state.selectedTag}
                    selectedStyles={this.state.selectedStyles}
                    onStyleKeyPress={this.onStyleKeyPress}
                    backgroundColor="aliceblue" // optional aliceblue (will override default backgroundColor)
                    color="gray" // optional (will override default color)
                    selectedColor='white' // optional (will override default selectedColor)
                    selectedBackgroundColor='#898d8e' // optional  deepskyblue(will override default selectedBackgroundColor)
                    />
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
                    <View style={[styles.main,{marginTop:2,}]}>
                        <CNRichTextEditor
                            ref={input => this.editor = input}
                            onSelectedTagChanged={this.onSelectedTagChanged}
                            onSelectedStyleChanged={this.onSelectedStyleChanged}
                            value={this.state.value}
                            style={[styles.editor,{marginTop:2,}]}
                            styleList={this.customStyles}
                            foreColor='dimgray' // optional (will override default fore-color)
                            onValueChanged={this.onValueChanged}
                            onRemoveImage={this.onRemoveImage}
                            contentContainerStyle={{}}
                        />
                    </View>
                </TouchableWithoutFeedback>
              </MenuProvider>
        </KeyboardAvoidingView>
        );
    }
}

var styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: 0,
        backgroundColor:'transparent',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    main: {
        flex: 1,
        marginTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 1,
        paddingTop:1,
        alignItems: 'stretch',
    },
    editor: {
        backgroundColor : '#fff',
        minHeight:150,
        borderRadius:0,
    },
    toolbarContainer: {
        minHeight: 30
    },
    menuOptionText: {
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5
    },
    divider: {
        marginVertical: 0,
        marginHorizontal: 0,
        borderBottomWidth: 1,
        borderColor: '#1a396f'
    }
});

const optionsStyles = StyleSheet.create({
    optionsContainer: {
      backgroundColor: '#757d80',
      padding: 0,
      width: 40,
      marginLeft:-25,
      alignItems: 'flex-end',
      backgroundColor: 'white',
      marginTop:20,
    },
  });

const highlightOptionsStyles = StyleSheet.create({
optionsContainer: {
    backgroundColor: '#757d80',
    padding: 0,
    width: 40,
    marginLeft: 0,
    alignItems: 'flex-end',
    backgroundColor: 'white',
    margin: 20,
  },
});

export default RichTextScreen;
