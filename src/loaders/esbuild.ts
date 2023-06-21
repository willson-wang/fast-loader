import path from 'path'
import { transform as defaultTransform, TransformOptions } from 'esbuild'
import {
  getTsconfig,
	parseTsconfig,
	createFilesMatcher,
	TsConfigResult,
	FileMatcher,
  // @ts-ignore
} from 'get-tsconfig';

import TransfromType from './base'
import { EsbuildFormatOptions, EsbuildTransformOptions } from './type'

let foundTsconfig: TsConfigResult | null;
let fileMatcher: FileMatcher;

class EsbuildTransfrom extends TransfromType {
  constructor() {
    super()
  }

  async formatOptions({
    loaderOptions,
    loaderContext,
  }: EsbuildFormatOptions): Promise<TransformOptions | undefined> {
    const {
      implementation,
      tsconfig,
      ...esbuildTransformOptions
    } = loaderOptions;

    if (implementation && typeof implementation.transform !== 'function') {
      throw new TypeError(
        `fast-loader: options.implementation.transform must be an ESBuild transform function. Received ${typeof implementation.transform}`,
      )
    }


    const transformOptions = {
      ...esbuildTransformOptions,
      target: loaderOptions.target ?? 'es2015',
      loader: loaderOptions.loader ?? 'default',
      sourcemap: loaderContext.sourceMap,
      sourcefile: loaderContext.resourcePath,
    };

    if (!('tsconfigRaw' in transformOptions)) {
      if (!fileMatcher) {
        const tsconfigPath = tsconfig && path.resolve(tsconfig);
        foundTsconfig = (
          tsconfigPath
            ? {
              config: parseTsconfig(tsconfigPath),
              path: tsconfigPath,
            }
            : getTsconfig()
        );
        if (foundTsconfig) {
          fileMatcher = createFilesMatcher(foundTsconfig);
        }
      }

      if (fileMatcher) {
        transformOptions.tsconfigRaw = fileMatcher(
          // Doesn't include query
          loaderContext.resourcePath,
        ) as TransformOptions['tsconfigRaw'];
      }
    }

    return transformOptions
  }

  async transform({transformOptions, loaderOptions, source}: EsbuildTransformOptions): Promise<{
    code: string | null | undefined;
    map?: string | null
  }> {
    const { implementation } = loaderOptions
    const transform = implementation?.transform ?? defaultTransform;
    const { code, map } = await transform(source, transformOptions)
    return {
      code,
      map: map && JSON.parse(map)
    }
  }
}

export default EsbuildTransfrom
