import React, {useState, useEffect} from "react";
import {View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity} from "react-native";
import {Text, Button, Icon, HTMLRender} from "components";
import {isEmpty, isArray} from "lodash";
import {ApiClient} from "service";
import {useSelector} from "react-redux";
function Review({cartData, orderData}) {
  console.log(cartData);

  const appSettings = useSelector(state => state.appSettings);

  const cartdata = Object.assign({}, cartData);
  const [data, setCart] = useState(cartdata);
  const [loading, setloading] = useState(false);
  const [isSelectShipping, setShippingMethod] = useState(data.chosen_shipping_method);
  const [paymentMethods, setPaymentMethds] = useState([]);
  const [shipping_method, setShipping_method] = useState("");
  const [chosen_payment_method, setChosen] = useState("");
  const [pay_via_wallet, set_pay_via_wallet] = useState("");

  useEffect(() => {
    Apicall(null);
  }, []);

  function Apicall(item) {
    setChosen(item);
    let param = {
      shipping_method: shipping_method != "" ? shipping_method : "",
      chosen_payment_method: chosen_payment_method != "" ? item : "",
      pay_via_wallet: pay_via_wallet != "" ? pay_via_wallet : "",
    };
    setloading(true);
    ApiClient.get("/checkout/review-order", param)
      .then(({data}) => {
        setloading(false);
        console.log(data);
        orderData && orderData(data);
        setPaymentMethds(data.payment_gateway);
      })
      .catch(error => {
        setloading(false);
        console.log(error);
      });
  }

  const selectShippingMethod = item => () => {
    console.log(item);
    let param = {
      shipping_method: item ? item.id : "",
      user_id: 17,
    };
    setShippingMethod(item.id);
    setShipping_method(item.id);
    // setCart({...data, chosen_shipping_method: item.id});
    setloading(true);
    ApiClient.get("/cart", param)
      .then(res => {
        setloading(false);
        console.log(res);
        setCart({...res.data});
      })
      .catch(error => {
        setloading(false);
        console.log(error);
      });
  };

  const selectPaymentMethod = item => () => {
    setChosen(item.gateway_id);
    Apicall(item.gateway_id);
  };

  const _renderItem = ({item}) => {
    return (
      <View style={styles.flexdirection}>
        <Text>{item.name + " x" + item.quantity}</Text>
        <HTMLRender html={item.subtotal || "<b></b>"} />
      </View>
    );
  };

  const _keyExtractor = item => item.cart_item_key;

  return (
    <View style={{marginHorizontal: 16}}>
      {data.hasOwnProperty(shipping_method) && (
        <View style={styles.card}>
          <Text style={styles.heading}>Shipping Method(S)</Text>
          {!isEmpty(data.shipping_method) &&
            data.shipping_method.map((item, index) => {
              return (
                <View
                  key={item.method_id}
                  style={{flexDirection: "row", width: "100%", alignItems: "center"}}>
                  <Text style={{flex: 1}}>{item.shipping_method_name}</Text>
                  <HTMLRender
                    html={item.shipping_method_price ? item.shipping_method_price : <b />}
                  />
                  <Button onPress={selectShippingMethod(item)} style={{paddingVertical: 4}}>
                    <Icon
                      name={
                        isSelectShipping === item.id ? "md-radio-button-on" : "md-radio-button-off"
                      }
                      size={18}
                      style={{marginStart: 5}}
                    />
                  </Button>
                </View>
              );
            })}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.heading}>Order Summary</Text>
        <FlatList data={data.cart_data} renderItem={_renderItem} keyExtractor={_keyExtractor} />
        <Text style={{color: "green"}}>You Save</Text>
        <View style={styles.flexdirection}>
          <Text>Subtotal</Text>
          <HTMLRender html={data.cart_subtotal || "<b></b>"} />
        </View>
        {data.hasOwnProperty("chosen_shipping_method") && (
          <View style={styles.flexdirection}>
            <Text>Shipping Charge</Text>
            <HTMLRender
              html={
                data.shipping_method.find(item => item.id == data.chosen_shipping_method)
                  .shipping_method_price
              }
            />
          </View>
        )}
        <View style={styles.flexdirection}>
          <Text style={{color: "green"}}>Total Discount</Text>
          <HTMLRender html={data.discount_total || "<b></b>"} baseFontStyle={{color: "green"}} />
        </View>
        <View style={{height: 1.35, backgroundColor: "#d2d2d2", marginVertical: 10}} />
        <View style={styles.flexdirection}>
          <Text style={{fontWeight: "700", color: "grey"}}>Total</Text>
          <HTMLRender html={data.total || "<b></b>"} baseFontStyle={{fontWeight: "700"}} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Payment Method</Text>
        {!isEmpty(paymentMethods) &&
          paymentMethods.map(item => {
            return (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: "#f5f5f5",
                  marginTop: 5,
                  borderRadius: 4,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  paddingVertical: 3,
                  paddingHorizontal: 5,
                }}
                key={item.gateway_id}
                onPress={selectPaymentMethod(item)}>
                <Text>{item.gateway_title}</Text>
                <Button onPress={selectPaymentMethod(item)}>
                  <Icon
                    name={
                      chosen_payment_method == item.gateway_id
                        ? "md-radio-button-on"
                        : "md-radio-button-off"
                    }
                    size={20}
                  />
                </Button>
              </TouchableOpacity>
            );
          })}
      </View>
      {loading && <ActivityIndicator />}
    </View>
  );
}

// Review.navigationOptions = {
//   header: <Toolbar backButton title="Review" />,
// };

const styles = StyleSheet.create({
  heading: {
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    elevation: 2,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    backgroundColor: "#fff",
    borderRadius: 2,
    padding: 10,
    marginTop: 16,
  },
  flexdirection: {flexDirection: "row", justifyContent: "space-between"},
});

export default Review;
