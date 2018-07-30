import Vue from 'vue' // vue 코어
import Vuex from 'vuex' // 컴포넌트간 공유 데이타를 저장하는 저장소 플러그인
import axios from 'axios' // http 호출 라이브러리
import createPersistedState from 'vuex-persistedstate' // 저장소를 localstorage 로 사용하게 해주는 플러그인

Vue.use(Vuex); // (vue 자체 명령어 Vue.use: 플러그인 선언)~~~ 저장소 플러그인 추가
/**
 * (vue 자체 명령어 Vuex.Store : 컴포넌트간 공유할 데이타를 정의할 스토어 생성자 )~~~
 *  스토어 생성 및 설정
 */
const store = new Vuex.Store({
  state: { // 저장소에 담은 값을 정의할 수 있는 루트
    accessToken: '', // 액세스 토큰
    refreshToken: '' // 리프레쉬 토큰
  },
  plugins: [createPersistedState()], // 저장소를 localstorage 로 사용하게 해주는 플러그인 적용
  mutations: { // 저장소에 담은 값을 처리할 수 있는 핸들러
    login: (state, payload) => { // 로그인 액션 시 ( 각 컴포넌트에서는 store.commit('login') 와 같이 호출할 수 있다.
      state.accessToken = payload.accessToken; // 액세스 토큰 저장
      state.refreshToken = payload.refreshToken; // 리프레시 토큰 저장
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + store.state.accessToken; // axios 헤더에 공통으로 Authorization 적용
    },
    logout: (state) => { // 로그아웃 액션 시
      state.accessToken = undefined; // 액세스 토큰 삭제
      state.refreshToken = undefined; // 리프레시 토큰 삭제
    }
  },
});

export default store; // store 모듈 적용
