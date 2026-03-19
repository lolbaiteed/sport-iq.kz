// src/hooks/useGeolocation.ts
// Reusable geolocation hook for Astro (works in any framework island)

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function getLocation(
  onSuccess: (state: GeolocationState) => void,
  onError: (state: GeolocationState) => void,
  options: GeolocationOptions = {}
): (() => void) | undefined {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  if (!("geolocation" in navigator)) {
    onError({ loading: false, error: "Geolocation is not supported by this browser.", coords: null });
    return;
  }

  const posOptions: PositionOptions = { enableHighAccuracy, timeout, maximumAge };

  const handleSuccess = (position: GeolocationPosition) => {
    onSuccess({
      loading: false,
      error: null,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    });
  };

  const handleError = (err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: "Permission denied. Please allow location access.",
      2: "Position unavailable. Check your connection or GPS signal.",
      3: "Request timed out. Try again.",
    };
    onError({ loading: false, error: messages[err.code] ?? "Unknown error.", coords: null });
  };

  if (watch) {
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, posOptions);
    return () => navigator.geolocation.clearWatch(watchId);
  } else {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, posOptions);
  }
}
