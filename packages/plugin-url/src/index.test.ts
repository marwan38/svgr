import url from '.'

describe('plugin-url', () => {
  it('transforms code', () => {
    const result = url(
      `
import foo from "./test.svg";
`,
      {},
      { componentName: 'SvgComponent', filePath: __filename },
    )
    expect(result).toMatchInlineSnapshot(
      `"export const foo = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.2%22%20baseProfile%3D%22tiny%22%20%20%20%20%20viewBox%3D%220%200%2030%2030%22%3E%20%20%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3C%2Fsvg%3E";"`,
    )
  })
  it('preserves named imports', () => {
    const result = url(
      `import foo, { ReactComponent } from "./test.svg";`,
      {},
      { componentName: 'SvgComponent', filePath: __filename },
    )
    expect(result).toMatchInlineSnapshot(`
      "import { ReactComponent } from "./test.svg";
      export const foo = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.2%22%20baseProfile%3D%22tiny%22%20%20%20%20%20viewBox%3D%220%200%2030%2030%22%3E%20%20%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3C%2Fsvg%3E";"
    `)
  })
})
