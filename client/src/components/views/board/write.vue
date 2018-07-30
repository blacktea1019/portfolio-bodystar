<!--
  게시판 > 글 작성
-->
<template>
  <layout>
    <section class="content board-write-box">
      <!--
          글 작성 폼
            - 제목
            - 내용
            - 취소 버튼
            - 저장 버튼
      -->
      <form @submit.prevent="save">
        <div class="form-group">
          <!-- 제목 입력 -->
          <input v-model="formData.title" type="text" class="form-control" placeholder="제목을 입력하세요">
        </div>
        <div class="form-group">
          <!-- 내용 입력 -->
          <textarea id="boardTextArea" class="textarea" placeholder="내용을 입력해주세요"
                    style="width: 100%; height: 300px; font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px;"></textarea>
        </div>
        <div class="form-group text-center">
          <!-- 취소 버튼 -->
          <a @click="cancel" type="button" class="btn btn-dark-gray">취소</a>
          <!-- 저장 버튼 -->
          <button @click="save" type="button" class="btn btn-success">저장</button>
        </div>
      </form>
    </section>
    <!-- 경고창 컴포넌트 추가 -->
    <alertModal ref="alertModal" :message="alert.message"/>
  </layout>
</template>
<script>
  import layout from '@/components/layouts/layout' // 레이아웃 컴포넌트
  import alertModal from '@/components/alertModal' // 경고창 컴포넌트
  export default {
    components: { layout, alertModal },  // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        seq: null, // 게시글 번호
        alert: {
          message: '' // 경고창이 뜰 때 노출할 텍스트
        },
        textArea: null, // 입력 텍스트 엘리먼트
        formData: { // 폼전송용 데이타
          title: '' // 제목
        }
      }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       * 작성한 글 불러오기
       */
      loadData () {
        this.seq = this.$route.params.seq; // (vue 자체 명령어 $route : 라우터 접근 )~~~ 경로에서 게시글 번호 가져옴
        var _this = this;
        return new Promise((resolve, reject) => {
          if (!_this.seq) { // 게시글 번호가 없다면 신규 작성으로 판단
            return resolve({
              title: '',
              content: ''
            });
          }
          this.$http.post('/api/board/post/' + _this.seq).then(resp => { // 게시글 데이타 가져오는 API 호출
            _this.formData.title = resp.data.title; // 가져온 제목 바인딩
            resolve(resp.data);
          }).catch(err => {
            reject(err);
          });
        });
      },
      /**
       * 취소 버튼 클릭시 리스트 화면으로 이동
       */
      cancel () {
        this.$router.push('/board');
      },
      /**
       * 게시글 저장
       */
      save () {
        if (!this.formData.title || this.formData.title.trim().length == 0) { // 제목 입력 검증
          return this.openAlert('제목을 입력하여 주세요.');
        }

        var content = this.textArea.val(); // 입력한 내용 가져오기

        if (!content || content.trim().length == 0) { // 입력한 내용 검증
          return this.openAlert('내용을 입력하여 주세요.');
        }

        var data = { // 폼 전송할 데이타 구성
          title: this.formData.title, // 제목
          content: content // 내용
        };
        var url = '/api/board/write';
        if (this.seq) {
          url += '/' + this.seq;
        }
        this.$http.post(url, {data: data}).then(resp => {  // /api/board/write/(게시글 seq) 형태의 저장 API 호출
          this.$router.push('/board'); // 성공시 리스트 화면으로 이동
        }).catch(err => { // 실패시
          console.log(err);
          this.openAlert(err.response.data.message); // 에러메시지와 함께 경고창 표시
        });
      },
      /**
       *  경고창 띄우기
       * @param msg 경고 메시지
       */
      openAlert: function(msg) {
        this.alert.message = msg; // 경고창에 노출할 텍스트
        this.$refs.alertModal.open(); // 경고창 오픈
      }
    },
    mounted() { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      this.$nextTick(function() { // (vue 자체 명령어 $nextTick : 바인딩한 엘리먼트가 실제 접근 가능한 상태가 되면 호출된다.)~~~ dom 이 마운트 되고, 해당 엘리먼트에 접근 가능한 상태까지 대기
        this.loadData().then(post => { // 저장된 글 데이타 호출
          this.textArea = $('#boardTextArea'); // 내용 입력 영역 셀렉트
          this.textArea.val(post.content); // 내용 입력 영역에 작성된 내용 전달
          this.textArea.wysihtml5({ // 에디터 로드
            image: false, // 이미지 버튼 제거
            link: false, // 링크 버튼 제거
            toolbar: {
              image: false, // 툴바에서 이미지 버튼 제거
              link: false // 툴바에서 링크 버튼 제거
            }
          })
        }).catch(err => {
          alert('게시글이 존재하지 않거나 삭제되었습니다.');
          this.$router.push('/board');
        });
      });

    }
  }
</script>

