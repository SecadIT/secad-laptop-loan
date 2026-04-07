'use client';

import { useMemo, useEffect } from 'react';
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
import type { LoanRecord } from '@/lib/stores/loan-store';
import { useStaffStore } from '@/lib/stores/staff-store';

interface LoanFilterProps {
  loans: LoanRecord[];
  filterField: string;
  filterValue: string;
  onFilterFieldChange: (field: string) => void;
  onFilterValueChange: (value: string) => void;
  onClearFilter: () => void;
}

// Define filterable fields
const FILTER_FIELDS = [
  { value: 'status', label: 'Status' },
  { value: 'program', label: 'Program' },
  { value: 'officer', label: 'Development Officer' },
] as const;

export function LoanFilter({
  loans,
  filterField,
  filterValue,
  onFilterFieldChange,
  onFilterValueChange,
  onClearFilter,
}: LoanFilterProps) {
  const { staff, fetchStaff, getStaffByRole } = useStaffStore();

  // Fetch staff when component mounts
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Extract unique values for the selected filter field
  const filterOptions = useMemo(() => {
    if (!filterField || loans.length === 0) return [];

    const uniqueValues = new Set<string>();

    if (filterField === 'officer') {
      // Get development officers from staff store
      const developmentOfficers = getStaffByRole('DO');
      developmentOfficers.forEach((staffMember) => {
        uniqueValues.add(staffMember.User.DisplayName);
      });
    } else {
      // Extract from loans
      loans.forEach((loan) => {
        let value: string | undefined;

        switch (filterField) {
          case 'status':
            value = loan.IdentityandStatus?.Value;
            break;
          case 'program':
            value = loan.Program;
            break;
        }

        if (value) {
          uniqueValues.add(value);
        }
      });
    }

    return Array.from(uniqueValues).sort();
  }, [loans, filterField, staff, getStaffByRole]);

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
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Filter Field Selector */}
        <div className="space-y-2 w-full">
          <Label htmlFor="filterField" className="text-xs sm:text-sm">
            Filter By
          </Label>
          <Select value={filterField} onValueChange={handleFieldChange}>
            <SelectTrigger id="filterField" className="h-9 sm:h-10">
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
          <div className="space-y-2 w-full">
            <Label htmlFor="filterValue" className="text-xs sm:text-sm">
              {FILTER_FIELDS.find((f) => f.value === filterField)?.label || 'Value'}
            </Label>
            <Select value={filterValue} onValueChange={handleValueChange}>
              <SelectTrigger id="filterValue" className="h-9 sm:h-10">
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
      </div>

      {/* Clear Filter Button */}
      {hasActiveFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilter}
          className="w-full sm:w-auto self-start"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filter
        </Button>
      )}
    </div>
  );
}
