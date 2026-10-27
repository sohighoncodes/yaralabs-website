const clamp = value => Math.min(1, Math.max(0, value));

export function darkSectionProgress(rect, viewportHeight, scrollY, enterAt = 0.75, enterOver = 0.45) {
  // A tall viewport can already contain the dark section on arrival. Anchor
  // its fade to document scroll distance so that the hero still starts light.
  const start = Math.max(0, rect.top + scrollY - viewportHeight * enterAt);
  const entering = clamp((scrollY - start) / (viewportHeight * enterOver));
  const leaving = clamp((rect.bottom - viewportHeight * 0.35) / (viewportHeight * 0.4));
  return Math.min(entering, leaving);
}
