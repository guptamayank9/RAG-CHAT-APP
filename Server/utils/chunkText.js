const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  // Multiple spaces aur line breaks ko single space mein badlo
  const clean = text.replace(/\s+/g, " ").trim();
  //empty text ko handle karo
  if (!clean) return [];

  //invalid settings se infinite loop hone se bacho

  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(overlap) ||
    chunkSize <= 0 ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error("Invalid chunkSize or overlap");
  }

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);

    //word ke beech mein cut hone se bachne ki koshish
    if (end < clean.length) {
      const lastSpace = clean.lastIndexOf(" ", end);

      if (lastSpace > start) {
        end = lastSpace;
      }
    }
    
    // Current text chunk array mein add karo
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    // Last chunk process ho gaya toh loop band karo
    if (end >= clean.length) break;

    // Agle chunk ko overlap ke saath start karo
    let nextStart = end - overlap;

    //agle chunk ko word boundary par align karne ki koshis
    const nextSpace = clean.indexOf(" ", nextStart);

    if (nextSpace !== -1 && nextSpace < end) {
      nextStart = nextSpace + 1;
    }
    // Infinite loop se bachne ke liye progress ensure karo
    start = nextStart;
  }

  return chunks;
};

module.exports = chunkText;
