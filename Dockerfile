# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和lock文件
COPY package*.json ./
COPY frontend-web/package*.json ./frontend-web/

# 安装根目录依赖
RUN npm ci --production=false

# 安装前端依赖
WORKDIR /app/frontend-web
RUN npm ci --production=false

# 返回到app目录
WORKDIR /app

# 复制源代码
COPY . .

# 构建项目
RUN npm run build:web

# 第二阶段：运行阶段
FROM nginx:alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建web目录
RUN mkdir -p /usr/share/nginx/html

# 从构建阶段复制构建产物（包含了game-engine.js）
COPY --from=builder /app/frontend-web/dist/ /usr/share/nginx/html/

# 注释掉重复的game-engine.js复制，因为Vite已经处理了
# RUN mkdir -p /usr/share/nginx/html/dist
# COPY --from=builder /app/frontend-web/public/dist/ /usr/share/nginx/html/dist/

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 