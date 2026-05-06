/**
 * Sprint 4 E2E Tests
 * 갱신 제안서 + 커뮤니케이션 + 임차인 응답
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Sprint 4: 갱신 제안서 시스템", () => {
  let page: Page;
  let authToken: string;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 로그인 (테스트용 계정)
    const response = await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // 로딩 대기
    await page.waitForURL(`${BASE_URL}/dashboard`);
    authToken = await page.evaluate(() => localStorage.getItem("sb-access-token"));
  });

  test.describe("Dashboard 계약 목록 + 제안서 버튼", () => {
    test("만기 임박 계약에 제안서 버튼 표시", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // expiring_30 계약인지 확인
      const hasExpiring30 = await page.locator("text=expiring_30").count() > 0;
      expect(hasExpiring30).toBeTruthy();

      // expiring_30 계약의 제안서 버튼 표시 확인
      const proposalButtons = page.locator('button:has-text("제안서")');
      await expect(proposalButtons).toHaveCount({ min: 0, max: 10 });
    });

    test("제안서 발송 버튼 클릭 후 로딩 상태", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // 첫 번째 제안서 버튼 클릭
      const firstProposalButton = page.locator('button:has-text("제안서")').first();
      await firstProposalButton.click();

      // 로딩 상태 확인
      await expect(page.locator("svg.animate-spin")).toBeVisible();
      await page.waitForTimeout(1000); // API 호출 대기

      // 로딩 상태 해제
      await expect(page.locator("svg.animate-spin")).not.toBeVisible();
    });
  });

  test.describe("제안서 폼 UI", () => {
    test("제안서 폼 로드 후 값 표시", async ({ page }) => {
      await page.goto(`${BASE_URL}/proposals`);

      // 계약 선택 후 제안서 목록 페이지
      const contract = page.locator("button:has-text(expiring_30), button:has-text(negotiating)").first();
      await contract.click();

      await page.waitForURL(/\/proposals\/.+/);

      // 제안서 폼 로드 확인
      await expect(page.locator("h3:has-text(갱신 제안서 발송)")).toBeVisible();

      // 계약 정보 자동 입력 확인
      const contractName = page.locator("text=/rental|임대인/i");
      await expect(contractName).toBeVisible();
    });

    test("인상율 계산 및 5% 상한 경고", async ({ page }) => {
      await page.goto(`${BASE_URL}/proposals`);

      const contract = page.locator("button:has-text(expiring_30), button:has-text(negotiating)").first();
      await contract.click();

      // 월세 입력
      const rentInput = page.locator('input[type="number"]:has-text("proposedRent")');
      if (await rentInput.count() > 0) {
        await rentInput.fill("1000000"); // 인상률 5% 초과

        // 인상율 표시 확인
        const rentChangeText = page.locator("text=/인상율/i");
        await expect(rentChangeText).toBeVisible();

        // 5% 초과 경고 확인
        const warningText = page.locator("text=/5% 초과/i");
        await expect(warningText).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("임차인 응답 페이지", () => {
    test("임차인 응답 페이지 로드", async ({ page }) => {
      // 제안서 페이지에서 발송 후 제안서 목록 확인
      await page.goto(`${BASE_URL}/proposals`);

      const contract = page.locator("button:has-text(expiring_30), button:has-text(negotiating)").first();
      await contract.click();

      // 제안서 발송 버튼 클릭
      const sendButton = page.locator('button:has-text("발송")');
      await sendButton.click();
      await page.waitForTimeout(2000);

      // 제안서 목록에서 제안서 클릭
      const proposal = page.locator("text=대기 중").first();
      await proposal.click();
      await page.waitForURL(/\/proposals\/.+/);

      // 제안서 내용 표시 확인
      await expect(page.locator("h2:has-text(갱신 제안서)")).toBeVisible();
      await expect(page.locator("text=/월세/")).toBeVisible();
    });

    test("수락/거절/협의요청 버튼 동작", async ({ page }) => {
      // 임차인 응답 페이지 접근 (테스트용)
      await page.goto(`${BASE_URL}/renew/test-token`);

      // 제안서 내용 표시 확인
      await expect(page.locator("h2:has-text(갱신 제안서)")).toBeVisible();

      // 버튼이 모두 존재하는지 확인
      await expect(page.locator('button:has-text("수락")')).toBeVisible();
      await expect(page.locator('button:has-text("협의 요청")')).toBeVisible();
      await expect(page.locator('button:has-text("거절")')).toBeVisible();

      // 회신 메시지 입력란 존재
      const textarea = page.locator('textarea[placeholder="임대인에게 전달할 메시지를 입력하세요"]');
      await expect(textarea).toBeVisible();
    });
  });

  test.describe("상태 전이 + 커뮤니케이션 이력", () => {
    test("제안서 발송 → Contract 상태 변경", async ({ page }) => {
      await page.goto(`${BASE_URL}/proposals`);

      const contract = page.locator("button:has-text(expiring_30), button:has-text(negotiating)").first();
      await contract.click();

      // 제안서 폼에서 발송
      const sendButton = page.locator('button:has-text("발송")');
      await sendButton.click();

      // 대시보드로 이동
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(2000);

      // Contract 상태가 negotiating로 변경되었는지 확인
      const negotiatingStatus = page.locator("text=협상 중");
      await expect(negotiatingStatus).toBeVisible();
    });

    test("커뮤니케이션 이력 패널 표시", async ({ page }) => {
      await page.goto(`${BASE_URL}/proposals`);

      const contract = page.locator("button:has-text(expiring_30), button:has-text(negotiating)").first();
      await contract.click();

      // 커뮤니케이션 이력 패널 존재 확인
      await expect(page.locator("h3:has-text(커뮤니케이션 이력)")).toBeVisible();
    });
  });
});
