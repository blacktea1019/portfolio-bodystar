<!--
  날짜 입력 창
-->
<template>
  <div class="modal dateModal fade" id="dateModal" tabindex="-1" role="dialog" aria-labelledby="dateModalLabel">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <!-- 시작일자/만료일자 설정 헤더 -->
          <h4 class="modal-title" id="dateModalLabel">시작일자/만료일자 설정</h4>
        </div>
        <!-- 캘린더 들어오는 부분 -->
        <div class="modal-body">
        </div>
        <div class="modal-footer">
          <!-- 취소 버튼 -->
          <button type="button" class="btn btn-default pull-left" data-dismiss="modal">취소</button>
          <!-- 저장 버튼 -->
          <button id="dateModal_btn" @click="saveDate" data-loading-text="loading" type="button" class="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  /**
      창 너비에 맞게 확대
   */
  .datepicker-inline {
    width: 100%;
  }
  /**
      창 너비에 맞게 확대
   */
  .datepicker table {
    width: 100%;
  }
</style>
<script>
  export default {
    props: ['formatDate'], // (vue 자체 명령어 props)~~~ 다른 컴포넌트와 연결할 속성을 정의
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 정의
      return {
          el: null // 날짜 선택 엘리먼트
        }
    },
    watch: { // (vue 자체 명령어 watch)~~~ 하위에 선언한 특정 변수가 변경될 때 호출된다.
        formatDate() { // formatDate 값이 변경될 때
            this.el.datepicker('setDate', new Date(this.formatDate)); // 변경된 데이타로 캘린더내에 표시
        }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       * 선택창 닫기
       */
      close: function () {
          $('#dateModal').modal('hide');
          $('#dateModal_btn').button('reset'); // 로딩 버튼 리셋
        },
      /**
       * 저장 버튼을 눌렀을 때
       */
        saveDate() {
          $('#dateModal_btn').button('loading'); // 로딩 버튼 시작

          var date = this.el.datepicker( 'getDate' ); // 선택한 날짜 가져오기

          var year = date.getFullYear().toString(); // 년
          var month = (date.getMonth() + 1).toString(); // 월
          var day = date.getDate().toString(); // 일
          month = month.length === 1 ? '0' + month : month; // MM 타입으로 월 변환
          day = day.length === 1 ? '0' + day : day; // DD 타입으로 일 변환

          this.$emit('selected', year + '-' + month + '-' + day); // 부모 컴포넌트에 이벤트 전달
        }
    },
    mounted () { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다. )~~~ dom 이 마운트 되었을 때
        this.el = $('#dateModal .modal-body'); // 캘린더가 들어갈 위치 엘리먼트
        this.el.datepicker({ // 캘린더 로드
            language: "ko", // 한국어 설정
            format: 'yyyy/MM/DD' // 날짜 포맷
        });
    }
  }
</script>
