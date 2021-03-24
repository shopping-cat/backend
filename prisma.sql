//// ------------------------------------------------------
//// THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
//// ------------------------------------------------------

Table User {
  id String [pk]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  point Int [not null, default: 0]
  name String
  photo String
  cart CartItem
  coupons Coupon
  pointReceipts PointReceipt
  itemReviews ItemReview
  orders Order
  payments Payment
  searchKeywords SearchKeyword
  certificatedInfo UserCertificatedInfo
  refundBankAccount UserRefundBankAccount
  deliveryInfo UserDeliveryInfo
  itemLikes Item
  itemReviewLikes ItemReview
  itemReviewUnlikes ItemReview
}

Table UserCertificatedInfo {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  phone String [not null]
  name String [not null]
  userId String [not null]
  user User [not null]
}

Table UserRefundBankAccount {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  bankName String [not null]
  accountNumber String [not null]
  ownerName String [not null]
  userId String [unique, not null]
  user User [not null]
}

Table UserDeliveryInfo {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  postCode String [not null]
  address String [not null]
  addressDetail String [not null]
  name String [not null]
  phone String [not null]
  userId String [unique, not null]
  user User [not null]
}

Table SearchKeyword {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  keyword String [not null]
  userId String [not null]
  user User [not null]
}

Table Coupon {
  id String [pk]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  image String [not null]
  name String [not null]
  period DateTime [not null]
  minItemPrice Int
  maxSalePrice Int
  salePercent Int
  salePrice Int
  userId String
  orderId Int [unique]
  order Order
  user User
}

Table PointReceipt {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  name String [not null]
  point Int [not null]
  userId String [not null]
  user User [not null]
}

Table CartItem {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  option Json
  itemId Int [not null]
  userId String [not null]
  num Int [not null]
  item Item [not null]
  user User [not null]
}

Table Order {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  state String [not null]
  itemPrice Int [not null]
  itemOptionPrice Int [not null]
  itemSale Int [not null]
  num Int [not null]
  itemOption Json
  deliveryCompletionDate DateTime
  reason String
  cartItemId Int [not null]
  userId String [not null]
  paymentId String [not null]
  itemId Int [not null]
  coupons Coupon
  itemReview ItemReview
  payment Payment [not null]
  user User [not null]
  item Item [not null]
}

Table Payment {
  id String [pk]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  name String [not null]
  state String [not null]
  cancelReason String
  paymentMethod String [not null]
  price Int [not null]
  deliveryPrice Int [not null]
  extraDeliveryPrice Int [not null]
  itemSale Int [not null]
  couponSale Int [not null]
  pointSale Int [not null]
  totalPrice Int [not null]
  address String [not null]
  addressName String [not null]
  addressPhone String [not null]
  postCode String [not null]
  deliveryMemo String [not null]
  vBankNum String
  vBankDate String
  vBankName String
  userId String [not null]
  user User [not null]
  orders Order
}

Table ItemReview {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  likeNum Int [not null, default: 0]
  content String
  rate Int [not null]
  userId String [not null]
  itemId Int [not null]
  orderId Int [unique, not null]
  item Item [not null]
  order Order [not null]
  user User [not null]
  images ItemReviewImage
  userLikes User
  userUnlikes User
}

Table ItemReviewImage {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  uri String [not null]
  itemReviewId Int
  itemReview ItemReview
}

Table Item {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  likeNum Int [not null, default: 0]
  state String [not null, default: '상품등록요청']
  deliveryPrice Int [not null]
  extraDeliveryPrice Int [not null]
  name String [not null]
  price Int [not null]
  sale Int [not null, default: 0]
  option Json
  requireInformation Json [not null]
  html String [not null]
  category1 String
  category2 String
  shopId Int
  targetItemId Int
  targetItem Item
  updateItem Item
  shop Shop
  cart CartItem
  images ItemImage
  reviews ItemReview
  orders Order
  userLikes User
}

Table ItemImage {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  uri String [not null]
  itemId Int
  item Item
}

Table Shop {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  shopName String [unique, not null]
  shopImage String [not null]
  items Item
  seller Seller
  partner Partner
}

Table Seller {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  licenseNumber String [unique, not null]
  email String [unique, not null]
  shopId Int [not null]
  shop Shop [not null]
}

Table Partner {
  id Int [pk, increment]
  createdAt DateTime [default: `now()`, not null]
  updatedAt DateTime [not null]
  licenseNumber String [unique, not null]
  email String [unique, not null]
  shopId Int [not null]
  shop Shop [not null]
}

Table ItemToUser {
  itemlikesId Int [ref: > Item.id]
  userlikesId String [ref: > User.id]
}

Table UserItemReviewLike {
  itemreviewlikesId Int [ref: > ItemReview.id]
  userlikesId String [ref: > User.id]
}

Table UserItemReviewUnlike {
  itemreviewunlikesId Int [ref: > ItemReview.id]
  userunlikesId String [ref: > User.id]
}

Ref: UserCertificatedInfo.userId - User.id

Ref: UserRefundBankAccount.userId - User.id

Ref: UserDeliveryInfo.userId - User.id

Ref: SearchKeyword.userId > User.id

Ref: Coupon.orderId > Order.id

Ref: Coupon.userId > User.id

Ref: PointReceipt.userId > User.id

Ref: CartItem.itemId > Item.id

Ref: CartItem.userId > User.id

Ref: Order.paymentId > Payment.id

Ref: Order.userId > User.id

Ref: Order.itemId > Item.id

Ref: Payment.userId > User.id

Ref: ItemReview.itemId > Item.id

Ref: ItemReview.orderId - Order.id

Ref: ItemReview.userId > User.id

Ref: ItemReviewImage.itemReviewId > ItemReview.id

Ref: Item.targetItemId - Item.id

Ref: Item.shopId > Shop.id

Ref: ItemImage.itemId > Item.id

Ref: Seller.shopId - Shop.id

Ref: Partner.shopId - Shop.id