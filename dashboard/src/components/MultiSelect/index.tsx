import styles from './MultiSelect.module.scss';

import type { SelectProps } from 'antd';

import { standarizeText } from "../../utils/textStandarization.ts";

import { Select, Typography } from 'antd';
import { FC } from "react";

const { Text } = Typography;


interface MultiSelectBaseProps extends Omit<
  SelectProps, 
  | 'mode'
  | 'onChange'
  | 'className'
  | 'optionRender'
> {
  label?: string | null;
  displaceItemRemover?: boolean;
  className?: string;
}

type MultiSelectSingleProps = MultiSelectBaseProps & {
  selectMode?: 'single';
  handleChange: (selected: null | string) => void;
}

type MultiSelectMultipleProps = MultiSelectBaseProps & {
  selectMode: 'multiple';
  handleChange: (selected: null | string[]) => void;
}

type MultiSelectProps = MultiSelectSingleProps | MultiSelectMultipleProps;


const MultiSelect: FC<MultiSelectProps> = ({
  label = null,
  handleChange,
  displaceItemRemover = false,
  className = '',
  selectMode = 'multiple',
  ...props
}) => {
  return (
    <label className={styles['multiselect-label']}>
      {label && <Text strong>{label}</Text>}
      <Select
        allowClear
        showSearch
        mode={selectMode === 'multiple' ? 'multiple' : undefined}
        optionFilterProp="label"
        onChange={(selected) => handleChange(selected as any)}
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 400 }}
        filterOption={(input, option) => {
          const label = typeof option?.label === 'string' ? option.label : '';
          return standarizeText(label).includes(standarizeText(input));
        }}
        optionRender={(option) => (
          <div>
            {option.label}
          </div>
        )}
        className={[
          styles['custom-multi-select'],
          displaceItemRemover && selectMode === 'single' ? styles['single-select-mode-shifted-item-remover'] : '',
          displaceItemRemover && selectMode === 'multiple' ? styles['multiple-select-mode-shifted-item-remover'] : '',
          className,
        ].join(' ')}
        {...props}
      />
    </label>
  );
};


export default MultiSelect;
