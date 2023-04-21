import {
  transformFromAstSync,
  parseSync,
  transformFileSync,
  transformSync,
  createConfigItem,
} from '@babel/core'
import type { Plugin } from '@svgr/core'
import pluginUrl from '@svgr/babel-plugin-url'

const urlPlugin: Plugin = (code, config, state) => {
  if (!state.filePath) {
    throw new Error('Missing filePath in state')
  }
  const { filePath } = state

  const result = transformSync(code, {
    caller: {
      name: 'svgr-plugin-url',
    },
    plugins: [createConfigItem(pluginUrl)],
    filename: filePath,
    babelrc: false,
    configFile: false,
    code: true,
    ast: false,
    // @ts-ignore
    inputSourceMap: false,
  })

  if (!result?.code) {
    throw new Error(`Unable to generate SVG file`)
  }

  return result.code
}

export default urlPlugin
