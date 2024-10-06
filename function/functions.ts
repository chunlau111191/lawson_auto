import { logger } from "./regAc";

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
        logger.info("Try Again button found. Retrying...");
        await tryAgainButton.click();

        // Wait for navigation but with a timeout to prevent hanging on navigation errors
        await page.waitForNavigation({
          timeout: waitTimeout,
          waitUntil: "load",
        });
        navigationSuccess = true;
        logger.info("Navigation successful after retry.");
      } else {
        logger.info("Try Again button not found. Proceeding...");
        navigationSuccess = true;
        break;
      }
    } catch (error) {
      logger.error(`Error during retry: ${error}`);
      retryCount++;
    }
  } while (!navigationSuccess && retryCount < maxRetries); // Set a limit to the retries

  if (retryCount >= maxRetries) {
    logger.error("Navigation failed after retry.");
    return false;
  } else {
    logger.info("Navigation successful after retry.");
    return true;
  }
}

export { retryOnTryAgainButton };
