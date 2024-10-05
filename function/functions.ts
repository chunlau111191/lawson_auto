async function retryOnTryAgainButton(
  page: any,
  tryAgainSelector: string,
  maxRetries: number = 10,
  waitTimeout: number = 5000
): Promise<boolean> {
  let retryCount = 0;
  let tryAgainButton;
  let navigationSuccess = false;

  do {
    try {
      await page.waitForTimeout(1000); // Small delay between retries

      // Check if the "Try Again" button exists
      tryAgainButton = await page.$(tryAgainSelector); // Use the passed selector

      if (tryAgainButton) {
        console.log("Try Again button found. Clicking it...");
        await tryAgainButton.click();

        // Wait for navigation but with a timeout to prevent hanging on navigation errors
        await page.waitForNavigation({
          timeout: waitTimeout,
          waitUntil: "load",
        });
        navigationSuccess = true;
        console.log("Page navigated successfully.");
      } else {
        console.log("No Try Again button found. Proceeding...");
        navigationSuccess = true;
        break;
      }
    } catch (error) {
      console.error("Navigation failed, retrying...", error);
      retryCount++;
    }
  } while (!navigationSuccess && retryCount < maxRetries); // Set a limit to the retries

  if (retryCount >= maxRetries) {
    console.error("Exceeded maximum retry attempts for 'Try Again' button.");
    return false;
  } else {
    console.log("Navigation successful after retry.");
    return true;
  }
}

export { retryOnTryAgainButton };
