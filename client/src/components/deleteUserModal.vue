<!--
  회원 삭제 경고 창 화면
-->
<template>
  <div id="deleteUserModal" class="modal modal-danger fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <!-- 상단 닫기 버튼 -->
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span></button>
          <!-- 헤더 텍스트 -->
          <h4 class="modal-title">회원 삭제</h4>
        </div>
        <!-- 삭제 경고 문구 -->
        <div class="modal-body">
          <p>한번 삭제하면 복구할 수 없습니다. 정말로 삭제하시겠습니까?</p>
        </div>
        <div class="modal-footer">
          <!-- 취소 버튼 -->
          <button type="button" class="btn btn-outline pull-left" data-dismiss="modal">취소</button>
          <!-- 확인 버튼 -->
          <button @click="confirmed" type="button" class="btn btn-outline">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
      methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
        /**
         * 경고창 오픈
         */
        open: function () {
          $('#deleteUserModal').modal();
        },
        /**
         * 경고창 닫기
         */
        close: function () {
          $('#deleteUserModal').modal('hide');
        },
        /**
         * 확인 버튼 눌렀을 시에
         */
        confirmed: function () {
          this.$emit('confirmed'); // 부모 컴포넌트에 확인 이벤트 전달
          this.close(); // 경고창 닫기
        }
      }
  }
</script>
