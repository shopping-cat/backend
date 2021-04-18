export const ACCESS_TOKEN_NAME = 'accessToken' // 사용 안함
export const SELLER_JWT_EXPRISEIN = 1000 * 60 * 60 * 24 * 21 // 3 weeks // 사용 안함
export const SELLER_ACCESS_TOKEN_NAME = 'sellerAccessToken' // 사용 안함
export const USER_JWT_EXPRISEIN = 1000 * 60 * 60 * 24 * 365 // 사용 안함
export const USER_ACCESS_TOKEN_NAME = 'userAccessToken' // 사용 안함
export const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.react-graphql.shop' : undefined
export const COOKIE_PATH = '/'

// Paymnet
export const MIN_PAYMENT_PRICE = 300 // 원
export const COMMISSION = 10 // %

export const ERROR_SIMBOL = 'ERRORMESSAGE@'

export const CATEGORY = [
    {
        category: '사료',
        detailCategory: ['키튼', '어덜트', '시니어', '전연령', '에어/동결사료', '건식사료', '주식캔', '파우치', '기타']
    },
    {
        category: '간식',
        detailCategory: ['간식캔', '수제간식', '간식파우치', '동결/건조', '캣닢/캣그라스', '저키/스틱', '스낵', '통살/소시지', '덴탈간식', '파우더', '우유/분유/음료', '영양제', '기타']
    },
    {
        category: '장난감',
        detailCategory: ['낚시대', '레이져', '공/인형', '터널', '스크래쳐/박스', '기타']
    },
    {
        category: '의류',
        detailCategory: ['옷', '악세사리', '하네스', '넥카라', '기타']
    },
    {
        category: '위생',
        detailCategory: ['칫솔/치약', '미용', '목욕', '화장실', '모래', '기타']
    },
    {
        category: '용품',
        detailCategory: ['급식기/급수기', '정수기/자동급식기', '캣타워', '캣휠', '사료통', '울타리', '기타']
    }
]