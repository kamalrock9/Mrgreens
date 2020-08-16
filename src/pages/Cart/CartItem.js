import React, {useState} from "react";
import {View, StyleSheet, Image} from "react-native";
import {Button, Text, Icon, HTMLRender} from "components";
import Modal from "react-native-modal";
import Toast from "react-native-simple-toast";
import {useSelector} from "react-redux";

function CartItem({item, index, manageQuanity, deleteCartItem}) {
  const appSetting = useSelector(state => state.appSettings);

  const [isOpenModal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  const decrement = () => {
    if (item.quantity > 1) {
      manageQuanity && manageQuanity(item.cart_item_key, parseInt(item.quantity) - 1);
    } else {
      Toast.show("Minimum item quantity reached");
    }
  };

  const increment = () => {
    let quantity = Number(item.quantity);
    if (item.manage_stock) {
      if (quantity < item.stock_quanity) {
        quantity++;
      } else {
        Toast.show("Maximum item quantity reached");
      }
    } else {
      quantity++;
    }
    if (quantity !== Number(item.quantity))
      manageQuanity && manageQuanity(item.cart_item_key, parseInt(item.quantity) + 1);
  };

  const deleteItem = () => {
    setModal(false);
    deleteCartItem && deleteCartItem(item.cart_item_key);
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
          paddingTop: index == 0 ? 16 : 0,
          paddingHorizontal: 16,
        }}>
        <Image style={{height: 70, width: 70}} source={{uri: item.image}} />
        <View style={{marginStart: 16, flex: 1}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <Text style={{fontWeight: "700", flex: 1}}>{item.name}</Text>
            <Button onPress={openModal}>
              <Icon type="MaterialIcons" name="delete" size={22} />
            </Button>
          </View>
          <HTMLRender html={item.product_desc} />
          <HTMLRender html={item.varitions} />
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              marginTop: 10,
              flex: 1,
            }}>
            <Text>Price:</Text>
            <HTMLRender html={item.subtotal} />
            <View style={{flexDirection: "row"}}>
              <Button style={styles.btn} onPress={decrement}>
                <Icon name="minus" type="Entypo" size={16} color="#757575" />
              </Button>
              <Text style={{paddingHorizontal: 8}}>{item.quantity}</Text>
              <Button style={styles.btn} onPress={increment}>
                <Icon name="plus" type="Entypo" size={16} color="#757575" />
              </Button>
            </View>
          </View>
        </View>
      </View>
      <Modal
        isVisible={isOpenModal}
        style={{margin: 0}}
        onBackButtonPress={closeModal}
        onBackdropPress={closeModal}
        useNativeDriver
        hideModalContentWhileAnimating>
        <View style={{backgroundColor: "#fff", marginHorizontal: 64, padding: 20}}>
          <Text style={{fontWeight: "500", fontSize: 20, marginBottom: 15}}>Remove From Cart</Text>
          <Text>Are you sure to remove this?</Text>
          <View style={{flexDirection: "row", justifyContent: "flex-end", marginTop: 30}}>
            <Button onPress={closeModal}>
              <Text style={{color: appSetting.accent_color}}>NO</Text>
            </Button>
            <Button onPress={deleteItem} style={{marginStart: 20}}>
              <Text style={{color: appSetting.accent_color}}>YES</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btn: {
    borderWidth: 1,
    borderColor: "#dedede",
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {fontWeight: "700"},
  footer: {
    width: "100%",
    flexDirection: "row",
  },
  footerButton: {
    flex: 1,
    height: 40,
    margin: 5,
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
});

export default React.memo(CartItem);
