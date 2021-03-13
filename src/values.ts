export const ACCESS_TOKEN_NAME = 'accessToken' // 사용 안함
export const SELLER_JWT_EXPRISEIN = 1000 * 60 * 60 * 24 * 21 // 3 weeks // 사용 안함
export const SELLER_ACCESS_TOKEN_NAME = 'sellerAccessToken' // 사용 안함
export const USER_JWT_EXPRISEIN = 1000 * 60 * 60 * 24 * 365 // 사용 안함
export const USER_ACCESS_TOKEN_NAME = 'userAccessToken' // 사용 안함
export const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.react-graphql.shop' : undefined
export const COOKIE_PATH = '/'


export const MIN_PAYMENT_PRICE = 300 // 원