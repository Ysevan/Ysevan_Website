// vendor/three.min.js 的打包入口：只导出 desk-book.js 实际用到的符号。
// 逐个列出，禁止 `export * from "three"`——那会把整个库（含没用到的加载器、几何体）全部打进去。
// 场景里要新用一个 three 符号，就在这里加一行，然后 `bash build.sh` 重打，并同步 vendor/README.txt 的清单。
export {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
