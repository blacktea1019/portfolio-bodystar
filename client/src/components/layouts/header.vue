<!--
  페이지 내의 헤더
-->
<template>
  <header class="main-header">
    <!-- 헤더 상단의 BODYSTAR 부분 -->
    <router-link to="/" class="logo">
      <!-- 사이드바를 접었을 시에 노출될 로고 텍스트 -->
      <span class="logo-mini"><b>B</b>S</span>
      <!-- 사이드바가 펼쳐졌을 때 노출될 로고 텍스트 -->
      <span class="logo-lg"><b>BODYSTAR</b></span>
    </router-link>
    <!-- 헤더 네비바의 버튼 영역 -->
    <nav class="navbar navbar-static-top">
      <!-- 사이드바 접기 버튼 -->
      <a ref="sidebarToggleBtn" href="javascript:;" class="sidebar-toggle" data-toggle="offcanvas" role="button">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </a>
      <!-- 로그아웃 버튼 영역 -->
      <div class="navbar-custom-menu">
        <ul class="nav navbar-nav">
          <li>
            <!-- 로그아웃 버튼 -->
            <a v-if="isAuthenticated" @click.prevent="logout"
              href="#"><i class="fa fa-sign-out"></i></a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>
<script>
  export default {
    computed: { // (vue 자체 명령어 computed)~~~ 계산된 프로퍼티 정의, 내부 함수에서 의존 요소 변경시마다 재계산된다.
      isAuthenticated() { // 로그인 되었는지 여부
        return this.$store.state.accessToken; // 스토어에 저장된 액세스 토큰 리턴
      }
    },
    mounted () { // (vue 자체 명령어 mounted)~~~ dom 이 마운트 되었을 때
      // mobile 및 타블렛 화면 일때만,
      if (this.$mq === 'sm' || this.$mq === 'xs') { // width 가 760 보다 작다면
          $('body').removeClass( "sidebar-open" ); // 사이드바를 기본적으로 닫는다.
      }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내에서 사용될 메소드 정의
      logout() {  // 로그 아웃
        this.$http.post('/api/manager/logout') // 로그아웃 api 호출 후
          .then(resp => {
            this.$store.commit('logout'); // 저장소에 logout 요청을 보내 토큰 삭제
            this.$router.push('/login'); // 로그인 페이지로 이동
          })
          .catch(err => {
            this.$store.commit('logout');
            this.$router.push('/login');
          })
      }
    }
  }
</script>
