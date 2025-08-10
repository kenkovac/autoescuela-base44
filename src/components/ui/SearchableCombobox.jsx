import React, { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchableCombobox({
  apiFetchFunction,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  displayRender,
  displayField = 'nombre',
  valueField = 'id'
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const getDisplayValue = useCallback((item) => {
    if (!item) return '';
    if (displayRender && typeof displayRender === 'function') {
      return displayRender(item);
    }
    return item[displayField] || '';
  }, [displayRender, displayField]);

  const fetchData = useCallback(async (search = '') => {
    if (!apiFetchFunction || typeof apiFetchFunction !== 'function') {
      console.error("apiFetchFunction must be a valid function");
      return;
    }
    
    setIsLoading(true);
    try {
      const params = { 
        search: search || '', 
        limit: 20,
        page: 1
      };
      
      const response = await apiFetchFunction(params);
      
      if (response && typeof response === 'object') {
        const data = Array.isArray(response) ? response : (response.data || []);
        setItems(data);
      } else {
        console.warn("Unexpected response format:", response);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching data for combobox:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetchFunction]);

  // Initial load when component mounts
  useEffect(() => {
    fetchData('');
  }, []);

  // Search when query changes
  useEffect(() => {
    if (debouncedSearchQuery !== null) {
      fetchData(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, fetchData]);

  // Update selected item when value or items change
  useEffect(() => {
    if (value && items.length > 0) {
      const foundItem = items.find(item => 
        item && item[valueField] && item[valueField].toString() === value.toString()
      );
      
      if (foundItem) {
        setSelectedItem(foundItem);
      } else if (!selectedItem || selectedItem[valueField]?.toString() !== value.toString()) {
        // Item not found in current list, but we have a value - keep looking
        fetchInitialItem();
      }
    } else if (!value) {
      setSelectedItem(null);
    }
  }, [value, items, valueField]);

  const fetchInitialItem = useCallback(async () => {
    if (!value || !apiFetchFunction || typeof apiFetchFunction !== 'function') return;
    
    try {
      // Try to fetch more items to find the selected one
      const response = await apiFetchFunction({ limit: 100, page: 1 });
      const allItems = Array.isArray(response) ? response : (response.data || []);
      const foundItem = allItems.find(item => 
        item && item[valueField] && item[valueField].toString() === value.toString()
      );
      
      if (foundItem) {
        setSelectedItem(foundItem);
        // Add it to items if not already there
        setItems(prev => {
          const exists = prev.some(item => 
            item && item[valueField] && item[valueField].toString() === foundItem[valueField].toString()
          );
          return exists ? prev : [foundItem, ...prev];
        });
      }
    } catch (error) {
      console.error("Error fetching initial item:", error);
    }
  }, [value, apiFetchFunction, valueField]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between neo-input h-12 font-bold"
        >
          <span className="truncate text-left">
            {selectedItem ? getDisplayValue(selectedItem) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 neo-card border-4 border-border">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 flex justify-center items-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}
            {!isLoading && (
              <>
                {items.length === 0 ? (
                  <CommandEmpty className="py-6 text-center text-sm">
                    {emptyMessage}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {items.map((item, index) => {
                      if (!item || !item[valueField]) return null;
                      
                      return (
                        <CommandItem
                          key={`${item[valueField]}-${index}`}
                          value={getDisplayValue(item)}
                          onSelect={() => {
                            onChange(item[valueField].toString());
                            setOpen(false);
                          }}
                          className="font-bold cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              value?.toString() === item[valueField]?.toString() 
                                ? "opacity-100" 
                                : "opacity-0"
                            }`}
                          />
                          <span className="truncate">
                            {getDisplayValue(item)}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}