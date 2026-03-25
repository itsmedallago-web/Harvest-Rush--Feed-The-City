// ===== FARM GRID SYSTEM =====
// Manages the farm grid, plots, and player interaction

const Farm = {
    plots: [],
    gridCols: 4,
    gridRows: 3,
    plotSize: 48,
    offsetX: 0,
    offsetY: 0,

    init(canvasWidth, canvasHeight) {
        this.plots = [];
        this.offsetX = (canvasWidth - this.gridCols * this.plotSize) / 2;
        this.offsetY = (canvasHeight - this.gridRows * this.plotSize) / 2 + 30;

        for (let r = 0; r < this.gridRows; r++) {
            for (let c = 0; c < this.gridCols; c++) {
                this.plots.push({
                    row: r,
                    col: c,
                    x: this.offsetX + c * this.plotSize,
                    y: this.offsetY + r * this.plotSize,
                    tilled: false,
                    crop: null,
                });
            }
        }
    },

    getPlotAt(worldX, worldY) {
        for (const plot of this.plots) {
            if (worldX >= plot.x && worldX < plot.x + this.plotSize &&
                worldY >= plot.y && worldY < plot.y + this.plotSize) {
                return plot;
            }
        }
        return null;
    },

    getPlotAtGrid(row, col) {
        return this.plots.find(p => p.row === row && p.col === col) || null;
    },

    // Gets the nearest plot to a world position
    getNearestPlot(worldX, worldY, maxDist = 60) {
        let nearest = null;
        let minDist = Infinity;

        for (const plot of this.plots) {
            const cx = plot.x + this.plotSize / 2;
            const cy = plot.y + this.plotSize / 2;
            const dist = Math.sqrt((worldX - cx) ** 2 + (worldY - cy) ** 2);
            if (dist < minDist && dist < maxDist) {
                minDist = dist;
                nearest = plot;
            }
        }
        return nearest;
    },

    tillPlot(plot) {
        if (plot && !plot.tilled) {
            plot.tilled = true;
            return true;
        }
        return false;
    },

    plantCrop(plot, cropType) {
        if (plot && plot.tilled && !plot.crop) {
            plot.crop = CropSystem.createCrop(cropType);
            return true;
        }
        return false;
    },

    waterPlot(plot) {
        if (plot && plot.crop) {
            return CropSystem.waterCrop(plot.crop);
        }
        return false;
    },

    harvestPlot(plot) {
        if (plot && plot.crop && plot.crop.isReady) {
            const result = CropSystem.harvestCrop(plot.crop);
            plot.crop = null;
            plot.tilled = false;
            return result;
        }
        return null;
    },

    updateCrops(deltaTime, dayPassed) {
        for (const plot of this.plots) {
            if (plot.crop) {
                CropSystem.updateCrop(plot.crop, deltaTime, dayPassed);
            }
        }
    },

    draw(ctx) {
        // Draw grass background behind the farm
        for (let r = -1; r <= this.gridRows; r++) {
            for (let c = -2; c <= this.gridCols + 1; c++) {
                const x = this.offsetX + c * this.plotSize;
                const y = this.offsetY + r * this.plotSize;
                Sprites.drawGrassTile(ctx, x, y, r * 7 + c);
            }
        }

        // Draw plots
        for (const plot of this.plots) {
            if (plot.tilled) {
                Sprites.drawPlot(ctx, plot.x, plot.y, 'tilled',
                    plot.crop ? plot.crop.waterLevel : 0);
            } else {
                Sprites.drawPlot(ctx, plot.x, plot.y, 'empty', 0);
                // Subtle hint
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(plot.x, plot.y, this.plotSize, this.plotSize);
            }

            // Draw crop
            if (plot.crop) {
                Sprites.drawCrop(ctx, plot.x, plot.y, plot.crop.type, plot.crop.stage);

                // Water indicator
                if (plot.crop.needsWater && !plot.crop.isReady) {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('💧', plot.x + 2, plot.y + 14);
                }

                // Overwatered warning
                if (plot.crop.overWatered) {
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('⚠️', plot.x + 30, plot.y + 14);
                }

                // Ready indicator
                if (plot.crop.isReady) {
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('✅', plot.x + 16, plot.y - 4);
                }
            }
        }

        // Farm border/fence
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 3;
        const farmX = this.offsetX - 8;
        const farmY = this.offsetY - 8;
        const farmW = this.gridCols * this.plotSize + 16;
        const farmH = this.gridRows * this.plotSize + 16;
        ctx.strokeRect(farmX, farmY, farmW, farmH);

        // Fence posts
        ctx.fillStyle = '#8b6914';
        for (let i = 0; i <= this.gridCols; i++) {
            ctx.fillRect(this.offsetX + i * this.plotSize - 4, farmY - 4, 6, 8);
            ctx.fillRect(this.offsetX + i * this.plotSize - 4, farmY + farmH - 4, 6, 8);
        }
    },
};
