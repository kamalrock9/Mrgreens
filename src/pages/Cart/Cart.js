import React from "react";
import {View, StyleSheet, FlatList} from "react-native";
import {
  Toolbar,
  Button,
  Text,
  HTMLRender,
  Container,
  Icon,
  EmptyList,
  ProgressDialog,
} from "components";
import {connect} from "react-redux";
import {ApiClient} from "service";
import CartPriceBreakup from "./CartPriceBreakup";
import CartItem from "./CartItem";
import {isArray, isEmpty} from "lodash";
import {withTranslation} from "react-i18next";
import Modal from "react-native-modal";
import Toast from "react-native-simple-toast";

class Cart extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      cart_data: {},
      loading: false,
      updating: false,
      isContactModalOpen: false,
      shipping_method: "",
    };
  }

  selectShipping = text => {
    this.setState({shipping_method: text});
    this.ApiCall(text);
  };

  componentDidMount() {
    this.ApiCall(null);
  }

  gotoCheckout = (route, param) => () => {
    if (isEmpty(this.props.user)) {
      this.toggleContactModal();
    } else {
      this.props.navigation.navigate(route, {cartData: param});
    }
  };

  gotoAuth = (login, register) => () => {
    this.setState({isContactModalOpen: !this.state.isContactModalOpen});
    this.props.navigation.navigate("Auth", {NeedLogin: login, NeedRegister: register});
  };

  toggleContactModal = () => {
    this.setState({isContactModalOpen: !this.state.isContactModalOpen});
  };

  ApiCall = params => {
    let param = {
      shipping_method: params ? params : "",
      user_id: 17,
    };
    console.log(JSON.stringify(param));
    this.setState({loading: true});
    ApiClient.get("/cart", param)
      .then(({data}) => {
        this.setState({loading: false, cart_data: data});
      })
      .catch(() => {
        this.setState({loading: false});
      });
  };

  manageQuanity = (key, quantity) => {
    this.setState({updating: true});
    ApiClient.get("/cart/update", {
      cart_item_key: key,
      quantity: quantity,
    })
      .then(({data}) => {
        this.setState({cart_data: data, updating: false});
      })
      .catch(error => {
        this.setState({updating: false});
        Toast.show("Something went wrong!");
      });
  };

  deleteCartItem = key => {
    this.setState({updating: true});
    ApiClient.get("/cart/remove", {cart_item_key: key})
      .then(({data}) => {
        this.setState({cart_data: data, updating: false});
      })
      .catch(error => {
        this.setState({updating: false});
        Toast.show("Something went wrong!");
      });
  };

  applyCoupon = cart_data => {
    this.setState({cart_data});
  };
  removeCoupon = coupon_code => {
    this.setState({updating: true});
    ApiClient.get("/cart/remove-coupon", {coupon_code})
      .then(({data}) => {
        this.setState({cart_data: data, updating: false});
      })
      .catch(error => {
        this.setState({updating: false});
        Toast.show("Something went wrong!");
      });
  };

  goBack = () => {
    this.props.navigation.goBack(null);
  };

  renderItem = ({item, index}) => (
    <CartItem
      item={item}
      index={index}
      manageQuanity={this.manageQuanity}
      deleteCartItem={this.deleteCartItem}
    />
  );

  renderFooter = () => (
    <CartPriceBreakup
      data={this.state.cart_data}
      applyCoupon={this.applyCoupon}
      removeCoupon={this.removeCoupon}
      shippingMethod={this.selectShipping}
    />
  );

  render() {
    const {cart_data, isContactModalOpen, loading, updating} = this.state;
    const {appSettings, user} = this.props;
    const isListAvailable =
      cart_data.cart_data && isArray(cart_data.cart_data) && !isEmpty(cart_data.cart_data);
    return (
      <>
        <Container>
          <Toolbar backButton title="Cart" />

          <FlatList
            data={cart_data.cart_data}
            renderItem={this.renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparatorComponent}
            contentContainerStyle={{flexGrow: 1}}
            ListFooterComponent={isListAvailable && this.renderFooter}
            ListEmptyComponent={
              <EmptyList
                loading={loading}
                label="Cart is empty."
                iconName="md-cart"
                iconType="Ionicons"
              />
            }
          />
          {isListAvailable && (
            <Button
              style={[styles.footerButton, {backgroundColor: appSettings.accent_color}]}
              onPress={this.gotoCheckout("CheckoutScreen", this.state.cart_data)}>
              <Text style={{color: "#fff", fontWeight: "600"}}>CHECKOUT {" | "}</Text>
              <HTMLRender
                html={cart_data.total}
                baseFontStyle={{color: "#fff", fontWeight: "600"}}
              />
            </Button>
          )}

          <ProgressDialog loading={updating} />
        </Container>
        <Modal
          isVisible={isContactModalOpen}
          style={{justifyContent: "flex-end", margin: 0, marginTop: "auto"}}
          onBackButtonPress={this.toggleContactModal}
          onBackdropPress={this.toggleContactModal}
          hasBackdrop
          useNativeDriver
          hideModalContentWhileAnimating>
          <View style={{backgroundColor: "#FFF", padding: 10}}>
            <Text style={{fontSize: 18, fontWeight: "400"}}>LOGIN</Text>
            <Text style={{marginVertical: 5}}>You need to login/register first.</Text>
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
                style={[styles.contact_btn, {backgroundColor: appSettings.primary_color}]}
                onPress={this.gotoAuth(true, false)}>
                <Text style={{color: "#fff"}}>LOGIN</Text>
              </Button>
              <Button
                style={[styles.contact_btn, {backgroundColor: appSettings.accent_color}]}
                onPress={this.gotoAuth(true, true)}>
                <Text style={{color: "#fff"}}>REGISTER</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

const keyExtractor = item => item.cart_item_key;

function ItemSeparatorComponent() {
  return <View style={[styles.line, {margin: 16}]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btn: {
    borderWidth: 1,
    borderColor: "#D2d2d9",
    backgroundColor: "#D2d2d2",
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {fontWeight: "700"},
  footer: {
    width: "100%",
    flexDirection: "row",
  },
  footerButton: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  view: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "#F1F1F1",
  },
  btnTxt: {
    fontWeight: "600",
    fontSize: 24,
    marginBottom: 5,
  },
  contact_btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 2,
  },
});

const mapStateToProps = state => ({
  appSettings: state.appSettings,
  user: state.user,
});

export default connect(mapStateToProps)(withTranslation()(Cart));
