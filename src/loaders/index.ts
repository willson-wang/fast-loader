import { LoaderContext } from 'webpack'
import { validate } from 'schema-utils'

import schema from './schema.json'

import { LoaderOptions } from './type'
import * as defaultOptions from './defaultOptions'


export default function scriptLoader(
  this: LoaderContext<LoaderOptions>,
  source: string,
  inputSourceMap: string | null
  // @ts-ignore
): Promise<void> {
  const innercallback = this.async();
  const options = this.getOptions()

  // {
  //   choice: 'babel',
  //   choiceOptions: {

  //   }
  // }
  // @ts-ignore
  validate(schema, options, {
    name: "fast loader",
  });

  const { choice, choiceOptions } = options

  import(`./${choice}`).then((result) => {
    const instance = new result.default()

    const transformOptions = instance.formatOptions({...choiceOptions, ...defaultOptions[`${choice}DefaultOptions` as 'babelDefaultOptions']})

    try {
      const { code, map} = instance.transform({
        transformOptions,
        loaderOptions: choiceOptions,
        loaderContext: this,
        inputSourceMap,
        source
      })
      return innercallback(null, code, map)
    } catch (error) {
      return error
    }
  }).catch(innercallback)

}
