import React from 'react';
import { ExternalLink, Download, Activity, Zap as ZapIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PartsList({ buildData, activeTab, setActiveTab }) {

  if (!buildData || !buildData.builds || buildData.builds.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ textAlign: 'center', padding: '24px' }}>
          Enter your requirements and click 'Generate Build' to see the recommended components here.
        </p>
      </div>
    );
  }

  const builds = buildData.builds;
  const currentBuild = builds[activeTab];

  // Format currency for India (INR)
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="glass-panel floating-panel">
      <h2>Recommended Builds</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {builds.map((build, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className="glass-button"
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              background: activeTab === idx ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
              boxShadow: activeTab === idx ? '0 4px 12px var(--accent-glow)' : 'none',
              flex: '0 0 auto'
            }}
          >
            {build.optionName || `Option ${idx + 1}`}
          </button>
        ))}
      </div>

      {/* Benchmarks (Phase 8) */}
      {currentBuild.benchmarks && (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <Activity size={14} style={{ marginRight: '6px', color: '#10b981' }} />
            Estimated Performance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>1080p Gaming</span>
                <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>~{currentBuild.benchmarks.fps1080p} FPS</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (currentBuild.benchmarks.fps1080p / 240) * 100)}%`, height: '100%', background: '#0ea5e9' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>1440p Gaming</span>
                <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>~{currentBuild.benchmarks.fps1440p} FPS</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (currentBuild.benchmarks.fps1440p / 144) * 100)}%`, height: '100%', background: '#8b5cf6' }}></div>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}><ZapIcon size={12} style={{ marginRight: '4px' }} /> Power Draw</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>~{currentBuild.benchmarks.wattage}W</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (currentBuild.benchmarks.wattage / 1000) * 100)}%`, height: '100%', background: '#f59e0b' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Build Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentBuild.components && currentBuild.components.map((part, index) => (
          <div key={index} className="part-card">
            <div className="part-header">
              <span className="part-type">{part.type}</span>
              <span className="part-price">{formatINR(part.price)}</span>
            </div>
            <div className="part-name">{part.name}</div>
            
            {part.link && (
              <a href={part.link} target="_blank" rel="noopener noreferrer" className="part-link">
                Find on Store <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="total-cost">
        <span className="total-cost-label">Total Estimated Cost:</span>
        <span className="total-cost-value">{formatINR(currentBuild.totalEstimatedPrice)}</span>
      </div>

      <button 
        className="glass-button secondary" 
        onClick={() => {
          const doc = new jsPDF();
          
          doc.setFontSize(22);
          doc.setTextColor(14, 165, 233);
          doc.text(`AI PC Build: ${currentBuild.optionName || 'Custom Build'}`, 14, 22);
          
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          let startY = 35;

          if (currentBuild.benchmarks) {
            doc.text(`Estimated Performance:`, 14, startY);
            doc.text(`1080p Gaming: ~${currentBuild.benchmarks.fps1080p} FPS`, 20, startY + 8);
            doc.text(`1440p Gaming: ~${currentBuild.benchmarks.fps1440p} FPS`, 20, startY + 16);
            doc.text(`Power Draw: ~${currentBuild.benchmarks.wattage}W`, 20, startY + 24);
            startY += 35;
          }
          
          const tableColumn = ["Component Type", "Name", "Estimated Price (INR)"];
          const tableRows = [];
          
          if (currentBuild.components) {
            currentBuild.components.forEach(part => {
              const partData = [
                part.type,
                part.name,
                part.price.toLocaleString('en-IN')
              ];
              tableRows.push(partData);
            });
          }
          
          doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: startY,
            theme: 'grid',
            headStyles: { fillColor: [14, 165, 233] },
            styles: { fontSize: 10 }
          });
          
          const finalY = doc.lastAutoTable.finalY || startY;
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`Total Estimated Cost: ${formatINR(currentBuild.totalEstimatedPrice)}`, 14, finalY + 15);
          
          doc.save(`PC_Build_${(currentBuild.optionName || 'Export').replace(/\s+/g, '_')}.pdf`);
        }} 
        style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Download size={16} style={{ marginRight: '8px' }} />
        Export Build Details (PDF)
      </button>
    </div>
  );
}
