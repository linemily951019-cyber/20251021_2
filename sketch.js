let t = 0.0;
let vel = 0.02;
let num;
let paletteSelected;
let paletteSelected1;
let paletteSelected2;

// 選單顯示狀態（立即顯示或隱藏）
let menuAlpha = 0; // 0..200 (背景透明度)
let menuAnimFrom = 0;
let menuAnimTo = 0;
let menuAnimStart = 0;
let menuDuration = 1000; // 1秒 (ms)

// 新增：overlay 與 iframe 相關狀態，以及選單項目 bounding rects
let iframeEl = null;
let overlayDiv = null;
let overlayVisible = false;
let menuItemRects = [];

function setup() {
    createCanvas(100, 100);
  createCanvas(windowWidth, windowHeight);
    pixelDensity(2)
    angleMode(DEGREES);
    num = random(100000);
    paletteSelected = random(palettes);
    paletteSelected1 = random(palettes);
    paletteSelected2 = random(palettes);
}

function draw() {
    randomSeed(num);
    // background("#355070");
    background(bgCol())
    stroke("#355070");
    circlePacking() 

    // 選單區域設定
    let menuW = 260;
    let menuX = 0;
    let menuY = 0;
    let menuH = height;
    // 判斷滑鼠是否在選單矩形內（用來決定是否保持顯示）
    let mouseInMenu = (mouseX >= menuX && mouseX <= menuX + menuW && mouseY >= menuY && mouseY <= menuY + menuH);
    // 滑鼠在最左邊 (視為立即要顯示)
    let wantVisible = (mouseX <= 1) || mouseInMenu;

    // 立即顯示或隱藏（移除漸進動畫）
    menuAlpha = wantVisible ? 200 : 0;

    // 只要 menuAlpha > 0 就畫出選單
    if (menuAlpha > 0.5) {
        drawMenu(menuW, menuY, menuH);
    }
}

function circlePacking() {
	push();

	translate(width / 2, height / 2)
	let points = [];
	let count = 2000;
	for (let i = 0; i < count; i++) {
		let a = random(360);
		let d = random(width * 0.35);
		let s = random(200);
		let x = cos(a) * (d - s / 2);
		let y = sin(a) * (d - s / 2);
		let add = true;
		for (let j = 0; j < points.length; j++) {
			let p = points[j];
			if (dist(x, y, p.x, p.y) < (s + p.z) * 0.6) {
				add = false;
				break;
			}
		}
		if (add) points.push(createVector(x, y, s));
	}
	for (let i = 0; i < points.length; i++) {

		let p = points[i];
		let rot = random(360);
		push();
		translate(p.x, p.y);
		rotate(rot);
		blendMode(OVERLAY)
		let r = p.z - 5;
		gradient(r)
		shape(0, 0, r)
		pop();
	}
	pop();
 }

function shape(x, y, r) {
	push();
noStroke();
//fill(randomCol())
	translate(x, y);
	let radius = r; //半径
	let nums = 8
	for (let i = 0; i < 360; i += 360 / nums) {
		let ex = radius * sin(i);
		let ey = radius * cos(i);
		push();
		translate(ex,ey)
		rotate(atan2(ey, ex))
		distortedCircle(0,0,r);
	
		pop();
		stroke(randomCol())
		strokeWeight(0.5)
		line(0,0,ex,ey)
		ellipse(ex,ey,2)
	}


	pop();
}

function distortedCircle(x, y, r) {
	push();
	translate(x, y)
	//points
	let p1 = createVector(0, -r / 2);
	let p2 = createVector(r / 2, 0);
	let p3 = createVector(0, r / 2);
	let p4 = createVector(-r / 2, 0)
	//anker
	let val = 0.3;
	let random_a8_1 = random(-r * val, r * val)
	let random_a2_3 = random(-r * val, r * val)
	let random_a4_5 = random(-r * val, r * val)
	let random_a6_7 = random(-r * val, r * val)
	let ran_anker_lenA = r * random(0.2, 0.5)
	let ran_anker_lenB = r * random(0.2, 0.5)
	let a1 = createVector(ran_anker_lenA, -r / 2 + random_a8_1);
	let a2 = createVector(r / 2 + random_a2_3, -ran_anker_lenB);
	let a3 = createVector(r / 2 - random_a2_3, ran_anker_lenA);
	let a4 = createVector(ran_anker_lenB, r / 2 + random_a4_5);
	let a5 = createVector(-ran_anker_lenA, r / 2 - random_a4_5);
	let a6 = createVector(-r / 2 + random_a6_7, ran_anker_lenB);
	let a7 = createVector(-r / 2 - random_a6_7, -ran_anker_lenA);
	let a8 = createVector(-ran_anker_lenB, -r / 2 - random_a8_1);
	beginShape();
	vertex(p1.x, p1.y);
	bezierVertex(a1.x, a1.y, a2.x, a2.y, p2.x, p2.y)
	bezierVertex(a3.x, a3.y, a4.x, a4.y, p3.x, p3.y)
	bezierVertex(a5.x, a5.y, a6.x, a6.y, p4.x, p4.y)
	bezierVertex(a7.x, a7.y, a8.x, a8.y, p1.x, p1.y)
	endShape();
	pop();
}

// 新增：左側半透明選單（滑鼠停留項目變藍）
// 現在使用 menuAlpha 作為背景與文字透明度來源，並以文字實際寬高判斷 hover
function drawMenu(menuW = 260, menuY = 0, menuH = null) {
    push();
    noStroke();
    rectMode(CORNER);
    if (menuH === null) menuH = height;
    // 背景使用 menuAlpha (0..200)
    fill(255, menuAlpha);
    rect(0, menuY, menuW, menuH);

    // 選單文字：文字大小 20px，水平置中
    textSize(20);
    textAlign(CENTER, TOP);
    let padX = menuW / 2; // 置中
    let padY = 20;
    let spacing = 44; // 每項間距
    let items = ["作品一", "作品二", "作品三"];

    // 每次重新建立 menuItemRects（用於 click 判斷）
    menuItemRects = [];

    // 針對每個項目計算文字 bounding box，滑鼠在文字上方立即變藍
    for (let i = 0; i < items.length; i++) {
        let itemTop = padY + spacing * i;
        // 使用 textWidth 與文字高度做精確判斷
        let tw = textWidth(items[i]);
        let th = textAscent() + textDescent();
        let xLeft = padX - tw / 2;
        let xRight = padX + tw / 2;
        let yTop = itemTop;
        let yBottom = itemTop + th;

        // 儲存每個項目的 bounding rect（以 canvas 座標表示）
        menuItemRects.push({ left: xLeft, right: xRight, top: yTop, bottom: yBottom, index: i });

        let isHover = (mouseX >= xLeft && mouseX <= xRight && mouseY >= yTop && mouseY <= yBottom);

        if (isHover) {
            // 文字為純藍（不受 menuAlpha 限制，讓 hover 立刻可見）
            fill(30, 102, 204);
        } else {
            // 文字顏色仍受 menuAlpha 的透明度影響
            fill(0, map(menuAlpha, 0, 200, 0, 200));
        }
        text(items[i], padX, itemTop);
    }

    pop();
}

// 新增：視窗大小改變時同步調整畫布
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// 點擊處理：點擊選單項目會開啟對應 iframe；若 overlay 顯示，點擊 overlay 背景則關閉
function mousePressed() {
    // 若 overlay 正在顯示，點擊即關閉 overlay（點擊 iframe 內部不會觸發此，因為已阻止冒泡）
    if (overlayVisible) {
        closeOverlay();
        return;
    }

    // 檢查是否點擊到選單項目（menuItemRects 由 drawMenu 每次更新）
    for (let i = 0; i < menuItemRects.length; i++) {
        let r = menuItemRects[i];
        if (mouseX >= r.left && mouseX <= r.right && mouseY >= r.top && mouseY <= r.bottom) {
            if (r.index === 0) {
                openIframe('https://linemily951019-cyber.github.io/20251014_3/');
            } else if (r.index === 1) {
                openIframe('https://hackmd.io/@SKhfTWdyTDqW_5zqmDgQWQ/20251007');
            }
            // 若需作品三，可在此加入
            break;
        }
    }
}

// 開啟 overlay 與 iframe（iframe 寬高為畫面 80%）
function openIframe(url) {
    if (overlayVisible) return;

    overlayVisible = true;
    overlayDiv = createDiv();
    overlayDiv.style('position', 'fixed');
    overlayDiv.style('left', '0');
    overlayDiv.style('top', '0');
    overlayDiv.style('width', '100vw');
    overlayDiv.style('height', '100vh');
    overlayDiv.style('display', 'flex');
    overlayDiv.style('align-items', 'center');
    overlayDiv.style('justify-content', 'center');
    overlayDiv.style('background', 'rgba(0,0,0,0.5)');
    overlayDiv.style('z-index', '9999');

    // 點擊 overlay 背景關閉（點擊 iframe 內部會阻止冒泡）
    overlayDiv.mousePressed(function() {
        closeOverlay();
    });

    iframeEl = createElement('iframe');
    iframeEl.attribute('src', url);
    iframeEl.style('width', '80vw');
    iframeEl.style('height', '80vh');
    iframeEl.style('border', 'none');
    iframeEl.parent(overlayDiv);

    // 防止點擊 iframe 本身導致 overlay 被關閉
    if (iframeEl.elt) {
        iframeEl.elt.addEventListener('click', function(e) { e.stopPropagation(); });
    }
}

// 關閉並移除 overlay 與 iframe
function closeOverlay() {
    if (iframeEl) {
        iframeEl.remove();
        iframeEl = null;
    }
    if (overlayDiv) {
        overlayDiv.remove();
        overlayDiv = null;
    }
    overlayVisible = false;
}