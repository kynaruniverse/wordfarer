/**
 * ui/canvasCoords.ts
 * The canvas's internal drawing space is fixed at HABITAT_BOUNDS while
 * its CSS size scales/letterboxes to the viewport (see habitatView.ts).
 * Pointer events arrive in CSS pixel space, so every touch/drag
 * interaction needs this conversion before hit-testing against
 * organism positions, which live in canvas space.
 */

export function screenToCanvas(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}
