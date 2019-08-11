interface Effect<T extends (...args: any[]) => any> extends Monad<ReturnType<T>> {
  map<N>(f: (x: ReturnType<T>) => N): Effect<(...args: Parameters<T>) => N>;
  chain<N extends Monad<any>>(fn: (x: ReturnType<T>) => N): Effect<(...args: Parameters<T>) => N>;
  readonly executeEffect: T;
}

function effect<T extends (...args: any[]) => any>(_value: T): Effect<T>;
function effect<T>(_value: T): Effect<() => T>;
function effect<
  O,
  T extends (...args: any[]) => any = O extends (...args: any[]) => any ? O : () => O
>(_value: O) {
  const value = (typeof _value === 'function' ? _value : () => _value) as T;

  const ef: Effect<T> = monad({
    toString: () => `Effect(${value.name})`,

    map: <N>(f: (x: ReturnType<T>) => N) => effect(
      (...args: Parameters<T>) => f(value(...args))
    ),

    // TODO
    join: () => value().execute() as any as Join<ReturnType<T>, Effect<T>>,

    // TODO
    apply: (
      function (this: any) { return this; } as any
    ) as Apply<T, Effect<T>>,

    chain<N extends Monad<any>>(fn: (x: T) => N) {
      return this.map(fn).join();
    },

    get executeEffect() {
      return value;
    }
  });

  return ef;
}

effect(() => window)

// class Effect<T extends (...args: any[]) => any> extends Monad<T> {
//   public constructor(value: T) {
//     super(value);
//   }
  
//   map<N>(f: (x: ReturnType<T>) => N) {
//     return new Effect((...args: Parameters<T>) => f(this.value(...args)));
//   }

//   chain<N extends Monad<any>>(fn: (x: ReturnType<T>) => N): N {
//     return this.map(fn).value as any;
//   }

//   public get execute() {
//     return this.value;
//   }

//   toString() {
//     return 'Effect(?)';
//   }

//   static of<T>(x: T) {
//     return new Effect(() => x);
//   }
// }
