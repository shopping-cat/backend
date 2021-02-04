const arraySum = (arr: number[]) => {
    let result = 0
    for (const v of arr) {
        result += v
    }
    return result
}

export default arraySum