import { proxyMap } from "valtio/utils";
import { proxy } from "valtio";

export const todosCompletedMapProxy = proxy({
  map: proxyMap(),
});

export const todosNotCompletedMapProxy = proxy({
  map: proxyMap(),
});

export const currentlyCreatingIdProxy = proxy({
  id: "",
});

export const createFormProxy = proxy<{
  title: string;
  time: { hours: undefined | number; minutes: undefined | number};
  date: undefined | Date;
}>({
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

export const userProxy = proxy<{
  user: {
    uid: null | string;
  };
}>({
  user: {
    uid: null,
  },
});