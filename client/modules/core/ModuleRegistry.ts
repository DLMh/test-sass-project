import { ModuleComponent } from '../core/BaseModule';
import { ModuleId } from '../../data/ai-employees';
import ChatModule from '../ChatModule';

const modulesComponents: Record<ModuleId, ModuleComponent> = {
  [ModuleId.CHAT]: ChatModule
};

export const getModule = (moduleId: string): ModuleComponent | undefined => {
  return modulesComponents[moduleId as ModuleId];
};

export const registerModule = (moduleComponent: ModuleComponent) => {
  modulesComponents[moduleComponent.moduleId as ModuleId] = moduleComponent;
}; 