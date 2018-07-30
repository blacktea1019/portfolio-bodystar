<!--
  로그인 화면
-->
<template>
  <div class="wrapper-login">
    <div class="no-margin-left">
      <div class="full-page bg-color-gray">
        <div class="login-box">
          <div class="login-logo no-margin-bottom">
            <!-- 로고 이미지 -->
            <img src="/static/logo.png" height="100px">
            <!-- 로고 텍스트 -->
            <h1><b>BODY STAR GYM</b></h1>
            <p class="text-muted">Log in with your ID and Password.</p>
            <p class="text-muted">테스트 계정 : admin / admin!123</p>
          </div>
          <div class="login-box-body">
            <!--
                로그인 입력 영역
                  - 아이디
                  - 비밀번호
                  - 로그인 버튼
                  - 회원 가입 버튼
            -->
            <form @submit.prevent="login">
              <div class="row">
                <div class="col-xs-12 center-block">
                  <div class="form-group has-feedback">
                    <!-- 아이디 입력 -->
                    <input v-model="id" type="id" class="form-control" placeholder="아이디">
                    <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
                  </div>
                  <div class="form-group has-feedback">
                    <!-- 비밀번호 입력 -->
                    <input v-model="password" type="password" class="form-control" placeholder="비밀번호">
                    <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="form-group">
                  <div class="col-xs-12 center-block">
                    <p>
                      <!-- 로그인 버튼 -->
                      <button id="login" type="submit" class="btn btn-block btn-danger">로그인</button>
                    </p>
                    <p>
                      <!-- 회원 가입 버튼 -->
                      <router-link to="/register" class="btn btn-block btn-dark-gray">회원가입</router-link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- 경고창 검포넌트 -->
    <alertModal ref="alertModal" :message="alert.message"/>
  </div>
</template>
<script>
  import axios from 'axios' // http client 라이브러리
  import alertModal from '@/components/alertModal' // 경고창 컴포넌트
  export default {
    components: { alertModal },  // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        id: 'admin', // 로그인시 입력한 아이디
        password: 'admin!123', // 로그인시 입력한 비밀번호
        alert: {
          message: '' // 경고창이 뜰 때 노출할 텍스트
        }
      }
    },
    methods: {  // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       *  경고창 띄우기
       * @param msg 경고 메시지
       */
      openAlert: function(msg) {
        this.alert.message = msg; // 경고창에 노출할 텍스트
        this.$refs.alertModal.open(); // 경고창 오픈
      },
      /**
       * 로그인
       */
      login() {
        axios.post('/api/manager/login', {id: this.id, password: this.password}) // 로그인 API 호출
          .then(resp => { // 성공시
            if (resp.data.status === 422) { // 로그인 실패시
              return this.openAlert(resp.data.message); // 경고창 띄우면서 오류 메시지 전달
            }
            this.$store.commit('login', {accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken}); // (vue 자체 명령어 $store : 스토어에 접근)~~~ 전달 받은 토큰 스토어에 저장
            this.$router.push('/'); // (vue 자체 명령어 $router : 라우터에 접근)~~~  대시보드 페이지로 이동
          }).catch(err => { // 서버 오류 발생시
            console.log(err);
        });
      }
    }
  }
</script>


















