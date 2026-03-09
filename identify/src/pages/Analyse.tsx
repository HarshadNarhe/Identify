import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. We import our new component here, and removed all the recharts imports!
import ChartRenderer from '../components/ChartRenderer'; 

import '../StudentRegistration.css';
import '../Analyse.css';

const allDivisionsList = ['A', 'B', 'C', 'D'];

const Analyse: React.FC = () => {
  const navigate = useNavigate();

  const [standard, setStandard] = useState('');
  const [semester, setSemester] = useState('');
  const [divisions, setDivisions] = useState<string[]>([]); 
  const [graphType, setGraphType] = useState('');
  
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDivDropdownOpen(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); 

  useEffect(() => {
    if (!standard || !semester) return; 

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/analytics?standard=${standard}&semester=${semester}`);
        setChartData(response.data);
      } catch (error) {
        console.error('Failed to fetch chart data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [standard, semester]); 

  const handleDivToggle = (div: string) => {
    if (divisions.includes(div)) {
      setDivisions(divisions.filter(d => d !== div));
    } else {
      setDivisions([...divisions, div]);
    }
  };

  const handleSelectAllDivisions = () => {
    if (divisions.length === allDivisionsList.length) {
      setDivisions([]); 
    } else {
      setDivisions(allDivisionsList); 
    }
  };

  return (
    <div className="student-form-wrapper">
      <div className="analyse-form-card" style={{ maxWidth: '900px' }}>
        
        <div className="student-form-header">
          <h2>Analyse Performance</h2>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="analyse-filters-row">
          
          <div className="analyse-filter-col">
            <label className="form-label">1. Standard</label>
            <select className="form-input" value={standard} onChange={(e) => setStandard(e.target.value)}>
              <option value="" disabled>-- Select Standard --</option>
              <option value="5">Standard 5</option>
              <option value="6">Standard 6</option>
              <option value="7">Standard 7</option>
              <option value="8">Standard 8</option>
              <option value="9">Standard 9</option>
            </select>
          </div>

          <div className="analyse-filter-col">
            <label className="form-label">2. Semester</label>
            <select className="form-input" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="" disabled>-- Select Semester --</option>
              <option value="All">All Semesters (Avg)</option>
              <option value="First">First Sem</option>
              <option value="Mid">Mid Sem</option>
              <option value="Third">Third Sem</option>
              <option value="Last">Last Sem</option>
            </select>
          </div>

          <div className="analyse-filter-col" ref={dropdownRef}>
            <label className="form-label">3. Division</label>
            <div className="form-input custom-dropdown-header" onClick={() => setIsDivDropdownOpen(!isDivDropdownOpen)}>
              {divisions.length === 0 ? 
                <span className="custom-dropdown-placeholder">-- Select Division --</span> : 
                <span>{divisions.length} Selected</span>
              }
              <span>▼</span>
            </div>
            {isDivDropdownOpen && (
              <div className="custom-dropdown-menu">
                <label className="custom-dropdown-item" style={{ fontWeight: 'bold' }}>
                  <input type="checkbox" checked={divisions.length === allDivisionsList.length} onChange={handleSelectAllDivisions} /> 
                  All Divisions
                </label>
                <hr className="custom-dropdown-divider" />
                {allDivisionsList.map(div => (
                  <label key={div} className="custom-dropdown-item">
                    <input type="checkbox" checked={divisions.includes(div)} onChange={() => handleDivToggle(div)} /> 
                    Division {div}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="analyse-filter-col">
            <label className="form-label">4. Graph Type</label>
            <select className="form-input" value={graphType} onChange={(e) => setGraphType(e.target.value)}>
              <option value="" disabled>-- Select Graph --</option>
              <option value="simple-bar">Simple Bar Chart</option>
              <option value="stacked-bar">Stacked Bar Chart</option>
              <option value="simple-line">Simple Line Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>

        </div>

        <div className="graph-display-container">
          <ChartRenderer 
            standard={standard}
            semester={semester}
            divisions={divisions}
            graphType={graphType}
            isLoading={isLoading}
            chartData={chartData}
          />
        </div>

      </div>
    </div>
  );
};

export default Analyse;