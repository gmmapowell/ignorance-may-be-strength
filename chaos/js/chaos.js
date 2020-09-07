function whichFunction() {
    var fn = new URLSearchParams(window.location.search).get("function");
    if (!fn)
        fn = "newton3";
    return fn;
}

function DrawState(fn, fc) {
    this.canvas = document.querySelector('.chaos');
    this.cx = this.canvas.getContext("2d");
    this.canvas.onmousedown = e => this.beginSelecting(e);
    this.canvas.onmousemove = e => this.dragSelection(e);
    this.canvas.onmouseup = e => this.endSelection(e);
    this.color = fn;
    this.falseColor = fc;
}

DrawState.prototype.area = function(xf, xt, yf, yt) {
    this.xw = this.canvas.clientWidth;
    this.yh = this.canvas.clientHeight;
    this.max = Math.max(this.xw, this.yh);
    this.cx.fillStyle = '#88ff88';
    this.cx.fillRect(0, 0, this.xw, this.yh);
    this.id = this.cx.getImageData(0, 0, this.xw, this.yh);
    this.xc = this.xw/2;
    this.yc = this.yh/2;
    var xd = xt - xf;
    var yd = yt - yf;
    var xv = (xf+xt)/2;
    var yv = (yf+yt)/2;
    var xs = this.xw / xd;
    var ys = this.yh / yd;
    var dim = Math.min(xs, ys);
    var xr = xs/dim;
    var yr = ys/dim;
    var xe = xd/2*xr;
    this.minx = xv - xe;
    this.xlen = 2 * xe;
    this.maxx = xv + xe;
    var ye = yd/2*yr;
    this.miny = yv - ye;
    this.ylen = 2 * ye;
    this.maxy = yv + ye;
}

DrawState.prototype.redraw = function() {
    this.drawing = true;
    setTimeout(() => this.draw(0), 0);
}

DrawState.prototype.draw = function(inc) {
    var inw = this.max/2-inc;
    this.box(this.id, inc);
    this.box(this.id, inw);
    if (inc < inw)
        setTimeout(() => this.draw(inc+1), 0);
    else {
        if (this.falseColor)
            this.falseColor(this.id);
        this.drawing = false;
    }
    this.cx.putImageData(this.id, 0, 0);
}

DrawState.prototype.box = function(id, wid) {
    for (var j=0;j<wid*2;j++) {
        this.pixel(id, this.xc-wid+j, this.yc-wid);
        this.pixel(id, this.xc+wid, this.yc-wid+j);
        this.pixel(id, this.xc+wid-j, this.yc+wid);
        this.pixel(id, this.xc-wid, this.yc+wid-j);
    }
}

DrawState.prototype.pixel = function(id, xpos, ypos) {
    if (xpos < 0 || ypos < 0 || xpos > this.xw || ypos > this.yh)
        return;
    var pt = this.figurePt(xpos, ypos);
    this.setColor(id, xpos, ypos, this.color(pt));
}

DrawState.prototype.figurePt = function(xpos, ypos) {
    var x = this.minx + this.xlen*xpos/this.xw;
    var y = this.maxy - this.ylen*ypos/this.yh;
    return new Complex(x, y);
}

DrawState.prototype.setColor = function(id, x, y, ca) {
    var first = (y * this.xw + x) * 4;
    for (var i=0;i<4;i++)
        id.data[first+i] = ca[i];
}

DrawState.prototype.newton4 = function(guess) {
    var fn = x => x.pow(4).sub(1);
    var dfn = x => x.pow(3).mul(4);
    var resp = this.newton(fn, dfn, guess);
    var r = resp[0];
    var q = resp[1];
    if (q > 30)
        q = 30;
    var c;
    if (Math.abs(r.re + 1) < 0.01)
        c = colors[0];
    else if (Math.abs(r.re - 1) < 0.01)
        c = colors[1];
    else if (Math.abs(r.im + 1) < 0.01)
        c = colors[2];
    else if (Math.abs(r.im - 1) < 0.01)
        c = colors[3];
    else
        c = [0, 0, 0, 255];
    c = c.slice();
    for (var i=0;i<3;i++) {
        c[i] = Math.floor(c[i] * ((30-q)/30));
    }
    return c;
}

DrawState.prototype.newton3 = function(guess) {
    var fn = x => x.pow(3).sub(1);
    var dfn = x => x.pow(2).mul(3);
    var resp = this.newton(fn, dfn, guess);
    var r = resp[0];
    var q = resp[1];
    if (q > 30)
        q = 30;
    var c;
    if (Math.abs(r.re - 1) < 0.01)
        c = colors[0];
    else if (Math.abs(r.im - 0.866) < 0.01)
        c = colors[1];
    else if (Math.abs(r.im + 0.866) < 0.01)
        c = colors[2];
    else
        c = [0, 0, 0, 255];
    c = c.slice();
    for (var i=0;i<3;i++) {
        c[i] = Math.floor(c[i] * ((30-q)/30));
    }
    return c;
}

DrawState.prototype.newton = function(fn, dfn, guess) {
    for (var i=0;i<255;i++) {
        var xi = guess.sub(fn(guess).div(dfn(guess)));
        if (xi.sub(guess).abs() < 0.0001)
            return [xi, i];
        guess = xi;
    }
    return [guess,255];
}

DrawState.prototype.mandelbrot = function(c) {
    var z = new Complex(0, 0);
    for (var max=0;max<255;max++) {
        if (z.abs() > 2) {
            return [ 255-max, 255, 255, 255 ];
        }
        z = z.pow(2).add(c);
    }
    return [ 0, 0, 0, 255 ];
}

DrawState.prototype.mandlebrotFalseColor = function(id) {
    var cs = [];
    for (var i=1;i<255;i++)
        cs[i] = 0;
    var cnt = 0;
    for (var i=0;i<id.data.length;i+=4) {
        var b = id.data[i];
        if (b == 0 || b == 255)
            continue;
        cs[b]++;
        cnt++;
    }
    var colors = [];
    var tot = 0;
    for (var i=254;i>0;i--) {
        tot += cs[i];
        colors[i] = mbcolors[Math.floor(tot*20/cnt)];
    }
    for (var i=0;i<id.data.length;i+=4) {
        var b = id.data[i];
        if (b == 0 || b == 255)
            continue;
        var ci = colors[b];
        for (var j=0;j<4;j++)
            id.data[i+j] = ci[j];
    }
}

var mbcolors = [];
for (var i=0;i<3;i++) {
    for (var j=1;j<8;j++) {
        var k = j*32;
        if (i==0)
            mbcolors.push([k, 0, 0, 255]);
        else if (i==1)
            mbcolors.push([0, k, 0, 255]);
        else if (i==2)
            mbcolors.push([0, 0, k, 255]);
    }
}

var colors = [ [255, 0, 0, 255], [0, 255, 0, 255], [ 0, 0, 255, 255], [64, 64, 64, 255]  ];
function colorPct(pct) {
    if (pct < 90)
        return colors[0];
    else if (pct < 95)
        return colors[1];
    else if (pct < 97)
        return colors[2];
    else
        return colors[3];
}

DrawState.prototype.beginSelecting = function(e) {
    if (this.drawing)
        return;
    this.drag = true;
    var pt = this.canvasPt(e);
    this.selx = pt[0];
    this.sely = pt[1];
    this.rubberband(this.selx, this.sely, this.selx+1, this.sely+1);
}

DrawState.prototype.dragSelection = function(e) {
    if (this.drag) {
        var pt = this.canvasPt(e);
        this.rubberband(this.selx, this.sely, pt[0], pt[1]);
    }
}

DrawState.prototype.endSelection = function(e) {
    if (!this.drag)
        return;
    this.drag = false;
    var from = this.figurePt(this.selx, this.sely);
    var pt = this.canvasPt(e);
    var to = this.figurePt(pt[0], pt[1]);
    // this.area(Math.min(from.re, to.re), Math.max(from.re, to.re), Math.min(from.im, to.im), Math.max(from.im, to.im));
    // this.redraw();
    window.location.assign('?function=' + this.what + '&xf=' + Math.min(from.re, to.re) + '&xt=' + Math.max(from.re, to.re) + '&yf=' + Math.min(from.im, to.im) + '&yt=' + Math.max(from.im, to.im));
}

DrawState.prototype.canvasPt = function(e) {
    var bcr = this.canvas.getBoundingClientRect();
    return [ e.x - bcr.left, e.y - bcr.top ];
}

DrawState.prototype.rubberband = function(xf, yf, xt, yt) {
    this.cx.putImageData(this.id, 0, 0);
    this.cx.strokeStyle = '#000000';
    this.cx.beginPath();
    this.cx.rect(xf, yf, xt-xf, yt-yf);
    this.cx.stroke();
}

function drawit(what) {
    var args = new URLSearchParams(window.location.search);
    switch (what) {
        case "newton3": {
            var ds = new DrawState(DrawState.prototype.newton3, null);
            ds.area(arg(args, "xf", -2.0), arg(args, "xt", 2.0), arg(args, "yf", -2.0), arg(args, "yt", 2.0));
            break;
        }
         case "newton4": {
            var ds = new DrawState(DrawState.prototype.newton4, null);
            ds.area(arg(args, "xf", -2.0), arg(args, "xt", 2.0), arg(args, "yf", -2.0), arg(args, "yt", 2.0));
            break;
        }
        case "mandelbrot": {
            var ds = new DrawState(DrawState.prototype.mandelbrot, DrawState.prototype.mandlebrotFalseColor);
            ds.area(arg(args, "xf", -2.0), arg(args, "xt", 0.5), arg(args, "yf", -0.5), arg(args, "yt", 0.5));
            break;
        }
    }
    ds.what = what;
    window.ds = ds;
    ds.redraw();
}

function arg(args, fld, def) {
    if (args.get(fld))
        return parseFloat(args.get(fld));
    return def;
}