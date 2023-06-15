import { proxyMap, useProxy } from "valtio/utils";
import { proxy, useSnapshot } from "valtio";
import { createContext } from "react";

export const todosCompletedMapProxy = proxy({
  map: proxyMap(),
});

export const todosNotCompletedMapProxy = proxy({
  map: proxyMap(),
});

export const currentlyCreatingIdProxy = proxy({
  id: "",
});

export const createFormProxy = proxy({
  title: "",
  time: { hours: undefined, minutes: undefined },
  date: undefined,
});

export const snackbarProxy = proxy({
  isVisible: false,
  content: "",
});

export const isDateInEditProxy = proxy({
  isInEdit: false,
});

export const userProxy = proxy({
  user: {
    uid: null
  }
});


export const UserContext = createContext({
  user: null,
  setUser: (user) => {}
});