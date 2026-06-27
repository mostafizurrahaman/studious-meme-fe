export * from './user';
export * from './meta';
export * from './news';
export * from './category';
export * from './social';
export * from './contact';

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
