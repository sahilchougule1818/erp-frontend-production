import { useState, useMemo } from 'react';

/**
 * Reusable hook for managing search/filter functionality across modules
 * Provides state management for two or three-field filtering with reset capability
 */
export function useSearchFilter<T>({
  sourceData,
  field1Accessor,
  field2Accessor,
  field3Accessor,
}: {
  sourceData: T[];
  field1Accessor: (item: T) => string;
  field2Accessor: (item: T) => string;
  field3Accessor?: (item: T) => string;
}) {
  const [selectedField1, setSelectedField1] = useState('');
  const [selectedField2, setSelectedField2] = useState('');
  const [selectedField3, setSelectedField3] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  // Get unique options for field1
  const field1Options = useMemo(() => {
    const uniqueValues = Array.from(new Set(sourceData.map(field1Accessor)));
    return uniqueValues
      .filter(val => val) // Remove empty values
      .sort()
      .map(val => ({ value: val, label: val }));
  }, [sourceData, field1Accessor]);

  // Get unique options for field2 (filtered by field1 if selected)
  const field2Options = useMemo(() => {
    const filtered = selectedField1
      ? sourceData.filter(item => field1Accessor(item) === selectedField1)
      : sourceData;
    const uniqueValues = Array.from(new Set(filtered.map(field2Accessor)));
    return uniqueValues
      .filter(val => val) // Remove empty values
      .sort()
      .map(val => ({ value: val, label: val }));
  }, [sourceData, selectedField1, field1Accessor, field2Accessor]);

  // Get unique options for field3 (filtered by field1 and field2 if selected)
  const field3Options = useMemo(() => {
    if (!field3Accessor) return [];
    
    let filtered = sourceData;
    if (selectedField1) {
      filtered = filtered.filter(item => field1Accessor(item) === selectedField1);
    }
    if (selectedField2) {
      filtered = filtered.filter(item => field2Accessor(item) === selectedField2);
    }
    
    const uniqueValues = Array.from(new Set(filtered.map(field3Accessor)));
    return uniqueValues
      .filter(val => val) // Remove empty values
      .sort()
      .map(val => ({ value: val, label: val }));
  }, [sourceData, selectedField1, selectedField2, field1Accessor, field2Accessor, field3Accessor]);

  // Filtered data based on search criteria
  const filteredData = useMemo(() => {
    if (!isFiltered) return sourceData;
    
    return sourceData.filter(item => {
      const matchField1 = !selectedField1 || field1Accessor(item) === selectedField1;
      const matchField2 = !selectedField2 || field2Accessor(item) === selectedField2;
      const matchField3 = !field3Accessor || !selectedField3 || field3Accessor(item) === selectedField3;
      return matchField1 && matchField2 && matchField3;
    });
  }, [sourceData, selectedField1, selectedField2, selectedField3, isFiltered, field1Accessor, field2Accessor, field3Accessor]);

  // Visible data (filtered or full dataset)
  const visibleData = isFiltered ? filteredData : sourceData;

  const handleSearch = () => {
    if (selectedField1 || selectedField2 || selectedField3) {
      setIsFiltered(true);
    }
  };

  const handleReset = () => {
    setSelectedField1('');
    setSelectedField2('');
    setSelectedField3('');
    setIsFiltered(false);
  };

  const handleField1Change = (value: string) => {
    setSelectedField1(value);
    // Always reset field2 and field3 when field1 changes to ensure cascading
    setSelectedField2('');
    setSelectedField3('');
  };

  const handleField2Change = (value: string) => {
    setSelectedField2(value);
    // Always reset field3 when field2 changes to ensure cascading
    setSelectedField3('');
  };

  return {
    selectedField1,
    selectedField2,
    selectedField3,
    field1Options,
    field2Options,
    field3Options,
    visibleData,
    isFiltered,
    handleSearch,
    handleReset,
    handleField1Change,
    handleField2Change,
    handleField3Change: setSelectedField3,
  };
}
