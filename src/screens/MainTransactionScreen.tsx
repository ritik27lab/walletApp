import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { provider } from "./components/provider";
import { observer } from "mobx-react";
import walletStore from "../mobxStore/walletStore";
import { runInAction } from "mobx";

export const MainTransactionScreen = observer(() => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [logVisible, setLogVisible] = useState<boolean>(false);
  const [amount, setAmount] = useState("");
  const isFocus = useIsFocused();
  const [gasPrice, setGasPrice] = useState<any>();
  const [transactionFee, setTransactionFee] = useState<any>();

  const [transactionLink, setTransactionLink] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [senderAddress, setSenderAddress] = useState("");

  const BackButton = () => {
    return (
      <TouchableOpacity
        style={{ padding: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#0060B1", fontSize: 16, fontWeight: "600" }}>
          Back
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    setSenderAddress(walletStore.wallet.address);
  }, [isFocus]);

  const transactionLog = () => {
    setLogVisible(!logVisible);
  };

  const openTransactionLink = () => {
    if (transactionLink) {
      Linking.openURL(transactionLink);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const sendTransaction = async () => {
    try {
      receiverAddress == "" && Alert.alert("Enter receiver address");

      const transaction = {
        to: receiverAddress,
        value: ethers.parseEther(amount),
      };

      const tx = await walletStore.wallet.sendTransaction(transaction);
      const transactionHash = tx.hash;
      console.log("tx", tx);

      const addTransactionData = await provider.getTransaction(transactionHash);

      console.log("addtransactiondata", addTransactionData);

      const gasPrice = BigInt(addTransactionData.gasPrice);
      const gasLimit = BigInt(addTransactionData.gasLimit);

      // Calculate the transaction fee
      const transactionFee = (gasPrice * gasLimit).toString();

      setGasPrice(ethers.formatUnits(gasPrice, "gwei"));
      setTransactionFee(ethers.formatUnits(transactionFee, "ether"));

      const transactionToStore = {
        receiverAddress: receiverAddress,
        amount: amount,
        transactionHash: transactionHash,
      };

      runInAction(() => {
        walletStore.addTransaction(transactionToStore);
      });

      const explorerLink = `https://sepolia.etherscan.io/tx/${transactionHash}`;

      // https://polygonscan.com/tx/ for mainnet
      setTransactionLink(explorerLink);

      console.log("Transaction sent:", transactionHash);
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <BackButton />

      <View style={{ padding: 10, marginTop: "10%" }}>
        <Text style={styles.text}>Senders Address:</Text>
        <TextInput
          placeholder="Enter sender address"
          value={senderAddress}
          onChangeText={(text) => setSenderAddress(text)}
          style={styles.input}
        />
        <Text style={styles.text}>Receiver Address:</Text>
        <TextInput
          placeholder="Enter receiver address"
          value={receiverAddress}
          onChangeText={(text) => setReceiverAddress(text)}
          style={styles.input}
        />

        <Text style={styles.text}>Amount:</Text>
        <TextInput
          placeholder="Enter amount"
          value={amount}
          onChangeText={(text) => setAmount(text)}
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={{
          height: 40,
          width: "95%",
          backgroundColor: "#0060B1",
          marginTop: 50,
          justifyContent: "center",
          alignSelf: "center",
        }}
        onPress={sendTransaction}
      >
        <Text style={{ alignSelf: "center", color: "white", fontSize: 18 }}>
          Send Transaction
        </Text>
      </TouchableOpacity>

      {transactionLink && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "95%",
            marginTop: 20,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity onPress={toggleModal}>
            <Text style={styles.transactionHistory}>
              View Transaction History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={transactionLog}>
            <Text style={styles.transactionHistory}>Transaction Log</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={toggleModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <FlatList
            data={walletStore.transactionHistory}
            keyExtractor={(item) => item.transactionHash}
            renderItem={({ item }) => (
              <View style={{ padding: 10, marginVertical: 10 }}>
                <Text style={styles.text}>
                  Receiver: {item.receiverAddress}
                </Text>
                <Text style={styles.text}>Amount: {item.amount} ETH</Text>
                <Text style={styles.text}>
                  Transaction Hash: {item.transactionHash}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
      <Modal visible={logVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={transactionLog}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>

          {transactionLink && (
            <View>
              <Text style={styles.text}>
                Transaction Link:{transactionLink}
              </Text>
              <Text style={styles.text}>Gas Price: {gasPrice}</Text>
              <Text style={styles.text}>Transaction Fee: {transactionFee}</Text>
              <TouchableOpacity onPress={openTransactionLink}>
                <Text
                  style={{
                    alignSelf: "center",
                    color: "white",
                    fontSize: 15,
                    marginTop: 20,
                  }}
                >
                  Tap to open Transaction Link
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
});

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
    color: "#fff",
  },
  text: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    marginTop: "10%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 15,
  },
  closeButton: {
    fontSize: 16,
    color: "#fff",
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 10,
  },
  transactionHashText: {
    fontSize: 12,
    color: "gray",
  },
  transactionHistory: {
    color: "white",
    fontSize: 15,

    marginTop: "5%",
    textDecorationLine: "underline",
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  receiverText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 14,
  },
});
