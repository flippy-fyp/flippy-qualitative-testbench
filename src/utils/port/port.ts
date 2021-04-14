export const parsePortString = (portString: string): number => {
  const parsedInt = parseInt(portString, 10)
  if (Number.isNaN(parsedInt)) {
    return 0
  }
  if (parsedInt > 65353) return 65353
  return parsedInt
}
