
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  absoluteMin: number;
  absoluteMax: number;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  absoluteMin,
  absoluteMax
}) => {
  const handleSliderChange = (values: number[]) => {
    if (values[0] !== minPrice) {
      onMinPriceChange(values[0]);
    }
    if (values[1] !== maxPrice) {
      onMaxPriceChange(values[1]);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= absoluteMin && value <= maxPrice) {
      onMinPriceChange(value);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minPrice && value <= absoluteMax) {
      onMaxPriceChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Price Range</h3>
      <Slider
        defaultValue={[minPrice, maxPrice]}
        value={[minPrice, maxPrice]}
        min={absoluteMin}
        max={absoluteMax}
        step={10}
        onValueChange={handleSliderChange}
        className="my-6"
      />
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <label htmlFor="min-price" className="text-sm text-gray-500">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="min-price"
              type="number"
              value={minPrice}
              onChange={handleMinInputChange}
              min={absoluteMin}
              max={maxPrice}
              className="pl-7"
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="max-price" className="text-sm text-gray-500">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="max-price"
              type="number"
              value={maxPrice}
              onChange={handleMaxInputChange}
              min={minPrice}
              max={absoluteMax}
              className="pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
