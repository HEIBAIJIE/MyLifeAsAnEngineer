#!/bin/bash

# TCOG Frontend 快速部署脚本 (本地镜像模式)

set -e

# 默认配置
IMAGE_NAME="tcog-frontend"
IMAGE_TAG="latest"
NAMESPACE="tcog"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

show_help() {
    cat << EOF
TCOG Frontend 快速部署脚本 (本地镜像模式)

用法: $0 [选项]

选项:
    -h, --help                显示帮助信息
    -n, --namespace NAME      指定Kubernetes命名空间 (默认: tcog)
    -t, --tag TAG            指定镜像标签 (默认: latest)
    --image-name NAME        指定镜像名称 (默认: tcog-frontend)
    --build                  从源码构建镜像
    --update                 更新现有部署
    --delete                 删除部署
    --status                 查看部署状态

注意:
    - 本模式适用于构建和部署在同一台机器的场景
    - 使用本地构建的镜像，无需镜像仓库
    - 镜像存储在 k8s.io 命名空间中

示例:
    $0                                    # 使用默认配置部署
    $0 --build --tag v1.0.0             # 构建并部署指定版本
    $0 --update                          # 更新现有部署
    $0 --status                          # 查看状态
    $0 --delete                          # 删除部署

EOF
}

# 检查kubectl
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl 未安装"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "无法连接到Kubernetes集群"
        exit 1
    fi
    
    log_success "Kubernetes连接正常"
}

# 检查本地镜像
check_local_image() {
    local full_image_name="k8s.io/${IMAGE_NAME}:${IMAGE_TAG}"
    
    log_info "检查本地镜像: $full_image_name"
    
    if ! nerdctl --namespace k8s.io images --quiet "$full_image_name" &> /dev/null; then
        log_error "本地镜像不存在: $full_image_name"
        log_error "请先运行构建脚本构建镜像：./build.sh -d -t $IMAGE_TAG"
        exit 1
    fi
    
    log_success "本地镜像存在: $full_image_name"
}

# 创建命名空间
create_namespace() {
    if [ "$NAMESPACE" != "default" ]; then
        log_info "创建命名空间: $NAMESPACE"
        kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    fi
}

# 构建镜像
build_image() {
    log_info "构建本地镜像..."
    ./build.sh --docker --tag "$IMAGE_TAG" --name "$IMAGE_NAME"
}

# 更新镜像标签
update_image_tag() {
    local full_image_name="k8s.io/${IMAGE_NAME}:${IMAGE_TAG}"
    
    log_info "更新部署镜像: $full_image_name"
    
    # 更新deployment中的镜像
    kubectl set image deployment/tcog-frontend tcog-frontend="$full_image_name" -n "$NAMESPACE"
    
    # 设置镜像拉取策略为Never，确保使用本地镜像
    kubectl patch deployment tcog-frontend -p '{"spec":{"template":{"spec":{"containers":[{"name":"tcog-frontend","imagePullPolicy":"Never"}]}}}}' -n "$NAMESPACE"
    
    # 等待rolling update完成
    kubectl rollout status deployment/tcog-frontend -n "$NAMESPACE" --timeout=300s
}

# 部署应用
deploy_app() {
    log_info "部署应用到Kubernetes（使用本地镜像）..."
    
    # 应用配置文件，替换镜像配置
    local temp_dir=$(mktemp -d)
    
    # 处理deployment.yaml - 只更新镜像相关配置
    cp k8s/deployment.yaml "$temp_dir/deployment.yaml"
    
    # 更新镜像地址为本地镜像，并设置 imagePullPolicy 为 Never
    sed -i "s|image: k8s.io/tcog-frontend:latest|image: k8s.io/$IMAGE_NAME:$IMAGE_TAG|g" "$temp_dir/deployment.yaml"
    sed -i "s|imagePullPolicy: Never|imagePullPolicy: Never|g" "$temp_dir/deployment.yaml"
    
    # 直接使用其他配置文件（它们已经有正确的命名空间）
    cp k8s/ingress.yaml "$temp_dir/ingress.yaml"
    cp k8s/hpa.yaml "$temp_dir/hpa.yaml"
    
    # 应用配置
    kubectl apply -f "$temp_dir/deployment.yaml"
    kubectl apply -f "$temp_dir/ingress.yaml"  
    kubectl apply -f "$temp_dir/hpa.yaml"
    
    # 清理临时文件
    rm -rf "$temp_dir"
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/tcog-frontend -n "$NAMESPACE" --timeout=300s
    
    log_success "部署完成"
}

# 查看状态
show_status() {
    log_info "查看部署状态..."
    
    echo "=== Pods ==="
    kubectl get pods -l app=tcog-frontend -n "$NAMESPACE" -o wide
    
    echo ""
    echo "=== Services ==="
    kubectl get svc tcog-frontend -n "$NAMESPACE"
    
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress tcog-frontend-ingress -n "$NAMESPACE"
    
    echo ""
    echo "=== HPA ==="
    kubectl get hpa tcog-frontend-hpa -n "$NAMESPACE"
    
    echo ""
    echo "=== Local Images ==="
    nerdctl --namespace k8s.io images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    echo ""
    echo "=== Events ==="
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
}

# 删除部署
delete_deployment() {
    log_warning "删除部署..."
    
    read -p "确认删除 tcog-frontend 部署? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete -f k8s/ -n "$NAMESPACE" || true
        log_success "部署已删除"
    else
        log_info "取消删除操作"
    fi
}

# 主函数
main() {
    local build_image_flag=false
    local update_flag=false
    local delete_flag=false
    local status_flag=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -t|--tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            --image-name)
                IMAGE_NAME="$2"
                shift 2
                ;;
            --build)
                build_image_flag=true
                shift
                ;;
            --update)
                update_flag=true
                shift
                ;;
            --delete)
                delete_flag=true
                shift
                ;;
            --status)
                status_flag=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查kubectl
    check_kubectl
    
    # 创建命名空间
    create_namespace
    
    # 执行相应操作
    if [ "$delete_flag" = true ]; then
        delete_deployment
        exit 0
    fi
    
    if [ "$status_flag" = true ]; then
        show_status
        exit 0
    fi
    
    if [ "$build_image_flag" = true ]; then
        build_image
    fi
    
    # 检查本地镜像（除非正在构建）
    if [ "$build_image_flag" = false ]; then
        check_local_image
    fi
    
    if [ "$update_flag" = true ]; then
        update_image_tag
    else
        deploy_app
    fi
    
    log_success "部署操作完成"
    echo ""
    log_info "部署信息:"
    echo "  镜像: k8s.io/${IMAGE_NAME}:${IMAGE_TAG}"
    echo "  命名空间: ${NAMESPACE}"
    echo "  镜像拉取策略: Never (使用本地镜像)"
}

# 运行主函数
main "$@" 