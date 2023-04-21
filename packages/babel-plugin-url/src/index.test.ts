import { PluginPass, transform } from '@babel/core'
import plugin, { Options } from '.'

const testPlugin = (code: string, options?: Options & Partial<PluginPass>) => {
  const result = transform(code, {
    plugins: ['@babel/plugin-syntax-jsx', [plugin, options]],
    configFile: false,
    filename: __filename,
  })

  return result?.code
}

describe('plugin', () => {
  it('should inline default import', () => {
    expect(testPlugin('import foo from "./test.svg"')).toMatchInlineSnapshot(
      `"export const foo = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.2%22%20baseProfile%3D%22tiny%22%20%20%20%20%20viewBox%3D%220%200%2030%2030%22%3E%20%20%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3C%2Fsvg%3E";"`,
    )
  })
  it('should preserve named imports', () => {
    expect(testPlugin('import foo, { ReactComponent } from "./test.svg"'))
      .toMatchInlineSnapshot(`
      "import { ReactComponent } from "./test.svg";
      export const foo = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.2%22%20baseProfile%3D%22tiny%22%20%20%20%20%20viewBox%3D%220%200%2030%2030%22%3E%20%20%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3C%2Fsvg%3E";"
    `)
  })
})
