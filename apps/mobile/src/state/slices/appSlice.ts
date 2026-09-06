export interface AppState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

export const initialState: AppState = {
  isLoading: false,
  error: null,
  initialized: false,
};

export function setLoading(
  state: AppState,
  isLoading: boolean
): AppState {
  return {
    ...state,
    isLoading,
  };
}

export function setError(
  state: AppState,
  error: string | null
): AppState {
  return {
    ...state,
    error,
    isLoading: false,
  };
}

export function initializeApp(
  state: AppState
): AppState {
  return {
    ...state,
    initialized: true,
    isLoading: false,
    error: null,
  };
}

export function resetApp(
  state: AppState
): AppState {
  return {
    ...initialState,
  };
}