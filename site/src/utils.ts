export function calculateCenter(rect: DOMRect): { x: number; y: number } {
  let x = rect.x + rect.width / 2;
  let y = rect.y + rect.height / 2;

  return { x, y };
}
