import React, {useState, useEffect, useRef} from 'react';
import {View, ScrollView, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {Slider, Toolbar, Text} from '../../components';
import {useSelector, useDispatch} from 'react-redux';
import {isEmpty} from 'lodash';
import CategoryItem from './CategoryItem';
import SectonHeader from './SectonHeader';
import ProductsRow from '../product/ProductsRow';
import {saveHomeLayout} from '../../store/actions';
import {ApiClient} from '../../service';
import RBSheet from 'react-native-raw-bottom-sheet';

function HomeScreen({navigation}) {
  const [loading, setLoading] = useState(false);
  const layout = useSelector(state => state.homeLayout);
  const RBSheetRef = useRef(null);
  const dispatch = useDispatch();

  const _categoryKeyExtractor = item => 'category_' + item.id;

  useEffect(() => {
    setLoading(true);
    console.log(navigation.state.routeName);
    RBSheetRef.current.open();
    ApiClient.get('/layout')
      .then(({data}) => {
        dispatch(saveHomeLayout(data));
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
      });
  }, []);

  const goTo = (route, params = {}) => {
    navigation.navigate(route, params);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  } else if (isEmpty(layout)) {
    return <View />;
  } else {
    return (
      <>
        <ScrollView nestedScrollEnabled={true}>
          <View>
            <Slider
              //autoplay
              //autoplayLoop
              //autoplayDelay={5}
              data={layout.banner}
              approxHeight={180}
            />
          </View>

          <SectonHeader
            title="Categories"
            titleEnd="View All"
            onPress={goTo}
            onPressArgs={['CategoryScreen']}
          />

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={layout.categories}
            keyExtractor={_categoryKeyExtractor}
            renderItem={CategoryItem}
            removeClippedSubviews={true}
          />

          {layout.featured_products && layout.featured_products.length > 0 && (
            <>
              <SectonHeader title="Featured" titleEnd="See More" style={{marginTop: 8}} />
              <ProductsRow keyPrefix="featured" products={layout.featured_products} />
            </>
          )}

          {layout.top_rated_products && layout.top_rated_products.length > 0 && (
            <>
              <SectonHeader title="Top Rated" titleEnd="See More" style={{marginTop: 8}} />
              <ProductsRow keyPrefix="toprated" products={layout.top_rated_products} />
            </>
          )}

          {layout.sale_products && layout.sale_products.length > 0 && (
            <>
              <SectonHeader title="Tranding Offers" titleEnd="See More" style={{marginTop: 8}} />
              <ProductsRow keyPrefix="sale" products={layout.sale_products} />
            </>
          )}

          {layout.top_seller && layout.top_seller.length > 0 && (
            <>
              <SectonHeader title="Top Sellers" titleEnd="See More" style={{marginTop: 8}} />
              <ProductsRow keyPrefix="topseller" products={layout.top_seller} />
            </>
          )}
        </ScrollView>
        <RBSheet ref={RBSheetRef} customStyles={{container: {justifyContent: 'space-between'}}}>
          <View>
            <Text>Kamal Gangwar</Text>
          </View>
        </RBSheet>
      </>
    );
  }
}

HomeScreen.navigationOptions = {
  header: <Toolbar menuButton cartButton wishListButton title="HOME" />,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
