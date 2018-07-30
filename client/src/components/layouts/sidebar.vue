<!--
  사이드 바내의 메뉴 설정
-->
<template>
  <aside class="main-sidebar">
    <section class="sidebar">
      <ul class="sidebar-menu">
        <!-- 권한이 0 보다 큰 경우만 노출 -->
        <template v-if="getPermission() > 0">
          <li class="header">MENU</li>
          <!-- 회원 등록 확인/추가 메뉴 링크 -->
          <router-link tag="li" to="/users/manage" active-class="active"><a><i class="fa fa-user-plus"></i> <span>회원 등록 확인/추가</span></a></router-link>
          <!-- 회원 입출입 확인 메뉴 링크 -->
          <router-link tag="li" to="/users/inout" active-class="active"><a><i class="fa fa-users"></i> <span>회원 입출입 확인</span></a></router-link>
          <!-- 게시판 메뉴 링크 -->
          <router-link tag="li" to="/board" active-class="active"><a><i class="fa fa-commenting"></i> <span>게시판</span></a></router-link>
        </template>
        <!-- 권한이 9 보다 같거나 큰 경우만 노출 -->
        <template v-if="getPermission() >= 9">
          <!-- 권한 부여 메뉴 링크 -->
          <router-link tag="li" to="/users/auth" active-class="active"><a><i class="fa fa-key"></i> <span>권한 부여</span></a></router-link>
        </template>
      </ul>
    </section>
  </aside>
</template>
<script>
  const jwt = require('jsonwebtoken'); // jwt 라이브러리
  export default {
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내에서 사용될 메소드 정의
        getPermission() { // 권한 체크
            var accessToken = this.$store.state.accessToken; // 스토어에 저장된 accessToken 을 가져온다.
            if (accessToken) {
                return jwt.decode(accessToken).permission; // 권한 값을 추출하여 리턴
            }
            return 0;
        }
    }
  }
</script>
