import swc, { Options } from '@swc/core';
import TransfromType from './base'

import { SwcFormatOptions, SwcTransformOptions } from './type'


class SwcTransfrom extends TransfromType {
  constructor() {
    super()
  }

  async formatOptions({
    loaderOptions,
    inputSourceMap,
    loaderContext
  }: SwcFormatOptions): Promise<Options> {
    if (
        Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMap") &&
        !Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMaps")
    ) {
        loaderOptions = Object.assign({}, loaderOptions, {
            sourceMaps: loaderOptions.sourceMap,
        });
        delete loaderOptions.sourceMap;
    }

    if (inputSourceMap && typeof inputSourceMap === "object") {
      inputSourceMap = JSON.stringify(inputSourceMap);
    }

    const transformOptions = Object.assign({}, loaderOptions, {
      filename: loaderContext.resourcePath,
      inputSourceMap: inputSourceMap || undefined,

      // Set the default sourcemap behavior based on Webpack's mapping flag,
      // but allow users to override if they want.
      sourceMaps:
          loaderOptions.sourceMaps === undefined
              ? loaderContext.sourceMap
              : loaderOptions.sourceMaps,

      // Ensure that Webpack will get a full absolute path in the sourcemap
      // so that it can properly map the module back to its internal cached
      // modules.
      sourceFileName: loaderContext.resourcePath,
    });
    if (!transformOptions.inputSourceMap) {
        delete transformOptions.inputSourceMap;
    }

    // Remove loader related options
    delete transformOptions.parseMap;

    // auto detect development mode
    if (loaderContext.mode && transformOptions.jsc && transformOptions.jsc.transform
        && transformOptions.jsc.transform.react &&
        !Object.prototype.hasOwnProperty.call(transformOptions.jsc.transform.react, "development")) {
        transformOptions.jsc.transform.react.development = loaderContext.mode === 'development'
    }

    if (transformOptions.sourceMaps === "inline") {
        // Babel has this weird behavior where if you set "inline", we
        // inline the sourcemap, and set 'result.map = null'. This results
        // in bad behavior from Babel since the maps get put into the code,
        // which Webpack does not expect, and because the map we return to
        // Webpack is null, which is also bad. To avoid that, we override the
        // behavior here so "inline" just behaves like 'true'.
        transformOptions.sourceMaps = true;
    }

    return transformOptions
  }

  async transform({transformOptions, source}: SwcTransformOptions): Promise<{
    code: string | null | undefined;
    map?: string | null
  }> {
    const result = await swc.transform(source, transformOptions)
    return {
      code: result.code,
      map: result.map && JSON.parse(result.map)
    }
  }
}

export default SwcTransfrom
