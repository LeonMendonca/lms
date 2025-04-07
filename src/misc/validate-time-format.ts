export function validateTime(time: string): boolean {
  // Regular expression to match the time format HH:MM:SS
  const regex = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  return regex.test(time);
}
