import { useNavigation, useRoute } from "@react-navigation/native";
import { ethers } from "ethers";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import { provider } from "./components/provider";
import "../../shim";
import ECPairFactory from "ecpair";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";

import axios from "axios";

export const BitcoinScreen = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const network: any = route.params?.network;
  const [amount, setAmount] = useState<any>();
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");

  const bitcoin = require("bitcoinjs-lib");
  const ECPair = ECPairFactory(ecc);

  const importWallet = async () => {
    try {
      const network = bitcoin.networks.mainnet; // Change to 'bitcoin.networks.bitcoin' for Bitcoin mainnet
      const keyPair = ECPair.fromWIF(privateKey, network);
      const payment = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      });
      console.log("YOO", payment);
      setAddress(payment.address);

      // Fetch the balance
      const response = await axios.get(
        `https://blockstream.info/api/address/${payment.address}`
      );
      const balance = response.data.chain_stats.funded_txo_sum / 100000000; // Convert from satoshis to Bitcoin
      setAmount(balance);
    } catch (error) {
      console.error("Error fetching Bitcoin balance:", error);
    }
  };

  const bitCoinTransactionScreen = () => {
    navigation.navigate("TransactionScreen", {
      privateKey: privateKey,
    });
  };

  const BackButton = () => {
    return (
      <TouchableOpacity
        style={{ padding: 10, marginTop: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#0060B1", fontSize: 16, fontWeight: "600" }}>
          Back
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <BackButton />

      <Text style={styles.text}>Add your bitcoin wallet</Text>
      <View style={{ padding: 10, marginTop: "10%" }}>
        <Text style={{ color: "white" }}>Private Key:</Text>
        <TextInput
          placeholder="Enter receiver address"
          value={privateKey}
          onChangeText={(text) => setPrivateKey(text)}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.connectWallet} onPress={importWallet}>
        <Text style={styles.connectText}>Connect Wallet</Text>
      </TouchableOpacity>

      {address && (
        <View style={{ padding: 10 }}>
          <Text style={{ color: "white" }}>Imported Address: {address}</Text>
          <Text style={{ color: "white" }}>Amount: {amount}</Text>
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <View
              style={{
                backgroundColor: "#AAFF00",
                height: 16,
                width: 16,
                borderRadius: 8,
              }}
            ></View>
            <Text style={{ color: "white", fontSize: 15, marginLeft: 5 }}>
              You are on mainnet
            </Text>
          </View>
          <TouchableOpacity
            style={styles.transactionButton}
            onPress={bitCoinTransactionScreen}
          >
            <Text style={{ alignSelf: "center", color: "white", fontSize: 18 }}>
              Send Transaction
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    borderWidth: 1,
    marginVertical: 20,
    padding: 10,
    borderColor: "#fff",
    color: "white",
  },
  transactionButton: {
    height: 40,
    width: "100%",
    backgroundColor: "#0060B1",
    marginTop: 50,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 10,
  },
  connectWallet: {
    height: 40,
    width: "95%",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginVertical: 5,
    justifyContent: "center",
    borderRadius: 10,
  },
  connectText: {
    alignSelf: "center",
    color: "#0060B1",
    fontSize: 18,
    fontWeight: "500",
  },
  text: {
    color: "white",
    fontSize: 20,
    alignSelf: "center",
    marginTop: 10,
  },
});
