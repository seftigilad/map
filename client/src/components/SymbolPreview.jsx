import { JEEP_SVG, markerIconUrl } from '../map/icons';

/** Small inline preview of an object symbol, used in the panels and the data table. */
export default function SymbolPreview({ symbol }) {
  if (symbol === 'jeep') {
    return <span className="symbol-preview symbol-preview--jeep" dangerouslySetInnerHTML={{ __html: JEEP_SVG }} />;
  }
  return <img className="symbol-preview symbol-preview--marker" src={markerIconUrl} alt="" />;
}
