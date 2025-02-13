import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CommonEntitySwagger } from './common.swagger';
import { StockSwagger } from './stock.swagger';

export const FinancialResponseExample = {
  _id: '507f1f77bcf86cd799439011',
  revenue: 100000000,
  revenue_growth: 0.15,
  operations_maintenance: 30000000,
  selling_general_admin: 20000000,
  depreciation_amortization: 5000000,
  goodwill_amortization: 1000000,
  bad_debts_provision: 500000,
  other_operating_expenses: 2000000,
  total_operating_expenses: 58500000,
  operating_income: 41500000,
  interest_expense: 2000000,
  interest_income: 500000,
  net_interest_expense: 1500000,
  equity_investments_income: 1000000,
  currency_exchange_gain: -500000,
  other_non_operating_income: 300000,
  ebt_excluding_unusual: 40800000,
  gain_on_sale_investments: 1000000,
  gain_on_sale_assets: 500000,
  asset_writedown: -2000000,
  insurance_settlements: 0,
  other_unusual_items: -500000,
  pretax_income: 39800000,
  income_tax_expense: 8000000,
  earnings_continuing_ops: 31800000,
  minority_interest: 1000000,
  net_income: 30800000,
  net_income_common: 30800000,
  net_income_growth: 0.12,
  shares_basic: 1000000000,
  shares_diluted: 1050000000,
  eps_basic: 30.8,
  eps_diluted: 29.33,
  eps_growth: 0.10,
  free_cash_flow: 25000000,
  free_cash_flow_per_share: 25.0,
  dividend_per_share: 0.88,
  profit_margin: 0.308,
  free_cash_flow_margin: 0.25,
  ebitda: 46500000,
  ebitda_margin: 0.465,
  depreciation_amortization_ebitda: 5000000,
  ebit: 41500000,
  ebit_margin: 0.415,
  effective_tax_rate: 0.201,
  report_date: '2024-12-31T00:00:00.000Z',
  fiscal_quarter: 4,
  fiscal_year: 2024,
  stocks: {
    _id: '507f1f77bcf86cd799439012',
    symbol: 'AAPL',
    company_name: 'Apple Inc.'
  },
  version: 1,
  createdAt: '2024-02-09T09:00:00Z',
  updatedAt: '2024-02-09T10:00:00Z'
};

export class FinancialSwagger extends CommonEntitySwagger {
  @ApiProperty({
    description: 'Total revenue for the period',
    example: 100000000,
    required: false
  })
  revenue?: number;

  @ApiProperty({
    description: 'Year-over-year revenue growth rate',
    example: 0.15,
    required: false
  })
  revenue_growth?: number;

  @ApiProperty({
    description: 'Operations and maintenance expenses',
    example: 30000000,
    required: false
  })
  operations_maintenance?: number;

  @ApiProperty({
    description: 'Selling, general, and administrative expenses',
    example: 20000000,
    required: false
  })
  selling_general_admin?: number;

  @ApiProperty({
    description: 'Depreciation and amortization expenses',
    example: 5000000,
    required: false
  })
  depreciation_amortization?: number;

  @ApiProperty({
    description: 'Goodwill amortization',
    example: 1000000,
    required: false
  })
  goodwill_amortization?: number;

  @ApiProperty({
    description: 'Provision for bad debts',
    example: 500000,
    required: false
  })
  bad_debts_provision?: number;

  @ApiProperty({
    description: 'Other operating expenses',
    example: 2000000,
    required: false
  })
  other_operating_expenses?: number;

  @ApiProperty({
    description: 'Sum of all operating expenses',
    example: 58500000,
    required: false
  })
  total_operating_expenses?: number;

  @ApiProperty({
    description: 'Operating income (EBIT)',
    example: 41500000,
    required: false
  })
  operating_income?: number;

  @ApiProperty({
    description: 'Interest expense',
    example: 2000000,
    required: false
  })
  interest_expense?: number;

  @ApiProperty({
    description: 'Interest income',
    example: 500000,
    required: false
  })
  interest_income?: number;

  @ApiProperty({
    description: 'Net interest expense',
    example: 1500000,
    required: false
  })
  net_interest_expense?: number;

  @ApiProperty({
    description: 'Income from equity investments',
    example: 1000000,
    required: false
  })
  equity_investments_income?: number;

  @ApiProperty({
    description: 'Currency exchange gains or losses',
    example: -500000,
    required: false
  })
  currency_exchange_gain?: number;

  @ApiProperty({
    description: 'Other non-operating income',
    example: 300000,
    required: false
  })
  other_non_operating_income?: number;

  @ApiProperty({
    description: 'Earnings before taxes excluding unusual items',
    example: 40800000,
    required: false
  })
  ebt_excluding_unusual?: number;

  @ApiProperty({
    description: 'Gains from sale of investments',
    example: 1000000,
    required: false
  })
  gain_on_sale_investments?: number;

  @ApiProperty({
    description: 'Gains from sale of assets',
    example: 500000,
    required: false
  })
  gain_on_sale_assets?: number;

  @ApiProperty({
    description: 'Asset writedown charges',
    example: -2000000,
    required: false
  })
  asset_writedown?: number;

  @ApiProperty({
    description: 'Insurance settlement income',
    example: 0,
    required: false
  })
  insurance_settlements?: number;

  @ApiProperty({
    description: 'Other unusual items',
    example: -500000,
    required: false
  })
  other_unusual_items?: number;

  @ApiProperty({
    description: 'Income before tax',
    example: 39800000,
    required: false
  })
  pretax_income?: number;

  @ApiProperty({
    description: 'Income tax expense',
    example: 8000000,
    required: false
  })
  income_tax_expense?: number;

  @ApiProperty({
    description: 'Earnings from continuing operations',
    example: 31800000,
    required: false
  })
  earnings_continuing_ops?: number;

  @ApiProperty({
    description: 'Minority interest in earnings',
    example: 1000000,
    required: false
  })
  minority_interest?: number;

  @ApiProperty({
    description: 'Net income',
    example: 30800000,
    required: false
  })
  net_income?: number;

  @ApiProperty({
    description: 'Net income available to common shareholders',
    example: 30800000,
    required: false
  })
  net_income_common?: number;

  @ApiProperty({
    description: 'Year-over-year net income growth rate',
    example: 0.12,
    required: false
  })
  net_income_growth?: number;

  @ApiProperty({
    description: 'Basic shares outstanding',
    example: 1000000000,
    required: false
  })
  shares_basic?: number;

  @ApiProperty({
    description: 'Diluted shares outstanding',
    example: 1050000000,
    required: false
  })
  shares_diluted?: number;

  @ApiProperty({
    description: 'Basic earnings per share',
    example: 30.8,
    required: false
  })
  eps_basic?: number;

  @ApiProperty({
    description: 'Diluted earnings per share',
    example: 29.33,
    required: false
  })
  eps_diluted?: number;

  @ApiProperty({
    description: 'Year-over-year EPS growth rate',
    example: 0.10,
    required: false
  })
  eps_growth?: number;

  @ApiProperty({
    description: 'Free cash flow',
    example: 25000000,
    required: false
  })
  free_cash_flow?: number;

  @ApiProperty({
    description: 'Free cash flow per share',
    example: 25.0,
    required: false
  })
  free_cash_flow_per_share?: number;

  @ApiProperty({
    description: 'Dividend per share',
    example: 0.88,
    required: false
  })
  dividend_per_share?: number;

  @ApiProperty({
    description: 'Profit margin (Net Income/Revenue)',
    example: 0.308,
    required: false
  })
  profit_margin?: number;

  @ApiProperty({
    description: 'Free cash flow margin',
    example: 0.25,
    required: false
  })
  free_cash_flow_margin?: number;

  @ApiProperty({
    description: 'Earnings before interest, taxes, depreciation, and amortization',
    example: 46500000,
    required: false
  })
  ebitda?: number;

  @ApiProperty({
    description: 'EBITDA margin',
    example: 0.465,
    required: false
  })
  ebitda_margin?: number;

  @ApiProperty({
    description: 'Depreciation and amortization used in EBITDA calculation',
    example: 5000000,
    required: false
  })
  depreciation_amortization_ebitda?: number;

  @ApiProperty({
    description: 'Earnings before interest and taxes',
    example: 41500000,
    required: false
  })
  ebit?: number;

  @ApiProperty({
    description: 'EBIT margin',
    example: 0.415,
    required: false
  })
  ebit_margin?: number;

  @ApiProperty({
    description: 'Effective tax rate',
    example: 0.201,
    required: false
  })
  effective_tax_rate?: number;

  @ApiProperty({
    description: 'Financial report date',
    example: '2024-12-31',
    required: true
  })
  report_date: Date;

  @ApiProperty({
    description: 'Fiscal quarter (1-4)',
    example: 4,
    minimum: 1,
    maximum: 4,
    required: true
  })
  fiscal_quarter: number;

  @ApiProperty({
    description: 'Fiscal year',
    example: 2024,
    required: true
  })
  fiscal_year: number;

  @ApiProperty({
    description: 'Associated stock',
    type: () => StockSwagger,
    required: true,
    example: {
      _id: '507f1f77bcf86cd799439012',
      symbol: 'AAPL',
      company_name: 'Apple Inc.'
    }
  })
  stocks: StockSwagger;

  static example = FinancialResponseExample;
}
