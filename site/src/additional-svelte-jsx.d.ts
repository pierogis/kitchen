declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onnear?: (event: CustomEvent<boolean>) => void;
    onrelease?: (event: CustomEvent<{ x: number; y: number }>) => void;
  }
}
