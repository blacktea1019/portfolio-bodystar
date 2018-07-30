<!--
    회원 가입 화면
-->
<template>
  <div class="full-page bg-color-gray">
    <div class="register-box">
      <div class="register-logo">
        <!-- 로고 텍스트 -->
        <span class="text-logo">BODY STAR GYM</span>
        <!-- 헤더 -->
        <h1>회원 가입</h1>
        <p class="text-muted">Enter your details to get instant access.</p>
      </div>
      <div class="register-box-body bg-color-gray no-padding">
        <!--
          회원 가입 입력 영역
              - 아이디
              - 비밀번호
              - 비밀번호 확인
              - 이름
              - 폰번호
              - 소속 체육관
              - 이메일
              - 약관
              - 약관 동의 체크박스
              - 가입하기 버튼
         -->
        <form class="form-horizontal" @submit.prevent="validateForm" method="post" novalidate="true">
          <div class="box-body text-left">
            <div class="form-group">
              <label class="col-sm-3 control-label">ID</label>
              <div class="col-sm-9">
                <div class="input-group">
                  <!-- 아이디 입력 -->
                  <input v-model="formData.userId" type="text" class="form-control" placeholder="아이디">
                  <span class="input-group-btn">
                    <!-- 중복 확인 버튼 -->
                  <button @click="checkUserExists" type="button" class="btn btn-success">중복확인</button>
                </span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label">비밀번호</label>
              <div class="col-sm-9">
                <!-- 비밀번호 입력 -->
                <input v-model="formData.password" type="password" class="form-control" placeholder="8~12글자, 영문/숫자/특수문자 포함">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label">비밀번호 확인</label>
              <div class="col-sm-9">
                <!-- 비밀번호 확인 입력 -->
                <input v-model="formData.passwordConfirm" type="password" class="form-control" placeholder="비밀번호 확인">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label">이름</label>
              <div class="col-sm-9">
                <!-- 이름 입력 -->
                <input v-model="formData.name" type="text" class="form-control" placeholder="이름">
              </div>
            </div>
            <div class="form-group form-padding">
              <label class="col-sm-3 control-label">폰번호</label>
              <div class="col-sm-9">
                <!-- 폰번호 입력 -->
                <input v-model="formData.phone1" type="text" class="form-control" placeholder=""><span class="phone-hyphen text-center">&#45;</span><input v-model="formData.phone2" type="text" class="form-control" placeholder=""><span class="phone-hyphen text-center">&#45;</span><input v-model="formData.phone3" type="text" class="form-control" placeholder="">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label">소속 체육관</label>
              <div class="col-sm-9">
                <div class="input-group">
                  <!-- 소속 체육관 입력 -->
                  <input v-model="gymName"
                         @click="openGymModal"
                         readonly type="text" class="form-control" placeholder="소속 체육관을 검색하세요.">
                  <span class="input-group-btn">
                    <!-- 소속 체육관 검색 버튼 -->
                  <button @click="openGymModal"
                          type="button" class="btn btn-success" disabled>검색</button>
                </span>
                </div>
              </div>
            </div>
            <div class="form-group form-padding form-email">
              <label class="col-sm-3 control-label">이메일</label>
              <div class="col-sm-9">
                <!-- 이메일 입력 -->
                <input v-model="formData.email1" type="text" class="form-control" placeholder=""><span class="form-at">&#64;</span><input v-model="formData.email2" type="text" class="form-control" placeholder="naver.com">
                <select v-model="emailSuffix" @change="formData.email2 = emailSuffix" class="form-control no-padding-right">
                  <option value="">직접입력</option>
                  <option value="naver.com">네이버</option>
                  <option value="hanmail.net">다음</option>
                  <option value="gmail.com">구글</option>
                  <option value="nate.com">네이트</option>
                </select>
              </div>
            </div>
            <div class="control-label">
              <label>회원가입 약관</label>
              <!-- 회원가입 약관 -->
              <textarea class="form-control valid" readonly="" rows="10" cols="100">제15조(개인정보보호)
① "홈페이지"는 이용자의 정보 수집시 구매계약 이행에 필요한 최소한의 정보를 수집합니다.
다음 사항을 필수사항으로 하며 그 외 사항은 선택사항으로 합니다.
1. 희망ID(회원의 경우)
2. 비밀번호(회원의 경우)
3. 이름
4. 별명
5. E-MAIL
6. 주소
7. 전화번호
8. 휴대번호
9. 메일링서비스
10. SMS 수신여부

② "홈페이지"가 이용자의 개인 식별이 가능한 개인정보를 수집하는 때에는 반드시 당해 이용자의 동의를 받습니다.

③ 제공된 개인정보는 당해 이용자의 동의 없이 목적 외의 이용이나 제3자에게 제공할 수 없으며, 이에 대한 모든 책임은 "홈페이지"가 집니다. 다만, 다음의 경우에는 예외로 합니다.
1. 배송업무상 배송업체에게 배송에 필요한 최소한의 이용자의 정보(성명, 주소, 전화번호)를 알려주는 경우
2. 통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 식별할 수 없는 형태로 제공하는 경우

④ "홈페이지"가 제2항과 제3항에 의해 이용자의 동의를 받아야 하는 경우에는 개인정보관리 책임자의 신원(소속, 성명 및 전화번호 기타 연락처), 정보의 수집목적 및 이용목적, 제3자에 대한 정보제공 관련사항(제공 받는자, 제공목적 및 제공할 정보의 내용)등 정보통신망이용촉진 등에 관한 법률 제16조제3항이 규정한 사항을 미리 명시하거나 고지해야 하며 이용자는 언제든지 이 동의를 철회할 수 있습니다.

⑤ 이용자는 언제든지 "홈페이지"가 가지고 있는 자신의 개인정보에 대해 열람 및 오류정정을 요구할 수 있으며 "홈페이지"는 이에 대해 지체 없이 필요한 조치를 취할 의무를 집니다. 이용자가 오류의 정정을 요구한 경우에는 "홈페이지"는 그 오류를 정정할 때까지 당해 개인정보를 이용하지 않습니다.

⑥ "홈페이지"는 개인정보 보호를 위하여 관리자를 한정하여 그 수를 최소화하며 신용카드, 은행계좌 등을 포함한 이용자의 개인정보의 분실, 도난, 유출, 변조 등으로 인한 이용자의 손해에 대하여 모든 책임을 집니다.

⑦ "홈페이지" 또는 그로부터 개인정보를 제공받은 제3자는 개인정보의 수집목적 또는 제공받은 목적을 달성한 때에는 당해 개인정보를 지체 없이 파기합니다.
              </textarea>
              <div class="col-xs-12">
                <div class="checkbox text-center">
                  <label>
                    <!-- 회원가입 약관 체크박스 -->
                    <input v-model="formData.consentTerms" type="checkbox">회원가입 약관에 동의합니다.
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="box-footer bg-color-gray">
            <!-- 가입하기 버튼 -->
            <button @click="validateForm" type="button" class="btn bg-navy btn-join">가입하기</button>
          </div>
        </form>
      </div>
    </div>
    <!-- 경고창 컴포넌트 -->
    <alertModal ref="alertModal" :message="alert.message"/>
    <!-- 체육관 검색창 컴포넌트 -->
    <gymModal ref="gymModal" v-on:selected="selectedGym"/>
  </div>

</template>
<script>
  import alertModal from '@/components/alertModal' // 경고창 컴포넌트
  import gymModal from '@/components/gymModal' // 체육관검색창 컴포넌트
  export default {
    components: { alertModal, gymModal }, // (vue 자체 명령어 components)~~~ 사용할 컴포넌트 지정
    data() { // (vue 자체 명령어 data)~~~ 컴포넌트 내부에서 사용할 데이타 지정
      return {
        alert: {
          message: ''  // 경고창이 뜰 때 노출할 텍스트
        },
        gymName: '망포체육관', // 체육관 명
        emailSuffix: '', // 이메일 @ 뒷부분
        formData: { // 폼 전송시 전달할 데이타
          userId: '', // 사용자 아이디
          password: '', // 비밀번호
          passwordConfirm: '', //비밀번호 확인
          name: '', // 이름
          phone1: '', // 폰번호 1
          phone2: '', // 폰번호 2
          phone3: '', // 폰번호 3
          gymCode: '1001086', // 체육관 코드
          email1: '', // 이메일 1
          email2: '', // 이메일 2
          consentTerms: false // 약관 동의 여부
        },
        isUserExists: true // 아이디 중복 확인 여부
      }
    },
    methods: { // (vue 자체 명령어 methods)~~~ 컴포넌트 내부에서 사용할 메소드 지정
      /**
       * 체육관 선택 창에서 선택했을 시에 호출되는 메소드
       * @param data 선택한 체육관 정보
       */
      selectedGym: function (data) {
        var values = data.split('\|'); // 체육관이름|체육관코드 분리
        this.formData.gymCode = values[0]; // 체육관 코드 바인딩
        this.gymName = values[1]; // 체육관 이름 바인딩
      },
      /**
       * 체육관 선택 창 오픈
       */
      openGymModal: function () {
        this.$refs.gymModal.open(); // (vue 자체 명령어 $refs : template 내에 ref="gymModal" 로 선언된 엘리먼트를 리턴)~~~ 체육관 선택 창 오픈
      },
      /**
       * 입력한 아이디 검증
       */
      validateUserId: function () {
        const errors = []; // 검증 오류를 담을 배열
        if (!this.formData.userId) { // 아이디를 입력하지 않음
          errors.push('아이디를 입력하여 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!/^[A-Za-z0-9]{3,20}$/.test(this.formData.userId)) { // 아이디 형식 정규식으로 검사
          errors.push('아이디가 형식에 맞지 않습니다. <br/>(3~20글자, 영문, 숫자만 입력 가능)');  // 오류 메시지를 배열에 담는다.
        }
        return errors;
      },
      /**
       * 가입시 입력한 모든 내용 검증
       */
      validateForm: function () {
        const errors = this.validateUserId(); // 아이디 검증

        if (this.isUserExists) { // 중복 확인 여부
          errors.push('중복 확인해주세요~!');  // 오류 메시지를 배열에 담는다.
        }
        if (!this.formData.password) { // 패스워드 입력 여부
          errors.push('비밀번호를 입력하여 주세요.');  // 오류 메시지를 배열에 담는다.
        }
        if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+`~_=<>:"'?/{}\[\]\\])[a-zA-Z0-9!@#$%^&*()\-+`~_=<>:"'?/{}\[\]\\]{8,12}$/.test(this.formData.password)) { // 비밀번호 패턴 정규식 검증
          errors.push('비밀번호가 형식에 맞지 않습니다. <br/> (8~12글자, 영문/숫자/특수문자 포함, 대소문자 구분함)'); // 오류 메시지를 배열에 담는다.
        }
        if (!this.formData.passwordConfirm) { // 비밀번호 확인 입력 여부
          errors.push('비밀번호 확인란을 입력하여 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!(this.formData.passwordConfirm === this.formData.password)) { // 비밀번호 & 비밀번호 확인 같은지 비교
          errors.push('비밀번호/비밀번호 확인 란이 서로 일치하지 않습니다.'); // 오류 메시지를 배열에 담는다.
        }
        if (!this.formData.name) { // 이름 입력 여부
          errors.push('이름을 입력하여 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!(this.formData.phone1 && this.formData.phone2 && this.formData.phone3)) { // 폰번호 입력 확인
          errors.push('폰 번호를 입력하여 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!this.formData.gymCode) { // 체육관 선택 여부
          errors.push('소속 체육관을 입력해 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!(this.formData.email1 && this.formData.email2)) { // 이메일 입력 여부 확인
          errors.push('이메일을 입력하여 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (!this.formData.consentTerms) { // 약관 동의 여부
          errors.push('약관에 동의해 주세요.'); // 오류 메시지를 배열에 담는다.
        }
        if (errors.length > 0) { // 검증 후 에러가 1개라도 있다면
          return this.openAlert(errors[0]); // 경고창 띄우고 종료
        }
        this.$http.post('/api/manager/register', {data: { // 가입 API 호출
          id: this.formData.userId,
          password: this.formData.password,
          name: this.formData.name,
          phone: this.formData.phone1 + '-' + this.formData.phone2 + '-' + this.formData.phone3, // 폰번호
          gymCode: this.formData.gymCode, // 체육관 코드
          email: this.formData.email1 + '@' + this.formData.email2, // 이메일
          consentTerms: this.formData.consentTerms, // 약관 동의 여부
        }}).then(resp => { // 저장 완료시에
          this.$store.commit('login', { // 스토어에 토큰 저장
            accessToken: resp.data.accessToken,
            refreshToken: resp.data.refreshToken
          });
          this.$router.push('/'); // 대쉬보드로 이동
        }).catch(err => { // 실패시에
          console.log(err.response);
          this.openAlert(err.response.data.message) // 오류 메시지 경고창 노출
        });
      },
      /**
       * 아이디 중보 체크
       */
      checkUserExists: function() {
        const errors = this.validateUserId(); // 아이디 검증
        if (errors.length > 0) { // 검증에 1개라도 실패했다면
          this.openAlert(errors[0]); // 오류 메시지 노출하고
          return; // 종료
        }
        this.$http.post('/api/manager/exists', {id: this.formData.userId}).then(resp => { // 중복 체크 API 호출
          this.isUserExists = resp.data.exists;
          if (resp.data.exists) { // 결과 여부에 따라 경고 노출 변경
            this.openAlert('이미 사용 중인 아이디 입니다.');
          } else {
            this.openAlert('사용 가능한 아이디 입니다.');
          }
        }).catch(err => this.openAlert('아이디 중복 체크 중에 오류가 발생하였습니다.'));
      },
      /**
       *  경고창 띄우기
       * @param msg 경고 메시지
       */
      openAlert: function(msg) {
        this.alert.message = msg;  // 경고창에 노출할 텍스트
        this.$refs.alertModal.open();  // (vue 자체 명령어 $refs : template 내에 ref="alertModal" 로 선언된 엘리먼트를 리턴)~~~ 경고창 오픈
      }
    }
  }
</script>
