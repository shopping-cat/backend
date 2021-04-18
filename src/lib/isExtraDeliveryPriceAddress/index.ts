import bs from "binary-search";
const list = require('./extraDeliveryPriceAddressList.json')

const isExtraDeliveryPriceAddress = (postCode: string) => {
    //@ts-ignore
    return bs(list.data, postCode, (i1, i2) => { return i1 - i2 }) > 0
}
export default isExtraDeliveryPriceAddress