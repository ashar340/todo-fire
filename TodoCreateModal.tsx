import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { List, TextInput, Button } from "react-native-paper";
import { todoCreateBottomSheetRef } from "./TodoCreateBottomSheetUtils";
import { TodoDetailDates } from "./TodoDetail";
import { createFormProxy, currentlyCreatingIdProxy, userProxy } from "./proxies";
import { useProxy } from "valtio/utils";
import {
  createTodoWithId,
  firestoreAutoId,
  firestoreTimestampFromDate,
  getServerTimeStamp,
} from "./useFirestore";

const createTodo = async (setTitleError, note: string) => {
  if (createFormProxy.title === "") {
    setTitleError(true);
    return;
  }

  let insertObj = {
    content: createFormProxy.title,
    created_at: await getServerTimeStamp(),
    updated_at: await getServerTimeStamp(),
  };

  if (createFormProxy.time.hours && createFormProxy.time.minutes) {
    const d = createFormProxy.date;
    insertObj["due_at"] = firestoreTimestampFromDate(d);
    insertObj["due_at_hours"] = createFormProxy.time.hours;
    insertObj["due_at_minutes"] = createFormProxy.time.minutes;
  } else if (createFormProxy.date !== undefined) {
    insertObj["due_at"] = firestoreTimestampFromDate(createFormProxy.date);
  }

  if (note?.length > 0) {
    insertObj["note"] = note;
  }

  const id = firestoreAutoId();
  currentlyCreatingIdProxy.id = id;
  createTodoWithId(id, userProxy.user.uid, insertObj, false);
};

const TodoCreateForm = () => {
  const formState = useProxy(createFormProxy);
  const [note, setNote] = useState("");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    return () => {
      (formState.title = ""), (formState.date = undefined);
      formState.time = { hours: undefined, minutes: undefined };
    };
  }, []);

  return (
    <List.Section
      style={{
 
        height: '100%'
      }}
      titleStyle={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}
      title="Create Todo"
    >
      <View style={{flex:1, justifyContent: 'space-between', padding: 18}}>
        <View>
          <TextInput
            mode="outlined"
            style={{ margin: 8 }}
            label="Todo Title"
            error={titleError}
            placeholder="Type something"
            value={formState.title}
            onChangeText={(t) => {
            if(t?.length >100) {
                return;
            }
              formState.title = t;
            }}
            left={<TextInput.Icon icon="keyboard" />}
            right={<TextInput.Affix text={`${formState.title.length}/100`} />}
          />

          <TextInput
            mode="outlined"
            label="Todo Note"
            multiline
            value={note}
            onChangeText={setNote}
            style={{ height: 100, margin: 8 }}
          />

          <TodoDetailDates edit={null} />
        </View>
        <Button
          mode="outlined"
          onPress={() => {
            createTodo(setTitleError, note);
          }}
        >
          Save
        </Button>
      </View>
    </List.Section>
  );
};

export const TodoCreateModal = () => {
  const [backdropPressBehavior, setBackdropPressBehavior] = useState<
    "none" | "close" | "collapse"
  >("close");

  const snapPoints = useMemo(() => ["85%", "85%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} pressBehavior={backdropPressBehavior} />
    ),
    [backdropPressBehavior]
  );

  return (
    <BottomSheetModal
      ref={todoCreateBottomSheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
    >
      <TodoCreateForm />
    </BottomSheetModal>
  );
};
