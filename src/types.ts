export interface TemplateFile {
  path: string;
  content: string;
}

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  defaultChecked: boolean;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  files: TemplateFile[];
  appConfig?: Record<string, unknown>;
  babelPlugins?: string[];
  layoutImports?: string[];
  layoutProviders?: string[];
}

export interface ProjectConfig {
  projectName: string;
  selectedModules: string[];
  cliVersion: string;
}
