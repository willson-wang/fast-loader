import babel, { TransformOptions } from '@babel/core'
import TransfromType from './base'
import { BabelFormatOptions, BabelTransformOptions } from './type'


function injectCaller(opts: any, target: string) {

  return Object.assign({}, opts, {
    caller: Object.assign(
      {
        name: "fast-loader",

        target,

        // Webpack >= 2 supports ESM and dynamic import.
        supportsStaticESM: true,
        supportsDynamicImport: true,

        // Webpack 5 supports TLA behind a flag. We enable it by default
        // for Babel, and then webpack will throw an error if the experimental
        // flag isn't enabled.
        supportsTopLevelAwait: true,
      },
      opts.caller,
    ),
  });
};

// @ts-ignore
function subscribe(subscriber, metadata, context) {
  if (context[subscriber]) {
    context[subscriber](metadata);
  }
}

class BabelTransfrom extends TransfromType {
  config: Readonly<babel.PartialConfig> | null
  constructor() {
    super()
  }

  async formatOptions({
    loaderOptions,
    loaderContext,
    inputSourceMap,
  }: BabelFormatOptions): Promise<TransformOptions | undefined> {
    if (typeof loaderOptions.babelrc === "string") {
      console.warn(
        "The option `babelrc` should not be set to a string anymore in the fast-loader config. " +
          "Please update your configuration and set `babelrc` to true or false.\n" +
          "If you want to specify a specific babel config file to inherit config from " +
          "please use the `extends` option.\nFor more information about this options see " +
          "https://babeljs.io/docs/core-packages/#options",
      );
    }

    // Standardize on 'sourceMaps' as the key passed through to Webpack, so that
    // users may safely use either one alongside our default use of
    // 'this.sourceMap' below without getting error about conflicting aliases.
    if (
      Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMap") &&
      !Object.prototype.hasOwnProperty.call(loaderOptions, "sourceMaps")
    ) {
      loaderOptions = Object.assign({}, loaderOptions, {
        sourceMaps: loaderOptions.sourceMap,
      });
      delete loaderOptions.sourceMap;
    }

    const transformOptions = Object.assign({}, loaderOptions, {
      filename: loaderContext.resourcePath,
      inputSourceMap: inputSourceMap || loaderOptions.inputSourceMap,

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

    // Remove loader related options
    delete transformOptions.metadataSubscribers;

    this.config = await babel.loadPartialConfigAsync(
      injectCaller(transformOptions, loaderContext.target),
    );

    if (this.config) {
      let options = this.config.options;
      if (options.sourceMaps === "inline") {
        // Babel has this weird behavior where if you set "inline", we
        // inline the sourcemap, and set 'result.map = null'. This results
        // in bad behavior from Babel since the maps get put into the code,
        // which Webpack does not expect, and because the map we return to
        // Webpack is null, which is also bad. To avoid that, we override the
        // behavior here so "inline" just behaves like 'true'.
        options.sourceMaps = true;
      }

      return options
    }

  }

  async transform({transformOptions, loaderOptions, source, loaderContext, inputSourceMap}: BabelTransformOptions): Promise<{
    code: string | null | undefined;
    map?: string | null | {
      version: number;
      sources: string[];
      names: string[];
      sourceRoot?: string | undefined;
      sourcesContent?: string[] | undefined;
      mappings: string;
      file: string;
    }
  }> {
    if (transformOptions) {
      const {
        metadataSubscribers = [],
      } = loaderOptions;

      const result = await babel.transformAsync(source, transformOptions)

      if (!result) return {
        code: null,
      };

      // @ts-ignore
      this.config.files.forEach(configFile => loaderContext.addDependency(configFile));

      const { code, map, metadata } = result;

      if (map && (!map.sourcesContent || !map.sourcesContent.length)) {
        map.sourcesContent = [source];
      }

      // @ts-ignore
      Array.from(result.externalDependencies || []).forEach(dep => loaderContext.addDependency(dep));

      metadataSubscribers.forEach(subscriber => {
        subscribe(subscriber, metadata, loaderContext);
      });

      return {
        code,
        map
      }
    }
    return {
      code: source,
      map: inputSourceMap
    }
  }
}

export default BabelTransfrom
