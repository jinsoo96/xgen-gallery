/**
 * Plateer AI Labs — /newsletter 구독 수신 웹훅 (Google Apps Script)
 *
 * 구독/해지 요청을 ① 구글 스프레드시트에 이메일 기준으로 upsert(구독=Y / 해지=N)하고
 * ② 구독자에게 확인 메일을 발송하며 ③ 담당자에게 알림 메일을 보낸다.
 *
 * ── 배포 방법 (SHEET_ID 불필요 — 시트에 바인딩된 스크립트) ──────
 * 1) 구글 드라이브에서 새 스프레드시트 생성 (이름 자유, 예: "뉴스레터 구독")
 * 2) 그 스프레드시트에서 [확장 프로그램] > [Apps Script] 열기
 *    → 기본 Code.gs 내용을 모두 지우고 이 파일 전체를 붙여넣기 → 저장
 * 3) [배포] > [새 배포] > 톱니바퀴(유형 선택) > [웹 앱]
 *      - 설명: newsletter-webhook
 *      - 실행 계정: 나 (본인)
 *      - 액세스 권한: 모든 사용자 (Anyone)
 *    → [배포] 클릭 → 권한 검토/승인(시트·메일 접근) 1회 허용
 *    → 표시되는 "웹 앱 URL"(.../exec 로 끝남)을 복사
 * 4) 그 /exec URL을 알려주면 → .env 의 NEWSLETTER_WEBHOOK_URL 에 넣고 재빌드
 *    (또는 직접: 프로젝트 .env 에 NEWSLETTER_WEBHOOK_URL=<URL> 저장 후
 *     docker compose up -d --build frontend)
 *
 * ※ 스크립트가 그 스프레드시트에 바인딩돼 있으므로 SHEET_ID가 필요 없다.
 * ※ 데모 문의(docs/demo-webhook.gs)와는 별개의 스프레드시트에 배포하는 것을 권장한다.
 * ※ 코드 수정 후 재배포: [배포] > [배포 관리] > 기존 배포 [편집(연필)] >
 *    버전 "새 버전" 선택 후 배포해야 URL이 그대로 유지된다.
 */

const SHEET_NAME = "newsletter";
// 구독 알림을 받을 담당자(내부). 필요 없으면 빈 문자열("")로 두면 알림 메일을 건너뛴다.
const NOTIFY = "chat2plex@gmail.com, swan@plateer.com";
// 구독자에게 보내는 확인 메일의 발신자 표기
const SENDER_NAME = "Plateer Labs";

const HEADERS = ["이메일", "구독상태", "최초등록시각", "최종변경시각", "소스"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = String(data.email || "").trim().toLowerCase();
    if (!email) return json_({ ok: false, error: "email required" });

    // "Y"(구독) / "N"(해지). route.ts 가 subscribed 를 넘겨주며, 하위호환으로
    // subscribe(boolean)도 처리한다.
    const status =
      data.subscribed === "N" || data.subscribe === false ? "N" : "Y";

    upsertRow_(email, status, data);
    sendConfirm_(email, status);
    notifyTeam_(email, status, data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** 이메일 기준 upsert — 있으면 상태/시각 갱신, 없으면 새 행 추가. */
function upsertRow_(email, status, d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

  const now = d.receivedAt || new Date().toISOString();
  const source = d.source || "";
  const last = sh.getLastRow();

  if (last >= 2) {
    const emails = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === email) {
        const row = i + 2;
        sh.getRange(row, 2).setValue(status); // 구독상태
        sh.getRange(row, 4).setValue(now); // 최종변경시각
        if (source) sh.getRange(row, 5).setValue(source); // 소스
        return;
      }
    }
  }
  // 신규
  sh.appendRow([email, status, now, now, source]);
}

/** 구독자에게 확인 메일 발송. */
function sendConfirm_(email, status) {
  const subscribing = status === "Y";
  const subject = subscribing
    ? "[Plateer Labs] 뉴스레터 구독이 접수되었습니다"
    : "[Plateer Labs] 뉴스레터 구독이 해지되었습니다";
  const body = subscribing
    ? [
        "안녕하세요, Plateer Labs 뉴스레터 구독을 신청해 주셔서 감사합니다.",
        "",
        "Enterprise AI 연구·제품 소식과 기술 노트를 정기적으로 보내드리겠습니다.",
        "구독을 원치 않으실 때는 언제든 뉴스레터 페이지에서 한 번의 클릭으로 해지하실 수 있습니다.",
        "",
        "— Plateer Labs",
      ].join("\n")
    : [
        "Plateer Labs 뉴스레터 구독이 해지되었습니다.",
        "",
        "그동안 함께해 주셔서 감사합니다. 다시 소식을 받고 싶으시면",
        "언제든 뉴스레터 페이지에서 재구독하실 수 있습니다.",
        "",
        "— Plateer Labs",
      ].join("\n");

  MailApp.sendEmail({ to: email, subject: subject, body: body, name: SENDER_NAME });
}

/** 담당자에게 구독/해지 알림. NOTIFY 가 비어 있으면 건너뛴다. */
function notifyTeam_(email, status, d) {
  if (!NOTIFY) return;
  const label = status === "Y" ? "신규 구독" : "구독 해지";
  MailApp.sendEmail({
    to: NOTIFY,
    subject: "[뉴스레터] " + label + " · " + email,
    body: [
      "뉴스레터 " + label + " 요청이 접수되었습니다.",
      "",
      "• 이메일: " + email,
      "• 상태: " + status + (status === "Y" ? " (구독)" : " (해지)"),
      "• 접수 시각: " + (d.receivedAt || ""),
      "• 서비스: " + (d.source || ""),
    ].join("\n"),
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
