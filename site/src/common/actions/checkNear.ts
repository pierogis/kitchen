export function checkNearAction(element: HTMLElement, nearDistance: number) {
  let near = false;

  let checkNear = (event: MouseEvent) => {
    let rect = element.getBoundingClientRect();

    // expanding the rect
    let left = rect.left - nearDistance;
    let top = rect.top - nearDistance;
    let right = rect.right + nearDistance;
    let bottom = rect.bottom + nearDistance;

    // get mouse location
    let x = event.pageX;
    let y = event.pageY;

    // if x within width and y within height, mouse is over
    if (x > left && x < right && y > top && y < bottom) {
      near = true;
    } else {
      near = false;
    }
    element.dispatchEvent(new CustomEvent("near", { detail: near }));
  };

  window.addEventListener("mousemove", checkNear);

  return {
    update(newNearDistance: number) {
      nearDistance = newNearDistance;
    },
    destroy() {
      window.removeEventListener("mousemove", checkNear);
    },
  };
}
