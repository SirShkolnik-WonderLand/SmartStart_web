import 'styled-components';
import { DefaultTheme } from '@/styles/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends DefaultTheme {}
}
