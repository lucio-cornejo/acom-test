import React, { useState, useEffect } from 'react';
import * as Plotly from 'plotly.js-dist';

interface WordCloudProps {
  data: Array<Record<string, any>>;
  textField: string;
  width?: number;
  height?: number;
  maxWords?: number;
  colorScale?: string;
  title?: string;
}

interface WordFrequency {
  text: string;
  frequency: number;
}

const WordCloudPlotly: React.FC<WordCloudProps> = ({
  data,
  textField,
  width = 800,
  height = 400,
  maxWords = 50,
  colorScale = 'Viridis',
  title = 'Word Cloud'
}) => {
  const [plotData, setPlotData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process data to count word frequencies
  const processWords = (): WordFrequency[] => {
    const wordCount = new Map<string, number>();
    
    data.forEach(record => {
      const text = record[textField];
      if (typeof text === 'string' && text.trim()) {
        // Split into words and clean them
        const words = text.toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .split(/\s+/)
          .filter(word => word.length > 2); // Filter out short words
        
        words.forEach(word => {
          wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
      }
    });

    // Convert to array and sort by frequency
    return Array.from(wordCount.entries())
      .map(([text, frequency]) => ({ text, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, maxWords);
  };

  // Generate scatter plot data for word cloud effect
  const generateScatterData = (words: WordFrequency[]) => {
    if (words.length === 0) return [];

    const maxFreq = words[0].frequency;
    const minFreq = Math.min(...words.map(w => w.frequency));
    
    // Generate spiral positions
    const positions = words.map((word, index) => {
      const angle = index * 2.4; // Golden angle for better distribution
      const radius = Math.sqrt(index) * 15;
      
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        text: word.text,
        frequency: word.frequency,
        size: 10 + ((word.frequency - minFreq) / (maxFreq - minFreq)) * 40
      };
    });

    return [{
      x: positions.map(p => p.x),
      y: positions.map(p => p.y),
      text: positions.map(p => p.text),
      mode: 'text',
      type: 'scatter',
      textfont: {
        size: positions.map(p => p.size),
        color: positions.map((p, i) => i / positions.length) // Normalized color values
      },
      textposition: 'middle center',
      hovertemplate: '<b>%{text}</b><br>Frequency: %{customdata}<extra></extra>',
      customdata: positions.map(p => p.frequency),
      showlegend: false
    }];
  };

  // Alternative: Create a treemap-style word cloud
  const generateTreemapData = (words: WordFrequency[]) => {
    if (words.length === 0) return [];

    return [{
      type: 'treemap',
      labels: words.map(w => w.text),
      values: words.map(w => w.frequency),
      parents: words.map(() => ''), // All at root level
      textinfo: 'label+value',
      textfont: { size: 16 },
      marker: {
        colorscale: colorScale,
        colorbar: {
          title: 'Frequency'
        }
      },
      hovertemplate: '<b>%{label}</b><br>Frequency: %{value}<extra></extra>'
    }];
  };

  // Generate sunburst chart as another visualization option
  const generateSunburstData = (words: WordFrequency[]) => {
    if (words.length === 0) return [];

    // Group words by frequency ranges for better visualization
    const frequencyRanges = [
      { min: 0, max: 2, label: 'Rare (1-2)' },
      { min: 3, max: 5, label: 'Common (3-5)' },
      { min: 6, max: 10, label: 'Frequent (6-10)' },
      { min: 11, max: Infinity, label: 'Very Frequent (11+)' }
    ];

    const labels = [''];
    const parents = [''];
    const values = [0];

    // Add frequency range categories
    frequencyRanges.forEach(range => {
      labels.push(range.label);
      parents.push('');
      values.push(0);
    });

    // Add individual words
    words.forEach(word => {
      const range = frequencyRanges.find(r => word.frequency >= r.min && word.frequency <= r.max);
      if (range) {
        labels.push(word.text);
        parents.push(range.label);
        values.push(word.frequency);
        
        // Update parent category value
        const parentIndex = labels.indexOf(range.label);
        values[parentIndex] += word.frequency;
      }
    });

    return [{
      type: 'sunburst',
      labels,
      parents,
      values,
      branchvalues: 'total',
      hovertemplate: '<b>%{label}</b><br>Value: %{value}<extra></extra>',
      marker: {
        colorscale: colorScale
      }
    }];
  };

  const [chartType, setChartType] = useState<'scatter' | 'treemap' | 'sunburst'>('treemap');

  useEffect(() => {
    setIsLoading(true);
    const words = processWords();
    
    let newPlotData;
    switch (chartType) {
      case 'scatter':
        newPlotData = generateScatterData(words);
        break;
      case 'sunburst':
        newPlotData = generateSunburstData(words);
        break;
      default:
        newPlotData = generateTreemapData(words);
    }
    
    setPlotData(newPlotData);
    setIsLoading(false);
  }, [data, textField, maxWords, colorScale, chartType]);

  const getLayout = () => {
    const baseLayout = {
      title: {
        text: title,
        font: { size: 20 }
      },
      width,
      height,
      margin: { t: 50, l: 50, r: 50, b: 50 }
    };

    if (chartType === 'scatter') {
      return {
        ...baseLayout,
        xaxis: { showgrid: false, zeroline: false, showticklabels: false },
        yaxis: { showgrid: false, zeroline: false, showticklabels: false },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
      };
    }

    return baseLayout;
  };

  const config: Partial<Plotly.Config> = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    displaylogo: false,
    responsive: true
  };

  return (
    <div className="word-cloud-container">
      <div className="mb-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">
          Visualization Type:
        </label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as 'scatter' | 'treemap' | 'sunburst')}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
        >
          <option value="treemap">Treemap</option>
          <option value="scatter">Scatter Word Cloud</option>
          <option value="sunburst">Sunburst</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center" style={{ width, height }}>
          <div className="text-gray-500">Loading word cloud...</div>
        </div>
      ) : (
        <div
          id="plotly-wordcloud"
          ref={(el) => {
            if (el && plotData.length > 0) {
              Plotly.newPlot(el, plotData, getLayout(), config);
            }
          }}
        />
      )}
      
      {!isLoading && plotData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing top {Math.min(maxWords, processWords().length)} words from {data.length} records
        </div>
      )}
    </div>
  );
};

// Example usage component
const WordCloudExample: React.FC = () => {
  const sampleData = [
    { id: 1, description: "Machine Learning Algorithm for Data Analysis", category: "AI", tags: "python, machine learning, data science" },
    { id: 2, description: "React Application Development with TypeScript", category: "Web", tags: "react, typescript, frontend" },
    { id: 3, description: "Machine Learning Model Training and Optimization", category: "AI", tags: "python, tensorflow, optimization" },
    { id: 4, description: "Data Visualization Dashboard using React and D3", category: "Web", tags: "react, d3, visualization" },
    { id: 5, description: "Python Data Science and Machine Learning Pipeline", category: "Analytics", tags: "python, pandas, scikit-learn" },
    { id: 6, description: "JavaScript Framework Development and Testing", category: "Web", tags: "javascript, testing, framework" },
    { id: 7, description: "Deep Learning Neural Network Architecture", category: "AI", tags: "deep learning, neural networks, tensorflow" },
    { id: 8, description: "Data Analysis and Statistical Modeling", category: "Analytics", tags: "statistics, analysis, modeling" },
    { id: 9, description: "React Component Library Development", category: "Web", tags: "react, components, library" },
    { id: 10, description: "Machine Learning Feature Engineering and Selection", category: "AI", tags: "feature engineering, machine learning, data" },
    { id: 11, description: "Python Web Scraping and Data Collection", category: "Analytics", tags: "python, scraping, data collection" },
    { id: 12, description: "React Native Mobile Application Development", category: "Mobile", tags: "react native, mobile, development" },
  ];

  const [selectedField, setSelectedField] = useState<string>('description');
  const [maxWords, setMaxWords] = useState<number>(30);
  const [colorScale, setColorScale] = useState<string>('Viridis');

  const colorScales = [
    'Viridis', 'Plasma', 'Inferno', 'Magma', 'Blues', 'Greens', 'Reds', 
    'Rainbow', 'Portland', 'Jet', 'Hot', 'Blackbody', 'Earth', 'Electric'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Plotly Word Cloud Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field to analyze:
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="description">Description</option>
            <option value="category">Category</option>
            <option value="tags">Tags</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max words:
          </label>
          <input
            type="number"
            value={maxWords}
            onChange={(e) => setMaxWords(parseInt(e.target.value) || 30)}
            min="10"
            max="100"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color scale:
          </label>
          <select
            value={colorScale}
            onChange={(e) => setColorScale(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            {colorScales.map(scale => (
              <option key={scale} value={scale}>{scale}</option>
            ))}
          </select>
        </div>
      </div>

      <WordCloudPlotly
        data={sampleData}
        textField={selectedField}
        width={900}
        height={500}
        maxWords={maxWords}
        colorScale={colorScale}
        title={`Word Cloud - ${selectedField.charAt(0).toUpperCase() + selectedField.slice(1)}`}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Features:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Treemap View</h3>
            <p className="text-sm text-blue-700">Hierarchical boxes sized by word frequency</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🌀 Scatter Word Cloud</h3>
            <p className="text-sm text-green-700">Traditional word cloud with spiral positioning</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">☀️ Sunburst Chart</h3>
            <p className="text-sm text-purple-700">Radial view grouped by frequency ranges</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">🎨 Interactive</h3>
            <p className="text-sm text-orange-700">Hover effects, zoom, and pan capabilities</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Usage:</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <code className="text-sm">
            {`<WordCloudPlotly
  data={yourDataArray}
  textField="yourStringField"
  width={800}
  height={400}
  maxWords={50}
  colorScale="Viridis"
  title="My Word Cloud"
/>`}
          </code>
        </div>
      </div>
    </div>
  );
};


export default WordCloudExample;