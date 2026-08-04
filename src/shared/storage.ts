/** localStorage 래퍼. as-is 의 "prompt-builder:*" 키 체계를 그대로 유지해 기존 사용자 데이터 호환. */
const NS = "prompt-builder:";
export const load = (k: string) => { try { return localStorage.getItem(NS + k); } catch { return null; } };
export const save = (k: string, v: string) => { try { localStorage.setItem(NS + k, v); } catch { /* noop */ } };
