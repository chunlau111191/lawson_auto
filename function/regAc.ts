import { firefox } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { retryOnTryAgainButton } from "./functions";
import XLSX from "xlsx";

import { getRandomPostalCode, getRandomBanNumber } from "./addressList";
const file_path = "./config_file/tixplus_ac.xlsx";
// read the file and use the first column as the path list, get the 'EMAIL', 'TIXPLUS_AC', 'PHONE', 'JP_LAST',	'JP_FIRST',	'KATA_LAST' and	'KATA_FIRST'
const wb = XLSX.readFile(file_path);
const ws = wb.Sheets["Sheet1"];
interface RowData {
  EMAIL: string;
  TIXPLUS_AC: string;
  PHONE: string;
  JP_LAST: string;
  JP_FIRST: string;
  KATA_LAST: string;
  KATA_FIRST: string;
  DOB: string;
  YEAR: string;
  MONTH: string;
  DAY: string;
}

const sheetJson: RowData[] = XLSX.utils.sheet_to_json<RowData>(ws);

const reg_list_json = sheetJson.map((row) => {
  // const [year, month, day] = row.DOB.split("-"); // Split the DOB into year, month, and day

  return {
    email: row.EMAIL,
    tixplus_ac: row.TIXPLUS_AC,
    phone: row.PHONE,
    jp_last: row.JP_LAST,
    jp_first: row.JP_FIRST,
    kata_last: row.KATA_LAST,
    kata_first: row.KATA_FIRST,
    year: row.YEAR, // Add year to the object
    month: row.MONTH, // Add month to the object
    day: row.DAY, // Add day to the object
  };
});

const userAgentStrings = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.6668.69 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/605.1.15",
  // andriod user agent
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Mobile Safari/537.36",
];

// interface RegListData {
//   EMAIL: string;
//   TIXPLUS_AC: string;
//   PHONE: string;
//   JP_LAST: string;
//   JP_FIRST: string;
//   KATA_LAST: string;
//   KATA_FIRST: string;
//   year: string;
//   month: string;
//   day: string;
// }

const runProgram = async (
  path: string,
  fc_account: string,
  fc_pw: string,
  lawson_four_digit_pw: string,
  time: number,
  json: any,
  paymentMethod: number,
  genderIdx: number,
  dayIndex: number,
  seatIndex: number,
  numberOfticket: number,
  secondPersonPhone?: string,
  secondPersonTixplus?: string
) => {
  console.log("time", time + 1);
  let current_data = json[time];
  // from the json file
  let tel_number = current_data.phone;
  let tixplus_ac = current_data.tixplus_ac;
  let email_address = current_data.email;
  let jp_last = current_data.jp_last;
  let jp_first = current_data.jp_first;
  let kata_last = current_data.kata_last;
  let kata_first = current_data.kata_first;
  let year = current_data.year;
  let month = String(current_data.month).padStart(2, "0");
  let day = String(current_data.day).padStart(2, "0");
  let postal_code: string = getRandomPostalCode().postalCode;
  let randomBanNumber: number = getRandomBanNumber();

  console.log(
    "tixplus_ac",
    tixplus_ac,
    "tel_number",
    tel_number,
    "email_address",
    email_address,
    "jp_last",
    jp_last,
    "jp_first",
    jp_first,
    "kata_last",
    kata_last,
    "kata_first",
    kata_first,
    "year",
    year,
    "month",
    month,
    "day",
    day,
    "secondPersonPhone",
    secondPersonPhone,
    "secondPersonTixplus",
    secondPersonTixplus
  );

  let browser: any = null;
  try {
    // configure the Stealth plugin
    firefox.use(StealthPlugin());
    browser = await firefox.launch({
      headless: false,
    });

    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent:
        userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)],
      timezoneId: "Asia/Tokyo",
      locale: "ja-JP",
    });

    // add custom headers

    const page = await context.newPage();

    // go to
    await page.goto(path);
    await page.waitForTimeout(500);

    const fcLoginButton = await page.$$(
      "body > main > div.ticket_contents > div.inner > div > form > div > button"
    );
    //delete cookies
    const firstButton = fcLoginButton[0];

    if (firstButton) {
      await firstButton.click();
      console.log("First button clicked successfully.");
    } else {
      console.error("No buttons found.");
    }
    console.log("Button clicked successfully.");

    await page.waitForTimeout(2000);
    //fill email and pw in FC login page
    const acBox = await page.$(
      "#form > div:nth-child(1) > div > input[type=email]"
    );
    acBox?.fill(fc_account);

    const pwBox = await page.$(
      "#form > div.form_list.form_list_password > div > input[type=password]"
    );
    pwBox?.fill(fc_pw);

    // click on the login button
    const loginButton = await page.$("#SaveAccount");
    loginButton?.click();

    // wait for the page to load to the next page
    await page.waitForNavigation();

    const confirmButton2 = await page.$("#prevPageBtn");
    confirmButton2?.click();

    // click on the confirm button to lawson
    await page.waitForNavigation();
    const submitButton = await page.$(
      "body > main > div.ticket_contents > div.inner > div > form > input[type=submit]:nth-child(2)"
    );
    submitButton?.click();
    await page.waitForNavigation();

    // check consent box and click on the next button
    const consentBox = await page.$("#CONSENT_CHK_BOX");
    consentBox?.click();
    const nextButton = await page.$("#NEXT");
    nextButton?.click();
    await page.waitForNavigation();
    await page.waitForTimeout(800);

    // select the event
    const eventButton = await page.$(
      "html.js.flexbox.canvas.canvastext.webgl.no-touch.geolocation.postmessage.no-websqldatabase.indexeddb.hashchange.history.draganddrop.websockets.rgba.hsla.multiplebgs.backgroundsize.borderimage.borderradius.boxshadow.textshadow.opacity.cssanimations.csscolumns.cssgradients.no-cssreflections.csstransforms.csstransforms3d.csstransitions.fontface.generatedcontent.video.audio.localstorage.sessionstorage.webworkers.no-applicationcache.svg.inlinesvg.smil.svgclippaths body div#wrapper div#main div#mainContents form#ttg030 div#change div div.contents.cf section table.table01.mt10 tbody tr td table.table01.mb10.tableWordWrap tbody tr td div.entryDetail input#ENTRY_DETAIL_BUTTON_0.btnBoxBase.btnTall.btnFull.ENTRY_DETAIL_BUTTON.doubleClickControl.btnBox09"
    );
    eventButton?.click();
    await page.waitForNavigation();
    await page.waitForTimeout(800);

    //open the date selection table.
    await page.click("a.btnBoxBase");
    await page.waitForTimeout(800);

    // select the date

    const dateBoxes = await page.$$(".sameppfmSelector");
    const dayBox = dateBoxes[dayIndex];
    await dayBox?.click();

    await page.waitForTimeout(800);

    // seat selection
    const seatBoxes = await page.$$(".btnBoxBaseNew");
    const seatBox = seatBoxes[seatIndex];
    await seatBox?.click();

    await page.waitForTimeout(800);

    // number of tickets
    const ticketBoxes = await page.$("#c_PRT_CNT1");
    //select the number of tickets
    await ticketBoxes?.selectOption({ index: numberOfticket });

    await page.waitForTimeout(800);
    // click on the next button
    const nextButton2 = await page.$("#c_ENTRY_HOPE");
    nextButton2?.click();

    // example of retrying on a "Try Again" button
    //retryOnTryAgainButton(page, "#neterrorTryAgainButton", 10, 5000); means that the function will retry 20 times with a 5-second timeout between retries.

    const navigationSuccess1 = await retryOnTryAgainButton(
      page,
      "#neterrorTryAgainButton",
      50,
      5000
    );

    // input email and telephone number
    if (navigationSuccess1) {
      await page.waitForTimeout(1500);
      const emailBox1 = await page.$("#MAIL_ADDRS");
      const emailBox2 = await page.$("#MAIL_ADDRS_CONFIRM");
      const telBox = await page.$("#TEL");
      const telBox2 = await page.$("#TEL_CONFIRM");
      const confirmButton = await page.$("#NEXT");

      await emailBox1?.fill(email_address);
      await emailBox2?.fill(email_address);
      await telBox?.fill(tel_number);
      await telBox2?.fill(tel_number);

      console.log("Filled email and telephone successfully.");

      // Click the confirm button
      await confirmButton?.click();
      console.log("Confirm button clicked successfully.");

      // Handle the "Try Again" button in case it appears after clicking confirm
      await retryOnTryAgainButton(page, "#neterrorTryAgainButton", 50, 5000);

      // wait for 20 seconds for human verification
      await page.waitForNavigation({ timeout: 10 * 60 * 1000 });

      console.log("Resuming script after manual verification.");

      // select the payment method
      const paymentBoxes = await page.$$(".showBtn");
      const paymentBox = paymentBoxes[paymentMethod];
      //check the payment method
      await paymentBox?.click();
      await page.waitForTimeout(800);

      // lawson four digit password box
      const lawsonBoxes = await page.$$(".js-validate");
      const lawsonBox1 = lawsonBoxes[0];
      const lawsonBox2 = lawsonBoxes[1];
      await lawsonBox1?.fill(lawson_four_digit_pw);
      await lawsonBox2?.fill(lawson_four_digit_pw);
      console.log("Filled Lawson password successfully.", lawson_four_digit_pw);

      await page.waitForTimeout(800);
      //telephone
      const lawsonTelBox = await page.$("#EL_TAKE_OVER_FR_TEL");
      const lawsonTelBox2 = await page.$("#EL_TAKE_OVER_FR_TEL_CNF");
      await lawsonTelBox?.fill(tel_number);
      await lawsonTelBox2?.fill(tel_number);
      console.log("Filled Lawson telephone number successfully.", tel_number);

      // name and DoB
      const lawsonJapanLastNameBox = await page.$("#APLCT_FIRST_NAME");
      const lawsonJapanFirstNameBox = await page.$("#APLCT_LAST_NAME");
      const lawsonKataLastNameBox = await page.$("#APLCT_FIRST_NAME_KANA");
      const lawsonKataFirstNameBox = await page.$("#APLCT_LAST_NAME_KANA");
      const lawsonYearBox = await page.$("#APLCT_BIRTHDAY_YEAR");
      const lawsonMonthBox = await page.$("#APLCT_BIRTHDAY_MONTH");
      const lawsonDayBox = await page.$("#APLCT_BIRTHDAY_DAY");
      const genderBoxes = await page.$$(".aplctGender");
      const genderBox = genderBoxes[genderIdx];
      const postalCodeBox = await page.$("#APLCT_ZIP");
      const addressNumberBox = await page.$("#APLCT_LNUM");
      const tixplusIDBox = await page.$("#q_8");

      // fill the value
      await lawsonJapanLastNameBox?.fill(jp_last);
      await lawsonJapanFirstNameBox?.fill(jp_first);
      await lawsonKataLastNameBox?.fill(kata_last);
      await lawsonKataFirstNameBox?.fill(kata_first);
      await lawsonYearBox?.fill(year);
      await lawsonMonthBox?.fill(month);
      await lawsonDayBox?.fill(day);
      await genderBox?.click();
      await tixplusIDBox?.fill(tixplus_ac);
      await postalCodeBox?.fill(postal_code);
      await addressNumberBox?.fill(randomBanNumber.toString());

      await page.waitForTimeout(800);
      // 同行 if needed
      if (numberOfticket == 2) {
        const secondPersonPhoneBox = await page.$("#q_10");
        const secondPersonTixplusBox = await page.$("#q_11");

        // fill the value
        await secondPersonPhoneBox?.fill(secondPersonPhone);
        await secondPersonTixplusBox?.fill(secondPersonTixplus);
      }

      // search address from postal code
      const searchButton = await page.$("#APLCT_ADDRESS_SEARCH_BUTTON");
      await searchButton?.click();

      await page.waitForTimeout(800);

      // check boxes
      const checkBox1 = await page.$("#q_1-同意する");
      const checkBox2 = await page.$("#q_3-確認了承しました");
      const checkBox3 = await page.$("#q_5-確認了承しました");
      const checkBox4 = await page.$("#q_14-確認了承しました");

      // check the boxes
      await checkBox1?.click();
      await checkBox2?.click();
      await checkBox3?.click();
      await checkBox4?.click();

      await page.waitForTimeout(800);
      // confirm button
      const confirmButton3 = await page.$("#NEXT_BUTTON");
      await confirmButton3?.click();
      await page.waitForTimeout(800);
      // await page.waitForNavigation();

      // unsubscribe checkbox and consent box
      const unsubscribeBox = await page.$("#ALSLC_REL");
      const unsubscribeBox2 = await page.$("#LAWSONTICKET_ENTA_MAIL");
      const consentBox2 = await page.$("#CONSENT");
      await unsubscribeBox?.click();
      await unsubscribeBox2?.click();
      await consentBox2?.click();
      await page.waitForTimeout(800);

      // final confirm button
      const finalConfirmButton = await page.$("#ENTRY_FIX");
      await finalConfirmButton?.click();

      await page.waitForTimeout(1500);
    } else {
      console.error("Failed to navigate after first retry.");
    }
  } catch (error) {
    console.error("Error processing:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log("Browser closed.");
  }
};

export { runProgram, reg_list_json };
