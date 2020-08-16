import React from "react";
import {ScrollView, View, StyleSheet, Linking, Platform, Alert} from "react-native";
import {Button, Text, Icon} from "components";
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import Modal from "react-native-modal";
import Login from "../auth/Login";
import {getVersion} from "react-native-device-info";
import {isEmpty} from "lodash";
import {logout} from "store/actions";

class Drawer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModal: false,
      isContactModalOpen: false,
    };
  }

  openModal = () => {
    //this.setState({isOpenModal: true});
    this.props.navigation.navigate("Auth", {NeedLogin: true, NeedRegister: false});
  };

  closeModal = () => {
    this.setState({isOpenModal: false});
  };

  toggleContactModal = () => {
    this.setState({isContactModalOpen: !this.state.isContactModalOpen});
  };

  navigateToScreen = (route, param = {}) => () => {
    const {navigation} = this.props;
    switch (route) {
      case "giveFeedback":
        Alert.alert(
          "Do You like using WooApp",
          null,
          [
            {text: "NOT REALLY", onPress: () => console.log("Cancel Pressed"), style: "cancel"},
            {
              text: "YES!",
              onPress: () => {
                if (Platform.OS != "ios") {
                  Linking.openURL(`market://details?id=${"com.phoeniixx.wooapp"}`).catch(err =>
                    alert("Please check for the Google Play Store"),
                  );
                } else {
                  Linking.openURL(
                    `itms://itunes.apple.com/in/app/apple-store/${APPLE_STORE_ID}`,
                  ).catch(err => alert("Please check for the App Store"));
                }
              },
            },
          ],
          {cancelable: false},
        );
        break;
      case "Logout":
        this.props.logout();
        navigation.closeDrawer();
        break;
      default:
        navigation.closeDrawer();
        navigation.navigate(route, param);
        break;
    }
  };

  contactUs = async () => {
    await this.props.navigation.closeDrawer();
    this.toggleContactModal();
  };

  render() {
    const {
      appSettings: {wallet_active, direct_tawk_id, primary_color, accent_color},
      t,
      user,
    } = this.props;
    const {isOpenModal, isContactModalOpen} = this.state;

    return (
      <>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="account-circle" type="MaterialCommunityIcons" style={{fontSize: 54}} />
            {isEmpty(user) ? (
              <Text style={{fontSize: 16}} onPress={this.openModal}>
                {t("LOGIN/REGISTER")}
              </Text>
            ) : (
              <View style={{alignItems: "center"}}>
                <Text style={{fontSize: 16}}>
                  {user.first_name && user.last_name
                    ? user.first_name + " " + user.last_name
                    : user.first_name
                    ? user.first_name
                    : user.username
                    ? user.username
                    : ""}
                </Text>
                <Text>{user.email}</Text>
              </View>
            )}
          </View>
          <ScrollView>
            <Button style={styles.button} onPress={this.navigateToScreen("HomeStack")}>
              <Icon name="home" type="FontAwesome" style={styles.icon} />
              <Text style={styles.text}>{t("HOME")}</Text>
            </Button>

            <Button style={styles.button} onPress={this.navigateToScreen("ProductScreen")}>
              <Icon name="shopping-bag" type="FontAwesome" style={styles.icon} />
              <Text style={styles.text}>{t("SHOP")}</Text>
            </Button>

            <Button style={styles.button} onPress={this.navigateToScreen("CategoryScreen")}>
              <Icon name="archive" type="Entypo" style={styles.icon} />
              <Text style={styles.text}>{t("CATEGORIES")}</Text>
            </Button>
            <View style={styles.divider} />
            {!isEmpty(user) && (
              <>
                <Button style={styles.button} onPress={this.navigateToScreen("OrderStack")}>
                  <Icon name="list-unordered" type="Octicons" style={styles.icon} />
                  <Text style={styles.text}>{t("ORDERS")}</Text>
                </Button>
                <Button style={styles.button} onPress={this.navigateToScreen("AccountSetting")}>
                  <Icon name="md-settings" style={styles.icon} />
                  <Text style={styles.text}>{t("ACCOUNT")}</Text>
                </Button>
                <Button style={styles.button} onPress={this.navigateToScreen("ManageAddress")}>
                  <Icon name="note" type="SimpleLineIcons" style={styles.icon} />
                  <Text style={styles.text}>{t("MANAGE_ADDRESS")}</Text>
                </Button>
                <Button style={styles.button} onPress={this.navigateToScreen("Notification")}>
                  <Icon name="bell" type="Feather" style={styles.icon} />
                  <Text style={styles.text}>{t("NOTIFICATIONS")}</Text>
                </Button>
                <Button style={styles.button} onPress={this.navigateToScreen("Download")}>
                  <Icon name="download" type="Entypo" style={styles.icon} />
                  <Text style={styles.text}>{t("DOWNLOAD")}</Text>
                </Button>
                {wallet_active && (
                  <Button style={styles.button} onPress={this.navigateToScreen("WalletStack")}>
                    <Icon name="wallet" type="Entypo" style={styles.icon} />
                    <Text style={styles.text}>{t("WALLET")}</Text>
                  </Button>
                )}
                <View style={styles.divider} />
              </>
            )}

            {direct_tawk_id != "" && (
              <Button
                style={styles.button}
                onPress={this.navigateToScreen("TawkToChat", {uri: direct_tawk_id})}>
                <Icon name="chat" type="Entypo" style={styles.icon} />
                <Text style={styles.text}>{t("CHAT_SUPPORT")}</Text>
              </Button>
            )}
            <Button style={styles.button} onPress={this.contactUs}>
              <Icon name="md-call" style={styles.icon} />
              <Text style={styles.text}>{t("CONTACT")}</Text>
            </Button>
            <Button style={styles.button} onPress={this.navigateToScreen("TermAndCondition")}>
              <Icon name="tools" type="Entypo" style={styles.icon} />
              <Text style={styles.text}>{t("TOS")}</Text>
            </Button>
            <Button style={styles.button} onPress={this.navigateToScreen("giveFeedback")}>
              <Icon name="feedback" type="MaterialIcons" style={styles.icon} />
              <Text style={styles.text}>{t("GIVE_FEEDBACK")}</Text>
            </Button>
            {!isEmpty(user) && (
              <Button style={styles.button} onPress={this.navigateToScreen("Logout")}>
                <Icon name="logout" type="MaterialCommunityIcons" style={styles.icon} />
                <Text style={styles.text}>{t("SIGN_OUT")}</Text>
              </Button>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Text style={{fontSize: 12, fontWeight: "300"}}>{t("v") + getVersion()}</Text>
          </View>
        </View>
        <Modal
          isVisible={isOpenModal}
          style={{margin: 0}}
          onBackButtonPress={this.closeModal}
          useNativeDriver
          hideModalContentWhileAnimating>
          <Login onClose={this.closeModal} navigation={this.props.navigation.state.params} />
        </Modal>

        <Modal
          isVisible={isContactModalOpen}
          style={{justifyContent: "flex-end", margin: 0, marginTop: "auto"}}
          onBackButtonPress={this.toggleContactModal}
          onBackdropPress={this.toggleContactModal}
          hasBackdrop
          useNativeDriver
          hideModalContentWhileAnimating>
          <View style={{backgroundColor: "#FFF", padding: 10}}>
            <Text style={{fontSize: 20}}>Contact Us</Text>
            <View
              style={{
                height: 1.35,
                backgroundColor: "#d2d2d2",
                width: "100%",
                marginVertical: 10,
              }}
            />
            <View style={{flexDirection: "row"}}>
              <Button
                style={[styles.contact_btn, {backgroundColor: primary_color}]}
                onPress={openEmail}>
                <Text style={{color: "#fff"}}>{t("EMAIL").toUpperCase()}</Text>
              </Button>
              <Button style={[styles.contact_btn, {backgroundColor: accent_color}]} onPress={call}>
                <Text style={{color: "#fff"}}>{t("CALL")}</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

const call = () => {
  let phoneNumber = 8860617526;
  if (Platform.OS === "ios") {
    phoneNumber = `telprompt:${phoneNumber}`;
  } else {
    phoneNumber = `tel:${phoneNumber}`;
  }
  Linking.canOpenURL(phoneNumber)
    .then(supported => {
      if (!supported) {
        Alert.alert("Phone number is not available");
      } else {
        Linking.openURL(phoneNumber);
      }
    })
    .catch(err => console.log(err));
};

const openEmail = () => {
  let email = "mailto:www.phoeniixx.com";
  Linking.canOpenURL(email)
    .then(supported => {
      if (!supported) {
        Alert.alert("Email is not available");
      } else {
        Linking.openURL(email);
      }
    })
    .catch(err => console.log(err));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    backgroundColor: "#dedede",
    height: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  icon: {
    color: "#777777",
    marginEnd: 20,
    marginStart: 15,
    fontSize: 24,
  },
  text: {
    color: "#000000",
    fontWeight: "500",
  },
  footer: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingEnd: 16,
    paddingVertical: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#dedede",
  },
  header: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#dedede",
    justifyContent: "center",
    height: 150,
  },
  contact_btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 2,
  },
});

const mapStateToProps = state => ({
  appSettings: state.appSettings,
  user: state.user,
});

const mapDispatchToProps = {
  logout,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Drawer));
