import { runProgram, reg_list_json } from "./function/regAc";

(async () => {
  // set mode to 1 for running the full program, 0 for running partial program
  // use prompt to ask user for input
  let mode = 1;

  console.log("reg_list_json", reg_list_json.length);

  // set path to the event
  let path =
    "https://sakurazaka46.com/s/s46/ticket/detail/10thSG_backslive?ima=0000";
  // information configuration
  let fc_account = "XXXX@outlook.com";
  let fc_pw = "XXXXX";
  let lawson_four_digit_pw = "X111";
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

  let minRow: number;
  let maxRow: number;
  let minEventDay: number;
  let maxEventDay: number;

  if (Number(mode) === 1) {
    // set number of records to be created
    minRow = 1;
    maxRow = reg_list_json.length;

    // set min and max event day
    minEventDay = 1;
    maxEventDay = 3;
  } else {
    // set number of records to be created
    minRow = 9;
    maxRow = minRow;

    // set min and max event day
    minEventDay = 2;
    maxEventDay = minEventDay;
  }

  // loop through all days and run the program
  for (let i = minRow - 1; i < maxRow; i++) {
    for (let j = minEventDay - 1; j < maxEventDay; j++) {
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
