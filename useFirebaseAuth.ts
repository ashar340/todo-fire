import { useState, useEffect, useContext } from "react";
import auth, { firebase } from "@react-native-firebase/auth";
import * as EmailValidator from "email-validator";
import { UserCredential } from "@firebase/auth-types";
import firestore from "@react-native-firebase/firestore";
import { usersReference } from "./firestoreRefs";
import { useProxy } from "valtio/utils";
import { UserContext, userProxy } from "./proxies";

export const useFirebaseAuth = () => {
  const [initializing, setInitializing] = useState(true);
  const userState = useProxy(userProxy);

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    console.log(user, 'onAuthState')
    if (user === null) {
      userState.user.uid = null;
      return;
    }
    userState.user.uid = user?.uid;
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return { initializing };
};

export const createUserByEmailAndPassword = async (
  email: string,
  password: string
) => {
  console.log(email, password, "wooo");
  const isValidEmail = EmailValidator.validate(email);
  const isValidPassword = password?.length >= 8;

  if (isValidEmail && isValidPassword) {
    return auth().createUserWithEmailAndPassword(email, password);
  }

  return { isValidEmail, isValidPassword };
};

export const signIn = (email: string, password: string) => {
  const isValidEmail = EmailValidator.validate(email);
  const isValidPassword = password?.length >= 8;
  if (isValidEmail && isValidPassword) {
    return auth().signInWithEmailAndPassword(email, password);
  }

  return { isValidEmail, isValidPassword };
};

const createUserInFirestore = (
  user: UserCredential,
  email: string,
  name: string
) => {
  if (
    user.user !== null &&
    EmailValidator.validate(email) &&
    name?.length > 0
  ) {
    return usersReference.doc(user.user.uid).set({
      email: email,
      name: name,
    });
  }
};
