<!--
  경고창 화면
-->
<template>
  <div class="modal fade"
       id="alertModal"
       tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content text-center">
        <div class="modal-body">
          <h4>
            <!-- 경고 메시지 -->
            <b><span v-html="message"/></b></h4>
        </div>
        <div class="modal-footer">
          <div>
            <!-- ok 버튼 -->
            <button type="button" data-dismiss="modal" class="btn btn-primary btn-block">OK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
      props: [  // (vue 자체 명령어 props)~~~ 다른 컴포넌트와 연결할 속성을 정의
          'message'
      ],
      methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
        /**
         * 경고창 오픈
         */
        open: function () {
          $('#alertModal').modal();
        },
        /**
         * 경고창 닫기
         */
        close: function () {
          $('#alertModal').modal('hide');
        }
      }
  }
</script>
