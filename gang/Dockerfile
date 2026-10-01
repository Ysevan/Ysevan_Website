FROM nginx:1.31.5-alpine@sha256:34f40471dea485273c5e2a04dd5e97a682332ceb4a9adecd67de450dcb2fb390

COPY docker/nginx.conf /etc/nginx/nginx.conf

# 基础镜像按 digest 锁定，里面的 Alpine 系统包不会自己变新；上游一爆 CVE，trivy 闸就拦。
# 构建时先把系统包升到仓库里的已修复版本（2026-09 util-linux 七个 HIGH 就是这样拦下的）。
RUN apk upgrade --no-cache \
  && rm -rf /usr/share/nginx/html/*

# nginx 官方镜像自己不设 WORKDIR，默认工作目录是 /。没有下面这行，后面几条 COPY 的 "./"
# 会把站点落到根目录（/index.html、/assets/），而 nginx.conf 的 root 指向 /usr/share/nginx/html，
# 结果是容器能起、/healthz 也返回 204（healthcheck 照样绿），但每一个页面请求都 404。
WORKDIR /usr/share/nginx/html

# 少 COPY 一个文件构建照样成功，只是那个请求静默 404：CI 的 tools/check-dockerfile-copy.sh 专门核对这里。
COPY --chown=nginx:nginx index.html styles.css app.js search-module.js visit-store.js employee-handbook.js employee-handbook-formatting.js source-formatting.js workflow-guide.js desk-book.js ./
COPY --chown=nginx:nginx assets/ ./assets/
# 案头手册的两份本地运行库（three 子集、GSAP）及许可说明，由 desk-book.js 在运行时按需注入。
COPY --chown=nginx:nginx vendor/ ./vendor/

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -T 2 -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
