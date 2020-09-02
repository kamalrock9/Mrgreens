import React from "react";
import {View, StyleSheet, ActivityIndicator, TextInput} from "react-native";
import CountryPicker, {getCallingCode, getAllCountries} from "react-native-country-picker-modal";
import {ApiClient} from "service";
import Toast from "react-native-simple-toast";
import {Text, Toolbar, Button} from "components";
import {connect} from "react-redux";

class PostRegisterOTP extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.navigation.state.params);
    this.state = {
      loading: false,
      country_code: "IN", //country_code ? this.getCountryCodeByCallingCode(country_code) : "IN",
      phone: "", //phone_number || ""
    };
  }

  sendOTP = () => {
    if (this.state.phone == "" || this.state.phone.length < 4 || this.state.phone.length > 13) {
      Toast.show("Phone number is not valid", Toast.LONG);
      return;
    }
    this.setState({loading: true});
    console.log(this.state.phone);
    getCallingCode(this.state.country_code).then(res => {
      console.log(res);
      var callingCode = res;
      ApiClient.get("/sendOTP/?phone=" + this.state.phone + "&country_code=+" + callingCode)
        .then(({data}) => {
          this.setState({loading: false});
          if (data.type == "failed") {
            Toast.show(data.message, Toast.LONG);
          } else {
            this.navigateToScreen("PostRegisterOTPVerify", {
              phone: this.state.phone,
              country_code: callingCode,
              ...this.props.navigation.state.params,
            });
          }
        })
        .catch(() => {
          this.setState({loading: false});
        });
    });
  };

  navigateToScreen = (route, params = {}) => {
    this.props.navigation.navigate(route, params);
  };

  updateState = key => value => {
    this.setState({[key]: value});
  };

  onCountrySelect = val => {
    console.log(val);
    this.setState({country_code: val.cca2});
  };
  getCountryCodeByCallingCode(callingCode) {
    callingCode = callingCode.replace("+", "");
    console.log(getAllCountries());
    //let country = getAllCountries().find(item => callingCode[0] === item.cca2);
    let country = false;
    if (country) {
      return country.cca2;
    } else {
      return "IN";
    }
  }

  render() {
    const {appSettings} = this.props;
    return (
      <View>
        <Toolbar title="OTP Screen" backButton />
        <Text style={styles.login_txt}>
          We will send you the otp to {"\n"}authenticate your account
        </Text>

        <View style={styles.rowView}>
          <CountryPicker
            withCallingCode
            withCallingCodeButton
            countryCode={this.state.country_code}
            withFilter
            containerButtonStyle={styles.countryPickerContainer}
            onSelect={this.onCountrySelect}
          />
          <TextInput
            style={{elevation: 1, backgroundColor: "#ffffff", flex: 1}}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={this.state.phone}
            onChangeText={this.updateState("phone")}
          />
        </View>

        <Button
          onPress={this.sendOTP}
          containerStyle={{marginTop: 30, alignSelf: "center"}}
          style={{
            height: 40,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 4,
            alignItems: "center",
            backgroundColor: appSettings.accent_color,
            paddingVertical: 8,
            paddingHorizontal: 45,
            justifyContent: "center",
          }}>
          <Text style={{fontWeight: "600", fontSize: 16, color: "#ffffff"}}>Next</Text>
        </Button>
        {this.state.loading && <ActivityIndicator />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  countryPickerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS == "ios" ? 0 : 10,
    elevation: 1,
    marginEnd: 10,
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowOffset: {height: 1, width: 0},
  },
  rowView: {
    marginTop: 30,
    paddingHorizontal: 16,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  login_txt: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "25%",
  },
});

const mapStateToProps = state => ({
  appSettings: state.appSettings,
});

export default connect(mapStateToProps)(PostRegisterOTP);
