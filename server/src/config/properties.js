/**
 * 설정 정보 값을 저장하고, NODE_ENV 에 따라 해당하는 값을 전달
 */
const Properties = function(){
    let nodeEnv = process.env.NODE_ENV || ''; // NODE_ENV 값 확인
    switch(nodeEnv.trim()){
        case 'production': // 서비스 모드

            return {
                api: { // 체육관 검색 API
                    '/getGymList': {
                        url: 'http://52.78.49.39:3200/getGymList',
                    }
                },
                db: { // 디비 셋팅
                    client: 'mysql2',
                    connection: {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_DATABASE
                    },
                    pool: { min: 10, max: 20 }, // 커넥션 풀
                    debug: false // 쿼리 로그 활성화
                },
                log: { // 로깅 레벨
                    level: 'info'
                }
            };

        default: // 개발 모드
            return {
                api: {
                    '/getGymList': {
                        url: 'http://52.78.49.39:3200/getGymList',
                    }
                },
                db: {
                    client: 'mysql2',
                    connection: {
                        host: '127.0.0.1',
                        user: 'bodystar',
                        password: 'bodystar',
                        database: 'bodystar'
                    },
                    pool: { min: 5, max: 10 },
                    debug: true
                },
                log: {
                    level: 'debug'
                }
            };
    }
};

module.exports = Properties();