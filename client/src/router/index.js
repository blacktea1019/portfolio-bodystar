import Vue from 'vue' // vue 코어
import Router from 'vue-router' // vue 라우터
import jwt from 'jsonwebtoken' // jwt 라이브러리
import Dashboard from '@/components/views/dashboard' // 대쉬보드
import UsersManage from '@/components/views/users/manage' // 회원 등록 확인/추가 컴포넌트
import UsersAuth from '@/components/views/users/auth' // 권한 부여 컴포넌트
import UsersInOut from '@/components/views/users/inout' // 회원 입출입 확인 컴포넌트
import BoardList from '@/components/views/board/list' // 게시판 > 리스트 컴포넌트
import BoardRead from '@/components/views/board/read' // 게시판 > 읽기 컴포넌트
import BoardWrite from '@/components/views/board/write' // 게시판 > 글 작성 컴포넌트
import login from '@/components/views/login' // 로그인 컴포넌트
import register from '@/components/views/register' // 회원가입 컴포넌트
import NotFound from '@/components/views/notFound' // 404 컴포넌트

Vue.use(Router); // (vue 자체 명령어 Vue.use: 플러그인 사용 선언)~~~ vue 라우터 플러그인 적용

/**
 * 특정 페이지 이동 전에 실행되는 함수로서,
 *  액세스 토큰과 리프레쉬 토큰의 유효성을 판단하여 허용 여부를 결정한다.
 */
const checkRedirect = function () {
  return new Promise((resolve, reject) => {
    if (!localStorage.getItem('vuex')) { // 로컬 스토리지에 저장된 내용이 없다면 페이지 진입 불가
      return reject();
    }
    let tokens = JSON.parse(localStorage.getItem('vuex'));
    if (!tokens.accessToken) { // 액세스 토큰이 없다면 페이지 진입 불가
        return reject();
    }
    if (!tokens.refreshToken) { // 리프레쉬 토큰이 없다면 페이지 진입 불가
      return reject();
    }
    let decoded = jwt.decode(tokens.refreshToken); // 리프레쉬 토큰 디코드
    let exp = new Date(decoded.exp * 1000); // 만료일자를 시간 포맷에 맞게 변경
    if (exp < Date.now()) {  // 리프레쉬 토큰이 만료되었다면 페이지 진입 불가
      return reject();
    }
    return resolve(); // 이전 제약에 걸리지 않았다면 통과
  });
};
/**
 * 일반 적인 권한이 필요한 페이지 진입 전에 호출되는 함수
 * @param to : 이동할 패스
 * @param from : 이전 패스
 * @param next : 다음 라우팅
 */
const requireAuth = function (to, from, next) {
  return checkRedirect().then(result => {
      return next(); // 성공시 다음 페이지로 진입
  }).catch(err => {
      return next('/login'); // 실패시 로그인 페이지로 이동
  });
};
/**
 * 로그인 페이지 진입시에, 이미 로그인된 상태를 판단하기 위한 함수
 * @param to : 이동할 패스
 * @param from : 이전 패스
 * @param next : 다음 라우팅
 */
const checkLogin = function (to, from, next) {
  return checkRedirect().then(result => {
    return next('/'); // 성공시 대시보드 페이지로 진입
  }).catch(err => {
    return next(); // 실패시 현재 페이지로 이동
  });
};
/**
 * (vue 자체 명령어 Router : 페이지내에서 이동 경로를 정의하고, 해당하는 컴포넌트를 바인딩 해주는 라우팅 모듈 )~~~
 * 지정된 패스에 맞게 url 을 변경하고, 해당 컴포넌트를 불러오는 라우팅
 */
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login', // 이동할 경로
      name: 'login', // 라우터 패스에 매칭될 이름
      component: login, // 해당 패스가 주어졌을때 바인딩 될 컴포넌트
      meta: {
        title: 'login' // 해당 패스 진입시에 추가적으로 담을 변수 ( 페이지내에 표시될 이름으로 사용된다. )
      },
      beforeEnter: (to, from, next) => checkLogin(to, from, next) // 해당 패스에 진입하기 전에 호출되는 함수
    },
    {
      path: '/register',
      name: 'register',
      component: register,
      meta: {
        title: '회원가입'
      }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        title: 'Dashboard'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/users/manage',
      name: 'usersManage',
      component: UsersManage,
      meta: {
        title: '회원 등록 확인/추가'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/users/inout',
      name: 'usersInOut',
      component: UsersInOut,
      meta: {
        title: '회원 입출입 확인'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/board',
      name: 'boardList',
      component: BoardList,
      meta: {
        title: '게시판'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/board/:seq(\\d+)', // seq 의 경우 숫자만 허용
      name: 'boardRead',
      component: BoardRead,
      meta: {
        title: '게시판 글보기'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/board/write/:seq(\\d+)?',  // seq 의 경우 숫자만 허용되나 없을 수도 있다.
      name: 'boardWrite',
      component: BoardWrite,
      meta: {
        title: '게시판 수정 및 쓰기'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/users/auth',
      name: 'usersAuth',
      component: UsersAuth,
      meta: {
        title: '권한 부여'
      },
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    }
    ,
    {
      path: '*',  // 위의 패스 중 어느 것도 매칭되지 않았을 때 호출되는 패스 ( 지정된 경로가 아닌 경우 404 페이지를 보여주기 위함 )
      name: 'notFound',
      component: NotFound
    }

  ]
});

export default router;
