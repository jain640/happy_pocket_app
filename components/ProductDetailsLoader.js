import React, { Component } from "react";
import { View, Image, StyleSheet, Text,Dimensions } from "react-native";
import { PropTypes } from "prop-types";
import Modal from "react-native-modal";
import { MonoText } from './StyledText';
const {width,height}=Dimensions.get("window");
export default class ProductDetailsLoader extends Component {
  render() {
    const { animationType, modalVisible,hasBackdrop } = this.props;
    return (
      <Modal
        animationType={animationType}
        transparent={true}
        visible={modalVisible}
        hasBackdrop={hasBackdrop}
      >
        <View style={[styles.wrapper,{backgroundColor:"transparent"}]}>
          <View style={[styles.loaderContainer,{backgroundColor:"transparent"}]}>
            <Image
              style={styles.loaderImage}
              source={require("../assets/images/greenLoader.gif")}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

ProductDetailsLoader.propTypes = {
  animationType: PropTypes.string.isRequired,
  modalVisible: PropTypes.bool.isRequired
};
const styles = StyleSheet.create({
  wrapper: {
    zIndex: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0
  },
  loaderContainer: {
    width: 90,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 15,
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -45,
    marginTop: -45
  },
  loaderImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    position: "relative",
    left: "50%",
    marginLeft: -35,
    top: "50%",
    marginTop: -35
  }
});
