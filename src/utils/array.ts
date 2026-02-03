import type { MaybeRefOrGetter, ComputedRef } from "vue";
import { toValue, computed } from "vue";

/**
 *
 * @param array
 * @param key
 * @returns RemoveFromArray[]
 */
type RemoveFromArray = {
  key: string;
  value: object;
};

export const _removeFromArrayByKey = (
  list: MaybeRefOrGetter<RemoveFromArray[]>,
  key: string
) => {
 
    return toValue(list).filter((element) => element.key !== key);
 
};

/**
 *
 * @param list
 * @param fn
 * @returns the first element in the array that satisfies the provided testing function. Otherwise, undefined is returned.
 */

export type arrayFindReturn<T = any> = ComputedRef<T | undefined>;
export const arrayFind = <T>(
  list: MaybeRefOrGetter<MaybeRefOrGetter<T>[]>,
  fn: (element: T, index: number, array: MaybeRefOrGetter<T>[]) => boolean
): arrayFindReturn<T> => {
  return computed(() =>
    toValue<T | undefined>(
      toValue(list).find((element, index, array) =>
        fn(toValue(element), index, array)
      )
    )
  );
};
