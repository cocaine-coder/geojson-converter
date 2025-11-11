export interface DbfHeader {
  lastUpdated: Date;
  recordCount: number;
  headerLength: number;
  recordLength: number;
}

export interface DbfField {
  name: string;

  /**
   * 字段类型
   * N: 数字
   * F: 浮点数
   * I: 整数
   * D: 日期
   * L: 布尔
   * C: 字符串
   */
  type: "N" | "F" | "I" | "D" | "L" | "C";
  length: number;
  decimalPlaces: number;
}