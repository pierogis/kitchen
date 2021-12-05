import { Restaurant } from "./restaurant";
import * as Vue from "vue";

let onScroll = () => {
  window.scrollTo(0, 0);
};

window.onscroll = onScroll;

let cursorCircle = document.createElement("div");
cursorCircle.classList.add("cursor-circle");

var touchduration = 500; //length of time we want the user to touch before we do something

cursorCircle.style.transition = `width ${touchduration / 1.5}ms, height ${
  touchduration / 1.5
}ms, margin ${touchduration / 1.5}ms`;
document.body.append(cursorCircle);

document.addEventListener("mousemove", (ev) => {
  moveCursorCircle(ev);
});

function moveCursorCircle(ev: MouseEvent) {
  cursorCircle.style.left = ev.clientX + "px";
  cursorCircle.style.top = ev.clientY + "px";
}

var onLongPress;
var longPressTimer;
var moveCancelsTimer;

function pressStart(ev: MouseEvent | Touch) {
  cursorCircle.style.width = "20px";
  cursorCircle.style.height = "20px";
  cursorCircle.style.marginTop = "-10px";
  cursorCircle.style.marginLeft = "-10px";
  if (!moveCancelsTimer) {
    moveCancelsTimer = setTimeout(() => {
      document.body.onmousemove = pressEnd;
    }, 300);
  }
  if (!longPressTimer) {
    longPressTimer = setTimeout(onLongPress, touchduration, ev);
  }
}

function pressEnd() {
  cursorCircle.style.width = "0px";
  cursorCircle.style.height = "0px";
  cursorCircle.style.marginTop = "0px";
  cursorCircle.style.marginLeft = "0px";
  if (moveCancelsTimer) {
    document.body.onmousemove = null;
    clearTimeout(moveCancelsTimer);
    moveCancelsTimer = null;
  }
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

let restaurant = new Restaurant();

onLongPress = (ev: MouseEvent | Touch) => {
  if (moveCancelsTimer) {
    document.body.onmousemove = null;
    clearTimeout(moveCancelsTimer);
    moveCancelsTimer = null;
  }
  longPressTimer = null;
  cursorCircle.style.width = "0px";
  cursorCircle.style.height = "0px";
  cursorCircle.style.marginTop = "0px";
  cursorCircle.style.marginLeft = "0px";
  restaurant.addNode(ev.clientY, ev.clientX);
};

restaurant.canvas.onmousedown = (ev) => {
  if (ev.button == 0) {
    ev.preventDefault();
    pressStart(ev);
  }
};
restaurant.canvas.onmouseup = pressEnd;

restaurant.canvas.ontouchstart = (ev) => {
  ev.preventDefault();
  pressStart(ev.touches.item(0));
};
restaurant.canvas.ontouchcancel = pressEnd;

// const app = Vue.createApp(restaurant);

// app.component("plate-node", {
//   data() {

//     let platePane = new Pane({ container: plateNode });
//   },
//   template: `
//         <div></div>
//     `,
// });

// app.component("restaurant", {
//   data() {},
//   template: `
//         <canvas></canvas>
//         <plate-node></plate-node>
//     `,
// });
