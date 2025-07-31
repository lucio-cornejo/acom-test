import type { Struct } from "../utils/tableParser.ts";
import type { MutableRefObject } from 'react';

import { TableParser } from "../utils/tableParser.ts";

import { useState, useRef, useEffect } from 'react';
import * as aq from 'arquero';



interface useTableReturn {
  table: MutableRefObject<aq.ColumnTable>;
  isTableLoaded: boolean;
}


const useTable = (): useTableReturn => {
  const table = useRef(aq.from([]));
  const [isTableLoaded, setIsTableLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      table.current = await aq.loadCSV(
        'db/datos.csv', {
          delimiter: ','
        }
      );


      table.current = table
        .current
        .derive({
          keywords: aq.escape((d: Struct) => d.keywords.replace(/'/g, '"'))
        });

      table.current = new TableParser(table.current)
        .convertMissingValuesToNull()
        .parseDatetimeColumns(["Published"])
        .imputeMissingCategories(["institution"])
        .parseObjectColumns(["keywords"])
        .getTable()
        .derive({
          institution: aq.escape((d: Struct) => (d
            .institution as string)
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim()
          )
        })

      setIsTableLoaded(true);
    };

    loadData();
  }, []);

  return {
    table,
    isTableLoaded,
  }
}


export default useTable;
