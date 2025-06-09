/**
 * 背景移除模块
 * 提供多种专业的背景抠图算法
 */
export class BackgroundRemover {
    constructor() {
        this.algorithms = {
            edge: this.removeBackgroundByEdge.bind(this),
            color: this.removeBackgroundByColor.bind(this),
            smart: this.removeBackgroundSmart.bind(this),
            greenscreen: this.removeGreenScreen.bind(this)
        };
    }

    /**
     * 移除背景主函数
     */
    removeBackground(ctx, width, height) {
        const method = document.getElementById('bgMethod').value;
        const imageData = ctx.getImageData(0, 0, width, height);
        
        if (this.algorithms[method]) {
            this.algorithms[method](imageData.data, width, height);
            ctx.putImageData(imageData, 0, 0);
        } else {
            console.warn('Unknown background removal method:', method);
        }
    }

    /**
     * 边缘检测法
     */
    removeBackgroundByEdge(data, width, height) {
        const edgeThreshold = this.getParameter('edgeThreshold', 5);
        const brightnessThreshold = this.getParameter('brightnessThreshold', 50);
        
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor(i / 4 / width);
            const isEdge = x < edgeThreshold || x >= width - edgeThreshold || 
                          y < edgeThreshold || y >= height - edgeThreshold;
            
            if (isEdge) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                
                if (brightness > 255 - brightnessThreshold || brightness < brightnessThreshold) {
                    data[i + 3] = 0; // 完全透明
                } else if (brightness > 255 - brightnessThreshold * 1.5 || brightness < brightnessThreshold * 1.5) {
                    data[i + 3] = Math.floor(data[i + 3] * 0.3); // 半透明
                }
            }
        }
    }

    /**
     * 颜色阈值法
     */
    removeBackgroundByColor(data, width, height) {
        const colorThreshold = this.getParameter('colorThreshold', 60);
        const bgColor = this.detectBackgroundColor(data, width, height);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 计算欧几里得距离
            const distance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            if (distance < colorThreshold) {
                data[i + 3] = 0; // 透明
            } else if (distance < colorThreshold * 1.5) {
                // 渐变透明
                const alpha = Math.floor((distance - colorThreshold) / (colorThreshold * 0.5) * 255);
                data[i + 3] = Math.min(alpha, data[i + 3]);
            }
        }
    }

    /**
     * 智能组合法
     */
    removeBackgroundSmart(data, width, height) {
        const edgeThreshold = this.getParameter('edgeThreshold', 5);
        const colorThreshold = this.getParameter('colorThreshold', 60);
        const bgColor = this.detectBackgroundColor(data, width, height);
        
        // 第一遍：边缘检测
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor(i / 4 / width);
            const isEdge = x < edgeThreshold || x >= width - edgeThreshold || 
                          y < edgeThreshold || y >= height - edgeThreshold;
            
            if (isEdge) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const distance = Math.sqrt(
                    Math.pow(r - bgColor.r, 2) +
                    Math.pow(g - bgColor.g, 2) +
                    Math.pow(b - bgColor.b, 2)
                );
                
                if (distance < colorThreshold * 1.2) {
                    data[i + 3] = 0;
                }
            }
        }
        
        // 第二遍：全图颜色匹配
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const distance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            if (distance < colorThreshold * 0.7) {
                data[i + 3] = 0;
            }
        }
        
        // 第三遍：形态学操作
        this.morphologyClean(data, width, height);
    }

    /**
     * 绿幕/蓝幕处理
     */
    removeGreenScreen(data, width, height) {
        const screenType = this.getParameter('screenType', 'auto');
        const chromaThreshold = this.getParameter('chromaThreshold', 40);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            let isChroma = false;
            
            if (screenType === 'green') {
                isChroma = g > r + chromaThreshold && g > b + chromaThreshold && g > 100;
            } else if (screenType === 'blue') {
                isChroma = b > r + chromaThreshold && b > g + chromaThreshold && b > 100;
            } else {
                // 自动检测
                const maxChannel = Math.max(r, g, b);
                const minChannel = Math.min(r, g, b);
                
                if (maxChannel - minChannel > chromaThreshold) {
                    if (g === maxChannel && g > 100) {
                        isChroma = true;
                    } else if (b === maxChannel && b > 100) {
                        isChroma = true;
                    }
                }
            }
            
            if (isChroma) {
                data[i + 3] = 0;
            }
        }
    }

    /**
     * 检测背景色
     */
    detectBackgroundColor(data, width, height) {
        const samples = [];
        const sampleSize = Math.min(10, Math.floor(width / 10));
        
        // 采样四个角落
        const corners = [
            {startX: 0, startY: 0},
            {startX: width - sampleSize, startY: 0},
            {startX: 0, startY: height - sampleSize},
            {startX: width - sampleSize, startY: height - sampleSize}
        ];
        
        corners.forEach(corner => {
            for (let y = corner.startY; y < corner.startY + sampleSize && y < height; y++) {
                for (let x = corner.startX; x < corner.startX + sampleSize && x < width; x++) {
                    const idx = (y * width + x) * 4;
                    samples.push({
                        r: data[idx],
                        g: data[idx + 1],
                        b: data[idx + 2]
                    });
                }
            }
        });
        
        // 计算平均色
        const avgColor = samples.reduce((acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b
        }), {r: 0, g: 0, b: 0});
        
        return {
            r: Math.round(avgColor.r / samples.length),
            g: Math.round(avgColor.g / samples.length),
            b: Math.round(avgColor.b / samples.length)
        };
    }

    /**
     * 形态学清理操作
     */
    morphologyClean(data, width, height) {
        const kernel = 2;
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = kernel; y < height - kernel; y++) {
            for (let x = kernel; x < width - kernel; x++) {
                const idx = (y * width + x) * 4;
                
                if (tempData[idx + 3] === 0) continue;
                
                let transparentCount = 0;
                let totalCount = 0;
                
                for (let dy = -kernel; dy <= kernel; dy++) {
                    for (let dx = -kernel; dx <= kernel; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        if (tempData[nIdx + 3] === 0) {
                            transparentCount++;
                        }
                        totalCount++;
                    }
                }
                
                if (transparentCount > totalCount * 0.6) {
                    data[idx + 3] = 0;
                }
            }
        }
    }

    /**
     * 获取参数值
     */
    getParameter(paramName, defaultValue) {
        const element = document.getElementById(paramName);
        if (element) {
            return element.type === 'range' || element.type === 'number' 
                ? parseInt(element.value) 
                : element.value;
        }
        return defaultValue;
    }

    /**
     * 预览抠图效果
     */
    async previewEffect() {
        const video = window.app?.fileManager?.video;
        if (!video) {
            alert('请先选择视频文件！');
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 200;

            // 设置视频到第一帧
            video.currentTime = 0;
            
            await new Promise((resolve) => {
                const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                video.addEventListener('seeked', onSeeked);
            });

            // 绘制视频帧
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 应用背景移除
            if (document.getElementById('removeBg').checked) {
                this.removeBackground(ctx, canvas.width, canvas.height);
            }

            // 创建预览窗口
            this.showPreviewWindow(canvas);

        } catch (error) {
            console.error('Preview error:', error);
            alert('预览失败: ' + error.message);
        }
    }

    /**
     * 显示预览窗口
     */
    showPreviewWindow(canvas) {
        // 移除现有的预览模态窗口（如果存在）
        const existingModal = document.getElementById('previewModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 创建模态窗口
        const modal = document.createElement('div');
        modal.id = 'previewModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const algorithmName = document.getElementById('bgMethod').selectedOptions[0].text;
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 relative">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                        <span class="mr-2">🎨</span>
                        抠图效果预览
                    </h3>
                    <button onclick="this.closest('#previewModal').remove()" 
                            class="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                </div>
                
                <div class="mb-4 p-4 rounded-lg" style="background: repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 20px 20px;">
                    <canvas id="previewCanvas" class="border-2 border-gray-300 rounded-lg shadow-lg mx-auto block"></canvas>
                </div>
                
                <div class="text-center">
                    <p class="text-sm text-gray-600 mb-4">算法: ${algorithmName}</p>
                    <button onclick="this.closest('#previewModal').remove()" 
                            class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                        关闭预览
                    </button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 设置预览画布
        const previewCanvas = document.getElementById('previewCanvas');
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
        
        // 点击背景关闭模态窗口
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // ESC键关闭模态窗口
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * 重置背景移除器
     */
    reset() {
        // 重置为默认算法
        const bgMethodSelect = document.getElementById('bgMethod');
        if (bgMethodSelect) {
            bgMethodSelect.value = 'smart';
        }
    }
}