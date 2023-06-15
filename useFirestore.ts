import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { usersReference } from "./firestoreRefs";
import { Todo } from "./todoTypes";
import { useProxy } from "valtio/utils";
import {
  currentlyCreatingIdProxy,
  snackbarProxy,
  todosCompletedMapProxy,
  todosNotCompletedMapProxy,
  userProxy,
} from "./proxies";
import { subscribe } from "valtio";
import { handleClosePress } from "./TodoCreateBottomSheetUtils";
import * as Network from "expo-network";
import ellipsize from "ellipsize";

const unsubscribe = subscribe(todosCompletedMapProxy, () =>
  console.log("state has changed to", todosCompletedMapProxy.map.size)
);
const todoCollectionByUserId = (completed: boolean, userId: string) =>
  usersReference
    .doc(userId)
    .collection(completed ? "completedTodos" : "notCompletedTodos");

const todoDocById = (completed: boolean) => (userId: string, todoId: string) =>
  usersReference
    .doc(userId)
    .collection(completed ? "completedTodos" : "notCompletedTodos")
    .doc(todoId);

const updateTodoFields = async (
  completed: boolean,
  userId: string,
  todoId: string,
  fields
) => {
  currentlyCreatingIdProxy.id = todoId;
  console.log(currentlyCreatingIdProxy.id, todoId, "setting update");
  todoDocById(completed)(userId, todoId).update({
    ...fields,
    updated_at: await getServerTimeStamp(),
  });
};

export const deleteTodoTime = async (
  todoId: string,
  userId: string,
  completed: boolean
) => {
  currentlyCreatingIdProxy.id = todoId;

  return todoDocById(completed)(userId, todoId).update({
    due_at_minutes: firestore.FieldValue.delete(),
    due_at_hours: firestore.FieldValue.delete(),
    updated_at: await getServerTimeStamp(),
  });
};

export const deleteTodoDate = async (
  todoId: string,
  userId: string,
  completed: boolean
) => {
  currentlyCreatingIdProxy.id = todoId;

  return todoDocById(completed)(userId, todoId).update({
    due_at_minutes: firestore.FieldValue.delete(),
    due_at_hours: firestore.FieldValue.delete(),
    due_at: firestore.FieldValue.delete(),
    updated_at: await getServerTimeStamp(),
  });
};

export const updateTodoTime = async (
  todoId: string,
  userId: string,
  completed: boolean,
  newTime: { due_at_minutes: number; due_at_hours: number }
) => {
  currentlyCreatingIdProxy.id = todoId;
  console.log(currentlyCreatingIdProxy.id, 'editing time...');
  newTime["updated_at"] = await getServerTimeStamp();
  return todoDocById(completed)(userId, todoId).update(newTime);
};

export const getServerTimeStamp = async () => {
  const s = await Network.getNetworkStateAsync();
  return s.isInternetReachable
    ? firestore.FieldValue.serverTimestamp()
    : firestoreTimestampFromDate(new Date());
};

const getAllTodosByCompletedFilter = (userId: string, completed: boolean) =>
  todoCollectionByUserId(completed, userId)
    .where("completed", "==", completed)

    .get();

export const updateTodoStatus = (
  todoId: string,
  status: boolean,
  userId: string
) =>
  createTodoWithId(
    todoId,
    userId,
    status
      ? todosCompletedMapProxy.map.get(todoId)
      : todosNotCompletedMapProxy.map.get(todoId),
    !status
  );

export const firestoreTimestampFromDate = (d: Date) =>
  firestore.Timestamp.fromDate(d);

export const updateTodoContent = (
  userId: string,
  todoId: string,
  newContent: string,
  completed: boolean
) => updateTodoFields(completed, userId, todoId, { content: newContent });

export const updateTodoDueDate = (
  userId: string,
  todoId: string,
  dueAt: Date,
  completed: boolean
) =>
  updateTodoFields(completed, userId, todoId, {
    due_at: firestoreTimestampFromDate(dueAt),
  });

export const createTodo = (userId: string, t: Todo, completed: boolean) =>
  todoCollectionByUserId(completed, userId).add(t);

export const createTodoWithId = (
  todoId: string,
  userId: string,
  todo: any,
  completed: boolean
) => todoCollectionByUserId(completed, userId).doc(todoId).set(todo);

export const createTodoTemp = (userId: string, t: any, completed: boolean) =>
  todoCollectionByUserId(completed, userId).add(t);

export const getAllTodos = (userId: string, completed: boolean) =>
  todoCollectionByUserId(completed, userId).get();

export const deleteTodoById = (
  todoId: string,
  userId: string,
  completed: boolean
) => todoDocById(completed)(userId, todoId).delete();

export const useFireStoreRealtime = (completed: boolean, userId: string) => {
  useEffect(() => {
    todoCollectionByUserId(completed, userId).onSnapshot((s) =>
      //update state mobx for components
      s.forEach((s2) => console.log(s2.data(), "snapshotChanges"))
    );
  }, []);
};

export const useValtioFirestore = () => {
  const completedMap = useProxy(todosCompletedMapProxy);
  const notCompletedMap = useProxy(todosNotCompletedMapProxy);
  const currentlyCreatingId = useProxy(currentlyCreatingIdProxy);
  const userProxyState = useProxy(userProxy);

  useEffect(() => {
    // notCompleted
    todoCollectionByUserId(false, userProxyState.user.uid).onSnapshot((s) => {
      s.docChanges().forEach((s2) => {
        if (s2.type === "removed") {
          notCompletedMap.map.delete(s2.doc.id);
        } else {
          const docData = s2.doc.data();
          if (currentlyCreatingId.id === s2.doc.id) {
            // currentlyCreatingId.id = "";
            // close bottom sheet
            handleClosePress();
            snackbarProxy.content = `Todo ${ellipsize(docData.content, 10)} ${
              s2.type
            } successfully!`;
            snackbarProxy.isVisible = true;
          }
          if (completedMap.map.has(s2.doc.id)) {
            deleteTodoById(s2.doc.id, userProxyState.user.uid, true);
          }
          notCompletedMap.map.set(s2.doc.id, docData);
        }
      });
    });

    // completed
    todoCollectionByUserId(true, userProxyState.user.uid).onSnapshot((s) => {
      s.docChanges().forEach((s2) => {
        if (s2.type === "removed") {
          completedMap.map.delete(s2.doc.id);
        } else {

          if (currentlyCreatingId.id === s2.doc.id) {
            // currentlyCreatingId.id = "";
            snackbarProxy.content = `Todo ${ellipsize(
              s2.doc.data().content,
              10
            )} ${s2.type} successfully!`;
            snackbarProxy.isVisible = true;
          }

          if (notCompletedMap.map.has(s2.doc.id)) {
            deleteTodoById(s2.doc.id, userProxyState.user.uid, false);
          }
          completedMap.map.set(s2.doc.id, s2.doc.data());
        }
      });
    });
  }, []);

  return () => {
    completedMap.map.clear();
    notCompletedMap.map.clear();
    currentlyCreatingId.id = "";
  }
};

export const firestoreAutoId = (): string => {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return autoId;
};
