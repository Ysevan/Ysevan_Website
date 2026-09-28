vendor/ —— 案头手册（design-proposal.md §9）的两份本地运行库

站点运行仍然零依赖、没有构建步骤：这里的两份是随仓库分发的成品，desk-book.js 只在设备合格、
宽屏、页面加载完的空闲时刻、且右栏末尾接近视口时，才用普通 <script> 标签注入它们。
file:// 双击打开是硬约束（不能用 ES module / importmap / fetch / 动态 import），所以两份都必须是经典脚本。
打包工具（esbuild）只在重打 three 时用，不参与站点运行，也不进容器镜像。


一、three.min.js
  来源      npm 包 three@0.186.0（r186）
  许可      MIT，全文见同目录 LICENSE-three.txt（即 three 包里的 LICENSE 原文）
  许可注释  three 源码里的 /** @license Copyright 2010-2026 Three.js Authors / SPDX-License-Identifier: MIT */
            原样保留在产物里（两处）；另在第 1 行加了一条说明来源与许可的 banner 注释。

  为什么要自己打：three 从 r160 起不再发布经典脚本（UMD）版，0.186 的包里只有 ES module
  （build/three.module.js + build/three.core.js）。所以这里用 esbuild 只打包手册实际用到的符号，
  输出成挂 window.THREE 的 IIFE。**升级 three 必须按本配方重打，不能直接拷 npm 包里的文件。**

  配方位置  tools/vendor-3d/（three-entry.js、package.json、build.sh）
  esbuild   0.28.1（package.json 里钉死精确版本，build.sh 还会核对版本，装错就停）
  完整命令  参数与 build.sh 逐项一致（build.sh 先打到临时目录再拷进 vendor/，所以那里的 --outfile 是临时路径）：
    esbuild tools/vendor-3d/three-entry.js \
      --bundle --format=iife --global-name=THREE --minify --legal-comments=inline --target=es2020 \
      "--banner:js=/*! three@0.186.0 subset for desk-book.js, rebuilt by tools/vendor-3d/build.sh | MIT License, Copyright 2010-2026 Three.js Authors | full text: vendor/LICENSE-three.txt */" \
      --log-level=warning --outfile=vendor/three.min.js

  入口 three-entry.js 的导出部分全文（逐个列出，禁止 export * from "three"）：
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

  导出符号清单（13 个）：BoxGeometry、BufferAttribute、BufferGeometry、Color、DoubleSide、Group、Mesh、
  PerspectiveCamera、PlaneGeometry、Scene、ShaderMaterial、Vector3、WebGLRenderer。
  体积的大头是 WebGLRenderer 及其着色器片段库，这部分无法再裁。


二、gsap.min.js
  来源      npm 包 gsap@3.15.0 的 dist/gsap.min.js，原样拷贝，一个字节未改
  许可      GSAP Standard "No Charge" License，https://gsap.com/standard-license
            文件顶部的 @license 许可头不得删改。
  用到的    只用核心：gsap.quickTo（滚动进度 140ms 阻尼、倾斜、丝带轻摆）、timeline、ticker。
            不含 ScrollTrigger 等插件——滚动进度是 desk-book.js 自己算的。
  升级      改 tools/vendor-3d/package.json 里 gsap 的精确版本 → 在该目录 npm install → npm run build
            （build.sh 会把 node_modules/gsap/dist/gsap.min.js 原样拷过来）；再更新本文件的版本、校验和与体积。
            GSAP 官方一直在发 UMD 版，不需要打包。


三、校验和与体积（2026-09-20 制作）
  sha256                                                            文件            原始字节   gzip -9 后
  a42f903c107b31cb7f51adcea6da0e7189be57e3d2eeba22a99872d8f8823843  three.min.js    529,947    132,406
  92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb  gsap.min.js      72,927     28,314

  两份在 .gitattributes 里标了 -diff（仍按文本、以 LF 入库），git diff 不显示内容；是否被改动以这里的 sha256 为准。


四、重打与自证（只在升级 three / GSAP 时需要）
    cd tools/vendor-3d
    npm install        装 package.json 里钉死版本的 three / gsap / esbuild（node_modules 已被 .gitignore 排除）
    npm run build      = bash build.sh：重打 vendor/three.min.js、拷 vendor/gsap.min.js，并打印 sha256 与体积
    npm run check      = bash build.sh --check：打到临时目录，与 vendor/ 里两份比 sha256，不一致非零退出

  在仓库外的副本里制作时：bash build.sh --out <目录>；拿任意目录自证：bash build.sh --check <目录>。

  跨平台陷阱：esbuild 是按操作系统区分的原生二进制。仓库放在 SMB 共享盘上时，Mac 上装出来的 node_modules
  拿到 Windows（或反过来）用不了，换系统就要在那个系统上重新 npm install。不要把 node_modules 提交进仓库。


五、容器
  Dockerfile 以 `COPY vendor/ ./vendor/` 整目录带进镜像（连同本说明与 LICENSE-three.txt）。
  CI 的 tools/check-dockerfile-copy.sh 会从 desk-book.js 里 grep 出这两份的路径，核对它们存在且被 COPY 覆盖。
