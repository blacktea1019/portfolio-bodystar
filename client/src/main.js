import Vue from 'vue' // vue core
import App from './app' // vue 가 들어갈 메인 컴포넌트
import router from './router' // vue router 설정
import store from './store' // vuex store 설정
import axios from 'axios' // http client 라이브러리
import VueMq from 'vue-mq' // 반응형 기기들의 사이즈들을 범위로 표현해주는 모듈
import './assets/css/main.css'; // 전역으로 사용할 main.css 임포트

Vue.config.productionTip = false; // (vue 자체 명령어 Vue.config: 설정 옵션)~~~ 브라우저 콘솔에 'you’re in development mode' 문구 노출 제거
Vue.prototype.$http = axios; // (vue 자체 명령어 Vue.prototype : 사용자 정의 함수 추가 )~~~ axios http client 를 전역으로 바인딩
/**
 *  (vue 자체 명령어 Vue.use : 플러그인 사용 선언 )~~~
 *  반응형 기기들의 사이즈들의 범위를 지정하는 모듈을 사용
 */
Vue.use(VueMq, {
  breakpoints: {
    xs: 480,
    sm: 768,
    md: 992,
    lg: Infinity,
  }
});
/**
 * (vue 자체 명령어 new Vue : 생성자)~~~
 * vue 생성자
 */
new Vue({
  el: '#app', // 타겟 엘리먼트
  router, // 라우터
  store, // 스토어
  components: { App }, // 불러올 컴포넌트
  template: '<App/>' // 불러온 컴포넌트 중에 App 라는 이름을 가진 컴포넌트를 사용
});
/**
 * 모든 ajax 요청 헤더에 자동으로 Authorization 헤더를 넣어준다.
 *  - 내부에서 axios, jquery.ajax 를 둘다 사용하므로 둘다 적용.
 */
function updateHeader () {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + store.state.accessToken; // axios
  $.ajaxSetup({ // jquery.ajax
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', 'Bearer ' + store.state.accessToken);
    }
  });
}
/**
 * 페이지가 리프레쉬 된 경우 최초 헤더 적용
 */
updateHeader();
/**
 * axios 를 사용하는 모든 요청에 인터셉트를 걸어 에러시 적절한 핸들링을 한다.
 *    - 403 에러 발생 ( 액세스 토큰이 파기된 경우 또는 리프레쉬 토큰이 만료 )
 *      - 로그아웃 처리
 *    - 401 에러 발생 ( 액세스 토큰이 만료된 경우 )
 *      - 토큰 갱신 요청을 전송하고 성공시 이전 요청을 재전송, 실패시 로그아웃
 */
axios.interceptors.response.use(resp => { // axios 요청시 인터셉트 적용
    return resp; // 성공한 요청이라면 바로 리턴
}, (err) => { // 요청시 에러 발생시에 핸들링 시작
    const originalRequest = err.config; // 원래 요청 정보를 변수에 담는다.
    if (err.response.status === 403) {  // 에러코드 403 리턴시
        store.commit('logout');  // store 에 logout 호출 ( 스토어에 저장된 토큰 삭제 )
        location.replace('/login'); // login 페이지로 리다이렉트
        return Promise.reject(err);  // Promise 에러 처리
    }
    if (err.response.status === 401 && !originalRequest._retry) { // 에러코드 401 리턴시 이면서 요청 재시도가 아닌 경우
        originalRequest._retry = true;  // 요청 재시도 플래그 지정
        return axios.post('/api/token/refresh', {}, { headers: { Authorization: 'Bearer ' + store.state.refreshToken }}) // 리프레시 토큰을 헤더에 담고 토큰 갱신 요청
            .then(resp => { // 요청이 성공하면
              store.commit('login', {  // store 에 login 호출 ( 새로운 액세스 & 리프레쉬 토큰으로 스토어 업데이트 )
                accessToken: resp.data.accessToken,
                refreshToken: resp.data.refreshToken
              });
              originalRequest.headers['Authorization'] = 'Bearer ' + resp.data.accessToken; // 원래 요청의 헤더를 새로운 액세스 토큰으로 변경
              updateHeader(); // 전체 요청 헤더 변경
              return axios.request(originalRequest); // 원래 요청을 재 시도
        });
    }
    return Promise.reject(err); // 이외의 에러는 핸들링하지 않는다.
});
/**
 * jquery.ajax 를 사용하는 모든 요청에 인터셉트를 걸어 에러시 적절한 핸들링을 한다.
 *    - 403 에러 발생 ( 액세스 토큰이 파기된 경우 또는 리프레쉬 토큰이 만료 )
 *      - 로그아웃 처리
 *    - 401 에러 발생 ( 액세스 토큰이 만료된 경우 )
 *      - 토큰 갱신 요청을 전송하고 성공시 이전 요청을 재전송, 실패시 로그아웃
 */
$.ajaxPrefilter(function (opts, originalOpts, jqXHR) {
  if (opts.refreshRequest) { // 이미 재전송된 요청일 경우 아무것도 하지 않는다.
    return;
  }
  var defer = $.Deferred(); // promise 객체 래핑
  jqXHR.done(defer.resolve); // 요청이 성공이라면 바로 응답
  jqXHR.fail(function () { // 요청이 에러가 발생했다면 이후 핸들링 처리
      let args = Array.prototype.slice.call(arguments); // 원본 객체 복사
      if (jqXHR.status === 403) { // 에러코드가 403 이라면
	      store.commit('logout'); // store 에 logout 호출 ( 스토어에 저장된 토큰 삭제 )
        defer.rejectWith(jqXHR, args); // Promise 에러 처리
        return location.replace('/login'); // login 페이지로 리다이렉트
      }
      if (jqXHR.status === 401) { // 에러코드가 401 이라면
          $.ajax({
              url: '/api/token/refresh', // 토큰 갱신 요청
              type: 'POST',
              refreshRequest: true, // 재전송하는 요청임을 표시
              error: function () { // 요청 실패시
                  store.commit('logout'); // store 에 logout 호출 ( 스토어에 저장된 토큰 삭제 )
                  defer.rejectWith(jqXHR, args); // Promise 에러 처리
                  location.replace('/login'); // login 페이지로 리다이렉트
              },
              success: function (resp) { // 요청 성공시
                  store.commit('login', { // store 에 login 호출 ( 새로운 액세스 & 리프레쉬 토큰으로 스토어 업데이트 )
                      accessToken: resp.accessToken,
                      refreshToken: resp.refreshToken
                  });
                  updateHeader(); // 전체 요청 헤더 변경
                  var newOpts = $.extend({}, originalOpts, {
                    refreshRequest: true
                  });
                  $.ajax(newOpts).then(defer.resolve, defer.reject); // 원래 요청을 재 시도
              },
              beforeSend: function (request) { // 리프레시 토큰을 헤더에 담고 토큰 갱신 요청
                request.setRequestHeader('Authorization', 'Bearer ' + store.state.refreshToken);
              }
          });
      } else {
          defer.rejectWith(jqXHR, args); // 이외의 에러는 핸들링하지 않는다.
      }
  });
  return defer.promise(jqXHR); // promise 객체 리턴
});
