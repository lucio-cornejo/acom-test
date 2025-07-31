import './App.css'

import useTable from "./hooks/useTable.ts";
// import WordsCloud from "./components/WordsCloud/index.tsx";
import WordCloudExample from './components/WordsCloud/index.tsx';

function App() {
  const { table, isTableLoaded } = useTable();

  if (!isTableLoaded) return null;

  console.log(table.current.objects())

  return (
    <>
      <WordCloudExample />
    </>
  )
}

export default App
