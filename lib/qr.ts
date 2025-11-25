export function generateQrContent(eventId: string, participantId: string): string {
  const payload = {
    event: eventId.slice(0, 8),
    p_id: participantId,
    timestamp: Date.now(),
  };

  return JSON.stringify(payload);
}

