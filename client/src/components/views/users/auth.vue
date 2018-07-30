<!--
  권한 부여 화면
-->
<template>
  <Layout>
    <section class="content auth-box">
      <div class="row">
        <div class="col-xs-12">
          <div class="box">
            <div class="box-header">
            </div>
            <div class="box-body">
              <!--
                  검색 폼
                    - 검색 타입 셀렉트 박스
                      - 이름
                      - 아이디
                      - 폰번호
                    - 검색 키워드 입력
                    - 검색 버튼
              -->
              <form @submit.prevent="search" class="form-inline text-right" role="form">
                <div class="form-group">
                  <!-- 검색 타입 셀렉트 박스 -->
                  <select v-model="formData.type" class="form-control">
                    <option value="name">이름</option>
                    <option value="id">아이디</option>
                    <option value="phone">폰번호</option>
                  </select>
                </div>
                <!-- 검색 키워드 입력 & 버튼 -->
                <div class="form-group">
                  <div class="input-group input-group">
                    <!-- 검색 키워드 입력 -->
                    <input v-model="formData.keyword"
                           type="text" class="form-control">
                    <span class="input-group-btn">
                      <!-- 검색 버튼 -->
                      <button @click="search"
                              type="button" class="btn btn-default"><i class="fa fa-search"></i></button>
                    </span>
                  </div>
                </div>
              </form>
              <!-- 리스트 테이블 -->
              <table id="userAuthTable" class="table table-bordered table-striped table-hover" width="100%">
                <!-- 리스트 테이블 컬럼 헤더 -->
                <thead>
                <tr>
                  <th>NO</th>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>폰번호</th>
                  <th>소속체육관</th>
                  <th>가입일자</th>
                  <th>권한승인</th>
                  <th>회원삭제</th>
                </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- 경고창 컴포넌트 추가 -->
    <alertModal ref="alertModal" :message="alert.message"/>
    <!-- 회원 삭제 경고창 컴포넌트 추가 -->
    <deleteUserModal ref="deleteUserModal" v-on:confirmed="deleteUser"/>
  </Layout>
</template>
<script>
  import alertModal from '@/components/alertModal' // 경고창 컴포넌트
  import deleteUserModal from '@/components/deleteUserModal' // 회원 삭제 경고창 컴포넌트
  import Layout from '@/components/layouts/layout' // 레이아웃 컴포넌트
  export default {
    name: 'auth', // (vue 자체 명령어 name)~~~ 컴포넌트 이름
    components: { Layout, alertModal, deleteUserModal },  // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
        return {
          table: null,  // 테이블 엘리먼트
          id: null,  // 회원 아이디
          alert: {
            message: '' // 경고창이 뜰 때 노출할 텍스트
          },
          formData: {
              type: 'name', // 검색시 선택한 타입, 기본으로 이름 검색
              keyword: '' // 검색 키워드
          }
        }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      search: function () { // 검색
        this.table.ajax.reload(); // 테이블내 데이타를 재 호출하고 리프레쉬한다.
      },
      /**
       *  경고창 띄우기
       * @param msg 경고 메시지
       */
      openAlert: function(msg) {
        this.alert.message = msg; // 경고창에 노출할 텍스트
        this.$refs.alertModal.open(); // 경고창 오픈
      },
      /**
       * 버튼 초기화
       * @param el 선택한 버튼 엘리먼트
       */
      resetButton: function(el) {
        setTimeout(function() { // 로딩 중 버튼이 원 상태로 돌아갈 때, 800ms 의 딜레이를 준다.
          el.button('reset');
        }, 800);
      },
      /**
       * 회원 삭제
       *  - 성공시 : 삭제 후 테이블 리로드
       *  - 실패시 : 해당 에러 메시지를 경고창에 표시
       */
      deleteUser: function () {
        var data = { id : this.id };
        this.$http.post('/api/manager/delete', {data: data}).then(resp => {
          if (resp.data.status > 400) { // 삭제시 전달한 파라미터가 잘못된 경우 경고창 표시
            return this.openAlert(resp.data.message);
          }
          this.table.ajax.reload(); // 테이블 새로고침
        }).catch(err => { // 실패시
          console.log(err);
          this.openAlert(err.response.data.message); // 서버에서 전달한 에러 메시지로 경고창 표시
        })
      },
      /**
       * 권한 변경
       * @param _btn 이벤트가 발생한 버튼
       * @param _this 이벤트가 발생한 당시의 컨텍스트
       */
      updatePermission: function(_btn, _this) {
        _btn.button('loading'); // 버튼을 로딩중으로 변경
        var data = {
          id: _btn.attr('data-id'), // 사용자 아이디 추출
          permission: _btn.attr('data-permission') // 사용자의 현재 권한 추출
        };
        _this.$http.post('/api/manager/permission', {data: data}).then(resp => { // 권한 API 추출
          if (resp.data.status == 200) { // 성공시
            _this.table.ajax.reload(); // 테이블 새로고침
          }
        }).catch(err => { // 실패시
          console.log(err);
          _this.resetButton(_btn); // 로딩 버튼 리셋
          _this.openAlert(err.response.data.message); // 서버에서 전달한 에러 메시지로 경고창 표시
        })
      }
    },
    mounted() { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      var _this = this;
      /**
       * data 를 ajax 로 호출하여 테이블로 만들어주는 코드
       */
      this.table = $('#userAuthTable').DataTable({
        responsive: true, // 반응형 테이블
        autoWidth: false, // 자동 너비
        searching: false, // 검색
        lengthChange: true, // 페이지당 리스트 갯수
        info: false, // 전체 갯수 등 하단에 노출되는 정보
        ordering: false, // 정렬
        processing: true, // 데이타를 부르는 동안 로딩 메시지 표시
        serverSide: true,  // 서버에서 데이타를 호출
        oLanguage: {
          sLengthMenu: "보기 옵션 : _MENU_",  // 페이지당 사이즈 표시 글자 변경
        },
        lengthMenu: [ // 페이지당 몇개 씩 보여줄지
          [ 25, 50, 100, 200 ],
          [ 25, 50, 100, 200 ]
        ],
        ajax: { // ajax 데이타 호출 설정
          url: '/api/manager/search',
          type: 'POST',
          data: function (d) { // 데이타가 호출되기 전에 실행되는 함수
            // 불필요한 파라미터 전송 되지 않게 삭제
            delete d.columns;
            delete d.search;

            d.type = _this.formData.type;
            d.keyword = _this.formData.keyword;
          }
        },
        columns: [ // 노출할 컬럼 순서와, 데이타 매칭
          { data: "no" },
          { data: "id" },
          { data: "name" },
          { data: "phone" },
          { data: "gymName" },
          { data: "joinDate" },
          { data: "permission" },
          { data: "permission" }
        ],
        columnDefs: [ // 가져온 데이타로 컬럼을 다시 그리기 위해 사용
          { responsivePriority: 1, targets: 0 },
          { responsivePriority: 2, targets: 2 },
          {
            render: function ( data, type, obj ) { // 권한에 따라 권한 승인 / 승인 취소 버튼을 만든다.
              var permission = parseInt(obj.permission);
              if (permission === 1) {
                return '<button type="button" data-loading-text="loading" data-type="permission" data-id="'+ obj.id + '" data-permission="0" class="btn btn-block btn-default btn-xs">승인취소</button>';
              } else {
                return '<button type="button" data-loading-text="loading" data-type="permission" data-id="'+ obj.id + '" data-permission="1" class="btn btn-block btn-success btn-xs">승인하기</button>';
              }
            },
            targets: 6
          },
          {
            render: function ( data, type, obj ) { // 회원 삭제 버튼을 만든다.
              return '<button type="button" data-type="delete" data-id="'+ obj.id + '" class="btn btn-block btn-danger btn-xs">회원 삭제</button>';
            },
            targets: 7
          }
        ]
      });
      var _this = this;
      /**
       * 테이블내에서 클릭 이벤트 발생시, 타입에 따라 권한 승인 및 취소 / 회원 삭제 함수로 이동한다.
       */
      $('#userAuthTable tbody').on( 'click', 'button', function () {
        var dataType = $(this).attr('data-type'); // 타입 추출
        if (dataType === 'delete') { // 회원 삭제라면
          _this.id = $(this).attr('data-id'); // 회원 아이디 추출
          _this.$refs.deleteUserModal.open(); // (vue 자체 명령어 $refs : template 내에 ref="deleteUserModal" 로 선언된 엘리먼트 반환)~~~ 회원 삭제 경고창 표시
        } else if (dataType === 'permission') { // 권한 변경이라면
          _this.updatePermission($(this), _this); // 권한 변경 함수
        }
      });
    }
  }
</script>

