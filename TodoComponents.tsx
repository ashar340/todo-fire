import { Text } from "react-native-paper";
import React, { useState } from "react";
import { View, Button, Alert, StyleSheet } from "react-native";

import { SegmentedButtons } from "react-native-paper";

// valtioBinding
// firestoreListener



const SortPill = () => {
  const [value, setValue] = React.useState("");

  return (
    <SafeAreaView style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={() => {
          // getDataBySortKey()
          setValue;
        }}
        buttons={[
          {
            value: "recent",
            label: "Recent Activity",
          },
          {
            value: "due_at",
            label: "First Due",
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});

const TodoWithNoteOnlyListItem = ({ todo }) => {
  return <Text>HEY</Text>;
};

const sortyByComponent = () => {};

import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

const recent = "recent";
const dueAt = "due_at";

const userCollection = firestore().collection("Users");

const App: () => Node = () => {
  const [lastDocument, setLastDocument] = useState<any>();
  const [userData, setUserData] = useState([]);

  function LoadData(sortKey: string) {
    console.log("LOAD");
    let query = userCollection.orderBy(sortKey); // sort the data
    if (lastDocument !== undefined) {
      query = query.startAfter(lastDocument); // fetch data following the last document accessed
    }
    query
      .limit(3) // limit to your page size, 3 is just an example
      .get()
      .then((querySnapshot) => {
        setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
        // MakeUserData(querySnapshot.docs);
      });
  }

  return (
    <View>
      {/* {userData} */}
      <Button
        onPress={() => {
          LoadData(recent);
        }}
        title="Load Next"
      />
    </View>
  );
};
