export interface DbfHeader {
  lastUpdated: Date;
  recordCount: number;
  headerLength: number;
  recordLength: number;
}

export interface DbfField {
  name: string;
  type: string;
  length: number;
  decimalPlaces: number;
}