export interface ImpulseEmitOptions {
  callback?: (result: unknown) => void;
  headers?: Record<string, string>;
  extra?: Record<string, unknown>;
  components?: string | string[];
}

export interface ImpulseInstance {
  emit: (event: string, payload?: unknown, options?: ImpulseEmitOptions) => Promise<unknown>;
  updateComponent: (componentId: string, action: string, value?: string, focusInfo?: unknown) => Promise<void>;
  on: (event: string, callback: (payload: unknown) => void) => void;
  off: (event: string, callback: (payload: unknown) => void) => void;
  emitEvent: (event: string, payload: unknown) => void;
  _eventListeners: Record<string, Array<(payload: unknown) => void>>;
}
