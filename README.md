# backend
백엔드 API 서버

## 기술 스택
* nodejs
* typescript
* graphql
* apollo-express
* prisma
* nexusjs

## 초기 입력 커맨드
```
# npm 패키지 설치
npm i
# prisma/schema.prisma를 기반으로 DB 구조 초기화
npm run migrate
# prisma/schema.prisma를 기반으로 typescript 동기화 & schema.graphql 생성
npm run generate
# 시작
npm run dev
```

## 환경변수
값은 실제 값이 아닌 예시입니다
```
# [참고주소](https://www.prisma.io/docs/concepts/components/prisma-schema#using-environment-variables)
DATABASE_URL=mysql://root:password@localhost:3306/shopping-cat-dev
# src/server.ts에서 cors에 사용됨
FRONT_URL=http://localhost:3000
JWT_SECRET=ASDFASDF
COOKIE_SECRET=123123
```

## 주의
migrations는 git에 올라가지는 않지만 지우면 다음번 prisma migrate가 안먹을 수 있음 만약지웠다면 DB접속해서 *_Migration* 테이블 삭제하면 됨