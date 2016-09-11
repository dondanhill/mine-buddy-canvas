window.onload = function () {
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight

    canvas.addEventListener('mousedown', function (event) {
        if (event.button === 0) {
            grid.clicked(event.clientX, event.clientY);
        } else {
            grid.rightClicked(event.clientX, event.clientY);
        }
    });
    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        return false;
    })
    // begin
    var grid = new Grid(9, 9, 30, context);
    grid.draw();
};

function Grid(w, h, size, context) {
    this.boxes = [];
    this.w = w;
    this.h = h;
    this.size = size;
    // generate boxes
    for (let j = 0; j < h; j += 1) {
        for (let i = 0; i < w; i += 1) {
            let box = new Box(i, j, size, context);
            if (Math.random() * 17 > 14) {
                box.hasBomb = true;
            }
            this.boxes.push(box);
        };
    };
    // setup boxes
    for (let i = 0; i < this.boxes.length; i += 1) {
        let cnt = 0;
        let box = this.boxes[i];
        if (!box.hasBomb) {
            let neighbours = [
                i - 1,
                i + 1,
                i - w - 1,
                i - w,
                i - w + 1,
                i + w - 1,
                i + w,
                i + w + 1
            ];
            neighbours.forEach(function (x) {
                if (x >= 0 && x < w * h && Math.abs(box.x % w - x % w) <= 1) {
                    if (this.boxes[x].hasBomb) {
                        box.bombs += 1;
                    }
                    box.neighbours.push(this.boxes[x]);
                }
            }, this);
        }
    };

    this.draw = function() {
        this.boxes.forEach(function(box) {
            box.draw();
        });
    }

    this.clicked = function(x, y) {
        this.getBox(x, y).setClicked();
    }
    this.rightClicked = function(x, y) {
        this.getBox(x, y).rightClicked();
    }

    this.getBox = function(x, y) {
        x = Math.floor(x / size);
        y = Math.floor(y / size);
        return this.boxes[x + y * w];
    }
};

function Box(x, y, size, context) {
    var context = context;
    this.neighbours = [];
    this.x = x;
    this.y = y;
    this.size = size;
    this.hasBomb = false;
    this.bombs = 0;
    this.clicked = false;
    this.highlighted = false;
    this.flagged = false;

    this.draw = function() {
        context.beginPath();
        context.rect(this.x * this.size, this.y * this.size, this.size, this.size);
        if (this.clicked) {
            if (this.hasBomb) {
                context.fillStyle = "#FF5555";
            } else {
                context.fillStyle = "#FFFFFF";
            }
            context.font = '18px "Droid Sans Mono"';
            context.textAlign = 'left';
            context.fill();
            if (!this.hasBomb && this.bombs) {
                context.fillStyle = 'rgb(' + Math.floor(255-42.5*this.bombs) + ',0,0)';
                context.fillText(this.bombs, this.x * this.size + this.size / 3, this.y * this.size + this.size / 1.4);
                // context.strokeText(this.bombs, this.x * this.size + this.size / 2.5, this.y * this.size + this.size / 1.5);
            }
        } else {
            context.strokeStyle = "#444444";
            if(this.highlighted) {
                context.fillStyle = "#DDDDFF";
            } 
            else if(this.flagged) {
                context.fillStyle = "#55FF55";
            }
            else {
                context.fillStyle = "#5555FF";
            }
            context.fill();
        }
        context.stroke();
    }

    this.setClicked = function() {
        if (!this.clicked) {
            if(!this.flagged) {
                this.clicked = true;
                if (!this.bombs) {
                    console.log(this.neighbours.length)
                    this.neighbours.forEach(function(neighbour) {
                        neighbour.setClicked();
                    });
                }
                this.draw();
            }
        } else {
            this.clearNeighbours();
        }
    }

    this.rightClicked = function() {
        if (this.clicked) {
            this.clearNeighbours();
        } else {
            this.flagged = !this.flagged;
            this.draw();
        }
    }

    this.clearNeighbours = function() {
        let flags = this.neighbours.filter(function(neighbour) {
            return neighbour.flagged;
        });
        if (flags.length && flags.length === this.bombs) {
            this.neighbours.forEach(function(neighbour) {
                if(!neighbour.clicked && !neighbour.flagged) {
                    neighbour.setClicked();
                }
            });
        }
    }
};
