/**
Foundry shipped declarations import the libraries that the Foundry client bundles at runtime. Those are not npm dependencies of this system, so we need to declare basic types
*/

declare module "pixi.js" {
  namespace PIXI {
    type ColorSource = number | string | number[] | Float32Array;

    class Matrix {
      a: number;
      b: number;
      c: number;
      d: number;
      tx: number;
      ty: number;
    }

    class Texture {
      static WHITE: Texture;
      width: number;
      height: number;
    }

    class Graphics {}
  }

  export default PIXI;
}

declare module "@pixi/graphics-smooth" {
  export class SmoothGraphics {}
}

declare module "@pixi/particle-emitter" {
  export class Emitter {}
}

declare module "handlebars" {
  export function compile(template: string): (context?: unknown) => string;
  export function registerHelper(name: string, fn: (...args: unknown[]) => unknown): void;
  export function registerPartial(name: string, template: string): void;
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      subtle: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare module "socket.io-client" {
  export interface Socket {
    on(event: string, listener: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
    disconnect(): void;
  }
  export function connect(uri: string, options?: unknown): Socket;
}
