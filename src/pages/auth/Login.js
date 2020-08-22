import React, {useRef, useState, useCallback, useReducer} from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import {Icon, Text, Button, FloatingTextinput} from "components";
import SwiperFlatList from "react-native-swiper-flatlist";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import Constants from "service/Config";
import {ApiClient} from "service";
import {user, saveShipping} from "store/actions";
import Toast from "react-native-simple-toast";
import {GoogleSignin} from "@react-native-community/google-signin";
import {LoginManager, AccessToken, GraphRequest, GraphRequestManager} from "react-native-fbsdk";
import {ScrollView} from "react-native-gesture-handler";

const initialState = {
  loginEmail: "",
  loginPassword: "",
  firstname: "",
  lastname: "",
  signUpEmail: "",
  password: "",
  confirmPassword: "",
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "changeEmail":
      return {...state, loginEmail: action.payload};
    case "changePassword":
      return {...state, loginPassword: action.payload};
    case "changeFirstname":
      return {...state, firstname: action.payload};
    case "changeLastname":
      return {...state, lastname: action.payload};
    case "changeSignupEmail":
      return {...state, signUpEmail: action.payload};
    case "changePasswordSignup":
      return {...state, password: action.payload};
    case "changeConfirmPassword":
      return {...state, confirmPassword: action.payload};
    default:
      return state;
  }
}

const {width, height} = Dimensions.get("window");
function Auth({navigation}) {
  const [loading, setLoading] = useState(false);
  //return;
  const {NeedLogin, NeedRegister} = navigation.state.params;
  const {accent_color} = useSelector(state => state.appSettings);
  console.log(NeedRegister);
  const {t} = useTranslation();
  const dispatchAction = useDispatch();
  const [state, dispatch] = useReducer(reducer, initialState);
  const scrollRef = useRef(null);

  if (NeedRegister) {
    console.log("Reg");
    goToLastIndex;
  }

  const goToFirstIndex = () => {
    scrollRef.current.goToFirstIndex();
  };

  const goToLastIndex = () => {
    scrollRef.current.goToLastIndex();
  };

  const goback = () => {
    if (NeedLogin) {
      navigation.goBack();
    }
  };

  ///Login//
  const onChangeEmail = text => {
    dispatch({type: "changeEmail", payload: text});
  };
  const onChangePassword = text => {
    dispatch({type: "changePassword", payload: text});
  };

  //signup//
  const onChangeFirstname = text => {
    dispatch({type: "changeFirstname", payload: text});
  };

  const onChangeLastname = text => {
    dispatch({type: "changeLastname", payload: text});
  };

  const onChangeSignupEmail = text => {
    dispatch({type: "changeSignupEmail", payload: text});
  };

  const onChangepassword = text => {
    dispatch({type: "changePasswordSignup", payload: text});
  };

  const onChangeConfirmPassword = text => {
    dispatch({type: "changeConfirmPassword", payload: text});
  };

  const socialLogin = social => () => {
    if (social == "google") {
      GoogleSignin.configure();
      setLoading(true);
      GoogleSignin.signIn()
        .then(res => {
          let details = res.user;
          details.mode = "google";
          ApiClient.post("/social-login", details).then(({data}) => {
            console.log(data);
            setLoading(false);
            if (data.code == 1) {
              saveDetails(data.details);

              //  onClose && onClose();
              if (NeedLogin) {
                navigation.goBack();
              }
              Toast.show("Login successfully", Toast.LONG);
            } else {
              Toast.show("Wrong Email / Password.", Toast.LONG);
            }
          });
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    } else {
      LoginManager.logInWithPermissions(["public_profile", "email"]).then(result => {
        if (result.isCancelled) {
          Toast.show("Login cancelled", Toast.LONG);
        } else {
          setLoading(true);
          AccessToken.getCurrentAccessToken()
            .then(data => {
              const infoRequest = new GraphRequest(
                "/me?fields=id,first_name,last_name,email,name",
                {accessToken: data.accessToken},
                (error, result) => {
                  if (error) {
                    setLoading(false);
                    Toast.show(error.toString(), Toast.LONG);
                    //  console.log(error);
                  } else {
                    console.log(result);
                    let details = result;
                    details.mode = "facebook";
                    setLoading(true);
                    ApiClient.post("/social-login", details).then(({data}) => {
                      console.log(data);
                      setLoading(false);
                      if (data.code == 1) {
                        saveDetails(data.details);
                        //onClose && onClose();
                        if (NeedLogin) {
                          navigation.goBack();
                        }
                        Toast.show("Login successfully", Toast.LONG);
                      } else {
                        Toast.show("Wrong Email / Password.", Toast.LONG);
                      }
                    });
                  }
                },
              );
              new GraphRequestManager().addRequest(infoRequest).start();
            })
            .then(error => {
              setLoading(false);
            });
        }
      });
    }
  };

  const _login = () => {
    let param = {
      email: state.loginEmail,
      password: state.loginPassword,
    };
    setLoading(true);
    ApiClient.post("/login", param)
      .then(({data}) => {
        console.log(data);
        setLoading(false);
        if (data.code == 1) {
          saveDetails(data.details);

          // onClose && onClose();
          if (NeedLogin) {
            navigation.goBack();
          }
        }
      })
      .catch(error => {
        setLoading(false);
      });
  };

  const _register = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var bodyFormData = new FormData();
    bodyFormData.append("fname", state.firstname);
    bodyFormData.append("lname", state.lastname);
    bodyFormData.append("email", state.signUpEmail);
    bodyFormData.append("password", state.password);

    if (
      state.firstname != "" &&
      state.lastname != "" &&
      state.signUpEmail != "" &&
      state.password != "" &&
      state.confirmPassword != ""
    ) {
      if (reg.test(state.signUpEmail) === true) {
        if (state.password != state.confirmPassword) {
          Toast.show("Password does not match", Toast.LONG);
          return;
        }
        setLoading(true);
        ApiClient.post("/register", bodyFormData, {
          config: {headers: {"Content-Type": "multipart/form-data"}},
        })
          .then(({data}) => {
            console.log(data);
            setLoading(false);
            if (data.status == 1) {
              goToFirstIndex();
            } else {
              setLoading(false);
              Toast.show(data.error, Toast.LONG);
            }
          })
          .catch(error => {
            setLoading(false);
          });
      } else {
        Toast.show("Please enter the correct email address", Toast.LONG);
      }
    } else {
      Toast.show("Please fill all the details", Toast.LONG);
    }
  };

  const saveDetails = data => {
    dispatchAction(user(data));
    dispatchAction(
      saveShipping({
        city: data.shipping.city,
        postcode: data.shipping.postcode,
        country: data.shipping.country,
        state: data.shipping.state,
      }),
    );
  };

  return (
    <ImageBackground
      style={[styles.container, {width, height}]}
      source={require("../../assets/imgs/splashBackground.png")}>
      <Button style={{padding: 8, alignSelf: "flex-start"}} onPress={goback}>
        <Icon name="close" size={24} color="#ffffff" type="MaterialCommunityIcons" />
      </Button>

      <SwiperFlatList ref={scrollRef}>
        <View style={styles.slide1}>
          {/* <Text style={styles.title}>{t("WELCOME_TO_WOOAPP", {value: Constants.storeName})}</Text> */}

          <Image
            source={require("../../assets/imgs/loginLogo.png")}
            style={{width: "100%", height: "25%"}}
            resizeMode="contain"
          />
          <View style={{backgroundColor: "white", opacity: 0.6, padding: 10, borderRadius: 8}}>
            <Text style={[styles.subtitle, {marginTop: 30, alignSelf: "center"}]}>
              {t("FASHION_INFO")}
            </Text>
            <View style={{width: "100%", flexDirection: "row", marginTop: 20}}>
              <Button
                style={[styles.socialBtn, {flex: 1, marginEnd: 8}]}
                onPress={socialLogin("facebook")}>
                <Icon name="logo-facebook" size={20} color="#000" />
                <Text style={[styles.socialBtnText, {marginStart: 8}]}>{t("FACEBOOK")}</Text>
              </Button>
              <Button
                style={[styles.socialBtn, {flex: 1, marginStart: 8}]}
                onPress={socialLogin("google")}>
                <Icon name="logo-google" size={20} color="#000" />
                <Text style={[styles.socialBtnText, {marginStart: 8}]}>{t("GOOGLE")}</Text>
              </Button>
            </View>
            <View style={{width: "100%", flexDirection: "row", marginVertical: 30}}>
              <View style={styles.line} />
              <Text style={styles.or}>{t("LOGIN_METHODS")}</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder={"Email"}
              placeholderTextColor={"grey"}
              value={state.loginEmail}
              onChangeText={onChangeEmail}
            />
            <TextInput
              style={[styles.textInput, {marginTop: 20}]}
              placeholder={"Password"}
              placeholderTextColor={"grey"}
              value={state.loginPassword}
              onChangeText={onChangePassword}
            />
            {/* <FloatingTextinput
            label={t("EMAIL")}
            labelColor="#000000"
            style={{color: "#000000"}}
            value={state.loginEmail}
            onChangeText={onChangeEmail}
          /> */}
            {/* <View style={{marginTop: 10}}>
            <FloatingTextinput
              secureTextEntry={true}
              label={t("PASSWORD")}
              labelColor="#000000"
              style={{color: "#000000"}}
              value={state.loginPassword}
              onChangeText={onChangePassword}
            />
          </View> */}
            <Button style={{alignSelf: "center", marginTop: 16, paddingVertical: 4}}>
              <Text style={styles.socialBtnText}>{t("FORGOT")}</Text>
            </Button>

            <Button style={[styles.btn, {backgroundColor: accent_color}]} onPress={_login}>
              <Text style={styles.btnText}>{t("SIGN_IN")}</Text>
            </Button>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
                marginTop: 20,
                justifyContent: "center",
              }}>
              <Text style={styles.socialBtnText}>{t("DONT_HAVE_ACCOUNT")}</Text>
              <Button style={{paddingHorizontal: 8}} onPress={goToLastIndex}>
                <Text style={[styles.socialBtnText, {color: accent_color}]}>{t("SIGN_UP")}</Text>
              </Button>
            </View>
          </View>
        </View>

        <View style={styles.slide1}>
          {/* <Text style={styles.title}>{t("WELCOME_TO_WOOAPP", {value: Constants.storeName})}</Text>
          <Text style={styles.subtitle}>{t("FASHION_INFO")}</Text> */}
          <Image
            source={require("../../assets/imgs/loginLogo.png")}
            style={{width: "100%", height: height / 6, marginTop: -40}}
            resizeMode="contain"
          />
          <View style={{backgroundColor: "white", opacity: 0.6, padding: 10, borderRadius: 8}}>
            <Text style={[styles.subtitle, {marginTop: 20, alignSelf: "center"}]}>
              {t("FASHION_INFO")}
            </Text>
            <View style={{width: "100%", flexDirection: "row", marginTop: 20}}>
              <Button
                style={[styles.socialBtn, {flex: 1, marginEnd: 8}]}
                onPress={socialLogin("facebook")}>
                <Icon name="logo-facebook" size={20} color="#000" />
                <Text style={[styles.socialBtnText, {marginStart: 8}]}>{t("FACEBOOK")}</Text>
              </Button>
              <Button
                style={[styles.socialBtn, {flex: 1, marginStart: 8}]}
                onPress={socialLogin("google")}>
                <Icon name="logo-google" size={20} color="#000" />
                <Text style={[styles.socialBtnText, {marginStart: 8}]}>{t("GOOGLE")}</Text>
              </Button>
            </View>
            <View style={{width: "100%", flexDirection: "row", marginVertical: 30}}>
              <View style={styles.line} />
              <Text style={styles.or}>{t("OR")}</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder={t("FIRST_NAME")}
              placeholderTextColor={"grey"}
              value={state.firstname}
              onChangeText={onChangeFirstname}
            />

            {/* <FloatingTextinput
            label={t("FIRST_NAME")}
            labelColor="#FFFFFF"
            style={{color: "#FFFFFF"}}
            value={state.firstname}
            onChangeText={onChangeFirstname}
          /> */}
            <TextInput
              style={[styles.textInput, {marginTop: 20}]}
              placeholder={t("LAST_NAME")}
              placeholderTextColor={"grey"}
              value={state.lastname}
              onChangeText={onChangeLastname}
            />
            {/* <View style={{marginTop: 10}}>
            <FloatingTextinput
              label={t("LAST_NAME")}
              labelColor="#FFFFFF"
              style={{color: "#FFFFFF"}}
              value={state.lastname}
              onChangeText={onChangeLastname}
            />
          </View> */}
            <TextInput
              style={[styles.textInput, {marginTop: 20}]}
              placeholder={t("EMAIL")}
              placeholderTextColor={"grey"}
              value={state.signUpEmail}
              onChangeText={onChangeSignupEmail}
            />
            <TextInput
              style={[styles.textInput, {marginTop: 20}]}
              placeholder={t("PASSWORD")}
              placeholderTextColor={"grey"}
              value={state.password}
              onChangeText={onChangepassword}
            />
            <TextInput
              style={[styles.textInput, {marginTop: 20}]}
              placeholder={t("CONFIRM_PASSWORD")}
              placeholderTextColor={"grey"}
              value={state.confirmPassword}
              onChangeText={onChangeConfirmPassword}
            />

            <Button style={[styles.btn, {backgroundColor: accent_color}]} onPress={_register}>
              <Text style={styles.btnText}>{t("SIGN_UP")}</Text>
            </Button>
            <View
              style={{
                width: "100%",
                marginBottom: 20,
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text
                style={[
                  styles.socialBtnText,
                  {alignSelf: "center", justifyContent: "center", paddingStart: 16},
                ]}>
                By Singing up you will agree to our Privacy Policy and Terms
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  marginTop: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Text style={styles.socialBtnText}>{t("HAVE_AN_ACCOUNT")}</Text>
                <Button style={{paddingHorizontal: 8}} onPress={goToFirstIndex}>
                  <Text style={[styles.socialBtnText, {color: accent_color}]}>{t("SIGN_IN")}</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </SwiperFlatList>
      {loading && (
        <ActivityIndicator style={{alignItems: "center", justifyContent: "center", flex: 1}} />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  slide1: {
    flex: 1,
    width,
    padding: 16,
  },
  title: {
    color: "#000000",
    fontWeight: "500",
    fontSize: 18,
  },
  subtitle: {
    color: "#000000",
    marginTop: 4,
    fontSize: 13,
  },
  socialBtn: {
    flexDirection: "row",
    //borderColor: "#000000",
    borderRadius: 4,
    // borderWidth: 1,
    backgroundColor: "#ffffff",
    height: 40,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    color: "#000000",
    fontSize: 12,
  },
  line: {
    flex: 1,
    alignSelf: "center",
    height: 1,
    backgroundColor: "#000000",
  },
  or: {
    color: "#000",
    paddingHorizontal: 8,
    fontSize: 12,
  },
  btn: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: "center",
  },
  btnText: {
    fontWeight: "600",
    color: "#fff",
  },
  textInput: {
    borderColor: "grey",
    borderRadius: 4,
    //  borderWidth: 1,
    backgroundColor: "#ffffff",
    paddingStart: 20,
    height: 40,
  },
});

export default Auth;
