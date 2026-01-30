// Minimal ambient declaration to satisfy TypeScript when zustand types aren't resolved
declare module 'zustand' {
  type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  type GetState<T> = () => T;
  export default function create<T>(initializer: (set: SetState<T>, get: GetState<T>) => T): any;
}
