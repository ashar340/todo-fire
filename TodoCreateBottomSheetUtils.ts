import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { createRef } from "react";

export const todoCreateBottomSheetRef = createRef<BottomSheetModal>();

export const handlePresentPress = () => {
  todoCreateBottomSheetRef.current?.present();
};

export const handleClosePress = () => {
  todoCreateBottomSheetRef.current?.close();
};
