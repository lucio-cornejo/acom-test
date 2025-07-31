import { categoricalNaReplacement } from './constants.ts'
import { parseLimaDatetime } from './datetimeCalculator.ts';

import * as aq from 'arquero';


export type Struct = Record<string, any>;

export class TableParser {
  constructor(private table: aq.ColumnTable) {}

  convertMissingValuesToNull(): this {
    for (const columnName of this.table.columnNames()) {
      this.table = this.table.impute({ [columnName]: () => null });
    }
    return this;
  }

  parseBooleanColumns(booleanColumns: string[]): this {
    for (const columnName of booleanColumns) {
      this.table = this.table.derive({
        [columnName]: aq.escape((d: Struct) =>
          d[columnName] === null
            ? null
            : ["true", "1"].includes(aq.op.lower(d[columnName]))
        ),
      });
    }
    return this;
  }

  parseFloatColumns(floatColumns: string[]): this {
    for (const columnName of floatColumns) {
      this.table = this.table.derive({
        [columnName]: aq.escape((d: Struct) => (d[columnName] === null 
          ? null 
          : parseFloat(d[columnName])
        )),
      });
    }
    return this;
  }
  
  parseDatetimeColumns(dtColumns: string[]): this {
    for (const columnName of dtColumns) {
      this.table = this.table.derive({
        [columnName]: aq.escape((d: Struct) => (d[columnName] === null 
          ? null 
          : parseLimaDatetime(d[columnName])
        )),
      });
    }
    return this;
  }

  formatDateColumns(dateColumns: string[]): this {
    for (const columnName of dateColumns) {
      this.table = this.table.derive({
        [columnName]: aq.escape((d: Struct) => (d[columnName] === null 
          ? null 
          : d[columnName]?.format('DD-MM-YYYY') ?? null
        )),
      });
    }
    return this;
  }
  formatDatetimeColumns(dtColumns: string[]): this {
    for (const columnName of dtColumns) {
      this.table = this.table.derive({
        [columnName]: aq.escape((d: Struct) => (d[columnName] === null 
          ? null 
          : d[columnName]?.format('DD-MM-YYYY HH:mm:ss') ?? null
        )),
      });
    }
    return this;
  }

  parseObjectColumns(objColumns: string[], replaceQuotes: boolean = false): this {
    for (const columnName of objColumns) {
      this.table = this.table.derive({
        [columnName] : aq.escape((d: Struct) => (
            d[columnName] === null
              ? null
              : JSON.parse(
                replaceQuotes
                  ? d[columnName].replace(/'/g, '"')
                  : d[columnName]
              )!
        ))
      })
    }
    return this;
  }

  parseDatetimeRecordsColumns(cols: string[]): this {
    this.parseObjectColumns(cols, true);

    for (const col of cols) {
      this.table = this.table
        .derive({
          [col]: aq.escape(
            (d: Struct) => d[col] === null
              ? null
              : new TableParser(aq.from(d[col]))
                  .parseDatetimeColumns(["fecha_inicio_form"])
                  .getTable()
                  .objects()
          )
        })
    }
    return this;
  }

  imputeMissingCategories(catColumns: string[], replacement = categoricalNaReplacement): this {
    this.table = this.table
      .params({ catNaRep: replacement })
      .impute(
        Object.fromEntries(
          catColumns.map(
            col => [col, (_: Struct, $: Struct) => $.catNaRep]
          )
        )
      );

    return this;
  }

  getTable(): aq.ColumnTable {
    return this.table;
  }
}
