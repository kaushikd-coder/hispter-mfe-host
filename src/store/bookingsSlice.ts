import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Booking = {
  id: string;
  facility: string;
  date: string;
  slot: string;
  notes?: string;
  status: "Pending" | "Approved" | "Cancelled";
  user?: { id: string | number; name: string; email: string };
  createdAt: string;
};

type BookingsState = { all: Booking[] };
const initialState: BookingsState = { all: [] };

const bookings = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.all.unshift(action.payload);
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const b = state.all.find(x => x.id === action.payload);
      if (b) b.status = "Cancelled";
    },
    updateBookingStatus: (
      state,
      action: PayloadAction<{ id: string; status: Booking["status"] }>
    ) => {
      const b = state.all.find(x => x.id === action.payload.id);
      if (b) b.status = action.payload.status;
    },
  },
});

export const bookingsReducer = bookings.reducer;


export const selectAllBookings = (s: any) => s.bookings?.all ?? [];
export const selectBookingsCount = (s: any) => (s.bookings?.all ?? []).length;
