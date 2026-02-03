/*

This file implements a global toast system (notification system)

    - "memoryState" holds the current list of toasts (global, module-scoped).
    - "dispatch" applies actions to the reducer and notifies all listeners.
    - "useToast" is a hook that subscribes a component to toast updates.
    - "toast()" is an imperative helper to create a new toast.
 
 */

// React namespace import to use hooks like useState and useEffect
import * as React from "react";

// Pre-made UI parts (I used shadcn/ui)
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/* Toast system configuration */
const TOAST_LIMIT = 1; // Maximum number of toasts to keep in state at once.
const TOAST_REMOVE_DELAY = 1000000; // Delay (ms) before a dismissed toast is removed from state

/*
Internal Toast type
    - A unique ID
    - Optional title/description nodes
    - Optional action element
 */
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode; 
  action?: ToastActionElement;
};

/* Action type constants */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Add a new toast
  UPDATE_TOAST: "UPDATE_TOAST", // Patch an existing toast
  DISMISS_TOAST: "DISMISS_TOAST", // Mark toast closed (open=false) 
  REMOVE_TOAST: "REMOVE_TOAST", // Remove toast from state
} as const;

// A simple counter used for ID generation
let count = 0;

/*
genId() -
Generates a unique-ish string ID by incrementing a counter
and wrapping at MAX_SAFE_INTEGER
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Type alias for the actionTypes object 
type ActionType = typeof actionTypes;

/* Action union */
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast; // Full toast object required to add
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>; // Partial update payload
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"]; // Optional ID; omit to dismiss all
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"]; // Optional ID; omit to remove all
    };

/* State type */
interface State {
  toasts: ToasterToast[];
}

/*
Timeout tracking -
Used to ensure we don't schedule multiple removal timers for the same toast
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/*
addToRemoveQueue() -
Schedules a toast to be removed from state after a delay
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);

    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/*
Reducer -
A pure function that transforms state based on action.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {

    // Add the new toast to the front and trim array to TOAST_LIMIT
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    // Patch a toast in place by matching ID and merge existing toast with the partial update payload
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id
            ? { ...t, ...action.toast }
            : t
        ),
      };

    // Mark one toast (or all) as closed by setting open=false 
    // and schedule them for removal via addToRemoveQueue
    case "DISMISS_TOAST": {
      const { toastId } = action;

      // If toastId is provided -> schedule removal for that toast.
      // If toastId is undefined -> schedule removal for ALL toasts.
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    // Remove one toast by ID, or all toasts if toastId omitted
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = []; // Subscription list of React state setters

let memoryState: State = { toasts: [] }; // Global in-memory store for toasts

/*
dispatch()

Central dispatcher:
    - Computes new memoryState using reducer
    - Notifies all subscribers
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">; // Public facing toast creation type

/*
toast()
Imperative API to create a toast:
    - Generates an ID
    - Dispatches ADD_TOAST with open=true
    - Returns helpers: dismiss() and update()
 */
function toast({ ...props }: Toast) {
  // Generate unique ID for this toast instance
  const id = genId();

  const update = (props: ToasterToast) => // Allows caller to patch the toast after creation
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () => // Convenience helper to dismiss this toast
    dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({ // Create toast and put it in the store
    type: "ADD_TOAST",
    toast: {
      ...props, 
      id,
      open: true,

      // This will be called by the toast UI component when the user closes it
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/*
useToast()
React hook that:
    - Subscribes the calling component to global toast updates
    - Returns toast state and the toast() API
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };