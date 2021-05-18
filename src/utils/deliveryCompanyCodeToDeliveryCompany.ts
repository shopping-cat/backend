import errorFormat from "./errorFormat"

const list = require('../../assets/deliveryCompanyList.json')

const deliveryCompanyCodeToDeliveryCompany = (code: string): string => {
    try {
        return list.data.find((v: any) => v.Code === code).Name
    } catch (error) {
        throw errorFormat('존재하지 않는 배송사입니다')
    }

}

export default deliveryCompanyCodeToDeliveryCompany