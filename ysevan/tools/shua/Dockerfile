FROM nginx:1.30.4-alpine@sha256:02b1b2a0445514891a14aa371845f6085d5d9d10d385b30d6aad606a50a29a05

COPY docker/nginx.conf /etc/nginx/nginx.conf

# 基础镜像按 digest 锁定，里面的 Alpine 系统包不会自己变新；上游一爆 CVE，trivy 闸就拦。
# 构建时先把系统包升到仓库里的已修复版本（2026-09 util-linux 七个 HIGH 就是这样拦下的）。
# 构建期就把配置语法验掉；nginx -t 会顺带建出 /tmp 下的临时目录，
# 必须删掉，否则运行时 nginx 用户会遇到 root 属主的目录而无法写入。
RUN apk upgrade --no-cache \
  && nginx -t \
  && rm -rf /usr/share/nginx/html/* \
  && rm -rf /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /tmp/nginx.pid

# 基础镜像的 WORKDIR 是 /，必须显式切到 nginx.conf 里的 root，
# 否则下面的 COPY ... ./ 会把静态文件放到 /，站点整站 404。
WORKDIR /usr/share/nginx/html

COPY --chown=nginx:nginx index.html theme.js styles.css project.js app.js ./
COPY --chown=nginx:nginx questions.js annual-inspection-2026-questions.js annual-inspection-2026-comparison.js ./
COPY --chown=nginx:nginx domestic-settlement-questions.js bill-finance-questions.js bank-acceptance-questions.js ./
COPY --chown=nginx:nginx counterfeit-currency-2023-questions.js manifest.webmanifest sw.js robots.txt ./
# 下面三个题库 2026-09-19 才补进来：外汇2026 从 3.9.0 起就被 index.html 引用却没复制，
# 容器里 404，而 sw.js 用 cache.addAll() 预缓存——任一文件 404 整个 Service Worker
# 安装失败，离线全废。本机 serve.mjs 直接读目录不受影响，所以两周没人发现。
# 新增题库必须同时进 index.html、sw.js、这里三处；scripts/release-check.mjs 会拦。
COPY --chown=nginx:nginx foreign-exchange-2026-questions.js warning-education-sanming-questions.js fx-level-one-questions.js ./
# effects-3d.bundle.js 是 3D 按需加载的那一个文件：不在 index.html 里、不进预缓存，但容器里必须有。
# 3.11.1 起 effects-3d.js 与 vendor/ 下的 three、gsap 子集只是构建输入，不再复制进容器。
COPY --chown=nginx:nginx effects.js effects-3d.bundle.js ./
COPY --chown=nginx:nginx vendor/lucide.min.js vendor/xlsx-import.js ./vendor/
# 品牌图标目录单独列一行：屋主换手绘 logo 就是覆盖 assets/brand/brand-icon.svg；
# 用目录复制而不是逐个文件，可选的 brand-icon.png 不存在时也不会让构建失败。
COPY --chown=nginx:nginx assets/brand/ ./assets/brand/
COPY --chown=nginx:nginx assets/ ./assets/

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -T 2 -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
