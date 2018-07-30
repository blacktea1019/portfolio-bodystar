<!--
  페이지 전체 레이아웃
-->
<template>
  <div class="wrapper">
    <!-- 헤더 -->
    <Header/>
    <!-- 사이드바 -->
    <Sidebar/>
    <div class="content-wrapper">
      <!--
        페이지 뎁스 텍스트 표시
           예. Home > Dashboard
      -->
      <section class="content-header">
        <ol class="breadcrumb">
          <li><router-link to="/"><i class="fa fa-dashboard"></i> Home</a></router-link></li>
          <li class="active">{{ this.$route.meta.title }}</li>
        </ol>
      </section>
      <!-- 페이지가 변경될 때마다, 해당 컴포넌트가 변경된다. -->
      <slot/>
    </div>
    <!-- 푸터 -->
    <Footer/>
  </div>
</template>
<script>
  import Header from '@/components/layouts/header'
  import Sidebar from '@/components/layouts/sidebar'
  import Footer from '@/components/layouts/footer'
  export default {
    name: 'layout', // (vue 자체 명령어 name)~~~ 컴포넌트의 이름 지정
    components: { Header, Sidebar, Footer }, // (vue 자체 명령어 components)~~~ 임포트해올 컴포넌트 지정
    mounted: function () { // (vue 자체 명령어 mounted)~~~ dom 이 마운트 되었을 때 해당 함수가 호출된다.
      if ($.AdminLTE && $.AdminLTE.layout && $.AdminLTE.layout.activate) {
        $.AdminLTE.layout.activate(); // 해상도에 맞게 전체 height 리사이징
      }
      if ($.fn.dataTable && $.fn.dataTable.ext && $.fn.dataTable.ext.errMode) {
        $.fn.dataTable.ext.errMode = 'none'; // 데이타 테이블에서 데이타 요청 시에, 에러가 발생하면 alert 띄우지 않게 변경
      }
    }
  }
</script>
