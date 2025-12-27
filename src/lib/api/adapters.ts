import { JsonField } from '@/types/widget';
import { getValueByPath } from '@/lib/formatting';

export const parseJsonFields = (data: any, prefix: string = ''): JsonField[] => {
  const fields: JsonField[] = [];

  if (data === null || data === undefined) {
    return [{ path: prefix, value: null, type: 'null' }];
  }

  const type = Array.isArray(data) ? 'array' : typeof data;

  if (type === 'object' || type === 'array') {
    // Add the parent object/array itself
    fields.push({
      path: prefix || 'root',
      value: data,
      type: type as any,
      children: [],
    });

    // Recursively parse children
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const childPath = prefix ? `${prefix}.${key}` : key;
        const childValue = data[key];
        const childFields = parseJsonFields(childValue, childPath);
        fields.push(...childFields);
      }
    }
  } else {
    // Primitive value
    fields.push({
      path: prefix,
      value: data,
      type: type as any,
    });
  }

  return fields;
};

export const getTopLevelFields = (data: any): JsonField[] => {
  if (!data || typeof data !== 'object') {
    return [];
  }

  // Get all fields recursively
  const allFields = parseJsonFields(data);
  
  // Filter to show:
  // 1. All primitive values (strings, numbers, booleans)
  // 2. All arrays (for table view)
  // 3. Top-level objects (for nested exploration)
  const filteredFields = allFields.filter((field) => {
    // Always include primitives
    if (field.type === 'string' || field.type === 'number' || field.type === 'boolean' || field.type === 'null') {
      return true;
    }
    // Include arrays
    if (field.type === 'array') {
      return true;
    }
    // Include top-level objects (but not deeply nested intermediate objects)
    // This allows users to select object fields like "data.rates.USD"
    if (field.path === 'root' || field.path.split('.').length <= 2) {
      return true;
    }
    return false;
  });

  // Sort fields: primitives first, then by path
  return filteredFields.sort((a, b) => {
    const aIsPrimitive = ['string', 'number', 'boolean', 'null'].includes(a.type);
    const bIsPrimitive = ['string', 'number', 'boolean', 'null'].includes(b.type);
    
    if (aIsPrimitive && !bIsPrimitive) return -1;
    if (!aIsPrimitive && bIsPrimitive) return 1;
    
    return a.path.localeCompare(b.path);
  });
};

export const extractFieldValue = (data: any, fieldPath: string): any => {
  return getValueByPath(data, fieldPath);
};

export const flattenFields = (fields: JsonField[]): JsonField[] => {
  const flattened: JsonField[] = [];
  
  for (const field of fields) {
    if (field.type === 'object' || field.type === 'array') {
      flattened.push(field);
      if (field.children) {
        flattened.push(...flattenFields(field.children));
      }
    } else {
      flattened.push(field);
    }
  }
  
  return flattened;
};

export const filterArrayFields = (fields: JsonField[]): JsonField[] => {
  return fields.filter(field => field.type === 'array');
};

export const searchFields = (fields: JsonField[], query: string): JsonField[] => {
  if (!query.trim()) return fields;
  
  const lowerQuery = query.toLowerCase();
  return fields.filter(field => 
    field.path.toLowerCase().includes(lowerQuery) ||
    String(field.value).toLowerCase().includes(lowerQuery)
  );
};

