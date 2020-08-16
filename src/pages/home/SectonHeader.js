import React from "react";
import {View, StyleSheet} from "react-native";
import {Text, Button, Icon} from "components";
import {connect} from "react-redux";

class SectonHeader extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  _handleOnPress = () => {
    if (this.props.onPress) {
      this.props.onPress(...this.props.onPressArgs);
    }
  };
  render() {
    const {icon, title, titleEnd, style} = this.props;
    const {
      appSettings: {accent_color},
    } = this.props;
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <Button onPress={this._handleOnPress} style={styles.rightButton}>
          <Text style={{color: accent_color, fontSize: 12}}>{titleEnd}</Text>
          <Icon name={icon} style={{fontSize: 16, marginStart: 8}} color={accent_color} />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
    marginTop: 16,
  },
  title: {
    fontWeight: "600",
  },
  rightButton: {
    paddingVertical: 16,
    marginStart: "auto",
    flexDirection: "row",
  },
});

// SectonHeader.propTypes = {
//     source: PropTypes.object.isRequired,
//     width: PropTypes.number,
//     height: PropTypes.number,
//     style: PropTypes.object
// };

SectonHeader.defaultProps = {
  onPressArgs: [],
  icon: "md-arrow-forward",
};

const mapStateToProps = state => ({appSettings: state.appSettings});

export default connect(mapStateToProps)(SectonHeader);
