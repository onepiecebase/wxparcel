import { LoaderOption } from 'wxparcel-core'

export interface EnvifyOptions extends LoaderOption {
  options: {
    env: any;
  };
}
