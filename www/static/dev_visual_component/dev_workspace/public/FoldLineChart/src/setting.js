/**
 * @description 注册组件的设置面板
 */
import {
  registerComponentOptionsSetting,
  registerComponentDataSetting
} from 'datavi-editor/adapter';

import OptionsSetting from './settings/options';
import DataSetting from './settings/data'

registerComponentOptionsSetting('FoldLineChart', OptionsSetting);
registerComponentDataSetting('FoldLineChart', DataSetting);