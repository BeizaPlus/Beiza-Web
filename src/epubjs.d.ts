declare module 'epubjs' {
  export interface Book {
    ready: Promise<void>;
    locations: {
      generate(chars: number): Promise<void>;
      total: number;
    };
    renderTo(element: HTMLElement | string, options?: {
      width?: string | number;
      height?: string | number;
      spread?: 'none' | 'auto';
    }): Rendition;
    destroy(): void;
  }

  export interface Rendition {
    display(target?: string | number): Promise<void>;
    next(): Promise<void>;
    prev(): Promise<void>;
    themes: {
      default(styles: Record<string, any>): void;
      register(name: string, styles: Record<string, any>): void;
      select(name: string): void;
    };
    destroy(): void;
  }

  export default function ePub(
    url: string,
    options?: {
      requestMethod?: (url: string) => Promise<any>;
      requestCredentials?: boolean;
      requestHeaders?: Record<string, string>;
    }
  ): Book;
}

