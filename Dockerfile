# 1. 改用標準的 alpine 版本 (去除 perl 模組，減少漏洞)
FROM nginx:alpine

# 標籤設定
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_REPOSITORY}"
LABEL org.opencontainers.image.description="井字遊戲"

# 2. 【關鍵】刪除原本安裝 libxml2 的指令
# 你的 101 個漏洞絕大多數都來自原本這裡安裝的軟體
# 我們不需要安裝任何額外套件，保持映像檔最小化

# 安裝最小必要工具（供 healthcheck 使用），並清除預設 Nginx 頁面
RUN apk update && apk add --no-cache wget && rm -rf /usr/share/nginx/html/*

# 複製應用程式與自訂 nginx 配置
COPY app/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 設定非 Root 權限與 nginx 配置調整
# 安全修正：不要刪除 nginx 的 `user nginx;`，保留非 root 運行
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf && \
    sed -i "/^http {/a \    proxy_temp_path /tmp/proxy_temp;\n    client_body_temp_path /tmp/client_temp;\n    fastcgi_temp_path /tmp/fastcgi_temp;\n    uwsgi_temp_path /tmp/uwsgi_temp;\n    scgi_temp_path /tmp/scgi_temp;\n" /etc/nginx/nginx.conf && \
    chown -R nginx:nginx /usr/share/nginx/html/

# 暴露端口
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]