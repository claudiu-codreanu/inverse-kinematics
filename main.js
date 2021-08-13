
class Arm {
    constructor(x, y, segLen, segNum, angle) {
        this.x = x;
        this.y = y;

        this.segments = [];

        let width = 15,
            minWidth = 4;

        for(let i = 0; i < segNum; i++) {
            let seg = new Segment(segLen, angle, width);
            width = Math.max(width - 1, minWidth);

            seg.pt1 = new Point(x, y);
            seg.calcPt2();

            this.segments.push(seg);

            x = seg.pt2.x;
            y = seg.pt2.y;
        }
    }

    paint(ctx) {
        this.segments.forEach(s => s.paint(ctx));
    }

    grabObject(x, y) {
        this.calcAngles(x, y);
        this.calcCoordinates();
    }

    calcAngles(x, y) {
        this.segments
            .slice()
            .reverse()
            .forEach(seg => {
                let seg2 = new Segment(seg.length);
                seg2.pt1 = new Point(x, y);

                seg2.calcAngle(seg.pt1.x, seg.pt1.y);
                seg2.calcPt2();

                seg.pt1 = seg2.pt2;
                seg.pt2 = seg2.pt1;

                seg.angle = seg2.angle >= 0 ? seg2.angle - Math.PI : seg2.angle + Math.PI;

                x = seg.pt1.x;
                y = seg.pt1.y;
            });
    }

    calcCoordinates() {
        let {x, y} = this;

        this.segments.forEach(seg => {
            seg.pt1 = new Point(x, y);
            seg.calcPt2();

            x = seg.pt2.x;
            y = seg.pt2.y;
        });
    }
}


class Segment {
    constructor(length = 100, angle = 0, width = 7) {
        this.length = length;
        this.angle = angle;

        this.width = width;
        this.color = "#333333";
        this.jointColor = "lime";

        this.pt1 = null;
        this.pt2 = null;
    }

    calcAngle(x, y) {
        let dx = x - this.pt1.x,
            dy = y - this.pt1.y;

        this.angle = Math.atan2(dy, dx);
    }

    calcPt2() {
        let {x, y} = this.pt1,
            {length, angle} = this;

        let x2 = x + length * Math.cos(angle),
            y2 = y + length * Math.sin(angle);

        this.pt2 = new Point(x2, y2);
    }
    
    paint(ctx) {
        this.paintLine(ctx);
        this.paintJoint(ctx);
    }

    paintLine(ctx) {
        ctx.beginPath();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(this.pt1.x, this.pt1.y);
        ctx.lineTo(this.pt2.x, this.pt2.y);

        ctx.stroke();
    }

    paintJoint(ctx) {
        ctx.beginPath();

        ctx.fillStyle = this.jointColor;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;

        ctx.arc(this.pt1.x, this.pt1.y, this.width / 2, 0, 2 * Math.PI);

        ctx.fill();
        ctx.stroke();
    }
}


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Ball {
    constructor(radius, color, w, h) {
        this.radius = radius;
        this.color = color;

        this.x = random(radius, w - radius);
        this.y = random(radius, h - radius);

        this.speedX = random(2, 10);
        this.speedY = random(2, 10);
    }

    paint(ctx) {
        ctx.beginPath();

        ctx.fillStyle = this.color;
        ctx.strokeStyle = "black";

        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

        ctx.fill();
        ctx.stroke();
    }

    calcPosition(w, h) {
        let {x, y, radius} = this;

        x += this.speedX;
        y += this.speedY;


        if(x < radius) {
            x = radius;
            this.speedX = -this.speedX;
        }

        if(x > w - radius) {
            x = w - radius;
            this.speedX = -this.speedX;
        }


        if(y < radius) {
            y = radius;
            this.speedY = -this.speedY;
        }

        if(y > h - radius) {
            y = h - radius;
            this.speedY = -this.speedY;
        }


        this.x = x;
        this.y = y;
    }

    calcGrabPoint(x, y) {
        let alpha = Math.atan2(this.y - y, this.x - x),
            d = this.calcDist(this.x, this.y, x, y) - this.radius;

        let y2 = y + d * Math.sin(alpha),
            x2 = x + d * Math.cos(alpha);

        return new Point(x2, y2);
    }

    calcDist(x1, y1, x2, y2) {
        let dx = x1 - x2,
            dy = y1 - y2;

        return Math.sqrt(dx ** 2 + dy ** 2);
    }
}

let canvas,
    ctx,
    arm,
    ball;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    arm = new Arm(400, 300, 35, 10, -Math.PI / 4);
    arm.paint(ctx);

    ball = new Ball(15, "crimson", canvas.width, canvas.height);

    //canvas.addEventListener("mousemove", onMouseMove);
    setInterval(animation, 30);
}


function onMouseMove(e) {
    arm.grabObject(e.offsetX, e.offsetY);

    clearCanvas();
    arm.paint(ctx);
}


function animation() {
    ball.calcPosition(canvas.width, canvas.height);

    let lastSeg = arm.segments.slice(-1)[0],
        grabPt = ball.calcGrabPoint(lastSeg.pt1.x, lastSeg.pt1.y);

    arm.grabObject(grabPt.x, grabPt.y);

    clearCanvas();

    ball.paint(ctx);
    arm.paint(ctx);
}


function clearCanvas() {
    ctx.beginPath();

    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function random(min, max) {
    return min + Math.ceil( Math.random() * max );
}