import { StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  List,
  Button,
  Divider,
  Chip,
  Appbar,
} from "react-native-paper";
import React, { useState, useEffect } from "react";
import {
  DatePickerModal,
  TimePickerModal,
} from "react-native-paper-dates";
import { useProxy } from "valtio/utils";
import {
  createFormProxy,
  todosCompletedMapProxy,
  todosNotCompletedMapProxy,
  userProxy,
} from "./proxies";
import {
  deleteTodoById,
  deleteTodoDate,
  deleteTodoTime,
  updateTodoContent,
  updateTodoDueDate,
  updateTodoStatus,
  updateTodoTime,
} from "./useFirestore";

const maxFontSizeMultiplier = 1.5;
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const pastDate = new Date(new Date().setDate(new Date().getDate() - 5));
const futureDate = new Date(new Date().setDate(new Date().getDate() + 5));
const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold",
  },
  column: {
    flexDirection: "column",
  },
  chip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  logo: {
    height: 56,
    marginRight: 12,
    width: 56,
  },
  paddingSixteen: {
    padding: 16,
  },
  marginBottomEight: {
    marginBottom: 8,
  },
  marginTopEight: {
    marginTop: 8,
  },
  marginTopSixteen: {
    marginTop: 16,
  },
  marginVerticalEight: {
    marginVertical: 8,
    marginHorizontal: 8,
  },
  marginVerticalSixteen: {
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
  },
  section: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sectionContainer: {
    flexDirection: "row",
    marginVertical: 16,
  },
  underline: {
    textDecorationLine: "underline",
  },
});

export const TodoDetailDates = ({
  edit,
}: {
  edit: { todoId: string; isEdit: boolean; completed: boolean } | null;
}) => {
  const [singleOpen, setSingleOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const formState = useProxy(createFormProxy);
  const userProxyState = useProxy(userProxy);

  useEffect(() => {
    return () => {
      formState.title = "";
      formState.time = { hours: undefined, minutes: undefined };
      formState.date = undefined;
    };
  }, []);

  let timeDate = new Date();
  formState.time.hours !== undefined && timeDate.setHours(formState.time.hours);
  formState.time.minutes !== undefined &&
    timeDate.setMinutes(formState.time.minutes);

  return (
    <>
      <List.Section>
        <View style={[styles.row, styles.marginVerticalEight]}>
          <View style={styles.section}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={styles.bold}
            >
              Due At Date
            </Text>
            {formState.date ? (
              <Chip
                icon="calendar"
                onPress={() => {}}
                onClose={() => {
                  formState.date = undefined;
                  // remove date field
                  if (edit?.isEdit) {
                    deleteTodoDate(
                      edit.todoId,
                      userProxyState.user.uid,
                      edit.completed
                    );
                  }
                }}
                style={{ margin: 4, width: 170 }}
              >
                {dateFormatter.format(formState.date)}
              </Chip>
            ) : (
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                variant="bodySmall"
              >
                No date selected.
              </Text>
            )}
          </View>
          <Button
            onPress={() => setSingleOpen(true)}
            uppercase={false}
            mode="outlined"
            compact
          >
            Pick date
          </Button>
        </View>
        {formState.date && (
          <>
            <Divider style={styles.marginVerticalEight} />
            <View style={[styles.row, styles.marginVerticalEight]}>
              <View style={styles.section}>
                <Text
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  style={styles.bold}
                >
                  Due At Time
                </Text>

                {formState.time &&
                formState.time.hours !== undefined &&
                formState.time.minutes !== undefined ? (
                  <Chip
                    icon="clock"
                    onPress={() => {}}
                    onClose={() => {
                      formState.time = { hours: undefined, minutes: undefined };
                      // remove time from firestore
                      if (edit?.isEdit) {
                        deleteTodoTime(
                          edit.todoId,
                          userProxyState.user.uid,
                          edit.completed
                        );
                      }
                    }}
                    style={{ margin: 4, width: 170 }}
                  >
                    {timeFormatter.format(timeDate)}
                  </Chip>
                ) : (
                  <Text
                    maxFontSizeMultiplier={maxFontSizeMultiplier}
                    variant="bodySmall"
                  >
                    No time selected.
                  </Text>
                )}
              </View>
              <Button
                onPress={() => setTimeOpen(true)}
                uppercase={false}
                mode="outlined"
                compact
              >
                Pick time
              </Button>
            </View>
          </>
        )}
      </List.Section>
      <TimePickerModal
        locale={"en"}
        visible={timeOpen}
        onDismiss={() => {
          setTimeOpen(false);
        }}
        onConfirm={({ hours, minutes }: any) => {
          setTimeOpen(false);
          formState.time = { hours, minutes };
          if (edit?.isEdit) {
            updateTodoTime(
              edit.todoId,
              userProxyState.user.uid,
              edit.completed,
              {
                due_at_hours: hours,
                due_at_minutes: minutes,
              }
            );
          }
        }}
        hours={formState.time.hours}
        minutes={formState.time.minutes}
      />
      <DatePickerModal
        locale={"en"}
        mode="single"
        visible={singleOpen}
        onDismiss={() => {
          setSingleOpen(false);
        }}
        date={formState.date}
        onConfirm={(p) => {
          setSingleOpen(false);
          formState.date = p.date;

          if (edit?.isEdit) {
            updateTodoDueDate(
              userProxyState.user.uid,
              edit.todoId,
              p.date,
              edit.completed
            );
          }
        }}
        validRange={{
          startDate: pastDate,
          disabledDates: [futureDate],
        }}
      />
    </>
  );
};

export const TodoDetail = ({ route, navigation }) => {
  const todoCompletedMap = useProxy(todosCompletedMapProxy);
  const todoNotCompletedMap = useProxy(todosNotCompletedMapProxy);

  const todo = route.params.completed
    ? todoCompletedMap.map.get(route.params.todoId)
    : todoNotCompletedMap.map.get(route.params.todoId);

  const [todoTitle, setTodoTitle] = useState(todo.content);
  const userProxyState = useProxy(userProxy);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title="Editing Todo" />
      </Appbar.Header>
      <View style={{ flex: 1, justifyContent: "space-between", padding: 18 }}>
        <View>
          <TextInput
            label={<Text>Title</Text>}
            style={styles.noPaddingInput}
            placeholder="Rename..."
            value={todoTitle}
            onBlur={(e) => {
              if (todoTitle === "") {
                setTodoTitle(todo?.content);
              }
              console.log(e, 'onBlur ev')
              updateTodoContent(
                userProxyState.user.uid,
                route.params.todoId,
                todoTitle,
                route.params.completed
              );
            }}
            onChangeText={setTodoTitle}
          />
          <TodoDetailDates
            edit={{
              isEdit: true,
              todoId: route.params.todoId,
              completed: route.params.completed,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => {
              navigation.goBack();
              deleteTodoById(
                route.params.todoId,
                userProxyState.user.uid,
                route.params.completed
              );
            }}
          >
            Delete
          </Button>

          <Button
            mode="outlined"
            icon="check"
            onPress={() => {
              navigation.goBack();
              updateTodoStatus(
                route.params.todoId,
                route.params.completed,
                userProxyState.user.uid
              );
            }}

          >
            Mark as {!route.params.completed ? "completed" : "not-completed"}
          </Button>
        </View>
      </View>
    </>
  );
};

