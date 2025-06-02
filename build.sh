#!/bin/bash

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的工具
check_dependencies() {
    log_info "检查构建依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装或不在PATH中"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装或不在PATH中"
        exit 1
    fi
    
    if ! command -v nerdctl &> /dev/null; then
        log_error "nerdctl 未安装或不在PATH中"
        log_error "请安装containerd和nerdctl以支持Kubernetes容器镜像构建"
        exit 1
    fi
    
    # 检查containerd服务状态
    if ! nerdctl system info &> /dev/null; then
        log_error "containerd 服务未运行或无法连接"
        exit 1
    fi
    
    log_success "所有依赖检查通过"
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    
    # 清理之前的构建
    log_info "清理之前的构建产物..."
    npm run clean || true
    
    # 安装依赖
    log_info "安装根目录依赖..."
    npm install
    
    log_info "安装前端依赖..."
    cd frontend-web && npm install && cd ..
    
    # 构建项目
    log_info "构建完整项目..."
    npm run build:web
    
    log_success "项目构建完成"
}

# 构建容器镜像（本地构建，不推送到仓库）
build_container_image() {
    local image_name=${1:-"tcog-frontend"}
    local image_tag=${2:-"latest"}
    local full_image_name="k8s.io/${image_name}:${image_tag}"
    
    log_info "使用containerd构建本地容器镜像: ${full_image_name}"
    log_info "镜像将构建在k8s.io命名空间以确保Kubernetes兼容性"
    log_info "注意：由于构建和部署在同一台机器，镜像将直接在本地使用，无需推送到镜像仓库"
    
    # 使用nerdctl构建镜像，指定k8s.io命名空间
    nerdctl build --namespace k8s.io -t "${full_image_name}" .
    
    # 检查镜像大小
    local image_size=$(nerdctl --namespace k8s.io images "${image_name}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | tail -1 | awk '{print $3}')
    log_success "容器镜像构建完成，大小: ${image_size}"
    
    # 测试镜像
    log_info "测试容器镜像..."
    local container_id=$(nerdctl --namespace k8s.io run -d -p 8080:80 "${full_image_name}")
    
    # 等待容器启动
    sleep 5
    
    # 健康检查
    if curl -f http://localhost:8080/health &>/dev/null; then
        log_success "容器镜像测试通过"
    else
        log_warning "容器镜像健康检查失败，但镜像已构建"
    fi
    
    # 清理测试容器
    nerdctl --namespace k8s.io stop "${container_id}" &>/dev/null || true
    nerdctl --namespace k8s.io rm "${container_id}" &>/dev/null || true
    
    log_success "本地镜像构建完成，可直接用于Kubernetes部署"
}

# 部署到Kubernetes（使用本地镜像）
deploy_to_k8s() {
    local namespace=${1:-"tcog"}
    
    log_info "部署到Kubernetes（使用本地镜像）到命名空间: ${namespace}..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl 未安装或不在PATH中"
        exit 1
    fi
    
    # 检查kubectl连接
    if ! kubectl cluster-info &>/dev/null; then
        log_error "无法连接到Kubernetes集群"
        exit 1
    fi
    
    # 创建命名空间（如果不存在）
    log_info "确保命名空间存在: ${namespace}"
    kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -
    
    # 应用K8S配置
    log_info "应用Kubernetes配置到命名空间: ${namespace}..."
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/ingress.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/tcog-frontend -n "$namespace" --timeout=300s
    
    log_success "Kubernetes部署完成"
    
    # 显示服务信息
    log_info "服务信息:"
    kubectl get svc tcog-frontend -n "$namespace"
    kubectl get ingress tcog-frontend-ingress -n "$namespace"
}

# 清理资源
cleanup() {
    log_info "清理构建资源..."
    
    # 清理npm缓存
    npm cache clean --force 2>/dev/null || true
    
    # 清理containerd悬挂镜像
    nerdctl --namespace k8s.io image prune -f 2>/dev/null || true
    
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "TCOG Frontend 构建脚本 (本地构建模式 - 使用containerd + nerdctl)"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -b, --build             只构建项目（不构建容器镜像）"
    echo "  -d, --docker            构建容器镜像（本地镜像，不推送）"
    echo "  -k, --k8s               部署到Kubernetes（使用本地镜像）"
    echo "  -a, --all               执行完整流程（构建+容器镜像+部署）"
    echo "  -c, --clean             清理构建资源"
    echo "  -t, --tag TAG           指定镜像标签（默认: latest）"
    echo "  -n, --name NAME         指定镜像名称（默认: tcog-frontend）"
    echo "  --namespace NS          指定Kubernetes命名空间（默认: tcog）"
    echo ""
    echo "注意:"
    echo "  - 使用containerd和nerdctl替代Docker"
    echo "  - 镜像构建在k8s.io命名空间以确保Kubernetes兼容性"
    echo "  - 本地构建模式：镜像不推送到远程仓库，直接在本地使用"
    echo "  - 适用于构建和部署在同一台机器的场景"
    echo "  - 默认部署到tcog命名空间"
    echo ""
    echo "示例:"
    echo "  $0 -a                   # 完整构建和部署流程到tcog命名空间"
    echo "  $0 -d -t v1.0.0         # 只构建镜像，指定标签"
    echo "  $0 -k --namespace prod  # 只部署到prod命名空间"
    echo ""
}

# 主函数
main() {
    local build_only=false
    local docker_only=false
    local k8s_only=false
    local all_steps=false
    local clean_only=false
    local image_tag="latest"
    local image_name="tcog-frontend"
    local namespace="tcog"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--build)
                build_only=true
                shift
                ;;
            -d|--docker)
                docker_only=true
                shift
                ;;
            -k|--k8s)
                k8s_only=true
                shift
                ;;
            -a|--all)
                all_steps=true
                shift
                ;;
            -c|--clean)
                clean_only=true
                shift
                ;;
            -t|--tag)
                image_tag="$2"
                shift 2
                ;;
            -n|--name)
                image_name="$2"
                shift 2
                ;;
            --namespace)
                namespace="$2"
                shift 2
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖
    check_dependencies
    
    # 执行相应的操作
    if [ "$clean_only" = true ]; then
        cleanup
        exit 0
    fi
    
    if [ "$all_steps" = true ]; then
        log_info "执行完整构建和部署流程..."
        build_project
        build_container_image "$image_name" "$image_tag"
        deploy_to_k8s "$namespace"
        log_success "完整流程执行完成"
    elif [ "$build_only" = true ]; then
        build_project
    elif [ "$docker_only" = true ]; then
        build_project
        build_container_image "$image_name" "$image_tag"
    elif [ "$k8s_only" = true ]; then
        deploy_to_k8s "$namespace"
    else
        # 默认执行完整流程
        log_info "执行默认完整构建和部署流程..."
        build_project
        build_container_image "$image_name" "$image_tag"
        deploy_to_k8s "$namespace"
        log_success "默认流程执行完成"
    fi
}

# 脚本入口点
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 