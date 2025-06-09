/**
 * 帧选择器模块
 * 负责视频帧的显示、选择和管理
 */
export class FrameSelector {
    constructor(progressManager, spriteGenerator) {
        this.progressManager = progressManager;
        this.spriteGenerator = spriteGenerator;
        this.frames = []; // 存储所有提取的帧
        this.selectedFrameIndices = new Set(); // 存储选择的帧索引
        this.isVisible = false;
        
        this.initializeEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 监听键盘事件进行快捷操作
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'a':
                        e.preventDefault();
                        this.selectAll();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.deselectAll();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.reverseSelection();
                        break;
                }
            }
        });
    }

    /**
     * 显示帧选择界面
     */
    show(frames) {
        this.frames = frames;
        this.selectedFrameIndices.clear();
        this.isVisible = true;
        
        // 显示帧选择区域
        const section = document.getElementById('frameSelectionSection');
        section.classList.remove('hidden');
        
        // 渲染帧网格
        this.renderFrameGrid();
        
        // 滚动到帧选择区域
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        console.log(`📷 显示 ${frames.length} 帧供用户选择`);
    }

    /**
     * 隐藏帧选择界面
     */
    hide() {
        this.isVisible = false;
        document.getElementById('frameSelectionSection').classList.add('hidden');
    }

    /**
     * 渲染帧网格
     */
    renderFrameGrid() {
        const grid = document.getElementById('frameGrid');
        const framesPerRow = parseInt(document.getElementById('framesPerRow').value);
        
        // 更新网格布局
        grid.className = 'frame-grid';
        grid.style.gridTemplateColumns = `repeat(${framesPerRow}, 1fr)`;
        
        // 清空现有内容
        grid.innerHTML = '';
        
        // 创建帧缩略图
        this.frames.forEach((frameData, index) => {
            const frameContainer = this.createFrameElement(frameData, index);
            grid.appendChild(frameContainer);
        });
        
        this.updateSelectedCount();
    }

    /**
     * 创建单个帧元素
     */
    createFrameElement(frameData, index) {
        // 创建临时canvas来生成缩略图
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置缩略图尺寸
        const thumbnailSize = 120;
        canvas.width = thumbnailSize;
        canvas.height = thumbnailSize;
        
        // 将ImageData绘制到canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = frameData.width;
        tempCanvas.height = frameData.height;
        tempCtx.putImageData(frameData, 0, 0);
        
        // 绘制缩略图（保持比例）
        const scale = Math.min(thumbnailSize / frameData.width, thumbnailSize / frameData.height);
        const scaledWidth = frameData.width * scale;
        const scaledHeight = frameData.height * scale;
        const offsetX = (thumbnailSize - scaledWidth) / 2;
        const offsetY = (thumbnailSize - scaledHeight) / 2;
        
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
        ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
        
        // 创建容器元素
        const container = document.createElement('div');
        container.className = 'frame-thumbnail cursor-pointer border-2 border-transparent rounded-lg';
        container.dataset.frameIndex = index;
        
        container.innerHTML = `
            <img src="${canvas.toDataURL()}" 
                 alt="帧 ${index + 1}" 
                 class="w-full h-auto block rounded-lg">
            <div class="frame-overlay"></div>
            <div class="frame-number">${index + 1}</div>
            <div class="frame-checkbox">
                <svg class="w-4 h-4 text-white hidden" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
            </div>
        `;
        
        // 添加点击事件
        container.addEventListener('click', () => this.toggleFrameSelection(index));
        
        return container;
    }

    /**
     * 切换帧选择状态
     */
    toggleFrameSelection(index) {
        const container = document.querySelector(`[data-frame-index="${index}"]`);
        const checkbox = container.querySelector('.frame-checkbox');
        const checkboxSvg = container.querySelector('.frame-checkbox svg');
        
        if (this.selectedFrameIndices.has(index)) {
            // 取消选择
            this.selectedFrameIndices.delete(index);
            checkboxSvg.classList.add('hidden');
            checkbox.classList.remove('checked');
            container.classList.remove('selected');
        } else {
            // 选择
            this.selectedFrameIndices.add(index);
            checkboxSvg.classList.remove('hidden');
            checkbox.classList.add('checked');
            container.classList.add('selected');
        }
        
        this.updateSelectedCount();
        this.updateConfirmButton();
    }

    /**
     * 全选
     */
    selectAll() {
        this.selectedFrameIndices.clear();
        for (let i = 0; i < this.frames.length; i++) {
            this.selectedFrameIndices.add(i);
        }
        this.updateFrameVisuals();
        this.updateSelectedCount();
        this.updateConfirmButton();
    }

    /**
     * 全不选
     */
    deselectAll() {
        this.selectedFrameIndices.clear();
        this.updateFrameVisuals();
        this.updateSelectedCount();
        this.updateConfirmButton();
    }

    /**
     * 反选
     */
    reverseSelection() {
        const newSelection = new Set();
        for (let i = 0; i < this.frames.length; i++) {
            if (!this.selectedFrameIndices.has(i)) {
                newSelection.add(i);
            }
        }
        this.selectedFrameIndices = newSelection;
        this.updateFrameVisuals();
        this.updateSelectedCount();
        this.updateConfirmButton();
    }

    /**
     * 更新帧视觉效果
     */
    updateFrameVisuals() {
        for (let i = 0; i < this.frames.length; i++) {
            const container = document.querySelector(`[data-frame-index="${i}"]`);
            if (!container) continue;
            
            const checkbox = container.querySelector('.frame-checkbox');
            const checkboxSvg = container.querySelector('.frame-checkbox svg');
            
            if (this.selectedFrameIndices.has(i)) {
                checkboxSvg.classList.remove('hidden');
                checkbox.classList.add('checked');
                container.classList.add('selected');
            } else {
                checkboxSvg.classList.add('hidden');
                checkbox.classList.remove('checked');
                container.classList.remove('selected');
            }
        }
    }

    /**
     * 更新选择计数
     */
    updateSelectedCount() {
        const countElement = document.getElementById('selectedCount');
        countElement.textContent = `已选择: ${this.selectedFrameIndices.size} 帧`;
    }

    /**
     * 更新确认按钮状态
     */
    updateConfirmButton() {
        const button = document.getElementById('confirmFrameSelection');
        button.disabled = this.selectedFrameIndices.size === 0;
    }

    /**
     * 更新布局
     */
    updateLayout() {
        this.renderFrameGrid();
    }

    /**
     * 确认选择
     */
    async confirmSelection() {
        if (this.selectedFrameIndices.size === 0) {
            alert('请至少选择一帧！');
            return;
        }

        try {
            // 获取选中的帧数据
            const selectedFrames = Array.from(this.selectedFrameIndices)
                .sort((a, b) => a - b)
                .map(index => this.frames[index]);

            console.log(`✅ 用户选择了 ${selectedFrames.length} 帧，开始生成精灵图`);

            // 隐藏帧选择界面
            this.hide();

            // 显示进度条
            this.progressManager.show();
            this.progressManager.update(10, '准备生成精灵图...');

            // 获取设置
            const settings = this.getSettings();
            
            // 重新计算精灵图尺寸以适应选中的帧数
            const frameCount = selectedFrames.length;
            const cols = Math.ceil(Math.sqrt(frameCount));
            const rows = Math.ceil(frameCount / cols);
            
            settings.spriteWidth = cols;
            settings.spriteHeight = rows;

            // 生成精灵图
            const spriteCanvas = await this.spriteGenerator.createSprite(selectedFrames, settings);
            
            this.progressManager.update(100, '精灵图生成完成！');
            
            // 创建配置数据
            const configData = this.createConfigData(settings, selectedFrames.length);
            
            // 显示结果
            this.progressManager.showResults(spriteCanvas, configData);

        } catch (error) {
            console.error('生成精灵图失败:', error);
            this.progressManager.showError('生成精灵图失败: ' + error.message);
        }
    }

    /**
     * 获取当前设置
     */
    getSettings() {
        return {
            frameWidth: parseInt(document.getElementById('frameWidth').value),
            frameHeight: parseInt(document.getElementById('frameHeight').value),
            frameInterval: parseInt(document.getElementById('frameInterval').value),
            quality: parseFloat(document.getElementById('quality').value),
            removeBg: document.getElementById('removeBg').checked,
            bgMethod: document.getElementById('bgMethod').value
        };
    }

    /**
     * 创建配置数据
     */
    createConfigData(settings, frameCount) {
        return {
            spritesheet: 'spritesheet.png',
            frameWidth: settings.frameWidth,
            frameHeight: settings.frameHeight,
            totalFrames: frameCount,
            columns: settings.spriteWidth,
            rows: settings.spriteHeight,
            backgroundRemoved: settings.removeBg,
            backgroundMethod: settings.bgMethod,
            quality: settings.quality,
            generatedAt: new Date().toISOString(),
            version: '2.0.0',
            selectionMode: 'manual'
        };
    }

    /**
     * 重置选择器状态
     */
    reset() {
        this.frames = [];
        this.selectedFrameIndices.clear();
        this.hide();
    }

    /**
     * 获取选中的帧数据
     */
    getSelectedFrames() {
        return Array.from(this.selectedFrameIndices)
            .sort((a, b) => a - b)
            .map(index => this.frames[index]);
    }
} 