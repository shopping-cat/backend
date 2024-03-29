# Graphql api

- [Types](#Types)
- [Enum](#Enum)
- [App](#App)
- [Partner](#Partner)
- [Admin](#Admin)

## Types
--------
- User
- UserRefundBankAccount
- SearchKeyword
- Coupon
- CartItem
- Order
- Payment
- ItemReview
- ItemReviewImage
- Item
- ItemImage
- Partner

## Enum
-------
- RefundMethod
    - cardCancel
    - RefundAccout
- ItemState 
    - sale # 판매중
    - stop # 판매중지
    - noStock # 재고 없음
## App
------
### `User`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | iUser |  |  |  |
| Mutation | updateRefundBankAccount |  |  | ownerName: string, bankName: string, accountNumber: string |
| Mutation | updateDeliveryInfo |  |  | postCode: string, address: string, addressDetail: string, name: string, phone: string |
### `Item`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | item |  | ✓ | id |
| Query | recommendedItems | ✓ |  | offset?: 0, limit?: 15 |
| Query | zzimItems | ✓ |  | offset?: 0, limit?: 15, category?: '전체' |
| Query | shopItems | ✓ |  | partnerId, offset?: 0, limit?: 15 |
| Query | filteredItems | ✓ |  | category?: '전체', keyword?, orderBy?: '인기순', offset?: 0, limit?: 15 |
| Query | filteredItemsCount | ✓ |  | category?: '전체', keyword? |
| Mutation | itemLike |  | ✓ | itemId: int, like: boolean |
### `ItemReview`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | itemReviews | ✓ |  | itemId, orderBy?: '추천순', offset?: 0, limit?: 10 |
| Mutation | itemReviewRecommend |  | ✓ | itemReviewItem: int, recommendState: string |

### `CartITem`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | cartItems | ✓ |  |  |
| Mutation | addToCart |  |  | itemId: int, number: int, option?: int[] |
| Mutation | deleteCartItems |  |  | itemIds: int[] |



### `Payment`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|

### `Order`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|

### `Partner`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | partner | ✓ |  | id |

## Partner
----------
## Admin
--------

