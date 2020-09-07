import {View, StyleSheet} from "react-native";
import {Text, Toolbar, Icon, Button} from "components";
import React from "react";
import {useTranslation} from "react-i18next";
import {useSelector, useDispatch} from "react-redux";
import {isArray, isEmpty} from "lodash";
import {SwipeListView} from "react-native-swipe-list-view";
import {deleteNotification} from "store/actions";
import NotificationItem from "./NotificationItem";

function Notification() {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.saveNotification);
  const appSettings = useSelector(state => state.appSettings);
  const {t} = useTranslation();

  const _renderItem = ({item, index}) => <NotificationItem item={item} index={index} />;

  const deleteItem = item => () => {
    dispatch(deleteNotification(item));
    console.log(item);
  };

  const _renderItemActions = ({item, index}) => {
    return (
      <Button
        style={[
          styles.deleteButton,
          {
            marginTop: index > 0 ? 5 : 10,
            marginBottom: 6,
            backgroundColor: appSettings.accent_color,
          },
        ]}
        onPress={deleteItem(item)}>
        <Icon
          name="delete"
          type="MaterialCommunityIcons"
          size={24}
          color="#fff"
          style={{marginRight: 10}}
        />
        <Text style={{color: "#fff", fontWeight: "400"}}>Remove</Text>
      </Button>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Toolbar backButton title={t("NOTIFICATIONS")} />
      {isArray(notification) && isEmpty(notification) && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}>
          <Icon
            name="notifications-off"
            type="MaterialIcons"
            size={44}
            color={appSettings.accent_color}
          />
          <Text style={{textAlign: "center", fontSize: 20, color: appSettings.accent_color}}>
            {t("NO_NOTIFY")}
          </Text>
        </View>
      )}
      {!isEmpty(notification) && (
        <SwipeListView
          data={notification}
          renderItem={_renderItem}
          renderHiddenItem={_renderItemActions}
          disableRightSwipe
          rightOpenValue={-75}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
    marginHorizontal: 20,
    borderRadius: 3,
    padding: 15,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});

export default Notification;
