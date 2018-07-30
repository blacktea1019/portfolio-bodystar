<!--
  대쉬보드 화면
-->
<template>
  <layout>
    <template v-if="!isLoading">
      <section class="content main-box">
        <div class="row">
          <div class="col-lg-3 col-xs-6">
            <!-- 현재 유저 박스 -->
            <div class="small-box bg-aqua">
              <div class="inner">
                <h3>{{ currentUsers }}<span class="number-person">명</span></h3>
                <p><b>현재 유저</b></p>
              </div>
              <div class="icon">
                <i class="fa fa-fw  fa-users"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-xs-6">
            <!-- 등록 유저 박스 -->
            <div class="small-box bg-green">
              <div class="inner">
                <h3>0<span class="number-person">명</span></h3>
                <p><b>등록 유저</b></p>
              </div>
              <div class="icon">
                <i class="fa fa-fw fa-user-plus"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-xs-6">
            <!-- 미등록 유저 박스 -->
            <div class="small-box bg-yellow">
              <div class="inner">
                <h3>0<span class="number-person">명</span></h3>
                <p><b>미등록 유저</b></p>
              </div>
              <div class="icon">
                <i class="fa fa-fw fa-user-times"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-xs-6">
            <!-- 사이트 방문자 박스 -->
            <div class="small-box bg-red">
              <div class="inner">
                <h3>{{ visitCount }}<span class="number-person">명</span></h3>
                <p><b>사이트 방문자</b></p>
              </div>
              <div class="icon">
                <i class="fa fa-fw fa-user-secret"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </layout>
</template>
<script>
  import layout from '@/components/layouts/layout'  // 레이아웃 컴포넌트
  export default {
    components: { layout }, // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        isLoading: true, // 로딩 플래그
        currentUsers: 0, // 현재 유저수
        visitCount: 0 // 방문자 수
      }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       * 현재 유저수 & 방뭉자 수 데이타 호출
       */
      fetchData () {
        this.$http.post('/api/status').then(resp => {
          this.isLoading = false; // 호출이 완료되면 플래그를 변경하고 화면을 보여준다.

          this.currentUsers = resp.data.currentUsers; // 현재 유저수 바인딩
          this.visitCount = resp.data.visitCount; // 방문자 수 바인딩

        }).catch(err => {
          console.log(err);
          this.isLoading = false;
        });
      }
    },
    mounted () { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      this.fetchData(); // 현재 유저수 & 방뭉자 수 데이타 호출
    }
  }
</script>
