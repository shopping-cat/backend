const salePrice = (sale: number, price: number) => {
    return Math.floor(price * (1 - (sale / 100)))
}

export default salePrice