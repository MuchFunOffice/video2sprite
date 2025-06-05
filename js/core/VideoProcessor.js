/**
 * 视频处理核心模块
 * 负责视频帧提取和整体处理流程控制
 */
export class VideoProcessor {
    constructor(progressManager, backgroundRemover, spriteGenerator) {
        this.progressManager = progressManager;
        this.backgroundRemover = backgroundRemover;
        this.spriteGenerator = spriteGenerator;
        this.video = null;
        this.isProcessing = false;
    }

    /**
     * 设置视频文件
     */
    setVideo(video) {
        this.video = video;
    }

    /**
     * 开始处理流程
     */
    async startProcessing() {
        if (!this.video || this.isProcessing) {
            console.warn('No video loaded or already processing');
            return;
        }

        try {
            this.isProcessing = true;
            this.progressManager.show();
            
            const settings = this.getSettings();
            const frames = await this.extractFrames(settings);
            const spriteCanvas = await this.spriteGenerator.createSprite(frames, settings);
            
            this.progressManager.update(100, '处理完成！');
            this.progressManager.showResults(spriteCanvas, this.createConfigData(settings, frames.length));

        } catch (error) {
            console.error('Processing error:', error);
            this.progressManager.showError('处理失败: ' + error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 提取视频帧
     */
    async extractFrames(settings) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = settings.frameWidth;
        canvas.height = settings.frameHeight;

        const totalFrames = settings.spriteWidth * settings.spriteHeight;
        const frames = [];
        
        this.progressManager.update(10, '开始提取视频帧...');

        for (let i = 0; i < totalFrames; i++) {
            const time = (i * settings.frameInterval) / 1000;
            
            // 检查是否超出视频时长
            if (time >= this.video.duration) {
                console.log(`Reached end of video at frame ${i}`);
                break;
            }

            try {
                const frameData = await this.extractSingleFrame(time, canvas, ctx, settings);
                frames.push(frameData);
                
                const progress = 10 + (i / totalFrames) * 70;
                this.progressManager.update(progress, `提取帧 ${i + 1}/${totalFrames}...`);
            } catch (error) {
                console.warn(`Failed to extract frame at time ${time}:`, error);
                continue;
            }
        }

        if (frames.length === 0) {
            throw new Error('未能提取到任何视频帧');
        }

        this.progressManager.update(80, `成功提取 ${frames.length} 帧，生成精灵图...`);
        return frames;
    }

    /**
     * 提取单个视频帧
     */
    async extractSingleFrame(time, canvas, ctx, settings) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.video.removeEventListener('seeked', onSeeked);
                reject(new Error(`Frame extraction timeout at ${time}s`));
            }, 5000);

            const onSeeked = () => {
                try {
                    clearTimeout(timeoutId);
                    this.video.removeEventListener('seeked', onSeeked);
                    
                    // 清空画布
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // 绘制视频帧
                    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
                    
                    // 应用背景移除
                    if (settings.removeBg) {
                        this.backgroundRemover.removeBackground(ctx, settings.frameWidth, settings.frameHeight);
                    }
                    
                    // 获取图像数据
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                } catch (error) {
                    reject(error);
                }
            };

            this.video.addEventListener('seeked', onSeeked);
            this.video.currentTime = time;
        });
    }

    /**
     * 获取当前设置
     */
    getSettings() {
        return {
            spriteWidth: parseInt(document.getElementById('spriteWidth').value),
            spriteHeight: parseInt(document.getElementById('spriteHeight').value),
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
            frameInterval: settings.frameInterval,
            backgroundRemoved: settings.removeBg,
            backgroundMethod: settings.bgMethod,
            quality: settings.quality,
            generatedAt: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    /**
     * 停止处理
     */
    stopProcessing() {
        this.isProcessing = false;
    }

    /**
     * 重置处理器状态
     */
    reset() {
        this.stopProcessing();
        this.video = null;
    }
} 