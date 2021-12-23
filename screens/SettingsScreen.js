import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import settings from '../constants/Settings.js';
import { MonoText } from '../components/StyledText';
export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'app.json',
  };

  render() {

    return <ExpoConfigView />;
  }
}





    _pickImage = async () => {
        let response = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });


        if (!response.cancelled) {
          this.setState({ image: response.uri });
          let localUri = response.uri;
          let filename = localUri.split('/').pop();
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;
          let img = new FormData();
          const photo = {
            uri: localUri,
            type: response.type,
            name:filename,
            data: response.data
          };

          img.append('attachmentType', 'image');
          img.append('uid' , this.state.uid);
          img.append('attachment', photo);

          this.textInput.clear()
          fetch(serverURL + "/api/support/supportChat/", {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: img,
          }).then((response) => {
          return response.json()})
          .then((responseJson) => {
            let dataToPublish = [this.state.uid, 'M', responseJson, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

            this.state.connection.session.publish(wamp_prefix+'service.support.agent', dataToPublish, {}, {
              acknowledge: true
            })
            responseJson.message = '<img style="width:50%;height:30%" src="'+ responseJson.attachment +'" >' ;
            responseJson.timeDate = this.timeWithDate(new Date())
            this.setState(prevState => ({
              data: [ ...prevState.data, responseJson],
            }))
          })
          .catch((error) => {
            return
          });
        }
      };
