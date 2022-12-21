/**
 * This is a map that allows you to set the maximum number of elements.
 * If the maximum number is exceeded, oldest element will delete.
 */
export class LimitedSizeMap<K, V> extends Map<K, V> {
  readonly #max: number;
  constructor(max: number) {
    super();
    this.#max = max;
  }
  set(key: K, value: V) {
    super.set(key, value);
    while (this.size > this.#max) {
      this.delete(this.keys().next().value);
    }
    return this;
  }
}

/**
 * Cache Map
 */
export class CacheMap<K, V> {
  readonly #config: {
    expireMillis: number;
    max: number;
    updateExpireWhenGet: boolean;
  };
  readonly #map;
  constructor(
    config: {
      expireMillis?: number;
      max?: number;
      updateExpireWhenGet?: boolean;
    },
  ) {
    this.#config = {
      ...{
        expireMillis: Number.MAX_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
        updateExpireWhenGet: false,
      },
      ...config,
    };
    this.#map = new LimitedSizeMap<K, { value: V; createdAt: number }>(
      this.#config.max,
    );
  }
  set(key: K, value: V) {
    this.#map.set(key, { value, createdAt: new Date().getTime() });
    return this;
  }
  get(key: K) {
    const internalValue = this.#map.get(key);
    if (!internalValue) {
      return undefined;
    }
    if (
      (new Date().getTime() - internalValue.createdAt) >
        this.#config.expireMillis
    ) {
      this.#map.delete(key);
      console.debug("expire", key, internalValue);
      return undefined;
    }
    if (this.#config.updateExpireWhenGet) {
      this.set(key, internalValue.value);
    }
    return internalValue.value;
  }

  size(): number {
    return this.#map.size;
  }
}

/**
 * stringify for Map
 *
 * @param map
 * @returns
 */
export function stringifyMap<K, V>(map: Map<K, V>) {
  return JSON.stringify([...map]);
}
