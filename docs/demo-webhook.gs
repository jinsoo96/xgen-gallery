/**
 * Plateer AI Labs — /demo 폼 수신 웹훅 (Google Apps Script)
 *
 * 폼 제출 데이터를 ① 구글 스프레드시트에 한 줄로 저장하고
 * ② 지정 수신자에게 이메일로 발송한다. (둘을 동시에 처리)
 *
 * ── 배포 방법 (SHEET_ID 불필요 — 시트에 바인딩된 스크립트) ──────
 * 1) 구글 드라이브에서 새 스프레드시트 생성 (이름 자유, 예: "PoC 문의")
 * 2) 그 스프레드시트에서 [확장 프로그램] > [Apps Script] 열기
 *    → 기본 Code.gs 내용을 모두 지우고 이 파일 전체를 붙여넣기 → 저장
 * 3) [배포] > [새 배포] > 톱니바퀴(유형 선택) > [웹 앱]
 *      - 설명: demo-webhook
 *      - 실행 계정: 나 (본인)
 *      - 액세스 권한: 모든 사용자 (Anyone)
 *    → [배포] 클릭 → 권한 검토/승인(시트·메일 접근) 1회 허용
 *    → 표시되는 "웹 앱 URL"(.../exec 로 끝남)을 복사
 * 4) 그 /exec URL을 알려주면 → .env 의 DEMO_WEBHOOK_URL 에 넣고 재빌드
 *    (또는 직접: 프로젝트 .env 에 DEMO_WEBHOOK_URL=<URL> 저장 후
 *     docker compose up -d --build frontend)
 *
 * ※ 스크립트가 그 스프레드시트에 바인딩돼 있으므로 SHEET_ID가 필요 없다.
 * ※ 코드 수정 후 재배포: [배포] > [배포 관리] > 기존 배포 [편집(연필)] >
 *    버전 "새 버전" 선택 후 배포해야 URL이 그대로 유지된다.
 */

const SHEET_NAME = "demo-requests";
const RECIPIENTS = "chat2plex@gmail.com, swan@plateer.com";

const HEADERS = [
  "수신시각",
  "이름",
  "이메일",
  "연락처",
  "회사",
  "부서",
  "직책",
  "방문경로",
  "상담내용",
  "마케팅수신동의",
  "소스",
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveToSheet_(data);
    sendEmail_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function saveToSheet_(d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  sh.appendRow([
    d.receivedAt || new Date().toISOString(),
    d.name || "",
    d.email || "",
    d.phone || "",
    d.company || "",
    d.department || "",
    d.jobTitle || "",
    d.referralPath || "",
    d.inquiry || "",
    d.agreeMarketing ? "Y" : "N",
    d.source || "",
  ]);
}

function sendEmail_(d) {
  const subject = ("[PoC·기술상담 신청] " + (d.company || "") + " " + (d.name || "")).trim();
  const body = [
    "새 PoC · 기술 상담 신청이 접수되었습니다.",
    "",
    "• 이름: " + (d.name || ""),
    "• 이메일: " + (d.email || ""),
    "• 연락처: " + (d.phone || ""),
    "• 회사: " + (d.company || ""),
    "• 부서: " + (d.department || ""),
    "• 직책: " + (d.jobTitle || ""),
    "• 방문경로: " + (d.referralPath || ""),
    "• 마케팅 수신 동의: " + (d.agreeMarketing ? "Y" : "N"),
    "",
    "• 상담 내용:",
    d.inquiry || "",
    "",
    "접수 시각: " + (d.receivedAt || ""),
    "소스: " + (d.source || ""),
  ].join("\n");

  MailApp.sendEmail({
    to: RECIPIENTS,
    replyTo: d.email || "",
    subject: subject,
    body: body,
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
