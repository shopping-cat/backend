const asyncDelay = async (delay = 1000) => {
    await new Promise((res) => setTimeout(() => { res(0) }, delay))
    return
}

export default asyncDelay