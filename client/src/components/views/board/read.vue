<!--
  게시판 > 글 보기
-->
<template>
  <layout>
    <template v-if="!isLoading">
      <section class="content board-read-box no-padding-bottom">
        <div class="box">
          <div class="box-header with-border">
            <!--
                글 제목
            -->
            <h3 class="box-title">{{ post.title }}</h3>
            <!--
                작성자 정보
                  - 작성자 아이디
                  - 작성 날짜
                  - 조회수
                  - 댓글수
            -->
            <div class="write-info text-muted">
              <!-- 작성자 아이디 -->
              <div class="info-name">
                작성자 <b>{{ post.writerId }}</b>
              </div>
              <div class="info-etc">
                <!-- 작성자 날짜 -->
                <i class="fa fa-clock-o"></i> {{ post.createdAt }}
                <!-- 조회수 -->
                <i class="fa fa-eye"></i> {{ post.viewCnt }}
                <!-- 댓글수 -->
                <i class="fa fa-comment"></i> {{ post.commentCnt }}
              </div>
            </div>
          </div>
          <!-- 게시글 내용 -->
          <div class="box-body">
            <div v-html="post.content" class="write-content" style="word-wrap: break-word;">
            </div>
          </div>
          <!-- 게시글 댓글 목록 -->
          <div v-for="comment in comments" v-if="comment && comment.seq" class="box-footer box-comments">
            <!--
              게시글 댓글
                  - 댓글 작성자 아이디
                  - 댓글 작성 날짜
                  - 댓글 내용
            -->
            <div class="box-comment">
              <div class="comment-text">
                <span class="username">
                  {{ comment.writerId }}
                  <span class="text-muted pull-right">{{ comment.createdAt }}</span>
                </span>
                  {{ comment.comment }}
              </div>
            </div>
          </div>
          <!--
              게시글 댓글 입력 영역
                  - 작성 박스
                  - 작성 버튼
            -->
          <div class="box-footer box-comments">
            <div>
              <div class="input-group">
                <!-- 작성 박스  -->
                <input v-model="formData.comment" type="text" placeholder="댓글을 입력하세요" class="form-control input-sm">
                <span class="input-group-btn">
                  <!-- 작성 버튼  -->
                <button @click="saveComment" data-loading-text="loading" type="button" class="btn btn-info btn-sm">등록</button>
              </span>
              </div>
            </div>
          </div>
          <!--
                하단 버튼 영역
                   - 목록 버튼
                   - 수정 버튼
                   - 삭제 버튼
            -->
          <div class="box-footer">
            <div class="form-group text-center">
              <!-- 목록 버튼  -->
              <button @click="moveBoard" type="button" class="btn btn-dark-gray">목록</button>
              <template v-if="id === post.writerId">
                <!-- 수정 버튼  -->
                <button @click="modifyPost" type="button" class="btn btn-primary">수정</button>
                <!-- 삭제 버튼  -->
                <button @click="deletePost" type="button" class="btn btn-danger">삭제</button>
              </template>
            </div>
          </div>
        </div>
      </section>
      <!--
          이전글 / 다음글 영역
      -->
      <section class="content no-padding-top">
        <div class="row">
          <div class="col-md-12">
            <div class="box box-solid">
              <div v-if="prv || next" class="table-responsive table-prev-next">
                <table class="table no-margin-bottom">
                  <tbody>
                  <!--
                    이전글 영역
                        - 작성글 제목
                        - 작성자 아이디
                        - 작성 날짜
                  -->
                  <tr v-if="prv">
                    <td class="no-border" style="width:60px;"><span class="label label-success">이전글</span></td>
                    <td class="no-border"><a @click.prevent="movePost('/board/' + prv.seq)" href="javascript:;">{{ prv.title }}</a></td>
                    <td class="no-border hidden-xs" style="width:120px">{{ prv.writerId }}</td>
                    <td class="no-border hidden-xs" style="width:160px">{{ prv.createdAt }}</td>
                  </tr>
                  <!--
                    다음글 영역
                        - 작성글 제목
                        - 작성자 아이디
                        - 작성 날짜
                  -->
                  <tr v-if="next">
                    <td><span class="label label-success">다음글</span></td>
                    <td><a @click.prevent="movePost('/board/' + next.seq)" href="javascript:;">{{ next.title }}</a></td>
                    <td class="hidden-xs">{{ next.writerId }}</td>
                    <td class="hidden-xs">{{ next.createdAt }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
    <!-- 경고창 컴포넌트 추가 -->
    <alertModal ref="alertModal" :message="alert.message"/>
  </layout>
</template>
<style></style>
<script>
  import layout from '@/components/layouts/layout' // 레이아웃 컴포넌트
  import alertModal from '@/components/alertModal' // 경고창 컴포넌트
  const jwt = require('jsonwebtoken');  // jwt 라이브러리
  export default {
    components: { layout, alertModal }, // (vue 자체 명령어 components)~~~ 사용할 검포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        id: null, // 로그인한 사용자 아이디
        formData: { // 폼전송용 데이타
          comment: '' // 댓글 내용
        },
        alert: {
          message: '' // 경고창이 뜰 때 노출할 텍스트
        },
        seq: null, // 게시글 seq
        post: {}, // 게시글 데이타
        comments: [], // 댓글 데이타
        prv: {}, // 이전글 데이타
        next: {}, // 다음글 데이타
        isLoading: true // 데이타 로딩 flag
      }
    },
    watch: { // (vue 자체 명령어 watch)~~~ 특정 데이타의 변경 감지
      '$route' (to, from) { // 라우트가 변경될때 호출
        this.renderView(to.params.seq); // 뷰화면을 새로 그린다.
      }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       *  경고창 띄우기
       * @param msg 경고 메시지
       */
      openAlert (msg) {
        this.alert.message = msg; // 경고창에 노출할 텍스트
        this.$refs.alertModal.open(); // 경고창 오픈
      },
      /**
       *  댓글 저장
       * @param e 이벤트
       */
      saveComment (e) {
        if (!this.formData.comment || this.formData.comment.trim().length == 0) { // 데이타 검증
          return this.openAlert('코멘트를 입력해주세요.');
        }

        var btn = $(e.target);
        btn.button('loading'); // 버튼을 로딩 형태로 변환
        var data = { // 전송 데이타 지정
          comment: this.formData.comment, // 댓글 내용
          postNo: this.seq // 글 seq
        };
        this.$http.post('/api/comment/write', {data: data}).then(resp => { // 댓글 작성 api 호출
          this.$set(this.comments, this.comments.length, resp.data); // (vue 자체 명령어 $set: vue 가 관리하는 데이타를 동적으로 변경한다.)~~~ 화면에 작성한 댓글 추가
          this.formData.comment = ''; // 댓글 입력창 비움
          btn.button('reset'); // 작성 버튼 초기화
        }).catch(err => { // 실패시
          console.log(err);
          this.openAlert(err.response.data.message); // 경고창 띄워서 에러 표시
          btn.button('reset'); // 작성 버튼 초기화
        });
      },
      /**
       * 게시글 이동
       * @param path 이동할 경로
       */
      movePost (path) {
        this.$router.push(path); // (vue 자체 명령어 $router: 라우터 접근 )~~~ 라우터 패스 이동
      },
      /**
       *  게시판 리스트 화면으로 이동
       */
      moveBoard () {
        this.$router.push('/board/');
      },
      /**
       * 게시글 수정 화면으로 이동
       */
      modifyPost () {
        this.$router.push('/board/write/' + this.seq);
      },
      /**
       * 게시글 삭제
       *  - /api/board/post/delete/(게시글 번호) 호출 후, 게시글 리스트 페이지로 이동
       */
      deletePost () {
        this.$http.post('/api/board/post/delete/' + this.seq, {}).then(resp => {
          this.$router.push('/board');
        }).catch(err => {
          console.log(err.message);
          this.$router.push('/board');
        });
      },
      /**
       * 댓글 목록 가져오기
       */
      fetchComments () {
        if (this.post.commentCnt === 0) { // 게시글 내에 댓글이 없다면 리턴
          return;
        }
        this.$http.post('/api/comments', { postNo: this.seq }).then(resp => { // 댓글 목록 api 호출
          if (!resp.data || resp.data.length == 0) {
            return;
          }
          for (var i = 0; i < resp.data.length; i++) {
            this.$set(this.comments, i, resp.data[i]); // (vue 자체 명령어 $set : 뷰가 관리하는 데이타를 동적으로 변경)~~~ 가져온 댓글을 바인딩
          }
        }).catch(err => {
          console.log(err);
        });
      },
      /**
       * 게시글 데이타를 가져온다.
       */
      fetchData () {
        this.$http.post('/api/board/' + this.seq, {}).then(resp => {
          this.post = resp.data.post; // 게시글
          this.prv = resp.data.prv; // 이전글
          this.next = resp.data.next; // 다음글
          this.isLoading = false; // 화면 로딩을 중지

          this.fetchComments(); // 댓글 목록 가져오기

        }).catch(err => { // 에러 발생시
          console.log(err.response.data.message);
          this.$router.push('/board'); // (vue 자체 명령어 $router : 라우터 접근)~~~ 게시글 목록 화면으로 이동
        });
      },
      /**
       * 화면을 정리
       *  - 댓글 목록을 삭제
       */
      cleanView () {
        this.comments = [];
      },
      /**
       * 현재 화면에 필요한 데이타를 가져온다.
       * @param seq 게시글 번호
       */
      renderView (seq) {
        this.cleanView(); // 현재 화면 정리
        var decoded = jwt.decode(this.$store.state.accessToken); // jwt 토큰 분석
        this.id = decoded.id; // 로그인된 아이디
        this.seq = seq; // 게시글 번호

        this.fetchData(); // 게시글 데이타 가져오기
      }
    },
    mounted () { // (vue 자체 명령어 mounted : vue 는 <template> 부분의 태그를 읽어서 가상의 엘리먼트를 만든 다음에, 실제 html 엘리먼트와 교체를 한다. 이 작업이 완료되었을 때를 mounted 라고 하며 이때 호출된다.)~~~ dom 이 마운트 되었을 때
      this.renderView(this.$route.params.seq); // 현재 경로에서 글번호를 가져와서 필요한 데이타 호출
    }
  }
</script>
