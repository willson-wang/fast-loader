import { BabelFormatOptions, BabelTransformOptions, EsbuildFormatOptions, EsbuildTransformOptions, SwcFormatOptions, SwcTransformOptions } from './type'

class TransfromType {

  async formatOptions({
    loaderOptions,
    loaderContext,
  }: BabelFormatOptions | EsbuildFormatOptions | SwcFormatOptions): Promise<any> {}

  async transform({transformOptions, loaderOptions}: BabelTransformOptions | EsbuildTransformOptions | SwcTransformOptions): Promise<any> {}

}

export default TransfromType

