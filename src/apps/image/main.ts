/* 엔트리: 공통 엔진 + image 전용 코드가 빌드 시 조립된 모듈을 로드한다.
   공통 로직 수정 → src/shared/engine.js, image 전용 수정 → src/apps/image/app.js */
import "virtual:engine-image";
