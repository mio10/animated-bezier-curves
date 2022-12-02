const config = {
    curvesNum        : 20,
    waveSpeed        : 0.25,
    wavesToBlend     : 1,
    mouseFollowDelta : 10,
  }

  class WaveNoise {
    constructor() {
      this.wavesSet = [];
    }
    addWaves(requiredWaves) {
      for(let i = 0 ; i < requiredWaves ; ++i) {
        let randomAngle = Math.random() * 360;
        this.wavesSet.push(randomAngle);
      }
    }
    getWave() {
      let blendedWave = 0;
      for (let e of this.wavesSet) {
        blendedWave += Math.sin(e / 180 * Math.PI);
      }
      return (blendedWave / this.wavesSet.length + 1) / 2;
    }
    update() {
      this.wavesSet.forEach((e, i) => {
        let r = (i + 1) * config.waveSpeed;
        this.wavesSet[i] = (e + r) % 360;
      });
    }
  }

  class Animation {
    constructor() {
      this.cnv = null;
      this.ctx = null;
      this.size = {w: 0, h: 0, cx: 0, cy: 0};
      this.controls = [];
      this.controlsNum = 6;
      this.frameCounter = 0;
      this.type4Start = 0.5;
      this.type4End = 0.5;

    }
    init() {
      this.createCanvas();
      this.createControls();
      this.updateAnimation();

      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
    }
    createCanvas() {
      this.cnv = document.createElement("canvas");
      this.ctx = this.cnv.getContext('2d');
      this.setCanvasSize();
      document.body.appendChild(this.cnv);
      window.addEventListener(`resize`, () => this.setCanvasSize());
    }
    setCanvasSize() {
      this.size.w  = this.cnv.width  = window.innerWidth;
      this.size.h  = this.cnv.height = window.innerHeight;
      this.size.cx = this.size.w / 2;
      this.size.cy = this.size.h / 2;

      this.originX1 = this.size.w / 4 + this.size.w / 5;
      this.originX2 = this.size.w / 4 + this.size.w * 4 / 5;
      this.originY1 = this.size.h;
      this.originY2 = this.size.h / 8;

      this.targetX1 = this.originX1;
      this.targetX2 = this.originX2;
      this.targetY1 = this.originY1;
      this.targetY2 = this.originY2;

      this.currentX1 = this.targetX1;
      this.currentX2 = this.targetX2;
      this.currentY1 = this.targetY1;
      this.currentY2 = this.targetY2;
    }
    createControls() {
      for (let i = 0 ; i < (this.controlsNum + config.curvesNum) ; ++i) {
        let control = new WaveNoise();
        control.addWaves(config.wavesToBlend);
        this.controls.push(control);
      }
    }
    updateControls() {
      this.controls.forEach( e => e.update() );
    }

    getYPlacementType(type, i) {
      if (type > .6) {
        return this.size.h / config.curvesNum * i;
      } else if (type > .4) {
        return this.size.cy;
      } else if (type > .2) {
        return this.size.h;
      } else {
        return 0;
      }
    }

    distance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
    }

    updateCurves() {
      let c = this.controls;

      let distanceFrom1 = this.distance(this.mouseX, this.mouseY, this.size.w / 4 + this.size.w / 2, this.size.h);
      let distanceFrom2 = this.distance(this.mouseX, this.mouseY, this.size.w / 4 + this.size.w / 2, 0);
      if (distanceFrom1 < distanceFrom2) {
        if (distanceFrom1 < this.size.w / 3.5) {
          this.targetX1 = this.mouseX;
          this.targetY1 = this.mouseY;
          this.targetX2 = this.originX2;
          this.targetY2 = this.originY2;
        } else {
          this.targetX2 = this.originX2;
          this.targetY2 = this.originY2;
          this.targetX1 = this.originX1;
          this.targetX2 = this.originX2;
        }
      } else {
        if (distanceFrom2 < this.size.w / 3.5) {
          this.targetX2 = this.mouseX;
          this.targetY2 = this.mouseY;
          this.targetX1 = this.originX1;
          this.targetX2 = this.originY1;
        } else {
          this.targetX2 = this.originX2;
          this.targetY2 = this.originY2;
          this.targetX1 = this.originX1;
          this.targetX2 = this.originX2;
        }
      }

      let subX1 = this.currentX1 - this.targetX1;
      let subX2 = this.currentX2 - this.targetX2;
      let subY1 = this.currentY1 - this.targetY1;
      let subY2 = this.currentY2 - this.targetY2;

      let subMag1 = Math.sqrt(subX1*subX1 + subY1*subY1);
      let subMag2 = Math.sqrt(subX2*subX2 + subY2*subY2);

      if (subMag1 > config.mouseFollowDelta && subMag1 != 0) {
        this.currentX1 -= subX1 / subMag1 * config.mouseFollowDelta;
        this.currentY1 -= subY1 / subMag1 * config.mouseFollowDelta;
      }

      if (subMag2 > config.mouseFollowDelta && subMag2 != 0) {
        this.currentX2 -= subX2 / subMag2 * config.mouseFollowDelta;
        this.currentY2 -= subY2 / subMag2 * config.mouseFollowDelta;
      }

      for (let i = 0 ; i < config.curvesNum ; ++i) {
        let factor = i / config.curvesNum;
        let _controlX1 = this.currentX1 - (c[1].getWave() - 0.5) * this.size.w * factor;
        let _controlX2 = this.currentX2 + (c[1].getWave() - 0.5) * this.size.w * factor;
        let _controlY1 = this.currentY1 - (c[2].getWave() - 0.5) * this.size.h * factor;
        let _controlY2 = this.currentY2 + (c[3].getWave() - 0.5) * this.size.h * factor;
        let curveParam = {
          startX     : this.size.w / 4 + this.size.w / 2 + ((c[1].getWave() - 0.5) * this.size.w / 3 * factor),
          startY     : this.size.h,
          controlX1  : _controlX1,
          controlY1  : _controlY1,
          controlX2  : _controlX2,
          controlY2  : _controlY2,
          endX       : this.size.w / 4 + this.size.w / 2 - ((c[3].getWave() - 0.5) * this.size.w / 3 * factor),
          endY       : 0,
          color      : `rgba(${245 - Math.floor(factor * 245)}, ${191 + Math.floor(factor * 64)}, ${217 - Math.floor(factor * 217)}, 1)`,
        }

        this.drawCurve(curveParam);
      }
    }
    drawCurve({startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY, color}) {
      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineWidth = 0.8;
      this.ctx.shadowBlur = 2;
      this.ctx.shadowColor = color;
      this.ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
      this.ctx.stroke();
    }
    updateCanvas() {
      let grad = this.ctx.createRadialGradient(this.size.w * 7 / 8, this.size.h / 6, this.size.h / 4, this.size.w * 7 / 8, this.size.h / 6, this.size.h);
      grad.addColorStop(0, `rgb(94, 103, 194)`);
      grad.addColorStop(1, `rgb(63, 57, 142)`);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.size.w, this.size.h);
    }

    updateAnimation() {
      this.updateCanvas();
      this.updateCurves();
      this.updateControls();

      window.requestAnimationFrame(() => this.updateAnimation());
    }
  }

  window.onload = () => {
    new Animation().init();
  }
