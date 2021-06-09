const objectNullToUndefind = (obj: any) => {

    for (const key of Object.keys(obj)) {
        if (obj[key] === null) obj[key] = undefined
    }

    return obj
}

export default objectNullToUndefind