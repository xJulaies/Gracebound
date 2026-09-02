export function wrapCarouselIndex(index: number, length: number) {
  return (index + length) % length;
}
