import firestore from "@react-native-firebase/firestore";

export const usersReference = firestore().collection("users");