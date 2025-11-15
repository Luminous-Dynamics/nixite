#!/usr/bin/env bash

##
# Nixite Backup and Restore Script
# Automated backup and restoration of Nixite data
##

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="nixite_backup_${TIMESTAMP}"
OPERATION="${1:-backup}"  # backup or restore
BACKUP_FILE="${2:-latest}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_section() {
    echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}═══════════════════════════════════════${NC}\n"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Header
echo -e "${CYAN}${BOLD}"
cat << 'EOF'
┏┓•       ┓          ┓
┃┃┓┓┏┓╋┏┓ ┣┓┏┓┏┓┃┏┓┏┓ |
┛┗┗┗┗┗┗┗  ┗┛┗┻┗┗┛┗┻┣┛ •
                    ┛
Backup & Restore Tool v2.1.0
EOF
echo -e "${NC}"

# Backup function
perform_backup() {
    log_section "Creating Backup"

    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$backup_path"

    log_info "Backup location: ${BOLD}$backup_path${NC}"

    # Backup package data
    if [ -f "nixite-packages.json" ]; then
        log_info "Backing up package database..."
        cp nixite-packages.json "$backup_path/"
        log_success "Package database backed up"
    fi

    # Backup configuration
    if [ -f "config.js" ]; then
        log_info "Backing up configuration..."
        cp config.js "$backup_path/"
        log_success "Configuration backed up"
    fi

    # Backup custom data
    if [ -d "data" ]; then
        log_info "Backing up custom data..."
        cp -r data "$backup_path/"
        log_success "Custom data backed up"
    fi

    # Backup Docker volumes (if using Docker)
    if command -v docker &> /dev/null && docker ps &> /dev/null; then
        log_info "Checking Docker volumes..."

        if docker volume ls | grep -q "nixite"; then
            log_info "Backing up Docker volumes..."
            docker run --rm \
                -v nixite_data:/data \
                -v "$(pwd)/$backup_path:/backup" \
                alpine \
                tar czf /backup/docker_volumes.tar.gz -C / data
            log_success "Docker volumes backed up"
        fi
    fi

    # Backup Kubernetes data (if using K8s)
    if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
        log_info "Checking Kubernetes resources..."

        if kubectl get namespace nixite &> /dev/null; then
            log_info "Backing up Kubernetes manifests..."
            kubectl get all -n nixite -o yaml > "$backup_path/k8s_resources.yaml"
            log_success "Kubernetes resources backed up"

            log_info "Backing up ConfigMaps and Secrets..."
            kubectl get configmaps,secrets -n nixite -o yaml > "$backup_path/k8s_config.yaml"
            log_success "Kubernetes configs backed up"
        fi
    fi

    # Create metadata
    cat > "$backup_path/metadata.txt" <<EOF
Backup Created: $(date)
Hostname: $(hostname)
User: $(whoami)
Version: 2.1.0
Files Backed Up:
EOF

    ls -lh "$backup_path" >> "$backup_path/metadata.txt"

    # Create compressed archive
    log_info "Creating compressed archive..."
    tar czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
    log_success "Archive created: ${BOLD}$backup_path.tar.gz${NC}"

    # Create latest symlink
    ln -sf "$BACKUP_NAME.tar.gz" "$BACKUP_DIR/latest.tar.gz"
    log_success "Latest symlink updated"

    # Clean up temp directory
    rm -rf "$backup_path"

    # Calculate size
    local size=$(du -h "$backup_path.tar.gz" | cut -f1)

    log_section "Backup Complete"
    log_success "Backup created successfully!"
    echo ""
    log_info "Backup file: ${BOLD}$backup_path.tar.gz${NC}"
    log_info "Size: ${BOLD}$size${NC}"
    log_info "Timestamp: ${BOLD}$TIMESTAMP${NC}"

    # List all backups
    echo ""
    log_info "All backups:"
    ls -lht "$BACKUP_DIR"/*.tar.gz | head -5
}

# Restore function
perform_restore() {
    log_section "Restoring Backup"

    # Determine backup file to restore
    local restore_file
    if [ "$BACKUP_FILE" = "latest" ]; then
        restore_file="$BACKUP_DIR/latest.tar.gz"
    elif [ -f "$BACKUP_FILE" ]; then
        restore_file="$BACKUP_FILE"
    elif [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        restore_file="$BACKUP_DIR/$BACKUP_FILE"
    else
        log_error "Backup file not found: $BACKUP_FILE"
        echo ""
        log_info "Available backups:"
        ls -lht "$BACKUP_DIR"/*.tar.gz 2>/dev/null || log_warning "No backups found"
        exit 1
    fi

    log_info "Restoring from: ${BOLD}$restore_file${NC}"

    # Confirm restoration
    echo ""
    log_warning "This will overwrite current data!"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restoration cancelled"
        exit 0
    fi

    # Extract backup
    log_info "Extracting backup..."
    local temp_dir="$BACKUP_DIR/restore_temp"
    mkdir -p "$temp_dir"
    tar xzf "$restore_file" -C "$temp_dir"

    # Find the backup directory
    local backup_data=$(find "$temp_dir" -name "nixite_backup_*" -type d | head -1)
    if [ -z "$backup_data" ]; then
        log_error "Invalid backup file format"
        rm -rf "$temp_dir"
        exit 1
    fi

    log_success "Backup extracted"

    # Show metadata
    if [ -f "$backup_data/metadata.txt" ]; then
        echo ""
        log_info "Backup metadata:"
        cat "$backup_data/metadata.txt"
        echo ""
    fi

    # Restore files
    log_info "Restoring files..."

    # Backup current files (just in case)
    local safety_backup="$BACKUP_DIR/pre_restore_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$safety_backup"
    [ -f "nixite-packages.json" ] && cp nixite-packages.json "$safety_backup/"
    [ -f "config.js" ] && cp config.js "$safety_backup/"
    log_info "Current files backed up to: $safety_backup"

    # Restore package data
    if [ -f "$backup_data/nixite-packages.json" ]; then
        cp "$backup_data/nixite-packages.json" ./
        log_success "Package database restored"
    fi

    # Restore configuration
    if [ -f "$backup_data/config.js" ]; then
        cp "$backup_data/config.js" ./
        log_success "Configuration restored"
    fi

    # Restore custom data
    if [ -d "$backup_data/data" ]; then
        cp -r "$backup_data/data" ./
        log_success "Custom data restored"
    fi

    # Restore Docker volumes
    if [ -f "$backup_data/docker_volumes.tar.gz" ]; then
        if command -v docker &> /dev/null; then
            log_info "Restoring Docker volumes..."
            docker run --rm \
                -v nixite_data:/data \
                -v "$(pwd)/$backup_data:/backup" \
                alpine \
                tar xzf /backup/docker_volumes.tar.gz -C /
            log_success "Docker volumes restored"
        fi
    fi

    # Restore Kubernetes resources
    if [ -f "$backup_data/k8s_resources.yaml" ]; then
        if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
            log_info "Restoring Kubernetes resources..."
            kubectl apply -f "$backup_data/k8s_resources.yaml"
            log_success "Kubernetes resources restored"
        fi
    fi

    # Clean up
    rm -rf "$temp_dir"

    log_section "Restore Complete"
    log_success "Restoration completed successfully!"
    echo ""
    log_info "Safety backup: ${BOLD}$safety_backup${NC}"
    log_warning "Please restart Nixite services for changes to take effect"
}

# List backups function
list_backups() {
    log_section "Available Backups"

    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.tar.gz 2>/dev/null)" ]; then
        echo ""
        printf "%-30s %-10s %-20s\n" "BACKUP FILE" "SIZE" "DATE"
        echo "────────────────────────────────────────────────────────────────"

        for backup in "$BACKUP_DIR"/*.tar.gz; do
            [ -L "$backup" ] && continue  # Skip symlinks
            local filename=$(basename "$backup")
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" 2>/dev/null | cut -d'.' -f1 || stat -f "%Sm" "$backup")
            printf "%-30s %-10s %-20s\n" "$filename" "$size" "$date"
        done

        echo ""
        log_info "Total backups: $(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)"
        log_info "Total size: $(du -sh $BACKUP_DIR | cut -f1)"
    else
        log_warning "No backups found in $BACKUP_DIR"
    fi
}

# Main logic
case "$OPERATION" in
    "backup"|"create")
        perform_backup
        ;;

    "restore"|"recover")
        perform_restore
        ;;

    "list"|"ls")
        list_backups
        ;;

    "clean")
        log_section "Cleaning Old Backups"

        KEEP_COUNT="${2:-5}"  # Keep last 5 backups by default

        log_info "Keeping last $KEEP_COUNT backups..."

        cd "$BACKUP_DIR"
        ls -t *.tar.gz 2>/dev/null | grep -v "latest.tar.gz" | tail -n +$((KEEP_COUNT + 1)) | while read file; do
            log_info "Removing: $file"
            rm "$file"
        done

        log_success "Cleanup complete"
        list_backups
        ;;

    "verify")
        log_section "Verifying Backup"

        local verify_file="${2:-$BACKUP_DIR/latest.tar.gz}"

        if [ ! -f "$verify_file" ]; then
            log_error "Backup file not found: $verify_file"
            exit 1
        fi

        log_info "Verifying: $verify_file"

        # Check if tar file is valid
        if tar tzf "$verify_file" > /dev/null 2>&1; then
            log_success "Backup archive is valid"

            # List contents
            echo ""
            log_info "Backup contents:"
            tar tzf "$verify_file" | head -20

            local file_count=$(tar tzf "$verify_file" | wc -l)
            log_info "Total files: $file_count"
        else
            log_error "Backup archive is corrupted"
            exit 1
        fi
        ;;

    "help"|"--help"|"-h")
        echo "Usage: $0 <operation> [options]"
        echo ""
        echo "Operations:"
        echo "  backup             Create a new backup"
        echo "  restore [file]     Restore from backup (default: latest)"
        echo "  list               List all backups"
        echo "  clean [count]      Keep only last N backups (default: 5)"
        echo "  verify [file]      Verify backup integrity"
        echo "  help               Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 backup                              # Create backup"
        echo "  $0 restore                             # Restore latest backup"
        echo "  $0 restore nixite_backup_20250115.tar.gz  # Restore specific backup"
        echo "  $0 list                                # List all backups"
        echo "  $0 clean 10                            # Keep last 10 backups"
        echo "  $0 verify latest.tar.gz                # Verify backup"
        echo ""
        echo "Environment Variables:"
        echo "  BACKUP_DIR         Backup directory (default: ./backups)"
        echo ""
        echo "Examples:"
        echo "  BACKUP_DIR=/mnt/backups $0 backup     # Backup to custom location"
        ;;

    *)
        log_error "Unknown operation: $OPERATION"
        echo ""
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
