declare module 'rellax' {
  interface RellaxOptions {
    speed?: number;
    center?: boolean;
    wrapper?: string | null;
    round?: boolean;
    vertical?: boolean;
    horizontal?: boolean;
  }

  class Rellax {
    constructor(selector: string, options?: RellaxOptions);
    destroy(): void;
    refresh(): void;
  }

  export default Rellax;
}
