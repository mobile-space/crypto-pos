import React, { Component } from 'react';
import {
  NativeModules,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
  View,
} from 'react-native';

import { LinearGradient } from 'expo';
import { Header, Icon } from 'react-native-elements';

class TransactionsScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isFinishedLoadingTransactions: false,
      transactions: null,
    }
  }

  componentDidMount = async () => {
    this.fetchTransactions();
  }

  fetchTransactions = async () => {
    try {
      let response = await fetch(`https://crypto-payment-processor.herokuapp.com/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
      });

      var responseJSON = null;

      if (response.status === 200) {
        responseJSON = await response.json();

        console.log(responseJSON)

        const transactions = this.filterTransactions(responseJSON);

        this.setState({
          isFinishedLoadingTransactions: true,
          transactions: transactions,
        })

      } else {
        console.log(response.status);
      }
    } catch (error) {
      console.log(error);
    }
  }

  filterTransactions = (transactions) => {
    var filteredTransactions = [];

    transactions.forEach(transaction => {
      const status = transaction.status;

      if (status == 100 || status == 0 || status == -1) {
        filteredTransactions.push(transaction);
      }
    });
    return filteredTransactions;
  }

  _renderTransaction = ({ item: transaction }) => {
    return (
      <View style={[
        styles.transactionContainer,
        { backgroundColor: transaction.status == 100 ? 'green' : "rgba(199,74,16, 0.5)" }
      ]}>
        <View style={styles.coinContainer}>
          <Text style={styles.coinText}>{transaction.coin}</Text>
        </View>

        <View style={styles.amountCountainer}>
          <Text style={styles.amountText}>{transaction.amountf}</Text>
        </View>
      </View>
    );

  }

  render() {
    const { transactions, isFinishedLoadingTransactions } = this.state;

    return (
      <LinearGradient
        style={{ flex: 1 }}
        colors={['#108dc7', '#ef8e38']}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        locations={[0.1, 0.8]}
      >
        <Header
          outerContainerStyles={{
            marginTop: 24,
            marginBottom: 16,
            borderBottomWidth: 0,
          }}
          backgroundColor="rgba(0.0, 0.0, 0.0, 0.0)"
          centerComponent={{
            text: 'Transactions',
            style: {
              color: '#FFF',
              fontSize: 24,
              fontWeight: 'bold',
            },
          }}
        />
        <ScrollView>
          {isFinishedLoadingTransactions &&
            <FlatList
              keyExtractor={(item, index) => index}
              data={transactions}
              renderItem={({ item }) => this._renderTransaction({ item })}
            />
          }
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : NativeModules.StatusBarManager.HEIGHT,
  },

  transactionContainer: {
    flexDirection: 'row',
    flex: 1,
    padding: 5,
    margin: 10,
    borderRadius: 10,
  },

  coinContainer: {
    flex: 1,
    justifyContent: 'flex-start'

  },

  amountCountainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  amountText: {
    padding: 5,
    color: '#FFF',
    fontSize: 12
  },

  coinText: {
    padding: 5,
    color: '#FFF',
    fontSize: 16
  }
});

export default TransactionsScreen;
