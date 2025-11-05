export interface DbfHeader {
  lastUpdated: Date;
  recordCount: number;
  headerLength: number;
  recordLength: number;
}

export interface DbfField {
  name: string;
  type: "N" | "F" | "I" | "D" | "L" | "C";
  length: number;
  decimalPlaces: number;
}