export const BANKS = ['KB국민은행', 'SC제일은행', '경남은행', '광주은행', '기업은행', '농협', '대구은행', '부산은행', '산업은행', '새마을금고', '수협', '신한은행', '신협', '외환은행', '우리은행', '우체국', '전북은행', '카카오뱅크', '케이뱅크', '하나은행(서울은행)', '한국씨티은행(한미은행)']
export const BANK_CODES = ['004', '023', '039', '034', '003', '011', '031', '002', '045', '007', '088', '048', '005', '020', '071', '037', '090', '089', '081', '027']

const bankNameToBankCode = (name: string) => {
    console.log(BANKS.length, BANK_CODES.length)
    const index = BANKS.indexOf(name)
    if (index === -1) throw new Error('존재하지 않는 환불계좌입니다')
    return BANK_CODES[index]
}



export default bankNameToBankCode