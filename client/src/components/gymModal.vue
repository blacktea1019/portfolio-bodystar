<!-- 체육관 선택 창 화면 -->
<template>
  <div id="gymModal" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <!-- 상단 닫기 버튼 -->
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span></button>
          <!-- 헤더 텍스트 -->
          <h4 class="modal-title">체육관 선택</h4>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-12">
              <div class="input-group" id="adv-search">
                <!-- 검색 키워드 : 체육관 이름 -->
                <input v-model="gymName"
                       @keyup.enter="searchGym"
                       id="gymName"
                  type="text" class="form-control" placeholder="체육관 이름으로 검색하세요." />
                <div class="input-group-btn">
                  <div class="btn-group" role="group">
                    <!-- 검색 버튼 -->
                    <button @click="searchGym" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br/>
          <div class="box">
            <div class="box-body">
              <!-- 검색한 체육관 테이블 -->
              <table id="gymModalTable" class="table table-bordered table-striped table-hover" width="100%">
                <thead>
                <tr>
                  <th>체육관 이름</th>
                  <th>우편 번호</th>
                </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- 선택한 체육관 코드 -->
      <input id="gymData" class="hidden"/>
    </div>
  </div>
</template>
<script>
  export default {
      data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 정의
        return {
          gymName: '', // 검색 키워드로 입력한 체육관 이름
          table: null // 테이블 엘리먼트
        }
      },
      methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
        /**
         * 체육관 선택 창 오픈
         */
        open: function () {
          $('#gymModal').modal(); // 경고창 오픈
          $('#gymName').val(''); // 검색 입력 초기화
          $('#gymName').focus(); // 입력 부분 포커스
          this.searchGym(); // 체육관 검색
        },
        /**
         * 체육관 선택창 닫기
         */
        close: function () {
          $('#gymModal').modal('hide');
        },
        /**
         * 체육관 검색 API 호출 후 전달 받은 데이타로 테이블 만듬
         */
        searchGym: function () {
          var _this = this;
          if (!this.table) {
            this.table = $('#gymModalTable').DataTable({
              "responsive": false, // 반응형 테이블
              "autoWidth": true, // 자동 너비
              "searching": false, // 검색
              "lengthChange": false,  // 페이지당 리스트 갯수
              "pageLength": 1000, // 페이지당 보여줄 목록
              "scrollY": "200px", // 스크롤 시작될 길이
              "scrollCollapse": true, // 스크롤 노출
              "info": false, // 전체 갯수 등 하단에 노출되는 정보
              "paging": false, // 페이지 표시
              "processing": true, // 데이타를 부르는 동안 로딩 메시지 표시
              "serverSide": true, // 서버에서 데이타를 호출
              "ordering": false, // 정렬
              "ajax": {  // ajax 데이타 호출 설정
                "url": '/api/gym/search',
                "type": 'POST',
                "data": function (d) {
                  // 불필요한 파라미터 전송 되지 않게 삭제
                  delete d.columns;
                  delete d.search;

                  d.gymName = $('#gymName').val();
                }
              },
              "columns": [ // 노출할 컬럼 순서와, 데이타 매칭
                { "data": "gymName" },
                { "data": "postcode" }
              ],
              "columnDefs": [ // 가져온 데이타로 컬럼을 다시 그리기 위해 사용
                {
                  "render": function ( data, type, obj ) { // 체육관 이름으로 링크를 만듬
                    return '<a href="javascript:;" data-code="' + obj.number + '|' + obj.gymName + '">' + obj.gymName + '</a>';
                  },
                  "targets": 0
                },
              ]
            });
            /**
             * 테이블내에서 클릭 이벤트 발생시, 선택한 체육관이름/코드를 부모 엘리먼트에게 전달
             */
            $('#gymModalTable tbody').on( 'click', 'a', function () {
              var data = $(this).attr('data-code');
              $('#gymData').val(data);
              _this.$emit('selected', data);
              _this.close();
            } );
          }
          this.table.ajax.reload(); // 테이블 새로고침
        },
      }
  }
</script>
