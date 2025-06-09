/**
 * UI管理模块
 * 负责界面交互和状态管理
 */
export class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.initializeUI();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        return {
            // 文件相关
            uploadArea: document.getElementById('uploadArea'),
            videoInput: document.getElementById('videoInput'),
            fileInfo: document.getElementById('fileInfo'),
            fileName: document.getElementById('fileName'),
            fileDetails: document.getElementById('fileDetails'),
            
            // 设置相关
            quality: document.getElementById('quality'),
            qualityValue: document.getElementById('qualityValue'),
            removeBg: document.getElementById('removeBg'),
            bgSettings: document.getElementById('bgSettings'),
            bgMethod: document.getElementById('bgMethod'),
            algorithmParams: document.getElementById('algorithmParams'),
            
            // 按钮
            processBtn: document.getElementById('processBtn')
        };
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 文件上传事件
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.videoInput.click();
        });

        this.elements.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.elements.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.elements.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.elements.videoInput.addEventListener('change', this.handleFileSelect.bind(this));

        // 设置事件
        this.elements.quality.addEventListener('input', this.updateQualityDisplay.bind(this));
        this.elements.removeBg.addEventListener('change', this.toggleBackgroundSettings.bind(this));
        this.elements.bgMethod.addEventListener('change', this.updateAlgorithmParams.bind(this));
    }

    /**
     * 初始化UI状态
     */
    initializeUI() {
        this.updateQualityDisplay();
        this.updateAlgorithmParams();
        this.toggleBackgroundSettings(); // 确保背景设置区域正确显示
    }

    /**
     * 处理拖拽悬停
     */
    handleDragOver(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.add('drag-active');
    }

    /**
     * 处理拖拽离开
     */
    handleDragLeave(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('drag-active');
    }

    /**
     * 处理文件拖拽放置
     */
    handleDrop(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('drag-active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.selectFile(files[0]);
        }
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.selectFile(files[0]);
        }
    }

    /**
     * 选择文件
     */
    selectFile(file) {
        if (!file.type.startsWith('video/')) {
            this.showError('请选择有效的视频文件！');
            return;
        }

        // 通知应用处理文件
        if (window.app && window.app.fileManager) {
            window.app.fileManager.loadFile(file);
        }
    }

    /**
     * 显示文件信息
     */
    showFileInfo(file, video) {
        this.elements.fileName.textContent = file.name;
        this.elements.fileDetails.textContent = 
            `${this.formatFileSize(file.size)} | 时长: ${this.formatDuration(video.duration)}`;
        this.elements.fileInfo.classList.remove('hidden');
        this.elements.processBtn.disabled = false;
    }

    /**
     * 隐藏文件信息
     */
    hideFileInfo() {
        this.elements.fileInfo.classList.add('hidden');
        this.elements.processBtn.disabled = true;
    }

    /**
     * 更新质量显示
     */
    updateQualityDisplay() {
        const quality = this.elements.quality.value;
        this.elements.qualityValue.textContent = Math.round(quality * 100) + '%';
    }

    /**
     * 切换背景设置显示
     */
    toggleBackgroundSettings() {
        const isEnabled = this.elements.removeBg.checked;
        this.elements.bgSettings.classList.toggle('hidden', !isEnabled);
        
        if (isEnabled) {
            this.updateAlgorithmParams();
        }
    }

    /**
     * 更新算法参数界面
     */
    updateAlgorithmParams() {
        const method = this.elements.bgMethod.value;
        const paramsContainer = this.elements.algorithmParams;
        
        // 清空现有参数
        paramsContainer.innerHTML = '';
        
        // 根据算法添加对应参数
        const params = this.getAlgorithmParams(method);
        params.forEach(param => {
            paramsContainer.appendChild(this.createParameterElement(param));
        });
    }

    /**
     * 获取算法参数配置
     */
    getAlgorithmParams(method) {
        const paramConfigs = {
            edge: [
                { id: 'edgeThreshold', label: '边缘区域 (像素)', type: 'range', min: 1, max: 20, value: 5 },
                { id: 'brightnessThreshold', label: '亮度阈值', type: 'range', min: 10, max: 100, value: 50 }
            ],
            color: [
                { id: 'colorThreshold', label: '颜色相似度', type: 'range', min: 10, max: 150, value: 60 }
            ],
            smart: [
                { id: 'edgeThreshold', label: '边缘区域 (像素)', type: 'range', min: 1, max: 20, value: 5 },
                { id: 'colorThreshold', label: '颜色相似度', type: 'range', min: 10, max: 150, value: 60 }
            ],
            greenscreen: [
                { id: 'screenType', label: '幕布类型', type: 'select', options: [
                    { value: 'auto', text: '自动检测' },
                    { value: 'green', text: '绿幕' },
                    { value: 'blue', text: '蓝幕' }
                ], value: 'auto' },
                { id: 'chromaThreshold', label: '色度阈值', type: 'range', min: 20, max: 100, value: 40 }
            ]
        };
        
        return paramConfigs[method] || [];
    }

    /**
     * 创建参数元素
     */
    createParameterElement(param) {
        const container = document.createElement('div');
        container.className = 'space-y-2';
        
        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700';
        label.textContent = param.label;
        
        if (param.type === 'range') {
            const valueSpan = document.createElement('span');
            valueSpan.id = param.id + 'Value';
            valueSpan.className = 'text-indigo-600 font-semibold ml-2';
            valueSpan.textContent = param.value;
            label.appendChild(valueSpan);
            
            const input = document.createElement('input');
            input.type = 'range';
            input.id = param.id;
            input.min = param.min;
            input.max = param.max;
            input.value = param.value;
            input.className = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer';
            input.addEventListener('input', () => {
                valueSpan.textContent = input.value;
            });
            
            container.appendChild(label);
            container.appendChild(input);
        } else if (param.type === 'select') {
            const select = document.createElement('select');
            select.id = param.id;
            select.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
            
            param.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                if (option.value === param.value) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });
            
            container.appendChild(label);
            container.appendChild(select);
        }
        
        return container;
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        // 创建临时错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-transform';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-transform';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化时长
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 重置UI状态
     */
    reset() {
        this.hideFileInfo();
        this.elements.videoInput.value = '';
        this.elements.removeBg.checked = true; // 默认启用背景抠图
        this.toggleBackgroundSettings();
        
        // 重置所有设置为默认值
        document.getElementById('frameWidth').value = 64;
        document.getElementById('frameHeight').value = 64;
        document.getElementById('frameInterval').value = 100;
        this.elements.quality.value = 0.9;
        this.updateQualityDisplay();
    }
} 