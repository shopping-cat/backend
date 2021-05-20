import axios from "axios"
import errorFormat from "./errorFormat"

export interface DeliveryInfo {
    from: {
        name: string
        time: string
    }
    to: {
        name: string
        time: string
    }
    state: {
        id: string
        text: string
    }
    progresses: {
        time: string
        location: {
            name: string
        }
        status: {
            id: string
            text: string
        }
        description: string
    }[]
    carrier: {
        id: string
        name: string
        tel: string
    }
}

const getDeliveryInfo = async (companyCode: string, deliveryNumber: string): Promise<DeliveryInfo> => {
    try {
        const { data } = await axios.get(`https://apis.tracker.delivery/carriers/${companyCode}/tracks/${deliveryNumber}`)
        return data
    } catch (error) {
        throw errorFormat('송장번호를 다시한번 확인해주세요')
    }
}

export default getDeliveryInfo