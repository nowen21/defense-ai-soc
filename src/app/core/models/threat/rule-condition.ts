export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in_list';
  value: string | number | string[];
}