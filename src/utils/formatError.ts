import { GraphQLError } from "graphql"
import { ERROR_SIMBOL } from "../values"

const formatError = (error: GraphQLError): GraphQLError => {
    let errorMessage = ''
    try {
        if (error.message.substr(0, ERROR_SIMBOL.length) === ERROR_SIMBOL) errorMessage = error.message.substr(ERROR_SIMBOL.length)
        else {
            errorMessage = '알 수 없는 오류'
            console.log(error.message)
        }
    } catch (error) {
        errorMessage = '알 수 없는 오류'
    }

    return {
        ...error,
        extensions: {
            ...error.extensions,
            exception: error.extensions ? {
                ...error.extensions.exception,
                stacktrace: []
            } : undefined
        },
        message: errorMessage
    }
}

export default formatError