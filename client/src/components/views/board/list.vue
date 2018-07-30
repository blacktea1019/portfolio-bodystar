<!--
  게시판 > 리스트 보기
-->
<template>
  <layout>
    <section class="content">
      <div class="row">
        <div class="col-xs-12">
          <div class="box">
            <div class="box-header">
            </div>
            <div class="box-body">
              <!--
                검색 옵션
                  - 제목, 작성자 선택 셀렉트 박스
               -->
              <form @submit.prevent="search" class="form-inline text-right" role="form">
                <div class="form-group">
                  <select v-model="formData.column" class="form-control">
                    <option value="title">제목</option>
                    <option value="writerId">작성자</option>
                  </select>
                </div>
                <!--
                검색 옵션
                  - 검색어 입력
                  - 검색 버튼
               -->
                <div class="form-group">
                  <div class="input-group input-group">
                    <!-- 검색어 입력 -->
                    <input v-model="formData.keyword" type="text" class="form-control">
                    <span class="input-group-btn">
                      <!-- 검색 버튼 -->
                      <button @click="search" type="button" class="btn btn-info btn-flat"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </form>
              <!-- 리스트 테이블 -->
              <table id="boardListTable" class="table table-bordered table-striped table-hover">
                <!-- 리스트 테이블 컬럼 헤더 -->
                <thead>
                <tr>
                  <th>NO</th>
                  <th>제목</th>
                  <th>글쓴이</th>
                  <th>작성일</th>
                  <th>조회</th>
                </tr>
                </thead>
              </table>
              <div class="board-list-bottom">
                <!-- 게시판 글쓰기 버튼 -->
                <router-link to="/board/write" class="btn btn-block btn-success">글쓰기</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>
<script>
  import layout from '@/components/layouts/layout' // 레이아웃 컴포넌트
  export default {
    name: 'list', // (vue 자체 명령어 name)~~~ 컴포넌트 이름
    components: { layout }, // (vue 자체 명령어 components)~~~ 사용할 검포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        table: null, // 테이블 엘리먼트
        alert: {
          message: '' // 경고창이 뜰 때 노출할 텍스트
        },
        formatDate: '', // 폼 전송용 데이타 : 날짜
        formData: { // 폼 전송용 데이타
          column: 'title',  // 검색시 선택한 타입, 기본으로 이름 검색
          keyword: '', // 검색 키워드
        }
      }
    },
    methods: {  // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      search: function () { // 검색
        this.table.ajax.reload(); // 테이블내 데이타를 재 호출하고 리프레쉬한다.
      }
    },
    mounted() {  // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      var _this = this;
      /**
       * data 를 ajax 로 호출하여 테이블로 만들어주는 코드
       *
       *  - ajax ?
       *
       */
      this.table = $('#boardListTable').DataTable({
        responsive: true, // 반응형 테이블
        autoWidth: false, // 자동 너비
        searching: false, // 검색
        lengthChange: true, // 페이지당 리스트 갯수
        info: false, // 전체 갯수 등 하단에 노출되는 정보
        ordering: false, // 정렬
        processing: true, // 데이타를 부르는 동안 로딩 메시지 표시
        serverSide: true, // 서버에서 데이타를 호출
        oLanguage: {
          sLengthMenu: "보기 옵션 : _MENU_", // 페이지당 사이즈 표시 글자 변경
        },
        lengthMenu: [ // 페이지당 몇개 씩 보여줄지
          [ 25, 50, 100, 200 ],
          [ 25, 50, 100, 200 ]
        ],
        ajax: { // ajax 데이타 호출 설정
          url: '/api/board/search',
          type: 'POST',
          data: function (d) { // 데이타가 호출되기 전에 실행되는 함수
            // 불필요한 파라미터 전송 되지 않게 삭제
            delete d.columns;
            delete d.search;

            d.column = _this.formData.column;
            d.keyword = _this.formData.keyword;
          }
        },
        columns: [ // 노출할 컬럼 순서와, 데이타 매칭
          { data: "seq" },
          { data: "title" },
          { data: "writerId" },
          { data: "createdAt" },
          { data: "viewCnt" }
        ],
        columnDefs: [ // 가져온 데이타로 컬럼을 다시 그리기 위해 사용
          {
            /**
             *  1번 컬럼을 가져온 데이타를 사용하여 다시 그린다.
             */
            render: function ( data, type, obj ) {
                var html = '<a href="javascript:;" data-href="/board/' + obj.seq + '">' + obj.title + '</a>';
                if (obj.commentCnt > 0) {
                  html += ' [' + obj.commentCnt + ']';
                }
              return html;
            },
            targets: 1 // 몇번 째 컬럼을 다시 그릴지
          }
        ]
      });
      var _this = this;
      /**
       * 테이블내에서 클릭 이벤트 발생시, 해당하는 주소로 이동한다.
       */
      $('#boardListTable tbody').on( 'click', 'a', function () {
          _this.$router.push($(this).attr('data-href')); // (vue 자체 명령어 $router : 라우터에 접근)~~~ 이벤트에서 href 를 추출하여 라우팅 주소를 변경
      });
    }
  }
</script>

