import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppView } from "@/types/habits";

export type UIState = {
  theme: "light" | "dark" | "system";
  view: AppView;
  selectedCategoryId: string | null;
  statusFilter: "all" | "done" | "missed" | "skipped";
  showOnlyDue: boolean;
};

const initialState: UIState = {
  theme: "system",
  view: "month",
  selectedCategoryId: null,
  statusFilter: "all",
  showOnlyDue: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<UIState["theme"]>) {
      state.theme = action.payload;
    },
    setView(state, action: PayloadAction<AppView>) {
      state.view = action.payload;
    },
    setSelectedCategoryId(state, action: PayloadAction<string | null>) {
      state.selectedCategoryId = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<UIState["statusFilter"]>) {
      state.statusFilter = action.payload;
    },
    toggleShowOnlyDue(state) {
      state.showOnlyDue = !state.showOnlyDue;
    },
  },
});

export const { setTheme, setView, setSelectedCategoryId, setStatusFilter, toggleShowOnlyDue } =
  uiSlice.actions;

export default uiSlice.reducer;
