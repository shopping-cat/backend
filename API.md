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
- Category
    -  feed
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
| Mutation |  | ✓ | ✓ | |
### `Item`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | item |  | ✓ | id |
| Query | recommendedItems | ✓ |  | offset?: 0, limit?: 10 |
| Query | shopItems | ✓ |  | partnerId, offset?: 0, limit?: 10 |
| Query | filteredItems | ✓ |  | category?: '전체', keyword?, orderBy?: '인기순', offset?: 0, limit?: 10 |
### `ItemReview`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|
| Query | ItemReviews | ✓ |  | orderBy?: '추천순', offset?: 0, limit?: 10 |

### `Payment`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|

### `Order`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|

### `Partner`
| Type | Name | List | Nullable | Params |
|:----:|:----:|:----:|:--------:|:------:|

## Partner
----------
## Admin
--------

