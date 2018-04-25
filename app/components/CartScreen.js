import React, { Component } from 'react';
import {
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { LinearGradient } from 'expo';
import Swipeout from 'react-native-swipeout';

import CartItem from './common/CartItem';

class CartScreen extends Component {
  static navigationOptions = {
    headerMode: 'none',
  }

  state = {
    currencyConversion: null,
  }

  componentDidMount() {
    if (Object.keys(this.props.cart).length > 0) {
      fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,DASH,BCH,XMR,ZEC,MKR,NEO,BCP,XRP&tsyms=BTC,USD')
        .then(res => res.json())
        .then((res) => {
          /* eslint-disable react/no-did-mount-set-state */
          this.setState({ currencyConversion: res });
          /* eslint-enable react/no-did-mount-set-state */
        });
    }
  }

  showClearCartAlert = () => {
    const {
      navigation: { pop },
      clearCart,
    } = this.props;

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear the cart? This cannot be undone.',
      [
        { text: 'No' },
        { text: 'OK', onPress: () => { clearCart(); pop(); } },
      ],
      { cancelable: false },
    );
  }

  calculateTotal = cart => (
    Object.keys(cart).reduce((accumulator, key) => {
      const {
        quantity,
        price: { local_currency: unitPrice },
      } = cart[key];

      const total = accumulator + (quantity * unitPrice);
      return +(`${Math.round(`${total}e+2`)}e-2`);
    }, 0)
  );

  renderCartItem = (product) => {
    const { addOneToCart, removeOneFromCart, removeFromCart } = this.props;
    const swipeoutButtons = [
      {
        autoClose: true,
        onPress: () => removeFromCart(product),
        text: 'Delete',
        type: 'delete',
      },
    ];

    return (
      <Swipeout right={swipeoutButtons}>
        <CartItem
          product={product}
          onMinusPressed={() => removeOneFromCart(product)}
          onPlusPressed={() => addOneToCart(product)}
        />
      </Swipeout>
    );
  };

  render() {
    const {
      navigation: { navigate, pop },
      cart,
    } = this.props;

    const { currencyConversion } = this.state;

    const total = this.calculateTotal(cart);
    const totalInCrypto =
      currencyConversion && currencyConversion.BTC && currencyConversion.BTC.USD ? (
        total / currencyConversion.BTC.USD
      ) : null;

    return (
      <View style={{ flex: 1 }}>
        <Header
          outerContainerStyles={{
            marginTop: 24,
            marginBottom: 24,
          }}
          backgroundColor="#rgba(0, 0, 0, 0)"
          leftComponent={
            <TouchableOpacity onPress={() => pop()}>
              <Icon
                color="#000"
                name="close"
                type="material-community"
              />
            </TouchableOpacity>
          }
          centerComponent={{
            text: 'Cart',
            style: {
              color: '#000',
              fontSize: 24,
              fontWeight: 'bold',
            },
          }}
          rightComponent={
            <TouchableOpacity onPress={this.showClearCartAlert}>
              <Text> Clear Cart</Text>
            </TouchableOpacity>
          }
        />

        <FlatList
          keyExtractor={product => `${product.productId}`}
          data={Object.keys(cart).map(key => cart[key])}
          renderItem={({ item }) => this.renderCartItem(item)}
        />

        <LinearGradient
          colors={['#000000', '#323232']}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          locations={[0.2, 0.8]}
        >
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: </Text>
            <Text style={styles.totalAmount}>{total}</Text>
            <Text style={styles.totalCurrency}>USD</Text>

            {totalInCrypto !== null &&
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.totalSeparator}>/</Text>
                <Text style={styles.totalAmount}>
                  {
                    totalInCrypto >= 1 ? (
                      Number.parseFloat(total / currencyConversion.BTC.USD).toPrecision(4)
                    ) : (
                      Number.parseFloat(total / currencyConversion.BTC.USD).toPrecision(2)
                    )
                  }
                </Text>
                <Text style={styles.totalCurrency}>BTC</Text>
              </View>
            }
          </View>

          <TouchableOpacity
            disabled={!total}
            onPress={() => total && navigate('payment')}
            style={styles.checkoutButtonContainer}
          >
            <View style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }
}

CartScreen.propTypes = {
  navigation: PropTypes.shape({
    pop: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  cart: PropTypes.shape({}).isRequired,
  addOneToCart: PropTypes.func.isRequired,
  removeOneFromCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  clearCart: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    height: 24,
    marginBottom: 16,
    marginTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  totalText: {
    flex: 1,
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 18,
    fontStyle: 'italic',
    marginRight: 8,
    color: '#fff',
  },
  totalCurrency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalSeparator: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 4,
    marginRight: 4,
  },
  checkoutButtonContainer: {
    backgroundColor: '#006600',
    borderRadius: 30,
    height: 60,
    margin: 16,
    marginBottom: 32,
  },
  checkoutButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default (() => {
  const mapStateToProps = state => ({
    cart: state.cart,
  });

  /* eslint-disable global-require  */
  const {
    addOneToCart,
    removeOneFromCart,
    removeFromCart,
    clearCart,
  } = require('../actions/cart_actions');
  /* eslint-enable global-require  */

  const mapDispatchToProps = {
    addOneToCart,
    removeOneFromCart,
    removeFromCart,
    clearCart,
  };

  return connect(mapStateToProps, mapDispatchToProps)(CartScreen);
})();
