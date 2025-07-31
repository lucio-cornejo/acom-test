import { LoadingOutlined } from '@ant-design/icons';
import { FC } from 'react';


const LoadingIcon: FC = () => (
  <LoadingOutlined 
    style={{ fontSize: 40, display: 'block', padding: '20px', }} 
    spin
  />
)


export default LoadingIcon;
