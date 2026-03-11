'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { AssetRecord } from '@/lib/stores/asset-store';

interface AssetFilterProps {
  assets: AssetRecord[];
  filterField: string;
  filterValue: string;
  onFilterFieldChange: (field: string) => void;
  onFilterValueChange: (value: string) => void;
  onClearFilter: () => void;
}

// Define filterable fields
const FILTER_FIELDS = [
  { value: 'status', label: 'Status' },
  { value: 'assetType', label: 'Asset Type' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'color', label: 'Color' },
  { value: 'condition', label: 'Condition' },
] as const;

export function AssetFilter({
  assets,
  filterField,
  filterValue,
  onFilterFieldChange,
  onFilterValueChange,
  onClearFilter,
}: AssetFilterProps) {
  // Extract unique values for the selected filter field
  const filterOptions = useMemo(() => {
    if (!filterField || assets.length === 0) return [];

    const uniqueValues = new Set<string>();

    assets.forEach((asset) => {
      let value: string | undefined;

      switch (filterField) {
        case 'status':
          value = asset.Status?.Value;
          break;
        case 'assetType':
          value = asset.AssetType?.Value;
          break;
        case 'manufacturer':
          value = asset.Manufacturer?.Value;
          break;
        case 'color':
          value = asset.Color?.Value;
          break;
        case 'condition':
          value = asset.ConditionNotes;
          break;
      }

      if (value) {
        uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues).sort();
  }, [assets, filterField]);

  const handleFieldChange = (field: string | null) => {
    if (field) {
      onFilterFieldChange(field);
      onFilterValueChange(''); // Reset value when field changes
    }
  };

  const handleValueChange = (value: string | null) => {
    if (value) {
      onFilterValueChange(value);
    }
  };

  const hasActiveFilter = filterField && filterValue;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      {/* Filter Field Selector */}
      <div className="space-y-2 flex-1 min-w-[200px]">
        <Label htmlFor="filterField">Filter By</Label>
        <Select value={filterField} onValueChange={handleFieldChange}>
          <SelectTrigger id="filterField">
            <SelectValue placeholder="Select field to filter" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_FIELDS.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Value Selector - Only shown when field is selected */}
      {filterField && (
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label htmlFor="filterValue">
            {FILTER_FIELDS.find((f) => f.value === filterField)?.label || 'Value'}
          </Label>
          <Select value={filterValue} onValueChange={handleValueChange}>
            <SelectTrigger id="filterValue">
              <SelectValue
                placeholder={`Select ${FILTER_FIELDS.find((f) => f.value === filterField)?.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.length === 0 ? (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              ) : (
                filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Clear Filter Button */}
      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearFilter}
          className="shrink-0"
          title="Clear filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
