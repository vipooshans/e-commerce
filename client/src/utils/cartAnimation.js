export const CART_ANIMATION_EVENT = 'cart:add-animation';

export const triggerCartAnimation = (imageSrc, sourceElement) => {
  const rect = sourceElement?.getBoundingClientRect();

  window.dispatchEvent(new CustomEvent(CART_ANIMATION_EVENT, {
    detail: {
      imageSrc,
      source: rect ? {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      } : null,
    },
  }));
};
