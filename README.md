## 프론트엔드 개발 모드 시작

``` bash
cd client // 클라이언트 폴더로 이동 

npm install // 라이브러리 설치 

npm run dev // 개발 환경으로 클라이언트 서버 시작

// http://localhost:8080 으로 접속 

```

## 백엔드 개발 모드 시작 

``` bash
cd server // 서버 폴더로 이동 

npm install // 라이브러리 설치 

npm start // 서버 시작 

// http://localhost:3000 으로 접속 

```

## 운영 서버 배포 

1. 해당 서버에 환경 변수 추가 ( 최초 1회만 수정하면 되며, db 정보가 수정되지 않았다면 재수정할 필요 없습니다. )

``` bash

sudo vi /etc/profile  //  /etc/profile 파일을 편집기로 불러온다.

// i 를 눌러 편집 모드로 전환 

// 아래의 내용 중에 DB 정보를 알맞게 입력하고 추가한다.

export DB_HOST=

export DB_USER=

export DB_PASSWORD=

export DB_DATABASE=

export NODE_ENV=production

// 작성이 끝났다면, esc 를 눌러 편집 모드를 종료하고, :wq! 를 입력하고 엔터를 눌러 저장한다.


```

2. 운영 환경을 위한 프론트엔드 빌드 
( 프론트 엔드 코드는 압축되서 /server/public 내에 저장되므로 백엔드 만 배포하면 됨  )

``` bash
npm run build // 프론트엔드 코드 빌드 ( 해당 코드들이 압축되어 /server/public 이하로 저장된다. )
```

3. 백엔드 코드 해당 운영 서버로 업로드 


4. 운영 서버에세 백엔드 시작

``` bash
npm start 또는 node server.js
```