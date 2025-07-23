import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import TopBar from '../shared/Topbar';
import SidebarWrapper from '../shared/Sidebar';
import Footer from '../shared/Footer';
import Tesseract from 'tesseract.js';

const VEHICLE_CAPACITY = {
  sixWheels: 15,
  twelveWheels: 27,
  trailer: 33,
  lowbed: 29,
};

const formatVehicleTypeLabel = (type) => type.replace(/([A-Z])/g, ' $1').trim();

const CalculatorPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [weights, setWeights] = useState([{ id: 1, weight: '' }]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [customRates, setCustomRates] = useState({
    sixWheels: { solid: '', min: '18000', max: '22000' },
    twelveWheels: { solid: '', min: '30000', max: '37000' },
    trailer: { solid: '', min: '35000', max: '42000' },
    lowbed: { solid: '', min: '30000', max: '38000' },
  });

  const [weightsError, setWeightsError] = useState('');
  const [inputsAreValid, setInputsAreValid] = useState(false);

  const parseNumber = (val) => (val === '' ? 0 : Number(val));
  const totalWeight = weights.reduce((acc, w) => acc + parseNumber(w.weight), 0);

  useEffect(() => {
    if (weights.length === 0) {
      setWeightsError('At least one weight is required');
    } else if (
      weights.some((w) => w.weight === '' || isNaN(w.weight) || Number(w.weight) <= 0)
    ) {
      setWeightsError('All weights must be positive numbers');
    } else {
      setWeightsError('');
    }

    setInputsAreValid(
      weights.length > 0 &&
      !weights.some((w) => w.weight === '' || isNaN(w.weight) || Number(w.weight) <= 0)
    );
  }, [weights]);

  const binPack = (weightsArr, capacity) => {
    const sorted = [...weightsArr].sort((a, b) => b - a);
    const bins = [];
    for (const w of sorted) {
      let placed = false;
      for (let i = 0; i < bins.length; i++) {
        if (bins[i] + w <= capacity) {
          bins[i] += w;
          placed = true;
          break;
        }
      }
      if (!placed) {
        bins.push(w);
      }
    }
    return bins.length;
  };

  const calculateVehicleCost = (vehicleType) => {
    if (!inputsAreValid) return null;

    const capacity = VEHICLE_CAPACITY[vehicleType];
    const indivisibleWeights = weights.map(w => parseNumber(w.weight));

    if (totalWeight <= 0) return null;
    if (indivisibleWeights.some(wt => wt > capacity)) return null;

    const rates = customRates[vehicleType];
    const baseRate = rates.solid
      ? parseNumber(rates.solid)
      : parseNumber(rates.min || 0);

    if (baseRate <= 0) return null;

    const vehicleCount = binPack(indivisibleWeights, capacity);
    const totalCost = ((baseRate * vehicleCount));
    const costPerTon = totalCost / totalWeight;
    
    
    const commissionPerVehicle = 2000;
    const totalCostWithCommission = (baseRate + commissionPerVehicle) * vehicleCount;
    const costPerTonWithCommission = totalCostWithCommission / totalWeight;

    let efficiency = 'low';
    if (costPerTon < 1500) efficiency = 'high';
    else if (costPerTon < 2500) efficiency = 'medium';

    const includedItems = weights.filter(w => parseNumber(w.weight) <= capacity);

    return { vehicleType, vehicleCount, totalCost, costPerTon, efficiency, includedItems, baseRate, totalCostWithCommission,costPerTonWithCommission };
  };

  const estimates = ['sixWheels', 'twelveWheels', 'trailer', 'lowbed']
    .map(calculateVehicleCost)
    .filter(Boolean);

  const recommended = estimates.length
    ? estimates.reduce((prev, curr) =>
        curr.costPerTon < prev.costPerTon ? curr : prev)
    : null;

  const addWeight = () => setWeights((prev) => [...prev, { id: Date.now(), weight: '' }]);
  const updateWeight = (id, value) => {
    setWeights((prev) => prev.map((w) => (w.id === id ? { ...w, weight: value } : w)));
  };
  const removeWeight = (id) => setWeights((prev) => prev.filter((w) => w.id !== id));

  const updateCustomRate = (vehicleType, rateType, value) => {
    setCustomRates(prev => {
      const updated = { ...prev[vehicleType], [rateType]: value };
      if (rateType === 'solid' && value !== '') {
        updated.min = '';
        updated.max = '';
      } else if ((rateType === 'min' || rateType === 'max') && value !== '') {
        updated.solid = '';
      }
      return { ...prev, [vehicleType]: updated };
    });
  };

  const triggerImageUpload = () => fileInputRef.current?.click();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const { data } = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });
        const weightMatches = [...data.text.matchAll(/(\d+(\.\d+)?)\s*(ton|tons|t)?/gi)]
          .map(m => parseFloat(m[1]))
          .filter(w => w > 0 && w < 100);
        if (weightMatches.length) {
          setWeights((prev) => [
            ...prev,
            ...weightMatches.map((w) => ({ id: Date.now() + Math.random(), weight: w })),
          ]);
        } else {
          alert('No valid weights found in image');
        }
      } catch (err) {
        console.error('OCR Error:', err);
        alert('Failed to extract data from image');
      }
      setIsProcessingImage(false);
    }
  };

  return (
    <div className={`h-screen flex overflow-hidden ${isDark ? 'bg-mbts-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
      <SidebarWrapper collapsed={sidebarCollapsed}/>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="sticky top-0 z-50">
            <TopBar
              onToggleSidebar={() => setSidebarCollapsed((p) => !p)}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>

          {/* Main Content Area */}
          <div className='h-full w-full relative overflow-y-auto mb-10'> 
            <div className='flex-1 flex flex-col h-full overflow-y-auto'>
              <div className="flex justify-center items-start  overflow-auto w-full">
                <div
                  className={`w-full max-w-6xl shadow-lg rounded-l p-8 transition-all duration-300
                  ${
                    isDark
                      ? 'bg-[#1c2a3a] border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }
                `}
                >
                  {/* Weight Entry Card */}
                  <div className="border rounded p-4 mb-6">
                    <h3 className="font-bold mb-4">Weight Entry</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">

                      <div>
                        <label className="block font-medium mb-1">
                          Total Weight: {totalWeight.toFixed(1)} tons
                        </label>
                        <div className="text-sm text-muted-foreground">
                          {weights.length} item{weights.length !== 1 ? 's' : ''}
                        </div>
                        {weightsError && (
                          <p className="text-red-500 text-sm mt-1">{weightsError}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                      <label className="font-medium">Individual Weights (tons)</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={triggerImageUpload}
                          disabled={isProcessingImage}
                          className={`px-3 py-1 rounded bg-mbts-orange text-white hover:bg-mbts-orangeHover${
                            isProcessingImage ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="Upload weights from image"
                        >
                          {isProcessingImage ? 'Processing...' : 'Upload Image'}
                        </button>

                        <button
                          type="button"
                          onClick={addWeight}
                          className="px-3 py-1 rounded border"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {weights.map((entry, index) => (
                      <div key={entry.id} className="flex items-center gap-2 mb-2">
                        <label className="w-16 text-sm">Item {index + 1}:</label>
                        <input
                          type="number"
                          value={entry.weight}
                          onChange={(e) => updateWeight(entry.id, e.target.value)}
                          min="0"
                          step="0.1"
                          className={`flex-1 rounded border px-3 py-1 text-sm outline-none focus:ring-2 transition ${
                            isDark
                              ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                              : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                          }`}
                        />
                        {weights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWeight(entry.id)}
                            className="px-2 py-1 rounded border"
                            aria-label={`Remove item ${index + 1}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Custom Vehicle Rental Rates */}
                  <div className="border rounded p-4 mb-6">
                    <h3 className="font-bold mb-4">Custom Vehicle Rental Rates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set custom daily rental rates for each vehicle type. Use solid
                      rate for fixed pricing, or min/max for range-based pricing.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['sixWheels', 'twelveWheels', 'trailer', 'lowbed'].map(
                        (vehicleType) => {
                          const labelMap = {
                            sixWheels: '6 Wheels (14-15 ton capacity)',
                            twelveWheels: '12 Wheels (25-27 ton capacity)',
                            trailer: 'Trailer (30-33 ton capacity)',
                            lowbed: 'Lowbed (26-29 ton capacity)',
                          };
                          const rates = customRates[vehicleType];
                          return (
                            <div key={vehicleType} className="space-y-3">
                              <label className="text-base font-medium">
                                {labelMap[vehicleType]}
                              </label>
                              <div className="space-y-2">
                                <div>
                                  <label
                                    htmlFor={`${vehicleType}Solid`}
                                    className="text-sm"
                                  >
                                    Solid Rate (৳)
                                  </label>
                                  <input
                                    id={`${vehicleType}Solid`}
                                    type="number"
                                    value={rates.solid}
                                    onChange={(e) =>
                                      updateCustomRate(
                                        vehicleType,
                                        'solid',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter fixed rate"
                                    className={`rounded border px-4 py-2 w-full text-sm outline-none focus:ring-2 transition ${
                                      isDark
                                        ? 'bg-mbts-dark border-gray-600 text-gray-800 focus:ring-mbts-orange'
                                        : 'bg-gray-50 border-gray-300 text-gray-800'
                                    }`}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label
                                      htmlFor={`${vehicleType}Min`}
                                      className="text-sm"
                                    >
                                      Min Rate (৳)
                                    </label>
                                    <input
                                      id={`${vehicleType}Min`}
                                      type="number"
                                      value={rates.min}
                                      onChange={(e) =>
                                        updateCustomRate(
                                          vehicleType,
                                          'min',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Min rate"
                                      disabled={!!rates.solid}
                                      className={`rounded border px-4 py-2 w-full text-sm outline-none focus:ring-2 transition ${
                                        isDark
                                          ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor={`${vehicleType}Max`}
                                      className="text-sm"
                                    >
                                      Max Rate (৳)
                                    </label>
                                    <input
                                      id={`${vehicleType}Max`}
                                      type="number"
                                      value={rates.max}
                                      onChange={(e) =>
                                        updateCustomRate(
                                          vehicleType,
                                          'max',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Max rate"
                                      disabled={!!rates.solid}
                                      className={`rounded border px-4 py-2 w-full text-sm outline-none focus:ring-2 transition ${
                                        isDark
                                          ? 'bg-mbts-dark border-gray-600 text-white focus:ring-mbts-orange'
                                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-400'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className='mt-4 pt-4'>
                        <h3 className="font-bold mb-4 pt-4">Commission amount </h3>
                    </div>
                  </div>

                  {/* Recommended Solution */}
                  {inputsAreValid && recommended && (
                    <div
                      className={`border rounded p-4 mb-6 transition ${
                        isDark
                          ? 'bg-[#223344] border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      <h3 className="font-bold mb-4 p-3 text-3xl text-mbts-orange"> ⭐ ⭐ ⭐ Recommended Solution</h3>

                      <div className="bg-gradient-to-rp-6 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
                          <div className="p-2">
                            <div className="text-2xl font-bold text-primary capitalize text-mbts-orange">
                              {formatVehicleTypeLabel(recommended.vehicleType)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Best vehicle type
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{recommended.vehicleCount}</div>
                              <div className="text-sm text-muted-foreground">
                                Vehicle{recommended.vehicleCount !== 1 ? 's' : ''} needed
                              </div>
                            </div>
                          <div>
                            <div className="text-2xl font-bold text-secondary">
                              ৳{recommended.totalCost.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Total cost</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              ৳{recommended.costPerTon.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Cost per ton</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3">
                          <div>
                            <div className="text-2xl font-thin text-opacity-5 capitalize">
                              With Commission And Cost Per Vehicle
                            </div>
                          </div>  
                          <div>
                            <div className="text-xl  font-thin text-secondary">
                              ৳{recommended.totalCostWithCommission.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Total cost with commission</div>
                          </div>
                          <div>
                            <div className="text-xl  font-thin">
                              ৳{recommended.costPerTonWithCommission.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Cost per ton</div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 p-4">
                          <span
                            className={`px-3 py-1 rounded ${
                              recommended.efficiency === 'high'
                                ? 'bg-green-500 text-white'
                                : recommended.efficiency === 'medium'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-red-400 text-white'
                            }`}
                          >
                            {recommended.efficiency === 'high'
                              ? 'High Efficiency'
                              : recommended.efficiency === 'medium'
                              ? 'Good Efficiency'
                              : 'Low Efficiency'}
                          </span>
                        </div>

                        {/* Included Products List */}
                        <div className="mt-6">
                          <h5 className="font-semibold mb-2 p-3">
                            Total Items Included :
                          </h5>
                          <ul className={`list-disc p-5 pl-6 text-sm  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>       
                            {recommended.includedItems.map((item, idx) => (
                              <li key={idx} className="mb-1 p-2">
                                Item {idx + 1}: {item.weight} ton{item.weight !== 1 ? 's' : ''}
                              </li>
                            ))}
                          </ul>
                          <div className='flex mt-4 p-5'>
                            <div className="text-xl font-bold">Total Weight :
                              <span className='text-sm text-muted-foreground'> {totalWeight.toFixed(1)} tons </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Vehicle Estimates */}
                    {inputsAreValid && estimates.length > 0 && (
                      <div
                        className={`border rounded p-4 transition ${
                          isDark
                            ? 'bg-[#223344] border-gray-600 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <h3 className="font-bold mb-4">All Vehicle Options</h3>
                        <div className="space-y-3">
                          {estimates.map((estimate) => (
                            <div
                              key={estimate.vehicleType}
                              className={`p-4 rounded-lg border transition ${
                                estimate === recommended
                                  ? isDark
                                    ? 'border-blue-400 bg-blue-900/30'
                                    : 'border-blue-600 bg-blue-100'
                                  : isDark
                                  ? 'border-gray-600 bg-[#1a2735]'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >

                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                <div>
                                  <div className="font-semibold capitalize">
                                    {formatVehicleTypeLabel(estimate.vehicleType)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Capacity of Vehicle: {VEHICLE_CAPACITY[estimate.vehicleType]} tons
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Price Per Vehicle: ৳{estimate.baseRate.toLocaleString()}                
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">{estimate.vehicleCount}</div>
                                  <div className="text-xs text-muted-foreground">vehicles</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">
                                    ৳{estimate.totalCost.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">total</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">
                                    ৳{estimate.costPerTon.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">per ton</div>
                                </div>
                                <div className="text-center">
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      estimate.efficiency === 'high'
                                        ? 'bg-green-500 text-white'
                                        : estimate.efficiency === 'medium'
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-gray-300 text-black'
                                    }`}
                                  >
                                    {estimate.efficiency}
                                  </span>
                                </div>
                              </div>

                              {/* Included Products List for each vehicle option */}
                              <div className="mt-4">
                                <h4 className="font-semibold mb-1">
                                  Included Products (≤ {VEHICLE_CAPACITY[estimate.vehicleType]} tons):
                                </h4>
                                {estimate.includedItems.length > 0 ? (
                                  <ul className={`list-disc pl-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {estimate.includedItems.map((item, idx) => (
                                      <li key={idx}>
                                        Item {idx + 1}: {item.weight} ton{item.weight !== 1 ? 's' : ''}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm italic text-gray-500">No products fit this vehicle capacity.</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
    </div>
  );
};

export default CalculatorPage;
