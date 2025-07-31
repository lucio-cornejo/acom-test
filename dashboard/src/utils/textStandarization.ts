export function removeExtraWhitespace(txt: string): string {
  return txt.trim().replace(/\s+/g, ' ');
}


export function standarizeText(text: string): string {
  // Remove tildes
  const standardizedText = text.normalize('NFD')
      // Remove all combining diacritical marks except for ñ (U+0303)
      .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, '$1')
      // Recompose the string
      .normalize('NFC');

  return removeExtraWhitespace(standardizedText);
}
