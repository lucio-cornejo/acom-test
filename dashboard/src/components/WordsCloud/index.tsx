import LoadingIcon from './../LoadingIcon/index.tsx';

import React, { useState, useEffect } from 'react';

import * as Plotly from 'plotly.js-dist';


interface WordsCloudProps {
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

const WordsCloud: React.FC<WordsCloudProps> = ({
  data,
  textField,
  width = 800,
  height = 400,
  maxWords = 50,
  colorScale = 'Viridis',
  title = 'Nube de palabras'
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
          // Remove punctuation
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          // Filter out short words
          .filter(word => word.length > 2); 
        
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
      // Golden angle for better distribution
      const angle = index * 2.4;
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
        // Normalized color values
        color: positions.map((_, i) => i / positions.length)
      },
      textposition: 'middle center',
      hovertemplate: '<b>%{text}</b><br>Frequency: %{customdata}<extra></extra>',
      customdata: positions.map(p => p.frequency),
      showlegend: false
    }];
  };

  const generateTreemapData = (words: WordFrequency[]) => {
    if (words.length === 0) return [];

    return [{
      type: 'treemap',
      labels: words.map(w => w.text),
      values: words.map(w => w.frequency),
      // All at root level
      parents: words.map(() => ''),
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

  const [chartType, setChartType] = useState<'scatter' | 'treemap'>('treemap');

  useEffect(() => {
    setIsLoading(true);
    const words = processWords();
    
    let newPlotData;
    switch (chartType) {
      case 'scatter':
        newPlotData = generateScatterData(words);
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
          Tipo de visualización: &nbsp;
        </label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as 'scatter' | 'treemap')}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
        >
          <option value="scatter">Nube de palabras</option>
          <option value="treemap">Diagrama de árbol</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center" style={{ width, height }}>
          <LoadingIcon />
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
          Mostrando las {Math.min(maxWords, processWords().length)} palabras top entre {data.length} observaciones
        </div>
      )}
    </div>
  );
};


export default WordsCloud;
