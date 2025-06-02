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
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或不在PATH中"
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

# 构建Docker镜像
build_docker_image() {
    local image_name=${1:-"tcog-frontend"}
    local image_tag=${2:-"latest"}
    local full_image_name="${image_name}:${image_tag}"
    
    log_info "构建Docker镜像: ${full_image_name}"
    
    # 构建镜像
    docker build -t "${full_image_name}" .
    
    # 检查镜像大小
    local image_size=$(docker images "${image_name}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | tail -1 | awk '{print $3}')
    log_success "Docker镜像构建完成，大小: ${image_size}"
    
    # 测试镜像
    log_info "测试Docker镜像..."
    local container_id=$(docker run -d -p 8080:80 "${full_image_name}")
    
    # 等待容器启动
    sleep 5
    
    # 健康检查
    if curl -f http://localhost:8080/health &>/dev/null; then
        log_success "Docker镜像测试通过"
    else
        log_warning "Docker镜像健康检查失败，但镜像已构建"
    fi
    
    # 清理测试容器
    docker stop "${container_id}" &>/dev/null || true
    docker rm "${container_id}" &>/dev/null || true
}

# 推送到镜像仓库
push_image() {
    local image_name=${1:-"tcog-frontend"}
    local image_tag=${2:-"latest"}
    local registry=${3}
    local full_image_name
    
    if [ -n "${registry}" ]; then
        full_image_name="${registry}/${image_name}:${image_tag}"
        # 重新标记镜像
        docker tag "${image_name}:${image_tag}" "${full_image_name}"
    else
        full_image_name="${image_name}:${image_tag}"
    fi
    
    log_info "推送镜像到仓库: ${full_image_name}"
    docker push "${full_image_name}"
    log_success "镜像推送完成"
}

# 部署到Kubernetes
deploy_to_k8s() {
    log_info "部署到Kubernetes..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl 未安装或不在PATH中"
        exit 1
    fi
    
    # 检查kubectl连接
    if ! kubectl cluster-info &>/dev/null; then
        log_error "无法连接到Kubernetes集群"
        exit 1
    fi
    
    # 应用K8S配置
    log_info "应用Kubernetes配置..."
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/ingress.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/tcog-frontend --timeout=300s
    
    log_success "Kubernetes部署完成"
    
    # 显示服务信息
    log_info "服务信息:"
    kubectl get svc tcog-frontend
    kubectl get ingress tcog-frontend-ingress
}

# 清理资源
cleanup() {
    log_info "清理构建资源..."
    
    # 清理npm缓存
    npm cache clean --force 2>/dev/null || true
    
    # 清理Docker悬挂镜像
    docker image prune -f 2>/dev/null || true
    
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "TCOG Frontend 构建脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -b, --build             只构建项目（不构建Docker镜像）"
    echo "  -d, --docker            构建Docker镜像"
    echo "  -p, --push REGISTRY     推送镜像到指定仓库"
    echo "  -k, --k8s               部署到Kubernetes"
    echo "  -a, --all               执行完整流程（构建+Docker+部署）"
    echo "  -c, --clean             清理构建资源"
    echo "  -t, --tag TAG           指定镜像标签（默认: latest）"
    echo "  -n, --name NAME         指定镜像名称（默认: tcog-frontend）"
    echo ""
    echo "示例:"
    echo "  $0 --build                          # 只构建项目"
    echo "  $0 --docker --tag v1.0.0           # 构建Docker镜像并指定标签"
    echo "  $0 --all --tag v1.0.0               # 执行完整流程"
    echo "  $0 --push registry.example.com      # 推送到指定仓库"
}

# 主函数
main() {
    local build_only=false
    local build_docker=false
    local push_registry=""
    local deploy_k8s=false
    local do_cleanup=false
    local image_tag="latest"
    local image_name="tcog-frontend"
    local all_steps=false
    
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
                build_docker=true
                shift
                ;;
            -p|--push)
                push_registry="$2"
                shift 2
                ;;
            -k|--k8s)
                deploy_k8s=true
                shift
                ;;
            -a|--all)
                all_steps=true
                shift
                ;;
            -c|--clean)
                do_cleanup=true
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
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 检查依赖
    check_dependencies
    
    # 执行清理
    if [ "$do_cleanup" = true ]; then
        cleanup
        exit 0
    fi
    
    # 执行完整流程
    if [ "$all_steps" = true ]; then
        build_project
        build_docker_image "$image_name" "$image_tag"
        if [ -n "$push_registry" ]; then
            push_image "$image_name" "$image_tag" "$push_registry"
        fi
        deploy_k8s
    else
        # 执行指定步骤
        if [ "$build_only" = true ] || [ "$build_docker" = true ]; then
            build_project
        fi
        
        if [ "$build_docker" = true ]; then
            build_docker_image "$image_name" "$image_tag"
        fi
        
        if [ -n "$push_registry" ]; then
            push_image "$image_name" "$image_tag" "$push_registry"
        fi
        
        if [ "$deploy_k8s" = true ]; then
            deploy_to_k8s
        fi
    fi
    
    # 记录结束时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "构建完成！总耗时: ${duration}秒"
    
    # 显示最终信息
    if [ "$build_docker" = true ] || [ "$all_steps" = true ]; then
        echo ""
        log_info "Docker镜像信息:"
        docker images "${image_name}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    fi
    
    if [ "$deploy_k8s" = true ] || [ "$all_steps" = true ]; then
        echo ""
        log_info "Kubernetes部署状态:"
        kubectl get pods -l app=tcog-frontend
    fi
}

# 运行主函数
main "$@" 