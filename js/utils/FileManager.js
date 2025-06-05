/**
 * 文件管理模块
 */
export class FileManager {
    constructor(uiManager, spriteGenerator, progressManager) {
        this.uiManager = uiManager;
        this.spriteGenerator = spriteGenerator;
        this.progressManager = progressManager;
        this.currentFile = null;
        this.video = null;
    }

    async loadFile(file) {
        try {
            if (!this.validateVideoFile(file)) {
                this.uiManager.showError('请选择有效的视频文件！');
                return false;
            }

            if (file.size > 100 * 1024 * 1024) {
                this.uiManager.showError('文件大小超过100MB限制！');
                return false;
            }

            this.currentFile = file;
            const video = await this.createVideoElement(file);
            this.video = video;
            
            if (window.app && window.app.processor) {
                window.app.processor.setVideo(video);
            }
            
            this.uiManager.showFileInfo(file, video);
            this.uiManager.showSuccess('视频加载成功！');
            
            return true;
        } catch (error) {
            console.error('File loading error:', error);
            this.uiManager.showError('文件加载失败: ' + error.message);
            return false;
        }
    }

    validateVideoFile(file) {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        return validTypes.some(type => file.type.startsWith(type));
    }

    createVideoElement(file) {
        return new Promise((resolve, reject) => {
            if (this.video) {
                URL.revokeObjectURL(this.video.src);
            }

            const video = document.createElement('video');
            video.muted = true;
            video.crossOrigin = 'anonymous';
            video.preload = 'metadata';
            
            const timeout = setTimeout(() => {
                video.removeEventListener('loadedmetadata', onLoad);
                video.removeEventListener('error', onError);
                reject(new Error('视频加载超时'));
            }, 10000);

            const onLoad = () => {
                clearTimeout(timeout);
                video.removeEventListener('loadedmetadata', onLoad);
                video.removeEventListener('error', onError);
                
                if (video.duration === 0 || isNaN(video.duration)) {
                    reject(new Error('无效的视频文件'));
                    return;
                }
                
                resolve(video);
            };

            const onError = (e) => {
                clearTimeout(timeout);
                video.removeEventListener('loadedmetadata', onLoad);
                video.removeEventListener('error', onError);
                reject(new Error('无法解码视频文件'));
            };

            video.addEventListener('loadedmetadata', onLoad);
            video.addEventListener('error', onError);
            video.src = URL.createObjectURL(file);
        });
    }

    removeFile() {
        if (this.video) {
            URL.revokeObjectURL(this.video.src);
            this.video = null;
        }
        
        if (window.app && window.app.processor) {
            window.app.processor.setVideo(null);
        }
        
        this.currentFile = null;
        this.uiManager.hideFileInfo();
    }

    async downloadSprite() {
        try {
            const canvas = document.getElementById('spriteCanvas');
            if (!canvas) {
                throw new Error('没有可下载的精灵图');
            }

            const quality = parseFloat(document.getElementById('quality').value);
            const blob = await this.canvasToBlob(canvas, quality);
            this.downloadBlob(blob, 'spritesheet.png');
            this.uiManager.showSuccess('精灵图下载成功！');
        } catch (error) {
            console.error('Download sprite error:', error);
            this.uiManager.showError('下载失败: ' + error.message);
        }
    }

    downloadConfig() {
        try {
            const configData = this.progressManager.getConfigData();
            if (!configData) {
                throw new Error('没有可下载的配置数据');
            }

            const configJson = JSON.stringify(configData, null, 2);
            const blob = new Blob([configJson], { type: 'application/json' });
            this.downloadBlob(blob, 'sprite-config.json');
            this.uiManager.showSuccess('配置文件下载成功！');
        } catch (error) {
            console.error('Download config error:', error);
            this.uiManager.showError('下载失败: ' + error.message);
        }
    }

    canvasToBlob(canvas, quality) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png', quality);
        });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    getFileInfo() {
        if (!this.currentFile || !this.video) {
            return null;
        }

        return {
            name: this.currentFile.name,
            size: this.currentFile.size,
            type: this.currentFile.type,
            duration: this.video.duration,
            videoWidth: this.video.videoWidth,
            videoHeight: this.video.videoHeight
        };
    }

    getVideo() {
        return this.video;
    }

    hasFile() {
        return this.currentFile !== null && this.video !== null;
    }

    reset() {
        this.removeFile();
    }
} 