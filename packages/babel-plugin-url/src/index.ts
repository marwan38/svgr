/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ConfigAPI, NodePath, PluginItem, types as t } from '@babel/core'
import * as fs from 'fs'
import * as nodePath from 'path'

export interface Options {
  limit?: number
}

interface State extends Options {
  program: NodePath<t.Program>
  filename: string
}

const inlineSVGDataURI = (_: ConfigAPI, opts: Options): PluginItem => {
  const { limit = 14 * 1024 } = opts

  return {
    visitor: {
      Program(path: NodePath<t.Program>, state: State) {
        state.program = path
      },
      ImportDeclaration(
        path: NodePath<t.ImportDeclaration>,
        { filename, program }: State,
      ) {
        if (!filename) {
          throw new Error(
            'filePath is required. see state object of the plugin',
          )
        }
        const importSource = path.node.source.value
        if (!importSource.endsWith('.svg')) return

        const importNode = path
          .get('specifiers')
          .find((spec) => spec.isImportDefaultSpecifier())

        if (!importNode) return

        // 'foo' in `import foo from 'bar.svg'`
        const importName = importNode.node.local.name

        let pathTo = nodePath.parse(filename).dir
        pathTo = nodePath.join(pathTo, importSource)
        const stats = fs.statSync(pathTo)

        if ((limit && stats.size <= limit) || limit === 0) {
          // const resolved = require.resolve(pathTo)
          const buffer = fs.readFileSync(pathTo)
          const mimetype = 'image/svg+xml'
          let data = encodeSVG(buffer)
          data = `data:${mimetype},${data}`

          const namedExport = t.exportNamedDeclaration(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(importName),
                t.stringLiteral(data),
              ),
            ]),
          )

          // Add the export to the bottom of the file
          program.node.body.push(namedExport)

          trimImport(path)

          return
        }

        throw path.buildCodeFrameError(
          `File ${pathTo} size is over the limit: ${limit}`,
        )
      },
    },
  }
}

function trimImport(path: NodePath<t.ImportDeclaration>): void {
  if (path.node.specifiers.length === 1) {
    path.remove()
  } else {
    path.node.specifiers = path.node.specifiers.filter(
      (spec) => spec.type !== 'ImportDefaultSpecifier',
    )
  }
}

// https://github.com/filamentgroup/directory-encoder/blob/master/lib/svg-uri-encoder.js
// https://github.com/rollup/plugins/blob/master/packages/url/src/index.js#L101
function encodeSVG(buffer: Buffer) {
  return (
    encodeURIComponent(
      buffer
        .toString('utf-8')
        // strip newlines and tabs
        .replace(/[\n\r]/gim, '')
        .replace(/\t/gim, ' ')
        // strip comments
        .replace(/<!--(.*(?=-->))-->/gim, '')
        // replace
        .replace(/'/gim, '\\i'),
    )
      // encode brackets
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
  )
}

export default inlineSVGDataURI
