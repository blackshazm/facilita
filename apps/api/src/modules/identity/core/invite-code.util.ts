export function generateInviteCode(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 5);

  const random = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${slug}${random}`;
}

export function regenerateWithMoreRandomness(code: string): string {
  const extra = Math.floor(10 + Math.random() * 90); // 2 more digits
  return `${code}${extra}`;
}
