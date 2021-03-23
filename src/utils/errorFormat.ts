import { ERROR_SIMBOL } from "../values"

const errorFormat = (message: string) => new Error(ERROR_SIMBOL + message)

export default errorFormat
