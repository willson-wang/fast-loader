import { LoaderContext } from 'webpack'
import { Options } from '@swc/core';
import { TransformOptions } from '@babel/core'
import { transform as defaultTransform, TransformOptions as EsbuildDefaultTransformOptions } from 'esbuild'


export interface BabelLoaderOptions extends TransformOptions {
  babelrc?: boolean
  sourceMap?: boolean
  sourceMaps?: boolean
  metadataSubscribers?: string[]
}

export interface BabelFormatOptions {
  loaderOptions: BabelLoaderOptions,
  inputSourceMap: string | null,
  loaderContext: LoaderContext<{}>
}


export interface BabelTransformOptions {
  transformOptions: TransformOptions | undefined;
  loaderOptions: BabelLoaderOptions;
  source: string;
  loaderContext: LoaderContext<{}>,
  inputSourceMap: string | null
}


type Implementation = {
	transform: typeof defaultTransform;
};

type Except<ObjectType, Properties> = {
	[Key in keyof ObjectType as (Key extends Properties ? never : Key)]: ObjectType[Key];
};

type EsbuildLoaderOptions = Except<EsbuildDefaultTransformOptions, 'sourcemap' | 'sourcefile'> & {
  implementation?: Implementation,
  tsconfig?: string,
}

export interface EsbuildFormatOptions {
  loaderOptions: EsbuildLoaderOptions,
  loaderContext: LoaderContext<{}>
}


export interface EsbuildTransformOptions {
  transformOptions: Except<EsbuildDefaultTransformOptions, 'sourcemap' | 'sourcefile'>;
  loaderOptions: EsbuildLoaderOptions;
  source: string;
  loaderContext: LoaderContext<{}>,
  inputSourceMap: string | null
}

export interface SwcLoaderOptions extends Options {
  sourceMap?: boolean
  parseMap?: boolean
}

export interface SwcFormatOptions {
  loaderOptions: SwcLoaderOptions,
  inputSourceMap: string | null,
  loaderContext: LoaderContext<{}>
}


export interface SwcTransformOptions {
  transformOptions: Options | undefined;
  loaderOptions: LoaderOptions;
  source: string;
  loaderContext: LoaderContext<{}>,
  inputSourceMap: string | null
}

export interface LoaderOptions {
  choice: 'swc' | 'esbuild' | 'babel'
  choiceOptions: BabelLoaderOptions | SwcLoaderOptions | EsbuildLoaderOptions
}

