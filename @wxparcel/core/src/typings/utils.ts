/**
 * 所有值
 */
export type ValueOf<T> = T[keyof T]

/**
 * 所有属性, 排除方法
 */
export type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>
