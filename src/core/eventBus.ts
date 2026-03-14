// Renderer-side pub/sub event bus.
// Any component can subscribe without touching the IPC layer.
// Events are typed as `unknown` at the bus level — callers narrow with type guards.

type Handler = (event: unknown) => void;

const handlers = new Set<Handler>();

export const eventBus = {
  emit(event: unknown): void {
    handlers.forEach((h) => h(event));
  },

  subscribe(handler: Handler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },

  clear(): void {
    handlers.clear();
  },
};
