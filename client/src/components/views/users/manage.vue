<!--
  회원 등록 확인/추가 화면
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
                  검색 폼
                    - 남 / 녀 체크 박스
                    - 검색 타입 셀렉트 박스
                      - 이름
                      - 이메일
                      - 폰번호
                    - 검색 키워드 입력
                    - 검색 버튼
              -->
              <form @submit.prevent="search" class="form-inline text-right" role="form">
                <!-- 남 / 녀 체크 박스 -->
                <div class="form-group">
                  <div class="checkbox"><label><input v-model="formData.sex" value="0" type="checkbox"> 남</label></div>
                  <div class="checkbox"><label><input v-model="formData.sex" value="1" type="checkbox"> 여</label></div>
                </div>
                <div class="form-group">
                  <!-- 검색 타입 셀렉트 박스 -->
                  <select v-model="formData.column" class="form-control">
                    <option value="nickName">이름</option>
                    <option value="email">이메일</option>
                    <option value="phone">폰번호</option>
                  </select>
                </div>
                <!-- 검색 키워드 입력 & 버튼 -->
                <div class="form-group">
                  <div class="input-group input-group">
                    <!-- 검색 키워드 입력 -->
                    <input v-model="formData.keyword" type="text" class="form-control">
                    <span class="input-group-btn">
                      <!-- 검색 버튼 -->
                      <button @click="search" type="button" class="btn btn-info btn-flat"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </form>
              <!-- 리스트 테이블 -->
              <table id="manageTable" class="table table-bordered table-striped table-hover">
                <!-- 리스트 테이블 컬럼 헤더 -->
                <thead>
                <tr>
                  <th>NO</th>
                  <th>이름</th>
                  <th>성별</th>
                  <th>이메일</th>
                  <th>폰번호</th>
                  <th>시작일자</th>
                  <th>만료일자</th>
                </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- 날짜 선택 컴포넌트 추가 -->
      <dateModal ref="dateModal" :formatDate="formatDate" v-on:selected="saveDate"/>
    </section>
  </layout>
</template>
<script>
  import layout from '@/components/layouts/layout'  // 레이아웃 컴포넌트
  import dateModal from '@/components/dateModal'  // 날짜 선택 컴포넌트

  export default {
    name: 'manage', // (vue 자체 명령어 name)~~~ 컴포넌트 이름
    components: { layout, dateModal }, // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        table: null, // 테이블 엘리먼트
        alert: {
          message: '' // 경고창이 뜰 때 노출할 텍스트
        },
        formatDate: '',  // 날짜 타입 데이타
        formData: {
          column: 'nickName', // 검색시 선택한 타입, 기본으로 이름 검색
          keyword: '', // 검색 키워드
          id: '', // 회원 아이디
          dateType: '', // 날짜 타입 ( 시작 / 종료 )
          date: '', // 선택한 날짜 값
          sex: [0, 1] // 남녀 성별에 해당하는 값
        }
      }
    },
    methods: {  // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      search: function () { // 검색
          this.table.ajax.reload();  // 테이블내 데이타를 재 호출하고 리프레쉬한다.
      },
      /**
       * 선택한 날짜를 저장
       * @param selectedDate 선택한 날짜 값
       */
      saveDate: function (selectedDate) {
          this.formData.date = selectedDate;

          var data = { //  전송할 데이타 값
              id: this.formData.id,
              date: this.formData.date,
              dateType: this.formData.dateType
          };

          this.$http.post('/api/user/time', {data: data}).then(resp => { // 시간 변경 API 호출
              if (resp.status == 200) { // 성공이면
                this.search(); // 테이블 리프레쉬
                this.$refs.dateModal.close(); // 날짜 입력창 닫기
              }
          }).catch(err => {
              console.log(err);
          });
      }
    },
    mounted() { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      var _this = this;
      /**
       * data 를 ajax 로 호출하여 테이블로 만들어주는 코드
       */
      this.table = $('#manageTable').DataTable({
        responsive: true, // 반응형 테이블
        autoWidth: false, // 자동 너비
        searching: false, // 검색
        ordering: false, // 정렬
        processing: true, // 데이타를 부르는 동안 로딩 메시지 표시
        lengthChange: true, // 페이지당 리스트 갯수
        info: false, // 전체 갯수 등 하단에 노출되는 정보
        serverSide: true, // 서버에서 데이타를 호출
        oLanguage: {
          sLengthMenu: "보기 옵션 : _MENU_", // 페이지당 사이즈 표시 글자 변경
        },
        lengthMenu: [ // 페이지당 몇개 씩 보여줄지
          [ 25, 50, 100, 200 ],
          [ 25, 50, 100, 200 ]
        ],
        ajax: { // ajax 데이타 호출 설정
          url: '/api/user/search',
          type: 'POST',
          data: function (d) {
            // 불필요한 파라미터 전송 되지 않게 삭제
            delete d.columns;
            delete d.search;

            d.column = _this.formData.column;
            d.keyword = _this.formData.keyword;
            d.sex = _this.formData.sex;
          }
        },
        columns: [ // 노출할 컬럼 순서와, 데이타 매칭
          { data: "no" },
          { data: "nickName" },
          { data: "sex" },
          { data: "email" },
          { data: "phone" },
          { data: "membership_begin" },
          { data: "membership_end" }
        ],
        columnDefs: [ // 가져온 데이타로 컬럼을 다시 그리기 위해 사용
          {
            render: function ( data, type, obj ) { // 성별 값에 따라 남 / 여 텍스트로 변경해 표시
                if (obj.sex === 0) {
                    return '남';
                }
                return '여';
            },
            targets: 2
          },
          {
            render: function ( data, type, obj ) { // 시작일자 + 날짜 선택 버튼 표시
              return obj.membership_begin + '&nbsp;<button data-id="' + obj.id + '" data-type="begin" data-time="' + obj.membership_begin + '" type="button" class="btn btn-default btn-xs" data-toggle="modal" data-target="#dateModal"><i class="fa fa-lg fa-calendar"></i></button>';
            },
            targets: 5
          },
          {
            render: function ( data, type, obj ) { // 만료일자 + 날짜 선택 버튼 표시
              return obj.membership_end + '&nbsp;<button data-id="' + obj.id + '" data-type="end" data-time="' + obj.membership_end + '" type="button" class="btn btn-default btn-xs" data-toggle="modal" data-target="#dateModal"><i class="fa fa-lg fa-calendar"></i></button>';
            },
            targets: 6
          }
        ]
      });
      var _this = this;
      /**
       * 테이블내에서 클릭 이벤트 발생시, 회원 아이디 & 타입(시작 / 만료)에 맞는 날짜 값 추출
       */
      $('#manageTable tbody').on( 'click', 'button', function () {
          _this.formatDate = $(this).attr('data-time').split(' ', 2)[0].replace(/-/g, '/'); // 2018-06-28 00:00:00 => 2018-06-28 ( 날짜만 남게 자름 )
          _this.formData.id = $(this).attr('data-id');
          _this.formData.dateType= $(this).attr('data-type');
      });
    }
  }

</script>

