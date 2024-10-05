import { runProgram, reg_list_json } from "./function/regAc";

(async () => {
  let path =
    "https://sakurazaka46.com/s/s46/ticket/detail/10thSG_backslive?ima=0000";
  // information configuration
  let fc_account = "XXXX@outlook.com";
  let fc_pw = "XXXX";
  let lawson_four_digit_pw = "XXXX";
  // payment methods 0 = credit card, 1 = convenience store
  const paymentMethod = 1;
  // gender Male = 0, Female = 1
  const genderIdx = 0;

  // Day Selection. index 0 = day1, index 1 = day2, index 2 = day3
  // const dayIndex = 2;

  //Seats index 0 = 全席指定, index 1 = 親子・女性エリア
  const seatIndex = 0;

  // 1 = 1枚, 2 = 2枚
  const numberOfticket = 1;
  for (let i = 1; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      let dayIndex = j;
      await runProgram(
        path,
        fc_account,
        fc_pw,
        lawson_four_digit_pw,
        i,
        reg_list_json,
        paymentMethod,
        genderIdx,
        dayIndex,
        seatIndex,
        numberOfticket
      );
    }
  }
})();
