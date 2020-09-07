import React, {useEffect, useState} from "react";
import {View, Dimensions, Platform, StyleSheet} from "react-native";
import {Text, Button, Icon, HTMLRender, Toolbar} from "components";
import {useSelector} from "react-redux";
import {ApiClient} from "service";
import {useTranslation} from "react-i18next";
import Share from "react-native-share";
import FitImage from "react-native-fit-image";
import Shimmer from "react-native-shimmer";

const {height, width} = Dimensions.get("window");

function ReferAndEarn({navigation}) {
  const user = useSelector(state => state.user);
  const {accent_color} = useSelector(state => state.appSettings);
  const {t} = useTranslation();

  const [data, setData] = useState("");
  const [loading, setloading] = useState({});

  useEffect(() => {
    let param = {
      user_id: user.id,
    };
    setloading(true);
    ApiClient.get("/refer", param)
      .then(res => {
        setloading(false);
        if (res.status == 200) {
          console.log(res);
          res.data.htmlMsg =
            "Invite your friends on MrGreens and get " +
            res.data.amount_referrer +
            " as wllet credit.Your friend will also get " +
            res.data.amount_earner +
            " as wallet credit.";
          setData(res.data);
        } else {
          setData("");
        }
      })
      .catch(error => {
        setloading(false);
      });
  }, []);

  const share = () => {
    let options = {
      url:
        Platform.OS == "ios"
          ? "https://apps.apple.com/app/id1491593829"
          : "https://play.google.com/store/apps/details?id=com.phoeniixx.wooapp",
      message: data.message,
    };
    setloading(true);
    Share.open(options)
      .then(res => {
        setloading(false);
        console.log(res);
      })
      .catch(err => {
        setloading(false);
        err && console.log(err);
      });
  };

  return (
    <View style={{flex: 1}}>
      <Toolbar title="Refer and Earn" backButton />
      {data.banner ? (
        <FitImage source={{uri: data.banner}} />
      ) : (
        <Shimmer>
          <View style={{width: "100%", height: 200, backgroundColor: "gray"}} />
        </Shimmer>
      )}
      <Text style={{alignSelf: "center", marginTop: 20, fontWeight: "400"}}>
        {t("YOUR_REFERRAL_CODE")}
      </Text>
      <View style={styles.codeView}>
        <Text style={{fontWeight: "600", fontSize: 16}}>{data.refer_earn_code}</Text>
      </View>
      <View style={{marginHorizontal: 16}}>
        <HTMLRender html={data.htmlMsg || "<b></b>"} baseFontStyle={{fontWeight: "400"}} />
        <Text style={{marginTop: 30, fontWeight: "400"}}>
          Referral Valid upto {data.refer_earn_uses} friends.
        </Text>
      </View>
      <Button style={[styles.shareButton, {backgroundColor: accent_color}]} onPress={share}>
        <Text style={{color: "#fff"}}>{t("INVITE_FRIENDS")}</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  codeView: {
    margin: 16,
    borderWidth: 2,
    borderRadius: 2,
    paddingVertical: 20,
    alignItems: "center",
    borderStyle: "dotted",
    borderColor: "#d2d2d2",
    justifyContent: "center",
  },
  shareButton: {
    elevation: 2,
    borderRadius: 2,
    marginTop: "auto",
    marginBottom: 100,
    marginHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(ReferAndEarn);
