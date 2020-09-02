import {View, StyleSheet, RefreshControl, unstable_batchedUpdates} from "react-native";
import {Text, Toolbar, Button, Icon, HTMLRender, FloatingTextinput, EmptyList} from "components";
import React, {useEffect, useState, useCallback} from "react";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {ApiClient, WooCommerce} from "service";
import {FlatList} from "react-native-gesture-handler";
import moment from "moment";
import Modal from "react-native-modal";
import Toast from "react-native-simple-toast";

function Wallet({navigation}) {
  const {t} = useTranslation();
  const {accent_color} = useSelector(state => state.appSettings);
  const user = useSelector(state => state.user);

  const [transaction, setTransaction] = useState([]);
  const [balance, setBalance] = useState("");
  const [loading, setloading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setModal] = useState(false);
  const [amount, setAmount] = useState("");

  const onChangeAmount = useCallback(text => {
    setAmount(text);
  });

  const closeModal = (item, itemEach) => () => {
    if (item == "false") {
      setModal(false);
    } else {
      if (amount != "") {
        console.log(amount);
        setModal(false);
        let data = {
          woo_add_to_wallet: "Add",
          woo_wallet_balance_to_add: amount,
        };
        setloading(true);
        ApiClient.post("/wallet/add", data)
          .then(({data}) => {
            setloading(false);
            console.log(data);
            if (data.code == 1) {
              Toast.show(data.message, Toast.SHORT);
            }
          })
          .catch(error => {
            setloading(false);
            console.log(error);
          });
      } else {
        Toast.show("Please enter the amount");
      }
    }
  };

  const openModal = () => {
    setModal(true);
  };

  useEffect(() => {
    getTransactions();
  }, []);
  useEffect(() => {
    if (refreshing) getTransactions();
  }, [refreshing]);

  const getTransactions = () => {
    setloading(true);
    ApiClient.get("/wallet?uid=" + user.id)
      .then(({data}) => {
        console.log(data);
        unstable_batchedUpdates(() => {
          setloading(false);
          setRefreshing(false);
          if (data.transaction != "No transactions found") {
            setTransaction(data.transaction);
          }
          setBalance(data.balance);
        });
      })
      .catch(() => {
        unstable_batchedUpdates(() => {
          setRefreshing(false);
          setloading(false);
        });
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
  };

  const _gotoReferAndEarn = () => {
    navigation.navigate("ReferAndEarn");
  };

  return (
    <>
      <View style={{flex: 1}}>
        <Toolbar backButton title={t("WALLET")} walletBalance={balance} />
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <Button style={[styles.btn, {backgroundColor: accent_color}]} onPress={openModal}>
            <Icon type="Entypo" name="plus" color={"#ffffff"} size={18} />
            <Text style={styles.txt}>{t("ADD_MONEY")}</Text>
          </Button>
          <Button style={[styles.btn, {backgroundColor: accent_color}]} onPress={_gotoReferAndEarn}>
            <Icon name="md-share-alt" color={"#ffffff"} size={22} />
            <Text style={styles.txt}>{t("REFER_AND_EARN")}</Text>
          </Button>
        </View>

        <FlatList
          data={transaction}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={TransactionItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparatorComponent}
          contentContainerStyle={{flexGrow: 1, padding: 16}}
          ListEmptyComponent={
            <EmptyList
              iconType="Ionicons"
              iconName="ios-cash"
              label="No transaction found"
              loading={loading}
            />
          }
        />
      </View>
      <Modal
        isVisible={showModal}
        style={{margin: 0}}
        onBackButtonPress={closeModal("false", null)}
        onBackdropPress={closeModal("false", null)}
        useNativeDriver
        hideModalContentWhileAnimating>
        <View style={{backgroundColor: "#fff", marginHorizontal: 64, padding: 20}}>
          <Text style={{fontWeight: "500", fontSize: 20, marginBottom: 15}}>
            {t("ADD_MONEY_TO_WALLET")}
          </Text>
          <FloatingTextinput
            label={"Amount"}
            labelColor="#000000"
            style={{color: "#000000"}}
            value={amount}
            onChangeText={onChangeAmount}
            keyboardType={"numeric"}
          />
          <View style={{flexDirection: "row", justifyContent: "flex-end", marginTop: 30}}>
            <Button onPress={closeModal("false", null)}>
              <Text style={{color: accent_color}}>{t("CANCEL")}</Text>
            </Button>
            <Button onPress={closeModal("amount", null)} style={{marginStart: 20}}>
              <Text style={{color: accent_color}}>{t("OK")}</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const keyExtractor = (item, index) => item + index;

function ItemSeparatorComponent() {
  return <View style={{marginVertical: 8}} />;
}

function TransactionItem({item, index}) {
  return (
    <View style={[styles.card]}>
      <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 8}}>
        <Text style={styles.details}>{item.details || "No details"}</Text>
        <HTMLRender
          html={item.amount ? item.amount : "<b></b>"}
          baseFontStyle={[{color: item.type == "credit" ? "green" : "red"}, styles.details]}
        />
      </View>
      <Text style={styles.text}>{moment(item.date).format("MMM DD,YYYY")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    flex: 1,
    marginTop: 12,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    marginHorizontal: 6,
  },
  txt: {color: "#fff", fontSize: 16, marginStart: 5},
  card: {
    elevation: 1,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 1},
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 4,
  },
  details: {
    fontWeight: "500",
    fontSize: 13,
  },
  text: {
    fontSize: 13,
  },
});

export default Wallet;
