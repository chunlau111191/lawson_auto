import XLSX from "xlsx";
// Define the RowData interface
interface RowData {
  EMAIL: string;
  TIXPLUS_AC: string;
  PHONE: string;
  JP_LAST: string;
  JP_FIRST: string;
  KATA_LAST: string;
  KATA_FIRST: string;
  YEAR: string;
  MONTH: string;
  DAY: string;
}

//create a class for the registration list
class RegList {
  email: string;
  tixplus_ac: string;
  phone: string;
  jp_last: string;
  jp_first: string;
  kata_last: string;
  kata_first: string;
  year: string;
  month: string;
  day: string;

  constructor(
    email: string,
    tixplus_ac: string,
    phone: string,
    jp_last: string,
    jp_first: string,
    kata_last: string,
    kata_first: string,
    year: string,
    month: string,
    day: string
  ) {
    this.email = email;
    this.tixplus_ac = tixplus_ac;
    this.phone = phone;
    this.jp_last = jp_last;
    this.jp_first = jp_first;
    this.kata_last = kata_last;
    this.kata_first = kata_first;
    this.year = year;
    this.month = month;
    this.day = day;
  }
  // function to read the excel file
  static readExcelFile(file_path: string) {
    const wb = XLSX.readFile(file_path);
    const ws = wb.Sheets["Sheet1"];
    const sheetJson = XLSX.utils.sheet_to_json(ws);

    const reg_list_json = (sheetJson as RowData[]).map((row: RowData) => {
      return new RegList(
        row.EMAIL,
        row.TIXPLUS_AC,
        row.PHONE,
        row.JP_LAST,
        row.JP_FIRST,
        row.KATA_LAST,
        row.KATA_FIRST,
        row.YEAR,
        row.MONTH,
        row.DAY
      );
    });
    return reg_list_json;
  }
}

export { RegList };
