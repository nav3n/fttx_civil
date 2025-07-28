
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WORKFLOW_DATA, TESTS_DATA } from './constants/workflows';
import { WorkflowCategory, WorkflowSection, WorkflowStep, InfoItem, Citation, TableData } from './types';
import Sidebar from './components/Sidebar';
import { CitationIcon, DocumentIcon, ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import { CITATIONS } from './constants/citations';

type ActiveView = 'WORKFLOWS' | 'TESTS' | 'DOCUMENTS';

// --- Reusable Components defined inside App.tsx ---
function CitationModal({ citation, onClose }: { citation: Citation; onClose: () => void; }) {
  const modalRoot = document.getElementById('popover-root');
  if (!modalRoot) return null;

  const sourceInfo = CITATIONS[citation.source as keyof typeof CITATIONS];
  if (!sourceInfo) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Citation Source</h3>
        <div className="space-y-3">
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm font-semibold text-gray-600">Source</p>
            <p className="text-gray-800 mt-1 font-mono text-sm">{sourceInfo.apa}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm font-semibold text-gray-600">Page</p>
            <p className="text-gray-800 mt-1 font-mono text-sm">{citation.page}</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Close
        </button>
      </div>
    </div>,
    modalRoot
  );
}

function CitationButton({ citation }: { citation: Citation }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        aria-label="Show citation"
      >
        <CitationIcon />
      </button>
      {isOpen && <CitationModal citation={citation} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function getResponsiblePartyColor(party: string) {
  switch (party) {
    case 'Applicant': return 'border-blue-500';
    case 'Authority': return 'border-green-500';
    case 'Shared': return 'border-purple-500';
    default: return 'border-gray-400';
  }
}

function CarouselFlowSection({ section }: { section: WorkflowSection }) {
  if (section.type !== 'flowchart' && section.type !== 'steps') return null;
  const allSteps = section.content as WorkflowStep[];
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkForScrollPosition = () => {
    const { current } = scrollContainerRef;
    if (current) {
      const { scrollLeft, scrollWidth, clientWidth } = current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const { current } = scrollContainerRef;
    if (current) {
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkForScrollPosition();
      const observer = new ResizeObserver(checkForScrollPosition);
      observer.observe(container);
      container.addEventListener('scroll', checkForScrollPosition);
      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', checkForScrollPosition);
      };
    }
  }, [allSteps]);

  const scrollbarStyle: React.CSSProperties = { scrollbarWidth: 'none', msOverflowStyle: 'none' };
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-gray-700">{section.title}</h3>
          {section.description && <p className="text-gray-600 mt-1 mb-6 text-lg">{section.description}</p>}
        </div>
        {section.citation && <CitationButton citation={section.citation} />}
      </div>
      <div className="relative group">
        <div ref={scrollContainerRef} className="flex items-stretch space-x-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory" style={scrollbarStyle}>
          {allSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex-shrink-0 w-80 snap-start bg-white p-5 rounded-lg shadow-lg border-l-4 ${getResponsiblePartyColor(step.responsible)} h-full flex flex-col justify-center`}>
                <h4 className="font-bold text-gray-800 text-lg">{step.id}. {step.title}</h4>
                <p className="text-gray-600 text-base mt-1">{step.description}</p>
                {step.duration && <p className="text-sm text-indigo-600 font-semibold mt-2">Duration: {step.duration}</p>}
              </div>
              {index < allSteps.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0 text-gray-400">
                  <ChevronRightIcon />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {canScrollLeft && <button onClick={() => handleScroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full p-2 shadow-lg transition-opacity opacity-0 group-hover:opacity-100" aria-label="Scroll left"><ChevronLeftIcon /></button>}
        {canScrollRight && <button onClick={() => handleScroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full p-2 shadow-lg transition-opacity opacity-0 group-hover:opacity-100" aria-label="Scroll right"><ChevronRightIcon /></button>}
      </div>
    </div>
  );
}

function InfoSection({ section }: { section: WorkflowSection }) {
  if (section.type !== 'info' || !Array.isArray(section.content)) return null;
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">{section.title}</h3>
      <div className="space-y-5">
        {(section.content as InfoItem[]).map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-start">
              {item.title && <h4 className="font-bold text-gray-800 text-lg mb-2 flex-1 pr-4">{item.title}</h4>}
              {item.citation && <CitationButton citation={item.citation} />}
            </div>
            {item.details && <p className="text-gray-600 text-base leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{item.details}</p>}
            {item.visualization && <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">{item.visualization}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestSection({ section }: { section: WorkflowSection }) {
    if (section.type !== 'info' || !Array.isArray(section.content)) return null;
    return (
        <div className="mt-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">{section.title}</h3>
            <div className="space-y-6">
                {(section.content as InfoItem[]).map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <h4 className="font-bold text-gray-800 text-xl">{item.title}</h4>
                                {item.description && <p className="text-gray-600 text-base mt-1">{item.description}</p>}
                            </div>
                            {item.citation && <CitationButton citation={item.citation} />}
                        </div>
                        
                        {item.subItems && item.subItems.length > 0 && <hr className="border-gray-200" />}
                        
                        {item.subItems && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                {item.subItems.map((subItem, subIndex) => (
                                    <div key={subIndex}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-semibold text-gray-700 text-lg flex-1 pr-2">{subItem.title}</h5>
                                            {subItem.citation && <CitationButton citation={subItem.citation} />}
                                        </div>
                                        <p className="text-gray-600 text-base leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{subItem.details}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TableSection({ section }: { section: WorkflowSection }) {
    if (section.type !== 'table' || !section.content || !('headers' in section.content)) return null;
    const { headers, rows, citation } = section.content as TableData;
    return (
        <div className="mt-10">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-semibold text-gray-700 flex-1 pr-4">{section.title}</h3>
                {citation && <CitationButton citation={citation} />}
            </div>
            {section.description && <p className="text-gray-600 mt-1 mb-4 text-lg">{section.description}</p>}
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
                <table className="w-full text-base text-left text-gray-600">
                    <thead className="bg-gray-50 text-sm text-gray-700 uppercase">
                        <tr>{headers.map(h => <th key={h} className="px-6 py-4 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rIndex) => (
                            <tr key={rIndex} className="bg-white border-b hover:bg-gray-50">
                                {row.map((cell, cIndex) => <td key={cIndex} className="px-6 py-4 font-medium text-gray-800">{cell}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WorkflowDetail({ workflow, isTestView = false }: { workflow: WorkflowCategory; isTestView?: boolean }) {
    return (
        <>
          <h2 className="text-4xl font-bold text-gray-800">{workflow.title}</h2>
          <p className="mt-2 text-gray-600 text-lg">{workflow.description}</p>
          
          {workflow.sections.map((section, index) => {
            if (isTestView) {
                 return <TestSection key={index} section={section} />;
            }
            switch (section.type) {
              case 'flowchart':
              case 'steps':
                return <CarouselFlowSection key={index} section={section} />;
              case 'info': return <InfoSection key={index} section={section} />;
              case 'table': return <TableSection key={index} section={section} />;
              default: return null;
            }
          })}
        </>
    );
}

function DocumentsList() {
    return (
        <div>
            <h2 className="text-4xl font-bold text-gray-800">Source Documents</h2>
            <p className="mt-2 text-gray-600 text-lg">Official guidelines and technical codes from MCMC and Penang State used as the primary sources for this application.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(CITATIONS).map(doc => (
                     <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="block bg-white p-5 rounded-lg shadow-lg border border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center">
                            <DocumentIcon />
                            <div className="ml-4">
                                <h3 className="font-bold text-gray-800 text-lg">{doc.id.replace(/_/g, ' ')}</h3>
                                <p className="text-indigo-600 text-sm font-semibold mt-1">View PDF</p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('WORKFLOWS');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(WORKFLOW_DATA[0].id);
  
  const selectedWorkflow = WORKFLOW_DATA.find(w => w.id === selectedWorkflowId) || WORKFLOW_DATA[0];

  const renderContent = () => {
    switch(activeView) {
        case 'WORKFLOWS':
            return <WorkflowDetail workflow={selectedWorkflow} />;
        case 'TESTS':
            return <WorkflowDetail workflow={TESTS_DATA} isTestView={true} />;
        case 'DOCUMENTS':
            return <DocumentsList />;
        default:
            return <WorkflowDetail workflow={selectedWorkflow} />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar 
        workflows={WORKFLOW_DATA} 
        tests={TESTS_DATA}
        activeView={activeView}
        onActiveViewChange={setActiveView}
        selectedWorkflowId={selectedWorkflowId} 
        onSelectWorkflow={setSelectedWorkflowId} 
      />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-12">
        {renderContent()}
      </main>
    </div>
  );
}
