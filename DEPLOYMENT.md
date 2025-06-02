# TCOG Frontend 部署指南

这个文档描述了如何将"我的工程师生活"游戏前端部署到Kubernetes集群中。

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🔧 系统要求

### 开发环境
- Node.js 18+
- npm 8+
- Docker 20+
- 8GB+ 可用内存

### Kubernetes集群
- Kubernetes 1.20+
- NGINX Ingress Controller
- Metrics Server（用于HPA）
- 至少2个工作节点

### 网络要求
- 集群节点间网络通信正常
- 外部访问端口80/443

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone <repository-url>
cd MyLifeAsAnEngineer
```

### 2. 设置执行权限
```bash
chmod +x build.sh deploy.sh
```

### 3. 一键部署
```bash
# 构建并部署到default命名空间
./deploy.sh --build

# 或者使用完整构建脚本
./build.sh --all
```

### 4. 验证部署
```bash
# 查看部署状态
./deploy.sh --status

# 或者手动检查
kubectl get pods -l app=tcog-frontend
kubectl get svc tcog-frontend
```

## 📝 详细部署步骤

### 步骤1: 准备环境

#### 检查依赖
```bash
# 检查Node.js版本
node --version  # 应该 >= 18.0.0

# 检查Docker
docker --version
docker ps

# 检查kubectl连接
kubectl cluster-info
kubectl get nodes
```

#### 安装NGINX Ingress Controller（如果未安装）
```bash
# 使用Helm安装
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace

# 或者使用kubectl
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
```

### 步骤2: 构建应用

#### 方法1: 使用构建脚本（推荐）
```bash
# 只构建项目
./build.sh --build

# 构建Docker镜像
./build.sh --docker --tag v1.0.0

# 完整流程
./build.sh --all --tag v1.0.0
```

#### 方法2: 手动构建
```bash
# 安装依赖
npm install
cd frontend-web && npm install && cd ..

# 构建项目
npm run build:web

# 构建Docker镜像
docker build -t tcog-frontend:v1.0.0 .
```

### 步骤3: 部署到Kubernetes

#### 使用部署脚本
```bash
# 部署到default命名空间
./deploy.sh

# 部署到指定命名空间
./deploy.sh --namespace tcog-game

# 使用私有镜像仓库
./deploy.sh --registry registry.example.com --tag v1.0.0
```

#### 手动部署
```bash
# 创建命名空间
kubectl create namespace tcog-game

# 应用配置
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# 等待部署完成
kubectl rollout status deployment/tcog-frontend -n tcog-game
```

## ⚙️ 配置说明

### Deployment配置
文件: `k8s/deployment.yaml`

```yaml
# 关键配置项
spec:
  replicas: 3                    # Pod副本数
  resources:
    requests:
      memory: "128Mi"            # 最小内存需求
      cpu: "100m"               # 最小CPU需求
    limits:
      memory: "256Mi"            # 最大内存限制
      cpu: "200m"               # 最大CPU限制
```

### 服务配置
文件: `k8s/deployment.yaml` (Service部分)

```yaml
spec:
  type: ClusterIP              # 服务类型
  ports:
  - port: 80                   # 服务端口
    targetPort: 80             # 容器端口
```

### Ingress配置
文件: `k8s/ingress.yaml`

```yaml
spec:
  rules:
  - host: tcog-game.local      # 域名（可修改）
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tcog-frontend
            port:
              number: 80
```

### HPA配置
文件: `k8s/hpa.yaml`

```yaml
spec:
  minReplicas: 2               # 最小副本数
  maxReplicas: 10              # 最大副本数
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # CPU阈值
```

## 📊 监控和维护

### 查看状态
```bash
# 查看Pod状态
kubectl get pods -l app=tcog-frontend -o wide

# 查看服务状态
kubectl get svc tcog-frontend

# 查看Ingress状态
kubectl get ingress tcog-frontend-ingress

# 查看HPA状态
kubectl get hpa tcog-frontend-hpa
```

### 查看日志
```bash
# 查看所有Pod日志
kubectl logs -l app=tcog-frontend

# 查看特定Pod日志
kubectl logs <pod-name>

# 实时跟踪日志
kubectl logs -l app=tcog-frontend -f
```

### 更新部署
```bash
# 使用新镜像更新
./deploy.sh --update --tag v1.1.0

# 手动更新镜像
kubectl set image deployment/tcog-frontend tcog-frontend=tcog-frontend:v1.1.0

# 重启所有Pod
kubectl rollout restart deployment/tcog-frontend
```

### 扩容缩容
```bash
# 手动扩容
kubectl scale deployment tcog-frontend --replicas=5

# 查看HPA状态
kubectl describe hpa tcog-frontend-hpa
```

## 🔍 故障排除

### 常见问题

#### 1. Pod无法启动
```bash
# 查看Pod详情
kubectl describe pod <pod-name>

# 查看Pod日志
kubectl logs <pod-name>

# 常见原因：
# - 镜像拉取失败
# - 资源不足
# - 配置错误
```

#### 2. 服务无法访问
```bash
# 检查服务端点
kubectl get endpoints tcog-frontend

# 检查Ingress状态
kubectl describe ingress tcog-frontend-ingress

# 测试服务连通性
kubectl port-forward svc/tcog-frontend 8080:80
curl http://localhost:8080/health
```

#### 3. 镜像构建失败
```bash
# 检查Docker状态
docker ps
docker images

# 清理Docker缓存
docker system prune -f

# 重新构建
./build.sh --clean
./build.sh --docker
```

#### 4. HPA不工作
```bash
# 检查Metrics Server
kubectl get pods -n kube-system | grep metrics-server

# 检查HPA状态
kubectl describe hpa tcog-frontend-hpa

# 可能需要安装Metrics Server：
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 健康检查

#### 应用健康检查
```bash
# 检查健康端点
curl http://<ingress-ip>/health

# 预期响应：
# HTTP 200 OK
# Body: healthy
```

#### 完整功能测试
```bash
# 访问主页
curl http://<ingress-ip>/

# 检查静态资源
curl http://<ingress-ip>/assets/index.js
curl http://<ingress-ip>/dist/game-engine.js
curl http://<ingress-ip>/csv/resources.csv
```

## 🗑️ 清理部署

### 删除应用
```bash
# 使用脚本删除
./deploy.sh --delete

# 手动删除
kubectl delete -f k8s/
```

### 清理镜像
```bash
# 清理Docker镜像
docker rmi tcog-frontend:latest
docker image prune -f

# 清理构建缓存
./build.sh --clean
```

## 📈 性能优化

### 资源调优
```yaml
# 根据实际使用调整资源限制
resources:
  requests:
    memory: "64Mi"     # 最小内存需求
    cpu: "50m"         # 最小CPU需求
  limits:
    memory: "512Mi"    # 最大内存限制
    cpu: "500m"        # 最大CPU限制
```

### 缓存优化
- 静态资源已配置1年缓存
- HTML文件不缓存
- API数据缓存1小时

### 网络优化
- 启用gzip压缩
- 配置CDN（可选）
- 优化Ingress配置

## 🔐 安全配置

### 容器安全
- 使用非root用户运行
- 只开放必要端口
- 定期更新基础镜像

### 网络安全
- 配置网络策略
- 使用HTTPS（生产环境）
- 限制外部访问

### 建议的生产环境配置
```yaml
# 启用HTTPS
tls:
- hosts:
  - your-domain.com
  secretName: tcog-frontend-tls

# 网络策略
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tcog-frontend-netpol
spec:
  podSelector:
    matchLabels:
      app: tcog-frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
```

## 📞 支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查应用日志
3. 验证Kubernetes集群状态
4. 提交Issue并附上详细日志

---

**注意**: 这是一个前端静态应用，所有游戏逻辑都在浏览器中运行，无需额外的后端服务。 