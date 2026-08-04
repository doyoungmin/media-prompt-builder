import type { AppData } from "../../types";
import { DATA } from "./data";

/* TODO(마이그레이션): as-is prompt-builder-image.html 의 앱별 로직을 여기로 이식.
   공통 로직은 src/shared/* 를 import 해서 쓴다. */
const app = document.getElementById("app")!;
app.innerHTML = `<p style="padding:24px">${DATA.app} 빌더 — 마이그레이션 대기 중</p>`;
