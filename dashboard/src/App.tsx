import './App.css'

import type { Struct } from "./utils/tableParser.ts";

import LoadingIcon from "./components/LoadingIcon/index.tsx";
import useTable from "./hooks/useTable.ts";
import MultiSelect from "./components/MultiSelect/index.tsx";
import WordsCloud from "./components/WordsCloud/index.tsx";

import { useMemo, useState } from "react";
import * as aq from 'arquero';

const stringAttributes = [
  { label: "Temática principal", value: "main_keyword" },
  { label: "Publicación", value: "Post" },
];


type institutions = null | string | string[];

const filterDataRows = (
  data: aq.ColumnTable,
  institutions: institutions,
): aq.ColumnTable => {
  console.log(institutions)
  if (!institutions) return data;

  if (typeof institutions === 'string') {
    return data
      .filter(aq.escape(
        (d: Struct) => institutions === d.institution
      ));
  }

  return data
    .filter(aq.escape(
      (d: Struct) => institutions.includes(d.institution)
    ));
};

function App() {
  const [stringAttribute, setStringAttribute] = useState(stringAttributes[0].value);
  const [selectedInstitutions, setSelectedInstitutions] = useState<institutions>(null);

  const { table, isTableLoaded } = useTable();

  const uniqueInstitutions = useMemo(() => {
    return (!isTableLoaded
      ? []
      : table
          .current
          .dedupe("institution")
          .array("institution")
          .sort((a, b) => a.localeCompare(b))
          ) as string[];
  }, [isTableLoaded]);


  if (!isTableLoaded) return <LoadingIcon />;

  return (
    <div className="app-container">
      <div>
        <MultiSelect
          selectMode='single'
          displaceItemRemover
          placeholder='Seleccione institución'
          options={uniqueInstitutions.map(i => ({ label: i, value: i }))}
          handleChange={(selectedPDvs) => setSelectedInstitutions(selectedPDvs)}
        />
        <MultiSelect
          selectMode='single'
          displaceItemRemover
          placeholder='Seleccione atributo de los datos'
          options={stringAttributes}
          handleChange={(attribute) => {
            if (!attribute) return;
            setStringAttribute(attribute);
          }}
        />
      </div>

      <div>
        <WordsCloud 
          data={filterDataRows(table.current, selectedInstitutions).objects()}
          textField={stringAttribute}
          title=""
        />
      </div>
    </div>
  )
}

export default App
