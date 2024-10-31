// ==UserScript==
// @name         YouTube 閱覽彈窗提示 (限制 3 次)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  每15分鐘彈窗提醒，超過3次繼續閱覽後強制關閉分頁。
// @author       YourName
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MAX_CONTINUE_COUNT = 3;
    const INTERVAL = 15 * 60 * 1000; // 15 分鐘（以毫秒為單位）

    const LAST_TIMESTAMP_KEY = 'lastActivityTimestamp';
    const CONTINUE_COUNT_KEY = 'continueReadingCount';

    let timeout_id = 0;

    // 初始化 localStorage
    function initializeLocalStorage() {
        if (!localStorage.getItem(LAST_TIMESTAMP_KEY)) {
            localStorage.setItem(LAST_TIMESTAMP_KEY, Date.now());
        }
        if (!localStorage.getItem(CONTINUE_COUNT_KEY)) {
            localStorage.setItem(CONTINUE_COUNT_KEY, 0);
        }
    }

    // 檢查時間是否到期
    function checkTimeout() {
        if (!localStorage.getItem(LAST_TIMESTAMP_KEY) || !localStorage.getItem(CONTINUE_COUNT_KEY)) {
            showPopup();
            return;
        }
        const lastTimestamp = parseInt(localStorage.getItem(LAST_TIMESTAMP_KEY), 10);
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastTimestamp) / 1000); // 轉換為秒

        console.log("checkTimeout");
        console.log("timeleft : " + elapsedSeconds);
        if (lastTimestamp > 0 && now - lastTimestamp >= INTERVAL) {
            showPopup();
        } else if (lastTimestamp > 0) {
            // const remainingTime = INTERVAL - (now - lastTimestamp);
            timeout_id = setTimeout(checkTimeout, 10 * 1000); // 等待剩餘時間
        }
    }

    // 建立彈窗內容 (使用 DOM API)
    function showPopup() {
        // 建立彈窗背景
        const overlay = document.createElement('div');
        overlay.id = 'popupOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.75); display: flex;
            align-items: center; justify-content: center; z-index: 9999;
        `;

        // 建立彈窗區塊
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white; padding: 20px; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 10px; text-align: center; max-width: 800px; width: 80%;
        `;

        // 建立文字內容
        const message = document.createElement('p');
        message.textContent = '時間到了！要關閉此分頁嗎？';
        message.style.cssText = `
            font-size: 24px; font-weight: bold; line-height: 1.5; padding: 3rem 1rem; color : #000;
        `;
        popup.appendChild(message);

        const btnDiv = document.createElement('div');
        btnDiv.style.cssText = `
            display: block; margin: auto; justify-content: center !important;
        `;

        // 建立「重置並繼續瀏覽」按鈕
        const resetAndContinueReadingBtn = document.createElement('button');
        resetAndContinueReadingBtn.textContent = '重置並繼續瀏覽';
        resetAndContinueReadingBtn.style.cssText = 'margin: 5px; width: 200px; height: 65px; border-radius: 0.25rem; color: #00a19b; background-color: #ffffff; border: 1px solid #00a19b; cursor: pointer;';
        resetAndContinueReadingBtn.addEventListener('click', resetAndContinueReading);
        btnDiv.appendChild(resetAndContinueReadingBtn);

        // 建立「確認關閉」按鈕
        const closeButton = document.createElement('button');
        closeButton.textContent = '確認關閉';
        closeButton.style.cssText = 'margin: 5px; width: 200px; height: 65px; border-radius: 0.25rem; color: #ffffff; background-color: #00a19b; border: none; cursor: pointer;';
        closeButton.addEventListener('click', closeTab);
        btnDiv.appendChild(closeButton);

        // 建立「繼續閱覽」按鈕
        const continueButton = document.createElement('button');
        continueButton.textContent = '繼續閱覽';
        continueButton.style.cssText = 'margin: 5px; width: 200px; height: 65px; border-radius: 0.25rem; color: #00a19b; background-color: #ffffff; border: 1px solid #00a19b; cursor: pointer;';
        continueButton.addEventListener('click', continueReading);
        btnDiv.appendChild(continueButton);

        popup.appendChild(btnDiv);
        // 將彈窗加入頁面
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    // 隱藏彈窗
    function hidePopup() {
        const popup = document.getElementById('popupOverlay');
        if (popup) popup.remove();
        document.body.style.overflow = 'auto';
    }

    // 關閉分頁
    function closeTab() {
        localStorage.removeItem(LAST_TIMESTAMP_KEY);
        localStorage.removeItem(CONTINUE_COUNT_KEY);
        alert('請手動關閉此分頁。');
        window.location.href = "about:blank"; // 將頁面重定向為空白頁
    }

    // 重置並繼續瀏覽
    function resetAndContinueReading() {
        localStorage.removeItem(LAST_TIMESTAMP_KEY);
        localStorage.removeItem(CONTINUE_COUNT_KEY);
        hidePopup();
        // 初始化腳本
        initializeLocalStorage();
        checkTimeout();
    }

    // 繼續閱覽並檢查次數
    function continueReading() {
        let continueCount = parseInt(localStorage.getItem(CONTINUE_COUNT_KEY), 10) + 1;
        localStorage.setItem(CONTINUE_COUNT_KEY, continueCount); // 更新繼續次數
        hidePopup();

        if (continueCount >= MAX_CONTINUE_COUNT) {
            alert('已達 3 次繼續閱覽上限，分頁即將關閉。');
            closeTab();
        } else {
            localStorage.setItem(LAST_TIMESTAMP_KEY, Date.now()); // 更新 timestamp
            checkTimeout(); // 重新計時
        }
    }

    // 初始化腳本
    initializeLocalStorage();
    checkTimeout();
})();
