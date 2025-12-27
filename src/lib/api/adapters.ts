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

  const fields: JsonField[] = [];
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      
      fields.push({
        path: key,
        value,
        type: type as any,
        children: type === 'object' || type === 'array' ? parseJsonFields(value, key) : undefined,
      });
    }
  }

  return fields;
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

