import type { ImpulseInstance, ImpulseEmitOptions } from './impulse';

declare global {
  interface Window {
    initImpulse?: () => void;
    Impulse: ImpulseInstance & {
      emit: (event: string, payload?: unknown, options?: ImpulseEmitOptions) => Promise<unknown>;
    };
  }
}

export {};
