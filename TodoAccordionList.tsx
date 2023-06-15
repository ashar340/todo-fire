import * as React from "react";
import { List, Checkbox, IconButton } from "react-native-paper";
import { proxy, useSnapshot } from "valtio";

import { proxyMap, useProxy } from "valtio/utils";
import {
  createFormProxy,
  isDateInEditProxy,
  todosCompletedMapProxy,
  todosNotCompletedMapProxy,
  userProxy,
} from "./proxies";
import { useNavigation } from "@react-navigation/native";
import { deleteTodoById, updateTodoStatus } from "./useFirestore";

const TodoListItemCheckbox = ({
  setTodoInMap,
  checked,
}: {
  checked: boolean;
  setTodoInMap: () => void;
}) => {
  return (
    <Checkbox
      status={checked ? "checked" : "unchecked"}
      onPress={() => {
        setTodoInMap();
      }}
    />
  );
};

const TodoListItem = ({
  content,
  completed,
  setTodoInMap,
  key,
}: {
  content: string;
  completed: boolean;
}) => {
  const navigation = useNavigation();

  return (
    <List.Item
      key={key}
      title={content}
      onPress={() => {
        navigation.navigate("TodoDetail", {
          todoId: key,
          completed: completed,
        });
        console.log("lisItmePress");
      }}
      description="Supporting text that is long enough to fill up multiple lines in the item"
      left={(props) => (
        <TodoListItemCheckbox checked={completed} setTodoInMap={setTodoInMap} />
      )}
      right={() => (
        <IconButton
          onPress={() => console.log("checkboxRightPress")}
          icon="delete"
        />
      )}
    />
  );
};

// setTodoInMap has to update checkbox

const TodoListItemId = ({
  completed,
  id,
}: {
  id: string;
  completed: boolean;
}) => {
  const navigation = useNavigation();
  const completedMap = useProxy(todosCompletedMapProxy);
  const notCompletedMap = useProxy(todosNotCompletedMapProxy);
  const formProxyState = useProxy(createFormProxy);
  const userProxyState = useProxy(userProxy);


  const todo = completed
    ? completedMap.map.get(id)
    : notCompletedMap.map.get(id);

  return (
    <List.Item
      title={todo?.content}
      onPress={() => {
        formProxyState.date = todo?.due_at?.toDate();
        if (todo?.due_at_hours && todo?.due_at_minutes) {
          formProxyState.time.hours = todo?.due_at_hours;
          formProxyState.time.minutes = todo?.due_at_minutes;
        }
        navigation.navigate("TodoDetail", {
          todoId: id,
          completed: completed,
        });
      }}
      description={todo?.note}
      left={(props) => (
        <TodoListItemCheckbox
          checked={completed}
          setTodoInMap={() => {
            console.log("setTodoInMap TODO...");
            updateTodoStatus(id, completed, userProxyState.user.uid);
          }}
        />
      )}
      right={() => (
        <IconButton
          onPress={() => {
            deleteTodoById(id, userProxyState.user.uid, completed);
          }}
          icon="delete"
        />
      )}
    />
  );
};

const AccordionList = ({
  completed,
  todos,
}: {
  completed: boolean;
  expanded: boolean;
}) => {
  const handlePress = () => setExpanded(!expanded);
  const [expanded, setExpanded] = React.useState(true);
  return (
    <List.Accordion
      onPress={handlePress}
      expanded={expanded}
      title={completed ? "Completed" : "Not-Completed"}
      left={(props) => (
        <List.Icon
          {...props}
          icon={completed ? "check" : "star-check-outline"}
        />
      )}
    >
      {todos.map(TodoListItem)}
    </List.Accordion>
  );
};

const AccordionListIds = ({
  completed,
  todos,
}: {
  completed: boolean;
  todos: string[];
}) => {
  const handlePress = () => setExpanded(!expanded);
  const [expanded, setExpanded] = React.useState(true);
  return (
    <List.Accordion
      onPress={handlePress}
      expanded={expanded}
      title={completed ? "Completed" : "Not-Completed"}
      left={(props) => (
        <List.Icon
          {...props}
          icon={completed ? "check" : "star-check-outline"}
        />
      )}
    >
      {todos.map((k) => (
        <TodoListItemId key={k} id={k} completed={completed} />
      ))}
    </List.Accordion>
  );
};

// { content, completed, setTodoInMap }

export const TodoAccordionList = ({}) => {
  const completedTodos = useProxy(todosCompletedMapProxy);
  const notCompletedTodos = useProxy(todosNotCompletedMapProxy);

  const setTodoInMap = () => {
    // call firestore
    // listenerFire -> updateProxy
    // { content, completed, setTodoInMap }
  };

  return (
    <List.Section title="TodosSectionTitle">
      <AccordionList
        completed={true}
        todos={[...completedTodos.map].map((t) => ({
          content: t[1].content,
          key: t[0],
          completed: true,
          setTodoInMap: () => {
            // updateCompleted
            console.log("completed....");
          },
        }))}
      />
      <AccordionList
        completed={false}
        todos={[...notCompletedTodos.map].map((t) => ({
          key: t[0],
          content: t[1].content,
          completed: true,
          setTodoInMap: () => {
            // updateCompleted
            console.log("completed....");
          },
        }))}
      />
    </List.Section>
  );
};

export const TodoAccordionListIds = ({}) => {
  const completedTodos = useProxy(todosCompletedMapProxy);
  const notCompletedTodos = useProxy(todosNotCompletedMapProxy);

  return (
    <List.Section>
      <AccordionListIds
        completed={true}
        todos={[...completedTodos.map.keys()]}
      />
      <AccordionListIds
        completed={false}
        todos={[...notCompletedTodos.map.keys()]}
      />
    </List.Section>
  );
};
