/* 엔트리: 공통 엔진 + i2v 전용 코드가 빌드 시 조립된 모듈을 로드한다.
   공통 로직 수정 → src/shared/engine/ 의 해당 조각, i2v 전용 수정 → src/apps/i2v/app.js */
import "virtual:engine-i2v";
