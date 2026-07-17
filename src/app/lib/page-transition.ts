type Listener = () => void;

const listeners = new Set<Listener>();

export function onNavigationStart(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNavigationStart() {
  listeners.forEach((listener) => listener());
}
