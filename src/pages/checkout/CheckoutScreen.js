import React, {useState, useCallback, useEffect} from "react";
import {View, StyleSheet, Dimensions, Switch, ActivityIndicator} from "react-native";
import {Text, Toolbar, Container, Button, Icon} from "components";
import {useSelector, useDispatch} from "react-redux";
import BillingAddress from "./BillingAddress";
import ShippingAddress from "./ShippingAddress";
import Review from "../Review";
import StepIndicator from "react-native-step-indicator";
import SwiperFlatList from "react-native-swiper-flatlist";
import Toast from "react-native-simple-toast";
import {ApiClient, WooCommerce} from "service";
import {isEmpty} from "lodash";
import {updateBilling, updateShipping} from "../../store/actions";
import Constants from "../../service/Config";

const {width} = Dimensions.get("window");

const labels = ["Billing\nAddress", "Shipping\nAddress", "Review"];
const customStyles = {
  stepIndicatorSize: 26,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#fe7013",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "#fe7013",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#fe7013",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#fe7013",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
  stepIndicatorLabelFontSize: 12,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#fe7013",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 10,
  currentStepLabelColor: "#fe7013",
  labelFontFamily: "Inter-Regular",
};

function CheckoutScreen({navigation}) {
  console.log(navigation.state.params);
  const [stepPos, setStepPos] = useState(0);
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [pay_via_wallet, set_pay_via_wallet] = useState("");

  const {accent_color, primary_color, pincode_active} = useSelector(state => state.appSettings);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [orderdata, SetorderData] = useState("");
  const [loading, setloading] = useState(false);

  const ApiCall = (postcode, pos) => {
    let param = {
      pincode: postcode,
    };
    let URL = Constants.baseURL + Constants.path;
    ApiClient.post(URL + "/checkpincode/", param)
      .then(({data}) => {
        if (data.delivery) {
          setStepPos(pos);
        } else {
          Toast.show("Delivery is not available for your location");
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onChangeShipToDifferent = useCallback(() => {
    setShipToDifferent(prevState => !prevState);
    if (shipToDifferent) {
      const {billing} = user;
      dispatch(
        updateShipping({
          ...user.shipping,
          first_name: billing.first_name,
          last_name: billing.last_name,
          country: billing.country,
          state: billing.state,
          city: billing.city,
          company: billing.company,
          postcode: billing.postcode,
          address_1: billing.address_1,
          address_2: billing.address_2,
        }),
      );
    }
  });

  const orderData = text => {
    SetorderData(text);
  };

  const goBack = () => {
    if (shipToDifferent) {
      setStepPos(0);
    } else if (stepPos == 2) {
      setStepPos(0);
    } else if (stepPos == 3) {
      setStepPos(2);
    } else {
      navigation.goBack(null);
    }
  };

  const gotoShipping = () => {
    console.log(stepPos);
    if (stepPos == 3) {
      if (orderdata.chosen_gateway == "") {
        Toast.show("Please select the payment method");
      } else {
        let data = {};
        if (pincode_active) {
          for (let item of orderdata.product) {
            if (item.delivery) data[item.product_id] = item.delivery_date;
          }
        }
        let u = user && user.id ? "?user_id=" + user.id : "?user_id=";
        let p = "&payment_method=" + orderdata.chosen_gateway;
        let c = "&shipping_method=" + orderdata.chosen_shipping_method;
        let pw = pay_via_wallet ? "&pay_via_wallet=" + pay_via_wallet : "";

        setloading(true);
        ApiClient.post("/checkout/new-order" + u + p + c + pw, data)
          .then(resp => {
            setloading(false);
            ApiClient.get("/cart/clear")
              .then(res => {})
              .catch(error => {
                console.log(error);
              });
            if (resp.status == 200) {
              navigation.navigate("PaymentPage", {Orderdata: resp.data});
            } else {
            }
          })
          .catch(errr => {
            setloading(false);
          });
      }
    } else if (stepPos == 2 || shipToDifferent) {
      const {billing, shipping} = user;
      if (
        isEmpty(billing.first_name) ||
        isEmpty(billing.email) ||
        isEmpty(billing.phone) ||
        isEmpty(billing.country) ||
        isEmpty(billing.state) ||
        isEmpty(billing.city) ||
        isEmpty(billing.postcode) ||
        isEmpty(billing.address_1)
      ) {
        Toast.show("Please enter the required filled");
      } else if (
        stepPos == 2 &&
        (isEmpty(shipping.first_name) ||
          isEmpty(shipping.country) ||
          isEmpty(shipping.state) ||
          isEmpty(shipping.city) ||
          isEmpty(shipping.postcode) ||
          isEmpty(shipping.address_1))
      ) {
        Toast.show("Please enter the required filled");
      } else if (pincode_active) {
        ApiCall(user.shipping.postcode, 3);
      } else {
        if (shipToDifferent) {
          let billingParam = {
            first_name: billing.first_name,
            last_name: billing.last_name,
            company: billing.company,
            email: billing.email,
            phone: billing.phone,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            address_1: billing.address_1,
            address_2: billing.address_2,
            country: billing.country,
          };
          let shippingParam = {
            first_name: billing.first_name,
            last_name: billing.last_name,
            company: billing.company,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            address_1: billing.address_1,
            address_2: billing.address_2,
            country: billing.country,
          };
          console.log(billingParam);

          let data = {};
          data.billing = billingParam;
          data.shipping = shippingParam;

          WooCommerce.post("customers/" + user.id, data).then(res => {
            if (res.status == 200) {
              console.log(res);
              dispatch(updateBilling(billingParam));
              dispatch(updateShipping(shippingParam));
            } else {
              Toast.show("Nothing to update", Toast.LONG);
            }
          });
        } else {
          let param = {
            first_name: shipping.first_name,
            last_name: shipping.last_name,
            company: shipping.company,
            city: shipping.city,
            state: shipping.state,
            postcode: shipping.postcode,
            address_1: shipping.address_1,
            address_2: shipping.address_2,
            country: shipping.country,
          };
          console.log(param);

          let data = {};
          data.shipping = param;

          WooCommerce.post("customers/" + user.id, data).then(res => {
            console.log(res);
            if (res.status == 200) {
              dispatch(updateShipping(param));
            } else {
              Toast.show("Nothing to update", Toast.LONG);
            }
          });
        }
        setStepPos(3);
      }
    } else if (stepPos == 0) {
      const {billing} = user;
      if (
        isEmpty(billing.first_name) ||
        isEmpty(billing.email) ||
        isEmpty(billing.phone) ||
        isEmpty(billing.country) ||
        isEmpty(billing.state) ||
        isEmpty(billing.city) ||
        isEmpty(billing.postcode) ||
        isEmpty(billing.address_1)
      ) {
        Toast.show("Please enter the required filled");
      } else if (pincode_active) {
        ApiCall(user.billing.postcode, 2);
      } else {
        let param = {
          first_name: billing.first_name,
          last_name: billing.last_name,
          company: billing.company,
          email: billing.email,
          phone: billing.phone,
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          address_1: billing.address_1,
          address_2: billing.address_2,
          country: billing.country,
        };
        // console.log(param);

        let data = {};
        data.billing = param;

        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!reg.test(billing.email)) {
          Toast.show("Your email address is not correct", Toast.LONG);
          return;
        }
        WooCommerce.post("customers/" + user.id, data).then(res => {
          if (res.status == 200) {
            console.log(res);
            dispatch(updateBilling(param));
          } else {
            Toast.show("Nothing to update", Toast.LONG);
          }
        });

        setStepPos(2);
      }
    }
  };

  const renderStepIndicator = params => (
    <Icon type="MaterialIcons" {...getStepIndicatorIconConfig(params)} />
  );

  const getStepIndicatorIconConfig = ({position, stepStatus}) => {
    const iconConfig = {
      name: "feed",
      color: stepStatus === "finished" ? "#ffffff" : "#fe7013",
      size: 15,
    };
    switch (position) {
      case 0: {
        iconConfig.name = "event-note";
        break;
      }
      case 1: {
        iconConfig.name = "account-balance";
        break;
      }
      case 2: {
        iconConfig.name = "rate-review";
        break;
      }
      default: {
        break;
      }
    }
    return iconConfig;
  };

  return (
    <Container>
      <Toolbar title="Checkout" backButton />
      <View style={{marginTop: 8}} />
      <StepIndicator
        renderStepIndicator={renderStepIndicator}
        customStyles={customStyles}
        currentPosition={stepPos}
        labels={labels}
        stepCount={3}
      />

      <SwiperFlatList>
        {stepPos == 0 && (
          <View style={{paddingVertical: 16, width}}>
            <BillingAddress />
          </View>
        )}

        {stepPos == 2 && (
          <View style={{paddingVertical: 16, width}}>
            <ShippingAddress />
          </View>
        )}

        {stepPos == 3 && (
          <View style={{paddingVertical: 16, width}}>
            <Review cartData={navigation.state.params.cartData} orderData={orderData} />
          </View>
        )}
      </SwiperFlatList>

      <View style={styles.footer}>
        {stepPos == 0 && (
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              padding: 16,
              alignItems: "center",
            }}>
            <Text>Same For Shipping</Text>
            <Switch
              trackColor={{true: accent_color, false: "grey"}}
              thumbColor={shipToDifferent ? "#fe7013" : "#ffffff"}
              onChange={onChangeShipToDifferent}
              value={shipToDifferent}
            />
          </View>
        )}
        <View style={{flexDirection: "row", width: "100%"}}>
          {stepPos != 0 && (
            <Button
              style={[styles.footerButton, {marginEnd: -10, backgroundColor: primary_color}]}
              onPress={goBack}>
              <Text style={{color: "white", marginEnd: 5}}>PREVIOUS</Text>
            </Button>
          )}
          <Button
            style={[styles.footerButton, {backgroundColor: accent_color}]}
            onPress={gotoShipping}>
            <Text style={{color: "white", marginEnd: 5}}>
              {stepPos == 3 ? "PLACE ORDER" : "NEXT"}
            </Text>
          </Button>
        </View>
      </View>
      {loading && <ActivityIndicator />}
    </Container>
  );
}

CheckoutScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    borderTopColor: "#dedede",
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    height: 40,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(CheckoutScreen);
