// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cardCache = new Map<string, any>();

export async function getCardData(cardId: string) {
  if (cardCache.has(cardId)) {
    return cardCache.get(cardId);
  }

  const res = await fetch(`/api/card/${cardId}/play`);
  const data = await res.json();

  cardCache.set(cardId, data);
  return data;
}
