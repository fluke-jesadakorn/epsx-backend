import { PaginationResult } from '@financial/types';

export function Paginate() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (!result || typeof result !== 'object') {
        throw new Error('Paginate decorator can only be used with pagination results');
      }

      if (!('data' in result && 'metadata' in result)) {
        throw new Error('Result must contain data and metadata properties');
      }

      return result as PaginationResult<any>;
    };

    return descriptor;
  };
}
