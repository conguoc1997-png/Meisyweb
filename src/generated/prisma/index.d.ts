
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model SanPham
 * 
 */
export type SanPham = $Result.DefaultSelection<Prisma.$SanPhamPayload>
/**
 * Model NhapXuatKho
 * 
 */
export type NhapXuatKho = $Result.DefaultSelection<Prisma.$NhapXuatKhoPayload>
/**
 * Model DoiTra
 * 
 */
export type DoiTra = $Result.DefaultSelection<Prisma.$DoiTraPayload>
/**
 * Model Feedback
 * 
 */
export type Feedback = $Result.DefaultSelection<Prisma.$FeedbackPayload>
/**
 * Model BuTien
 * 
 */
export type BuTien = $Result.DefaultSelection<Prisma.$BuTienPayload>
/**
 * Model KOC
 * 
 */
export type KOC = $Result.DefaultSelection<Prisma.$KOCPayload>
/**
 * Model LoCat
 * 
 */
export type LoCat = $Result.DefaultSelection<Prisma.$LoCatPayload>
/**
 * Model VaiTon
 * 
 */
export type VaiTon = $Result.DefaultSelection<Prisma.$VaiTonPayload>
/**
 * Model HoaDonTonHistory
 * 
 */
export type HoaDonTonHistory = $Result.DefaultSelection<Prisma.$HoaDonTonHistoryPayload>
/**
 * Model KOCBooking
 * 
 */
export type KOCBooking = $Result.DefaultSelection<Prisma.$KOCBookingPayload>
/**
 * Model HoaDonTon
 * 
 */
export type HoaDonTon = $Result.DefaultSelection<Prisma.$HoaDonTonPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more SanPhams
 * const sanPhams = await prisma.sanPham.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more SanPhams
   * const sanPhams = await prisma.sanPham.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.sanPham`: Exposes CRUD operations for the **SanPham** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SanPhams
    * const sanPhams = await prisma.sanPham.findMany()
    * ```
    */
  get sanPham(): Prisma.SanPhamDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nhapXuatKho`: Exposes CRUD operations for the **NhapXuatKho** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NhapXuatKhos
    * const nhapXuatKhos = await prisma.nhapXuatKho.findMany()
    * ```
    */
  get nhapXuatKho(): Prisma.NhapXuatKhoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.doiTra`: Exposes CRUD operations for the **DoiTra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DoiTras
    * const doiTras = await prisma.doiTra.findMany()
    * ```
    */
  get doiTra(): Prisma.DoiTraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.feedback`: Exposes CRUD operations for the **Feedback** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Feedbacks
    * const feedbacks = await prisma.feedback.findMany()
    * ```
    */
  get feedback(): Prisma.FeedbackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.buTien`: Exposes CRUD operations for the **BuTien** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BuTiens
    * const buTiens = await prisma.buTien.findMany()
    * ```
    */
  get buTien(): Prisma.BuTienDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.kOC`: Exposes CRUD operations for the **KOC** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KOCS
    * const kOCS = await prisma.kOC.findMany()
    * ```
    */
  get kOC(): Prisma.KOCDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.loCat`: Exposes CRUD operations for the **LoCat** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LoCats
    * const loCats = await prisma.loCat.findMany()
    * ```
    */
  get loCat(): Prisma.LoCatDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vaiTon`: Exposes CRUD operations for the **VaiTon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VaiTons
    * const vaiTons = await prisma.vaiTon.findMany()
    * ```
    */
  get vaiTon(): Prisma.VaiTonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.hoaDonTonHistory`: Exposes CRUD operations for the **HoaDonTonHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HoaDonTonHistories
    * const hoaDonTonHistories = await prisma.hoaDonTonHistory.findMany()
    * ```
    */
  get hoaDonTonHistory(): Prisma.HoaDonTonHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.kOCBooking`: Exposes CRUD operations for the **KOCBooking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KOCBookings
    * const kOCBookings = await prisma.kOCBooking.findMany()
    * ```
    */
  get kOCBooking(): Prisma.KOCBookingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.hoaDonTon`: Exposes CRUD operations for the **HoaDonTon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HoaDonTons
    * const hoaDonTons = await prisma.hoaDonTon.findMany()
    * ```
    */
  get hoaDonTon(): Prisma.HoaDonTonDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    SanPham: 'SanPham',
    NhapXuatKho: 'NhapXuatKho',
    DoiTra: 'DoiTra',
    Feedback: 'Feedback',
    BuTien: 'BuTien',
    KOC: 'KOC',
    LoCat: 'LoCat',
    VaiTon: 'VaiTon',
    HoaDonTonHistory: 'HoaDonTonHistory',
    KOCBooking: 'KOCBooking',
    HoaDonTon: 'HoaDonTon'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "sanPham" | "nhapXuatKho" | "doiTra" | "feedback" | "buTien" | "kOC" | "loCat" | "vaiTon" | "hoaDonTonHistory" | "kOCBooking" | "hoaDonTon"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SanPham: {
        payload: Prisma.$SanPhamPayload<ExtArgs>
        fields: Prisma.SanPhamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SanPhamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SanPhamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          findFirst: {
            args: Prisma.SanPhamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SanPhamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          findMany: {
            args: Prisma.SanPhamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>[]
          }
          create: {
            args: Prisma.SanPhamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          createMany: {
            args: Prisma.SanPhamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SanPhamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>[]
          }
          delete: {
            args: Prisma.SanPhamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          update: {
            args: Prisma.SanPhamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          deleteMany: {
            args: Prisma.SanPhamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SanPhamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SanPhamUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>[]
          }
          upsert: {
            args: Prisma.SanPhamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SanPhamPayload>
          }
          aggregate: {
            args: Prisma.SanPhamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSanPham>
          }
          groupBy: {
            args: Prisma.SanPhamGroupByArgs<ExtArgs>
            result: $Utils.Optional<SanPhamGroupByOutputType>[]
          }
          count: {
            args: Prisma.SanPhamCountArgs<ExtArgs>
            result: $Utils.Optional<SanPhamCountAggregateOutputType> | number
          }
        }
      }
      NhapXuatKho: {
        payload: Prisma.$NhapXuatKhoPayload<ExtArgs>
        fields: Prisma.NhapXuatKhoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NhapXuatKhoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NhapXuatKhoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          findFirst: {
            args: Prisma.NhapXuatKhoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NhapXuatKhoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          findMany: {
            args: Prisma.NhapXuatKhoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>[]
          }
          create: {
            args: Prisma.NhapXuatKhoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          createMany: {
            args: Prisma.NhapXuatKhoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NhapXuatKhoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>[]
          }
          delete: {
            args: Prisma.NhapXuatKhoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          update: {
            args: Prisma.NhapXuatKhoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          deleteMany: {
            args: Prisma.NhapXuatKhoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NhapXuatKhoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NhapXuatKhoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>[]
          }
          upsert: {
            args: Prisma.NhapXuatKhoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NhapXuatKhoPayload>
          }
          aggregate: {
            args: Prisma.NhapXuatKhoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNhapXuatKho>
          }
          groupBy: {
            args: Prisma.NhapXuatKhoGroupByArgs<ExtArgs>
            result: $Utils.Optional<NhapXuatKhoGroupByOutputType>[]
          }
          count: {
            args: Prisma.NhapXuatKhoCountArgs<ExtArgs>
            result: $Utils.Optional<NhapXuatKhoCountAggregateOutputType> | number
          }
        }
      }
      DoiTra: {
        payload: Prisma.$DoiTraPayload<ExtArgs>
        fields: Prisma.DoiTraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DoiTraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DoiTraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          findFirst: {
            args: Prisma.DoiTraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DoiTraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          findMany: {
            args: Prisma.DoiTraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>[]
          }
          create: {
            args: Prisma.DoiTraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          createMany: {
            args: Prisma.DoiTraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DoiTraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>[]
          }
          delete: {
            args: Prisma.DoiTraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          update: {
            args: Prisma.DoiTraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          deleteMany: {
            args: Prisma.DoiTraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DoiTraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DoiTraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>[]
          }
          upsert: {
            args: Prisma.DoiTraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DoiTraPayload>
          }
          aggregate: {
            args: Prisma.DoiTraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDoiTra>
          }
          groupBy: {
            args: Prisma.DoiTraGroupByArgs<ExtArgs>
            result: $Utils.Optional<DoiTraGroupByOutputType>[]
          }
          count: {
            args: Prisma.DoiTraCountArgs<ExtArgs>
            result: $Utils.Optional<DoiTraCountAggregateOutputType> | number
          }
        }
      }
      Feedback: {
        payload: Prisma.$FeedbackPayload<ExtArgs>
        fields: Prisma.FeedbackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FeedbackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FeedbackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          findFirst: {
            args: Prisma.FeedbackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FeedbackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          findMany: {
            args: Prisma.FeedbackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          create: {
            args: Prisma.FeedbackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          createMany: {
            args: Prisma.FeedbackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FeedbackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          delete: {
            args: Prisma.FeedbackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          update: {
            args: Prisma.FeedbackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          deleteMany: {
            args: Prisma.FeedbackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FeedbackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FeedbackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>[]
          }
          upsert: {
            args: Prisma.FeedbackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeedbackPayload>
          }
          aggregate: {
            args: Prisma.FeedbackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFeedback>
          }
          groupBy: {
            args: Prisma.FeedbackGroupByArgs<ExtArgs>
            result: $Utils.Optional<FeedbackGroupByOutputType>[]
          }
          count: {
            args: Prisma.FeedbackCountArgs<ExtArgs>
            result: $Utils.Optional<FeedbackCountAggregateOutputType> | number
          }
        }
      }
      BuTien: {
        payload: Prisma.$BuTienPayload<ExtArgs>
        fields: Prisma.BuTienFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BuTienFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BuTienFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          findFirst: {
            args: Prisma.BuTienFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BuTienFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          findMany: {
            args: Prisma.BuTienFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>[]
          }
          create: {
            args: Prisma.BuTienCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          createMany: {
            args: Prisma.BuTienCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BuTienCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>[]
          }
          delete: {
            args: Prisma.BuTienDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          update: {
            args: Prisma.BuTienUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          deleteMany: {
            args: Prisma.BuTienDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BuTienUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BuTienUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>[]
          }
          upsert: {
            args: Prisma.BuTienUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BuTienPayload>
          }
          aggregate: {
            args: Prisma.BuTienAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBuTien>
          }
          groupBy: {
            args: Prisma.BuTienGroupByArgs<ExtArgs>
            result: $Utils.Optional<BuTienGroupByOutputType>[]
          }
          count: {
            args: Prisma.BuTienCountArgs<ExtArgs>
            result: $Utils.Optional<BuTienCountAggregateOutputType> | number
          }
        }
      }
      KOC: {
        payload: Prisma.$KOCPayload<ExtArgs>
        fields: Prisma.KOCFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KOCFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KOCFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          findFirst: {
            args: Prisma.KOCFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KOCFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          findMany: {
            args: Prisma.KOCFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>[]
          }
          create: {
            args: Prisma.KOCCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          createMany: {
            args: Prisma.KOCCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KOCCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>[]
          }
          delete: {
            args: Prisma.KOCDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          update: {
            args: Prisma.KOCUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          deleteMany: {
            args: Prisma.KOCDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KOCUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KOCUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>[]
          }
          upsert: {
            args: Prisma.KOCUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCPayload>
          }
          aggregate: {
            args: Prisma.KOCAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKOC>
          }
          groupBy: {
            args: Prisma.KOCGroupByArgs<ExtArgs>
            result: $Utils.Optional<KOCGroupByOutputType>[]
          }
          count: {
            args: Prisma.KOCCountArgs<ExtArgs>
            result: $Utils.Optional<KOCCountAggregateOutputType> | number
          }
        }
      }
      LoCat: {
        payload: Prisma.$LoCatPayload<ExtArgs>
        fields: Prisma.LoCatFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LoCatFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LoCatFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          findFirst: {
            args: Prisma.LoCatFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LoCatFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          findMany: {
            args: Prisma.LoCatFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>[]
          }
          create: {
            args: Prisma.LoCatCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          createMany: {
            args: Prisma.LoCatCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LoCatCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>[]
          }
          delete: {
            args: Prisma.LoCatDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          update: {
            args: Prisma.LoCatUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          deleteMany: {
            args: Prisma.LoCatDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LoCatUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LoCatUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>[]
          }
          upsert: {
            args: Prisma.LoCatUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoCatPayload>
          }
          aggregate: {
            args: Prisma.LoCatAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLoCat>
          }
          groupBy: {
            args: Prisma.LoCatGroupByArgs<ExtArgs>
            result: $Utils.Optional<LoCatGroupByOutputType>[]
          }
          count: {
            args: Prisma.LoCatCountArgs<ExtArgs>
            result: $Utils.Optional<LoCatCountAggregateOutputType> | number
          }
        }
      }
      VaiTon: {
        payload: Prisma.$VaiTonPayload<ExtArgs>
        fields: Prisma.VaiTonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VaiTonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VaiTonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          findFirst: {
            args: Prisma.VaiTonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VaiTonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          findMany: {
            args: Prisma.VaiTonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>[]
          }
          create: {
            args: Prisma.VaiTonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          createMany: {
            args: Prisma.VaiTonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VaiTonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>[]
          }
          delete: {
            args: Prisma.VaiTonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          update: {
            args: Prisma.VaiTonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          deleteMany: {
            args: Prisma.VaiTonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VaiTonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VaiTonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>[]
          }
          upsert: {
            args: Prisma.VaiTonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VaiTonPayload>
          }
          aggregate: {
            args: Prisma.VaiTonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVaiTon>
          }
          groupBy: {
            args: Prisma.VaiTonGroupByArgs<ExtArgs>
            result: $Utils.Optional<VaiTonGroupByOutputType>[]
          }
          count: {
            args: Prisma.VaiTonCountArgs<ExtArgs>
            result: $Utils.Optional<VaiTonCountAggregateOutputType> | number
          }
        }
      }
      HoaDonTonHistory: {
        payload: Prisma.$HoaDonTonHistoryPayload<ExtArgs>
        fields: Prisma.HoaDonTonHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HoaDonTonHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HoaDonTonHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          findFirst: {
            args: Prisma.HoaDonTonHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HoaDonTonHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          findMany: {
            args: Prisma.HoaDonTonHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>[]
          }
          create: {
            args: Prisma.HoaDonTonHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          createMany: {
            args: Prisma.HoaDonTonHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HoaDonTonHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>[]
          }
          delete: {
            args: Prisma.HoaDonTonHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          update: {
            args: Prisma.HoaDonTonHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          deleteMany: {
            args: Prisma.HoaDonTonHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HoaDonTonHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HoaDonTonHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>[]
          }
          upsert: {
            args: Prisma.HoaDonTonHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonHistoryPayload>
          }
          aggregate: {
            args: Prisma.HoaDonTonHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHoaDonTonHistory>
          }
          groupBy: {
            args: Prisma.HoaDonTonHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<HoaDonTonHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.HoaDonTonHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<HoaDonTonHistoryCountAggregateOutputType> | number
          }
        }
      }
      KOCBooking: {
        payload: Prisma.$KOCBookingPayload<ExtArgs>
        fields: Prisma.KOCBookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KOCBookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KOCBookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          findFirst: {
            args: Prisma.KOCBookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KOCBookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          findMany: {
            args: Prisma.KOCBookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>[]
          }
          create: {
            args: Prisma.KOCBookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          createMany: {
            args: Prisma.KOCBookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KOCBookingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>[]
          }
          delete: {
            args: Prisma.KOCBookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          update: {
            args: Prisma.KOCBookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          deleteMany: {
            args: Prisma.KOCBookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KOCBookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KOCBookingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>[]
          }
          upsert: {
            args: Prisma.KOCBookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KOCBookingPayload>
          }
          aggregate: {
            args: Prisma.KOCBookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKOCBooking>
          }
          groupBy: {
            args: Prisma.KOCBookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<KOCBookingGroupByOutputType>[]
          }
          count: {
            args: Prisma.KOCBookingCountArgs<ExtArgs>
            result: $Utils.Optional<KOCBookingCountAggregateOutputType> | number
          }
        }
      }
      HoaDonTon: {
        payload: Prisma.$HoaDonTonPayload<ExtArgs>
        fields: Prisma.HoaDonTonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HoaDonTonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HoaDonTonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          findFirst: {
            args: Prisma.HoaDonTonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HoaDonTonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          findMany: {
            args: Prisma.HoaDonTonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>[]
          }
          create: {
            args: Prisma.HoaDonTonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          createMany: {
            args: Prisma.HoaDonTonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HoaDonTonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>[]
          }
          delete: {
            args: Prisma.HoaDonTonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          update: {
            args: Prisma.HoaDonTonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          deleteMany: {
            args: Prisma.HoaDonTonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HoaDonTonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HoaDonTonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>[]
          }
          upsert: {
            args: Prisma.HoaDonTonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoaDonTonPayload>
          }
          aggregate: {
            args: Prisma.HoaDonTonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHoaDonTon>
          }
          groupBy: {
            args: Prisma.HoaDonTonGroupByArgs<ExtArgs>
            result: $Utils.Optional<HoaDonTonGroupByOutputType>[]
          }
          count: {
            args: Prisma.HoaDonTonCountArgs<ExtArgs>
            result: $Utils.Optional<HoaDonTonCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    sanPham?: SanPhamOmit
    nhapXuatKho?: NhapXuatKhoOmit
    doiTra?: DoiTraOmit
    feedback?: FeedbackOmit
    buTien?: BuTienOmit
    kOC?: KOCOmit
    loCat?: LoCatOmit
    vaiTon?: VaiTonOmit
    hoaDonTonHistory?: HoaDonTonHistoryOmit
    kOCBooking?: KOCBookingOmit
    hoaDonTon?: HoaDonTonOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SanPhamCountOutputType
   */

  export type SanPhamCountOutputType = {
    nhapXuats: number
    kocBookings: number
  }

  export type SanPhamCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    nhapXuats?: boolean | SanPhamCountOutputTypeCountNhapXuatsArgs
    kocBookings?: boolean | SanPhamCountOutputTypeCountKocBookingsArgs
  }

  // Custom InputTypes
  /**
   * SanPhamCountOutputType without action
   */
  export type SanPhamCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPhamCountOutputType
     */
    select?: SanPhamCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SanPhamCountOutputType without action
   */
  export type SanPhamCountOutputTypeCountNhapXuatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NhapXuatKhoWhereInput
  }

  /**
   * SanPhamCountOutputType without action
   */
  export type SanPhamCountOutputTypeCountKocBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KOCBookingWhereInput
  }


  /**
   * Count Type KOCCountOutputType
   */

  export type KOCCountOutputType = {
    bookings: number
  }

  export type KOCCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | KOCCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * KOCCountOutputType without action
   */
  export type KOCCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCCountOutputType
     */
    select?: KOCCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * KOCCountOutputType without action
   */
  export type KOCCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KOCBookingWhereInput
  }


  /**
   * Models
   */

  /**
   * Model SanPham
   */

  export type AggregateSanPham = {
    _count: SanPhamCountAggregateOutputType | null
    _avg: SanPhamAvgAggregateOutputType | null
    _sum: SanPhamSumAggregateOutputType | null
    _min: SanPhamMinAggregateOutputType | null
    _max: SanPhamMaxAggregateOutputType | null
  }

  export type SanPhamAvgAggregateOutputType = {
    giaNhap: number | null
    giaBan: number | null
    tonKho: number | null
  }

  export type SanPhamSumAggregateOutputType = {
    giaNhap: number | null
    giaBan: number | null
    tonKho: number | null
  }

  export type SanPhamMinAggregateOutputType = {
    id: string | null
    ten: string | null
    sku: string | null
    mauSac: string | null
    size: string | null
    giaNhap: number | null
    giaBan: number | null
    tonKho: number | null
    nguon: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SanPhamMaxAggregateOutputType = {
    id: string | null
    ten: string | null
    sku: string | null
    mauSac: string | null
    size: string | null
    giaNhap: number | null
    giaBan: number | null
    tonKho: number | null
    nguon: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SanPhamCountAggregateOutputType = {
    id: number
    ten: number
    sku: number
    mauSac: number
    size: number
    giaNhap: number
    giaBan: number
    tonKho: number
    nguon: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SanPhamAvgAggregateInputType = {
    giaNhap?: true
    giaBan?: true
    tonKho?: true
  }

  export type SanPhamSumAggregateInputType = {
    giaNhap?: true
    giaBan?: true
    tonKho?: true
  }

  export type SanPhamMinAggregateInputType = {
    id?: true
    ten?: true
    sku?: true
    mauSac?: true
    size?: true
    giaNhap?: true
    giaBan?: true
    tonKho?: true
    nguon?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SanPhamMaxAggregateInputType = {
    id?: true
    ten?: true
    sku?: true
    mauSac?: true
    size?: true
    giaNhap?: true
    giaBan?: true
    tonKho?: true
    nguon?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SanPhamCountAggregateInputType = {
    id?: true
    ten?: true
    sku?: true
    mauSac?: true
    size?: true
    giaNhap?: true
    giaBan?: true
    tonKho?: true
    nguon?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SanPhamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SanPham to aggregate.
     */
    where?: SanPhamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SanPhams to fetch.
     */
    orderBy?: SanPhamOrderByWithRelationInput | SanPhamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SanPhamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SanPhams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SanPhams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SanPhams
    **/
    _count?: true | SanPhamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SanPhamAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SanPhamSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SanPhamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SanPhamMaxAggregateInputType
  }

  export type GetSanPhamAggregateType<T extends SanPhamAggregateArgs> = {
        [P in keyof T & keyof AggregateSanPham]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSanPham[P]>
      : GetScalarType<T[P], AggregateSanPham[P]>
  }




  export type SanPhamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SanPhamWhereInput
    orderBy?: SanPhamOrderByWithAggregationInput | SanPhamOrderByWithAggregationInput[]
    by: SanPhamScalarFieldEnum[] | SanPhamScalarFieldEnum
    having?: SanPhamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SanPhamCountAggregateInputType | true
    _avg?: SanPhamAvgAggregateInputType
    _sum?: SanPhamSumAggregateInputType
    _min?: SanPhamMinAggregateInputType
    _max?: SanPhamMaxAggregateInputType
  }

  export type SanPhamGroupByOutputType = {
    id: string
    ten: string
    sku: string
    mauSac: string | null
    size: string | null
    giaNhap: number
    giaBan: number
    tonKho: number
    nguon: string | null
    createdAt: Date
    updatedAt: Date
    _count: SanPhamCountAggregateOutputType | null
    _avg: SanPhamAvgAggregateOutputType | null
    _sum: SanPhamSumAggregateOutputType | null
    _min: SanPhamMinAggregateOutputType | null
    _max: SanPhamMaxAggregateOutputType | null
  }

  type GetSanPhamGroupByPayload<T extends SanPhamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SanPhamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SanPhamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SanPhamGroupByOutputType[P]>
            : GetScalarType<T[P], SanPhamGroupByOutputType[P]>
        }
      >
    >


  export type SanPhamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    sku?: boolean
    mauSac?: boolean
    size?: boolean
    giaNhap?: boolean
    giaBan?: boolean
    tonKho?: boolean
    nguon?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    nhapXuats?: boolean | SanPham$nhapXuatsArgs<ExtArgs>
    kocBookings?: boolean | SanPham$kocBookingsArgs<ExtArgs>
    _count?: boolean | SanPhamCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sanPham"]>

  export type SanPhamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    sku?: boolean
    mauSac?: boolean
    size?: boolean
    giaNhap?: boolean
    giaBan?: boolean
    tonKho?: boolean
    nguon?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sanPham"]>

  export type SanPhamSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    sku?: boolean
    mauSac?: boolean
    size?: boolean
    giaNhap?: boolean
    giaBan?: boolean
    tonKho?: boolean
    nguon?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sanPham"]>

  export type SanPhamSelectScalar = {
    id?: boolean
    ten?: boolean
    sku?: boolean
    mauSac?: boolean
    size?: boolean
    giaNhap?: boolean
    giaBan?: boolean
    tonKho?: boolean
    nguon?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SanPhamOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ten" | "sku" | "mauSac" | "size" | "giaNhap" | "giaBan" | "tonKho" | "nguon" | "createdAt" | "updatedAt", ExtArgs["result"]["sanPham"]>
  export type SanPhamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    nhapXuats?: boolean | SanPham$nhapXuatsArgs<ExtArgs>
    kocBookings?: boolean | SanPham$kocBookingsArgs<ExtArgs>
    _count?: boolean | SanPhamCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SanPhamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SanPhamIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SanPhamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SanPham"
    objects: {
      nhapXuats: Prisma.$NhapXuatKhoPayload<ExtArgs>[]
      kocBookings: Prisma.$KOCBookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ten: string
      sku: string
      mauSac: string | null
      size: string | null
      giaNhap: number
      giaBan: number
      tonKho: number
      nguon: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sanPham"]>
    composites: {}
  }

  type SanPhamGetPayload<S extends boolean | null | undefined | SanPhamDefaultArgs> = $Result.GetResult<Prisma.$SanPhamPayload, S>

  type SanPhamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SanPhamFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SanPhamCountAggregateInputType | true
    }

  export interface SanPhamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SanPham'], meta: { name: 'SanPham' } }
    /**
     * Find zero or one SanPham that matches the filter.
     * @param {SanPhamFindUniqueArgs} args - Arguments to find a SanPham
     * @example
     * // Get one SanPham
     * const sanPham = await prisma.sanPham.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SanPhamFindUniqueArgs>(args: SelectSubset<T, SanPhamFindUniqueArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SanPham that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SanPhamFindUniqueOrThrowArgs} args - Arguments to find a SanPham
     * @example
     * // Get one SanPham
     * const sanPham = await prisma.sanPham.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SanPhamFindUniqueOrThrowArgs>(args: SelectSubset<T, SanPhamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SanPham that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamFindFirstArgs} args - Arguments to find a SanPham
     * @example
     * // Get one SanPham
     * const sanPham = await prisma.sanPham.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SanPhamFindFirstArgs>(args?: SelectSubset<T, SanPhamFindFirstArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SanPham that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamFindFirstOrThrowArgs} args - Arguments to find a SanPham
     * @example
     * // Get one SanPham
     * const sanPham = await prisma.sanPham.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SanPhamFindFirstOrThrowArgs>(args?: SelectSubset<T, SanPhamFindFirstOrThrowArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SanPhams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SanPhams
     * const sanPhams = await prisma.sanPham.findMany()
     * 
     * // Get first 10 SanPhams
     * const sanPhams = await prisma.sanPham.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sanPhamWithIdOnly = await prisma.sanPham.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SanPhamFindManyArgs>(args?: SelectSubset<T, SanPhamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SanPham.
     * @param {SanPhamCreateArgs} args - Arguments to create a SanPham.
     * @example
     * // Create one SanPham
     * const SanPham = await prisma.sanPham.create({
     *   data: {
     *     // ... data to create a SanPham
     *   }
     * })
     * 
     */
    create<T extends SanPhamCreateArgs>(args: SelectSubset<T, SanPhamCreateArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SanPhams.
     * @param {SanPhamCreateManyArgs} args - Arguments to create many SanPhams.
     * @example
     * // Create many SanPhams
     * const sanPham = await prisma.sanPham.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SanPhamCreateManyArgs>(args?: SelectSubset<T, SanPhamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SanPhams and returns the data saved in the database.
     * @param {SanPhamCreateManyAndReturnArgs} args - Arguments to create many SanPhams.
     * @example
     * // Create many SanPhams
     * const sanPham = await prisma.sanPham.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SanPhams and only return the `id`
     * const sanPhamWithIdOnly = await prisma.sanPham.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SanPhamCreateManyAndReturnArgs>(args?: SelectSubset<T, SanPhamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SanPham.
     * @param {SanPhamDeleteArgs} args - Arguments to delete one SanPham.
     * @example
     * // Delete one SanPham
     * const SanPham = await prisma.sanPham.delete({
     *   where: {
     *     // ... filter to delete one SanPham
     *   }
     * })
     * 
     */
    delete<T extends SanPhamDeleteArgs>(args: SelectSubset<T, SanPhamDeleteArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SanPham.
     * @param {SanPhamUpdateArgs} args - Arguments to update one SanPham.
     * @example
     * // Update one SanPham
     * const sanPham = await prisma.sanPham.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SanPhamUpdateArgs>(args: SelectSubset<T, SanPhamUpdateArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SanPhams.
     * @param {SanPhamDeleteManyArgs} args - Arguments to filter SanPhams to delete.
     * @example
     * // Delete a few SanPhams
     * const { count } = await prisma.sanPham.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SanPhamDeleteManyArgs>(args?: SelectSubset<T, SanPhamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SanPhams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SanPhams
     * const sanPham = await prisma.sanPham.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SanPhamUpdateManyArgs>(args: SelectSubset<T, SanPhamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SanPhams and returns the data updated in the database.
     * @param {SanPhamUpdateManyAndReturnArgs} args - Arguments to update many SanPhams.
     * @example
     * // Update many SanPhams
     * const sanPham = await prisma.sanPham.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SanPhams and only return the `id`
     * const sanPhamWithIdOnly = await prisma.sanPham.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SanPhamUpdateManyAndReturnArgs>(args: SelectSubset<T, SanPhamUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SanPham.
     * @param {SanPhamUpsertArgs} args - Arguments to update or create a SanPham.
     * @example
     * // Update or create a SanPham
     * const sanPham = await prisma.sanPham.upsert({
     *   create: {
     *     // ... data to create a SanPham
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SanPham we want to update
     *   }
     * })
     */
    upsert<T extends SanPhamUpsertArgs>(args: SelectSubset<T, SanPhamUpsertArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SanPhams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamCountArgs} args - Arguments to filter SanPhams to count.
     * @example
     * // Count the number of SanPhams
     * const count = await prisma.sanPham.count({
     *   where: {
     *     // ... the filter for the SanPhams we want to count
     *   }
     * })
    **/
    count<T extends SanPhamCountArgs>(
      args?: Subset<T, SanPhamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SanPhamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SanPham.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SanPhamAggregateArgs>(args: Subset<T, SanPhamAggregateArgs>): Prisma.PrismaPromise<GetSanPhamAggregateType<T>>

    /**
     * Group by SanPham.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SanPhamGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SanPhamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SanPhamGroupByArgs['orderBy'] }
        : { orderBy?: SanPhamGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SanPhamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSanPhamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SanPham model
   */
  readonly fields: SanPhamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SanPham.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SanPhamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    nhapXuats<T extends SanPham$nhapXuatsArgs<ExtArgs> = {}>(args?: Subset<T, SanPham$nhapXuatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    kocBookings<T extends SanPham$kocBookingsArgs<ExtArgs> = {}>(args?: Subset<T, SanPham$kocBookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SanPham model
   */
  interface SanPhamFieldRefs {
    readonly id: FieldRef<"SanPham", 'String'>
    readonly ten: FieldRef<"SanPham", 'String'>
    readonly sku: FieldRef<"SanPham", 'String'>
    readonly mauSac: FieldRef<"SanPham", 'String'>
    readonly size: FieldRef<"SanPham", 'String'>
    readonly giaNhap: FieldRef<"SanPham", 'Float'>
    readonly giaBan: FieldRef<"SanPham", 'Float'>
    readonly tonKho: FieldRef<"SanPham", 'Int'>
    readonly nguon: FieldRef<"SanPham", 'String'>
    readonly createdAt: FieldRef<"SanPham", 'DateTime'>
    readonly updatedAt: FieldRef<"SanPham", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SanPham findUnique
   */
  export type SanPhamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter, which SanPham to fetch.
     */
    where: SanPhamWhereUniqueInput
  }

  /**
   * SanPham findUniqueOrThrow
   */
  export type SanPhamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter, which SanPham to fetch.
     */
    where: SanPhamWhereUniqueInput
  }

  /**
   * SanPham findFirst
   */
  export type SanPhamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter, which SanPham to fetch.
     */
    where?: SanPhamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SanPhams to fetch.
     */
    orderBy?: SanPhamOrderByWithRelationInput | SanPhamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SanPhams.
     */
    cursor?: SanPhamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SanPhams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SanPhams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SanPhams.
     */
    distinct?: SanPhamScalarFieldEnum | SanPhamScalarFieldEnum[]
  }

  /**
   * SanPham findFirstOrThrow
   */
  export type SanPhamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter, which SanPham to fetch.
     */
    where?: SanPhamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SanPhams to fetch.
     */
    orderBy?: SanPhamOrderByWithRelationInput | SanPhamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SanPhams.
     */
    cursor?: SanPhamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SanPhams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SanPhams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SanPhams.
     */
    distinct?: SanPhamScalarFieldEnum | SanPhamScalarFieldEnum[]
  }

  /**
   * SanPham findMany
   */
  export type SanPhamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter, which SanPhams to fetch.
     */
    where?: SanPhamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SanPhams to fetch.
     */
    orderBy?: SanPhamOrderByWithRelationInput | SanPhamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SanPhams.
     */
    cursor?: SanPhamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SanPhams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SanPhams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SanPhams.
     */
    distinct?: SanPhamScalarFieldEnum | SanPhamScalarFieldEnum[]
  }

  /**
   * SanPham create
   */
  export type SanPhamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * The data needed to create a SanPham.
     */
    data: XOR<SanPhamCreateInput, SanPhamUncheckedCreateInput>
  }

  /**
   * SanPham createMany
   */
  export type SanPhamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SanPhams.
     */
    data: SanPhamCreateManyInput | SanPhamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SanPham createManyAndReturn
   */
  export type SanPhamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * The data used to create many SanPhams.
     */
    data: SanPhamCreateManyInput | SanPhamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SanPham update
   */
  export type SanPhamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * The data needed to update a SanPham.
     */
    data: XOR<SanPhamUpdateInput, SanPhamUncheckedUpdateInput>
    /**
     * Choose, which SanPham to update.
     */
    where: SanPhamWhereUniqueInput
  }

  /**
   * SanPham updateMany
   */
  export type SanPhamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SanPhams.
     */
    data: XOR<SanPhamUpdateManyMutationInput, SanPhamUncheckedUpdateManyInput>
    /**
     * Filter which SanPhams to update
     */
    where?: SanPhamWhereInput
    /**
     * Limit how many SanPhams to update.
     */
    limit?: number
  }

  /**
   * SanPham updateManyAndReturn
   */
  export type SanPhamUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * The data used to update SanPhams.
     */
    data: XOR<SanPhamUpdateManyMutationInput, SanPhamUncheckedUpdateManyInput>
    /**
     * Filter which SanPhams to update
     */
    where?: SanPhamWhereInput
    /**
     * Limit how many SanPhams to update.
     */
    limit?: number
  }

  /**
   * SanPham upsert
   */
  export type SanPhamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * The filter to search for the SanPham to update in case it exists.
     */
    where: SanPhamWhereUniqueInput
    /**
     * In case the SanPham found by the `where` argument doesn't exist, create a new SanPham with this data.
     */
    create: XOR<SanPhamCreateInput, SanPhamUncheckedCreateInput>
    /**
     * In case the SanPham was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SanPhamUpdateInput, SanPhamUncheckedUpdateInput>
  }

  /**
   * SanPham delete
   */
  export type SanPhamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    /**
     * Filter which SanPham to delete.
     */
    where: SanPhamWhereUniqueInput
  }

  /**
   * SanPham deleteMany
   */
  export type SanPhamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SanPhams to delete
     */
    where?: SanPhamWhereInput
    /**
     * Limit how many SanPhams to delete.
     */
    limit?: number
  }

  /**
   * SanPham.nhapXuats
   */
  export type SanPham$nhapXuatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    where?: NhapXuatKhoWhereInput
    orderBy?: NhapXuatKhoOrderByWithRelationInput | NhapXuatKhoOrderByWithRelationInput[]
    cursor?: NhapXuatKhoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NhapXuatKhoScalarFieldEnum | NhapXuatKhoScalarFieldEnum[]
  }

  /**
   * SanPham.kocBookings
   */
  export type SanPham$kocBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    where?: KOCBookingWhereInput
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    cursor?: KOCBookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KOCBookingScalarFieldEnum | KOCBookingScalarFieldEnum[]
  }

  /**
   * SanPham without action
   */
  export type SanPhamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
  }


  /**
   * Model NhapXuatKho
   */

  export type AggregateNhapXuatKho = {
    _count: NhapXuatKhoCountAggregateOutputType | null
    _avg: NhapXuatKhoAvgAggregateOutputType | null
    _sum: NhapXuatKhoSumAggregateOutputType | null
    _min: NhapXuatKhoMinAggregateOutputType | null
    _max: NhapXuatKhoMaxAggregateOutputType | null
  }

  export type NhapXuatKhoAvgAggregateOutputType = {
    soLuong: number | null
  }

  export type NhapXuatKhoSumAggregateOutputType = {
    soLuong: number | null
  }

  export type NhapXuatKhoMinAggregateOutputType = {
    id: string | null
    sanPhamId: string | null
    loai: string | null
    soLuong: number | null
    ghiChu: string | null
    nguoiTao: string | null
    createdAt: Date | null
  }

  export type NhapXuatKhoMaxAggregateOutputType = {
    id: string | null
    sanPhamId: string | null
    loai: string | null
    soLuong: number | null
    ghiChu: string | null
    nguoiTao: string | null
    createdAt: Date | null
  }

  export type NhapXuatKhoCountAggregateOutputType = {
    id: number
    sanPhamId: number
    loai: number
    soLuong: number
    ghiChu: number
    nguoiTao: number
    createdAt: number
    _all: number
  }


  export type NhapXuatKhoAvgAggregateInputType = {
    soLuong?: true
  }

  export type NhapXuatKhoSumAggregateInputType = {
    soLuong?: true
  }

  export type NhapXuatKhoMinAggregateInputType = {
    id?: true
    sanPhamId?: true
    loai?: true
    soLuong?: true
    ghiChu?: true
    nguoiTao?: true
    createdAt?: true
  }

  export type NhapXuatKhoMaxAggregateInputType = {
    id?: true
    sanPhamId?: true
    loai?: true
    soLuong?: true
    ghiChu?: true
    nguoiTao?: true
    createdAt?: true
  }

  export type NhapXuatKhoCountAggregateInputType = {
    id?: true
    sanPhamId?: true
    loai?: true
    soLuong?: true
    ghiChu?: true
    nguoiTao?: true
    createdAt?: true
    _all?: true
  }

  export type NhapXuatKhoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NhapXuatKho to aggregate.
     */
    where?: NhapXuatKhoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NhapXuatKhos to fetch.
     */
    orderBy?: NhapXuatKhoOrderByWithRelationInput | NhapXuatKhoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NhapXuatKhoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NhapXuatKhos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NhapXuatKhos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NhapXuatKhos
    **/
    _count?: true | NhapXuatKhoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NhapXuatKhoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NhapXuatKhoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NhapXuatKhoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NhapXuatKhoMaxAggregateInputType
  }

  export type GetNhapXuatKhoAggregateType<T extends NhapXuatKhoAggregateArgs> = {
        [P in keyof T & keyof AggregateNhapXuatKho]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNhapXuatKho[P]>
      : GetScalarType<T[P], AggregateNhapXuatKho[P]>
  }




  export type NhapXuatKhoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NhapXuatKhoWhereInput
    orderBy?: NhapXuatKhoOrderByWithAggregationInput | NhapXuatKhoOrderByWithAggregationInput[]
    by: NhapXuatKhoScalarFieldEnum[] | NhapXuatKhoScalarFieldEnum
    having?: NhapXuatKhoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NhapXuatKhoCountAggregateInputType | true
    _avg?: NhapXuatKhoAvgAggregateInputType
    _sum?: NhapXuatKhoSumAggregateInputType
    _min?: NhapXuatKhoMinAggregateInputType
    _max?: NhapXuatKhoMaxAggregateInputType
  }

  export type NhapXuatKhoGroupByOutputType = {
    id: string
    sanPhamId: string
    loai: string
    soLuong: number
    ghiChu: string | null
    nguoiTao: string | null
    createdAt: Date
    _count: NhapXuatKhoCountAggregateOutputType | null
    _avg: NhapXuatKhoAvgAggregateOutputType | null
    _sum: NhapXuatKhoSumAggregateOutputType | null
    _min: NhapXuatKhoMinAggregateOutputType | null
    _max: NhapXuatKhoMaxAggregateOutputType | null
  }

  type GetNhapXuatKhoGroupByPayload<T extends NhapXuatKhoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NhapXuatKhoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NhapXuatKhoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NhapXuatKhoGroupByOutputType[P]>
            : GetScalarType<T[P], NhapXuatKhoGroupByOutputType[P]>
        }
      >
    >


  export type NhapXuatKhoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sanPhamId?: boolean
    loai?: boolean
    soLuong?: boolean
    ghiChu?: boolean
    nguoiTao?: boolean
    createdAt?: boolean
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nhapXuatKho"]>

  export type NhapXuatKhoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sanPhamId?: boolean
    loai?: boolean
    soLuong?: boolean
    ghiChu?: boolean
    nguoiTao?: boolean
    createdAt?: boolean
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nhapXuatKho"]>

  export type NhapXuatKhoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sanPhamId?: boolean
    loai?: boolean
    soLuong?: boolean
    ghiChu?: boolean
    nguoiTao?: boolean
    createdAt?: boolean
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["nhapXuatKho"]>

  export type NhapXuatKhoSelectScalar = {
    id?: boolean
    sanPhamId?: boolean
    loai?: boolean
    soLuong?: boolean
    ghiChu?: boolean
    nguoiTao?: boolean
    createdAt?: boolean
  }

  export type NhapXuatKhoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sanPhamId" | "loai" | "soLuong" | "ghiChu" | "nguoiTao" | "createdAt", ExtArgs["result"]["nhapXuatKho"]>
  export type NhapXuatKhoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }
  export type NhapXuatKhoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }
  export type NhapXuatKhoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sanPham?: boolean | SanPhamDefaultArgs<ExtArgs>
  }

  export type $NhapXuatKhoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NhapXuatKho"
    objects: {
      sanPham: Prisma.$SanPhamPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sanPhamId: string
      loai: string
      soLuong: number
      ghiChu: string | null
      nguoiTao: string | null
      createdAt: Date
    }, ExtArgs["result"]["nhapXuatKho"]>
    composites: {}
  }

  type NhapXuatKhoGetPayload<S extends boolean | null | undefined | NhapXuatKhoDefaultArgs> = $Result.GetResult<Prisma.$NhapXuatKhoPayload, S>

  type NhapXuatKhoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NhapXuatKhoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NhapXuatKhoCountAggregateInputType | true
    }

  export interface NhapXuatKhoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NhapXuatKho'], meta: { name: 'NhapXuatKho' } }
    /**
     * Find zero or one NhapXuatKho that matches the filter.
     * @param {NhapXuatKhoFindUniqueArgs} args - Arguments to find a NhapXuatKho
     * @example
     * // Get one NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NhapXuatKhoFindUniqueArgs>(args: SelectSubset<T, NhapXuatKhoFindUniqueArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NhapXuatKho that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NhapXuatKhoFindUniqueOrThrowArgs} args - Arguments to find a NhapXuatKho
     * @example
     * // Get one NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NhapXuatKhoFindUniqueOrThrowArgs>(args: SelectSubset<T, NhapXuatKhoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NhapXuatKho that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoFindFirstArgs} args - Arguments to find a NhapXuatKho
     * @example
     * // Get one NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NhapXuatKhoFindFirstArgs>(args?: SelectSubset<T, NhapXuatKhoFindFirstArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NhapXuatKho that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoFindFirstOrThrowArgs} args - Arguments to find a NhapXuatKho
     * @example
     * // Get one NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NhapXuatKhoFindFirstOrThrowArgs>(args?: SelectSubset<T, NhapXuatKhoFindFirstOrThrowArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NhapXuatKhos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NhapXuatKhos
     * const nhapXuatKhos = await prisma.nhapXuatKho.findMany()
     * 
     * // Get first 10 NhapXuatKhos
     * const nhapXuatKhos = await prisma.nhapXuatKho.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nhapXuatKhoWithIdOnly = await prisma.nhapXuatKho.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NhapXuatKhoFindManyArgs>(args?: SelectSubset<T, NhapXuatKhoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NhapXuatKho.
     * @param {NhapXuatKhoCreateArgs} args - Arguments to create a NhapXuatKho.
     * @example
     * // Create one NhapXuatKho
     * const NhapXuatKho = await prisma.nhapXuatKho.create({
     *   data: {
     *     // ... data to create a NhapXuatKho
     *   }
     * })
     * 
     */
    create<T extends NhapXuatKhoCreateArgs>(args: SelectSubset<T, NhapXuatKhoCreateArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NhapXuatKhos.
     * @param {NhapXuatKhoCreateManyArgs} args - Arguments to create many NhapXuatKhos.
     * @example
     * // Create many NhapXuatKhos
     * const nhapXuatKho = await prisma.nhapXuatKho.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NhapXuatKhoCreateManyArgs>(args?: SelectSubset<T, NhapXuatKhoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NhapXuatKhos and returns the data saved in the database.
     * @param {NhapXuatKhoCreateManyAndReturnArgs} args - Arguments to create many NhapXuatKhos.
     * @example
     * // Create many NhapXuatKhos
     * const nhapXuatKho = await prisma.nhapXuatKho.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NhapXuatKhos and only return the `id`
     * const nhapXuatKhoWithIdOnly = await prisma.nhapXuatKho.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NhapXuatKhoCreateManyAndReturnArgs>(args?: SelectSubset<T, NhapXuatKhoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NhapXuatKho.
     * @param {NhapXuatKhoDeleteArgs} args - Arguments to delete one NhapXuatKho.
     * @example
     * // Delete one NhapXuatKho
     * const NhapXuatKho = await prisma.nhapXuatKho.delete({
     *   where: {
     *     // ... filter to delete one NhapXuatKho
     *   }
     * })
     * 
     */
    delete<T extends NhapXuatKhoDeleteArgs>(args: SelectSubset<T, NhapXuatKhoDeleteArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NhapXuatKho.
     * @param {NhapXuatKhoUpdateArgs} args - Arguments to update one NhapXuatKho.
     * @example
     * // Update one NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NhapXuatKhoUpdateArgs>(args: SelectSubset<T, NhapXuatKhoUpdateArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NhapXuatKhos.
     * @param {NhapXuatKhoDeleteManyArgs} args - Arguments to filter NhapXuatKhos to delete.
     * @example
     * // Delete a few NhapXuatKhos
     * const { count } = await prisma.nhapXuatKho.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NhapXuatKhoDeleteManyArgs>(args?: SelectSubset<T, NhapXuatKhoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NhapXuatKhos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NhapXuatKhos
     * const nhapXuatKho = await prisma.nhapXuatKho.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NhapXuatKhoUpdateManyArgs>(args: SelectSubset<T, NhapXuatKhoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NhapXuatKhos and returns the data updated in the database.
     * @param {NhapXuatKhoUpdateManyAndReturnArgs} args - Arguments to update many NhapXuatKhos.
     * @example
     * // Update many NhapXuatKhos
     * const nhapXuatKho = await prisma.nhapXuatKho.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NhapXuatKhos and only return the `id`
     * const nhapXuatKhoWithIdOnly = await prisma.nhapXuatKho.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NhapXuatKhoUpdateManyAndReturnArgs>(args: SelectSubset<T, NhapXuatKhoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NhapXuatKho.
     * @param {NhapXuatKhoUpsertArgs} args - Arguments to update or create a NhapXuatKho.
     * @example
     * // Update or create a NhapXuatKho
     * const nhapXuatKho = await prisma.nhapXuatKho.upsert({
     *   create: {
     *     // ... data to create a NhapXuatKho
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NhapXuatKho we want to update
     *   }
     * })
     */
    upsert<T extends NhapXuatKhoUpsertArgs>(args: SelectSubset<T, NhapXuatKhoUpsertArgs<ExtArgs>>): Prisma__NhapXuatKhoClient<$Result.GetResult<Prisma.$NhapXuatKhoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NhapXuatKhos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoCountArgs} args - Arguments to filter NhapXuatKhos to count.
     * @example
     * // Count the number of NhapXuatKhos
     * const count = await prisma.nhapXuatKho.count({
     *   where: {
     *     // ... the filter for the NhapXuatKhos we want to count
     *   }
     * })
    **/
    count<T extends NhapXuatKhoCountArgs>(
      args?: Subset<T, NhapXuatKhoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NhapXuatKhoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NhapXuatKho.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NhapXuatKhoAggregateArgs>(args: Subset<T, NhapXuatKhoAggregateArgs>): Prisma.PrismaPromise<GetNhapXuatKhoAggregateType<T>>

    /**
     * Group by NhapXuatKho.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NhapXuatKhoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NhapXuatKhoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NhapXuatKhoGroupByArgs['orderBy'] }
        : { orderBy?: NhapXuatKhoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NhapXuatKhoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNhapXuatKhoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NhapXuatKho model
   */
  readonly fields: NhapXuatKhoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NhapXuatKho.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NhapXuatKhoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sanPham<T extends SanPhamDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SanPhamDefaultArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NhapXuatKho model
   */
  interface NhapXuatKhoFieldRefs {
    readonly id: FieldRef<"NhapXuatKho", 'String'>
    readonly sanPhamId: FieldRef<"NhapXuatKho", 'String'>
    readonly loai: FieldRef<"NhapXuatKho", 'String'>
    readonly soLuong: FieldRef<"NhapXuatKho", 'Int'>
    readonly ghiChu: FieldRef<"NhapXuatKho", 'String'>
    readonly nguoiTao: FieldRef<"NhapXuatKho", 'String'>
    readonly createdAt: FieldRef<"NhapXuatKho", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NhapXuatKho findUnique
   */
  export type NhapXuatKhoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter, which NhapXuatKho to fetch.
     */
    where: NhapXuatKhoWhereUniqueInput
  }

  /**
   * NhapXuatKho findUniqueOrThrow
   */
  export type NhapXuatKhoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter, which NhapXuatKho to fetch.
     */
    where: NhapXuatKhoWhereUniqueInput
  }

  /**
   * NhapXuatKho findFirst
   */
  export type NhapXuatKhoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter, which NhapXuatKho to fetch.
     */
    where?: NhapXuatKhoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NhapXuatKhos to fetch.
     */
    orderBy?: NhapXuatKhoOrderByWithRelationInput | NhapXuatKhoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NhapXuatKhos.
     */
    cursor?: NhapXuatKhoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NhapXuatKhos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NhapXuatKhos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NhapXuatKhos.
     */
    distinct?: NhapXuatKhoScalarFieldEnum | NhapXuatKhoScalarFieldEnum[]
  }

  /**
   * NhapXuatKho findFirstOrThrow
   */
  export type NhapXuatKhoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter, which NhapXuatKho to fetch.
     */
    where?: NhapXuatKhoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NhapXuatKhos to fetch.
     */
    orderBy?: NhapXuatKhoOrderByWithRelationInput | NhapXuatKhoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NhapXuatKhos.
     */
    cursor?: NhapXuatKhoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NhapXuatKhos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NhapXuatKhos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NhapXuatKhos.
     */
    distinct?: NhapXuatKhoScalarFieldEnum | NhapXuatKhoScalarFieldEnum[]
  }

  /**
   * NhapXuatKho findMany
   */
  export type NhapXuatKhoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter, which NhapXuatKhos to fetch.
     */
    where?: NhapXuatKhoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NhapXuatKhos to fetch.
     */
    orderBy?: NhapXuatKhoOrderByWithRelationInput | NhapXuatKhoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NhapXuatKhos.
     */
    cursor?: NhapXuatKhoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NhapXuatKhos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NhapXuatKhos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NhapXuatKhos.
     */
    distinct?: NhapXuatKhoScalarFieldEnum | NhapXuatKhoScalarFieldEnum[]
  }

  /**
   * NhapXuatKho create
   */
  export type NhapXuatKhoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * The data needed to create a NhapXuatKho.
     */
    data: XOR<NhapXuatKhoCreateInput, NhapXuatKhoUncheckedCreateInput>
  }

  /**
   * NhapXuatKho createMany
   */
  export type NhapXuatKhoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NhapXuatKhos.
     */
    data: NhapXuatKhoCreateManyInput | NhapXuatKhoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NhapXuatKho createManyAndReturn
   */
  export type NhapXuatKhoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * The data used to create many NhapXuatKhos.
     */
    data: NhapXuatKhoCreateManyInput | NhapXuatKhoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * NhapXuatKho update
   */
  export type NhapXuatKhoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * The data needed to update a NhapXuatKho.
     */
    data: XOR<NhapXuatKhoUpdateInput, NhapXuatKhoUncheckedUpdateInput>
    /**
     * Choose, which NhapXuatKho to update.
     */
    where: NhapXuatKhoWhereUniqueInput
  }

  /**
   * NhapXuatKho updateMany
   */
  export type NhapXuatKhoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NhapXuatKhos.
     */
    data: XOR<NhapXuatKhoUpdateManyMutationInput, NhapXuatKhoUncheckedUpdateManyInput>
    /**
     * Filter which NhapXuatKhos to update
     */
    where?: NhapXuatKhoWhereInput
    /**
     * Limit how many NhapXuatKhos to update.
     */
    limit?: number
  }

  /**
   * NhapXuatKho updateManyAndReturn
   */
  export type NhapXuatKhoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * The data used to update NhapXuatKhos.
     */
    data: XOR<NhapXuatKhoUpdateManyMutationInput, NhapXuatKhoUncheckedUpdateManyInput>
    /**
     * Filter which NhapXuatKhos to update
     */
    where?: NhapXuatKhoWhereInput
    /**
     * Limit how many NhapXuatKhos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * NhapXuatKho upsert
   */
  export type NhapXuatKhoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * The filter to search for the NhapXuatKho to update in case it exists.
     */
    where: NhapXuatKhoWhereUniqueInput
    /**
     * In case the NhapXuatKho found by the `where` argument doesn't exist, create a new NhapXuatKho with this data.
     */
    create: XOR<NhapXuatKhoCreateInput, NhapXuatKhoUncheckedCreateInput>
    /**
     * In case the NhapXuatKho was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NhapXuatKhoUpdateInput, NhapXuatKhoUncheckedUpdateInput>
  }

  /**
   * NhapXuatKho delete
   */
  export type NhapXuatKhoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
    /**
     * Filter which NhapXuatKho to delete.
     */
    where: NhapXuatKhoWhereUniqueInput
  }

  /**
   * NhapXuatKho deleteMany
   */
  export type NhapXuatKhoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NhapXuatKhos to delete
     */
    where?: NhapXuatKhoWhereInput
    /**
     * Limit how many NhapXuatKhos to delete.
     */
    limit?: number
  }

  /**
   * NhapXuatKho without action
   */
  export type NhapXuatKhoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NhapXuatKho
     */
    select?: NhapXuatKhoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NhapXuatKho
     */
    omit?: NhapXuatKhoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NhapXuatKhoInclude<ExtArgs> | null
  }


  /**
   * Model DoiTra
   */

  export type AggregateDoiTra = {
    _count: DoiTraCountAggregateOutputType | null
    _avg: DoiTraAvgAggregateOutputType | null
    _sum: DoiTraSumAggregateOutputType | null
    _min: DoiTraMinAggregateOutputType | null
    _max: DoiTraMaxAggregateOutputType | null
  }

  export type DoiTraAvgAggregateOutputType = {
    giaTriHang: number | null
    phiShip: number | null
    soChieuShip: number | null
  }

  export type DoiTraSumAggregateOutputType = {
    giaTriHang: number | null
    phiShip: number | null
    soChieuShip: number | null
  }

  export type DoiTraMinAggregateOutputType = {
    id: string | null
    maDoiTra: string | null
    sdtThangTruoc: string | null
    sdtHienTai: string | null
    tenKhach: string | null
    diaChi: string | null
    skuHienTai: string | null
    skuDoiSang: string | null
    giaTriHang: number | null
    loaiVanDe: string | null
    ghiChu: string | null
    phiShip: number | null
    soChieuShip: number | null
    maVanDon: string | null
    trangThai: string | null
    nguoiXuLy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DoiTraMaxAggregateOutputType = {
    id: string | null
    maDoiTra: string | null
    sdtThangTruoc: string | null
    sdtHienTai: string | null
    tenKhach: string | null
    diaChi: string | null
    skuHienTai: string | null
    skuDoiSang: string | null
    giaTriHang: number | null
    loaiVanDe: string | null
    ghiChu: string | null
    phiShip: number | null
    soChieuShip: number | null
    maVanDon: string | null
    trangThai: string | null
    nguoiXuLy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DoiTraCountAggregateOutputType = {
    id: number
    maDoiTra: number
    sdtThangTruoc: number
    sdtHienTai: number
    tenKhach: number
    diaChi: number
    skuHienTai: number
    skuDoiSang: number
    giaTriHang: number
    loaiVanDe: number
    ghiChu: number
    phiShip: number
    soChieuShip: number
    maVanDon: number
    trangThai: number
    nguoiXuLy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DoiTraAvgAggregateInputType = {
    giaTriHang?: true
    phiShip?: true
    soChieuShip?: true
  }

  export type DoiTraSumAggregateInputType = {
    giaTriHang?: true
    phiShip?: true
    soChieuShip?: true
  }

  export type DoiTraMinAggregateInputType = {
    id?: true
    maDoiTra?: true
    sdtThangTruoc?: true
    sdtHienTai?: true
    tenKhach?: true
    diaChi?: true
    skuHienTai?: true
    skuDoiSang?: true
    giaTriHang?: true
    loaiVanDe?: true
    ghiChu?: true
    phiShip?: true
    soChieuShip?: true
    maVanDon?: true
    trangThai?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DoiTraMaxAggregateInputType = {
    id?: true
    maDoiTra?: true
    sdtThangTruoc?: true
    sdtHienTai?: true
    tenKhach?: true
    diaChi?: true
    skuHienTai?: true
    skuDoiSang?: true
    giaTriHang?: true
    loaiVanDe?: true
    ghiChu?: true
    phiShip?: true
    soChieuShip?: true
    maVanDon?: true
    trangThai?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DoiTraCountAggregateInputType = {
    id?: true
    maDoiTra?: true
    sdtThangTruoc?: true
    sdtHienTai?: true
    tenKhach?: true
    diaChi?: true
    skuHienTai?: true
    skuDoiSang?: true
    giaTriHang?: true
    loaiVanDe?: true
    ghiChu?: true
    phiShip?: true
    soChieuShip?: true
    maVanDon?: true
    trangThai?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DoiTraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DoiTra to aggregate.
     */
    where?: DoiTraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DoiTras to fetch.
     */
    orderBy?: DoiTraOrderByWithRelationInput | DoiTraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DoiTraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DoiTras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DoiTras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DoiTras
    **/
    _count?: true | DoiTraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DoiTraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DoiTraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DoiTraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DoiTraMaxAggregateInputType
  }

  export type GetDoiTraAggregateType<T extends DoiTraAggregateArgs> = {
        [P in keyof T & keyof AggregateDoiTra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDoiTra[P]>
      : GetScalarType<T[P], AggregateDoiTra[P]>
  }




  export type DoiTraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DoiTraWhereInput
    orderBy?: DoiTraOrderByWithAggregationInput | DoiTraOrderByWithAggregationInput[]
    by: DoiTraScalarFieldEnum[] | DoiTraScalarFieldEnum
    having?: DoiTraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DoiTraCountAggregateInputType | true
    _avg?: DoiTraAvgAggregateInputType
    _sum?: DoiTraSumAggregateInputType
    _min?: DoiTraMinAggregateInputType
    _max?: DoiTraMaxAggregateInputType
  }

  export type DoiTraGroupByOutputType = {
    id: string
    maDoiTra: string
    sdtThangTruoc: string | null
    sdtHienTai: string | null
    tenKhach: string
    diaChi: string | null
    skuHienTai: string | null
    skuDoiSang: string | null
    giaTriHang: number
    loaiVanDe: string
    ghiChu: string | null
    phiShip: number
    soChieuShip: number
    maVanDon: string | null
    trangThai: string
    nguoiXuLy: string | null
    createdAt: Date
    updatedAt: Date
    _count: DoiTraCountAggregateOutputType | null
    _avg: DoiTraAvgAggregateOutputType | null
    _sum: DoiTraSumAggregateOutputType | null
    _min: DoiTraMinAggregateOutputType | null
    _max: DoiTraMaxAggregateOutputType | null
  }

  type GetDoiTraGroupByPayload<T extends DoiTraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DoiTraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DoiTraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DoiTraGroupByOutputType[P]>
            : GetScalarType<T[P], DoiTraGroupByOutputType[P]>
        }
      >
    >


  export type DoiTraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maDoiTra?: boolean
    sdtThangTruoc?: boolean
    sdtHienTai?: boolean
    tenKhach?: boolean
    diaChi?: boolean
    skuHienTai?: boolean
    skuDoiSang?: boolean
    giaTriHang?: boolean
    loaiVanDe?: boolean
    ghiChu?: boolean
    phiShip?: boolean
    soChieuShip?: boolean
    maVanDon?: boolean
    trangThai?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["doiTra"]>

  export type DoiTraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maDoiTra?: boolean
    sdtThangTruoc?: boolean
    sdtHienTai?: boolean
    tenKhach?: boolean
    diaChi?: boolean
    skuHienTai?: boolean
    skuDoiSang?: boolean
    giaTriHang?: boolean
    loaiVanDe?: boolean
    ghiChu?: boolean
    phiShip?: boolean
    soChieuShip?: boolean
    maVanDon?: boolean
    trangThai?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["doiTra"]>

  export type DoiTraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maDoiTra?: boolean
    sdtThangTruoc?: boolean
    sdtHienTai?: boolean
    tenKhach?: boolean
    diaChi?: boolean
    skuHienTai?: boolean
    skuDoiSang?: boolean
    giaTriHang?: boolean
    loaiVanDe?: boolean
    ghiChu?: boolean
    phiShip?: boolean
    soChieuShip?: boolean
    maVanDon?: boolean
    trangThai?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["doiTra"]>

  export type DoiTraSelectScalar = {
    id?: boolean
    maDoiTra?: boolean
    sdtThangTruoc?: boolean
    sdtHienTai?: boolean
    tenKhach?: boolean
    diaChi?: boolean
    skuHienTai?: boolean
    skuDoiSang?: boolean
    giaTriHang?: boolean
    loaiVanDe?: boolean
    ghiChu?: boolean
    phiShip?: boolean
    soChieuShip?: boolean
    maVanDon?: boolean
    trangThai?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DoiTraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "maDoiTra" | "sdtThangTruoc" | "sdtHienTai" | "tenKhach" | "diaChi" | "skuHienTai" | "skuDoiSang" | "giaTriHang" | "loaiVanDe" | "ghiChu" | "phiShip" | "soChieuShip" | "maVanDon" | "trangThai" | "nguoiXuLy" | "createdAt" | "updatedAt", ExtArgs["result"]["doiTra"]>

  export type $DoiTraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DoiTra"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      maDoiTra: string
      sdtThangTruoc: string | null
      sdtHienTai: string | null
      tenKhach: string
      diaChi: string | null
      skuHienTai: string | null
      skuDoiSang: string | null
      giaTriHang: number
      loaiVanDe: string
      ghiChu: string | null
      phiShip: number
      soChieuShip: number
      maVanDon: string | null
      trangThai: string
      nguoiXuLy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["doiTra"]>
    composites: {}
  }

  type DoiTraGetPayload<S extends boolean | null | undefined | DoiTraDefaultArgs> = $Result.GetResult<Prisma.$DoiTraPayload, S>

  type DoiTraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DoiTraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DoiTraCountAggregateInputType | true
    }

  export interface DoiTraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DoiTra'], meta: { name: 'DoiTra' } }
    /**
     * Find zero or one DoiTra that matches the filter.
     * @param {DoiTraFindUniqueArgs} args - Arguments to find a DoiTra
     * @example
     * // Get one DoiTra
     * const doiTra = await prisma.doiTra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DoiTraFindUniqueArgs>(args: SelectSubset<T, DoiTraFindUniqueArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DoiTra that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DoiTraFindUniqueOrThrowArgs} args - Arguments to find a DoiTra
     * @example
     * // Get one DoiTra
     * const doiTra = await prisma.doiTra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DoiTraFindUniqueOrThrowArgs>(args: SelectSubset<T, DoiTraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DoiTra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraFindFirstArgs} args - Arguments to find a DoiTra
     * @example
     * // Get one DoiTra
     * const doiTra = await prisma.doiTra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DoiTraFindFirstArgs>(args?: SelectSubset<T, DoiTraFindFirstArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DoiTra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraFindFirstOrThrowArgs} args - Arguments to find a DoiTra
     * @example
     * // Get one DoiTra
     * const doiTra = await prisma.doiTra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DoiTraFindFirstOrThrowArgs>(args?: SelectSubset<T, DoiTraFindFirstOrThrowArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DoiTras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DoiTras
     * const doiTras = await prisma.doiTra.findMany()
     * 
     * // Get first 10 DoiTras
     * const doiTras = await prisma.doiTra.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const doiTraWithIdOnly = await prisma.doiTra.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DoiTraFindManyArgs>(args?: SelectSubset<T, DoiTraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DoiTra.
     * @param {DoiTraCreateArgs} args - Arguments to create a DoiTra.
     * @example
     * // Create one DoiTra
     * const DoiTra = await prisma.doiTra.create({
     *   data: {
     *     // ... data to create a DoiTra
     *   }
     * })
     * 
     */
    create<T extends DoiTraCreateArgs>(args: SelectSubset<T, DoiTraCreateArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DoiTras.
     * @param {DoiTraCreateManyArgs} args - Arguments to create many DoiTras.
     * @example
     * // Create many DoiTras
     * const doiTra = await prisma.doiTra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DoiTraCreateManyArgs>(args?: SelectSubset<T, DoiTraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DoiTras and returns the data saved in the database.
     * @param {DoiTraCreateManyAndReturnArgs} args - Arguments to create many DoiTras.
     * @example
     * // Create many DoiTras
     * const doiTra = await prisma.doiTra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DoiTras and only return the `id`
     * const doiTraWithIdOnly = await prisma.doiTra.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DoiTraCreateManyAndReturnArgs>(args?: SelectSubset<T, DoiTraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DoiTra.
     * @param {DoiTraDeleteArgs} args - Arguments to delete one DoiTra.
     * @example
     * // Delete one DoiTra
     * const DoiTra = await prisma.doiTra.delete({
     *   where: {
     *     // ... filter to delete one DoiTra
     *   }
     * })
     * 
     */
    delete<T extends DoiTraDeleteArgs>(args: SelectSubset<T, DoiTraDeleteArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DoiTra.
     * @param {DoiTraUpdateArgs} args - Arguments to update one DoiTra.
     * @example
     * // Update one DoiTra
     * const doiTra = await prisma.doiTra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DoiTraUpdateArgs>(args: SelectSubset<T, DoiTraUpdateArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DoiTras.
     * @param {DoiTraDeleteManyArgs} args - Arguments to filter DoiTras to delete.
     * @example
     * // Delete a few DoiTras
     * const { count } = await prisma.doiTra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DoiTraDeleteManyArgs>(args?: SelectSubset<T, DoiTraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DoiTras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DoiTras
     * const doiTra = await prisma.doiTra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DoiTraUpdateManyArgs>(args: SelectSubset<T, DoiTraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DoiTras and returns the data updated in the database.
     * @param {DoiTraUpdateManyAndReturnArgs} args - Arguments to update many DoiTras.
     * @example
     * // Update many DoiTras
     * const doiTra = await prisma.doiTra.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DoiTras and only return the `id`
     * const doiTraWithIdOnly = await prisma.doiTra.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DoiTraUpdateManyAndReturnArgs>(args: SelectSubset<T, DoiTraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DoiTra.
     * @param {DoiTraUpsertArgs} args - Arguments to update or create a DoiTra.
     * @example
     * // Update or create a DoiTra
     * const doiTra = await prisma.doiTra.upsert({
     *   create: {
     *     // ... data to create a DoiTra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DoiTra we want to update
     *   }
     * })
     */
    upsert<T extends DoiTraUpsertArgs>(args: SelectSubset<T, DoiTraUpsertArgs<ExtArgs>>): Prisma__DoiTraClient<$Result.GetResult<Prisma.$DoiTraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DoiTras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraCountArgs} args - Arguments to filter DoiTras to count.
     * @example
     * // Count the number of DoiTras
     * const count = await prisma.doiTra.count({
     *   where: {
     *     // ... the filter for the DoiTras we want to count
     *   }
     * })
    **/
    count<T extends DoiTraCountArgs>(
      args?: Subset<T, DoiTraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DoiTraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DoiTra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DoiTraAggregateArgs>(args: Subset<T, DoiTraAggregateArgs>): Prisma.PrismaPromise<GetDoiTraAggregateType<T>>

    /**
     * Group by DoiTra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DoiTraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DoiTraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DoiTraGroupByArgs['orderBy'] }
        : { orderBy?: DoiTraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DoiTraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDoiTraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DoiTra model
   */
  readonly fields: DoiTraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DoiTra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DoiTraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DoiTra model
   */
  interface DoiTraFieldRefs {
    readonly id: FieldRef<"DoiTra", 'String'>
    readonly maDoiTra: FieldRef<"DoiTra", 'String'>
    readonly sdtThangTruoc: FieldRef<"DoiTra", 'String'>
    readonly sdtHienTai: FieldRef<"DoiTra", 'String'>
    readonly tenKhach: FieldRef<"DoiTra", 'String'>
    readonly diaChi: FieldRef<"DoiTra", 'String'>
    readonly skuHienTai: FieldRef<"DoiTra", 'String'>
    readonly skuDoiSang: FieldRef<"DoiTra", 'String'>
    readonly giaTriHang: FieldRef<"DoiTra", 'Float'>
    readonly loaiVanDe: FieldRef<"DoiTra", 'String'>
    readonly ghiChu: FieldRef<"DoiTra", 'String'>
    readonly phiShip: FieldRef<"DoiTra", 'Float'>
    readonly soChieuShip: FieldRef<"DoiTra", 'Int'>
    readonly maVanDon: FieldRef<"DoiTra", 'String'>
    readonly trangThai: FieldRef<"DoiTra", 'String'>
    readonly nguoiXuLy: FieldRef<"DoiTra", 'String'>
    readonly createdAt: FieldRef<"DoiTra", 'DateTime'>
    readonly updatedAt: FieldRef<"DoiTra", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DoiTra findUnique
   */
  export type DoiTraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter, which DoiTra to fetch.
     */
    where: DoiTraWhereUniqueInput
  }

  /**
   * DoiTra findUniqueOrThrow
   */
  export type DoiTraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter, which DoiTra to fetch.
     */
    where: DoiTraWhereUniqueInput
  }

  /**
   * DoiTra findFirst
   */
  export type DoiTraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter, which DoiTra to fetch.
     */
    where?: DoiTraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DoiTras to fetch.
     */
    orderBy?: DoiTraOrderByWithRelationInput | DoiTraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DoiTras.
     */
    cursor?: DoiTraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DoiTras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DoiTras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DoiTras.
     */
    distinct?: DoiTraScalarFieldEnum | DoiTraScalarFieldEnum[]
  }

  /**
   * DoiTra findFirstOrThrow
   */
  export type DoiTraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter, which DoiTra to fetch.
     */
    where?: DoiTraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DoiTras to fetch.
     */
    orderBy?: DoiTraOrderByWithRelationInput | DoiTraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DoiTras.
     */
    cursor?: DoiTraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DoiTras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DoiTras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DoiTras.
     */
    distinct?: DoiTraScalarFieldEnum | DoiTraScalarFieldEnum[]
  }

  /**
   * DoiTra findMany
   */
  export type DoiTraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter, which DoiTras to fetch.
     */
    where?: DoiTraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DoiTras to fetch.
     */
    orderBy?: DoiTraOrderByWithRelationInput | DoiTraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DoiTras.
     */
    cursor?: DoiTraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DoiTras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DoiTras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DoiTras.
     */
    distinct?: DoiTraScalarFieldEnum | DoiTraScalarFieldEnum[]
  }

  /**
   * DoiTra create
   */
  export type DoiTraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * The data needed to create a DoiTra.
     */
    data: XOR<DoiTraCreateInput, DoiTraUncheckedCreateInput>
  }

  /**
   * DoiTra createMany
   */
  export type DoiTraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DoiTras.
     */
    data: DoiTraCreateManyInput | DoiTraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DoiTra createManyAndReturn
   */
  export type DoiTraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * The data used to create many DoiTras.
     */
    data: DoiTraCreateManyInput | DoiTraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DoiTra update
   */
  export type DoiTraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * The data needed to update a DoiTra.
     */
    data: XOR<DoiTraUpdateInput, DoiTraUncheckedUpdateInput>
    /**
     * Choose, which DoiTra to update.
     */
    where: DoiTraWhereUniqueInput
  }

  /**
   * DoiTra updateMany
   */
  export type DoiTraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DoiTras.
     */
    data: XOR<DoiTraUpdateManyMutationInput, DoiTraUncheckedUpdateManyInput>
    /**
     * Filter which DoiTras to update
     */
    where?: DoiTraWhereInput
    /**
     * Limit how many DoiTras to update.
     */
    limit?: number
  }

  /**
   * DoiTra updateManyAndReturn
   */
  export type DoiTraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * The data used to update DoiTras.
     */
    data: XOR<DoiTraUpdateManyMutationInput, DoiTraUncheckedUpdateManyInput>
    /**
     * Filter which DoiTras to update
     */
    where?: DoiTraWhereInput
    /**
     * Limit how many DoiTras to update.
     */
    limit?: number
  }

  /**
   * DoiTra upsert
   */
  export type DoiTraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * The filter to search for the DoiTra to update in case it exists.
     */
    where: DoiTraWhereUniqueInput
    /**
     * In case the DoiTra found by the `where` argument doesn't exist, create a new DoiTra with this data.
     */
    create: XOR<DoiTraCreateInput, DoiTraUncheckedCreateInput>
    /**
     * In case the DoiTra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DoiTraUpdateInput, DoiTraUncheckedUpdateInput>
  }

  /**
   * DoiTra delete
   */
  export type DoiTraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
    /**
     * Filter which DoiTra to delete.
     */
    where: DoiTraWhereUniqueInput
  }

  /**
   * DoiTra deleteMany
   */
  export type DoiTraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DoiTras to delete
     */
    where?: DoiTraWhereInput
    /**
     * Limit how many DoiTras to delete.
     */
    limit?: number
  }

  /**
   * DoiTra without action
   */
  export type DoiTraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DoiTra
     */
    select?: DoiTraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DoiTra
     */
    omit?: DoiTraOmit<ExtArgs> | null
  }


  /**
   * Model Feedback
   */

  export type AggregateFeedback = {
    _count: FeedbackCountAggregateOutputType | null
    _avg: FeedbackAvgAggregateOutputType | null
    _sum: FeedbackSumAggregateOutputType | null
    _min: FeedbackMinAggregateOutputType | null
    _max: FeedbackMaxAggregateOutputType | null
  }

  export type FeedbackAvgAggregateOutputType = {
    danhGia: number | null
  }

  export type FeedbackSumAggregateOutputType = {
    danhGia: number | null
  }

  export type FeedbackMinAggregateOutputType = {
    id: string | null
    tenKhach: string | null
    sdtKhach: string | null
    sku: string | null
    kenh: string | null
    loai: string | null
    noiDung: string | null
    danhGia: number | null
    nguoiGhiNhan: string | null
    createdAt: Date | null
  }

  export type FeedbackMaxAggregateOutputType = {
    id: string | null
    tenKhach: string | null
    sdtKhach: string | null
    sku: string | null
    kenh: string | null
    loai: string | null
    noiDung: string | null
    danhGia: number | null
    nguoiGhiNhan: string | null
    createdAt: Date | null
  }

  export type FeedbackCountAggregateOutputType = {
    id: number
    tenKhach: number
    sdtKhach: number
    sku: number
    kenh: number
    loai: number
    noiDung: number
    danhGia: number
    nguoiGhiNhan: number
    createdAt: number
    _all: number
  }


  export type FeedbackAvgAggregateInputType = {
    danhGia?: true
  }

  export type FeedbackSumAggregateInputType = {
    danhGia?: true
  }

  export type FeedbackMinAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    sku?: true
    kenh?: true
    loai?: true
    noiDung?: true
    danhGia?: true
    nguoiGhiNhan?: true
    createdAt?: true
  }

  export type FeedbackMaxAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    sku?: true
    kenh?: true
    loai?: true
    noiDung?: true
    danhGia?: true
    nguoiGhiNhan?: true
    createdAt?: true
  }

  export type FeedbackCountAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    sku?: true
    kenh?: true
    loai?: true
    noiDung?: true
    danhGia?: true
    nguoiGhiNhan?: true
    createdAt?: true
    _all?: true
  }

  export type FeedbackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Feedback to aggregate.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Feedbacks
    **/
    _count?: true | FeedbackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FeedbackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FeedbackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FeedbackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FeedbackMaxAggregateInputType
  }

  export type GetFeedbackAggregateType<T extends FeedbackAggregateArgs> = {
        [P in keyof T & keyof AggregateFeedback]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFeedback[P]>
      : GetScalarType<T[P], AggregateFeedback[P]>
  }




  export type FeedbackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeedbackWhereInput
    orderBy?: FeedbackOrderByWithAggregationInput | FeedbackOrderByWithAggregationInput[]
    by: FeedbackScalarFieldEnum[] | FeedbackScalarFieldEnum
    having?: FeedbackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FeedbackCountAggregateInputType | true
    _avg?: FeedbackAvgAggregateInputType
    _sum?: FeedbackSumAggregateInputType
    _min?: FeedbackMinAggregateInputType
    _max?: FeedbackMaxAggregateInputType
  }

  export type FeedbackGroupByOutputType = {
    id: string
    tenKhach: string | null
    sdtKhach: string | null
    sku: string | null
    kenh: string
    loai: string
    noiDung: string
    danhGia: number | null
    nguoiGhiNhan: string | null
    createdAt: Date
    _count: FeedbackCountAggregateOutputType | null
    _avg: FeedbackAvgAggregateOutputType | null
    _sum: FeedbackSumAggregateOutputType | null
    _min: FeedbackMinAggregateOutputType | null
    _max: FeedbackMaxAggregateOutputType | null
  }

  type GetFeedbackGroupByPayload<T extends FeedbackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FeedbackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FeedbackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeedbackGroupByOutputType[P]>
            : GetScalarType<T[P], FeedbackGroupByOutputType[P]>
        }
      >
    >


  export type FeedbackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    sku?: boolean
    kenh?: boolean
    loai?: boolean
    noiDung?: boolean
    danhGia?: boolean
    nguoiGhiNhan?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    sku?: boolean
    kenh?: boolean
    loai?: boolean
    noiDung?: boolean
    danhGia?: boolean
    nguoiGhiNhan?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    sku?: boolean
    kenh?: boolean
    loai?: boolean
    noiDung?: boolean
    danhGia?: boolean
    nguoiGhiNhan?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["feedback"]>

  export type FeedbackSelectScalar = {
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    sku?: boolean
    kenh?: boolean
    loai?: boolean
    noiDung?: boolean
    danhGia?: boolean
    nguoiGhiNhan?: boolean
    createdAt?: boolean
  }

  export type FeedbackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenKhach" | "sdtKhach" | "sku" | "kenh" | "loai" | "noiDung" | "danhGia" | "nguoiGhiNhan" | "createdAt", ExtArgs["result"]["feedback"]>

  export type $FeedbackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Feedback"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenKhach: string | null
      sdtKhach: string | null
      sku: string | null
      kenh: string
      loai: string
      noiDung: string
      danhGia: number | null
      nguoiGhiNhan: string | null
      createdAt: Date
    }, ExtArgs["result"]["feedback"]>
    composites: {}
  }

  type FeedbackGetPayload<S extends boolean | null | undefined | FeedbackDefaultArgs> = $Result.GetResult<Prisma.$FeedbackPayload, S>

  type FeedbackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FeedbackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FeedbackCountAggregateInputType | true
    }

  export interface FeedbackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Feedback'], meta: { name: 'Feedback' } }
    /**
     * Find zero or one Feedback that matches the filter.
     * @param {FeedbackFindUniqueArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeedbackFindUniqueArgs>(args: SelectSubset<T, FeedbackFindUniqueArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Feedback that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeedbackFindUniqueOrThrowArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeedbackFindUniqueOrThrowArgs>(args: SelectSubset<T, FeedbackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Feedback that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindFirstArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeedbackFindFirstArgs>(args?: SelectSubset<T, FeedbackFindFirstArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Feedback that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindFirstOrThrowArgs} args - Arguments to find a Feedback
     * @example
     * // Get one Feedback
     * const feedback = await prisma.feedback.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeedbackFindFirstOrThrowArgs>(args?: SelectSubset<T, FeedbackFindFirstOrThrowArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Feedbacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Feedbacks
     * const feedbacks = await prisma.feedback.findMany()
     * 
     * // Get first 10 Feedbacks
     * const feedbacks = await prisma.feedback.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const feedbackWithIdOnly = await prisma.feedback.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FeedbackFindManyArgs>(args?: SelectSubset<T, FeedbackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Feedback.
     * @param {FeedbackCreateArgs} args - Arguments to create a Feedback.
     * @example
     * // Create one Feedback
     * const Feedback = await prisma.feedback.create({
     *   data: {
     *     // ... data to create a Feedback
     *   }
     * })
     * 
     */
    create<T extends FeedbackCreateArgs>(args: SelectSubset<T, FeedbackCreateArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Feedbacks.
     * @param {FeedbackCreateManyArgs} args - Arguments to create many Feedbacks.
     * @example
     * // Create many Feedbacks
     * const feedback = await prisma.feedback.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FeedbackCreateManyArgs>(args?: SelectSubset<T, FeedbackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Feedbacks and returns the data saved in the database.
     * @param {FeedbackCreateManyAndReturnArgs} args - Arguments to create many Feedbacks.
     * @example
     * // Create many Feedbacks
     * const feedback = await prisma.feedback.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Feedbacks and only return the `id`
     * const feedbackWithIdOnly = await prisma.feedback.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FeedbackCreateManyAndReturnArgs>(args?: SelectSubset<T, FeedbackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Feedback.
     * @param {FeedbackDeleteArgs} args - Arguments to delete one Feedback.
     * @example
     * // Delete one Feedback
     * const Feedback = await prisma.feedback.delete({
     *   where: {
     *     // ... filter to delete one Feedback
     *   }
     * })
     * 
     */
    delete<T extends FeedbackDeleteArgs>(args: SelectSubset<T, FeedbackDeleteArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Feedback.
     * @param {FeedbackUpdateArgs} args - Arguments to update one Feedback.
     * @example
     * // Update one Feedback
     * const feedback = await prisma.feedback.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FeedbackUpdateArgs>(args: SelectSubset<T, FeedbackUpdateArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Feedbacks.
     * @param {FeedbackDeleteManyArgs} args - Arguments to filter Feedbacks to delete.
     * @example
     * // Delete a few Feedbacks
     * const { count } = await prisma.feedback.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FeedbackDeleteManyArgs>(args?: SelectSubset<T, FeedbackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Feedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Feedbacks
     * const feedback = await prisma.feedback.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FeedbackUpdateManyArgs>(args: SelectSubset<T, FeedbackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Feedbacks and returns the data updated in the database.
     * @param {FeedbackUpdateManyAndReturnArgs} args - Arguments to update many Feedbacks.
     * @example
     * // Update many Feedbacks
     * const feedback = await prisma.feedback.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Feedbacks and only return the `id`
     * const feedbackWithIdOnly = await prisma.feedback.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FeedbackUpdateManyAndReturnArgs>(args: SelectSubset<T, FeedbackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Feedback.
     * @param {FeedbackUpsertArgs} args - Arguments to update or create a Feedback.
     * @example
     * // Update or create a Feedback
     * const feedback = await prisma.feedback.upsert({
     *   create: {
     *     // ... data to create a Feedback
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Feedback we want to update
     *   }
     * })
     */
    upsert<T extends FeedbackUpsertArgs>(args: SelectSubset<T, FeedbackUpsertArgs<ExtArgs>>): Prisma__FeedbackClient<$Result.GetResult<Prisma.$FeedbackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Feedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackCountArgs} args - Arguments to filter Feedbacks to count.
     * @example
     * // Count the number of Feedbacks
     * const count = await prisma.feedback.count({
     *   where: {
     *     // ... the filter for the Feedbacks we want to count
     *   }
     * })
    **/
    count<T extends FeedbackCountArgs>(
      args?: Subset<T, FeedbackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FeedbackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Feedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FeedbackAggregateArgs>(args: Subset<T, FeedbackAggregateArgs>): Prisma.PrismaPromise<GetFeedbackAggregateType<T>>

    /**
     * Group by Feedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeedbackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FeedbackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeedbackGroupByArgs['orderBy'] }
        : { orderBy?: FeedbackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FeedbackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFeedbackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Feedback model
   */
  readonly fields: FeedbackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Feedback.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeedbackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Feedback model
   */
  interface FeedbackFieldRefs {
    readonly id: FieldRef<"Feedback", 'String'>
    readonly tenKhach: FieldRef<"Feedback", 'String'>
    readonly sdtKhach: FieldRef<"Feedback", 'String'>
    readonly sku: FieldRef<"Feedback", 'String'>
    readonly kenh: FieldRef<"Feedback", 'String'>
    readonly loai: FieldRef<"Feedback", 'String'>
    readonly noiDung: FieldRef<"Feedback", 'String'>
    readonly danhGia: FieldRef<"Feedback", 'Int'>
    readonly nguoiGhiNhan: FieldRef<"Feedback", 'String'>
    readonly createdAt: FieldRef<"Feedback", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Feedback findUnique
   */
  export type FeedbackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback findUniqueOrThrow
   */
  export type FeedbackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback findFirst
   */
  export type FeedbackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Feedbacks.
     */
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback findFirstOrThrow
   */
  export type FeedbackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter, which Feedback to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Feedbacks.
     */
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback findMany
   */
  export type FeedbackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter, which Feedbacks to fetch.
     */
    where?: FeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Feedbacks to fetch.
     */
    orderBy?: FeedbackOrderByWithRelationInput | FeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Feedbacks.
     */
    cursor?: FeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Feedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Feedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Feedbacks.
     */
    distinct?: FeedbackScalarFieldEnum | FeedbackScalarFieldEnum[]
  }

  /**
   * Feedback create
   */
  export type FeedbackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data needed to create a Feedback.
     */
    data: XOR<FeedbackCreateInput, FeedbackUncheckedCreateInput>
  }

  /**
   * Feedback createMany
   */
  export type FeedbackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Feedbacks.
     */
    data: FeedbackCreateManyInput | FeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Feedback createManyAndReturn
   */
  export type FeedbackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data used to create many Feedbacks.
     */
    data: FeedbackCreateManyInput | FeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Feedback update
   */
  export type FeedbackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data needed to update a Feedback.
     */
    data: XOR<FeedbackUpdateInput, FeedbackUncheckedUpdateInput>
    /**
     * Choose, which Feedback to update.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback updateMany
   */
  export type FeedbackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Feedbacks.
     */
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyInput>
    /**
     * Filter which Feedbacks to update
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to update.
     */
    limit?: number
  }

  /**
   * Feedback updateManyAndReturn
   */
  export type FeedbackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The data used to update Feedbacks.
     */
    data: XOR<FeedbackUpdateManyMutationInput, FeedbackUncheckedUpdateManyInput>
    /**
     * Filter which Feedbacks to update
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to update.
     */
    limit?: number
  }

  /**
   * Feedback upsert
   */
  export type FeedbackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * The filter to search for the Feedback to update in case it exists.
     */
    where: FeedbackWhereUniqueInput
    /**
     * In case the Feedback found by the `where` argument doesn't exist, create a new Feedback with this data.
     */
    create: XOR<FeedbackCreateInput, FeedbackUncheckedCreateInput>
    /**
     * In case the Feedback was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeedbackUpdateInput, FeedbackUncheckedUpdateInput>
  }

  /**
   * Feedback delete
   */
  export type FeedbackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
    /**
     * Filter which Feedback to delete.
     */
    where: FeedbackWhereUniqueInput
  }

  /**
   * Feedback deleteMany
   */
  export type FeedbackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Feedbacks to delete
     */
    where?: FeedbackWhereInput
    /**
     * Limit how many Feedbacks to delete.
     */
    limit?: number
  }

  /**
   * Feedback without action
   */
  export type FeedbackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Feedback
     */
    select?: FeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Feedback
     */
    omit?: FeedbackOmit<ExtArgs> | null
  }


  /**
   * Model BuTien
   */

  export type AggregateBuTien = {
    _count: BuTienCountAggregateOutputType | null
    _avg: BuTienAvgAggregateOutputType | null
    _sum: BuTienSumAggregateOutputType | null
    _min: BuTienMinAggregateOutputType | null
    _max: BuTienMaxAggregateOutputType | null
  }

  export type BuTienAvgAggregateOutputType = {
    soTien: number | null
  }

  export type BuTienSumAggregateOutputType = {
    soTien: number | null
  }

  export type BuTienMinAggregateOutputType = {
    id: string | null
    tenKhach: string | null
    sdtKhach: string | null
    loiBu: string | null
    soTien: number | null
    trangThai: string | null
    ghiChu: string | null
    nguoiXuLy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BuTienMaxAggregateOutputType = {
    id: string | null
    tenKhach: string | null
    sdtKhach: string | null
    loiBu: string | null
    soTien: number | null
    trangThai: string | null
    ghiChu: string | null
    nguoiXuLy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BuTienCountAggregateOutputType = {
    id: number
    tenKhach: number
    sdtKhach: number
    loiBu: number
    soTien: number
    trangThai: number
    ghiChu: number
    nguoiXuLy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BuTienAvgAggregateInputType = {
    soTien?: true
  }

  export type BuTienSumAggregateInputType = {
    soTien?: true
  }

  export type BuTienMinAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    loiBu?: true
    soTien?: true
    trangThai?: true
    ghiChu?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BuTienMaxAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    loiBu?: true
    soTien?: true
    trangThai?: true
    ghiChu?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BuTienCountAggregateInputType = {
    id?: true
    tenKhach?: true
    sdtKhach?: true
    loiBu?: true
    soTien?: true
    trangThai?: true
    ghiChu?: true
    nguoiXuLy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BuTienAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BuTien to aggregate.
     */
    where?: BuTienWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BuTiens to fetch.
     */
    orderBy?: BuTienOrderByWithRelationInput | BuTienOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BuTienWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BuTiens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BuTiens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BuTiens
    **/
    _count?: true | BuTienCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BuTienAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BuTienSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BuTienMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BuTienMaxAggregateInputType
  }

  export type GetBuTienAggregateType<T extends BuTienAggregateArgs> = {
        [P in keyof T & keyof AggregateBuTien]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBuTien[P]>
      : GetScalarType<T[P], AggregateBuTien[P]>
  }




  export type BuTienGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BuTienWhereInput
    orderBy?: BuTienOrderByWithAggregationInput | BuTienOrderByWithAggregationInput[]
    by: BuTienScalarFieldEnum[] | BuTienScalarFieldEnum
    having?: BuTienScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BuTienCountAggregateInputType | true
    _avg?: BuTienAvgAggregateInputType
    _sum?: BuTienSumAggregateInputType
    _min?: BuTienMinAggregateInputType
    _max?: BuTienMaxAggregateInputType
  }

  export type BuTienGroupByOutputType = {
    id: string
    tenKhach: string
    sdtKhach: string | null
    loiBu: string
    soTien: number
    trangThai: string
    ghiChu: string | null
    nguoiXuLy: string | null
    createdAt: Date
    updatedAt: Date
    _count: BuTienCountAggregateOutputType | null
    _avg: BuTienAvgAggregateOutputType | null
    _sum: BuTienSumAggregateOutputType | null
    _min: BuTienMinAggregateOutputType | null
    _max: BuTienMaxAggregateOutputType | null
  }

  type GetBuTienGroupByPayload<T extends BuTienGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BuTienGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BuTienGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BuTienGroupByOutputType[P]>
            : GetScalarType<T[P], BuTienGroupByOutputType[P]>
        }
      >
    >


  export type BuTienSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    loiBu?: boolean
    soTien?: boolean
    trangThai?: boolean
    ghiChu?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["buTien"]>

  export type BuTienSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    loiBu?: boolean
    soTien?: boolean
    trangThai?: boolean
    ghiChu?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["buTien"]>

  export type BuTienSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    loiBu?: boolean
    soTien?: boolean
    trangThai?: boolean
    ghiChu?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["buTien"]>

  export type BuTienSelectScalar = {
    id?: boolean
    tenKhach?: boolean
    sdtKhach?: boolean
    loiBu?: boolean
    soTien?: boolean
    trangThai?: boolean
    ghiChu?: boolean
    nguoiXuLy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BuTienOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenKhach" | "sdtKhach" | "loiBu" | "soTien" | "trangThai" | "ghiChu" | "nguoiXuLy" | "createdAt" | "updatedAt", ExtArgs["result"]["buTien"]>

  export type $BuTienPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BuTien"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenKhach: string
      sdtKhach: string | null
      loiBu: string
      soTien: number
      trangThai: string
      ghiChu: string | null
      nguoiXuLy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["buTien"]>
    composites: {}
  }

  type BuTienGetPayload<S extends boolean | null | undefined | BuTienDefaultArgs> = $Result.GetResult<Prisma.$BuTienPayload, S>

  type BuTienCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BuTienFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BuTienCountAggregateInputType | true
    }

  export interface BuTienDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BuTien'], meta: { name: 'BuTien' } }
    /**
     * Find zero or one BuTien that matches the filter.
     * @param {BuTienFindUniqueArgs} args - Arguments to find a BuTien
     * @example
     * // Get one BuTien
     * const buTien = await prisma.buTien.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BuTienFindUniqueArgs>(args: SelectSubset<T, BuTienFindUniqueArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BuTien that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BuTienFindUniqueOrThrowArgs} args - Arguments to find a BuTien
     * @example
     * // Get one BuTien
     * const buTien = await prisma.buTien.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BuTienFindUniqueOrThrowArgs>(args: SelectSubset<T, BuTienFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BuTien that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienFindFirstArgs} args - Arguments to find a BuTien
     * @example
     * // Get one BuTien
     * const buTien = await prisma.buTien.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BuTienFindFirstArgs>(args?: SelectSubset<T, BuTienFindFirstArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BuTien that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienFindFirstOrThrowArgs} args - Arguments to find a BuTien
     * @example
     * // Get one BuTien
     * const buTien = await prisma.buTien.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BuTienFindFirstOrThrowArgs>(args?: SelectSubset<T, BuTienFindFirstOrThrowArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BuTiens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BuTiens
     * const buTiens = await prisma.buTien.findMany()
     * 
     * // Get first 10 BuTiens
     * const buTiens = await prisma.buTien.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const buTienWithIdOnly = await prisma.buTien.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BuTienFindManyArgs>(args?: SelectSubset<T, BuTienFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BuTien.
     * @param {BuTienCreateArgs} args - Arguments to create a BuTien.
     * @example
     * // Create one BuTien
     * const BuTien = await prisma.buTien.create({
     *   data: {
     *     // ... data to create a BuTien
     *   }
     * })
     * 
     */
    create<T extends BuTienCreateArgs>(args: SelectSubset<T, BuTienCreateArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BuTiens.
     * @param {BuTienCreateManyArgs} args - Arguments to create many BuTiens.
     * @example
     * // Create many BuTiens
     * const buTien = await prisma.buTien.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BuTienCreateManyArgs>(args?: SelectSubset<T, BuTienCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BuTiens and returns the data saved in the database.
     * @param {BuTienCreateManyAndReturnArgs} args - Arguments to create many BuTiens.
     * @example
     * // Create many BuTiens
     * const buTien = await prisma.buTien.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BuTiens and only return the `id`
     * const buTienWithIdOnly = await prisma.buTien.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BuTienCreateManyAndReturnArgs>(args?: SelectSubset<T, BuTienCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BuTien.
     * @param {BuTienDeleteArgs} args - Arguments to delete one BuTien.
     * @example
     * // Delete one BuTien
     * const BuTien = await prisma.buTien.delete({
     *   where: {
     *     // ... filter to delete one BuTien
     *   }
     * })
     * 
     */
    delete<T extends BuTienDeleteArgs>(args: SelectSubset<T, BuTienDeleteArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BuTien.
     * @param {BuTienUpdateArgs} args - Arguments to update one BuTien.
     * @example
     * // Update one BuTien
     * const buTien = await prisma.buTien.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BuTienUpdateArgs>(args: SelectSubset<T, BuTienUpdateArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BuTiens.
     * @param {BuTienDeleteManyArgs} args - Arguments to filter BuTiens to delete.
     * @example
     * // Delete a few BuTiens
     * const { count } = await prisma.buTien.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BuTienDeleteManyArgs>(args?: SelectSubset<T, BuTienDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BuTiens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BuTiens
     * const buTien = await prisma.buTien.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BuTienUpdateManyArgs>(args: SelectSubset<T, BuTienUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BuTiens and returns the data updated in the database.
     * @param {BuTienUpdateManyAndReturnArgs} args - Arguments to update many BuTiens.
     * @example
     * // Update many BuTiens
     * const buTien = await prisma.buTien.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BuTiens and only return the `id`
     * const buTienWithIdOnly = await prisma.buTien.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BuTienUpdateManyAndReturnArgs>(args: SelectSubset<T, BuTienUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BuTien.
     * @param {BuTienUpsertArgs} args - Arguments to update or create a BuTien.
     * @example
     * // Update or create a BuTien
     * const buTien = await prisma.buTien.upsert({
     *   create: {
     *     // ... data to create a BuTien
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BuTien we want to update
     *   }
     * })
     */
    upsert<T extends BuTienUpsertArgs>(args: SelectSubset<T, BuTienUpsertArgs<ExtArgs>>): Prisma__BuTienClient<$Result.GetResult<Prisma.$BuTienPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BuTiens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienCountArgs} args - Arguments to filter BuTiens to count.
     * @example
     * // Count the number of BuTiens
     * const count = await prisma.buTien.count({
     *   where: {
     *     // ... the filter for the BuTiens we want to count
     *   }
     * })
    **/
    count<T extends BuTienCountArgs>(
      args?: Subset<T, BuTienCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BuTienCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BuTien.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BuTienAggregateArgs>(args: Subset<T, BuTienAggregateArgs>): Prisma.PrismaPromise<GetBuTienAggregateType<T>>

    /**
     * Group by BuTien.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuTienGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BuTienGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BuTienGroupByArgs['orderBy'] }
        : { orderBy?: BuTienGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BuTienGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBuTienGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BuTien model
   */
  readonly fields: BuTienFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BuTien.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BuTienClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BuTien model
   */
  interface BuTienFieldRefs {
    readonly id: FieldRef<"BuTien", 'String'>
    readonly tenKhach: FieldRef<"BuTien", 'String'>
    readonly sdtKhach: FieldRef<"BuTien", 'String'>
    readonly loiBu: FieldRef<"BuTien", 'String'>
    readonly soTien: FieldRef<"BuTien", 'Float'>
    readonly trangThai: FieldRef<"BuTien", 'String'>
    readonly ghiChu: FieldRef<"BuTien", 'String'>
    readonly nguoiXuLy: FieldRef<"BuTien", 'String'>
    readonly createdAt: FieldRef<"BuTien", 'DateTime'>
    readonly updatedAt: FieldRef<"BuTien", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BuTien findUnique
   */
  export type BuTienFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter, which BuTien to fetch.
     */
    where: BuTienWhereUniqueInput
  }

  /**
   * BuTien findUniqueOrThrow
   */
  export type BuTienFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter, which BuTien to fetch.
     */
    where: BuTienWhereUniqueInput
  }

  /**
   * BuTien findFirst
   */
  export type BuTienFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter, which BuTien to fetch.
     */
    where?: BuTienWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BuTiens to fetch.
     */
    orderBy?: BuTienOrderByWithRelationInput | BuTienOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BuTiens.
     */
    cursor?: BuTienWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BuTiens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BuTiens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BuTiens.
     */
    distinct?: BuTienScalarFieldEnum | BuTienScalarFieldEnum[]
  }

  /**
   * BuTien findFirstOrThrow
   */
  export type BuTienFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter, which BuTien to fetch.
     */
    where?: BuTienWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BuTiens to fetch.
     */
    orderBy?: BuTienOrderByWithRelationInput | BuTienOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BuTiens.
     */
    cursor?: BuTienWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BuTiens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BuTiens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BuTiens.
     */
    distinct?: BuTienScalarFieldEnum | BuTienScalarFieldEnum[]
  }

  /**
   * BuTien findMany
   */
  export type BuTienFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter, which BuTiens to fetch.
     */
    where?: BuTienWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BuTiens to fetch.
     */
    orderBy?: BuTienOrderByWithRelationInput | BuTienOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BuTiens.
     */
    cursor?: BuTienWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BuTiens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BuTiens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BuTiens.
     */
    distinct?: BuTienScalarFieldEnum | BuTienScalarFieldEnum[]
  }

  /**
   * BuTien create
   */
  export type BuTienCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * The data needed to create a BuTien.
     */
    data: XOR<BuTienCreateInput, BuTienUncheckedCreateInput>
  }

  /**
   * BuTien createMany
   */
  export type BuTienCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BuTiens.
     */
    data: BuTienCreateManyInput | BuTienCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BuTien createManyAndReturn
   */
  export type BuTienCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * The data used to create many BuTiens.
     */
    data: BuTienCreateManyInput | BuTienCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BuTien update
   */
  export type BuTienUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * The data needed to update a BuTien.
     */
    data: XOR<BuTienUpdateInput, BuTienUncheckedUpdateInput>
    /**
     * Choose, which BuTien to update.
     */
    where: BuTienWhereUniqueInput
  }

  /**
   * BuTien updateMany
   */
  export type BuTienUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BuTiens.
     */
    data: XOR<BuTienUpdateManyMutationInput, BuTienUncheckedUpdateManyInput>
    /**
     * Filter which BuTiens to update
     */
    where?: BuTienWhereInput
    /**
     * Limit how many BuTiens to update.
     */
    limit?: number
  }

  /**
   * BuTien updateManyAndReturn
   */
  export type BuTienUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * The data used to update BuTiens.
     */
    data: XOR<BuTienUpdateManyMutationInput, BuTienUncheckedUpdateManyInput>
    /**
     * Filter which BuTiens to update
     */
    where?: BuTienWhereInput
    /**
     * Limit how many BuTiens to update.
     */
    limit?: number
  }

  /**
   * BuTien upsert
   */
  export type BuTienUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * The filter to search for the BuTien to update in case it exists.
     */
    where: BuTienWhereUniqueInput
    /**
     * In case the BuTien found by the `where` argument doesn't exist, create a new BuTien with this data.
     */
    create: XOR<BuTienCreateInput, BuTienUncheckedCreateInput>
    /**
     * In case the BuTien was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BuTienUpdateInput, BuTienUncheckedUpdateInput>
  }

  /**
   * BuTien delete
   */
  export type BuTienDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
    /**
     * Filter which BuTien to delete.
     */
    where: BuTienWhereUniqueInput
  }

  /**
   * BuTien deleteMany
   */
  export type BuTienDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BuTiens to delete
     */
    where?: BuTienWhereInput
    /**
     * Limit how many BuTiens to delete.
     */
    limit?: number
  }

  /**
   * BuTien without action
   */
  export type BuTienDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuTien
     */
    select?: BuTienSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BuTien
     */
    omit?: BuTienOmit<ExtArgs> | null
  }


  /**
   * Model KOC
   */

  export type AggregateKOC = {
    _count: KOCCountAggregateOutputType | null
    _avg: KOCAvgAggregateOutputType | null
    _sum: KOCSumAggregateOutputType | null
    _min: KOCMinAggregateOutputType | null
    _max: KOCMaxAggregateOutputType | null
  }

  export type KOCAvgAggregateOutputType = {
    follower: number | null
    giaCast: number | null
  }

  export type KOCSumAggregateOutputType = {
    follower: number | null
    giaCast: number | null
  }

  export type KOCMinAggregateOutputType = {
    id: string | null
    ten: string | null
    platform: string | null
    follower: number | null
    giaCast: number | null
    linkProfile: string | null
    sdt: string | null
    email: string | null
    ghiChu: string | null
    createdAt: Date | null
  }

  export type KOCMaxAggregateOutputType = {
    id: string | null
    ten: string | null
    platform: string | null
    follower: number | null
    giaCast: number | null
    linkProfile: string | null
    sdt: string | null
    email: string | null
    ghiChu: string | null
    createdAt: Date | null
  }

  export type KOCCountAggregateOutputType = {
    id: number
    ten: number
    platform: number
    follower: number
    giaCast: number
    linkProfile: number
    sdt: number
    email: number
    ghiChu: number
    createdAt: number
    _all: number
  }


  export type KOCAvgAggregateInputType = {
    follower?: true
    giaCast?: true
  }

  export type KOCSumAggregateInputType = {
    follower?: true
    giaCast?: true
  }

  export type KOCMinAggregateInputType = {
    id?: true
    ten?: true
    platform?: true
    follower?: true
    giaCast?: true
    linkProfile?: true
    sdt?: true
    email?: true
    ghiChu?: true
    createdAt?: true
  }

  export type KOCMaxAggregateInputType = {
    id?: true
    ten?: true
    platform?: true
    follower?: true
    giaCast?: true
    linkProfile?: true
    sdt?: true
    email?: true
    ghiChu?: true
    createdAt?: true
  }

  export type KOCCountAggregateInputType = {
    id?: true
    ten?: true
    platform?: true
    follower?: true
    giaCast?: true
    linkProfile?: true
    sdt?: true
    email?: true
    ghiChu?: true
    createdAt?: true
    _all?: true
  }

  export type KOCAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KOC to aggregate.
     */
    where?: KOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCS to fetch.
     */
    orderBy?: KOCOrderByWithRelationInput | KOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KOCS
    **/
    _count?: true | KOCCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KOCAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KOCSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KOCMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KOCMaxAggregateInputType
  }

  export type GetKOCAggregateType<T extends KOCAggregateArgs> = {
        [P in keyof T & keyof AggregateKOC]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKOC[P]>
      : GetScalarType<T[P], AggregateKOC[P]>
  }




  export type KOCGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KOCWhereInput
    orderBy?: KOCOrderByWithAggregationInput | KOCOrderByWithAggregationInput[]
    by: KOCScalarFieldEnum[] | KOCScalarFieldEnum
    having?: KOCScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KOCCountAggregateInputType | true
    _avg?: KOCAvgAggregateInputType
    _sum?: KOCSumAggregateInputType
    _min?: KOCMinAggregateInputType
    _max?: KOCMaxAggregateInputType
  }

  export type KOCGroupByOutputType = {
    id: string
    ten: string
    platform: string
    follower: number
    giaCast: number
    linkProfile: string | null
    sdt: string | null
    email: string | null
    ghiChu: string | null
    createdAt: Date
    _count: KOCCountAggregateOutputType | null
    _avg: KOCAvgAggregateOutputType | null
    _sum: KOCSumAggregateOutputType | null
    _min: KOCMinAggregateOutputType | null
    _max: KOCMaxAggregateOutputType | null
  }

  type GetKOCGroupByPayload<T extends KOCGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KOCGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KOCGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KOCGroupByOutputType[P]>
            : GetScalarType<T[P], KOCGroupByOutputType[P]>
        }
      >
    >


  export type KOCSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    platform?: boolean
    follower?: boolean
    giaCast?: boolean
    linkProfile?: boolean
    sdt?: boolean
    email?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    bookings?: boolean | KOC$bookingsArgs<ExtArgs>
    _count?: boolean | KOCCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["kOC"]>

  export type KOCSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    platform?: boolean
    follower?: boolean
    giaCast?: boolean
    linkProfile?: boolean
    sdt?: boolean
    email?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["kOC"]>

  export type KOCSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ten?: boolean
    platform?: boolean
    follower?: boolean
    giaCast?: boolean
    linkProfile?: boolean
    sdt?: boolean
    email?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["kOC"]>

  export type KOCSelectScalar = {
    id?: boolean
    ten?: boolean
    platform?: boolean
    follower?: boolean
    giaCast?: boolean
    linkProfile?: boolean
    sdt?: boolean
    email?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }

  export type KOCOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ten" | "platform" | "follower" | "giaCast" | "linkProfile" | "sdt" | "email" | "ghiChu" | "createdAt", ExtArgs["result"]["kOC"]>
  export type KOCInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | KOC$bookingsArgs<ExtArgs>
    _count?: boolean | KOCCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type KOCIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type KOCIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $KOCPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KOC"
    objects: {
      bookings: Prisma.$KOCBookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ten: string
      platform: string
      follower: number
      giaCast: number
      linkProfile: string | null
      sdt: string | null
      email: string | null
      ghiChu: string | null
      createdAt: Date
    }, ExtArgs["result"]["kOC"]>
    composites: {}
  }

  type KOCGetPayload<S extends boolean | null | undefined | KOCDefaultArgs> = $Result.GetResult<Prisma.$KOCPayload, S>

  type KOCCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KOCFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KOCCountAggregateInputType | true
    }

  export interface KOCDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KOC'], meta: { name: 'KOC' } }
    /**
     * Find zero or one KOC that matches the filter.
     * @param {KOCFindUniqueArgs} args - Arguments to find a KOC
     * @example
     * // Get one KOC
     * const kOC = await prisma.kOC.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KOCFindUniqueArgs>(args: SelectSubset<T, KOCFindUniqueArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one KOC that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KOCFindUniqueOrThrowArgs} args - Arguments to find a KOC
     * @example
     * // Get one KOC
     * const kOC = await prisma.kOC.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KOCFindUniqueOrThrowArgs>(args: SelectSubset<T, KOCFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KOC that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCFindFirstArgs} args - Arguments to find a KOC
     * @example
     * // Get one KOC
     * const kOC = await prisma.kOC.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KOCFindFirstArgs>(args?: SelectSubset<T, KOCFindFirstArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KOC that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCFindFirstOrThrowArgs} args - Arguments to find a KOC
     * @example
     * // Get one KOC
     * const kOC = await prisma.kOC.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KOCFindFirstOrThrowArgs>(args?: SelectSubset<T, KOCFindFirstOrThrowArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more KOCS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KOCS
     * const kOCS = await prisma.kOC.findMany()
     * 
     * // Get first 10 KOCS
     * const kOCS = await prisma.kOC.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const kOCWithIdOnly = await prisma.kOC.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KOCFindManyArgs>(args?: SelectSubset<T, KOCFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a KOC.
     * @param {KOCCreateArgs} args - Arguments to create a KOC.
     * @example
     * // Create one KOC
     * const KOC = await prisma.kOC.create({
     *   data: {
     *     // ... data to create a KOC
     *   }
     * })
     * 
     */
    create<T extends KOCCreateArgs>(args: SelectSubset<T, KOCCreateArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many KOCS.
     * @param {KOCCreateManyArgs} args - Arguments to create many KOCS.
     * @example
     * // Create many KOCS
     * const kOC = await prisma.kOC.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KOCCreateManyArgs>(args?: SelectSubset<T, KOCCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KOCS and returns the data saved in the database.
     * @param {KOCCreateManyAndReturnArgs} args - Arguments to create many KOCS.
     * @example
     * // Create many KOCS
     * const kOC = await prisma.kOC.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KOCS and only return the `id`
     * const kOCWithIdOnly = await prisma.kOC.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KOCCreateManyAndReturnArgs>(args?: SelectSubset<T, KOCCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a KOC.
     * @param {KOCDeleteArgs} args - Arguments to delete one KOC.
     * @example
     * // Delete one KOC
     * const KOC = await prisma.kOC.delete({
     *   where: {
     *     // ... filter to delete one KOC
     *   }
     * })
     * 
     */
    delete<T extends KOCDeleteArgs>(args: SelectSubset<T, KOCDeleteArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one KOC.
     * @param {KOCUpdateArgs} args - Arguments to update one KOC.
     * @example
     * // Update one KOC
     * const kOC = await prisma.kOC.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KOCUpdateArgs>(args: SelectSubset<T, KOCUpdateArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more KOCS.
     * @param {KOCDeleteManyArgs} args - Arguments to filter KOCS to delete.
     * @example
     * // Delete a few KOCS
     * const { count } = await prisma.kOC.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KOCDeleteManyArgs>(args?: SelectSubset<T, KOCDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KOCS
     * const kOC = await prisma.kOC.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KOCUpdateManyArgs>(args: SelectSubset<T, KOCUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KOCS and returns the data updated in the database.
     * @param {KOCUpdateManyAndReturnArgs} args - Arguments to update many KOCS.
     * @example
     * // Update many KOCS
     * const kOC = await prisma.kOC.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more KOCS and only return the `id`
     * const kOCWithIdOnly = await prisma.kOC.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KOCUpdateManyAndReturnArgs>(args: SelectSubset<T, KOCUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one KOC.
     * @param {KOCUpsertArgs} args - Arguments to update or create a KOC.
     * @example
     * // Update or create a KOC
     * const kOC = await prisma.kOC.upsert({
     *   create: {
     *     // ... data to create a KOC
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KOC we want to update
     *   }
     * })
     */
    upsert<T extends KOCUpsertArgs>(args: SelectSubset<T, KOCUpsertArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of KOCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCCountArgs} args - Arguments to filter KOCS to count.
     * @example
     * // Count the number of KOCS
     * const count = await prisma.kOC.count({
     *   where: {
     *     // ... the filter for the KOCS we want to count
     *   }
     * })
    **/
    count<T extends KOCCountArgs>(
      args?: Subset<T, KOCCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KOCCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KOCAggregateArgs>(args: Subset<T, KOCAggregateArgs>): Prisma.PrismaPromise<GetKOCAggregateType<T>>

    /**
     * Group by KOC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KOCGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KOCGroupByArgs['orderBy'] }
        : { orderBy?: KOCGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KOCGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKOCGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KOC model
   */
  readonly fields: KOCFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KOC.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KOCClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends KOC$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, KOC$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KOC model
   */
  interface KOCFieldRefs {
    readonly id: FieldRef<"KOC", 'String'>
    readonly ten: FieldRef<"KOC", 'String'>
    readonly platform: FieldRef<"KOC", 'String'>
    readonly follower: FieldRef<"KOC", 'Int'>
    readonly giaCast: FieldRef<"KOC", 'Float'>
    readonly linkProfile: FieldRef<"KOC", 'String'>
    readonly sdt: FieldRef<"KOC", 'String'>
    readonly email: FieldRef<"KOC", 'String'>
    readonly ghiChu: FieldRef<"KOC", 'String'>
    readonly createdAt: FieldRef<"KOC", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KOC findUnique
   */
  export type KOCFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter, which KOC to fetch.
     */
    where: KOCWhereUniqueInput
  }

  /**
   * KOC findUniqueOrThrow
   */
  export type KOCFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter, which KOC to fetch.
     */
    where: KOCWhereUniqueInput
  }

  /**
   * KOC findFirst
   */
  export type KOCFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter, which KOC to fetch.
     */
    where?: KOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCS to fetch.
     */
    orderBy?: KOCOrderByWithRelationInput | KOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KOCS.
     */
    cursor?: KOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCS.
     */
    distinct?: KOCScalarFieldEnum | KOCScalarFieldEnum[]
  }

  /**
   * KOC findFirstOrThrow
   */
  export type KOCFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter, which KOC to fetch.
     */
    where?: KOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCS to fetch.
     */
    orderBy?: KOCOrderByWithRelationInput | KOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KOCS.
     */
    cursor?: KOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCS.
     */
    distinct?: KOCScalarFieldEnum | KOCScalarFieldEnum[]
  }

  /**
   * KOC findMany
   */
  export type KOCFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter, which KOCS to fetch.
     */
    where?: KOCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCS to fetch.
     */
    orderBy?: KOCOrderByWithRelationInput | KOCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KOCS.
     */
    cursor?: KOCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCS.
     */
    distinct?: KOCScalarFieldEnum | KOCScalarFieldEnum[]
  }

  /**
   * KOC create
   */
  export type KOCCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * The data needed to create a KOC.
     */
    data: XOR<KOCCreateInput, KOCUncheckedCreateInput>
  }

  /**
   * KOC createMany
   */
  export type KOCCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KOCS.
     */
    data: KOCCreateManyInput | KOCCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KOC createManyAndReturn
   */
  export type KOCCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * The data used to create many KOCS.
     */
    data: KOCCreateManyInput | KOCCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KOC update
   */
  export type KOCUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * The data needed to update a KOC.
     */
    data: XOR<KOCUpdateInput, KOCUncheckedUpdateInput>
    /**
     * Choose, which KOC to update.
     */
    where: KOCWhereUniqueInput
  }

  /**
   * KOC updateMany
   */
  export type KOCUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KOCS.
     */
    data: XOR<KOCUpdateManyMutationInput, KOCUncheckedUpdateManyInput>
    /**
     * Filter which KOCS to update
     */
    where?: KOCWhereInput
    /**
     * Limit how many KOCS to update.
     */
    limit?: number
  }

  /**
   * KOC updateManyAndReturn
   */
  export type KOCUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * The data used to update KOCS.
     */
    data: XOR<KOCUpdateManyMutationInput, KOCUncheckedUpdateManyInput>
    /**
     * Filter which KOCS to update
     */
    where?: KOCWhereInput
    /**
     * Limit how many KOCS to update.
     */
    limit?: number
  }

  /**
   * KOC upsert
   */
  export type KOCUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * The filter to search for the KOC to update in case it exists.
     */
    where: KOCWhereUniqueInput
    /**
     * In case the KOC found by the `where` argument doesn't exist, create a new KOC with this data.
     */
    create: XOR<KOCCreateInput, KOCUncheckedCreateInput>
    /**
     * In case the KOC was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KOCUpdateInput, KOCUncheckedUpdateInput>
  }

  /**
   * KOC delete
   */
  export type KOCDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
    /**
     * Filter which KOC to delete.
     */
    where: KOCWhereUniqueInput
  }

  /**
   * KOC deleteMany
   */
  export type KOCDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KOCS to delete
     */
    where?: KOCWhereInput
    /**
     * Limit how many KOCS to delete.
     */
    limit?: number
  }

  /**
   * KOC.bookings
   */
  export type KOC$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    where?: KOCBookingWhereInput
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    cursor?: KOCBookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KOCBookingScalarFieldEnum | KOCBookingScalarFieldEnum[]
  }

  /**
   * KOC without action
   */
  export type KOCDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOC
     */
    select?: KOCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOC
     */
    omit?: KOCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCInclude<ExtArgs> | null
  }


  /**
   * Model LoCat
   */

  export type AggregateLoCat = {
    _count: LoCatCountAggregateOutputType | null
    _avg: LoCatAvgAggregateOutputType | null
    _sum: LoCatSumAggregateOutputType | null
    _min: LoCatMinAggregateOutputType | null
    _max: LoCatMaxAggregateOutputType | null
  }

  export type LoCatAvgAggregateOutputType = {
    soMSoDo: number | null
    soCay: number | null
    soY: number | null
    soM: number | null
    tongSize: number | null
    soLa: number | null
    soLaThucTe: number | null
    soSanPham: number | null
    hangThucTe: number | null
    soLuongThieu: number | null
    hdMay: number | null
    tonTruocMay: number | null
    hdGiatViSinh: number | null
    tonTruocGiatViSinh: number | null
    hdGiatMau: number | null
    tonTruocGiatMau: number | null
  }

  export type LoCatSumAggregateOutputType = {
    soMSoDo: number | null
    soCay: number | null
    soY: number | null
    soM: number | null
    tongSize: number | null
    soLa: number | null
    soLaThucTe: number | null
    soSanPham: number | null
    hangThucTe: number | null
    soLuongThieu: number | null
    hdMay: number | null
    tonTruocMay: number | null
    hdGiatViSinh: number | null
    tonTruocGiatViSinh: number | null
    hdGiatMau: number | null
    tonTruocGiatMau: number | null
  }

  export type LoCatMinAggregateOutputType = {
    id: string | null
    ngay: Date | null
    hangCat: string | null
    soSize: string | null
    maVai: string | null
    soMSoDo: number | null
    soCay: number | null
    cayData: string | null
    soY: number | null
    soM: number | null
    tongSize: number | null
    soLa: number | null
    soLaThucTe: number | null
    soSanPham: number | null
    hangThucTe: number | null
    soLuongThieu: number | null
    xuongNhanHang: string | null
    trangThai: string | null
    xuong: string | null
    hdMay: number | null
    tonTruocMay: number | null
    hdMayDa: boolean | null
    coGiat: string | null
    hdGiatViSinh: number | null
    tonTruocGiatViSinh: number | null
    hdGiatViSinhDa: boolean | null
    hdGiatMau: number | null
    tonTruocGiatMau: number | null
    hdGiatMauDa: boolean | null
    ghiChuMay: string | null
    mauGiat: string | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LoCatMaxAggregateOutputType = {
    id: string | null
    ngay: Date | null
    hangCat: string | null
    soSize: string | null
    maVai: string | null
    soMSoDo: number | null
    soCay: number | null
    cayData: string | null
    soY: number | null
    soM: number | null
    tongSize: number | null
    soLa: number | null
    soLaThucTe: number | null
    soSanPham: number | null
    hangThucTe: number | null
    soLuongThieu: number | null
    xuongNhanHang: string | null
    trangThai: string | null
    xuong: string | null
    hdMay: number | null
    tonTruocMay: number | null
    hdMayDa: boolean | null
    coGiat: string | null
    hdGiatViSinh: number | null
    tonTruocGiatViSinh: number | null
    hdGiatViSinhDa: boolean | null
    hdGiatMau: number | null
    tonTruocGiatMau: number | null
    hdGiatMauDa: boolean | null
    ghiChuMay: string | null
    mauGiat: string | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LoCatCountAggregateOutputType = {
    id: number
    ngay: number
    hangCat: number
    soSize: number
    maVai: number
    soMSoDo: number
    soCay: number
    cayData: number
    soY: number
    soM: number
    tongSize: number
    soLa: number
    soLaThucTe: number
    soSanPham: number
    hangThucTe: number
    soLuongThieu: number
    xuongNhanHang: number
    trangThai: number
    xuong: number
    hdMay: number
    tonTruocMay: number
    hdMayDa: number
    coGiat: number
    hdGiatViSinh: number
    tonTruocGiatViSinh: number
    hdGiatViSinhDa: number
    hdGiatMau: number
    tonTruocGiatMau: number
    hdGiatMauDa: number
    ghiChuMay: number
    mauGiat: number
    ghiChu: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LoCatAvgAggregateInputType = {
    soMSoDo?: true
    soCay?: true
    soY?: true
    soM?: true
    tongSize?: true
    soLa?: true
    soLaThucTe?: true
    soSanPham?: true
    hangThucTe?: true
    soLuongThieu?: true
    hdMay?: true
    tonTruocMay?: true
    hdGiatViSinh?: true
    tonTruocGiatViSinh?: true
    hdGiatMau?: true
    tonTruocGiatMau?: true
  }

  export type LoCatSumAggregateInputType = {
    soMSoDo?: true
    soCay?: true
    soY?: true
    soM?: true
    tongSize?: true
    soLa?: true
    soLaThucTe?: true
    soSanPham?: true
    hangThucTe?: true
    soLuongThieu?: true
    hdMay?: true
    tonTruocMay?: true
    hdGiatViSinh?: true
    tonTruocGiatViSinh?: true
    hdGiatMau?: true
    tonTruocGiatMau?: true
  }

  export type LoCatMinAggregateInputType = {
    id?: true
    ngay?: true
    hangCat?: true
    soSize?: true
    maVai?: true
    soMSoDo?: true
    soCay?: true
    cayData?: true
    soY?: true
    soM?: true
    tongSize?: true
    soLa?: true
    soLaThucTe?: true
    soSanPham?: true
    hangThucTe?: true
    soLuongThieu?: true
    xuongNhanHang?: true
    trangThai?: true
    xuong?: true
    hdMay?: true
    tonTruocMay?: true
    hdMayDa?: true
    coGiat?: true
    hdGiatViSinh?: true
    tonTruocGiatViSinh?: true
    hdGiatViSinhDa?: true
    hdGiatMau?: true
    tonTruocGiatMau?: true
    hdGiatMauDa?: true
    ghiChuMay?: true
    mauGiat?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LoCatMaxAggregateInputType = {
    id?: true
    ngay?: true
    hangCat?: true
    soSize?: true
    maVai?: true
    soMSoDo?: true
    soCay?: true
    cayData?: true
    soY?: true
    soM?: true
    tongSize?: true
    soLa?: true
    soLaThucTe?: true
    soSanPham?: true
    hangThucTe?: true
    soLuongThieu?: true
    xuongNhanHang?: true
    trangThai?: true
    xuong?: true
    hdMay?: true
    tonTruocMay?: true
    hdMayDa?: true
    coGiat?: true
    hdGiatViSinh?: true
    tonTruocGiatViSinh?: true
    hdGiatViSinhDa?: true
    hdGiatMau?: true
    tonTruocGiatMau?: true
    hdGiatMauDa?: true
    ghiChuMay?: true
    mauGiat?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LoCatCountAggregateInputType = {
    id?: true
    ngay?: true
    hangCat?: true
    soSize?: true
    maVai?: true
    soMSoDo?: true
    soCay?: true
    cayData?: true
    soY?: true
    soM?: true
    tongSize?: true
    soLa?: true
    soLaThucTe?: true
    soSanPham?: true
    hangThucTe?: true
    soLuongThieu?: true
    xuongNhanHang?: true
    trangThai?: true
    xuong?: true
    hdMay?: true
    tonTruocMay?: true
    hdMayDa?: true
    coGiat?: true
    hdGiatViSinh?: true
    tonTruocGiatViSinh?: true
    hdGiatViSinhDa?: true
    hdGiatMau?: true
    tonTruocGiatMau?: true
    hdGiatMauDa?: true
    ghiChuMay?: true
    mauGiat?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LoCatAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoCat to aggregate.
     */
    where?: LoCatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoCats to fetch.
     */
    orderBy?: LoCatOrderByWithRelationInput | LoCatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LoCatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoCats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoCats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LoCats
    **/
    _count?: true | LoCatCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LoCatAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LoCatSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LoCatMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LoCatMaxAggregateInputType
  }

  export type GetLoCatAggregateType<T extends LoCatAggregateArgs> = {
        [P in keyof T & keyof AggregateLoCat]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLoCat[P]>
      : GetScalarType<T[P], AggregateLoCat[P]>
  }




  export type LoCatGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoCatWhereInput
    orderBy?: LoCatOrderByWithAggregationInput | LoCatOrderByWithAggregationInput[]
    by: LoCatScalarFieldEnum[] | LoCatScalarFieldEnum
    having?: LoCatScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LoCatCountAggregateInputType | true
    _avg?: LoCatAvgAggregateInputType
    _sum?: LoCatSumAggregateInputType
    _min?: LoCatMinAggregateInputType
    _max?: LoCatMaxAggregateInputType
  }

  export type LoCatGroupByOutputType = {
    id: string
    ngay: Date
    hangCat: string
    soSize: string | null
    maVai: string | null
    soMSoDo: number | null
    soCay: number
    cayData: string | null
    soY: number | null
    soM: number | null
    tongSize: number | null
    soLa: number | null
    soLaThucTe: number | null
    soSanPham: number | null
    hangThucTe: number | null
    soLuongThieu: number | null
    xuongNhanHang: string | null
    trangThai: string
    xuong: string
    hdMay: number | null
    tonTruocMay: number | null
    hdMayDa: boolean
    coGiat: string | null
    hdGiatViSinh: number | null
    tonTruocGiatViSinh: number | null
    hdGiatViSinhDa: boolean
    hdGiatMau: number | null
    tonTruocGiatMau: number | null
    hdGiatMauDa: boolean
    ghiChuMay: string | null
    mauGiat: string | null
    ghiChu: string | null
    createdAt: Date
    updatedAt: Date
    _count: LoCatCountAggregateOutputType | null
    _avg: LoCatAvgAggregateOutputType | null
    _sum: LoCatSumAggregateOutputType | null
    _min: LoCatMinAggregateOutputType | null
    _max: LoCatMaxAggregateOutputType | null
  }

  type GetLoCatGroupByPayload<T extends LoCatGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LoCatGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LoCatGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LoCatGroupByOutputType[P]>
            : GetScalarType<T[P], LoCatGroupByOutputType[P]>
        }
      >
    >


  export type LoCatSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ngay?: boolean
    hangCat?: boolean
    soSize?: boolean
    maVai?: boolean
    soMSoDo?: boolean
    soCay?: boolean
    cayData?: boolean
    soY?: boolean
    soM?: boolean
    tongSize?: boolean
    soLa?: boolean
    soLaThucTe?: boolean
    soSanPham?: boolean
    hangThucTe?: boolean
    soLuongThieu?: boolean
    xuongNhanHang?: boolean
    trangThai?: boolean
    xuong?: boolean
    hdMay?: boolean
    tonTruocMay?: boolean
    hdMayDa?: boolean
    coGiat?: boolean
    hdGiatViSinh?: boolean
    tonTruocGiatViSinh?: boolean
    hdGiatViSinhDa?: boolean
    hdGiatMau?: boolean
    tonTruocGiatMau?: boolean
    hdGiatMauDa?: boolean
    ghiChuMay?: boolean
    mauGiat?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["loCat"]>

  export type LoCatSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ngay?: boolean
    hangCat?: boolean
    soSize?: boolean
    maVai?: boolean
    soMSoDo?: boolean
    soCay?: boolean
    cayData?: boolean
    soY?: boolean
    soM?: boolean
    tongSize?: boolean
    soLa?: boolean
    soLaThucTe?: boolean
    soSanPham?: boolean
    hangThucTe?: boolean
    soLuongThieu?: boolean
    xuongNhanHang?: boolean
    trangThai?: boolean
    xuong?: boolean
    hdMay?: boolean
    tonTruocMay?: boolean
    hdMayDa?: boolean
    coGiat?: boolean
    hdGiatViSinh?: boolean
    tonTruocGiatViSinh?: boolean
    hdGiatViSinhDa?: boolean
    hdGiatMau?: boolean
    tonTruocGiatMau?: boolean
    hdGiatMauDa?: boolean
    ghiChuMay?: boolean
    mauGiat?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["loCat"]>

  export type LoCatSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ngay?: boolean
    hangCat?: boolean
    soSize?: boolean
    maVai?: boolean
    soMSoDo?: boolean
    soCay?: boolean
    cayData?: boolean
    soY?: boolean
    soM?: boolean
    tongSize?: boolean
    soLa?: boolean
    soLaThucTe?: boolean
    soSanPham?: boolean
    hangThucTe?: boolean
    soLuongThieu?: boolean
    xuongNhanHang?: boolean
    trangThai?: boolean
    xuong?: boolean
    hdMay?: boolean
    tonTruocMay?: boolean
    hdMayDa?: boolean
    coGiat?: boolean
    hdGiatViSinh?: boolean
    tonTruocGiatViSinh?: boolean
    hdGiatViSinhDa?: boolean
    hdGiatMau?: boolean
    tonTruocGiatMau?: boolean
    hdGiatMauDa?: boolean
    ghiChuMay?: boolean
    mauGiat?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["loCat"]>

  export type LoCatSelectScalar = {
    id?: boolean
    ngay?: boolean
    hangCat?: boolean
    soSize?: boolean
    maVai?: boolean
    soMSoDo?: boolean
    soCay?: boolean
    cayData?: boolean
    soY?: boolean
    soM?: boolean
    tongSize?: boolean
    soLa?: boolean
    soLaThucTe?: boolean
    soSanPham?: boolean
    hangThucTe?: boolean
    soLuongThieu?: boolean
    xuongNhanHang?: boolean
    trangThai?: boolean
    xuong?: boolean
    hdMay?: boolean
    tonTruocMay?: boolean
    hdMayDa?: boolean
    coGiat?: boolean
    hdGiatViSinh?: boolean
    tonTruocGiatViSinh?: boolean
    hdGiatViSinhDa?: boolean
    hdGiatMau?: boolean
    tonTruocGiatMau?: boolean
    hdGiatMauDa?: boolean
    ghiChuMay?: boolean
    mauGiat?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LoCatOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ngay" | "hangCat" | "soSize" | "maVai" | "soMSoDo" | "soCay" | "cayData" | "soY" | "soM" | "tongSize" | "soLa" | "soLaThucTe" | "soSanPham" | "hangThucTe" | "soLuongThieu" | "xuongNhanHang" | "trangThai" | "xuong" | "hdMay" | "tonTruocMay" | "hdMayDa" | "coGiat" | "hdGiatViSinh" | "tonTruocGiatViSinh" | "hdGiatViSinhDa" | "hdGiatMau" | "tonTruocGiatMau" | "hdGiatMauDa" | "ghiChuMay" | "mauGiat" | "ghiChu" | "createdAt" | "updatedAt", ExtArgs["result"]["loCat"]>

  export type $LoCatPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LoCat"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ngay: Date
      hangCat: string
      soSize: string | null
      maVai: string | null
      soMSoDo: number | null
      soCay: number
      cayData: string | null
      soY: number | null
      soM: number | null
      tongSize: number | null
      soLa: number | null
      soLaThucTe: number | null
      soSanPham: number | null
      hangThucTe: number | null
      soLuongThieu: number | null
      xuongNhanHang: string | null
      trangThai: string
      xuong: string
      hdMay: number | null
      tonTruocMay: number | null
      hdMayDa: boolean
      coGiat: string | null
      hdGiatViSinh: number | null
      tonTruocGiatViSinh: number | null
      hdGiatViSinhDa: boolean
      hdGiatMau: number | null
      tonTruocGiatMau: number | null
      hdGiatMauDa: boolean
      ghiChuMay: string | null
      mauGiat: string | null
      ghiChu: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["loCat"]>
    composites: {}
  }

  type LoCatGetPayload<S extends boolean | null | undefined | LoCatDefaultArgs> = $Result.GetResult<Prisma.$LoCatPayload, S>

  type LoCatCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LoCatFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LoCatCountAggregateInputType | true
    }

  export interface LoCatDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LoCat'], meta: { name: 'LoCat' } }
    /**
     * Find zero or one LoCat that matches the filter.
     * @param {LoCatFindUniqueArgs} args - Arguments to find a LoCat
     * @example
     * // Get one LoCat
     * const loCat = await prisma.loCat.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LoCatFindUniqueArgs>(args: SelectSubset<T, LoCatFindUniqueArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LoCat that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LoCatFindUniqueOrThrowArgs} args - Arguments to find a LoCat
     * @example
     * // Get one LoCat
     * const loCat = await prisma.loCat.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LoCatFindUniqueOrThrowArgs>(args: SelectSubset<T, LoCatFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoCat that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatFindFirstArgs} args - Arguments to find a LoCat
     * @example
     * // Get one LoCat
     * const loCat = await prisma.loCat.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LoCatFindFirstArgs>(args?: SelectSubset<T, LoCatFindFirstArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoCat that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatFindFirstOrThrowArgs} args - Arguments to find a LoCat
     * @example
     * // Get one LoCat
     * const loCat = await prisma.loCat.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LoCatFindFirstOrThrowArgs>(args?: SelectSubset<T, LoCatFindFirstOrThrowArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LoCats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LoCats
     * const loCats = await prisma.loCat.findMany()
     * 
     * // Get first 10 LoCats
     * const loCats = await prisma.loCat.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const loCatWithIdOnly = await prisma.loCat.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LoCatFindManyArgs>(args?: SelectSubset<T, LoCatFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LoCat.
     * @param {LoCatCreateArgs} args - Arguments to create a LoCat.
     * @example
     * // Create one LoCat
     * const LoCat = await prisma.loCat.create({
     *   data: {
     *     // ... data to create a LoCat
     *   }
     * })
     * 
     */
    create<T extends LoCatCreateArgs>(args: SelectSubset<T, LoCatCreateArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LoCats.
     * @param {LoCatCreateManyArgs} args - Arguments to create many LoCats.
     * @example
     * // Create many LoCats
     * const loCat = await prisma.loCat.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LoCatCreateManyArgs>(args?: SelectSubset<T, LoCatCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LoCats and returns the data saved in the database.
     * @param {LoCatCreateManyAndReturnArgs} args - Arguments to create many LoCats.
     * @example
     * // Create many LoCats
     * const loCat = await prisma.loCat.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LoCats and only return the `id`
     * const loCatWithIdOnly = await prisma.loCat.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LoCatCreateManyAndReturnArgs>(args?: SelectSubset<T, LoCatCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LoCat.
     * @param {LoCatDeleteArgs} args - Arguments to delete one LoCat.
     * @example
     * // Delete one LoCat
     * const LoCat = await prisma.loCat.delete({
     *   where: {
     *     // ... filter to delete one LoCat
     *   }
     * })
     * 
     */
    delete<T extends LoCatDeleteArgs>(args: SelectSubset<T, LoCatDeleteArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LoCat.
     * @param {LoCatUpdateArgs} args - Arguments to update one LoCat.
     * @example
     * // Update one LoCat
     * const loCat = await prisma.loCat.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LoCatUpdateArgs>(args: SelectSubset<T, LoCatUpdateArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LoCats.
     * @param {LoCatDeleteManyArgs} args - Arguments to filter LoCats to delete.
     * @example
     * // Delete a few LoCats
     * const { count } = await prisma.loCat.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LoCatDeleteManyArgs>(args?: SelectSubset<T, LoCatDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoCats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LoCats
     * const loCat = await prisma.loCat.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LoCatUpdateManyArgs>(args: SelectSubset<T, LoCatUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoCats and returns the data updated in the database.
     * @param {LoCatUpdateManyAndReturnArgs} args - Arguments to update many LoCats.
     * @example
     * // Update many LoCats
     * const loCat = await prisma.loCat.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LoCats and only return the `id`
     * const loCatWithIdOnly = await prisma.loCat.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LoCatUpdateManyAndReturnArgs>(args: SelectSubset<T, LoCatUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LoCat.
     * @param {LoCatUpsertArgs} args - Arguments to update or create a LoCat.
     * @example
     * // Update or create a LoCat
     * const loCat = await prisma.loCat.upsert({
     *   create: {
     *     // ... data to create a LoCat
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LoCat we want to update
     *   }
     * })
     */
    upsert<T extends LoCatUpsertArgs>(args: SelectSubset<T, LoCatUpsertArgs<ExtArgs>>): Prisma__LoCatClient<$Result.GetResult<Prisma.$LoCatPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LoCats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatCountArgs} args - Arguments to filter LoCats to count.
     * @example
     * // Count the number of LoCats
     * const count = await prisma.loCat.count({
     *   where: {
     *     // ... the filter for the LoCats we want to count
     *   }
     * })
    **/
    count<T extends LoCatCountArgs>(
      args?: Subset<T, LoCatCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LoCatCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LoCat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LoCatAggregateArgs>(args: Subset<T, LoCatAggregateArgs>): Prisma.PrismaPromise<GetLoCatAggregateType<T>>

    /**
     * Group by LoCat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoCatGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LoCatGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LoCatGroupByArgs['orderBy'] }
        : { orderBy?: LoCatGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LoCatGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLoCatGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LoCat model
   */
  readonly fields: LoCatFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LoCat.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LoCatClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LoCat model
   */
  interface LoCatFieldRefs {
    readonly id: FieldRef<"LoCat", 'String'>
    readonly ngay: FieldRef<"LoCat", 'DateTime'>
    readonly hangCat: FieldRef<"LoCat", 'String'>
    readonly soSize: FieldRef<"LoCat", 'String'>
    readonly maVai: FieldRef<"LoCat", 'String'>
    readonly soMSoDo: FieldRef<"LoCat", 'Float'>
    readonly soCay: FieldRef<"LoCat", 'Int'>
    readonly cayData: FieldRef<"LoCat", 'String'>
    readonly soY: FieldRef<"LoCat", 'Float'>
    readonly soM: FieldRef<"LoCat", 'Float'>
    readonly tongSize: FieldRef<"LoCat", 'Int'>
    readonly soLa: FieldRef<"LoCat", 'Float'>
    readonly soLaThucTe: FieldRef<"LoCat", 'Int'>
    readonly soSanPham: FieldRef<"LoCat", 'Int'>
    readonly hangThucTe: FieldRef<"LoCat", 'Int'>
    readonly soLuongThieu: FieldRef<"LoCat", 'Int'>
    readonly xuongNhanHang: FieldRef<"LoCat", 'String'>
    readonly trangThai: FieldRef<"LoCat", 'String'>
    readonly xuong: FieldRef<"LoCat", 'String'>
    readonly hdMay: FieldRef<"LoCat", 'Int'>
    readonly tonTruocMay: FieldRef<"LoCat", 'Float'>
    readonly hdMayDa: FieldRef<"LoCat", 'Boolean'>
    readonly coGiat: FieldRef<"LoCat", 'String'>
    readonly hdGiatViSinh: FieldRef<"LoCat", 'Int'>
    readonly tonTruocGiatViSinh: FieldRef<"LoCat", 'Float'>
    readonly hdGiatViSinhDa: FieldRef<"LoCat", 'Boolean'>
    readonly hdGiatMau: FieldRef<"LoCat", 'Int'>
    readonly tonTruocGiatMau: FieldRef<"LoCat", 'Float'>
    readonly hdGiatMauDa: FieldRef<"LoCat", 'Boolean'>
    readonly ghiChuMay: FieldRef<"LoCat", 'String'>
    readonly mauGiat: FieldRef<"LoCat", 'String'>
    readonly ghiChu: FieldRef<"LoCat", 'String'>
    readonly createdAt: FieldRef<"LoCat", 'DateTime'>
    readonly updatedAt: FieldRef<"LoCat", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LoCat findUnique
   */
  export type LoCatFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter, which LoCat to fetch.
     */
    where: LoCatWhereUniqueInput
  }

  /**
   * LoCat findUniqueOrThrow
   */
  export type LoCatFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter, which LoCat to fetch.
     */
    where: LoCatWhereUniqueInput
  }

  /**
   * LoCat findFirst
   */
  export type LoCatFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter, which LoCat to fetch.
     */
    where?: LoCatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoCats to fetch.
     */
    orderBy?: LoCatOrderByWithRelationInput | LoCatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoCats.
     */
    cursor?: LoCatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoCats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoCats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoCats.
     */
    distinct?: LoCatScalarFieldEnum | LoCatScalarFieldEnum[]
  }

  /**
   * LoCat findFirstOrThrow
   */
  export type LoCatFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter, which LoCat to fetch.
     */
    where?: LoCatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoCats to fetch.
     */
    orderBy?: LoCatOrderByWithRelationInput | LoCatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoCats.
     */
    cursor?: LoCatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoCats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoCats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoCats.
     */
    distinct?: LoCatScalarFieldEnum | LoCatScalarFieldEnum[]
  }

  /**
   * LoCat findMany
   */
  export type LoCatFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter, which LoCats to fetch.
     */
    where?: LoCatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoCats to fetch.
     */
    orderBy?: LoCatOrderByWithRelationInput | LoCatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LoCats.
     */
    cursor?: LoCatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoCats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoCats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoCats.
     */
    distinct?: LoCatScalarFieldEnum | LoCatScalarFieldEnum[]
  }

  /**
   * LoCat create
   */
  export type LoCatCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * The data needed to create a LoCat.
     */
    data: XOR<LoCatCreateInput, LoCatUncheckedCreateInput>
  }

  /**
   * LoCat createMany
   */
  export type LoCatCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LoCats.
     */
    data: LoCatCreateManyInput | LoCatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoCat createManyAndReturn
   */
  export type LoCatCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * The data used to create many LoCats.
     */
    data: LoCatCreateManyInput | LoCatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoCat update
   */
  export type LoCatUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * The data needed to update a LoCat.
     */
    data: XOR<LoCatUpdateInput, LoCatUncheckedUpdateInput>
    /**
     * Choose, which LoCat to update.
     */
    where: LoCatWhereUniqueInput
  }

  /**
   * LoCat updateMany
   */
  export type LoCatUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LoCats.
     */
    data: XOR<LoCatUpdateManyMutationInput, LoCatUncheckedUpdateManyInput>
    /**
     * Filter which LoCats to update
     */
    where?: LoCatWhereInput
    /**
     * Limit how many LoCats to update.
     */
    limit?: number
  }

  /**
   * LoCat updateManyAndReturn
   */
  export type LoCatUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * The data used to update LoCats.
     */
    data: XOR<LoCatUpdateManyMutationInput, LoCatUncheckedUpdateManyInput>
    /**
     * Filter which LoCats to update
     */
    where?: LoCatWhereInput
    /**
     * Limit how many LoCats to update.
     */
    limit?: number
  }

  /**
   * LoCat upsert
   */
  export type LoCatUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * The filter to search for the LoCat to update in case it exists.
     */
    where: LoCatWhereUniqueInput
    /**
     * In case the LoCat found by the `where` argument doesn't exist, create a new LoCat with this data.
     */
    create: XOR<LoCatCreateInput, LoCatUncheckedCreateInput>
    /**
     * In case the LoCat was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LoCatUpdateInput, LoCatUncheckedUpdateInput>
  }

  /**
   * LoCat delete
   */
  export type LoCatDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
    /**
     * Filter which LoCat to delete.
     */
    where: LoCatWhereUniqueInput
  }

  /**
   * LoCat deleteMany
   */
  export type LoCatDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoCats to delete
     */
    where?: LoCatWhereInput
    /**
     * Limit how many LoCats to delete.
     */
    limit?: number
  }

  /**
   * LoCat without action
   */
  export type LoCatDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoCat
     */
    select?: LoCatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoCat
     */
    omit?: LoCatOmit<ExtArgs> | null
  }


  /**
   * Model VaiTon
   */

  export type AggregateVaiTon = {
    _count: VaiTonCountAggregateOutputType | null
    _avg: VaiTonAvgAggregateOutputType | null
    _sum: VaiTonSumAggregateOutputType | null
    _min: VaiTonMinAggregateOutputType | null
    _max: VaiTonMaxAggregateOutputType | null
  }

  export type VaiTonAvgAggregateOutputType = {
    soMet: number | null
    soCay: number | null
  }

  export type VaiTonSumAggregateOutputType = {
    soMet: number | null
    soCay: number | null
  }

  export type VaiTonMinAggregateOutputType = {
    id: string | null
    maVai: string | null
    soMet: number | null
    soCay: number | null
    cayData: string | null
    donVi: string | null
    mauSac: string | null
    xuong: string | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VaiTonMaxAggregateOutputType = {
    id: string | null
    maVai: string | null
    soMet: number | null
    soCay: number | null
    cayData: string | null
    donVi: string | null
    mauSac: string | null
    xuong: string | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VaiTonCountAggregateOutputType = {
    id: number
    maVai: number
    soMet: number
    soCay: number
    cayData: number
    donVi: number
    mauSac: number
    xuong: number
    ghiChu: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VaiTonAvgAggregateInputType = {
    soMet?: true
    soCay?: true
  }

  export type VaiTonSumAggregateInputType = {
    soMet?: true
    soCay?: true
  }

  export type VaiTonMinAggregateInputType = {
    id?: true
    maVai?: true
    soMet?: true
    soCay?: true
    cayData?: true
    donVi?: true
    mauSac?: true
    xuong?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VaiTonMaxAggregateInputType = {
    id?: true
    maVai?: true
    soMet?: true
    soCay?: true
    cayData?: true
    donVi?: true
    mauSac?: true
    xuong?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VaiTonCountAggregateInputType = {
    id?: true
    maVai?: true
    soMet?: true
    soCay?: true
    cayData?: true
    donVi?: true
    mauSac?: true
    xuong?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VaiTonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VaiTon to aggregate.
     */
    where?: VaiTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VaiTons to fetch.
     */
    orderBy?: VaiTonOrderByWithRelationInput | VaiTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VaiTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VaiTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VaiTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VaiTons
    **/
    _count?: true | VaiTonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VaiTonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VaiTonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VaiTonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VaiTonMaxAggregateInputType
  }

  export type GetVaiTonAggregateType<T extends VaiTonAggregateArgs> = {
        [P in keyof T & keyof AggregateVaiTon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVaiTon[P]>
      : GetScalarType<T[P], AggregateVaiTon[P]>
  }




  export type VaiTonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VaiTonWhereInput
    orderBy?: VaiTonOrderByWithAggregationInput | VaiTonOrderByWithAggregationInput[]
    by: VaiTonScalarFieldEnum[] | VaiTonScalarFieldEnum
    having?: VaiTonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VaiTonCountAggregateInputType | true
    _avg?: VaiTonAvgAggregateInputType
    _sum?: VaiTonSumAggregateInputType
    _min?: VaiTonMinAggregateInputType
    _max?: VaiTonMaxAggregateInputType
  }

  export type VaiTonGroupByOutputType = {
    id: string
    maVai: string
    soMet: number
    soCay: number
    cayData: string | null
    donVi: string
    mauSac: string | null
    xuong: string | null
    ghiChu: string | null
    createdAt: Date
    updatedAt: Date
    _count: VaiTonCountAggregateOutputType | null
    _avg: VaiTonAvgAggregateOutputType | null
    _sum: VaiTonSumAggregateOutputType | null
    _min: VaiTonMinAggregateOutputType | null
    _max: VaiTonMaxAggregateOutputType | null
  }

  type GetVaiTonGroupByPayload<T extends VaiTonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VaiTonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VaiTonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VaiTonGroupByOutputType[P]>
            : GetScalarType<T[P], VaiTonGroupByOutputType[P]>
        }
      >
    >


  export type VaiTonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maVai?: boolean
    soMet?: boolean
    soCay?: boolean
    cayData?: boolean
    donVi?: boolean
    mauSac?: boolean
    xuong?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vaiTon"]>

  export type VaiTonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maVai?: boolean
    soMet?: boolean
    soCay?: boolean
    cayData?: boolean
    donVi?: boolean
    mauSac?: boolean
    xuong?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vaiTon"]>

  export type VaiTonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    maVai?: boolean
    soMet?: boolean
    soCay?: boolean
    cayData?: boolean
    donVi?: boolean
    mauSac?: boolean
    xuong?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vaiTon"]>

  export type VaiTonSelectScalar = {
    id?: boolean
    maVai?: boolean
    soMet?: boolean
    soCay?: boolean
    cayData?: boolean
    donVi?: boolean
    mauSac?: boolean
    xuong?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VaiTonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "maVai" | "soMet" | "soCay" | "cayData" | "donVi" | "mauSac" | "xuong" | "ghiChu" | "createdAt" | "updatedAt", ExtArgs["result"]["vaiTon"]>

  export type $VaiTonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VaiTon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      maVai: string
      soMet: number
      soCay: number
      cayData: string | null
      donVi: string
      mauSac: string | null
      xuong: string | null
      ghiChu: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vaiTon"]>
    composites: {}
  }

  type VaiTonGetPayload<S extends boolean | null | undefined | VaiTonDefaultArgs> = $Result.GetResult<Prisma.$VaiTonPayload, S>

  type VaiTonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VaiTonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VaiTonCountAggregateInputType | true
    }

  export interface VaiTonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VaiTon'], meta: { name: 'VaiTon' } }
    /**
     * Find zero or one VaiTon that matches the filter.
     * @param {VaiTonFindUniqueArgs} args - Arguments to find a VaiTon
     * @example
     * // Get one VaiTon
     * const vaiTon = await prisma.vaiTon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VaiTonFindUniqueArgs>(args: SelectSubset<T, VaiTonFindUniqueArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VaiTon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VaiTonFindUniqueOrThrowArgs} args - Arguments to find a VaiTon
     * @example
     * // Get one VaiTon
     * const vaiTon = await prisma.vaiTon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VaiTonFindUniqueOrThrowArgs>(args: SelectSubset<T, VaiTonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VaiTon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonFindFirstArgs} args - Arguments to find a VaiTon
     * @example
     * // Get one VaiTon
     * const vaiTon = await prisma.vaiTon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VaiTonFindFirstArgs>(args?: SelectSubset<T, VaiTonFindFirstArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VaiTon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonFindFirstOrThrowArgs} args - Arguments to find a VaiTon
     * @example
     * // Get one VaiTon
     * const vaiTon = await prisma.vaiTon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VaiTonFindFirstOrThrowArgs>(args?: SelectSubset<T, VaiTonFindFirstOrThrowArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VaiTons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VaiTons
     * const vaiTons = await prisma.vaiTon.findMany()
     * 
     * // Get first 10 VaiTons
     * const vaiTons = await prisma.vaiTon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vaiTonWithIdOnly = await prisma.vaiTon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VaiTonFindManyArgs>(args?: SelectSubset<T, VaiTonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VaiTon.
     * @param {VaiTonCreateArgs} args - Arguments to create a VaiTon.
     * @example
     * // Create one VaiTon
     * const VaiTon = await prisma.vaiTon.create({
     *   data: {
     *     // ... data to create a VaiTon
     *   }
     * })
     * 
     */
    create<T extends VaiTonCreateArgs>(args: SelectSubset<T, VaiTonCreateArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VaiTons.
     * @param {VaiTonCreateManyArgs} args - Arguments to create many VaiTons.
     * @example
     * // Create many VaiTons
     * const vaiTon = await prisma.vaiTon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VaiTonCreateManyArgs>(args?: SelectSubset<T, VaiTonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VaiTons and returns the data saved in the database.
     * @param {VaiTonCreateManyAndReturnArgs} args - Arguments to create many VaiTons.
     * @example
     * // Create many VaiTons
     * const vaiTon = await prisma.vaiTon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VaiTons and only return the `id`
     * const vaiTonWithIdOnly = await prisma.vaiTon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VaiTonCreateManyAndReturnArgs>(args?: SelectSubset<T, VaiTonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VaiTon.
     * @param {VaiTonDeleteArgs} args - Arguments to delete one VaiTon.
     * @example
     * // Delete one VaiTon
     * const VaiTon = await prisma.vaiTon.delete({
     *   where: {
     *     // ... filter to delete one VaiTon
     *   }
     * })
     * 
     */
    delete<T extends VaiTonDeleteArgs>(args: SelectSubset<T, VaiTonDeleteArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VaiTon.
     * @param {VaiTonUpdateArgs} args - Arguments to update one VaiTon.
     * @example
     * // Update one VaiTon
     * const vaiTon = await prisma.vaiTon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VaiTonUpdateArgs>(args: SelectSubset<T, VaiTonUpdateArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VaiTons.
     * @param {VaiTonDeleteManyArgs} args - Arguments to filter VaiTons to delete.
     * @example
     * // Delete a few VaiTons
     * const { count } = await prisma.vaiTon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VaiTonDeleteManyArgs>(args?: SelectSubset<T, VaiTonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VaiTons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VaiTons
     * const vaiTon = await prisma.vaiTon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VaiTonUpdateManyArgs>(args: SelectSubset<T, VaiTonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VaiTons and returns the data updated in the database.
     * @param {VaiTonUpdateManyAndReturnArgs} args - Arguments to update many VaiTons.
     * @example
     * // Update many VaiTons
     * const vaiTon = await prisma.vaiTon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VaiTons and only return the `id`
     * const vaiTonWithIdOnly = await prisma.vaiTon.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VaiTonUpdateManyAndReturnArgs>(args: SelectSubset<T, VaiTonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VaiTon.
     * @param {VaiTonUpsertArgs} args - Arguments to update or create a VaiTon.
     * @example
     * // Update or create a VaiTon
     * const vaiTon = await prisma.vaiTon.upsert({
     *   create: {
     *     // ... data to create a VaiTon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VaiTon we want to update
     *   }
     * })
     */
    upsert<T extends VaiTonUpsertArgs>(args: SelectSubset<T, VaiTonUpsertArgs<ExtArgs>>): Prisma__VaiTonClient<$Result.GetResult<Prisma.$VaiTonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VaiTons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonCountArgs} args - Arguments to filter VaiTons to count.
     * @example
     * // Count the number of VaiTons
     * const count = await prisma.vaiTon.count({
     *   where: {
     *     // ... the filter for the VaiTons we want to count
     *   }
     * })
    **/
    count<T extends VaiTonCountArgs>(
      args?: Subset<T, VaiTonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VaiTonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VaiTon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VaiTonAggregateArgs>(args: Subset<T, VaiTonAggregateArgs>): Prisma.PrismaPromise<GetVaiTonAggregateType<T>>

    /**
     * Group by VaiTon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VaiTonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VaiTonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VaiTonGroupByArgs['orderBy'] }
        : { orderBy?: VaiTonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VaiTonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVaiTonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VaiTon model
   */
  readonly fields: VaiTonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VaiTon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VaiTonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VaiTon model
   */
  interface VaiTonFieldRefs {
    readonly id: FieldRef<"VaiTon", 'String'>
    readonly maVai: FieldRef<"VaiTon", 'String'>
    readonly soMet: FieldRef<"VaiTon", 'Float'>
    readonly soCay: FieldRef<"VaiTon", 'Int'>
    readonly cayData: FieldRef<"VaiTon", 'String'>
    readonly donVi: FieldRef<"VaiTon", 'String'>
    readonly mauSac: FieldRef<"VaiTon", 'String'>
    readonly xuong: FieldRef<"VaiTon", 'String'>
    readonly ghiChu: FieldRef<"VaiTon", 'String'>
    readonly createdAt: FieldRef<"VaiTon", 'DateTime'>
    readonly updatedAt: FieldRef<"VaiTon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VaiTon findUnique
   */
  export type VaiTonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter, which VaiTon to fetch.
     */
    where: VaiTonWhereUniqueInput
  }

  /**
   * VaiTon findUniqueOrThrow
   */
  export type VaiTonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter, which VaiTon to fetch.
     */
    where: VaiTonWhereUniqueInput
  }

  /**
   * VaiTon findFirst
   */
  export type VaiTonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter, which VaiTon to fetch.
     */
    where?: VaiTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VaiTons to fetch.
     */
    orderBy?: VaiTonOrderByWithRelationInput | VaiTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VaiTons.
     */
    cursor?: VaiTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VaiTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VaiTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VaiTons.
     */
    distinct?: VaiTonScalarFieldEnum | VaiTonScalarFieldEnum[]
  }

  /**
   * VaiTon findFirstOrThrow
   */
  export type VaiTonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter, which VaiTon to fetch.
     */
    where?: VaiTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VaiTons to fetch.
     */
    orderBy?: VaiTonOrderByWithRelationInput | VaiTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VaiTons.
     */
    cursor?: VaiTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VaiTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VaiTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VaiTons.
     */
    distinct?: VaiTonScalarFieldEnum | VaiTonScalarFieldEnum[]
  }

  /**
   * VaiTon findMany
   */
  export type VaiTonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter, which VaiTons to fetch.
     */
    where?: VaiTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VaiTons to fetch.
     */
    orderBy?: VaiTonOrderByWithRelationInput | VaiTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VaiTons.
     */
    cursor?: VaiTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VaiTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VaiTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VaiTons.
     */
    distinct?: VaiTonScalarFieldEnum | VaiTonScalarFieldEnum[]
  }

  /**
   * VaiTon create
   */
  export type VaiTonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * The data needed to create a VaiTon.
     */
    data: XOR<VaiTonCreateInput, VaiTonUncheckedCreateInput>
  }

  /**
   * VaiTon createMany
   */
  export type VaiTonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VaiTons.
     */
    data: VaiTonCreateManyInput | VaiTonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VaiTon createManyAndReturn
   */
  export type VaiTonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * The data used to create many VaiTons.
     */
    data: VaiTonCreateManyInput | VaiTonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VaiTon update
   */
  export type VaiTonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * The data needed to update a VaiTon.
     */
    data: XOR<VaiTonUpdateInput, VaiTonUncheckedUpdateInput>
    /**
     * Choose, which VaiTon to update.
     */
    where: VaiTonWhereUniqueInput
  }

  /**
   * VaiTon updateMany
   */
  export type VaiTonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VaiTons.
     */
    data: XOR<VaiTonUpdateManyMutationInput, VaiTonUncheckedUpdateManyInput>
    /**
     * Filter which VaiTons to update
     */
    where?: VaiTonWhereInput
    /**
     * Limit how many VaiTons to update.
     */
    limit?: number
  }

  /**
   * VaiTon updateManyAndReturn
   */
  export type VaiTonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * The data used to update VaiTons.
     */
    data: XOR<VaiTonUpdateManyMutationInput, VaiTonUncheckedUpdateManyInput>
    /**
     * Filter which VaiTons to update
     */
    where?: VaiTonWhereInput
    /**
     * Limit how many VaiTons to update.
     */
    limit?: number
  }

  /**
   * VaiTon upsert
   */
  export type VaiTonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * The filter to search for the VaiTon to update in case it exists.
     */
    where: VaiTonWhereUniqueInput
    /**
     * In case the VaiTon found by the `where` argument doesn't exist, create a new VaiTon with this data.
     */
    create: XOR<VaiTonCreateInput, VaiTonUncheckedCreateInput>
    /**
     * In case the VaiTon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VaiTonUpdateInput, VaiTonUncheckedUpdateInput>
  }

  /**
   * VaiTon delete
   */
  export type VaiTonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
    /**
     * Filter which VaiTon to delete.
     */
    where: VaiTonWhereUniqueInput
  }

  /**
   * VaiTon deleteMany
   */
  export type VaiTonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VaiTons to delete
     */
    where?: VaiTonWhereInput
    /**
     * Limit how many VaiTons to delete.
     */
    limit?: number
  }

  /**
   * VaiTon without action
   */
  export type VaiTonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VaiTon
     */
    select?: VaiTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VaiTon
     */
    omit?: VaiTonOmit<ExtArgs> | null
  }


  /**
   * Model HoaDonTonHistory
   */

  export type AggregateHoaDonTonHistory = {
    _count: HoaDonTonHistoryCountAggregateOutputType | null
    _avg: HoaDonTonHistoryAvgAggregateOutputType | null
    _sum: HoaDonTonHistorySumAggregateOutputType | null
    _min: HoaDonTonHistoryMinAggregateOutputType | null
    _max: HoaDonTonHistoryMaxAggregateOutputType | null
  }

  export type HoaDonTonHistoryAvgAggregateOutputType = {
    soTonCu: number | null
    soTonMoi: number | null
  }

  export type HoaDonTonHistorySumAggregateOutputType = {
    soTonCu: number | null
    soTonMoi: number | null
  }

  export type HoaDonTonHistoryMinAggregateOutputType = {
    id: string | null
    loaiHD: string | null
    soTonCu: number | null
    soTonMoi: number | null
    ghiChu: string | null
    createdAt: Date | null
  }

  export type HoaDonTonHistoryMaxAggregateOutputType = {
    id: string | null
    loaiHD: string | null
    soTonCu: number | null
    soTonMoi: number | null
    ghiChu: string | null
    createdAt: Date | null
  }

  export type HoaDonTonHistoryCountAggregateOutputType = {
    id: number
    loaiHD: number
    soTonCu: number
    soTonMoi: number
    ghiChu: number
    createdAt: number
    _all: number
  }


  export type HoaDonTonHistoryAvgAggregateInputType = {
    soTonCu?: true
    soTonMoi?: true
  }

  export type HoaDonTonHistorySumAggregateInputType = {
    soTonCu?: true
    soTonMoi?: true
  }

  export type HoaDonTonHistoryMinAggregateInputType = {
    id?: true
    loaiHD?: true
    soTonCu?: true
    soTonMoi?: true
    ghiChu?: true
    createdAt?: true
  }

  export type HoaDonTonHistoryMaxAggregateInputType = {
    id?: true
    loaiHD?: true
    soTonCu?: true
    soTonMoi?: true
    ghiChu?: true
    createdAt?: true
  }

  export type HoaDonTonHistoryCountAggregateInputType = {
    id?: true
    loaiHD?: true
    soTonCu?: true
    soTonMoi?: true
    ghiChu?: true
    createdAt?: true
    _all?: true
  }

  export type HoaDonTonHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HoaDonTonHistory to aggregate.
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTonHistories to fetch.
     */
    orderBy?: HoaDonTonHistoryOrderByWithRelationInput | HoaDonTonHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HoaDonTonHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTonHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTonHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HoaDonTonHistories
    **/
    _count?: true | HoaDonTonHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HoaDonTonHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HoaDonTonHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HoaDonTonHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HoaDonTonHistoryMaxAggregateInputType
  }

  export type GetHoaDonTonHistoryAggregateType<T extends HoaDonTonHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateHoaDonTonHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHoaDonTonHistory[P]>
      : GetScalarType<T[P], AggregateHoaDonTonHistory[P]>
  }




  export type HoaDonTonHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HoaDonTonHistoryWhereInput
    orderBy?: HoaDonTonHistoryOrderByWithAggregationInput | HoaDonTonHistoryOrderByWithAggregationInput[]
    by: HoaDonTonHistoryScalarFieldEnum[] | HoaDonTonHistoryScalarFieldEnum
    having?: HoaDonTonHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HoaDonTonHistoryCountAggregateInputType | true
    _avg?: HoaDonTonHistoryAvgAggregateInputType
    _sum?: HoaDonTonHistorySumAggregateInputType
    _min?: HoaDonTonHistoryMinAggregateInputType
    _max?: HoaDonTonHistoryMaxAggregateInputType
  }

  export type HoaDonTonHistoryGroupByOutputType = {
    id: string
    loaiHD: string
    soTonCu: number
    soTonMoi: number
    ghiChu: string | null
    createdAt: Date
    _count: HoaDonTonHistoryCountAggregateOutputType | null
    _avg: HoaDonTonHistoryAvgAggregateOutputType | null
    _sum: HoaDonTonHistorySumAggregateOutputType | null
    _min: HoaDonTonHistoryMinAggregateOutputType | null
    _max: HoaDonTonHistoryMaxAggregateOutputType | null
  }

  type GetHoaDonTonHistoryGroupByPayload<T extends HoaDonTonHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HoaDonTonHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HoaDonTonHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HoaDonTonHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], HoaDonTonHistoryGroupByOutputType[P]>
        }
      >
    >


  export type HoaDonTonHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loaiHD?: boolean
    soTonCu?: boolean
    soTonMoi?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["hoaDonTonHistory"]>

  export type HoaDonTonHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loaiHD?: boolean
    soTonCu?: boolean
    soTonMoi?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["hoaDonTonHistory"]>

  export type HoaDonTonHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loaiHD?: boolean
    soTonCu?: boolean
    soTonMoi?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["hoaDonTonHistory"]>

  export type HoaDonTonHistorySelectScalar = {
    id?: boolean
    loaiHD?: boolean
    soTonCu?: boolean
    soTonMoi?: boolean
    ghiChu?: boolean
    createdAt?: boolean
  }

  export type HoaDonTonHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "loaiHD" | "soTonCu" | "soTonMoi" | "ghiChu" | "createdAt", ExtArgs["result"]["hoaDonTonHistory"]>

  export type $HoaDonTonHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HoaDonTonHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      loaiHD: string
      soTonCu: number
      soTonMoi: number
      ghiChu: string | null
      createdAt: Date
    }, ExtArgs["result"]["hoaDonTonHistory"]>
    composites: {}
  }

  type HoaDonTonHistoryGetPayload<S extends boolean | null | undefined | HoaDonTonHistoryDefaultArgs> = $Result.GetResult<Prisma.$HoaDonTonHistoryPayload, S>

  type HoaDonTonHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HoaDonTonHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HoaDonTonHistoryCountAggregateInputType | true
    }

  export interface HoaDonTonHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HoaDonTonHistory'], meta: { name: 'HoaDonTonHistory' } }
    /**
     * Find zero or one HoaDonTonHistory that matches the filter.
     * @param {HoaDonTonHistoryFindUniqueArgs} args - Arguments to find a HoaDonTonHistory
     * @example
     * // Get one HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HoaDonTonHistoryFindUniqueArgs>(args: SelectSubset<T, HoaDonTonHistoryFindUniqueArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HoaDonTonHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HoaDonTonHistoryFindUniqueOrThrowArgs} args - Arguments to find a HoaDonTonHistory
     * @example
     * // Get one HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HoaDonTonHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, HoaDonTonHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HoaDonTonHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryFindFirstArgs} args - Arguments to find a HoaDonTonHistory
     * @example
     * // Get one HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HoaDonTonHistoryFindFirstArgs>(args?: SelectSubset<T, HoaDonTonHistoryFindFirstArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HoaDonTonHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryFindFirstOrThrowArgs} args - Arguments to find a HoaDonTonHistory
     * @example
     * // Get one HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HoaDonTonHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, HoaDonTonHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HoaDonTonHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HoaDonTonHistories
     * const hoaDonTonHistories = await prisma.hoaDonTonHistory.findMany()
     * 
     * // Get first 10 HoaDonTonHistories
     * const hoaDonTonHistories = await prisma.hoaDonTonHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hoaDonTonHistoryWithIdOnly = await prisma.hoaDonTonHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HoaDonTonHistoryFindManyArgs>(args?: SelectSubset<T, HoaDonTonHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HoaDonTonHistory.
     * @param {HoaDonTonHistoryCreateArgs} args - Arguments to create a HoaDonTonHistory.
     * @example
     * // Create one HoaDonTonHistory
     * const HoaDonTonHistory = await prisma.hoaDonTonHistory.create({
     *   data: {
     *     // ... data to create a HoaDonTonHistory
     *   }
     * })
     * 
     */
    create<T extends HoaDonTonHistoryCreateArgs>(args: SelectSubset<T, HoaDonTonHistoryCreateArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HoaDonTonHistories.
     * @param {HoaDonTonHistoryCreateManyArgs} args - Arguments to create many HoaDonTonHistories.
     * @example
     * // Create many HoaDonTonHistories
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HoaDonTonHistoryCreateManyArgs>(args?: SelectSubset<T, HoaDonTonHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HoaDonTonHistories and returns the data saved in the database.
     * @param {HoaDonTonHistoryCreateManyAndReturnArgs} args - Arguments to create many HoaDonTonHistories.
     * @example
     * // Create many HoaDonTonHistories
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HoaDonTonHistories and only return the `id`
     * const hoaDonTonHistoryWithIdOnly = await prisma.hoaDonTonHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HoaDonTonHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, HoaDonTonHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a HoaDonTonHistory.
     * @param {HoaDonTonHistoryDeleteArgs} args - Arguments to delete one HoaDonTonHistory.
     * @example
     * // Delete one HoaDonTonHistory
     * const HoaDonTonHistory = await prisma.hoaDonTonHistory.delete({
     *   where: {
     *     // ... filter to delete one HoaDonTonHistory
     *   }
     * })
     * 
     */
    delete<T extends HoaDonTonHistoryDeleteArgs>(args: SelectSubset<T, HoaDonTonHistoryDeleteArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HoaDonTonHistory.
     * @param {HoaDonTonHistoryUpdateArgs} args - Arguments to update one HoaDonTonHistory.
     * @example
     * // Update one HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HoaDonTonHistoryUpdateArgs>(args: SelectSubset<T, HoaDonTonHistoryUpdateArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HoaDonTonHistories.
     * @param {HoaDonTonHistoryDeleteManyArgs} args - Arguments to filter HoaDonTonHistories to delete.
     * @example
     * // Delete a few HoaDonTonHistories
     * const { count } = await prisma.hoaDonTonHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HoaDonTonHistoryDeleteManyArgs>(args?: SelectSubset<T, HoaDonTonHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HoaDonTonHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HoaDonTonHistories
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HoaDonTonHistoryUpdateManyArgs>(args: SelectSubset<T, HoaDonTonHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HoaDonTonHistories and returns the data updated in the database.
     * @param {HoaDonTonHistoryUpdateManyAndReturnArgs} args - Arguments to update many HoaDonTonHistories.
     * @example
     * // Update many HoaDonTonHistories
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more HoaDonTonHistories and only return the `id`
     * const hoaDonTonHistoryWithIdOnly = await prisma.hoaDonTonHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HoaDonTonHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, HoaDonTonHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one HoaDonTonHistory.
     * @param {HoaDonTonHistoryUpsertArgs} args - Arguments to update or create a HoaDonTonHistory.
     * @example
     * // Update or create a HoaDonTonHistory
     * const hoaDonTonHistory = await prisma.hoaDonTonHistory.upsert({
     *   create: {
     *     // ... data to create a HoaDonTonHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HoaDonTonHistory we want to update
     *   }
     * })
     */
    upsert<T extends HoaDonTonHistoryUpsertArgs>(args: SelectSubset<T, HoaDonTonHistoryUpsertArgs<ExtArgs>>): Prisma__HoaDonTonHistoryClient<$Result.GetResult<Prisma.$HoaDonTonHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HoaDonTonHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryCountArgs} args - Arguments to filter HoaDonTonHistories to count.
     * @example
     * // Count the number of HoaDonTonHistories
     * const count = await prisma.hoaDonTonHistory.count({
     *   where: {
     *     // ... the filter for the HoaDonTonHistories we want to count
     *   }
     * })
    **/
    count<T extends HoaDonTonHistoryCountArgs>(
      args?: Subset<T, HoaDonTonHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HoaDonTonHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HoaDonTonHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HoaDonTonHistoryAggregateArgs>(args: Subset<T, HoaDonTonHistoryAggregateArgs>): Prisma.PrismaPromise<GetHoaDonTonHistoryAggregateType<T>>

    /**
     * Group by HoaDonTonHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HoaDonTonHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HoaDonTonHistoryGroupByArgs['orderBy'] }
        : { orderBy?: HoaDonTonHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HoaDonTonHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHoaDonTonHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HoaDonTonHistory model
   */
  readonly fields: HoaDonTonHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HoaDonTonHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HoaDonTonHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HoaDonTonHistory model
   */
  interface HoaDonTonHistoryFieldRefs {
    readonly id: FieldRef<"HoaDonTonHistory", 'String'>
    readonly loaiHD: FieldRef<"HoaDonTonHistory", 'String'>
    readonly soTonCu: FieldRef<"HoaDonTonHistory", 'Float'>
    readonly soTonMoi: FieldRef<"HoaDonTonHistory", 'Float'>
    readonly ghiChu: FieldRef<"HoaDonTonHistory", 'String'>
    readonly createdAt: FieldRef<"HoaDonTonHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HoaDonTonHistory findUnique
   */
  export type HoaDonTonHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTonHistory to fetch.
     */
    where: HoaDonTonHistoryWhereUniqueInput
  }

  /**
   * HoaDonTonHistory findUniqueOrThrow
   */
  export type HoaDonTonHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTonHistory to fetch.
     */
    where: HoaDonTonHistoryWhereUniqueInput
  }

  /**
   * HoaDonTonHistory findFirst
   */
  export type HoaDonTonHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTonHistory to fetch.
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTonHistories to fetch.
     */
    orderBy?: HoaDonTonHistoryOrderByWithRelationInput | HoaDonTonHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HoaDonTonHistories.
     */
    cursor?: HoaDonTonHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTonHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTonHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTonHistories.
     */
    distinct?: HoaDonTonHistoryScalarFieldEnum | HoaDonTonHistoryScalarFieldEnum[]
  }

  /**
   * HoaDonTonHistory findFirstOrThrow
   */
  export type HoaDonTonHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTonHistory to fetch.
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTonHistories to fetch.
     */
    orderBy?: HoaDonTonHistoryOrderByWithRelationInput | HoaDonTonHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HoaDonTonHistories.
     */
    cursor?: HoaDonTonHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTonHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTonHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTonHistories.
     */
    distinct?: HoaDonTonHistoryScalarFieldEnum | HoaDonTonHistoryScalarFieldEnum[]
  }

  /**
   * HoaDonTonHistory findMany
   */
  export type HoaDonTonHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTonHistories to fetch.
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTonHistories to fetch.
     */
    orderBy?: HoaDonTonHistoryOrderByWithRelationInput | HoaDonTonHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HoaDonTonHistories.
     */
    cursor?: HoaDonTonHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTonHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTonHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTonHistories.
     */
    distinct?: HoaDonTonHistoryScalarFieldEnum | HoaDonTonHistoryScalarFieldEnum[]
  }

  /**
   * HoaDonTonHistory create
   */
  export type HoaDonTonHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * The data needed to create a HoaDonTonHistory.
     */
    data: XOR<HoaDonTonHistoryCreateInput, HoaDonTonHistoryUncheckedCreateInput>
  }

  /**
   * HoaDonTonHistory createMany
   */
  export type HoaDonTonHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HoaDonTonHistories.
     */
    data: HoaDonTonHistoryCreateManyInput | HoaDonTonHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HoaDonTonHistory createManyAndReturn
   */
  export type HoaDonTonHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many HoaDonTonHistories.
     */
    data: HoaDonTonHistoryCreateManyInput | HoaDonTonHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HoaDonTonHistory update
   */
  export type HoaDonTonHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * The data needed to update a HoaDonTonHistory.
     */
    data: XOR<HoaDonTonHistoryUpdateInput, HoaDonTonHistoryUncheckedUpdateInput>
    /**
     * Choose, which HoaDonTonHistory to update.
     */
    where: HoaDonTonHistoryWhereUniqueInput
  }

  /**
   * HoaDonTonHistory updateMany
   */
  export type HoaDonTonHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HoaDonTonHistories.
     */
    data: XOR<HoaDonTonHistoryUpdateManyMutationInput, HoaDonTonHistoryUncheckedUpdateManyInput>
    /**
     * Filter which HoaDonTonHistories to update
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * Limit how many HoaDonTonHistories to update.
     */
    limit?: number
  }

  /**
   * HoaDonTonHistory updateManyAndReturn
   */
  export type HoaDonTonHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * The data used to update HoaDonTonHistories.
     */
    data: XOR<HoaDonTonHistoryUpdateManyMutationInput, HoaDonTonHistoryUncheckedUpdateManyInput>
    /**
     * Filter which HoaDonTonHistories to update
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * Limit how many HoaDonTonHistories to update.
     */
    limit?: number
  }

  /**
   * HoaDonTonHistory upsert
   */
  export type HoaDonTonHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * The filter to search for the HoaDonTonHistory to update in case it exists.
     */
    where: HoaDonTonHistoryWhereUniqueInput
    /**
     * In case the HoaDonTonHistory found by the `where` argument doesn't exist, create a new HoaDonTonHistory with this data.
     */
    create: XOR<HoaDonTonHistoryCreateInput, HoaDonTonHistoryUncheckedCreateInput>
    /**
     * In case the HoaDonTonHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HoaDonTonHistoryUpdateInput, HoaDonTonHistoryUncheckedUpdateInput>
  }

  /**
   * HoaDonTonHistory delete
   */
  export type HoaDonTonHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
    /**
     * Filter which HoaDonTonHistory to delete.
     */
    where: HoaDonTonHistoryWhereUniqueInput
  }

  /**
   * HoaDonTonHistory deleteMany
   */
  export type HoaDonTonHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HoaDonTonHistories to delete
     */
    where?: HoaDonTonHistoryWhereInput
    /**
     * Limit how many HoaDonTonHistories to delete.
     */
    limit?: number
  }

  /**
   * HoaDonTonHistory without action
   */
  export type HoaDonTonHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTonHistory
     */
    select?: HoaDonTonHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTonHistory
     */
    omit?: HoaDonTonHistoryOmit<ExtArgs> | null
  }


  /**
   * Model KOCBooking
   */

  export type AggregateKOCBooking = {
    _count: KOCBookingCountAggregateOutputType | null
    _avg: KOCBookingAvgAggregateOutputType | null
    _sum: KOCBookingSumAggregateOutputType | null
    _min: KOCBookingMinAggregateOutputType | null
    _max: KOCBookingMaxAggregateOutputType | null
  }

  export type KOCBookingAvgAggregateOutputType = {
    soLuongGui: number | null
    chiPhiCast: number | null
    chiPhiSP: number | null
    chiPhi: number | null
    doanhThu: number | null
    donHang: number | null
    luotXem: number | null
  }

  export type KOCBookingSumAggregateOutputType = {
    soLuongGui: number | null
    chiPhiCast: number | null
    chiPhiSP: number | null
    chiPhi: number | null
    doanhThu: number | null
    donHang: number | null
    luotXem: number | null
  }

  export type KOCBookingMinAggregateOutputType = {
    id: string | null
    kocId: string | null
    sanPhamId: string | null
    soLuongGui: number | null
    chiPhiCast: number | null
    chiPhiSP: number | null
    chiPhi: number | null
    ngayBat: Date | null
    ngayKet: Date | null
    trangThai: string | null
    doanhThu: number | null
    donHang: number | null
    luotXem: number | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KOCBookingMaxAggregateOutputType = {
    id: string | null
    kocId: string | null
    sanPhamId: string | null
    soLuongGui: number | null
    chiPhiCast: number | null
    chiPhiSP: number | null
    chiPhi: number | null
    ngayBat: Date | null
    ngayKet: Date | null
    trangThai: string | null
    doanhThu: number | null
    donHang: number | null
    luotXem: number | null
    ghiChu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type KOCBookingCountAggregateOutputType = {
    id: number
    kocId: number
    sanPhamId: number
    soLuongGui: number
    chiPhiCast: number
    chiPhiSP: number
    chiPhi: number
    ngayBat: number
    ngayKet: number
    trangThai: number
    doanhThu: number
    donHang: number
    luotXem: number
    ghiChu: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type KOCBookingAvgAggregateInputType = {
    soLuongGui?: true
    chiPhiCast?: true
    chiPhiSP?: true
    chiPhi?: true
    doanhThu?: true
    donHang?: true
    luotXem?: true
  }

  export type KOCBookingSumAggregateInputType = {
    soLuongGui?: true
    chiPhiCast?: true
    chiPhiSP?: true
    chiPhi?: true
    doanhThu?: true
    donHang?: true
    luotXem?: true
  }

  export type KOCBookingMinAggregateInputType = {
    id?: true
    kocId?: true
    sanPhamId?: true
    soLuongGui?: true
    chiPhiCast?: true
    chiPhiSP?: true
    chiPhi?: true
    ngayBat?: true
    ngayKet?: true
    trangThai?: true
    doanhThu?: true
    donHang?: true
    luotXem?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KOCBookingMaxAggregateInputType = {
    id?: true
    kocId?: true
    sanPhamId?: true
    soLuongGui?: true
    chiPhiCast?: true
    chiPhiSP?: true
    chiPhi?: true
    ngayBat?: true
    ngayKet?: true
    trangThai?: true
    doanhThu?: true
    donHang?: true
    luotXem?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type KOCBookingCountAggregateInputType = {
    id?: true
    kocId?: true
    sanPhamId?: true
    soLuongGui?: true
    chiPhiCast?: true
    chiPhiSP?: true
    chiPhi?: true
    ngayBat?: true
    ngayKet?: true
    trangThai?: true
    doanhThu?: true
    donHang?: true
    luotXem?: true
    ghiChu?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type KOCBookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KOCBooking to aggregate.
     */
    where?: KOCBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCBookings to fetch.
     */
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KOCBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KOCBookings
    **/
    _count?: true | KOCBookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KOCBookingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KOCBookingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KOCBookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KOCBookingMaxAggregateInputType
  }

  export type GetKOCBookingAggregateType<T extends KOCBookingAggregateArgs> = {
        [P in keyof T & keyof AggregateKOCBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKOCBooking[P]>
      : GetScalarType<T[P], AggregateKOCBooking[P]>
  }




  export type KOCBookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KOCBookingWhereInput
    orderBy?: KOCBookingOrderByWithAggregationInput | KOCBookingOrderByWithAggregationInput[]
    by: KOCBookingScalarFieldEnum[] | KOCBookingScalarFieldEnum
    having?: KOCBookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KOCBookingCountAggregateInputType | true
    _avg?: KOCBookingAvgAggregateInputType
    _sum?: KOCBookingSumAggregateInputType
    _min?: KOCBookingMinAggregateInputType
    _max?: KOCBookingMaxAggregateInputType
  }

  export type KOCBookingGroupByOutputType = {
    id: string
    kocId: string
    sanPhamId: string | null
    soLuongGui: number
    chiPhiCast: number
    chiPhiSP: number
    chiPhi: number
    ngayBat: Date
    ngayKet: Date | null
    trangThai: string
    doanhThu: number
    donHang: number
    luotXem: number
    ghiChu: string | null
    createdAt: Date
    updatedAt: Date
    _count: KOCBookingCountAggregateOutputType | null
    _avg: KOCBookingAvgAggregateOutputType | null
    _sum: KOCBookingSumAggregateOutputType | null
    _min: KOCBookingMinAggregateOutputType | null
    _max: KOCBookingMaxAggregateOutputType | null
  }

  type GetKOCBookingGroupByPayload<T extends KOCBookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KOCBookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KOCBookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KOCBookingGroupByOutputType[P]>
            : GetScalarType<T[P], KOCBookingGroupByOutputType[P]>
        }
      >
    >


  export type KOCBookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kocId?: boolean
    sanPhamId?: boolean
    soLuongGui?: boolean
    chiPhiCast?: boolean
    chiPhiSP?: boolean
    chiPhi?: boolean
    ngayBat?: boolean
    ngayKet?: boolean
    trangThai?: boolean
    doanhThu?: boolean
    donHang?: boolean
    luotXem?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }, ExtArgs["result"]["kOCBooking"]>

  export type KOCBookingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kocId?: boolean
    sanPhamId?: boolean
    soLuongGui?: boolean
    chiPhiCast?: boolean
    chiPhiSP?: boolean
    chiPhi?: boolean
    ngayBat?: boolean
    ngayKet?: boolean
    trangThai?: boolean
    doanhThu?: boolean
    donHang?: boolean
    luotXem?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }, ExtArgs["result"]["kOCBooking"]>

  export type KOCBookingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kocId?: boolean
    sanPhamId?: boolean
    soLuongGui?: boolean
    chiPhiCast?: boolean
    chiPhiSP?: boolean
    chiPhi?: boolean
    ngayBat?: boolean
    ngayKet?: boolean
    trangThai?: boolean
    doanhThu?: boolean
    donHang?: boolean
    luotXem?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }, ExtArgs["result"]["kOCBooking"]>

  export type KOCBookingSelectScalar = {
    id?: boolean
    kocId?: boolean
    sanPhamId?: boolean
    soLuongGui?: boolean
    chiPhiCast?: boolean
    chiPhiSP?: boolean
    chiPhi?: boolean
    ngayBat?: boolean
    ngayKet?: boolean
    trangThai?: boolean
    doanhThu?: boolean
    donHang?: boolean
    luotXem?: boolean
    ghiChu?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type KOCBookingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "kocId" | "sanPhamId" | "soLuongGui" | "chiPhiCast" | "chiPhiSP" | "chiPhi" | "ngayBat" | "ngayKet" | "trangThai" | "doanhThu" | "donHang" | "luotXem" | "ghiChu" | "createdAt" | "updatedAt", ExtArgs["result"]["kOCBooking"]>
  export type KOCBookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }
  export type KOCBookingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }
  export type KOCBookingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    koc?: boolean | KOCDefaultArgs<ExtArgs>
    sanPham?: boolean | KOCBooking$sanPhamArgs<ExtArgs>
  }

  export type $KOCBookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KOCBooking"
    objects: {
      koc: Prisma.$KOCPayload<ExtArgs>
      sanPham: Prisma.$SanPhamPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      kocId: string
      sanPhamId: string | null
      soLuongGui: number
      chiPhiCast: number
      chiPhiSP: number
      chiPhi: number
      ngayBat: Date
      ngayKet: Date | null
      trangThai: string
      doanhThu: number
      donHang: number
      luotXem: number
      ghiChu: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["kOCBooking"]>
    composites: {}
  }

  type KOCBookingGetPayload<S extends boolean | null | undefined | KOCBookingDefaultArgs> = $Result.GetResult<Prisma.$KOCBookingPayload, S>

  type KOCBookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KOCBookingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KOCBookingCountAggregateInputType | true
    }

  export interface KOCBookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KOCBooking'], meta: { name: 'KOCBooking' } }
    /**
     * Find zero or one KOCBooking that matches the filter.
     * @param {KOCBookingFindUniqueArgs} args - Arguments to find a KOCBooking
     * @example
     * // Get one KOCBooking
     * const kOCBooking = await prisma.kOCBooking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KOCBookingFindUniqueArgs>(args: SelectSubset<T, KOCBookingFindUniqueArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one KOCBooking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KOCBookingFindUniqueOrThrowArgs} args - Arguments to find a KOCBooking
     * @example
     * // Get one KOCBooking
     * const kOCBooking = await prisma.kOCBooking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KOCBookingFindUniqueOrThrowArgs>(args: SelectSubset<T, KOCBookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KOCBooking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingFindFirstArgs} args - Arguments to find a KOCBooking
     * @example
     * // Get one KOCBooking
     * const kOCBooking = await prisma.kOCBooking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KOCBookingFindFirstArgs>(args?: SelectSubset<T, KOCBookingFindFirstArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KOCBooking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingFindFirstOrThrowArgs} args - Arguments to find a KOCBooking
     * @example
     * // Get one KOCBooking
     * const kOCBooking = await prisma.kOCBooking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KOCBookingFindFirstOrThrowArgs>(args?: SelectSubset<T, KOCBookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more KOCBookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KOCBookings
     * const kOCBookings = await prisma.kOCBooking.findMany()
     * 
     * // Get first 10 KOCBookings
     * const kOCBookings = await prisma.kOCBooking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const kOCBookingWithIdOnly = await prisma.kOCBooking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KOCBookingFindManyArgs>(args?: SelectSubset<T, KOCBookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a KOCBooking.
     * @param {KOCBookingCreateArgs} args - Arguments to create a KOCBooking.
     * @example
     * // Create one KOCBooking
     * const KOCBooking = await prisma.kOCBooking.create({
     *   data: {
     *     // ... data to create a KOCBooking
     *   }
     * })
     * 
     */
    create<T extends KOCBookingCreateArgs>(args: SelectSubset<T, KOCBookingCreateArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many KOCBookings.
     * @param {KOCBookingCreateManyArgs} args - Arguments to create many KOCBookings.
     * @example
     * // Create many KOCBookings
     * const kOCBooking = await prisma.kOCBooking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KOCBookingCreateManyArgs>(args?: SelectSubset<T, KOCBookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KOCBookings and returns the data saved in the database.
     * @param {KOCBookingCreateManyAndReturnArgs} args - Arguments to create many KOCBookings.
     * @example
     * // Create many KOCBookings
     * const kOCBooking = await prisma.kOCBooking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KOCBookings and only return the `id`
     * const kOCBookingWithIdOnly = await prisma.kOCBooking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KOCBookingCreateManyAndReturnArgs>(args?: SelectSubset<T, KOCBookingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a KOCBooking.
     * @param {KOCBookingDeleteArgs} args - Arguments to delete one KOCBooking.
     * @example
     * // Delete one KOCBooking
     * const KOCBooking = await prisma.kOCBooking.delete({
     *   where: {
     *     // ... filter to delete one KOCBooking
     *   }
     * })
     * 
     */
    delete<T extends KOCBookingDeleteArgs>(args: SelectSubset<T, KOCBookingDeleteArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one KOCBooking.
     * @param {KOCBookingUpdateArgs} args - Arguments to update one KOCBooking.
     * @example
     * // Update one KOCBooking
     * const kOCBooking = await prisma.kOCBooking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KOCBookingUpdateArgs>(args: SelectSubset<T, KOCBookingUpdateArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more KOCBookings.
     * @param {KOCBookingDeleteManyArgs} args - Arguments to filter KOCBookings to delete.
     * @example
     * // Delete a few KOCBookings
     * const { count } = await prisma.kOCBooking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KOCBookingDeleteManyArgs>(args?: SelectSubset<T, KOCBookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KOCBookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KOCBookings
     * const kOCBooking = await prisma.kOCBooking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KOCBookingUpdateManyArgs>(args: SelectSubset<T, KOCBookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KOCBookings and returns the data updated in the database.
     * @param {KOCBookingUpdateManyAndReturnArgs} args - Arguments to update many KOCBookings.
     * @example
     * // Update many KOCBookings
     * const kOCBooking = await prisma.kOCBooking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more KOCBookings and only return the `id`
     * const kOCBookingWithIdOnly = await prisma.kOCBooking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KOCBookingUpdateManyAndReturnArgs>(args: SelectSubset<T, KOCBookingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one KOCBooking.
     * @param {KOCBookingUpsertArgs} args - Arguments to update or create a KOCBooking.
     * @example
     * // Update or create a KOCBooking
     * const kOCBooking = await prisma.kOCBooking.upsert({
     *   create: {
     *     // ... data to create a KOCBooking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KOCBooking we want to update
     *   }
     * })
     */
    upsert<T extends KOCBookingUpsertArgs>(args: SelectSubset<T, KOCBookingUpsertArgs<ExtArgs>>): Prisma__KOCBookingClient<$Result.GetResult<Prisma.$KOCBookingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of KOCBookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingCountArgs} args - Arguments to filter KOCBookings to count.
     * @example
     * // Count the number of KOCBookings
     * const count = await prisma.kOCBooking.count({
     *   where: {
     *     // ... the filter for the KOCBookings we want to count
     *   }
     * })
    **/
    count<T extends KOCBookingCountArgs>(
      args?: Subset<T, KOCBookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KOCBookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KOCBooking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KOCBookingAggregateArgs>(args: Subset<T, KOCBookingAggregateArgs>): Prisma.PrismaPromise<GetKOCBookingAggregateType<T>>

    /**
     * Group by KOCBooking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KOCBookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KOCBookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KOCBookingGroupByArgs['orderBy'] }
        : { orderBy?: KOCBookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KOCBookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKOCBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KOCBooking model
   */
  readonly fields: KOCBookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KOCBooking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KOCBookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    koc<T extends KOCDefaultArgs<ExtArgs> = {}>(args?: Subset<T, KOCDefaultArgs<ExtArgs>>): Prisma__KOCClient<$Result.GetResult<Prisma.$KOCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    sanPham<T extends KOCBooking$sanPhamArgs<ExtArgs> = {}>(args?: Subset<T, KOCBooking$sanPhamArgs<ExtArgs>>): Prisma__SanPhamClient<$Result.GetResult<Prisma.$SanPhamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KOCBooking model
   */
  interface KOCBookingFieldRefs {
    readonly id: FieldRef<"KOCBooking", 'String'>
    readonly kocId: FieldRef<"KOCBooking", 'String'>
    readonly sanPhamId: FieldRef<"KOCBooking", 'String'>
    readonly soLuongGui: FieldRef<"KOCBooking", 'Int'>
    readonly chiPhiCast: FieldRef<"KOCBooking", 'Float'>
    readonly chiPhiSP: FieldRef<"KOCBooking", 'Float'>
    readonly chiPhi: FieldRef<"KOCBooking", 'Float'>
    readonly ngayBat: FieldRef<"KOCBooking", 'DateTime'>
    readonly ngayKet: FieldRef<"KOCBooking", 'DateTime'>
    readonly trangThai: FieldRef<"KOCBooking", 'String'>
    readonly doanhThu: FieldRef<"KOCBooking", 'Float'>
    readonly donHang: FieldRef<"KOCBooking", 'Int'>
    readonly luotXem: FieldRef<"KOCBooking", 'Int'>
    readonly ghiChu: FieldRef<"KOCBooking", 'String'>
    readonly createdAt: FieldRef<"KOCBooking", 'DateTime'>
    readonly updatedAt: FieldRef<"KOCBooking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KOCBooking findUnique
   */
  export type KOCBookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter, which KOCBooking to fetch.
     */
    where: KOCBookingWhereUniqueInput
  }

  /**
   * KOCBooking findUniqueOrThrow
   */
  export type KOCBookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter, which KOCBooking to fetch.
     */
    where: KOCBookingWhereUniqueInput
  }

  /**
   * KOCBooking findFirst
   */
  export type KOCBookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter, which KOCBooking to fetch.
     */
    where?: KOCBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCBookings to fetch.
     */
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KOCBookings.
     */
    cursor?: KOCBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCBookings.
     */
    distinct?: KOCBookingScalarFieldEnum | KOCBookingScalarFieldEnum[]
  }

  /**
   * KOCBooking findFirstOrThrow
   */
  export type KOCBookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter, which KOCBooking to fetch.
     */
    where?: KOCBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCBookings to fetch.
     */
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KOCBookings.
     */
    cursor?: KOCBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCBookings.
     */
    distinct?: KOCBookingScalarFieldEnum | KOCBookingScalarFieldEnum[]
  }

  /**
   * KOCBooking findMany
   */
  export type KOCBookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter, which KOCBookings to fetch.
     */
    where?: KOCBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KOCBookings to fetch.
     */
    orderBy?: KOCBookingOrderByWithRelationInput | KOCBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KOCBookings.
     */
    cursor?: KOCBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KOCBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KOCBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KOCBookings.
     */
    distinct?: KOCBookingScalarFieldEnum | KOCBookingScalarFieldEnum[]
  }

  /**
   * KOCBooking create
   */
  export type KOCBookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * The data needed to create a KOCBooking.
     */
    data: XOR<KOCBookingCreateInput, KOCBookingUncheckedCreateInput>
  }

  /**
   * KOCBooking createMany
   */
  export type KOCBookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KOCBookings.
     */
    data: KOCBookingCreateManyInput | KOCBookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KOCBooking createManyAndReturn
   */
  export type KOCBookingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * The data used to create many KOCBookings.
     */
    data: KOCBookingCreateManyInput | KOCBookingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * KOCBooking update
   */
  export type KOCBookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * The data needed to update a KOCBooking.
     */
    data: XOR<KOCBookingUpdateInput, KOCBookingUncheckedUpdateInput>
    /**
     * Choose, which KOCBooking to update.
     */
    where: KOCBookingWhereUniqueInput
  }

  /**
   * KOCBooking updateMany
   */
  export type KOCBookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KOCBookings.
     */
    data: XOR<KOCBookingUpdateManyMutationInput, KOCBookingUncheckedUpdateManyInput>
    /**
     * Filter which KOCBookings to update
     */
    where?: KOCBookingWhereInput
    /**
     * Limit how many KOCBookings to update.
     */
    limit?: number
  }

  /**
   * KOCBooking updateManyAndReturn
   */
  export type KOCBookingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * The data used to update KOCBookings.
     */
    data: XOR<KOCBookingUpdateManyMutationInput, KOCBookingUncheckedUpdateManyInput>
    /**
     * Filter which KOCBookings to update
     */
    where?: KOCBookingWhereInput
    /**
     * Limit how many KOCBookings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * KOCBooking upsert
   */
  export type KOCBookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * The filter to search for the KOCBooking to update in case it exists.
     */
    where: KOCBookingWhereUniqueInput
    /**
     * In case the KOCBooking found by the `where` argument doesn't exist, create a new KOCBooking with this data.
     */
    create: XOR<KOCBookingCreateInput, KOCBookingUncheckedCreateInput>
    /**
     * In case the KOCBooking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KOCBookingUpdateInput, KOCBookingUncheckedUpdateInput>
  }

  /**
   * KOCBooking delete
   */
  export type KOCBookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
    /**
     * Filter which KOCBooking to delete.
     */
    where: KOCBookingWhereUniqueInput
  }

  /**
   * KOCBooking deleteMany
   */
  export type KOCBookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KOCBookings to delete
     */
    where?: KOCBookingWhereInput
    /**
     * Limit how many KOCBookings to delete.
     */
    limit?: number
  }

  /**
   * KOCBooking.sanPham
   */
  export type KOCBooking$sanPhamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SanPham
     */
    select?: SanPhamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SanPham
     */
    omit?: SanPhamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SanPhamInclude<ExtArgs> | null
    where?: SanPhamWhereInput
  }

  /**
   * KOCBooking without action
   */
  export type KOCBookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KOCBooking
     */
    select?: KOCBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KOCBooking
     */
    omit?: KOCBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KOCBookingInclude<ExtArgs> | null
  }


  /**
   * Model HoaDonTon
   */

  export type AggregateHoaDonTon = {
    _count: HoaDonTonCountAggregateOutputType | null
    _avg: HoaDonTonAvgAggregateOutputType | null
    _sum: HoaDonTonSumAggregateOutputType | null
    _min: HoaDonTonMinAggregateOutputType | null
    _max: HoaDonTonMaxAggregateOutputType | null
  }

  export type HoaDonTonAvgAggregateOutputType = {
    soTon: number | null
  }

  export type HoaDonTonSumAggregateOutputType = {
    soTon: number | null
  }

  export type HoaDonTonMinAggregateOutputType = {
    id: string | null
    soTon: number | null
    updatedAt: Date | null
  }

  export type HoaDonTonMaxAggregateOutputType = {
    id: string | null
    soTon: number | null
    updatedAt: Date | null
  }

  export type HoaDonTonCountAggregateOutputType = {
    id: number
    soTon: number
    updatedAt: number
    _all: number
  }


  export type HoaDonTonAvgAggregateInputType = {
    soTon?: true
  }

  export type HoaDonTonSumAggregateInputType = {
    soTon?: true
  }

  export type HoaDonTonMinAggregateInputType = {
    id?: true
    soTon?: true
    updatedAt?: true
  }

  export type HoaDonTonMaxAggregateInputType = {
    id?: true
    soTon?: true
    updatedAt?: true
  }

  export type HoaDonTonCountAggregateInputType = {
    id?: true
    soTon?: true
    updatedAt?: true
    _all?: true
  }

  export type HoaDonTonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HoaDonTon to aggregate.
     */
    where?: HoaDonTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTons to fetch.
     */
    orderBy?: HoaDonTonOrderByWithRelationInput | HoaDonTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HoaDonTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HoaDonTons
    **/
    _count?: true | HoaDonTonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HoaDonTonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HoaDonTonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HoaDonTonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HoaDonTonMaxAggregateInputType
  }

  export type GetHoaDonTonAggregateType<T extends HoaDonTonAggregateArgs> = {
        [P in keyof T & keyof AggregateHoaDonTon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHoaDonTon[P]>
      : GetScalarType<T[P], AggregateHoaDonTon[P]>
  }




  export type HoaDonTonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HoaDonTonWhereInput
    orderBy?: HoaDonTonOrderByWithAggregationInput | HoaDonTonOrderByWithAggregationInput[]
    by: HoaDonTonScalarFieldEnum[] | HoaDonTonScalarFieldEnum
    having?: HoaDonTonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HoaDonTonCountAggregateInputType | true
    _avg?: HoaDonTonAvgAggregateInputType
    _sum?: HoaDonTonSumAggregateInputType
    _min?: HoaDonTonMinAggregateInputType
    _max?: HoaDonTonMaxAggregateInputType
  }

  export type HoaDonTonGroupByOutputType = {
    id: string
    soTon: number
    updatedAt: Date
    _count: HoaDonTonCountAggregateOutputType | null
    _avg: HoaDonTonAvgAggregateOutputType | null
    _sum: HoaDonTonSumAggregateOutputType | null
    _min: HoaDonTonMinAggregateOutputType | null
    _max: HoaDonTonMaxAggregateOutputType | null
  }

  type GetHoaDonTonGroupByPayload<T extends HoaDonTonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HoaDonTonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HoaDonTonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HoaDonTonGroupByOutputType[P]>
            : GetScalarType<T[P], HoaDonTonGroupByOutputType[P]>
        }
      >
    >


  export type HoaDonTonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    soTon?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["hoaDonTon"]>

  export type HoaDonTonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    soTon?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["hoaDonTon"]>

  export type HoaDonTonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    soTon?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["hoaDonTon"]>

  export type HoaDonTonSelectScalar = {
    id?: boolean
    soTon?: boolean
    updatedAt?: boolean
  }

  export type HoaDonTonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "soTon" | "updatedAt", ExtArgs["result"]["hoaDonTon"]>

  export type $HoaDonTonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HoaDonTon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      soTon: number
      updatedAt: Date
    }, ExtArgs["result"]["hoaDonTon"]>
    composites: {}
  }

  type HoaDonTonGetPayload<S extends boolean | null | undefined | HoaDonTonDefaultArgs> = $Result.GetResult<Prisma.$HoaDonTonPayload, S>

  type HoaDonTonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HoaDonTonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HoaDonTonCountAggregateInputType | true
    }

  export interface HoaDonTonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HoaDonTon'], meta: { name: 'HoaDonTon' } }
    /**
     * Find zero or one HoaDonTon that matches the filter.
     * @param {HoaDonTonFindUniqueArgs} args - Arguments to find a HoaDonTon
     * @example
     * // Get one HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HoaDonTonFindUniqueArgs>(args: SelectSubset<T, HoaDonTonFindUniqueArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HoaDonTon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HoaDonTonFindUniqueOrThrowArgs} args - Arguments to find a HoaDonTon
     * @example
     * // Get one HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HoaDonTonFindUniqueOrThrowArgs>(args: SelectSubset<T, HoaDonTonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HoaDonTon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonFindFirstArgs} args - Arguments to find a HoaDonTon
     * @example
     * // Get one HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HoaDonTonFindFirstArgs>(args?: SelectSubset<T, HoaDonTonFindFirstArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HoaDonTon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonFindFirstOrThrowArgs} args - Arguments to find a HoaDonTon
     * @example
     * // Get one HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HoaDonTonFindFirstOrThrowArgs>(args?: SelectSubset<T, HoaDonTonFindFirstOrThrowArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HoaDonTons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HoaDonTons
     * const hoaDonTons = await prisma.hoaDonTon.findMany()
     * 
     * // Get first 10 HoaDonTons
     * const hoaDonTons = await prisma.hoaDonTon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hoaDonTonWithIdOnly = await prisma.hoaDonTon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HoaDonTonFindManyArgs>(args?: SelectSubset<T, HoaDonTonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HoaDonTon.
     * @param {HoaDonTonCreateArgs} args - Arguments to create a HoaDonTon.
     * @example
     * // Create one HoaDonTon
     * const HoaDonTon = await prisma.hoaDonTon.create({
     *   data: {
     *     // ... data to create a HoaDonTon
     *   }
     * })
     * 
     */
    create<T extends HoaDonTonCreateArgs>(args: SelectSubset<T, HoaDonTonCreateArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HoaDonTons.
     * @param {HoaDonTonCreateManyArgs} args - Arguments to create many HoaDonTons.
     * @example
     * // Create many HoaDonTons
     * const hoaDonTon = await prisma.hoaDonTon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HoaDonTonCreateManyArgs>(args?: SelectSubset<T, HoaDonTonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HoaDonTons and returns the data saved in the database.
     * @param {HoaDonTonCreateManyAndReturnArgs} args - Arguments to create many HoaDonTons.
     * @example
     * // Create many HoaDonTons
     * const hoaDonTon = await prisma.hoaDonTon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HoaDonTons and only return the `id`
     * const hoaDonTonWithIdOnly = await prisma.hoaDonTon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HoaDonTonCreateManyAndReturnArgs>(args?: SelectSubset<T, HoaDonTonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a HoaDonTon.
     * @param {HoaDonTonDeleteArgs} args - Arguments to delete one HoaDonTon.
     * @example
     * // Delete one HoaDonTon
     * const HoaDonTon = await prisma.hoaDonTon.delete({
     *   where: {
     *     // ... filter to delete one HoaDonTon
     *   }
     * })
     * 
     */
    delete<T extends HoaDonTonDeleteArgs>(args: SelectSubset<T, HoaDonTonDeleteArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HoaDonTon.
     * @param {HoaDonTonUpdateArgs} args - Arguments to update one HoaDonTon.
     * @example
     * // Update one HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HoaDonTonUpdateArgs>(args: SelectSubset<T, HoaDonTonUpdateArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HoaDonTons.
     * @param {HoaDonTonDeleteManyArgs} args - Arguments to filter HoaDonTons to delete.
     * @example
     * // Delete a few HoaDonTons
     * const { count } = await prisma.hoaDonTon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HoaDonTonDeleteManyArgs>(args?: SelectSubset<T, HoaDonTonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HoaDonTons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HoaDonTons
     * const hoaDonTon = await prisma.hoaDonTon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HoaDonTonUpdateManyArgs>(args: SelectSubset<T, HoaDonTonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HoaDonTons and returns the data updated in the database.
     * @param {HoaDonTonUpdateManyAndReturnArgs} args - Arguments to update many HoaDonTons.
     * @example
     * // Update many HoaDonTons
     * const hoaDonTon = await prisma.hoaDonTon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more HoaDonTons and only return the `id`
     * const hoaDonTonWithIdOnly = await prisma.hoaDonTon.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HoaDonTonUpdateManyAndReturnArgs>(args: SelectSubset<T, HoaDonTonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one HoaDonTon.
     * @param {HoaDonTonUpsertArgs} args - Arguments to update or create a HoaDonTon.
     * @example
     * // Update or create a HoaDonTon
     * const hoaDonTon = await prisma.hoaDonTon.upsert({
     *   create: {
     *     // ... data to create a HoaDonTon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HoaDonTon we want to update
     *   }
     * })
     */
    upsert<T extends HoaDonTonUpsertArgs>(args: SelectSubset<T, HoaDonTonUpsertArgs<ExtArgs>>): Prisma__HoaDonTonClient<$Result.GetResult<Prisma.$HoaDonTonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HoaDonTons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonCountArgs} args - Arguments to filter HoaDonTons to count.
     * @example
     * // Count the number of HoaDonTons
     * const count = await prisma.hoaDonTon.count({
     *   where: {
     *     // ... the filter for the HoaDonTons we want to count
     *   }
     * })
    **/
    count<T extends HoaDonTonCountArgs>(
      args?: Subset<T, HoaDonTonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HoaDonTonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HoaDonTon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HoaDonTonAggregateArgs>(args: Subset<T, HoaDonTonAggregateArgs>): Prisma.PrismaPromise<GetHoaDonTonAggregateType<T>>

    /**
     * Group by HoaDonTon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoaDonTonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HoaDonTonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HoaDonTonGroupByArgs['orderBy'] }
        : { orderBy?: HoaDonTonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HoaDonTonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHoaDonTonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HoaDonTon model
   */
  readonly fields: HoaDonTonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HoaDonTon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HoaDonTonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HoaDonTon model
   */
  interface HoaDonTonFieldRefs {
    readonly id: FieldRef<"HoaDonTon", 'String'>
    readonly soTon: FieldRef<"HoaDonTon", 'Float'>
    readonly updatedAt: FieldRef<"HoaDonTon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HoaDonTon findUnique
   */
  export type HoaDonTonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTon to fetch.
     */
    where: HoaDonTonWhereUniqueInput
  }

  /**
   * HoaDonTon findUniqueOrThrow
   */
  export type HoaDonTonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTon to fetch.
     */
    where: HoaDonTonWhereUniqueInput
  }

  /**
   * HoaDonTon findFirst
   */
  export type HoaDonTonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTon to fetch.
     */
    where?: HoaDonTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTons to fetch.
     */
    orderBy?: HoaDonTonOrderByWithRelationInput | HoaDonTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HoaDonTons.
     */
    cursor?: HoaDonTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTons.
     */
    distinct?: HoaDonTonScalarFieldEnum | HoaDonTonScalarFieldEnum[]
  }

  /**
   * HoaDonTon findFirstOrThrow
   */
  export type HoaDonTonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTon to fetch.
     */
    where?: HoaDonTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTons to fetch.
     */
    orderBy?: HoaDonTonOrderByWithRelationInput | HoaDonTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HoaDonTons.
     */
    cursor?: HoaDonTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTons.
     */
    distinct?: HoaDonTonScalarFieldEnum | HoaDonTonScalarFieldEnum[]
  }

  /**
   * HoaDonTon findMany
   */
  export type HoaDonTonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter, which HoaDonTons to fetch.
     */
    where?: HoaDonTonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HoaDonTons to fetch.
     */
    orderBy?: HoaDonTonOrderByWithRelationInput | HoaDonTonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HoaDonTons.
     */
    cursor?: HoaDonTonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HoaDonTons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HoaDonTons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HoaDonTons.
     */
    distinct?: HoaDonTonScalarFieldEnum | HoaDonTonScalarFieldEnum[]
  }

  /**
   * HoaDonTon create
   */
  export type HoaDonTonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * The data needed to create a HoaDonTon.
     */
    data: XOR<HoaDonTonCreateInput, HoaDonTonUncheckedCreateInput>
  }

  /**
   * HoaDonTon createMany
   */
  export type HoaDonTonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HoaDonTons.
     */
    data: HoaDonTonCreateManyInput | HoaDonTonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HoaDonTon createManyAndReturn
   */
  export type HoaDonTonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * The data used to create many HoaDonTons.
     */
    data: HoaDonTonCreateManyInput | HoaDonTonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HoaDonTon update
   */
  export type HoaDonTonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * The data needed to update a HoaDonTon.
     */
    data: XOR<HoaDonTonUpdateInput, HoaDonTonUncheckedUpdateInput>
    /**
     * Choose, which HoaDonTon to update.
     */
    where: HoaDonTonWhereUniqueInput
  }

  /**
   * HoaDonTon updateMany
   */
  export type HoaDonTonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HoaDonTons.
     */
    data: XOR<HoaDonTonUpdateManyMutationInput, HoaDonTonUncheckedUpdateManyInput>
    /**
     * Filter which HoaDonTons to update
     */
    where?: HoaDonTonWhereInput
    /**
     * Limit how many HoaDonTons to update.
     */
    limit?: number
  }

  /**
   * HoaDonTon updateManyAndReturn
   */
  export type HoaDonTonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * The data used to update HoaDonTons.
     */
    data: XOR<HoaDonTonUpdateManyMutationInput, HoaDonTonUncheckedUpdateManyInput>
    /**
     * Filter which HoaDonTons to update
     */
    where?: HoaDonTonWhereInput
    /**
     * Limit how many HoaDonTons to update.
     */
    limit?: number
  }

  /**
   * HoaDonTon upsert
   */
  export type HoaDonTonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * The filter to search for the HoaDonTon to update in case it exists.
     */
    where: HoaDonTonWhereUniqueInput
    /**
     * In case the HoaDonTon found by the `where` argument doesn't exist, create a new HoaDonTon with this data.
     */
    create: XOR<HoaDonTonCreateInput, HoaDonTonUncheckedCreateInput>
    /**
     * In case the HoaDonTon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HoaDonTonUpdateInput, HoaDonTonUncheckedUpdateInput>
  }

  /**
   * HoaDonTon delete
   */
  export type HoaDonTonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
    /**
     * Filter which HoaDonTon to delete.
     */
    where: HoaDonTonWhereUniqueInput
  }

  /**
   * HoaDonTon deleteMany
   */
  export type HoaDonTonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HoaDonTons to delete
     */
    where?: HoaDonTonWhereInput
    /**
     * Limit how many HoaDonTons to delete.
     */
    limit?: number
  }

  /**
   * HoaDonTon without action
   */
  export type HoaDonTonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HoaDonTon
     */
    select?: HoaDonTonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HoaDonTon
     */
    omit?: HoaDonTonOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SanPhamScalarFieldEnum: {
    id: 'id',
    ten: 'ten',
    sku: 'sku',
    mauSac: 'mauSac',
    size: 'size',
    giaNhap: 'giaNhap',
    giaBan: 'giaBan',
    tonKho: 'tonKho',
    nguon: 'nguon',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SanPhamScalarFieldEnum = (typeof SanPhamScalarFieldEnum)[keyof typeof SanPhamScalarFieldEnum]


  export const NhapXuatKhoScalarFieldEnum: {
    id: 'id',
    sanPhamId: 'sanPhamId',
    loai: 'loai',
    soLuong: 'soLuong',
    ghiChu: 'ghiChu',
    nguoiTao: 'nguoiTao',
    createdAt: 'createdAt'
  };

  export type NhapXuatKhoScalarFieldEnum = (typeof NhapXuatKhoScalarFieldEnum)[keyof typeof NhapXuatKhoScalarFieldEnum]


  export const DoiTraScalarFieldEnum: {
    id: 'id',
    maDoiTra: 'maDoiTra',
    sdtThangTruoc: 'sdtThangTruoc',
    sdtHienTai: 'sdtHienTai',
    tenKhach: 'tenKhach',
    diaChi: 'diaChi',
    skuHienTai: 'skuHienTai',
    skuDoiSang: 'skuDoiSang',
    giaTriHang: 'giaTriHang',
    loaiVanDe: 'loaiVanDe',
    ghiChu: 'ghiChu',
    phiShip: 'phiShip',
    soChieuShip: 'soChieuShip',
    maVanDon: 'maVanDon',
    trangThai: 'trangThai',
    nguoiXuLy: 'nguoiXuLy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DoiTraScalarFieldEnum = (typeof DoiTraScalarFieldEnum)[keyof typeof DoiTraScalarFieldEnum]


  export const FeedbackScalarFieldEnum: {
    id: 'id',
    tenKhach: 'tenKhach',
    sdtKhach: 'sdtKhach',
    sku: 'sku',
    kenh: 'kenh',
    loai: 'loai',
    noiDung: 'noiDung',
    danhGia: 'danhGia',
    nguoiGhiNhan: 'nguoiGhiNhan',
    createdAt: 'createdAt'
  };

  export type FeedbackScalarFieldEnum = (typeof FeedbackScalarFieldEnum)[keyof typeof FeedbackScalarFieldEnum]


  export const BuTienScalarFieldEnum: {
    id: 'id',
    tenKhach: 'tenKhach',
    sdtKhach: 'sdtKhach',
    loiBu: 'loiBu',
    soTien: 'soTien',
    trangThai: 'trangThai',
    ghiChu: 'ghiChu',
    nguoiXuLy: 'nguoiXuLy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BuTienScalarFieldEnum = (typeof BuTienScalarFieldEnum)[keyof typeof BuTienScalarFieldEnum]


  export const KOCScalarFieldEnum: {
    id: 'id',
    ten: 'ten',
    platform: 'platform',
    follower: 'follower',
    giaCast: 'giaCast',
    linkProfile: 'linkProfile',
    sdt: 'sdt',
    email: 'email',
    ghiChu: 'ghiChu',
    createdAt: 'createdAt'
  };

  export type KOCScalarFieldEnum = (typeof KOCScalarFieldEnum)[keyof typeof KOCScalarFieldEnum]


  export const LoCatScalarFieldEnum: {
    id: 'id',
    ngay: 'ngay',
    hangCat: 'hangCat',
    soSize: 'soSize',
    maVai: 'maVai',
    soMSoDo: 'soMSoDo',
    soCay: 'soCay',
    cayData: 'cayData',
    soY: 'soY',
    soM: 'soM',
    tongSize: 'tongSize',
    soLa: 'soLa',
    soLaThucTe: 'soLaThucTe',
    soSanPham: 'soSanPham',
    hangThucTe: 'hangThucTe',
    soLuongThieu: 'soLuongThieu',
    xuongNhanHang: 'xuongNhanHang',
    trangThai: 'trangThai',
    xuong: 'xuong',
    hdMay: 'hdMay',
    tonTruocMay: 'tonTruocMay',
    hdMayDa: 'hdMayDa',
    coGiat: 'coGiat',
    hdGiatViSinh: 'hdGiatViSinh',
    tonTruocGiatViSinh: 'tonTruocGiatViSinh',
    hdGiatViSinhDa: 'hdGiatViSinhDa',
    hdGiatMau: 'hdGiatMau',
    tonTruocGiatMau: 'tonTruocGiatMau',
    hdGiatMauDa: 'hdGiatMauDa',
    ghiChuMay: 'ghiChuMay',
    mauGiat: 'mauGiat',
    ghiChu: 'ghiChu',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LoCatScalarFieldEnum = (typeof LoCatScalarFieldEnum)[keyof typeof LoCatScalarFieldEnum]


  export const VaiTonScalarFieldEnum: {
    id: 'id',
    maVai: 'maVai',
    soMet: 'soMet',
    soCay: 'soCay',
    cayData: 'cayData',
    donVi: 'donVi',
    mauSac: 'mauSac',
    xuong: 'xuong',
    ghiChu: 'ghiChu',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VaiTonScalarFieldEnum = (typeof VaiTonScalarFieldEnum)[keyof typeof VaiTonScalarFieldEnum]


  export const HoaDonTonHistoryScalarFieldEnum: {
    id: 'id',
    loaiHD: 'loaiHD',
    soTonCu: 'soTonCu',
    soTonMoi: 'soTonMoi',
    ghiChu: 'ghiChu',
    createdAt: 'createdAt'
  };

  export type HoaDonTonHistoryScalarFieldEnum = (typeof HoaDonTonHistoryScalarFieldEnum)[keyof typeof HoaDonTonHistoryScalarFieldEnum]


  export const KOCBookingScalarFieldEnum: {
    id: 'id',
    kocId: 'kocId',
    sanPhamId: 'sanPhamId',
    soLuongGui: 'soLuongGui',
    chiPhiCast: 'chiPhiCast',
    chiPhiSP: 'chiPhiSP',
    chiPhi: 'chiPhi',
    ngayBat: 'ngayBat',
    ngayKet: 'ngayKet',
    trangThai: 'trangThai',
    doanhThu: 'doanhThu',
    donHang: 'donHang',
    luotXem: 'luotXem',
    ghiChu: 'ghiChu',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type KOCBookingScalarFieldEnum = (typeof KOCBookingScalarFieldEnum)[keyof typeof KOCBookingScalarFieldEnum]


  export const HoaDonTonScalarFieldEnum: {
    id: 'id',
    soTon: 'soTon',
    updatedAt: 'updatedAt'
  };

  export type HoaDonTonScalarFieldEnum = (typeof HoaDonTonScalarFieldEnum)[keyof typeof HoaDonTonScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type SanPhamWhereInput = {
    AND?: SanPhamWhereInput | SanPhamWhereInput[]
    OR?: SanPhamWhereInput[]
    NOT?: SanPhamWhereInput | SanPhamWhereInput[]
    id?: StringFilter<"SanPham"> | string
    ten?: StringFilter<"SanPham"> | string
    sku?: StringFilter<"SanPham"> | string
    mauSac?: StringNullableFilter<"SanPham"> | string | null
    size?: StringNullableFilter<"SanPham"> | string | null
    giaNhap?: FloatFilter<"SanPham"> | number
    giaBan?: FloatFilter<"SanPham"> | number
    tonKho?: IntFilter<"SanPham"> | number
    nguon?: StringNullableFilter<"SanPham"> | string | null
    createdAt?: DateTimeFilter<"SanPham"> | Date | string
    updatedAt?: DateTimeFilter<"SanPham"> | Date | string
    nhapXuats?: NhapXuatKhoListRelationFilter
    kocBookings?: KOCBookingListRelationFilter
  }

  export type SanPhamOrderByWithRelationInput = {
    id?: SortOrder
    ten?: SortOrder
    sku?: SortOrder
    mauSac?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
    nguon?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    nhapXuats?: NhapXuatKhoOrderByRelationAggregateInput
    kocBookings?: KOCBookingOrderByRelationAggregateInput
  }

  export type SanPhamWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    AND?: SanPhamWhereInput | SanPhamWhereInput[]
    OR?: SanPhamWhereInput[]
    NOT?: SanPhamWhereInput | SanPhamWhereInput[]
    ten?: StringFilter<"SanPham"> | string
    mauSac?: StringNullableFilter<"SanPham"> | string | null
    size?: StringNullableFilter<"SanPham"> | string | null
    giaNhap?: FloatFilter<"SanPham"> | number
    giaBan?: FloatFilter<"SanPham"> | number
    tonKho?: IntFilter<"SanPham"> | number
    nguon?: StringNullableFilter<"SanPham"> | string | null
    createdAt?: DateTimeFilter<"SanPham"> | Date | string
    updatedAt?: DateTimeFilter<"SanPham"> | Date | string
    nhapXuats?: NhapXuatKhoListRelationFilter
    kocBookings?: KOCBookingListRelationFilter
  }, "id" | "sku">

  export type SanPhamOrderByWithAggregationInput = {
    id?: SortOrder
    ten?: SortOrder
    sku?: SortOrder
    mauSac?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
    nguon?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SanPhamCountOrderByAggregateInput
    _avg?: SanPhamAvgOrderByAggregateInput
    _max?: SanPhamMaxOrderByAggregateInput
    _min?: SanPhamMinOrderByAggregateInput
    _sum?: SanPhamSumOrderByAggregateInput
  }

  export type SanPhamScalarWhereWithAggregatesInput = {
    AND?: SanPhamScalarWhereWithAggregatesInput | SanPhamScalarWhereWithAggregatesInput[]
    OR?: SanPhamScalarWhereWithAggregatesInput[]
    NOT?: SanPhamScalarWhereWithAggregatesInput | SanPhamScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SanPham"> | string
    ten?: StringWithAggregatesFilter<"SanPham"> | string
    sku?: StringWithAggregatesFilter<"SanPham"> | string
    mauSac?: StringNullableWithAggregatesFilter<"SanPham"> | string | null
    size?: StringNullableWithAggregatesFilter<"SanPham"> | string | null
    giaNhap?: FloatWithAggregatesFilter<"SanPham"> | number
    giaBan?: FloatWithAggregatesFilter<"SanPham"> | number
    tonKho?: IntWithAggregatesFilter<"SanPham"> | number
    nguon?: StringNullableWithAggregatesFilter<"SanPham"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SanPham"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SanPham"> | Date | string
  }

  export type NhapXuatKhoWhereInput = {
    AND?: NhapXuatKhoWhereInput | NhapXuatKhoWhereInput[]
    OR?: NhapXuatKhoWhereInput[]
    NOT?: NhapXuatKhoWhereInput | NhapXuatKhoWhereInput[]
    id?: StringFilter<"NhapXuatKho"> | string
    sanPhamId?: StringFilter<"NhapXuatKho"> | string
    loai?: StringFilter<"NhapXuatKho"> | string
    soLuong?: IntFilter<"NhapXuatKho"> | number
    ghiChu?: StringNullableFilter<"NhapXuatKho"> | string | null
    nguoiTao?: StringNullableFilter<"NhapXuatKho"> | string | null
    createdAt?: DateTimeFilter<"NhapXuatKho"> | Date | string
    sanPham?: XOR<SanPhamScalarRelationFilter, SanPhamWhereInput>
  }

  export type NhapXuatKhoOrderByWithRelationInput = {
    id?: SortOrder
    sanPhamId?: SortOrder
    loai?: SortOrder
    soLuong?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    nguoiTao?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    sanPham?: SanPhamOrderByWithRelationInput
  }

  export type NhapXuatKhoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NhapXuatKhoWhereInput | NhapXuatKhoWhereInput[]
    OR?: NhapXuatKhoWhereInput[]
    NOT?: NhapXuatKhoWhereInput | NhapXuatKhoWhereInput[]
    sanPhamId?: StringFilter<"NhapXuatKho"> | string
    loai?: StringFilter<"NhapXuatKho"> | string
    soLuong?: IntFilter<"NhapXuatKho"> | number
    ghiChu?: StringNullableFilter<"NhapXuatKho"> | string | null
    nguoiTao?: StringNullableFilter<"NhapXuatKho"> | string | null
    createdAt?: DateTimeFilter<"NhapXuatKho"> | Date | string
    sanPham?: XOR<SanPhamScalarRelationFilter, SanPhamWhereInput>
  }, "id">

  export type NhapXuatKhoOrderByWithAggregationInput = {
    id?: SortOrder
    sanPhamId?: SortOrder
    loai?: SortOrder
    soLuong?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    nguoiTao?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: NhapXuatKhoCountOrderByAggregateInput
    _avg?: NhapXuatKhoAvgOrderByAggregateInput
    _max?: NhapXuatKhoMaxOrderByAggregateInput
    _min?: NhapXuatKhoMinOrderByAggregateInput
    _sum?: NhapXuatKhoSumOrderByAggregateInput
  }

  export type NhapXuatKhoScalarWhereWithAggregatesInput = {
    AND?: NhapXuatKhoScalarWhereWithAggregatesInput | NhapXuatKhoScalarWhereWithAggregatesInput[]
    OR?: NhapXuatKhoScalarWhereWithAggregatesInput[]
    NOT?: NhapXuatKhoScalarWhereWithAggregatesInput | NhapXuatKhoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NhapXuatKho"> | string
    sanPhamId?: StringWithAggregatesFilter<"NhapXuatKho"> | string
    loai?: StringWithAggregatesFilter<"NhapXuatKho"> | string
    soLuong?: IntWithAggregatesFilter<"NhapXuatKho"> | number
    ghiChu?: StringNullableWithAggregatesFilter<"NhapXuatKho"> | string | null
    nguoiTao?: StringNullableWithAggregatesFilter<"NhapXuatKho"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"NhapXuatKho"> | Date | string
  }

  export type DoiTraWhereInput = {
    AND?: DoiTraWhereInput | DoiTraWhereInput[]
    OR?: DoiTraWhereInput[]
    NOT?: DoiTraWhereInput | DoiTraWhereInput[]
    id?: StringFilter<"DoiTra"> | string
    maDoiTra?: StringFilter<"DoiTra"> | string
    sdtThangTruoc?: StringNullableFilter<"DoiTra"> | string | null
    sdtHienTai?: StringNullableFilter<"DoiTra"> | string | null
    tenKhach?: StringFilter<"DoiTra"> | string
    diaChi?: StringNullableFilter<"DoiTra"> | string | null
    skuHienTai?: StringNullableFilter<"DoiTra"> | string | null
    skuDoiSang?: StringNullableFilter<"DoiTra"> | string | null
    giaTriHang?: FloatFilter<"DoiTra"> | number
    loaiVanDe?: StringFilter<"DoiTra"> | string
    ghiChu?: StringNullableFilter<"DoiTra"> | string | null
    phiShip?: FloatFilter<"DoiTra"> | number
    soChieuShip?: IntFilter<"DoiTra"> | number
    maVanDon?: StringNullableFilter<"DoiTra"> | string | null
    trangThai?: StringFilter<"DoiTra"> | string
    nguoiXuLy?: StringNullableFilter<"DoiTra"> | string | null
    createdAt?: DateTimeFilter<"DoiTra"> | Date | string
    updatedAt?: DateTimeFilter<"DoiTra"> | Date | string
  }

  export type DoiTraOrderByWithRelationInput = {
    id?: SortOrder
    maDoiTra?: SortOrder
    sdtThangTruoc?: SortOrderInput | SortOrder
    sdtHienTai?: SortOrderInput | SortOrder
    tenKhach?: SortOrder
    diaChi?: SortOrderInput | SortOrder
    skuHienTai?: SortOrderInput | SortOrder
    skuDoiSang?: SortOrderInput | SortOrder
    giaTriHang?: SortOrder
    loaiVanDe?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
    maVanDon?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    nguoiXuLy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DoiTraWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    maDoiTra?: string
    AND?: DoiTraWhereInput | DoiTraWhereInput[]
    OR?: DoiTraWhereInput[]
    NOT?: DoiTraWhereInput | DoiTraWhereInput[]
    sdtThangTruoc?: StringNullableFilter<"DoiTra"> | string | null
    sdtHienTai?: StringNullableFilter<"DoiTra"> | string | null
    tenKhach?: StringFilter<"DoiTra"> | string
    diaChi?: StringNullableFilter<"DoiTra"> | string | null
    skuHienTai?: StringNullableFilter<"DoiTra"> | string | null
    skuDoiSang?: StringNullableFilter<"DoiTra"> | string | null
    giaTriHang?: FloatFilter<"DoiTra"> | number
    loaiVanDe?: StringFilter<"DoiTra"> | string
    ghiChu?: StringNullableFilter<"DoiTra"> | string | null
    phiShip?: FloatFilter<"DoiTra"> | number
    soChieuShip?: IntFilter<"DoiTra"> | number
    maVanDon?: StringNullableFilter<"DoiTra"> | string | null
    trangThai?: StringFilter<"DoiTra"> | string
    nguoiXuLy?: StringNullableFilter<"DoiTra"> | string | null
    createdAt?: DateTimeFilter<"DoiTra"> | Date | string
    updatedAt?: DateTimeFilter<"DoiTra"> | Date | string
  }, "id" | "maDoiTra">

  export type DoiTraOrderByWithAggregationInput = {
    id?: SortOrder
    maDoiTra?: SortOrder
    sdtThangTruoc?: SortOrderInput | SortOrder
    sdtHienTai?: SortOrderInput | SortOrder
    tenKhach?: SortOrder
    diaChi?: SortOrderInput | SortOrder
    skuHienTai?: SortOrderInput | SortOrder
    skuDoiSang?: SortOrderInput | SortOrder
    giaTriHang?: SortOrder
    loaiVanDe?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
    maVanDon?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    nguoiXuLy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DoiTraCountOrderByAggregateInput
    _avg?: DoiTraAvgOrderByAggregateInput
    _max?: DoiTraMaxOrderByAggregateInput
    _min?: DoiTraMinOrderByAggregateInput
    _sum?: DoiTraSumOrderByAggregateInput
  }

  export type DoiTraScalarWhereWithAggregatesInput = {
    AND?: DoiTraScalarWhereWithAggregatesInput | DoiTraScalarWhereWithAggregatesInput[]
    OR?: DoiTraScalarWhereWithAggregatesInput[]
    NOT?: DoiTraScalarWhereWithAggregatesInput | DoiTraScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DoiTra"> | string
    maDoiTra?: StringWithAggregatesFilter<"DoiTra"> | string
    sdtThangTruoc?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    sdtHienTai?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    tenKhach?: StringWithAggregatesFilter<"DoiTra"> | string
    diaChi?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    skuHienTai?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    skuDoiSang?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    giaTriHang?: FloatWithAggregatesFilter<"DoiTra"> | number
    loaiVanDe?: StringWithAggregatesFilter<"DoiTra"> | string
    ghiChu?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    phiShip?: FloatWithAggregatesFilter<"DoiTra"> | number
    soChieuShip?: IntWithAggregatesFilter<"DoiTra"> | number
    maVanDon?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    trangThai?: StringWithAggregatesFilter<"DoiTra"> | string
    nguoiXuLy?: StringNullableWithAggregatesFilter<"DoiTra"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DoiTra"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DoiTra"> | Date | string
  }

  export type FeedbackWhereInput = {
    AND?: FeedbackWhereInput | FeedbackWhereInput[]
    OR?: FeedbackWhereInput[]
    NOT?: FeedbackWhereInput | FeedbackWhereInput[]
    id?: StringFilter<"Feedback"> | string
    tenKhach?: StringNullableFilter<"Feedback"> | string | null
    sdtKhach?: StringNullableFilter<"Feedback"> | string | null
    sku?: StringNullableFilter<"Feedback"> | string | null
    kenh?: StringFilter<"Feedback"> | string
    loai?: StringFilter<"Feedback"> | string
    noiDung?: StringFilter<"Feedback"> | string
    danhGia?: IntNullableFilter<"Feedback"> | number | null
    nguoiGhiNhan?: StringNullableFilter<"Feedback"> | string | null
    createdAt?: DateTimeFilter<"Feedback"> | Date | string
  }

  export type FeedbackOrderByWithRelationInput = {
    id?: SortOrder
    tenKhach?: SortOrderInput | SortOrder
    sdtKhach?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    kenh?: SortOrder
    loai?: SortOrder
    noiDung?: SortOrder
    danhGia?: SortOrderInput | SortOrder
    nguoiGhiNhan?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type FeedbackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FeedbackWhereInput | FeedbackWhereInput[]
    OR?: FeedbackWhereInput[]
    NOT?: FeedbackWhereInput | FeedbackWhereInput[]
    tenKhach?: StringNullableFilter<"Feedback"> | string | null
    sdtKhach?: StringNullableFilter<"Feedback"> | string | null
    sku?: StringNullableFilter<"Feedback"> | string | null
    kenh?: StringFilter<"Feedback"> | string
    loai?: StringFilter<"Feedback"> | string
    noiDung?: StringFilter<"Feedback"> | string
    danhGia?: IntNullableFilter<"Feedback"> | number | null
    nguoiGhiNhan?: StringNullableFilter<"Feedback"> | string | null
    createdAt?: DateTimeFilter<"Feedback"> | Date | string
  }, "id">

  export type FeedbackOrderByWithAggregationInput = {
    id?: SortOrder
    tenKhach?: SortOrderInput | SortOrder
    sdtKhach?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    kenh?: SortOrder
    loai?: SortOrder
    noiDung?: SortOrder
    danhGia?: SortOrderInput | SortOrder
    nguoiGhiNhan?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: FeedbackCountOrderByAggregateInput
    _avg?: FeedbackAvgOrderByAggregateInput
    _max?: FeedbackMaxOrderByAggregateInput
    _min?: FeedbackMinOrderByAggregateInput
    _sum?: FeedbackSumOrderByAggregateInput
  }

  export type FeedbackScalarWhereWithAggregatesInput = {
    AND?: FeedbackScalarWhereWithAggregatesInput | FeedbackScalarWhereWithAggregatesInput[]
    OR?: FeedbackScalarWhereWithAggregatesInput[]
    NOT?: FeedbackScalarWhereWithAggregatesInput | FeedbackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Feedback"> | string
    tenKhach?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    sdtKhach?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    sku?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    kenh?: StringWithAggregatesFilter<"Feedback"> | string
    loai?: StringWithAggregatesFilter<"Feedback"> | string
    noiDung?: StringWithAggregatesFilter<"Feedback"> | string
    danhGia?: IntNullableWithAggregatesFilter<"Feedback"> | number | null
    nguoiGhiNhan?: StringNullableWithAggregatesFilter<"Feedback"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Feedback"> | Date | string
  }

  export type BuTienWhereInput = {
    AND?: BuTienWhereInput | BuTienWhereInput[]
    OR?: BuTienWhereInput[]
    NOT?: BuTienWhereInput | BuTienWhereInput[]
    id?: StringFilter<"BuTien"> | string
    tenKhach?: StringFilter<"BuTien"> | string
    sdtKhach?: StringNullableFilter<"BuTien"> | string | null
    loiBu?: StringFilter<"BuTien"> | string
    soTien?: FloatFilter<"BuTien"> | number
    trangThai?: StringFilter<"BuTien"> | string
    ghiChu?: StringNullableFilter<"BuTien"> | string | null
    nguoiXuLy?: StringNullableFilter<"BuTien"> | string | null
    createdAt?: DateTimeFilter<"BuTien"> | Date | string
    updatedAt?: DateTimeFilter<"BuTien"> | Date | string
  }

  export type BuTienOrderByWithRelationInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrderInput | SortOrder
    loiBu?: SortOrder
    soTien?: SortOrder
    trangThai?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    nguoiXuLy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BuTienWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BuTienWhereInput | BuTienWhereInput[]
    OR?: BuTienWhereInput[]
    NOT?: BuTienWhereInput | BuTienWhereInput[]
    tenKhach?: StringFilter<"BuTien"> | string
    sdtKhach?: StringNullableFilter<"BuTien"> | string | null
    loiBu?: StringFilter<"BuTien"> | string
    soTien?: FloatFilter<"BuTien"> | number
    trangThai?: StringFilter<"BuTien"> | string
    ghiChu?: StringNullableFilter<"BuTien"> | string | null
    nguoiXuLy?: StringNullableFilter<"BuTien"> | string | null
    createdAt?: DateTimeFilter<"BuTien"> | Date | string
    updatedAt?: DateTimeFilter<"BuTien"> | Date | string
  }, "id">

  export type BuTienOrderByWithAggregationInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrderInput | SortOrder
    loiBu?: SortOrder
    soTien?: SortOrder
    trangThai?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    nguoiXuLy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BuTienCountOrderByAggregateInput
    _avg?: BuTienAvgOrderByAggregateInput
    _max?: BuTienMaxOrderByAggregateInput
    _min?: BuTienMinOrderByAggregateInput
    _sum?: BuTienSumOrderByAggregateInput
  }

  export type BuTienScalarWhereWithAggregatesInput = {
    AND?: BuTienScalarWhereWithAggregatesInput | BuTienScalarWhereWithAggregatesInput[]
    OR?: BuTienScalarWhereWithAggregatesInput[]
    NOT?: BuTienScalarWhereWithAggregatesInput | BuTienScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BuTien"> | string
    tenKhach?: StringWithAggregatesFilter<"BuTien"> | string
    sdtKhach?: StringNullableWithAggregatesFilter<"BuTien"> | string | null
    loiBu?: StringWithAggregatesFilter<"BuTien"> | string
    soTien?: FloatWithAggregatesFilter<"BuTien"> | number
    trangThai?: StringWithAggregatesFilter<"BuTien"> | string
    ghiChu?: StringNullableWithAggregatesFilter<"BuTien"> | string | null
    nguoiXuLy?: StringNullableWithAggregatesFilter<"BuTien"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BuTien"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BuTien"> | Date | string
  }

  export type KOCWhereInput = {
    AND?: KOCWhereInput | KOCWhereInput[]
    OR?: KOCWhereInput[]
    NOT?: KOCWhereInput | KOCWhereInput[]
    id?: StringFilter<"KOC"> | string
    ten?: StringFilter<"KOC"> | string
    platform?: StringFilter<"KOC"> | string
    follower?: IntFilter<"KOC"> | number
    giaCast?: FloatFilter<"KOC"> | number
    linkProfile?: StringNullableFilter<"KOC"> | string | null
    sdt?: StringNullableFilter<"KOC"> | string | null
    email?: StringNullableFilter<"KOC"> | string | null
    ghiChu?: StringNullableFilter<"KOC"> | string | null
    createdAt?: DateTimeFilter<"KOC"> | Date | string
    bookings?: KOCBookingListRelationFilter
  }

  export type KOCOrderByWithRelationInput = {
    id?: SortOrder
    ten?: SortOrder
    platform?: SortOrder
    follower?: SortOrder
    giaCast?: SortOrder
    linkProfile?: SortOrderInput | SortOrder
    sdt?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    bookings?: KOCBookingOrderByRelationAggregateInput
  }

  export type KOCWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KOCWhereInput | KOCWhereInput[]
    OR?: KOCWhereInput[]
    NOT?: KOCWhereInput | KOCWhereInput[]
    ten?: StringFilter<"KOC"> | string
    platform?: StringFilter<"KOC"> | string
    follower?: IntFilter<"KOC"> | number
    giaCast?: FloatFilter<"KOC"> | number
    linkProfile?: StringNullableFilter<"KOC"> | string | null
    sdt?: StringNullableFilter<"KOC"> | string | null
    email?: StringNullableFilter<"KOC"> | string | null
    ghiChu?: StringNullableFilter<"KOC"> | string | null
    createdAt?: DateTimeFilter<"KOC"> | Date | string
    bookings?: KOCBookingListRelationFilter
  }, "id">

  export type KOCOrderByWithAggregationInput = {
    id?: SortOrder
    ten?: SortOrder
    platform?: SortOrder
    follower?: SortOrder
    giaCast?: SortOrder
    linkProfile?: SortOrderInput | SortOrder
    sdt?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: KOCCountOrderByAggregateInput
    _avg?: KOCAvgOrderByAggregateInput
    _max?: KOCMaxOrderByAggregateInput
    _min?: KOCMinOrderByAggregateInput
    _sum?: KOCSumOrderByAggregateInput
  }

  export type KOCScalarWhereWithAggregatesInput = {
    AND?: KOCScalarWhereWithAggregatesInput | KOCScalarWhereWithAggregatesInput[]
    OR?: KOCScalarWhereWithAggregatesInput[]
    NOT?: KOCScalarWhereWithAggregatesInput | KOCScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KOC"> | string
    ten?: StringWithAggregatesFilter<"KOC"> | string
    platform?: StringWithAggregatesFilter<"KOC"> | string
    follower?: IntWithAggregatesFilter<"KOC"> | number
    giaCast?: FloatWithAggregatesFilter<"KOC"> | number
    linkProfile?: StringNullableWithAggregatesFilter<"KOC"> | string | null
    sdt?: StringNullableWithAggregatesFilter<"KOC"> | string | null
    email?: StringNullableWithAggregatesFilter<"KOC"> | string | null
    ghiChu?: StringNullableWithAggregatesFilter<"KOC"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"KOC"> | Date | string
  }

  export type LoCatWhereInput = {
    AND?: LoCatWhereInput | LoCatWhereInput[]
    OR?: LoCatWhereInput[]
    NOT?: LoCatWhereInput | LoCatWhereInput[]
    id?: StringFilter<"LoCat"> | string
    ngay?: DateTimeFilter<"LoCat"> | Date | string
    hangCat?: StringFilter<"LoCat"> | string
    soSize?: StringNullableFilter<"LoCat"> | string | null
    maVai?: StringNullableFilter<"LoCat"> | string | null
    soMSoDo?: FloatNullableFilter<"LoCat"> | number | null
    soCay?: IntFilter<"LoCat"> | number
    cayData?: StringNullableFilter<"LoCat"> | string | null
    soY?: FloatNullableFilter<"LoCat"> | number | null
    soM?: FloatNullableFilter<"LoCat"> | number | null
    tongSize?: IntNullableFilter<"LoCat"> | number | null
    soLa?: FloatNullableFilter<"LoCat"> | number | null
    soLaThucTe?: IntNullableFilter<"LoCat"> | number | null
    soSanPham?: IntNullableFilter<"LoCat"> | number | null
    hangThucTe?: IntNullableFilter<"LoCat"> | number | null
    soLuongThieu?: IntNullableFilter<"LoCat"> | number | null
    xuongNhanHang?: StringNullableFilter<"LoCat"> | string | null
    trangThai?: StringFilter<"LoCat"> | string
    xuong?: StringFilter<"LoCat"> | string
    hdMay?: IntNullableFilter<"LoCat"> | number | null
    tonTruocMay?: FloatNullableFilter<"LoCat"> | number | null
    hdMayDa?: BoolFilter<"LoCat"> | boolean
    coGiat?: StringNullableFilter<"LoCat"> | string | null
    hdGiatViSinh?: IntNullableFilter<"LoCat"> | number | null
    tonTruocGiatViSinh?: FloatNullableFilter<"LoCat"> | number | null
    hdGiatViSinhDa?: BoolFilter<"LoCat"> | boolean
    hdGiatMau?: IntNullableFilter<"LoCat"> | number | null
    tonTruocGiatMau?: FloatNullableFilter<"LoCat"> | number | null
    hdGiatMauDa?: BoolFilter<"LoCat"> | boolean
    ghiChuMay?: StringNullableFilter<"LoCat"> | string | null
    mauGiat?: StringNullableFilter<"LoCat"> | string | null
    ghiChu?: StringNullableFilter<"LoCat"> | string | null
    createdAt?: DateTimeFilter<"LoCat"> | Date | string
    updatedAt?: DateTimeFilter<"LoCat"> | Date | string
  }

  export type LoCatOrderByWithRelationInput = {
    id?: SortOrder
    ngay?: SortOrder
    hangCat?: SortOrder
    soSize?: SortOrderInput | SortOrder
    maVai?: SortOrderInput | SortOrder
    soMSoDo?: SortOrderInput | SortOrder
    soCay?: SortOrder
    cayData?: SortOrderInput | SortOrder
    soY?: SortOrderInput | SortOrder
    soM?: SortOrderInput | SortOrder
    tongSize?: SortOrderInput | SortOrder
    soLa?: SortOrderInput | SortOrder
    soLaThucTe?: SortOrderInput | SortOrder
    soSanPham?: SortOrderInput | SortOrder
    hangThucTe?: SortOrderInput | SortOrder
    soLuongThieu?: SortOrderInput | SortOrder
    xuongNhanHang?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    xuong?: SortOrder
    hdMay?: SortOrderInput | SortOrder
    tonTruocMay?: SortOrderInput | SortOrder
    hdMayDa?: SortOrder
    coGiat?: SortOrderInput | SortOrder
    hdGiatViSinh?: SortOrderInput | SortOrder
    tonTruocGiatViSinh?: SortOrderInput | SortOrder
    hdGiatViSinhDa?: SortOrder
    hdGiatMau?: SortOrderInput | SortOrder
    tonTruocGiatMau?: SortOrderInput | SortOrder
    hdGiatMauDa?: SortOrder
    ghiChuMay?: SortOrderInput | SortOrder
    mauGiat?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LoCatWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LoCatWhereInput | LoCatWhereInput[]
    OR?: LoCatWhereInput[]
    NOT?: LoCatWhereInput | LoCatWhereInput[]
    ngay?: DateTimeFilter<"LoCat"> | Date | string
    hangCat?: StringFilter<"LoCat"> | string
    soSize?: StringNullableFilter<"LoCat"> | string | null
    maVai?: StringNullableFilter<"LoCat"> | string | null
    soMSoDo?: FloatNullableFilter<"LoCat"> | number | null
    soCay?: IntFilter<"LoCat"> | number
    cayData?: StringNullableFilter<"LoCat"> | string | null
    soY?: FloatNullableFilter<"LoCat"> | number | null
    soM?: FloatNullableFilter<"LoCat"> | number | null
    tongSize?: IntNullableFilter<"LoCat"> | number | null
    soLa?: FloatNullableFilter<"LoCat"> | number | null
    soLaThucTe?: IntNullableFilter<"LoCat"> | number | null
    soSanPham?: IntNullableFilter<"LoCat"> | number | null
    hangThucTe?: IntNullableFilter<"LoCat"> | number | null
    soLuongThieu?: IntNullableFilter<"LoCat"> | number | null
    xuongNhanHang?: StringNullableFilter<"LoCat"> | string | null
    trangThai?: StringFilter<"LoCat"> | string
    xuong?: StringFilter<"LoCat"> | string
    hdMay?: IntNullableFilter<"LoCat"> | number | null
    tonTruocMay?: FloatNullableFilter<"LoCat"> | number | null
    hdMayDa?: BoolFilter<"LoCat"> | boolean
    coGiat?: StringNullableFilter<"LoCat"> | string | null
    hdGiatViSinh?: IntNullableFilter<"LoCat"> | number | null
    tonTruocGiatViSinh?: FloatNullableFilter<"LoCat"> | number | null
    hdGiatViSinhDa?: BoolFilter<"LoCat"> | boolean
    hdGiatMau?: IntNullableFilter<"LoCat"> | number | null
    tonTruocGiatMau?: FloatNullableFilter<"LoCat"> | number | null
    hdGiatMauDa?: BoolFilter<"LoCat"> | boolean
    ghiChuMay?: StringNullableFilter<"LoCat"> | string | null
    mauGiat?: StringNullableFilter<"LoCat"> | string | null
    ghiChu?: StringNullableFilter<"LoCat"> | string | null
    createdAt?: DateTimeFilter<"LoCat"> | Date | string
    updatedAt?: DateTimeFilter<"LoCat"> | Date | string
  }, "id">

  export type LoCatOrderByWithAggregationInput = {
    id?: SortOrder
    ngay?: SortOrder
    hangCat?: SortOrder
    soSize?: SortOrderInput | SortOrder
    maVai?: SortOrderInput | SortOrder
    soMSoDo?: SortOrderInput | SortOrder
    soCay?: SortOrder
    cayData?: SortOrderInput | SortOrder
    soY?: SortOrderInput | SortOrder
    soM?: SortOrderInput | SortOrder
    tongSize?: SortOrderInput | SortOrder
    soLa?: SortOrderInput | SortOrder
    soLaThucTe?: SortOrderInput | SortOrder
    soSanPham?: SortOrderInput | SortOrder
    hangThucTe?: SortOrderInput | SortOrder
    soLuongThieu?: SortOrderInput | SortOrder
    xuongNhanHang?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    xuong?: SortOrder
    hdMay?: SortOrderInput | SortOrder
    tonTruocMay?: SortOrderInput | SortOrder
    hdMayDa?: SortOrder
    coGiat?: SortOrderInput | SortOrder
    hdGiatViSinh?: SortOrderInput | SortOrder
    tonTruocGiatViSinh?: SortOrderInput | SortOrder
    hdGiatViSinhDa?: SortOrder
    hdGiatMau?: SortOrderInput | SortOrder
    tonTruocGiatMau?: SortOrderInput | SortOrder
    hdGiatMauDa?: SortOrder
    ghiChuMay?: SortOrderInput | SortOrder
    mauGiat?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LoCatCountOrderByAggregateInput
    _avg?: LoCatAvgOrderByAggregateInput
    _max?: LoCatMaxOrderByAggregateInput
    _min?: LoCatMinOrderByAggregateInput
    _sum?: LoCatSumOrderByAggregateInput
  }

  export type LoCatScalarWhereWithAggregatesInput = {
    AND?: LoCatScalarWhereWithAggregatesInput | LoCatScalarWhereWithAggregatesInput[]
    OR?: LoCatScalarWhereWithAggregatesInput[]
    NOT?: LoCatScalarWhereWithAggregatesInput | LoCatScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LoCat"> | string
    ngay?: DateTimeWithAggregatesFilter<"LoCat"> | Date | string
    hangCat?: StringWithAggregatesFilter<"LoCat"> | string
    soSize?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    maVai?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    soMSoDo?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    soCay?: IntWithAggregatesFilter<"LoCat"> | number
    cayData?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    soY?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    soM?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    tongSize?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    soLa?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    soLaThucTe?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    soSanPham?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    hangThucTe?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    soLuongThieu?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    xuongNhanHang?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    trangThai?: StringWithAggregatesFilter<"LoCat"> | string
    xuong?: StringWithAggregatesFilter<"LoCat"> | string
    hdMay?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    tonTruocMay?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    hdMayDa?: BoolWithAggregatesFilter<"LoCat"> | boolean
    coGiat?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    hdGiatViSinh?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    tonTruocGiatViSinh?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    hdGiatViSinhDa?: BoolWithAggregatesFilter<"LoCat"> | boolean
    hdGiatMau?: IntNullableWithAggregatesFilter<"LoCat"> | number | null
    tonTruocGiatMau?: FloatNullableWithAggregatesFilter<"LoCat"> | number | null
    hdGiatMauDa?: BoolWithAggregatesFilter<"LoCat"> | boolean
    ghiChuMay?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    mauGiat?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    ghiChu?: StringNullableWithAggregatesFilter<"LoCat"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LoCat"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LoCat"> | Date | string
  }

  export type VaiTonWhereInput = {
    AND?: VaiTonWhereInput | VaiTonWhereInput[]
    OR?: VaiTonWhereInput[]
    NOT?: VaiTonWhereInput | VaiTonWhereInput[]
    id?: StringFilter<"VaiTon"> | string
    maVai?: StringFilter<"VaiTon"> | string
    soMet?: FloatFilter<"VaiTon"> | number
    soCay?: IntFilter<"VaiTon"> | number
    cayData?: StringNullableFilter<"VaiTon"> | string | null
    donVi?: StringFilter<"VaiTon"> | string
    mauSac?: StringNullableFilter<"VaiTon"> | string | null
    xuong?: StringNullableFilter<"VaiTon"> | string | null
    ghiChu?: StringNullableFilter<"VaiTon"> | string | null
    createdAt?: DateTimeFilter<"VaiTon"> | Date | string
    updatedAt?: DateTimeFilter<"VaiTon"> | Date | string
  }

  export type VaiTonOrderByWithRelationInput = {
    id?: SortOrder
    maVai?: SortOrder
    soMet?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrderInput | SortOrder
    donVi?: SortOrder
    mauSac?: SortOrderInput | SortOrder
    xuong?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VaiTonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VaiTonWhereInput | VaiTonWhereInput[]
    OR?: VaiTonWhereInput[]
    NOT?: VaiTonWhereInput | VaiTonWhereInput[]
    maVai?: StringFilter<"VaiTon"> | string
    soMet?: FloatFilter<"VaiTon"> | number
    soCay?: IntFilter<"VaiTon"> | number
    cayData?: StringNullableFilter<"VaiTon"> | string | null
    donVi?: StringFilter<"VaiTon"> | string
    mauSac?: StringNullableFilter<"VaiTon"> | string | null
    xuong?: StringNullableFilter<"VaiTon"> | string | null
    ghiChu?: StringNullableFilter<"VaiTon"> | string | null
    createdAt?: DateTimeFilter<"VaiTon"> | Date | string
    updatedAt?: DateTimeFilter<"VaiTon"> | Date | string
  }, "id">

  export type VaiTonOrderByWithAggregationInput = {
    id?: SortOrder
    maVai?: SortOrder
    soMet?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrderInput | SortOrder
    donVi?: SortOrder
    mauSac?: SortOrderInput | SortOrder
    xuong?: SortOrderInput | SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VaiTonCountOrderByAggregateInput
    _avg?: VaiTonAvgOrderByAggregateInput
    _max?: VaiTonMaxOrderByAggregateInput
    _min?: VaiTonMinOrderByAggregateInput
    _sum?: VaiTonSumOrderByAggregateInput
  }

  export type VaiTonScalarWhereWithAggregatesInput = {
    AND?: VaiTonScalarWhereWithAggregatesInput | VaiTonScalarWhereWithAggregatesInput[]
    OR?: VaiTonScalarWhereWithAggregatesInput[]
    NOT?: VaiTonScalarWhereWithAggregatesInput | VaiTonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"VaiTon"> | string
    maVai?: StringWithAggregatesFilter<"VaiTon"> | string
    soMet?: FloatWithAggregatesFilter<"VaiTon"> | number
    soCay?: IntWithAggregatesFilter<"VaiTon"> | number
    cayData?: StringNullableWithAggregatesFilter<"VaiTon"> | string | null
    donVi?: StringWithAggregatesFilter<"VaiTon"> | string
    mauSac?: StringNullableWithAggregatesFilter<"VaiTon"> | string | null
    xuong?: StringNullableWithAggregatesFilter<"VaiTon"> | string | null
    ghiChu?: StringNullableWithAggregatesFilter<"VaiTon"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"VaiTon"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"VaiTon"> | Date | string
  }

  export type HoaDonTonHistoryWhereInput = {
    AND?: HoaDonTonHistoryWhereInput | HoaDonTonHistoryWhereInput[]
    OR?: HoaDonTonHistoryWhereInput[]
    NOT?: HoaDonTonHistoryWhereInput | HoaDonTonHistoryWhereInput[]
    id?: StringFilter<"HoaDonTonHistory"> | string
    loaiHD?: StringFilter<"HoaDonTonHistory"> | string
    soTonCu?: FloatFilter<"HoaDonTonHistory"> | number
    soTonMoi?: FloatFilter<"HoaDonTonHistory"> | number
    ghiChu?: StringNullableFilter<"HoaDonTonHistory"> | string | null
    createdAt?: DateTimeFilter<"HoaDonTonHistory"> | Date | string
  }

  export type HoaDonTonHistoryOrderByWithRelationInput = {
    id?: SortOrder
    loaiHD?: SortOrder
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type HoaDonTonHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HoaDonTonHistoryWhereInput | HoaDonTonHistoryWhereInput[]
    OR?: HoaDonTonHistoryWhereInput[]
    NOT?: HoaDonTonHistoryWhereInput | HoaDonTonHistoryWhereInput[]
    loaiHD?: StringFilter<"HoaDonTonHistory"> | string
    soTonCu?: FloatFilter<"HoaDonTonHistory"> | number
    soTonMoi?: FloatFilter<"HoaDonTonHistory"> | number
    ghiChu?: StringNullableFilter<"HoaDonTonHistory"> | string | null
    createdAt?: DateTimeFilter<"HoaDonTonHistory"> | Date | string
  }, "id">

  export type HoaDonTonHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    loaiHD?: SortOrder
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: HoaDonTonHistoryCountOrderByAggregateInput
    _avg?: HoaDonTonHistoryAvgOrderByAggregateInput
    _max?: HoaDonTonHistoryMaxOrderByAggregateInput
    _min?: HoaDonTonHistoryMinOrderByAggregateInput
    _sum?: HoaDonTonHistorySumOrderByAggregateInput
  }

  export type HoaDonTonHistoryScalarWhereWithAggregatesInput = {
    AND?: HoaDonTonHistoryScalarWhereWithAggregatesInput | HoaDonTonHistoryScalarWhereWithAggregatesInput[]
    OR?: HoaDonTonHistoryScalarWhereWithAggregatesInput[]
    NOT?: HoaDonTonHistoryScalarWhereWithAggregatesInput | HoaDonTonHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HoaDonTonHistory"> | string
    loaiHD?: StringWithAggregatesFilter<"HoaDonTonHistory"> | string
    soTonCu?: FloatWithAggregatesFilter<"HoaDonTonHistory"> | number
    soTonMoi?: FloatWithAggregatesFilter<"HoaDonTonHistory"> | number
    ghiChu?: StringNullableWithAggregatesFilter<"HoaDonTonHistory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"HoaDonTonHistory"> | Date | string
  }

  export type KOCBookingWhereInput = {
    AND?: KOCBookingWhereInput | KOCBookingWhereInput[]
    OR?: KOCBookingWhereInput[]
    NOT?: KOCBookingWhereInput | KOCBookingWhereInput[]
    id?: StringFilter<"KOCBooking"> | string
    kocId?: StringFilter<"KOCBooking"> | string
    sanPhamId?: StringNullableFilter<"KOCBooking"> | string | null
    soLuongGui?: IntFilter<"KOCBooking"> | number
    chiPhiCast?: FloatFilter<"KOCBooking"> | number
    chiPhiSP?: FloatFilter<"KOCBooking"> | number
    chiPhi?: FloatFilter<"KOCBooking"> | number
    ngayBat?: DateTimeFilter<"KOCBooking"> | Date | string
    ngayKet?: DateTimeNullableFilter<"KOCBooking"> | Date | string | null
    trangThai?: StringFilter<"KOCBooking"> | string
    doanhThu?: FloatFilter<"KOCBooking"> | number
    donHang?: IntFilter<"KOCBooking"> | number
    luotXem?: IntFilter<"KOCBooking"> | number
    ghiChu?: StringNullableFilter<"KOCBooking"> | string | null
    createdAt?: DateTimeFilter<"KOCBooking"> | Date | string
    updatedAt?: DateTimeFilter<"KOCBooking"> | Date | string
    koc?: XOR<KOCScalarRelationFilter, KOCWhereInput>
    sanPham?: XOR<SanPhamNullableScalarRelationFilter, SanPhamWhereInput> | null
  }

  export type KOCBookingOrderByWithRelationInput = {
    id?: SortOrder
    kocId?: SortOrder
    sanPhamId?: SortOrderInput | SortOrder
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    ngayBat?: SortOrder
    ngayKet?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    koc?: KOCOrderByWithRelationInput
    sanPham?: SanPhamOrderByWithRelationInput
  }

  export type KOCBookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KOCBookingWhereInput | KOCBookingWhereInput[]
    OR?: KOCBookingWhereInput[]
    NOT?: KOCBookingWhereInput | KOCBookingWhereInput[]
    kocId?: StringFilter<"KOCBooking"> | string
    sanPhamId?: StringNullableFilter<"KOCBooking"> | string | null
    soLuongGui?: IntFilter<"KOCBooking"> | number
    chiPhiCast?: FloatFilter<"KOCBooking"> | number
    chiPhiSP?: FloatFilter<"KOCBooking"> | number
    chiPhi?: FloatFilter<"KOCBooking"> | number
    ngayBat?: DateTimeFilter<"KOCBooking"> | Date | string
    ngayKet?: DateTimeNullableFilter<"KOCBooking"> | Date | string | null
    trangThai?: StringFilter<"KOCBooking"> | string
    doanhThu?: FloatFilter<"KOCBooking"> | number
    donHang?: IntFilter<"KOCBooking"> | number
    luotXem?: IntFilter<"KOCBooking"> | number
    ghiChu?: StringNullableFilter<"KOCBooking"> | string | null
    createdAt?: DateTimeFilter<"KOCBooking"> | Date | string
    updatedAt?: DateTimeFilter<"KOCBooking"> | Date | string
    koc?: XOR<KOCScalarRelationFilter, KOCWhereInput>
    sanPham?: XOR<SanPhamNullableScalarRelationFilter, SanPhamWhereInput> | null
  }, "id">

  export type KOCBookingOrderByWithAggregationInput = {
    id?: SortOrder
    kocId?: SortOrder
    sanPhamId?: SortOrderInput | SortOrder
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    ngayBat?: SortOrder
    ngayKet?: SortOrderInput | SortOrder
    trangThai?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
    ghiChu?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: KOCBookingCountOrderByAggregateInput
    _avg?: KOCBookingAvgOrderByAggregateInput
    _max?: KOCBookingMaxOrderByAggregateInput
    _min?: KOCBookingMinOrderByAggregateInput
    _sum?: KOCBookingSumOrderByAggregateInput
  }

  export type KOCBookingScalarWhereWithAggregatesInput = {
    AND?: KOCBookingScalarWhereWithAggregatesInput | KOCBookingScalarWhereWithAggregatesInput[]
    OR?: KOCBookingScalarWhereWithAggregatesInput[]
    NOT?: KOCBookingScalarWhereWithAggregatesInput | KOCBookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KOCBooking"> | string
    kocId?: StringWithAggregatesFilter<"KOCBooking"> | string
    sanPhamId?: StringNullableWithAggregatesFilter<"KOCBooking"> | string | null
    soLuongGui?: IntWithAggregatesFilter<"KOCBooking"> | number
    chiPhiCast?: FloatWithAggregatesFilter<"KOCBooking"> | number
    chiPhiSP?: FloatWithAggregatesFilter<"KOCBooking"> | number
    chiPhi?: FloatWithAggregatesFilter<"KOCBooking"> | number
    ngayBat?: DateTimeWithAggregatesFilter<"KOCBooking"> | Date | string
    ngayKet?: DateTimeNullableWithAggregatesFilter<"KOCBooking"> | Date | string | null
    trangThai?: StringWithAggregatesFilter<"KOCBooking"> | string
    doanhThu?: FloatWithAggregatesFilter<"KOCBooking"> | number
    donHang?: IntWithAggregatesFilter<"KOCBooking"> | number
    luotXem?: IntWithAggregatesFilter<"KOCBooking"> | number
    ghiChu?: StringNullableWithAggregatesFilter<"KOCBooking"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"KOCBooking"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"KOCBooking"> | Date | string
  }

  export type HoaDonTonWhereInput = {
    AND?: HoaDonTonWhereInput | HoaDonTonWhereInput[]
    OR?: HoaDonTonWhereInput[]
    NOT?: HoaDonTonWhereInput | HoaDonTonWhereInput[]
    id?: StringFilter<"HoaDonTon"> | string
    soTon?: FloatFilter<"HoaDonTon"> | number
    updatedAt?: DateTimeFilter<"HoaDonTon"> | Date | string
  }

  export type HoaDonTonOrderByWithRelationInput = {
    id?: SortOrder
    soTon?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoaDonTonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HoaDonTonWhereInput | HoaDonTonWhereInput[]
    OR?: HoaDonTonWhereInput[]
    NOT?: HoaDonTonWhereInput | HoaDonTonWhereInput[]
    soTon?: FloatFilter<"HoaDonTon"> | number
    updatedAt?: DateTimeFilter<"HoaDonTon"> | Date | string
  }, "id">

  export type HoaDonTonOrderByWithAggregationInput = {
    id?: SortOrder
    soTon?: SortOrder
    updatedAt?: SortOrder
    _count?: HoaDonTonCountOrderByAggregateInput
    _avg?: HoaDonTonAvgOrderByAggregateInput
    _max?: HoaDonTonMaxOrderByAggregateInput
    _min?: HoaDonTonMinOrderByAggregateInput
    _sum?: HoaDonTonSumOrderByAggregateInput
  }

  export type HoaDonTonScalarWhereWithAggregatesInput = {
    AND?: HoaDonTonScalarWhereWithAggregatesInput | HoaDonTonScalarWhereWithAggregatesInput[]
    OR?: HoaDonTonScalarWhereWithAggregatesInput[]
    NOT?: HoaDonTonScalarWhereWithAggregatesInput | HoaDonTonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HoaDonTon"> | string
    soTon?: FloatWithAggregatesFilter<"HoaDonTon"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"HoaDonTon"> | Date | string
  }

  export type SanPhamCreateInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    nhapXuats?: NhapXuatKhoCreateNestedManyWithoutSanPhamInput
    kocBookings?: KOCBookingCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamUncheckedCreateInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    nhapXuats?: NhapXuatKhoUncheckedCreateNestedManyWithoutSanPhamInput
    kocBookings?: KOCBookingUncheckedCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    nhapXuats?: NhapXuatKhoUpdateManyWithoutSanPhamNestedInput
    kocBookings?: KOCBookingUpdateManyWithoutSanPhamNestedInput
  }

  export type SanPhamUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    nhapXuats?: NhapXuatKhoUncheckedUpdateManyWithoutSanPhamNestedInput
    kocBookings?: KOCBookingUncheckedUpdateManyWithoutSanPhamNestedInput
  }

  export type SanPhamCreateManyInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SanPhamUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SanPhamUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NhapXuatKhoCreateInput = {
    id?: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
    sanPham: SanPhamCreateNestedOneWithoutNhapXuatsInput
  }

  export type NhapXuatKhoUncheckedCreateInput = {
    id?: string
    sanPhamId: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
  }

  export type NhapXuatKhoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sanPham?: SanPhamUpdateOneRequiredWithoutNhapXuatsNestedInput
  }

  export type NhapXuatKhoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sanPhamId?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NhapXuatKhoCreateManyInput = {
    id?: string
    sanPhamId: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
  }

  export type NhapXuatKhoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NhapXuatKhoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sanPhamId?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DoiTraCreateInput = {
    id?: string
    maDoiTra: string
    sdtThangTruoc?: string | null
    sdtHienTai?: string | null
    tenKhach: string
    diaChi?: string | null
    skuHienTai?: string | null
    skuDoiSang?: string | null
    giaTriHang?: number
    loaiVanDe: string
    ghiChu?: string | null
    phiShip?: number
    soChieuShip?: number
    maVanDon?: string | null
    trangThai?: string
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DoiTraUncheckedCreateInput = {
    id?: string
    maDoiTra: string
    sdtThangTruoc?: string | null
    sdtHienTai?: string | null
    tenKhach: string
    diaChi?: string | null
    skuHienTai?: string | null
    skuDoiSang?: string | null
    giaTriHang?: number
    loaiVanDe: string
    ghiChu?: string | null
    phiShip?: number
    soChieuShip?: number
    maVanDon?: string | null
    trangThai?: string
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DoiTraUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    maDoiTra?: StringFieldUpdateOperationsInput | string
    sdtThangTruoc?: NullableStringFieldUpdateOperationsInput | string | null
    sdtHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    tenKhach?: StringFieldUpdateOperationsInput | string
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    skuHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    skuDoiSang?: NullableStringFieldUpdateOperationsInput | string | null
    giaTriHang?: FloatFieldUpdateOperationsInput | number
    loaiVanDe?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    phiShip?: FloatFieldUpdateOperationsInput | number
    soChieuShip?: IntFieldUpdateOperationsInput | number
    maVanDon?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DoiTraUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    maDoiTra?: StringFieldUpdateOperationsInput | string
    sdtThangTruoc?: NullableStringFieldUpdateOperationsInput | string | null
    sdtHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    tenKhach?: StringFieldUpdateOperationsInput | string
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    skuHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    skuDoiSang?: NullableStringFieldUpdateOperationsInput | string | null
    giaTriHang?: FloatFieldUpdateOperationsInput | number
    loaiVanDe?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    phiShip?: FloatFieldUpdateOperationsInput | number
    soChieuShip?: IntFieldUpdateOperationsInput | number
    maVanDon?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DoiTraCreateManyInput = {
    id?: string
    maDoiTra: string
    sdtThangTruoc?: string | null
    sdtHienTai?: string | null
    tenKhach: string
    diaChi?: string | null
    skuHienTai?: string | null
    skuDoiSang?: string | null
    giaTriHang?: number
    loaiVanDe: string
    ghiChu?: string | null
    phiShip?: number
    soChieuShip?: number
    maVanDon?: string | null
    trangThai?: string
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DoiTraUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    maDoiTra?: StringFieldUpdateOperationsInput | string
    sdtThangTruoc?: NullableStringFieldUpdateOperationsInput | string | null
    sdtHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    tenKhach?: StringFieldUpdateOperationsInput | string
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    skuHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    skuDoiSang?: NullableStringFieldUpdateOperationsInput | string | null
    giaTriHang?: FloatFieldUpdateOperationsInput | number
    loaiVanDe?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    phiShip?: FloatFieldUpdateOperationsInput | number
    soChieuShip?: IntFieldUpdateOperationsInput | number
    maVanDon?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DoiTraUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    maDoiTra?: StringFieldUpdateOperationsInput | string
    sdtThangTruoc?: NullableStringFieldUpdateOperationsInput | string | null
    sdtHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    tenKhach?: StringFieldUpdateOperationsInput | string
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    skuHienTai?: NullableStringFieldUpdateOperationsInput | string | null
    skuDoiSang?: NullableStringFieldUpdateOperationsInput | string | null
    giaTriHang?: FloatFieldUpdateOperationsInput | number
    loaiVanDe?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    phiShip?: FloatFieldUpdateOperationsInput | number
    soChieuShip?: IntFieldUpdateOperationsInput | number
    maVanDon?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackCreateInput = {
    id?: string
    tenKhach?: string | null
    sdtKhach?: string | null
    sku?: string | null
    kenh?: string
    loai: string
    noiDung: string
    danhGia?: number | null
    nguoiGhiNhan?: string | null
    createdAt?: Date | string
  }

  export type FeedbackUncheckedCreateInput = {
    id?: string
    tenKhach?: string | null
    sdtKhach?: string | null
    sku?: string | null
    kenh?: string
    loai: string
    noiDung: string
    danhGia?: number | null
    nguoiGhiNhan?: string | null
    createdAt?: Date | string
  }

  export type FeedbackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    kenh?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    noiDung?: StringFieldUpdateOperationsInput | string
    danhGia?: NullableIntFieldUpdateOperationsInput | number | null
    nguoiGhiNhan?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    kenh?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    noiDung?: StringFieldUpdateOperationsInput | string
    danhGia?: NullableIntFieldUpdateOperationsInput | number | null
    nguoiGhiNhan?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackCreateManyInput = {
    id?: string
    tenKhach?: string | null
    sdtKhach?: string | null
    sku?: string | null
    kenh?: string
    loai: string
    noiDung: string
    danhGia?: number | null
    nguoiGhiNhan?: string | null
    createdAt?: Date | string
  }

  export type FeedbackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    kenh?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    noiDung?: StringFieldUpdateOperationsInput | string
    danhGia?: NullableIntFieldUpdateOperationsInput | number | null
    nguoiGhiNhan?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeedbackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    kenh?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    noiDung?: StringFieldUpdateOperationsInput | string
    danhGia?: NullableIntFieldUpdateOperationsInput | number | null
    nguoiGhiNhan?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BuTienCreateInput = {
    id?: string
    tenKhach: string
    sdtKhach?: string | null
    loiBu: string
    soTien?: number
    trangThai?: string
    ghiChu?: string | null
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BuTienUncheckedCreateInput = {
    id?: string
    tenKhach: string
    sdtKhach?: string | null
    loiBu: string
    soTien?: number
    trangThai?: string
    ghiChu?: string | null
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BuTienUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: StringFieldUpdateOperationsInput | string
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    loiBu?: StringFieldUpdateOperationsInput | string
    soTien?: FloatFieldUpdateOperationsInput | number
    trangThai?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BuTienUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: StringFieldUpdateOperationsInput | string
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    loiBu?: StringFieldUpdateOperationsInput | string
    soTien?: FloatFieldUpdateOperationsInput | number
    trangThai?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BuTienCreateManyInput = {
    id?: string
    tenKhach: string
    sdtKhach?: string | null
    loiBu: string
    soTien?: number
    trangThai?: string
    ghiChu?: string | null
    nguoiXuLy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BuTienUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: StringFieldUpdateOperationsInput | string
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    loiBu?: StringFieldUpdateOperationsInput | string
    soTien?: FloatFieldUpdateOperationsInput | number
    trangThai?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BuTienUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenKhach?: StringFieldUpdateOperationsInput | string
    sdtKhach?: NullableStringFieldUpdateOperationsInput | string | null
    loiBu?: StringFieldUpdateOperationsInput | string
    soTien?: FloatFieldUpdateOperationsInput | number
    trangThai?: StringFieldUpdateOperationsInput | string
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiXuLy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCCreateInput = {
    id?: string
    ten: string
    platform: string
    follower?: number
    giaCast?: number
    linkProfile?: string | null
    sdt?: string | null
    email?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    bookings?: KOCBookingCreateNestedManyWithoutKocInput
  }

  export type KOCUncheckedCreateInput = {
    id?: string
    ten: string
    platform: string
    follower?: number
    giaCast?: number
    linkProfile?: string | null
    sdt?: string | null
    email?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    bookings?: KOCBookingUncheckedCreateNestedManyWithoutKocInput
  }

  export type KOCUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: KOCBookingUpdateManyWithoutKocNestedInput
  }

  export type KOCUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: KOCBookingUncheckedUpdateManyWithoutKocNestedInput
  }

  export type KOCCreateManyInput = {
    id?: string
    ten: string
    platform: string
    follower?: number
    giaCast?: number
    linkProfile?: string | null
    sdt?: string | null
    email?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type KOCUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoCatCreateInput = {
    id?: string
    ngay: Date | string
    hangCat: string
    soSize?: string | null
    maVai?: string | null
    soMSoDo?: number | null
    soCay?: number
    cayData?: string | null
    soY?: number | null
    soM?: number | null
    tongSize?: number | null
    soLa?: number | null
    soLaThucTe?: number | null
    soSanPham?: number | null
    hangThucTe?: number | null
    soLuongThieu?: number | null
    xuongNhanHang?: string | null
    trangThai?: string
    xuong?: string
    hdMay?: number | null
    tonTruocMay?: number | null
    hdMayDa?: boolean
    coGiat?: string | null
    hdGiatViSinh?: number | null
    tonTruocGiatViSinh?: number | null
    hdGiatViSinhDa?: boolean
    hdGiatMau?: number | null
    tonTruocGiatMau?: number | null
    hdGiatMauDa?: boolean
    ghiChuMay?: string | null
    mauGiat?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LoCatUncheckedCreateInput = {
    id?: string
    ngay: Date | string
    hangCat: string
    soSize?: string | null
    maVai?: string | null
    soMSoDo?: number | null
    soCay?: number
    cayData?: string | null
    soY?: number | null
    soM?: number | null
    tongSize?: number | null
    soLa?: number | null
    soLaThucTe?: number | null
    soSanPham?: number | null
    hangThucTe?: number | null
    soLuongThieu?: number | null
    xuongNhanHang?: string | null
    trangThai?: string
    xuong?: string
    hdMay?: number | null
    tonTruocMay?: number | null
    hdMayDa?: boolean
    coGiat?: string | null
    hdGiatViSinh?: number | null
    tonTruocGiatViSinh?: number | null
    hdGiatViSinhDa?: boolean
    hdGiatMau?: number | null
    tonTruocGiatMau?: number | null
    hdGiatMauDa?: boolean
    ghiChuMay?: string | null
    mauGiat?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LoCatUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ngay?: DateTimeFieldUpdateOperationsInput | Date | string
    hangCat?: StringFieldUpdateOperationsInput | string
    soSize?: NullableStringFieldUpdateOperationsInput | string | null
    maVai?: NullableStringFieldUpdateOperationsInput | string | null
    soMSoDo?: NullableFloatFieldUpdateOperationsInput | number | null
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    soY?: NullableFloatFieldUpdateOperationsInput | number | null
    soM?: NullableFloatFieldUpdateOperationsInput | number | null
    tongSize?: NullableIntFieldUpdateOperationsInput | number | null
    soLa?: NullableFloatFieldUpdateOperationsInput | number | null
    soLaThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soSanPham?: NullableIntFieldUpdateOperationsInput | number | null
    hangThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soLuongThieu?: NullableIntFieldUpdateOperationsInput | number | null
    xuongNhanHang?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    xuong?: StringFieldUpdateOperationsInput | string
    hdMay?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocMay?: NullableFloatFieldUpdateOperationsInput | number | null
    hdMayDa?: BoolFieldUpdateOperationsInput | boolean
    coGiat?: NullableStringFieldUpdateOperationsInput | string | null
    hdGiatViSinh?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatViSinh?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatViSinhDa?: BoolFieldUpdateOperationsInput | boolean
    hdGiatMau?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatMau?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatMauDa?: BoolFieldUpdateOperationsInput | boolean
    ghiChuMay?: NullableStringFieldUpdateOperationsInput | string | null
    mauGiat?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoCatUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ngay?: DateTimeFieldUpdateOperationsInput | Date | string
    hangCat?: StringFieldUpdateOperationsInput | string
    soSize?: NullableStringFieldUpdateOperationsInput | string | null
    maVai?: NullableStringFieldUpdateOperationsInput | string | null
    soMSoDo?: NullableFloatFieldUpdateOperationsInput | number | null
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    soY?: NullableFloatFieldUpdateOperationsInput | number | null
    soM?: NullableFloatFieldUpdateOperationsInput | number | null
    tongSize?: NullableIntFieldUpdateOperationsInput | number | null
    soLa?: NullableFloatFieldUpdateOperationsInput | number | null
    soLaThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soSanPham?: NullableIntFieldUpdateOperationsInput | number | null
    hangThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soLuongThieu?: NullableIntFieldUpdateOperationsInput | number | null
    xuongNhanHang?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    xuong?: StringFieldUpdateOperationsInput | string
    hdMay?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocMay?: NullableFloatFieldUpdateOperationsInput | number | null
    hdMayDa?: BoolFieldUpdateOperationsInput | boolean
    coGiat?: NullableStringFieldUpdateOperationsInput | string | null
    hdGiatViSinh?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatViSinh?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatViSinhDa?: BoolFieldUpdateOperationsInput | boolean
    hdGiatMau?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatMau?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatMauDa?: BoolFieldUpdateOperationsInput | boolean
    ghiChuMay?: NullableStringFieldUpdateOperationsInput | string | null
    mauGiat?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoCatCreateManyInput = {
    id?: string
    ngay: Date | string
    hangCat: string
    soSize?: string | null
    maVai?: string | null
    soMSoDo?: number | null
    soCay?: number
    cayData?: string | null
    soY?: number | null
    soM?: number | null
    tongSize?: number | null
    soLa?: number | null
    soLaThucTe?: number | null
    soSanPham?: number | null
    hangThucTe?: number | null
    soLuongThieu?: number | null
    xuongNhanHang?: string | null
    trangThai?: string
    xuong?: string
    hdMay?: number | null
    tonTruocMay?: number | null
    hdMayDa?: boolean
    coGiat?: string | null
    hdGiatViSinh?: number | null
    tonTruocGiatViSinh?: number | null
    hdGiatViSinhDa?: boolean
    hdGiatMau?: number | null
    tonTruocGiatMau?: number | null
    hdGiatMauDa?: boolean
    ghiChuMay?: string | null
    mauGiat?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LoCatUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ngay?: DateTimeFieldUpdateOperationsInput | Date | string
    hangCat?: StringFieldUpdateOperationsInput | string
    soSize?: NullableStringFieldUpdateOperationsInput | string | null
    maVai?: NullableStringFieldUpdateOperationsInput | string | null
    soMSoDo?: NullableFloatFieldUpdateOperationsInput | number | null
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    soY?: NullableFloatFieldUpdateOperationsInput | number | null
    soM?: NullableFloatFieldUpdateOperationsInput | number | null
    tongSize?: NullableIntFieldUpdateOperationsInput | number | null
    soLa?: NullableFloatFieldUpdateOperationsInput | number | null
    soLaThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soSanPham?: NullableIntFieldUpdateOperationsInput | number | null
    hangThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soLuongThieu?: NullableIntFieldUpdateOperationsInput | number | null
    xuongNhanHang?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    xuong?: StringFieldUpdateOperationsInput | string
    hdMay?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocMay?: NullableFloatFieldUpdateOperationsInput | number | null
    hdMayDa?: BoolFieldUpdateOperationsInput | boolean
    coGiat?: NullableStringFieldUpdateOperationsInput | string | null
    hdGiatViSinh?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatViSinh?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatViSinhDa?: BoolFieldUpdateOperationsInput | boolean
    hdGiatMau?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatMau?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatMauDa?: BoolFieldUpdateOperationsInput | boolean
    ghiChuMay?: NullableStringFieldUpdateOperationsInput | string | null
    mauGiat?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoCatUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ngay?: DateTimeFieldUpdateOperationsInput | Date | string
    hangCat?: StringFieldUpdateOperationsInput | string
    soSize?: NullableStringFieldUpdateOperationsInput | string | null
    maVai?: NullableStringFieldUpdateOperationsInput | string | null
    soMSoDo?: NullableFloatFieldUpdateOperationsInput | number | null
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    soY?: NullableFloatFieldUpdateOperationsInput | number | null
    soM?: NullableFloatFieldUpdateOperationsInput | number | null
    tongSize?: NullableIntFieldUpdateOperationsInput | number | null
    soLa?: NullableFloatFieldUpdateOperationsInput | number | null
    soLaThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soSanPham?: NullableIntFieldUpdateOperationsInput | number | null
    hangThucTe?: NullableIntFieldUpdateOperationsInput | number | null
    soLuongThieu?: NullableIntFieldUpdateOperationsInput | number | null
    xuongNhanHang?: NullableStringFieldUpdateOperationsInput | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    xuong?: StringFieldUpdateOperationsInput | string
    hdMay?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocMay?: NullableFloatFieldUpdateOperationsInput | number | null
    hdMayDa?: BoolFieldUpdateOperationsInput | boolean
    coGiat?: NullableStringFieldUpdateOperationsInput | string | null
    hdGiatViSinh?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatViSinh?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatViSinhDa?: BoolFieldUpdateOperationsInput | boolean
    hdGiatMau?: NullableIntFieldUpdateOperationsInput | number | null
    tonTruocGiatMau?: NullableFloatFieldUpdateOperationsInput | number | null
    hdGiatMauDa?: BoolFieldUpdateOperationsInput | boolean
    ghiChuMay?: NullableStringFieldUpdateOperationsInput | string | null
    mauGiat?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VaiTonCreateInput = {
    id?: string
    maVai: string
    soMet?: number
    soCay?: number
    cayData?: string | null
    donVi?: string
    mauSac?: string | null
    xuong?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VaiTonUncheckedCreateInput = {
    id?: string
    maVai: string
    soMet?: number
    soCay?: number
    cayData?: string | null
    donVi?: string
    mauSac?: string | null
    xuong?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VaiTonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    maVai?: StringFieldUpdateOperationsInput | string
    soMet?: FloatFieldUpdateOperationsInput | number
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    donVi?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    xuong?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VaiTonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    maVai?: StringFieldUpdateOperationsInput | string
    soMet?: FloatFieldUpdateOperationsInput | number
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    donVi?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    xuong?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VaiTonCreateManyInput = {
    id?: string
    maVai: string
    soMet?: number
    soCay?: number
    cayData?: string | null
    donVi?: string
    mauSac?: string | null
    xuong?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VaiTonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    maVai?: StringFieldUpdateOperationsInput | string
    soMet?: FloatFieldUpdateOperationsInput | number
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    donVi?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    xuong?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VaiTonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    maVai?: StringFieldUpdateOperationsInput | string
    soMet?: FloatFieldUpdateOperationsInput | number
    soCay?: IntFieldUpdateOperationsInput | number
    cayData?: NullableStringFieldUpdateOperationsInput | string | null
    donVi?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    xuong?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonHistoryCreateInput = {
    id?: string
    loaiHD: string
    soTonCu: number
    soTonMoi: number
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type HoaDonTonHistoryUncheckedCreateInput = {
    id?: string
    loaiHD: string
    soTonCu: number
    soTonMoi: number
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type HoaDonTonHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    loaiHD?: StringFieldUpdateOperationsInput | string
    soTonCu?: FloatFieldUpdateOperationsInput | number
    soTonMoi?: FloatFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    loaiHD?: StringFieldUpdateOperationsInput | string
    soTonCu?: FloatFieldUpdateOperationsInput | number
    soTonMoi?: FloatFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonHistoryCreateManyInput = {
    id?: string
    loaiHD: string
    soTonCu: number
    soTonMoi: number
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type HoaDonTonHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    loaiHD?: StringFieldUpdateOperationsInput | string
    soTonCu?: FloatFieldUpdateOperationsInput | number
    soTonMoi?: FloatFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    loaiHD?: StringFieldUpdateOperationsInput | string
    soTonCu?: FloatFieldUpdateOperationsInput | number
    soTonMoi?: FloatFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingCreateInput = {
    id?: string
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    koc: KOCCreateNestedOneWithoutBookingsInput
    sanPham?: SanPhamCreateNestedOneWithoutKocBookingsInput
  }

  export type KOCBookingUncheckedCreateInput = {
    id?: string
    kocId: string
    sanPhamId?: string | null
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KOCBookingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    koc?: KOCUpdateOneRequiredWithoutBookingsNestedInput
    sanPham?: SanPhamUpdateOneWithoutKocBookingsNestedInput
  }

  export type KOCBookingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kocId?: StringFieldUpdateOperationsInput | string
    sanPhamId?: NullableStringFieldUpdateOperationsInput | string | null
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingCreateManyInput = {
    id?: string
    kocId: string
    sanPhamId?: string | null
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KOCBookingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    kocId?: StringFieldUpdateOperationsInput | string
    sanPhamId?: NullableStringFieldUpdateOperationsInput | string | null
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonCreateInput = {
    id: string
    soTon?: number
    updatedAt?: Date | string
  }

  export type HoaDonTonUncheckedCreateInput = {
    id: string
    soTon?: number
    updatedAt?: Date | string
  }

  export type HoaDonTonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    soTon?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    soTon?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonCreateManyInput = {
    id: string
    soTon?: number
    updatedAt?: Date | string
  }

  export type HoaDonTonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    soTon?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoaDonTonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    soTon?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NhapXuatKhoListRelationFilter = {
    every?: NhapXuatKhoWhereInput
    some?: NhapXuatKhoWhereInput
    none?: NhapXuatKhoWhereInput
  }

  export type KOCBookingListRelationFilter = {
    every?: KOCBookingWhereInput
    some?: KOCBookingWhereInput
    none?: KOCBookingWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type NhapXuatKhoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KOCBookingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SanPhamCountOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    sku?: SortOrder
    mauSac?: SortOrder
    size?: SortOrder
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
    nguon?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SanPhamAvgOrderByAggregateInput = {
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
  }

  export type SanPhamMaxOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    sku?: SortOrder
    mauSac?: SortOrder
    size?: SortOrder
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
    nguon?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SanPhamMinOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    sku?: SortOrder
    mauSac?: SortOrder
    size?: SortOrder
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
    nguon?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SanPhamSumOrderByAggregateInput = {
    giaNhap?: SortOrder
    giaBan?: SortOrder
    tonKho?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SanPhamScalarRelationFilter = {
    is?: SanPhamWhereInput
    isNot?: SanPhamWhereInput
  }

  export type NhapXuatKhoCountOrderByAggregateInput = {
    id?: SortOrder
    sanPhamId?: SortOrder
    loai?: SortOrder
    soLuong?: SortOrder
    ghiChu?: SortOrder
    nguoiTao?: SortOrder
    createdAt?: SortOrder
  }

  export type NhapXuatKhoAvgOrderByAggregateInput = {
    soLuong?: SortOrder
  }

  export type NhapXuatKhoMaxOrderByAggregateInput = {
    id?: SortOrder
    sanPhamId?: SortOrder
    loai?: SortOrder
    soLuong?: SortOrder
    ghiChu?: SortOrder
    nguoiTao?: SortOrder
    createdAt?: SortOrder
  }

  export type NhapXuatKhoMinOrderByAggregateInput = {
    id?: SortOrder
    sanPhamId?: SortOrder
    loai?: SortOrder
    soLuong?: SortOrder
    ghiChu?: SortOrder
    nguoiTao?: SortOrder
    createdAt?: SortOrder
  }

  export type NhapXuatKhoSumOrderByAggregateInput = {
    soLuong?: SortOrder
  }

  export type DoiTraCountOrderByAggregateInput = {
    id?: SortOrder
    maDoiTra?: SortOrder
    sdtThangTruoc?: SortOrder
    sdtHienTai?: SortOrder
    tenKhach?: SortOrder
    diaChi?: SortOrder
    skuHienTai?: SortOrder
    skuDoiSang?: SortOrder
    giaTriHang?: SortOrder
    loaiVanDe?: SortOrder
    ghiChu?: SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
    maVanDon?: SortOrder
    trangThai?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DoiTraAvgOrderByAggregateInput = {
    giaTriHang?: SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
  }

  export type DoiTraMaxOrderByAggregateInput = {
    id?: SortOrder
    maDoiTra?: SortOrder
    sdtThangTruoc?: SortOrder
    sdtHienTai?: SortOrder
    tenKhach?: SortOrder
    diaChi?: SortOrder
    skuHienTai?: SortOrder
    skuDoiSang?: SortOrder
    giaTriHang?: SortOrder
    loaiVanDe?: SortOrder
    ghiChu?: SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
    maVanDon?: SortOrder
    trangThai?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DoiTraMinOrderByAggregateInput = {
    id?: SortOrder
    maDoiTra?: SortOrder
    sdtThangTruoc?: SortOrder
    sdtHienTai?: SortOrder
    tenKhach?: SortOrder
    diaChi?: SortOrder
    skuHienTai?: SortOrder
    skuDoiSang?: SortOrder
    giaTriHang?: SortOrder
    loaiVanDe?: SortOrder
    ghiChu?: SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
    maVanDon?: SortOrder
    trangThai?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DoiTraSumOrderByAggregateInput = {
    giaTriHang?: SortOrder
    phiShip?: SortOrder
    soChieuShip?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FeedbackCountOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    sku?: SortOrder
    kenh?: SortOrder
    loai?: SortOrder
    noiDung?: SortOrder
    danhGia?: SortOrder
    nguoiGhiNhan?: SortOrder
    createdAt?: SortOrder
  }

  export type FeedbackAvgOrderByAggregateInput = {
    danhGia?: SortOrder
  }

  export type FeedbackMaxOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    sku?: SortOrder
    kenh?: SortOrder
    loai?: SortOrder
    noiDung?: SortOrder
    danhGia?: SortOrder
    nguoiGhiNhan?: SortOrder
    createdAt?: SortOrder
  }

  export type FeedbackMinOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    sku?: SortOrder
    kenh?: SortOrder
    loai?: SortOrder
    noiDung?: SortOrder
    danhGia?: SortOrder
    nguoiGhiNhan?: SortOrder
    createdAt?: SortOrder
  }

  export type FeedbackSumOrderByAggregateInput = {
    danhGia?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BuTienCountOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    loiBu?: SortOrder
    soTien?: SortOrder
    trangThai?: SortOrder
    ghiChu?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BuTienAvgOrderByAggregateInput = {
    soTien?: SortOrder
  }

  export type BuTienMaxOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    loiBu?: SortOrder
    soTien?: SortOrder
    trangThai?: SortOrder
    ghiChu?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BuTienMinOrderByAggregateInput = {
    id?: SortOrder
    tenKhach?: SortOrder
    sdtKhach?: SortOrder
    loiBu?: SortOrder
    soTien?: SortOrder
    trangThai?: SortOrder
    ghiChu?: SortOrder
    nguoiXuLy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BuTienSumOrderByAggregateInput = {
    soTien?: SortOrder
  }

  export type KOCCountOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    platform?: SortOrder
    follower?: SortOrder
    giaCast?: SortOrder
    linkProfile?: SortOrder
    sdt?: SortOrder
    email?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type KOCAvgOrderByAggregateInput = {
    follower?: SortOrder
    giaCast?: SortOrder
  }

  export type KOCMaxOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    platform?: SortOrder
    follower?: SortOrder
    giaCast?: SortOrder
    linkProfile?: SortOrder
    sdt?: SortOrder
    email?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type KOCMinOrderByAggregateInput = {
    id?: SortOrder
    ten?: SortOrder
    platform?: SortOrder
    follower?: SortOrder
    giaCast?: SortOrder
    linkProfile?: SortOrder
    sdt?: SortOrder
    email?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type KOCSumOrderByAggregateInput = {
    follower?: SortOrder
    giaCast?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type LoCatCountOrderByAggregateInput = {
    id?: SortOrder
    ngay?: SortOrder
    hangCat?: SortOrder
    soSize?: SortOrder
    maVai?: SortOrder
    soMSoDo?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    soY?: SortOrder
    soM?: SortOrder
    tongSize?: SortOrder
    soLa?: SortOrder
    soLaThucTe?: SortOrder
    soSanPham?: SortOrder
    hangThucTe?: SortOrder
    soLuongThieu?: SortOrder
    xuongNhanHang?: SortOrder
    trangThai?: SortOrder
    xuong?: SortOrder
    hdMay?: SortOrder
    tonTruocMay?: SortOrder
    hdMayDa?: SortOrder
    coGiat?: SortOrder
    hdGiatViSinh?: SortOrder
    tonTruocGiatViSinh?: SortOrder
    hdGiatViSinhDa?: SortOrder
    hdGiatMau?: SortOrder
    tonTruocGiatMau?: SortOrder
    hdGiatMauDa?: SortOrder
    ghiChuMay?: SortOrder
    mauGiat?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LoCatAvgOrderByAggregateInput = {
    soMSoDo?: SortOrder
    soCay?: SortOrder
    soY?: SortOrder
    soM?: SortOrder
    tongSize?: SortOrder
    soLa?: SortOrder
    soLaThucTe?: SortOrder
    soSanPham?: SortOrder
    hangThucTe?: SortOrder
    soLuongThieu?: SortOrder
    hdMay?: SortOrder
    tonTruocMay?: SortOrder
    hdGiatViSinh?: SortOrder
    tonTruocGiatViSinh?: SortOrder
    hdGiatMau?: SortOrder
    tonTruocGiatMau?: SortOrder
  }

  export type LoCatMaxOrderByAggregateInput = {
    id?: SortOrder
    ngay?: SortOrder
    hangCat?: SortOrder
    soSize?: SortOrder
    maVai?: SortOrder
    soMSoDo?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    soY?: SortOrder
    soM?: SortOrder
    tongSize?: SortOrder
    soLa?: SortOrder
    soLaThucTe?: SortOrder
    soSanPham?: SortOrder
    hangThucTe?: SortOrder
    soLuongThieu?: SortOrder
    xuongNhanHang?: SortOrder
    trangThai?: SortOrder
    xuong?: SortOrder
    hdMay?: SortOrder
    tonTruocMay?: SortOrder
    hdMayDa?: SortOrder
    coGiat?: SortOrder
    hdGiatViSinh?: SortOrder
    tonTruocGiatViSinh?: SortOrder
    hdGiatViSinhDa?: SortOrder
    hdGiatMau?: SortOrder
    tonTruocGiatMau?: SortOrder
    hdGiatMauDa?: SortOrder
    ghiChuMay?: SortOrder
    mauGiat?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LoCatMinOrderByAggregateInput = {
    id?: SortOrder
    ngay?: SortOrder
    hangCat?: SortOrder
    soSize?: SortOrder
    maVai?: SortOrder
    soMSoDo?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    soY?: SortOrder
    soM?: SortOrder
    tongSize?: SortOrder
    soLa?: SortOrder
    soLaThucTe?: SortOrder
    soSanPham?: SortOrder
    hangThucTe?: SortOrder
    soLuongThieu?: SortOrder
    xuongNhanHang?: SortOrder
    trangThai?: SortOrder
    xuong?: SortOrder
    hdMay?: SortOrder
    tonTruocMay?: SortOrder
    hdMayDa?: SortOrder
    coGiat?: SortOrder
    hdGiatViSinh?: SortOrder
    tonTruocGiatViSinh?: SortOrder
    hdGiatViSinhDa?: SortOrder
    hdGiatMau?: SortOrder
    tonTruocGiatMau?: SortOrder
    hdGiatMauDa?: SortOrder
    ghiChuMay?: SortOrder
    mauGiat?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LoCatSumOrderByAggregateInput = {
    soMSoDo?: SortOrder
    soCay?: SortOrder
    soY?: SortOrder
    soM?: SortOrder
    tongSize?: SortOrder
    soLa?: SortOrder
    soLaThucTe?: SortOrder
    soSanPham?: SortOrder
    hangThucTe?: SortOrder
    soLuongThieu?: SortOrder
    hdMay?: SortOrder
    tonTruocMay?: SortOrder
    hdGiatViSinh?: SortOrder
    tonTruocGiatViSinh?: SortOrder
    hdGiatMau?: SortOrder
    tonTruocGiatMau?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type VaiTonCountOrderByAggregateInput = {
    id?: SortOrder
    maVai?: SortOrder
    soMet?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    donVi?: SortOrder
    mauSac?: SortOrder
    xuong?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VaiTonAvgOrderByAggregateInput = {
    soMet?: SortOrder
    soCay?: SortOrder
  }

  export type VaiTonMaxOrderByAggregateInput = {
    id?: SortOrder
    maVai?: SortOrder
    soMet?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    donVi?: SortOrder
    mauSac?: SortOrder
    xuong?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VaiTonMinOrderByAggregateInput = {
    id?: SortOrder
    maVai?: SortOrder
    soMet?: SortOrder
    soCay?: SortOrder
    cayData?: SortOrder
    donVi?: SortOrder
    mauSac?: SortOrder
    xuong?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VaiTonSumOrderByAggregateInput = {
    soMet?: SortOrder
    soCay?: SortOrder
  }

  export type HoaDonTonHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    loaiHD?: SortOrder
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type HoaDonTonHistoryAvgOrderByAggregateInput = {
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
  }

  export type HoaDonTonHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    loaiHD?: SortOrder
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type HoaDonTonHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    loaiHD?: SortOrder
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
  }

  export type HoaDonTonHistorySumOrderByAggregateInput = {
    soTonCu?: SortOrder
    soTonMoi?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type KOCScalarRelationFilter = {
    is?: KOCWhereInput
    isNot?: KOCWhereInput
  }

  export type SanPhamNullableScalarRelationFilter = {
    is?: SanPhamWhereInput | null
    isNot?: SanPhamWhereInput | null
  }

  export type KOCBookingCountOrderByAggregateInput = {
    id?: SortOrder
    kocId?: SortOrder
    sanPhamId?: SortOrder
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    ngayBat?: SortOrder
    ngayKet?: SortOrder
    trangThai?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KOCBookingAvgOrderByAggregateInput = {
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
  }

  export type KOCBookingMaxOrderByAggregateInput = {
    id?: SortOrder
    kocId?: SortOrder
    sanPhamId?: SortOrder
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    ngayBat?: SortOrder
    ngayKet?: SortOrder
    trangThai?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KOCBookingMinOrderByAggregateInput = {
    id?: SortOrder
    kocId?: SortOrder
    sanPhamId?: SortOrder
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    ngayBat?: SortOrder
    ngayKet?: SortOrder
    trangThai?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
    ghiChu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KOCBookingSumOrderByAggregateInput = {
    soLuongGui?: SortOrder
    chiPhiCast?: SortOrder
    chiPhiSP?: SortOrder
    chiPhi?: SortOrder
    doanhThu?: SortOrder
    donHang?: SortOrder
    luotXem?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type HoaDonTonCountOrderByAggregateInput = {
    id?: SortOrder
    soTon?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoaDonTonAvgOrderByAggregateInput = {
    soTon?: SortOrder
  }

  export type HoaDonTonMaxOrderByAggregateInput = {
    id?: SortOrder
    soTon?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoaDonTonMinOrderByAggregateInput = {
    id?: SortOrder
    soTon?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoaDonTonSumOrderByAggregateInput = {
    soTon?: SortOrder
  }

  export type NhapXuatKhoCreateNestedManyWithoutSanPhamInput = {
    create?: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput> | NhapXuatKhoCreateWithoutSanPhamInput[] | NhapXuatKhoUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: NhapXuatKhoCreateOrConnectWithoutSanPhamInput | NhapXuatKhoCreateOrConnectWithoutSanPhamInput[]
    createMany?: NhapXuatKhoCreateManySanPhamInputEnvelope
    connect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
  }

  export type KOCBookingCreateNestedManyWithoutSanPhamInput = {
    create?: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput> | KOCBookingCreateWithoutSanPhamInput[] | KOCBookingUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutSanPhamInput | KOCBookingCreateOrConnectWithoutSanPhamInput[]
    createMany?: KOCBookingCreateManySanPhamInputEnvelope
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
  }

  export type NhapXuatKhoUncheckedCreateNestedManyWithoutSanPhamInput = {
    create?: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput> | NhapXuatKhoCreateWithoutSanPhamInput[] | NhapXuatKhoUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: NhapXuatKhoCreateOrConnectWithoutSanPhamInput | NhapXuatKhoCreateOrConnectWithoutSanPhamInput[]
    createMany?: NhapXuatKhoCreateManySanPhamInputEnvelope
    connect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
  }

  export type KOCBookingUncheckedCreateNestedManyWithoutSanPhamInput = {
    create?: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput> | KOCBookingCreateWithoutSanPhamInput[] | KOCBookingUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutSanPhamInput | KOCBookingCreateOrConnectWithoutSanPhamInput[]
    createMany?: KOCBookingCreateManySanPhamInputEnvelope
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NhapXuatKhoUpdateManyWithoutSanPhamNestedInput = {
    create?: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput> | NhapXuatKhoCreateWithoutSanPhamInput[] | NhapXuatKhoUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: NhapXuatKhoCreateOrConnectWithoutSanPhamInput | NhapXuatKhoCreateOrConnectWithoutSanPhamInput[]
    upsert?: NhapXuatKhoUpsertWithWhereUniqueWithoutSanPhamInput | NhapXuatKhoUpsertWithWhereUniqueWithoutSanPhamInput[]
    createMany?: NhapXuatKhoCreateManySanPhamInputEnvelope
    set?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    disconnect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    delete?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    connect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    update?: NhapXuatKhoUpdateWithWhereUniqueWithoutSanPhamInput | NhapXuatKhoUpdateWithWhereUniqueWithoutSanPhamInput[]
    updateMany?: NhapXuatKhoUpdateManyWithWhereWithoutSanPhamInput | NhapXuatKhoUpdateManyWithWhereWithoutSanPhamInput[]
    deleteMany?: NhapXuatKhoScalarWhereInput | NhapXuatKhoScalarWhereInput[]
  }

  export type KOCBookingUpdateManyWithoutSanPhamNestedInput = {
    create?: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput> | KOCBookingCreateWithoutSanPhamInput[] | KOCBookingUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutSanPhamInput | KOCBookingCreateOrConnectWithoutSanPhamInput[]
    upsert?: KOCBookingUpsertWithWhereUniqueWithoutSanPhamInput | KOCBookingUpsertWithWhereUniqueWithoutSanPhamInput[]
    createMany?: KOCBookingCreateManySanPhamInputEnvelope
    set?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    disconnect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    delete?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    update?: KOCBookingUpdateWithWhereUniqueWithoutSanPhamInput | KOCBookingUpdateWithWhereUniqueWithoutSanPhamInput[]
    updateMany?: KOCBookingUpdateManyWithWhereWithoutSanPhamInput | KOCBookingUpdateManyWithWhereWithoutSanPhamInput[]
    deleteMany?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
  }

  export type NhapXuatKhoUncheckedUpdateManyWithoutSanPhamNestedInput = {
    create?: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput> | NhapXuatKhoCreateWithoutSanPhamInput[] | NhapXuatKhoUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: NhapXuatKhoCreateOrConnectWithoutSanPhamInput | NhapXuatKhoCreateOrConnectWithoutSanPhamInput[]
    upsert?: NhapXuatKhoUpsertWithWhereUniqueWithoutSanPhamInput | NhapXuatKhoUpsertWithWhereUniqueWithoutSanPhamInput[]
    createMany?: NhapXuatKhoCreateManySanPhamInputEnvelope
    set?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    disconnect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    delete?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    connect?: NhapXuatKhoWhereUniqueInput | NhapXuatKhoWhereUniqueInput[]
    update?: NhapXuatKhoUpdateWithWhereUniqueWithoutSanPhamInput | NhapXuatKhoUpdateWithWhereUniqueWithoutSanPhamInput[]
    updateMany?: NhapXuatKhoUpdateManyWithWhereWithoutSanPhamInput | NhapXuatKhoUpdateManyWithWhereWithoutSanPhamInput[]
    deleteMany?: NhapXuatKhoScalarWhereInput | NhapXuatKhoScalarWhereInput[]
  }

  export type KOCBookingUncheckedUpdateManyWithoutSanPhamNestedInput = {
    create?: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput> | KOCBookingCreateWithoutSanPhamInput[] | KOCBookingUncheckedCreateWithoutSanPhamInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutSanPhamInput | KOCBookingCreateOrConnectWithoutSanPhamInput[]
    upsert?: KOCBookingUpsertWithWhereUniqueWithoutSanPhamInput | KOCBookingUpsertWithWhereUniqueWithoutSanPhamInput[]
    createMany?: KOCBookingCreateManySanPhamInputEnvelope
    set?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    disconnect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    delete?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    update?: KOCBookingUpdateWithWhereUniqueWithoutSanPhamInput | KOCBookingUpdateWithWhereUniqueWithoutSanPhamInput[]
    updateMany?: KOCBookingUpdateManyWithWhereWithoutSanPhamInput | KOCBookingUpdateManyWithWhereWithoutSanPhamInput[]
    deleteMany?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
  }

  export type SanPhamCreateNestedOneWithoutNhapXuatsInput = {
    create?: XOR<SanPhamCreateWithoutNhapXuatsInput, SanPhamUncheckedCreateWithoutNhapXuatsInput>
    connectOrCreate?: SanPhamCreateOrConnectWithoutNhapXuatsInput
    connect?: SanPhamWhereUniqueInput
  }

  export type SanPhamUpdateOneRequiredWithoutNhapXuatsNestedInput = {
    create?: XOR<SanPhamCreateWithoutNhapXuatsInput, SanPhamUncheckedCreateWithoutNhapXuatsInput>
    connectOrCreate?: SanPhamCreateOrConnectWithoutNhapXuatsInput
    upsert?: SanPhamUpsertWithoutNhapXuatsInput
    connect?: SanPhamWhereUniqueInput
    update?: XOR<XOR<SanPhamUpdateToOneWithWhereWithoutNhapXuatsInput, SanPhamUpdateWithoutNhapXuatsInput>, SanPhamUncheckedUpdateWithoutNhapXuatsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type KOCBookingCreateNestedManyWithoutKocInput = {
    create?: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput> | KOCBookingCreateWithoutKocInput[] | KOCBookingUncheckedCreateWithoutKocInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutKocInput | KOCBookingCreateOrConnectWithoutKocInput[]
    createMany?: KOCBookingCreateManyKocInputEnvelope
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
  }

  export type KOCBookingUncheckedCreateNestedManyWithoutKocInput = {
    create?: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput> | KOCBookingCreateWithoutKocInput[] | KOCBookingUncheckedCreateWithoutKocInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutKocInput | KOCBookingCreateOrConnectWithoutKocInput[]
    createMany?: KOCBookingCreateManyKocInputEnvelope
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
  }

  export type KOCBookingUpdateManyWithoutKocNestedInput = {
    create?: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput> | KOCBookingCreateWithoutKocInput[] | KOCBookingUncheckedCreateWithoutKocInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutKocInput | KOCBookingCreateOrConnectWithoutKocInput[]
    upsert?: KOCBookingUpsertWithWhereUniqueWithoutKocInput | KOCBookingUpsertWithWhereUniqueWithoutKocInput[]
    createMany?: KOCBookingCreateManyKocInputEnvelope
    set?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    disconnect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    delete?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    update?: KOCBookingUpdateWithWhereUniqueWithoutKocInput | KOCBookingUpdateWithWhereUniqueWithoutKocInput[]
    updateMany?: KOCBookingUpdateManyWithWhereWithoutKocInput | KOCBookingUpdateManyWithWhereWithoutKocInput[]
    deleteMany?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
  }

  export type KOCBookingUncheckedUpdateManyWithoutKocNestedInput = {
    create?: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput> | KOCBookingCreateWithoutKocInput[] | KOCBookingUncheckedCreateWithoutKocInput[]
    connectOrCreate?: KOCBookingCreateOrConnectWithoutKocInput | KOCBookingCreateOrConnectWithoutKocInput[]
    upsert?: KOCBookingUpsertWithWhereUniqueWithoutKocInput | KOCBookingUpsertWithWhereUniqueWithoutKocInput[]
    createMany?: KOCBookingCreateManyKocInputEnvelope
    set?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    disconnect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    delete?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    connect?: KOCBookingWhereUniqueInput | KOCBookingWhereUniqueInput[]
    update?: KOCBookingUpdateWithWhereUniqueWithoutKocInput | KOCBookingUpdateWithWhereUniqueWithoutKocInput[]
    updateMany?: KOCBookingUpdateManyWithWhereWithoutKocInput | KOCBookingUpdateManyWithWhereWithoutKocInput[]
    deleteMany?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type KOCCreateNestedOneWithoutBookingsInput = {
    create?: XOR<KOCCreateWithoutBookingsInput, KOCUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: KOCCreateOrConnectWithoutBookingsInput
    connect?: KOCWhereUniqueInput
  }

  export type SanPhamCreateNestedOneWithoutKocBookingsInput = {
    create?: XOR<SanPhamCreateWithoutKocBookingsInput, SanPhamUncheckedCreateWithoutKocBookingsInput>
    connectOrCreate?: SanPhamCreateOrConnectWithoutKocBookingsInput
    connect?: SanPhamWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type KOCUpdateOneRequiredWithoutBookingsNestedInput = {
    create?: XOR<KOCCreateWithoutBookingsInput, KOCUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: KOCCreateOrConnectWithoutBookingsInput
    upsert?: KOCUpsertWithoutBookingsInput
    connect?: KOCWhereUniqueInput
    update?: XOR<XOR<KOCUpdateToOneWithWhereWithoutBookingsInput, KOCUpdateWithoutBookingsInput>, KOCUncheckedUpdateWithoutBookingsInput>
  }

  export type SanPhamUpdateOneWithoutKocBookingsNestedInput = {
    create?: XOR<SanPhamCreateWithoutKocBookingsInput, SanPhamUncheckedCreateWithoutKocBookingsInput>
    connectOrCreate?: SanPhamCreateOrConnectWithoutKocBookingsInput
    upsert?: SanPhamUpsertWithoutKocBookingsInput
    disconnect?: SanPhamWhereInput | boolean
    delete?: SanPhamWhereInput | boolean
    connect?: SanPhamWhereUniqueInput
    update?: XOR<XOR<SanPhamUpdateToOneWithWhereWithoutKocBookingsInput, SanPhamUpdateWithoutKocBookingsInput>, SanPhamUncheckedUpdateWithoutKocBookingsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NhapXuatKhoCreateWithoutSanPhamInput = {
    id?: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
  }

  export type NhapXuatKhoUncheckedCreateWithoutSanPhamInput = {
    id?: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
  }

  export type NhapXuatKhoCreateOrConnectWithoutSanPhamInput = {
    where: NhapXuatKhoWhereUniqueInput
    create: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput>
  }

  export type NhapXuatKhoCreateManySanPhamInputEnvelope = {
    data: NhapXuatKhoCreateManySanPhamInput | NhapXuatKhoCreateManySanPhamInput[]
    skipDuplicates?: boolean
  }

  export type KOCBookingCreateWithoutSanPhamInput = {
    id?: string
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    koc: KOCCreateNestedOneWithoutBookingsInput
  }

  export type KOCBookingUncheckedCreateWithoutSanPhamInput = {
    id?: string
    kocId: string
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KOCBookingCreateOrConnectWithoutSanPhamInput = {
    where: KOCBookingWhereUniqueInput
    create: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput>
  }

  export type KOCBookingCreateManySanPhamInputEnvelope = {
    data: KOCBookingCreateManySanPhamInput | KOCBookingCreateManySanPhamInput[]
    skipDuplicates?: boolean
  }

  export type NhapXuatKhoUpsertWithWhereUniqueWithoutSanPhamInput = {
    where: NhapXuatKhoWhereUniqueInput
    update: XOR<NhapXuatKhoUpdateWithoutSanPhamInput, NhapXuatKhoUncheckedUpdateWithoutSanPhamInput>
    create: XOR<NhapXuatKhoCreateWithoutSanPhamInput, NhapXuatKhoUncheckedCreateWithoutSanPhamInput>
  }

  export type NhapXuatKhoUpdateWithWhereUniqueWithoutSanPhamInput = {
    where: NhapXuatKhoWhereUniqueInput
    data: XOR<NhapXuatKhoUpdateWithoutSanPhamInput, NhapXuatKhoUncheckedUpdateWithoutSanPhamInput>
  }

  export type NhapXuatKhoUpdateManyWithWhereWithoutSanPhamInput = {
    where: NhapXuatKhoScalarWhereInput
    data: XOR<NhapXuatKhoUpdateManyMutationInput, NhapXuatKhoUncheckedUpdateManyWithoutSanPhamInput>
  }

  export type NhapXuatKhoScalarWhereInput = {
    AND?: NhapXuatKhoScalarWhereInput | NhapXuatKhoScalarWhereInput[]
    OR?: NhapXuatKhoScalarWhereInput[]
    NOT?: NhapXuatKhoScalarWhereInput | NhapXuatKhoScalarWhereInput[]
    id?: StringFilter<"NhapXuatKho"> | string
    sanPhamId?: StringFilter<"NhapXuatKho"> | string
    loai?: StringFilter<"NhapXuatKho"> | string
    soLuong?: IntFilter<"NhapXuatKho"> | number
    ghiChu?: StringNullableFilter<"NhapXuatKho"> | string | null
    nguoiTao?: StringNullableFilter<"NhapXuatKho"> | string | null
    createdAt?: DateTimeFilter<"NhapXuatKho"> | Date | string
  }

  export type KOCBookingUpsertWithWhereUniqueWithoutSanPhamInput = {
    where: KOCBookingWhereUniqueInput
    update: XOR<KOCBookingUpdateWithoutSanPhamInput, KOCBookingUncheckedUpdateWithoutSanPhamInput>
    create: XOR<KOCBookingCreateWithoutSanPhamInput, KOCBookingUncheckedCreateWithoutSanPhamInput>
  }

  export type KOCBookingUpdateWithWhereUniqueWithoutSanPhamInput = {
    where: KOCBookingWhereUniqueInput
    data: XOR<KOCBookingUpdateWithoutSanPhamInput, KOCBookingUncheckedUpdateWithoutSanPhamInput>
  }

  export type KOCBookingUpdateManyWithWhereWithoutSanPhamInput = {
    where: KOCBookingScalarWhereInput
    data: XOR<KOCBookingUpdateManyMutationInput, KOCBookingUncheckedUpdateManyWithoutSanPhamInput>
  }

  export type KOCBookingScalarWhereInput = {
    AND?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
    OR?: KOCBookingScalarWhereInput[]
    NOT?: KOCBookingScalarWhereInput | KOCBookingScalarWhereInput[]
    id?: StringFilter<"KOCBooking"> | string
    kocId?: StringFilter<"KOCBooking"> | string
    sanPhamId?: StringNullableFilter<"KOCBooking"> | string | null
    soLuongGui?: IntFilter<"KOCBooking"> | number
    chiPhiCast?: FloatFilter<"KOCBooking"> | number
    chiPhiSP?: FloatFilter<"KOCBooking"> | number
    chiPhi?: FloatFilter<"KOCBooking"> | number
    ngayBat?: DateTimeFilter<"KOCBooking"> | Date | string
    ngayKet?: DateTimeNullableFilter<"KOCBooking"> | Date | string | null
    trangThai?: StringFilter<"KOCBooking"> | string
    doanhThu?: FloatFilter<"KOCBooking"> | number
    donHang?: IntFilter<"KOCBooking"> | number
    luotXem?: IntFilter<"KOCBooking"> | number
    ghiChu?: StringNullableFilter<"KOCBooking"> | string | null
    createdAt?: DateTimeFilter<"KOCBooking"> | Date | string
    updatedAt?: DateTimeFilter<"KOCBooking"> | Date | string
  }

  export type SanPhamCreateWithoutNhapXuatsInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    kocBookings?: KOCBookingCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamUncheckedCreateWithoutNhapXuatsInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    kocBookings?: KOCBookingUncheckedCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamCreateOrConnectWithoutNhapXuatsInput = {
    where: SanPhamWhereUniqueInput
    create: XOR<SanPhamCreateWithoutNhapXuatsInput, SanPhamUncheckedCreateWithoutNhapXuatsInput>
  }

  export type SanPhamUpsertWithoutNhapXuatsInput = {
    update: XOR<SanPhamUpdateWithoutNhapXuatsInput, SanPhamUncheckedUpdateWithoutNhapXuatsInput>
    create: XOR<SanPhamCreateWithoutNhapXuatsInput, SanPhamUncheckedCreateWithoutNhapXuatsInput>
    where?: SanPhamWhereInput
  }

  export type SanPhamUpdateToOneWithWhereWithoutNhapXuatsInput = {
    where?: SanPhamWhereInput
    data: XOR<SanPhamUpdateWithoutNhapXuatsInput, SanPhamUncheckedUpdateWithoutNhapXuatsInput>
  }

  export type SanPhamUpdateWithoutNhapXuatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    kocBookings?: KOCBookingUpdateManyWithoutSanPhamNestedInput
  }

  export type SanPhamUncheckedUpdateWithoutNhapXuatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    kocBookings?: KOCBookingUncheckedUpdateManyWithoutSanPhamNestedInput
  }

  export type KOCBookingCreateWithoutKocInput = {
    id?: string
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sanPham?: SanPhamCreateNestedOneWithoutKocBookingsInput
  }

  export type KOCBookingUncheckedCreateWithoutKocInput = {
    id?: string
    sanPhamId?: string | null
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KOCBookingCreateOrConnectWithoutKocInput = {
    where: KOCBookingWhereUniqueInput
    create: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput>
  }

  export type KOCBookingCreateManyKocInputEnvelope = {
    data: KOCBookingCreateManyKocInput | KOCBookingCreateManyKocInput[]
    skipDuplicates?: boolean
  }

  export type KOCBookingUpsertWithWhereUniqueWithoutKocInput = {
    where: KOCBookingWhereUniqueInput
    update: XOR<KOCBookingUpdateWithoutKocInput, KOCBookingUncheckedUpdateWithoutKocInput>
    create: XOR<KOCBookingCreateWithoutKocInput, KOCBookingUncheckedCreateWithoutKocInput>
  }

  export type KOCBookingUpdateWithWhereUniqueWithoutKocInput = {
    where: KOCBookingWhereUniqueInput
    data: XOR<KOCBookingUpdateWithoutKocInput, KOCBookingUncheckedUpdateWithoutKocInput>
  }

  export type KOCBookingUpdateManyWithWhereWithoutKocInput = {
    where: KOCBookingScalarWhereInput
    data: XOR<KOCBookingUpdateManyMutationInput, KOCBookingUncheckedUpdateManyWithoutKocInput>
  }

  export type KOCCreateWithoutBookingsInput = {
    id?: string
    ten: string
    platform: string
    follower?: number
    giaCast?: number
    linkProfile?: string | null
    sdt?: string | null
    email?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type KOCUncheckedCreateWithoutBookingsInput = {
    id?: string
    ten: string
    platform: string
    follower?: number
    giaCast?: number
    linkProfile?: string | null
    sdt?: string | null
    email?: string | null
    ghiChu?: string | null
    createdAt?: Date | string
  }

  export type KOCCreateOrConnectWithoutBookingsInput = {
    where: KOCWhereUniqueInput
    create: XOR<KOCCreateWithoutBookingsInput, KOCUncheckedCreateWithoutBookingsInput>
  }

  export type SanPhamCreateWithoutKocBookingsInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    nhapXuats?: NhapXuatKhoCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamUncheckedCreateWithoutKocBookingsInput = {
    id?: string
    ten: string
    sku: string
    mauSac?: string | null
    size?: string | null
    giaNhap?: number
    giaBan?: number
    tonKho?: number
    nguon?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    nhapXuats?: NhapXuatKhoUncheckedCreateNestedManyWithoutSanPhamInput
  }

  export type SanPhamCreateOrConnectWithoutKocBookingsInput = {
    where: SanPhamWhereUniqueInput
    create: XOR<SanPhamCreateWithoutKocBookingsInput, SanPhamUncheckedCreateWithoutKocBookingsInput>
  }

  export type KOCUpsertWithoutBookingsInput = {
    update: XOR<KOCUpdateWithoutBookingsInput, KOCUncheckedUpdateWithoutBookingsInput>
    create: XOR<KOCCreateWithoutBookingsInput, KOCUncheckedCreateWithoutBookingsInput>
    where?: KOCWhereInput
  }

  export type KOCUpdateToOneWithWhereWithoutBookingsInput = {
    where?: KOCWhereInput
    data: XOR<KOCUpdateWithoutBookingsInput, KOCUncheckedUpdateWithoutBookingsInput>
  }

  export type KOCUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    follower?: IntFieldUpdateOperationsInput | number
    giaCast?: FloatFieldUpdateOperationsInput | number
    linkProfile?: NullableStringFieldUpdateOperationsInput | string | null
    sdt?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SanPhamUpsertWithoutKocBookingsInput = {
    update: XOR<SanPhamUpdateWithoutKocBookingsInput, SanPhamUncheckedUpdateWithoutKocBookingsInput>
    create: XOR<SanPhamCreateWithoutKocBookingsInput, SanPhamUncheckedCreateWithoutKocBookingsInput>
    where?: SanPhamWhereInput
  }

  export type SanPhamUpdateToOneWithWhereWithoutKocBookingsInput = {
    where?: SanPhamWhereInput
    data: XOR<SanPhamUpdateWithoutKocBookingsInput, SanPhamUncheckedUpdateWithoutKocBookingsInput>
  }

  export type SanPhamUpdateWithoutKocBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    nhapXuats?: NhapXuatKhoUpdateManyWithoutSanPhamNestedInput
  }

  export type SanPhamUncheckedUpdateWithoutKocBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    mauSac?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableStringFieldUpdateOperationsInput | string | null
    giaNhap?: FloatFieldUpdateOperationsInput | number
    giaBan?: FloatFieldUpdateOperationsInput | number
    tonKho?: IntFieldUpdateOperationsInput | number
    nguon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    nhapXuats?: NhapXuatKhoUncheckedUpdateManyWithoutSanPhamNestedInput
  }

  export type NhapXuatKhoCreateManySanPhamInput = {
    id?: string
    loai: string
    soLuong: number
    ghiChu?: string | null
    nguoiTao?: string | null
    createdAt?: Date | string
  }

  export type KOCBookingCreateManySanPhamInput = {
    id?: string
    kocId: string
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NhapXuatKhoUpdateWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NhapXuatKhoUncheckedUpdateWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NhapXuatKhoUncheckedUpdateManyWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    loai?: StringFieldUpdateOperationsInput | string
    soLuong?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiTao?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingUpdateWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    koc?: KOCUpdateOneRequiredWithoutBookingsNestedInput
  }

  export type KOCBookingUncheckedUpdateWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    kocId?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingUncheckedUpdateManyWithoutSanPhamInput = {
    id?: StringFieldUpdateOperationsInput | string
    kocId?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingCreateManyKocInput = {
    id?: string
    sanPhamId?: string | null
    soLuongGui?: number
    chiPhiCast?: number
    chiPhiSP?: number
    chiPhi?: number
    ngayBat: Date | string
    ngayKet?: Date | string | null
    trangThai?: string
    doanhThu?: number
    donHang?: number
    luotXem?: number
    ghiChu?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KOCBookingUpdateWithoutKocInput = {
    id?: StringFieldUpdateOperationsInput | string
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sanPham?: SanPhamUpdateOneWithoutKocBookingsNestedInput
  }

  export type KOCBookingUncheckedUpdateWithoutKocInput = {
    id?: StringFieldUpdateOperationsInput | string
    sanPhamId?: NullableStringFieldUpdateOperationsInput | string | null
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KOCBookingUncheckedUpdateManyWithoutKocInput = {
    id?: StringFieldUpdateOperationsInput | string
    sanPhamId?: NullableStringFieldUpdateOperationsInput | string | null
    soLuongGui?: IntFieldUpdateOperationsInput | number
    chiPhiCast?: FloatFieldUpdateOperationsInput | number
    chiPhiSP?: FloatFieldUpdateOperationsInput | number
    chiPhi?: FloatFieldUpdateOperationsInput | number
    ngayBat?: DateTimeFieldUpdateOperationsInput | Date | string
    ngayKet?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trangThai?: StringFieldUpdateOperationsInput | string
    doanhThu?: FloatFieldUpdateOperationsInput | number
    donHang?: IntFieldUpdateOperationsInput | number
    luotXem?: IntFieldUpdateOperationsInput | number
    ghiChu?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}