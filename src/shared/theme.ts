/* 저장된 테마를 첫 페인트 전에 적용 — as-is 의 head 인라인 스크립트를 모듈로 이식 */
try {
  if (localStorage.getItem("prompt-builder:theme") === "light")
    document.documentElement.dataset.theme = "light";
} catch { /* localStorage 접근 불가 환경 무시 */ }
export {};
