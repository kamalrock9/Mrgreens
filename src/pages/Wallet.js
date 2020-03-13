import {View, StyleSheet, ActivityIndicator} from "react-native";
import {Text, Toolbar, Button, Icon, HTMLRender} from "components";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {ApiClient} from "service";
import {FlatList} from "react-native-gesture-handler";
import {isEmpty} from "lodash";
import moment from "moment";
import {useNavigation} from "react-navigation-hooks";

function Wallet() {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const appSettings = useSelector(state => state.appSettings);
  const user = useSelector(state => state.user);

  const [transaction, setTransaction] = useState([]);
  const [balance, setBalance] = useState("");
  const [loading, setloading] = useState(false);

  useEffect(() => {
    setloading(true);
    ApiClient.get("/wallet?uid=" + user.id)
      .then(res => {
        console.log(res);
        setloading(false);
        if (res.status == 200) {
          setTransaction(res.data.transaction);
          setBalance(res.data.balance);
        }
      })
      .catch(error => {
        setloading(false);
      });
  }, []);

  const _gotoReferAndEarn = () => {
    navigation.navigate("ReferAndEarn");
  };

  const _renderItem = ({item, index}) => {
    return (
      <View style={[styles.card, {marginBottom: index == transaction.length - 1 ? 16 : 0}]}>
        <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 8}}>
          <Text style={styles.text}>{item.details[0]}</Text>
          <HTMLRender html={item.amount[0]} baseFontStyle={[{color: "green"}, styles.text]} />
          {/* <Text style={{fontWeight: "500", fontSize: 16, color: "green"}}>{item.amount[0]}</Text> */}
        </View>
        <Text style={styles.text}>{moment(item.date[0], "MM DD,YYYY").format("MMM DD,YYYY")}</Text>
      </View>
    );
  };

  const _keyExtractor = (item, index) => item + index;

  return (
    <View>
      <Toolbar backButton title={t("WALLET")} walletRupee={balance} />
      <View style={{flexDirection: "row", justifyContent: "space-between"}}>
        <Button style={[styles.btn, {backgroundColor: appSettings.accent_color}]}>
          <Icon type="Entypo" name="plus" color={"#ffffff"} size={18} />
          <Text style={styles.txt}>Add Money</Text>
        </Button>
        <Button
          style={[styles.btn, {backgroundColor: appSettings.accent_color}]}
          onPress={_gotoReferAndEarn}>
          <Icon name="md-share-alt" color={"#ffffff"} size={22} />
          <Text style={styles.txt}>Refer & Earn</Text>
        </Button>
      </View>
      {!isEmpty(transaction) && (
        <FlatList data={transaction} renderItem={_renderItem} keyExtractor={_keyExtractor} />
      )}
      {loading && <ActivityIndicator />}
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
    elevation: 2,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 4,
  },
  text: {
    fontWeight: "300",
    fontSize: 16,
  },
});

export default Wallet;